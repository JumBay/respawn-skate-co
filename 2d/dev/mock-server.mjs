// Faux serveur Respawn (banc local) qui suit CONTRAT-SERVEUR.md : mêmes routes, mêmes champs.
// node 2d/dev/mock-server.mjs [port]   -> http://127.0.0.1:8787/functions/v1/<fonction>
// Il rejoue chaque run reçu avec la vraie simulation (sim.js) : un run accepté prouve que la
// physique est déterministe entre le navigateur et Node. Codes renvoyés : FACTICES (MOCK-…).
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { genTrack, dailySeed } from '../src/track.js';
import { replayRun } from '../src/sim.js';
import catalog from '../src/catalog.json' with { type: 'json' };

const PORT = Number(process.argv[2] || 8787);
const DROP_POOL = catalog.products.filter((p) => !p.exclusive_unlock && p.slot !== 'pack').map((p) => p.id).sort((a, b) => a - b);
const runs = new Map(), players = new Map(), claims = new Set(), newsletter = [];
const FAKE = ['Nora', 'Sami', 'Kick_Lou', 'Grindz', 'Ollie99', 'BowlKid', 'Mx', 'Tre_Flip', 'Lampa', 'Cone', 'Spawny'].map((p, i) => ({ device_id: 'fake-' + i, pseudo: p, best: 70000 - i * 5200 }));
const prize = { title: 'Skate complet Lampadaire', image: 'https://media.cdnws.com/_i/426026/RAW-41/1002/41/respawn-emblem.png', ends_at: '2026-10-05T20:00:00+02:00' };
const player = (id) => { if (!players.has(id)) players.set(id, { device_id: id, ref: 'r' + randomUUID().slice(0, 8), pseudo: null, best: 0, bestRun: null, tickets: 0, streak: 0 }); return players.get(id); };
const byRef = (ref) => [...players.values()].find((p) => p.ref === ref);
const send = (res, code, data) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'apikey, authorization, content-type, x-requested-with', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' }); res.end(JSON.stringify(data)); };
function board() { return [...FAKE, ...[...players.values()].filter((p) => p.best > 0)].sort((a, b) => b.best - a.best).map((p, i) => ({ rank: i + 1, pseudo: p.pseudo || 'Rider', score: p.best, device_id: p.device_id, badge: ['gold', 'silver', 'bronze'][i] || null, me: false })); }

