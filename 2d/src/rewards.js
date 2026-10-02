// Identité de l'appareil, lien de défi, inscription newsletter. Aucun code promo ici : les codes ne
// viennent que du serveur (claim), voir rewards-supabase.js et CONTRAT-SERVEUR.md.
import { load, save } from '../../src/core/storage.js';

// device_id : UUID v4 gardé en localStorage (protégé), en mémoire si le stockage est refusé
let memId = null;
export function deviceId() {
  let id = load('device', null);
  if (typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id)) return id;
  id = memId || uuid4(); memId = id; save('device', id); return id;
}
function uuid4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  const b = new Uint8Array(16); (crypto || window.msCrypto).getRandomValues(b); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join(''); return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// Lien de défi : ?play=1#rs=<base64url(JSON)> ; s = graine, sc = score à battre, n = pseudo,
// r = device_id du parrain (transmis à run-start), run = run_id du parrain (son fantôme).
const b64 = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
export function challengeLink({ seed, score, ref, name, run, shopUrl = '/' }) {
  const u = new URL(shopUrl, location.href); u.search = '?play=1';
  u.hash = 'rs=' + b64(JSON.stringify({ v: 3, s: seed >>> 0, sc: Math.round(score) || 0, n: name || undefined, r: ref || undefined, run: run || undefined }));
  return u.href;
}
export function readChallenge(hash = location.hash) {
  if (!hash || hash.indexOf('#rs=') !== 0) return null;
  try {
    const d = JSON.parse(unb64(hash.slice(4))); if (!d || (d.v !== 2 && d.v !== 3) || !(d.s >>> 0)) return null;
    return { s: d.s >>> 0, sc: Number(d.sc) || 0, n: d.n ? String(d.n).slice(0, 12) : null, r: d.r ? String(d.r).slice(0, 40) : null, run: d.run ? String(d.run).slice(0, 40) : null };
  } catch (e) { return null; }
}

// Inscription à la newsletter de la boutique, côté navigateur (même origine que la boutique),
// après un claim réussi et seulement si la case a été cochée (notes/serveur.md) :
// GET /form/token.php (pose le cookie anti-robot) puis POST /newsletter.php { n, piège vide, jeton }.
// Double opt-in : la boutique envoie un e-mail de confirmation. Option `newsletter` de mount :
// absente = ce flux sur `shopUrl` ; false = rien ; une fonction (email) => Promise la remplace.
export async function subscribeNewsletter(cfg, email, shopUrl = '/') {
  if (cfg === false) return { ok: false, reason: 'disabled' };
  try {
    if (typeof cfg === 'function') { await cfg(email); return { ok: true }; }
    const base = new URL(shopUrl, location.href);
    const token = await (await fetch(new URL('/form/token.php', base).href, { credentials: 'same-origin' })).text();
    const body = new URLSearchParams({ n: email, 'com[newsletter_form_do_not_fill]': '', 'com[secureTokenNewsletterForm]': token.trim() });
    await fetch(new URL('/newsletter.php', base).href, { method: 'POST', body, credentials: 'same-origin', redirect: 'manual' });
    return { ok: true };
  } catch (e) { return { ok: false, reason: String((e && e.message) || e) }; }
}
