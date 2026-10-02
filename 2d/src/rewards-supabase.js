// Client du serveur Respawn (Supabase Edge Functions), à la lettre de CONTRAT-SERVEUR.md.
// URL du projet passée en option de mount ({ supabase: { url, anonKey? } }), jamais écrite dans
// ce dépôt ; la clé anon est facultative (fonctions déployées sans vérification JWT). Le
// navigateur ne lit ni n'écrit aucune table, il n'appelle que ces fonctions. Aucun code promo ne transite ailleurs
// que dans la réponse de `claim`.
//
// Toute page peut aussi fournir son propre objet (option `server`) avec les mêmes méthodes, par
// exemple un faux serveur de test (2d/dev/mock-server.mjs).
export function createSupabaseServer({ url, anonKey, fetchImpl, timeoutMs = 8000 } = {}) {
  if (!url) throw new Error('createSupabaseServer : url requise');
  const base = url.replace(/\/$/, '') + '/functions/v1/';
  const doFetch = fetchImpl || ((...a) => fetch(...a));
  const headers = anonKey ? { apikey: anonKey, Authorization: 'Bearer ' + anonKey } : {};
  async function call(fn, { body, query } = {}) {
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => ctl && ctl.abort(), timeoutMs);
    try {
      const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([, v]) => v != null && v !== '')).toString() : '';
      const r = await doFetch(base + fn + qs, body ? { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl && ctl.signal } : { method: 'GET', headers, signal: ctl && ctl.signal });
      const data = await r.json().catch(() => ({}));
      if (!r.ok && !data.reason) data.reason = 'http_' + r.status;
      return data;
    } finally { clearTimeout(timer); }
  }
  return {
    kind: 'supabase',
    runStart: ({ device_id, mode, referrer, seed }) => call('run-start', { body: { device_id, mode, ...(referrer ? { referrer } : {}), ...(seed ? { seed } : {}) } }),
    runFinish: ({ run_id, device_id, proof }) => call('run-finish', { body: { run_id, device_id, proof } }),
    pseudo: ({ device_id, pseudo }) => call('pseudo', { body: { device_id, pseudo } }),
    claim: ({ run_id, device_id, email, newsletter, reward }) => call('claim', { body: { run_id, device_id, email, consent_rules: true, newsletter: !!newsletter, reward } }),
    leaderboard: ({ period, device_id }) => call('leaderboard', { query: { period, device_id } }),
    ghost: ({ run_id, ref, device_id, best }) => call('ghost', { query: run_id ? { run_id } : ref ? { ref, best: 1 } : { device_id, best: best ? 1 : null } }),
    drawInfo: ({ device_id } = {}) => call('draw-info', { query: { device_id } }),
    keepalive: () => call('keepalive', {}),
  };
}
