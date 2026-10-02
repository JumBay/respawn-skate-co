// Parcours généré par graine (déterministe : même graine = même parcours, au bit près).
// Objets du run (contrat serveur) : pièces Respawn, lettres S-K-A-T-E, cassette cachée (rare),
// bonus boost / aimant. La caisse « Drop » est posée par la simulation en fin de run.
export function mulberry(s) { return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let q = Math.imul(s ^ (s >>> 15), 1 | s); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; }; }
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const GAPNAMES = ['Gap du canal', 'Canal de minuit', 'Gap Respawn', 'Gap des docks'];
const GRAV = 2150;

export function genTrack(seed) {
  const r = mulberry(seed >>> 0 || 1);
  const TR = { seed, segs: [], ledges: [], rails: [], cones: [], walls: [], lamps: [], gaps: [], stairs: [], hints: [], props: [], items: [], x: -1500, y: 0 };
  const seg = (x1, y1, kind) => { TR.segs.push({ x0: TR.x, y0: TR.y, x1, y1, kind }); TR.x = x1; TR.y = y1; };
  const vEst = () => 600 + 260 * clamp(TR.x / 42000, 0, 1) + 90;
  const flat = (len) => seg(TR.x + len * (vEst() / 640), TR.y, 'flat');
  const lamp = (x) => TR.lamps.push({ x, y: TR.y });
  const wall = (x0, x1, h) => TR.walls.push({ x0, x1, y: TR.y, h: h || 170 + r() * 60, g: Math.floor(r() * 5) });
  const hint = (k) => TR.hints.push({ x: TR.x - 250, k });
  const pick = (a) => a[Math.floor(r() * a.length)];
  const item = (k, x, y, extra) => TR.items.push({ k, x, y, ph: r() * 6, ...extra });
  // arc de pièces qui suit une trajectoire d'ollie (départ x0, hauteur h, longueur L)
  const coinArc = (x0, y0, L, h, n = 5) => { for (let i = 0; i < n; i++) { const u = (i + 0.5) / n; item('coin', x0 + u * L, y0 - 4 * h * u * (1 - u) - 70); } };
  const coinRow = (x0, x1, y, n) => { for (let i = 0; i < n; i++) item('coin', x0 + ((x1 - x0) * (i + 0.5)) / n, y); };
  let chunkN = 0, letterI = 0;
  const LETTERS = 'SKATE';
  const LETTER_AT = { 2: 'cone', 6: 'rail', 11: 'stairs', 16: 'gap', 21: 'gap' };
  const wantLetter = () => LETTER_AT[chunkN] && letterI < 5;
  const C = {
    cone() { flat(240); const n = r() < 0.45 ? 2 : 1; if (r() < 0.5) wall(TR.x - 200, TR.x + 420); const cx = TR.x + 60;
      for (let i = 0; i < n; i++) TR.cones.push({ x: cx + i * 44, y: TR.y, hit: 0 });
      if (wantLetter()) item('letter', cx + 20, TR.y - 255, { ch: LETTERS[letterI++] }); else coinArc(cx - 160, TR.y, 380, 150, 6);
      flat(n * 44 + 400); if (r() < 0.5) lamp(TR.x - 200); },
    ledge() { flat(220); const L = 300 + ((r() * 160) | 0), style = pick(['beton', 'banc', 'manny']); if (r() < 0.7) wall(TR.x - 160, TR.x + L + 160);
      const o = { x0: TR.x, x1: TR.x + L, y: TR.y, top: TR.y - (style === 'manny' ? 34 : 44), style }; TR.ledges.push(o);
      coinRow(o.x0 + 30, o.x1 - 20, o.top - 80, 5); flat(L + 330); lamp(TR.x - 120); },
    rail() { flat(220); const L = 360 + ((r() * 180) | 0); if (r() < 0.5) wall(TR.x - 100, TR.x + L + 100);
      TR.rails.push({ x0: TR.x, y0: TR.y - 56, x1: TR.x + L, y1: TR.y - 56, style: r() < 0.5 ? 'rond' : 'plat' });
      const lt = wantLetter(); if (lt) item('letter', TR.x + L * 0.75, TR.y - 56 - 95, { ch: LETTERS[letterI++] }); coinRow(TR.x + 30, TR.x + L * (lt ? 0.6 : 0.95), TR.y - 56 - 85, lt ? 4 : 6);
      flat(L + 340); },
    stairs(withRail) { flat(280); lamp(TR.x - 180); const n = 5 + ((r() * 4) | 0), run = 30, rise = 19, x0 = TR.x, y0 = TR.y;
      seg(x0 + n * run, y0 + n * rise, 'stairs'); TR.stairs.push({ x0, y0, n, run, rise });
      if (withRail) { const rl = { x0: x0 - 24, y0: y0 - 50 - (24 * rise) / run, x1: x0 + n * run - 6, y1: y0 + n * rise - 50 - (6 * rise) / run, style: 'main' }; TR.rails.push(rl);
        for (let i = 0; i < 4; i++) { const u = (i + 0.5) / 4; item('coin', rl.x0 + (rl.x1 - rl.x0) * u, rl.y0 + (rl.y1 - rl.y0) * u - 85); } }
      if (wantLetter()) item('letter', x0 + n * run * 0.5, y0 - 230, { ch: LETTERS[letterI++] });
      else if (!withRail) coinArc(x0 - 40, y0, n * run + 200, 200, 5);
      if (TR.cassetteAt === chunkN) item('cassette', x0 + n * run * 0.55, y0 - 300);
      flat(500); },
    gap() { flat(260); const x0 = TR.x, y0 = TR.y; seg(x0 + 120, y0 - 46, 'kick'); const gx = TR.x; TR.y = y0 + 170; seg(gx + 300, y0 + 170, 'pit'); TR.y = y0;
      TR.gaps.push({ x0: gx, x1: gx + 300, y: y0, name: GAPNAMES[TR.gaps.length % GAPNAMES.length] });
      const v = vEst();
      if (wantLetter()) item('letter', gx + v * (letterI === 4 ? 0.456 : 0.34), y0 - (letterI === 4 ? 410 : 350), { ch: LETTERS[letterI++] });
      else { // arc de pièces sur la trajectoire normale du tremplin
        for (let i = 0; i < 6; i++) { const t = 0.08 + i * 0.11; item('coin', gx + v * t, y0 - 46 - (720 * t - 0.5 * GRAV * t * t) - 70); } }
      if (TR.cassetteAt === chunkN) item('cassette', gx + v * 0.456, y0 - 415);
      flat(520); lamp(TR.x - 300); },
    bank() { flat(180); seg(TR.x + 300, TR.y - 120, 'bank'); coinRow(TR.x - 280, TR.x - 20, TR.y + 40, 4); flat(380); lamp(TR.x - 200); },
    drop() { flat(300); TR.props.push({ k: 'drop', x: TR.x, y: TR.y }); TR.y += 100; coinArc(TR.x - 40, TR.y - 100, 360, 100, 5); flat(480); },
    combo() { flat(200); const L = 280; TR.ledges.push({ x0: TR.x, x1: TR.x + L, y: TR.y, top: TR.y - 44, style: 'beton' }); wall(TR.x - 100, TR.x + L + 700); coinRow(TR.x + 20, TR.x + L - 20, TR.y - 44 - 80, 4); flat(L + 250);
      const L2 = 380; TR.rails.push({ x0: TR.x, y0: TR.y - 56, x1: TR.x + L2, y1: TR.y - 56, style: 'rond' }); coinRow(TR.x + 20, TR.x + L2 - 20, TR.y - 56 - 85, 5); flat(L2 + 340); },
    bonus(k) { flat(260); item(k, TR.x, TR.y - 70); flat(240); },
  };
  TR.cassetteAt = r() < 0.45 ? 12 + Math.floor(r() * 18) : -1;
  seg(-1100, 0, 'flat'); seg(200, 0, 'flat'); TR.introWall = { x0: -1250, x1: -60, y: 0 }; lamp(-1150); lamp(60);
  TR.props.push({ k: 'bin', x: -760, y: 0 }, { k: 'hydrant', x: -140, y: 0 });
  hint('ollie'); C.cone(); C.cone(); hint('grind'); C.ledge(); C.rail(); hint('flip'); C.stairs(false); hint('kick'); C.gap(); hint('perfect'); C.bank(); C.stairs(true); C.combo();
  const pool = ['cone', 'ledge', 'rail', 'stairs', 'stairsR', 'gap', 'combo', 'drop', 'ledge', 'rail', 'gap'];
  while (TR.x < 64000) {
    chunkN++;
    let k = pick(pool);
    if (chunkN % 7 === 3) k = 'boost'; else if (chunkN % 11 === 6) k = 'magnet';
    if (LETTER_AT[chunkN]) k = LETTER_AT[chunkN];
    else if (TR.cassetteAt === chunkN) k = r() < 0.5 ? 'stairs' : 'gap';
    else if (TR.y > 140 && r() < 0.8 && k !== 'boost' && k !== 'magnet') k = 'bank';
    if (TR.y < -120 && k === 'bank') k = 'rail';
    if (k === 'stairsR') C.stairs(true); else if (k === 'boost' || k === 'magnet') C.bonus(k); else C[k]();
  }
  flat(4000);
  TR.grind = [...TR.ledges.map((o) => ({ x0: o.x0, x1: o.x1, y0: o.top, y1: o.top, o, kind: 'ledge' })), ...TR.rails.map((o) => ({ x0: o.x0, x1: o.x1, y0: o.y0, y1: o.y1, o, kind: 'rail' }))].sort((a, b) => a.x0 - b.x0);
  TR.items.sort((a, b) => a.x - b.x); TR.items.forEach((it, i) => { it.i = i; });
  return TR;
}
export function segIndexAt(TR, x) { const s = TR.segs; let lo = 0, hi = s.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (s[m].x0 <= x) lo = m; else hi = m - 1; } return lo; }
export function groundAt(TR, x) { const s = TR.segs[segIndexAt(TR, x)]; const k = s.x1 > s.x0 ? clamp((x - s.x0) / (s.x1 - s.x0), 0, 1) : 0; return { y: s.y0 + (s.y1 - s.y0) * k, ang: Math.atan2(s.y1 - s.y0, s.x1 - s.x0), s }; }
export const railY = (g, x) => g.y0 + (g.y1 - g.y0) * (g.x1 > g.x0 ? clamp((x - g.x0) / (g.x1 - g.x0), 0, 1) : 0);
// graine du jour hors ligne (même parcours pour tous ce jour-là, sans serveur)
export function dailySeed(d = new Date()) { const s = d.toISOString().slice(0, 10); let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return (h >>> 0) || 1; }