const routes = {
  'run-start'(b) {
    if (!b.device_id) return [400, { reason: 'device_id' }];
    const seed = b.mode === 'daily' ? dailySeed() : (b.seed >>> 0) || (Math.random() * 2 ** 31) >>> 0 || 1;
    const run_id = randomUUID(); runs.set(run_id, { run_id, device_id: b.device_id, seed, mode: b.mode, referrer: b.referrer || null, done: false, t: Date.now() });
    const pl = player(b.device_id); const drop = process.env.NO_DROP ? null : { product_id: DROP_POOL[seed % DROP_POOL.length] }; runs.get(run_id).drop = drop;
    return [200, { run_id, seed, mode: b.mode, server_time: new Date().toISOString(), prize, drop, player: { ref: pl.ref, pseudo: pl.pseudo } }];
  },
  'run-finish'(b) {
    const r = runs.get(b.run_id); if (!r || r.device_id !== b.device_id) return [200, { accepted: false, reason: 'unknown_run' }];
    if (r.done) return [200, { accepted: false, reason: 'already_finished' }];
    r.done = true; const pr = b.proof || {};
    if ((pr.seed >>> 0) !== r.seed) return [200, { accepted: false, reason: 'seed' }];
    if (Math.abs(pr.duration_ms - 60000) > 5000) return [200, { accepted: false, reason: 'duration' }];
    const dropId = r.drop ? r.drop.product_id : null;
    const sim = replayRun(genTrack(r.seed), pr.inputs || [], { dropProduct: dropId }); const rr = sim.S.result;
    if (!rr || rr.score !== pr.score || rr.proof.distance !== pr.distance) return [200, { accepted: false, reason: 'replay_mismatch', replay: rr && rr.score }];
    r.proof = pr; const p = player(b.device_id);
    if (pr.score > p.best) { p.best = pr.score; p.bestRun = r.run_id; }
    const tickets = pr.score >= 20000 ? 1 : 0; p.tickets += tickets; p.streak = Math.max(1, p.streak);
    const rewards = [];
    if (Number(pr.letters) >= 5) rewards.push({ kind: 'skate', label: '-10 % sur toute la boutique' });
    if (pr.score >= 60000) rewards.push({ kind: 'score', label: '-15 % sur toute la boutique' });
    if (pr.drop_caught && dropId) rewards.push({ kind: 'drop', product_id: dropId, label: '-20 % sur ce produit' });
    r.rewards = rewards;
    const b2 = board(), me = b2.find((x) => x.device_id === b.device_id);
    return [200, { accepted: true, score: pr.score, best: p.best, ranks: { day: me && me.rank, week: me && me.rank, all: me && me.rank }, tickets_earned: tickets, streak: p.streak, rewards, needs_pseudo: !p.pseudo }];
  },
  pseudo(b) { const v = String(b.pseudo || '').trim(); if (v.length < 2) return [200, { ok: false, reason: 'too_short' }]; if (v.length > 12) return [200, { ok: false, reason: 'too_long' }]; if (/merde|con\b/i.test(v)) return [200, { ok: false, reason: 'refused' }]; player(b.device_id).pseudo = v; return [200, { ok: true, pseudo: v }]; },
  claim(b) {
    const r = runs.get(b.run_id); if (!r || r.device_id !== b.device_id) return [200, { ok: false, reason: 'invalid_reward' }];
    if (b.consent_rules !== true || !/@/.test(b.email || '')) return [200, { ok: false, reason: 'invalid_reward' }];
    const rw = (r.rewards || []).find((x) => x.kind === b.reward?.kind && (x.kind !== 'drop' || x.product_id === b.reward.product_id)); if (!rw) return [200, { ok: false, reason: 'invalid_reward' }];
    const key = b.email.toLowerCase() + '|' + rw.kind; if (claims.has(key)) return [200, { ok: false, reason: 'already_claimed' }]; claims.add(key);
    const code = 'MOCK-' + rw.kind.toUpperCase() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    return [200, { ok: true, code, label: rw.label, value: { skate: 10, score: 15, drop: 20 }[rw.kind], expires_at: '2026-12-31T23:59:00+01:00', apply_url: '/p/discount.html?code=' + code }];
  },
  leaderboard(q) {
    const b = board(), meRow = b.find((x) => x.device_id === q.device_id);
    const me = meRow ? { rank: meRow.rank, score: meRow.score, above: b[meRow.rank - 2] ? { pseudo: b[meRow.rank - 2].pseudo, score: b[meRow.rank - 2].score } : null, below: b[meRow.rank] ? { pseudo: b[meRow.rank].pseudo, score: b[meRow.rank].score } : null } : null;
    return [200, { period: q.period || 'day', top: b.slice(0, 10).map(({ device_id, ...x }) => ({ ...x, me: device_id === q.device_id })), me, gap_to_next: me && me.above ? me.above.score - me.score : 0 }];
  },
  ghost(q) {
    const r = q.run_id ? runs.get(q.run_id) : q.ref ? runs.get((byRef(q.ref) || {}).bestRun) : runs.get(player(q.device_id).bestRun);
    if (!r || !r.proof) return [404, { reason: 'not_found' }];
    return [200, { run_id: r.run_id, seed: r.seed, inputs: r.proof.inputs, score: r.proof.score, pseudo: player(r.device_id).pseudo || 'Rider' }];
  },
  'draw-info'(q) { return [200, { prize, ends_at: prize.ends_at, eligible: claims.size > 0, my_tickets: q.device_id ? player(q.device_id).tickets : undefined, last_winner: { pseudo: 'Nora', prize: 'Hoodie Respawn' } }]; },
  keepalive() { return [200, { ok: true }]; },
};

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/newsletter' && req.method === 'POST') { let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => { newsletter.push(d); console.log('[mock] newsletter', d); send(res, 200, { ok: true }); }); return; }
  if (u.pathname === '/_state') return send(res, 200, { runs: runs.size, claims: [...claims], newsletter, players: [...players.values()].map((p) => ({ ...p, bestRun: !!p.bestRun })) });
  const m = u.pathname.match(/^\/functions\/v1\/([a-z-]+)$/); const fn = m && routes[m[1]];
  if (!fn) return send(res, 404, { reason: 'not_found' });
  if (!req.headers.apikey) return send(res, 401, { reason: 'apikey' });
  if (req.method === 'GET') { const [c, d] = fn(Object.fromEntries(u.searchParams)); console.log('[mock]', m[1], c); return send(res, c, d); }
  let body = ''; req.on('data', (c) => (body += c)); req.on('end', () => { let b = {}; try { b = JSON.parse(body || '{}'); } catch (e) { return send(res, 400, { reason: 'json' }); } const [c, d] = fn(b); console.log('[mock]', m[1], c, d.accepted ?? d.ok ?? '', d.reason || ''); send(res, c, d); });
}).listen(PORT, '127.0.0.1', () => console.log('mock respawn server on', PORT));
