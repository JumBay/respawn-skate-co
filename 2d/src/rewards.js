// Récompenses et défis. AUCUN code promo ici : le jeu ne connaît que l'interface d'un fournisseur
// injecté par la page (script de la boutique, ou rewards-supabase.js plus tard) :
//
//   rewards.session({ referrer, challengeSeed, player, lang }) -> Promise<{ runId, seed, signature?, demo? }>
//       appelé au début de chaque run ; la graine fixe le parcours (défi du jour = même graine).
//   rewards.claim({ type: 'code'|'product'|'exclusive', tier?, id?, ids?, runProof }) -> Promise<{ ok, code?, label?, url?, message?, demo? }>
//       runProof = { runId, seed, duration (ms), score, distance, catches: [[ms, kind, tier|id]], inputs: [[ms, code]], v }
//       (codes d'entrée : p = appui, r = relâché, fl/fr/fu/fd = flick) : de quoi rejouer ou juger la plausibilité.
//
// Sans fournisseur : mode démo, code « CODE-DEMO » affiché comme tel, exclusifs débloqués localement.
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
const localId = () => 'local-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const randomSeed = () => ((Math.random() * 2 ** 31) >>> 0) || 1;

export function createRewards(provider) {
  const live = !!(provider && typeof provider.claim === 'function');
  return {
    demo: !live,
    async session(ctx = {}) {
      const fallback = (ctx.challengeSeed >>> 0) || randomSeed();
      if (live && typeof provider.session === 'function') {
        try {
          const s = (await withTimeout(Promise.resolve(provider.session(ctx)), 4000)) || {};
          return { ...s, runId: s.runId || localId(), seed: (s.seed >>> 0) || fallback };
        } catch (e) { /* serveur muet : on joue quand même, la réclamation dira non */ }
      }
      return { runId: localId(), seed: fallback, demo: !live };
    },
    async claim(req) {
      if (live) {
        try { return (await withTimeout(Promise.resolve(provider.claim(req)), 8000)) || { ok: false }; }
        catch (e) { return { ok: false, message: e && e.message === 'timeout' ? null : String((e && e.message) || e) }; }
      }
      if (req.type === 'code') return { ok: true, code: 'CODE-DEMO', demo: true };
      return { ok: true, demo: true };
    },
  };
}

// Lien de défi : ?play=1#rs=<base64url(JSON)> ; s = graine du parcours, sc = score à battre,
// r = identifiant du joueur qui partage (parrainage, transmis à session()), n = pseudo.
const b64 = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
export function challengeLink({ seed, score, ref, name, shopUrl = '/' }) {
  const u = new URL(shopUrl, location.href);
  u.search = '?play=1';
  u.hash = 'rs=' + b64(JSON.stringify({ v: 2, s: seed >>> 0, sc: Math.round(score) || 0, r: ref || undefined, n: name || undefined }));
  return u.href;
}
export function readChallenge(hash = location.hash) {
  if (!hash || hash.indexOf('#rs=') !== 0) return null;
  try { const d = JSON.parse(unb64(hash.slice(4))); if (!d || d.v !== 2 || !(d.s >>> 0)) return null; return { s: d.s >>> 0, sc: Number(d.sc) || 0, r: d.r ? String(d.r).slice(0, 40) : null, n: d.n ? String(d.n).slice(0, 24) : null }; }
  catch (e) { return null; }
}
