// Défi par lien et carte de partage.
// Le lien porte le score, le pseudo et le look (ids catalogue) dans le fragment (#rs=…), jamais
// envoyé au serveur. La « signature » n'est qu'une somme de contrôle : elle évite les liens
// abîmés et la triche la plus naïve, rien de plus (pas de classement en ligne).
const SALT = 'respawn-skate-co/v1';

function fnv(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}
const b64 = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

export function challengeLink({ name, score, loadout, gender, skin, hair, hairColor }, base = location.href) {
  const data = { v: 1, n: String(name || 'Rider').slice(0, 14), s: Math.round(score), l: loadout, g: gender, k: skin, h: hair, c: hairColor, d: new Date().toISOString().slice(0, 10) };
  const p = b64(JSON.stringify(data));
  const u = new URL(base);
  u.hash = `rs=${p}.${fnv(SALT + p)}`;
  return u.href;
}

export function readChallenge(hash = location.hash) {
  const m = /rs=([A-Za-z0-9_-]+)\.([a-z0-9]+)/.exec(hash || '');
  if (!m || fnv(SALT + m[1]) !== m[2]) return null;
  try {
    const d = JSON.parse(unb64(m[1]));
    if (!d || typeof d.s !== 'number' || d.s < 0 || d.s > 5e7) return null;
    return { name: String(d.n || 'Rider').replace(/[<>]/g, '').slice(0, 14), score: d.s, loadout: d.l || {}, gender: d.g, skin: d.k, head: d.h, hairColor: d.c, date: d.d };
  } catch (e) { return null; }
}

// Carte 1080×1350 : capture du jeu + score. La capture se fait juste après un rendu
// (pas besoin de preserveDrawingBuffer).
export async function shareCard({ game, score, bestCombo, name, lang, tier, url }) {
  const W = 1080, H = 1350;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  try {
    game.pipeline.render();
    const src = game.renderer.domElement;
    const sw = src.width, sh = src.height, ar = W / 900;
    let cw = sw, ch = sw / ar; if (ch > sh) { ch = sh; cw = sh * ar; }
    x.drawImage(src, (sw - cw) / 2, (sh - ch) / 2, cw, ch, 0, 0, W, 900);
  } catch (e) { /* pas de capture : fond uni */ }
  const g = x.createLinearGradient(0, 700, 0, H);
  g.addColorStop(0, 'rgba(26,16,38,0)'); g.addColorStop(0.35, 'rgba(26,16,38,0.92)'); g.addColorStop(1, '#1a1026');
  x.fillStyle = g; x.fillRect(0, 700, W, H - 700);
  await (document.fonts && document.fonts.ready);
  const fr = lang !== 'en';
  x.save(); x.translate(70, 1010); x.transform(1, 0, -0.14, 1, 0, 0);
  x.font = '400 64px Bungee, Impact, sans-serif';
  x.fillStyle = '#1a1026'; x.fillText('RESPAWN', 6, 6); x.fillStyle = '#C8FF2E'; x.fillText('RESPAWN', 0, 0);
  x.font = '400 30px Bungee, Impact, sans-serif'; x.fillStyle = '#f3f0e8'; x.fillText('SKATE CO.', 4, 44);
  x.restore();
  x.font = '400 150px Bungee, Impact, sans-serif';
  const s = Math.round(score).toLocaleString(fr ? 'fr-FR' : 'en-US');
  x.fillStyle = '#ff3d8b'; x.fillText(s, 76, 1196); x.fillStyle = '#f3f0e8'; x.fillText(s, 70, 1190);
  x.font = '800 34px Archivo, Arial, sans-serif'; x.fillStyle = '#f3f0e8';
  x.fillText(`${name || 'Rider'} · ${fr ? 'meilleur combo' : 'best combo'} ${Math.round(bestCombo).toLocaleString(fr ? 'fr-FR' : 'en-US')}${tier ? ' · ' + tier.toUpperCase() : ''}`, 74, 1252);
  x.font = '700 28px Archivo, Arial, sans-serif'; x.fillStyle = '#C8FF2E';
  x.fillText(fr ? 'Bats mon score →' : 'Beat my score →', 74, 1306);
  const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
  const file = new File([blob], 'respawn-score.png', { type: 'image/png' });
  const text = fr ? `J'ai fait ${s} points au skatepark Respawn. Bats-moi :` : `I scored ${s} at the Respawn skatepark. Beat me:`;
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text, url }); return 'shared'; }
  } catch (e) { if (e && e.name === 'AbortError') return 'aborted'; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'respawn-score.png';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return 'downloaded';
}
