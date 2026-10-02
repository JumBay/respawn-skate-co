// Simulation du run à pas fixe (120 Hz), sans hasard ni horloge : mêmes graine + mêmes entrées
// = même run, au bit près. C'est ce qui permet le fantôme et la vérification par le serveur.
// Les effets (sons, particules, annonces) passent par fx, branché seulement pour le joueur réel.
import { groundAt as gAt, railY } from './track.js';

export const HZ = 120, STEP = 1 / HZ, RUN_LEN = 60, KMH = 0.05;
const GRAV = 2150, POP_MIN = 560, POP_MAX = 820, KICK_V = 720, KICK_POP = 980, PERF_WIN = 0.17, MULT_CAP = 6, COIN_PTS = 25;
const FLIPS = { l: { n: 'Kickflip', pts: 90, dur: 0.4, roll: 1, yaw: 0 }, r: { n: 'Heelflip', pts: 90, dur: 0.4, roll: -1, yaw: 0 }, d: { n: 'Pop Shove-it', pts: 70, dur: 0.38, roll: 0, yaw: 0.5 }, u: { n: '360 Flip', pts: 160, dur: 0.5, roll: 1, yaw: 1 } };
const GRABS = { none: 'Indy', l: 'Melon', r: 'Mute', u: 'Stalefish', d: 'Nosegrab' };
const GRINDS = { rail: { none: '50-50', d: 'Boardslide', l: '5-0', r: 'Nosegrind', u: 'Feeble' }, ledge: { none: '50-50', d: 'Lipslide', l: '5-0', r: 'Crooked', u: 'Smith' } };
const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const easeOut = (x) => 1 - (1 - x) * (1 - x);
export const msOf = (tick) => Math.round((tick * 1000) / HZ);
export const tickOf = (ms) => Math.round((ms * HZ) / 1000);
const NOFX = new Proxy({}, { get: () => () => {} });

// dropProduct : id du produit de la caisse (tiré par la graine parmi le catalogue, voir engine)
export function createSim(TR, { fx = NOFX, dropProduct = null, record = false } = {}) {
  const groundAt = (x) => gAt(TR, x);
  const S = { tick: 0, t: 0, clock: 0, ending: 0, done: false, combo: null, trickScore: 0, bestCombo: 0, bestNames: '', perfects: 0, tricks: 0, slowAt: 6,
    boostT: 0, magnetT: 0, coins: 0, letters: '', cassette: false, drop: null, dropCaught: false, taken: new Set(), cones: new Set(), events: [], inputs: [],
    x0: -380, distPts: 0, speedPts: 0, topKmh: 0, score: 0, lastJoint: 0, hintI: 0, result: null };
  const P = {}, IN = { down: false, pressEvt: false, relEvt: false, flick: null, dir: { l: 0, r: 0, u: 0, d: 0 } };
  const ev = (type, data) => { if (S.events.length < 3000) S.events.push([msOf(S.tick), type, data ?? null]); };

  function reset(x) {
    const g = groundAt(x), keep = P.speedBonus || 0;
    Object.assign(P, { x, y: g.y, vx: 560, vy: 0, state: 'ride', ang: g.ang, bodyAng: g.ang, crouch: 0.2, popT: 9, airT: 0, landT: 9, flip: null, flipQ: null, grab: null, grind: null,
      bailT: 0, inv: 0, pressAir: false, lastPress: -9, holdFrom: -9, linkT: 0, airTricks: 0, popped: false, kick: null, stairsOver: null, bb: null, ponyY: 0, ponyV: 0,
      lastFlip: null, flipCount: 0, jitter: 0, speedBonus: keep, landVy: 0 });
  }
  reset(-380); P.speedBonus = 0; P.vx = 420;

  function heldDir() { const d = IN.dir; return d.d ? 'd' : d.l ? 'l' : d.r ? 'r' : d.u ? 'u' : null; }
  function addTrick(name, pts, show) {
    if (!S.combo) S.combo = { names: [], pts: 0, mult: 0 };
    const c = S.combo; c.names.push(name); c.pts += pts; c.mult += 1; S.tricks++;
    P.speedBonus = Math.min(320, P.speedBonus + 7);
    if (show !== false) fx.trick(name, pts, P.x, P.y);
    if (c.mult >= S.slowAt) { S.slowAt = c.mult < 10 ? 10 : c.mult + 5; fx.slowmo(Math.min(MULT_CAP, c.mult)); }
    fx.combo(comboView());
  }
  const comboView = () => (S.combo ? { names: S.combo.names, pts: S.combo.pts, mult: Math.min(MULT_CAP, S.combo.mult) } : null);
  function bankCombo() {
    const c = S.combo; if (!c) return; S.combo = null;
    const total = Math.round(c.pts * Math.min(MULT_CAP, c.mult)); S.trickScore += total;
    if (total > S.bestCombo) { S.bestCombo = total; S.bestNames = c.names.slice(-8).join(' + ') + (c.names.length > 8 ? ' …' : ''); }
    ev('combo', total); fx.bank(total, c.mult, P.x, P.y); S.slowAt = 6; fx.combo(null, { banked: total });
  }
  function loseCombo() { if (!S.combo) return; S.combo = null; S.slowAt = 6; fx.combo(null, { lost: true }); }
  const targetSpeed = () => 560 + 180 * clamp(S.t / RUN_LEN, 0, 1) + P.speedBonus + (S.boostT > 0 ? 240 : 0);
  function pop(fromGrind) {
    const hold = S.clock - Math.max(P.holdFrom, P.lastPress), k = easeOut(clamp(hold / 0.32, 0, 1)), v = lerp(POP_MIN, POP_MAX, k);
    const base = Math.min(0, P.vx * Math.tan(P.ang));
    if (P.grind) endGrind();
    P.vy = base - v * (fromGrind ? 0.85 : 1); P.state = 'air'; P.popT = 0; P.airT = 0; P.popped = !fromGrind; P.airTricks = 0; P.pressAir = false; P.lastFlip = null; P.flipCount = 0; P.crouch = 0.9;
    P.stairsOver = TR.stairs.find((s) => s.x0 > P.x - 10 && s.x0 < P.x + 260) || null;
    fx.pop(P.x, P.y);
  }
  function startFlip(d) { const f = FLIPS[d]; P.flip = { d, f, t: 0, dur: f.dur }; fx.flip(); }
  function completeFlip(partial) {
    const f = P.flip.f; let name = f.n, pts = f.pts;
    if (P.lastFlip === f.n) { P.flipCount++; name = (P.flipCount === 2 ? 'Double ' : P.flipCount === 3 ? 'Triple ' : 'Quad ') + f.n; pts = Math.round(pts * 1.4 * P.flipCount); } else P.flipCount = 1;
    P.lastFlip = f.n; if (partial) pts = Math.round(pts * 0.5); P.flip = null; P.airTricks++; addTrick(name, pts);
  }
  function endGrab() { const g = P.grab; P.grab = null; if (!g) return; P.airTricks++; addTrick(g.name + ' Grab', Math.round(60 + g.t * 220)); }
  function startGrind(gr) {
    if (P.flip) completeFlip(P.flip.t / P.flip.dur < 0.6); if (P.grab) endGrab();
    const d = heldDir() || 'none', name = GRINDS[gr.kind][d] || GRINDS[gr.kind].none;
    P.state = 'grind'; P.grind = { g: gr, t: 0, name, d }; P.y = railY(gr, P.x); P.vy = 0; P.crouch = 0.7; P.landT = 0;
    fx.grindIn(P.x, P.y);
  }
  function endGrind() { const gd = P.grind; if (!gd) return; P.grind = null; addTrick(gd.name, Math.round(70 + gd.t * 160)); }
  function land(g) {
    P.y = g.y; P.ang = g.ang; P.state = 'ride'; P.vy = 0;
    let grade = 'ok';
    if (P.flip) { completeFlip(P.flip.t / P.flip.dur < 0.6); grade = 'limite'; }
    P.flipQ = null;
    if (P.grab) { endGrab(); grade = 'rattrape'; }
    const dp = S.clock - P.lastPress;
    if (P.pressAir && dp >= 0 && dp <= PERF_WIN && grade === 'ok') grade = 'perfect';
    if (P.popped && P.airTricks === 0) { addTrick('Ollie', 30, false); P.airTricks++; }
    if (P.kick) { const gp = P.kick; if (P.x > gp.x1) { addTrick(gp.name, 200); ev('gap', gp.name); P.speedBonus = Math.min(320, P.speedBonus + 10); } P.kick = null; }
    if (P.stairsOver) { const s = P.stairsOver; if (P.x > s.x0 + s.n * s.run) addTrick(s.n + '|steps', 60 + s.n * 15); P.stairsOver = null; }
    if (S.combo) {
      if (grade === 'perfect') { S.combo.pts += 40; S.combo.mult += 1; S.perfects++; P.speedBonus = Math.min(320, P.speedBonus + 18); fx.combo(comboView()); }
      fx.grade(grade, P.x, P.y);
      P.linkT = grade === 'perfect' ? 1.15 : 0.75;
    }
    P.landT = 0; P.crouch = 1; P.popped = false; P.airTricks = 0; P.pressAir = false; P.holdFrom = S.clock;
    fx.land(clamp((P.landVy || 800) / 1600, 0, 1), P.x, P.y, P.vx);
  }
  function bail() {
    if (P.state === 'bail' || P.inv > 0) return;
    P.state = 'bail'; P.bailT = 0; P.flip = null; P.grab = null; P.grind = null; P.speedBonus = 0; S.boostT = 0;
    P.bb = { x: P.x, y: P.y - 8, vx: P.vx * 0.6, vy: -520, rot: 0, vr: 14 }; P.vy = -420;
    loseCombo(); ev('bail'); fx.bail(P.x, P.y);
  }
  function respawn() {
    let x = P.x + 240;
    for (let guard = 0; guard < 20; guard++) { let moved = false;
      for (const o of TR.ledges) if (x > o.x0 - 60 && x < o.x1 + 40) { x = o.x1 + 90; moved = true; }
      const s = groundAt(x).s; if (s.kind !== 'flat') { x = s.x1 + 60; moved = true; }
      if (!moved) break; }
    const keep = P.vx; reset(x); P.vx = Math.max(420, keep * 0.7); P.inv = 1.3; fx.respawn(P.x, P.y);
  }
  // caisse du Drop : posée à 47 s au-dessus du prochain tremplin (hauteur « décollage géant »)
  function placeDrop() {
    const g = TR.gaps.find((q) => q.x0 > P.x + 900);
    if (g) S.drop = { x: g.x0 + P.vx * 0.45, y: g.y - 392, id: dropProduct };
    else { const rl = TR.rails.find((q) => q.x0 > P.x + 900) || { x1: P.x + 2000, y1: groundAt(P.x + 2000).y - 56 }; S.drop = { x: rl.x1 + 30, y: rl.y1 - 190, id: dropProduct }; }
    ev('dropSpawn', dropProduct); fx.dropSpawn(S.drop);
  }
  function collect(dt) {
    const reach = S.magnetT > 0 ? 170 : 0;
    const x0 = P.x - 60 - reach, x1 = P.x + 60 + reach, top = P.y - 160 - (P.state === 'grind' ? 12 : 19) - reach, bottom = P.y + 10 + reach;
    if (P.state === 'bail') return;
    for (const it of TR.items) {
      if (it.x > x1 + 40) break; if (it.x < x0 - 40 || S.taken.has(it.i)) continue;
      const r = it.k === 'coin' ? 14 : it.k === 'letter' || it.k === 'cassette' ? 24 : 22;
      if (it.x + r > x0 && it.x - r < x1 && it.y + r > top && it.y - r < bottom) {
        S.taken.add(it.i);
        if (it.k === 'coin') { S.coins++; S.trickScore += COIN_PTS; if (S.combo) S.combo.pts += 5; }
        else if (it.k === 'letter') { if (!S.letters.includes(it.ch)) S.letters += it.ch; ev('letter', it.ch); }
        else if (it.k === 'cassette') { S.cassette = true; ev('cassette'); }
        else if (it.k === 'boost') { S.boostT = 3.2; ev('boost'); }
        else if (it.k === 'magnet') { S.magnetT = 7; ev('magnet'); }
        fx.collect(it, S);
      }
    }
    const d = S.drop;
    if (d && !S.dropCaught && Math.abs(d.x - P.x) < 70 && d.y + 34 > P.y - 170 && d.y - 34 < P.y + 10) { S.dropCaught = true; ev('drop', d.id); fx.collect({ k: 'drop', x: d.x, y: d.y, id: d.id }, S); }
  }
  function updatePlayer(dt) {
    const p = P, pe = IN.pressEvt, re = IN.relEvt, fl = IN.flick; IN.pressEvt = IN.relEvt = false; IN.flick = null;
    if (pe) { p.lastPress = S.clock; p.pressAir = p.state === 'air'; }
    if (p.inv > 0) p.inv -= dt;
    if (!S.combo && p.state === 'ride') p.speedBonus = Math.max(0, p.speedBonus - 4 * dt);
    if (p.state !== 'bail') p.vx = lerp(p.vx, S.ending > 0 ? 0 : targetSpeed(), dt * (S.ending > 0 ? 1.4 : S.boostT > 0 ? 3 : 0.9));
    const prevVy = p.vy;
    if (p.state === 'ride') {
      p.landT += dt; p.crouch = lerp(p.crouch, IN.down ? 1 : 0.18, 1 - Math.exp(-dt * (IN.down ? 14 : 7)));
      if (re && S.ending <= 0) { pop(false); return; }
      const ox = p.x, nx = p.x + p.vx * dt; const s0 = groundAt(ox).s, g1 = groundAt(nx), s1 = g1.s;
      if (s1 !== s0) {
        if (s0.kind === 'kick') { const big = IN.down; p.x = s0.x1; p.y = s0.y1; p.vy = big ? -KICK_POP : -KICK_V; p.state = 'air'; p.popT = big ? 0 : 9; p.airT = 0; p.airTricks = 0; p.popped = false;
          p.kick = TR.gaps.find((g) => Math.abs(g.x0 - s0.x1) < 2) || null; p.lastFlip = null; p.flipCount = 0; if (big) { IN.down = false; p.pressAir = false; fx.kickPop(); } return; }
        if (s1.kind === 'stairs' || s1.y0 > s0.y1 + 3) { p.state = 'air'; p.vy = Math.max(0, p.vx * Math.tan(p.ang)); p.popT = 9; p.airT = 0; p.airTricks = 0; p.popped = false; p.lastFlip = null; p.flipCount = 0;
          p.stairsOver = s1.kind === 'stairs' ? TR.stairs.find((s) => s.x0 === s1.x0) || null : null; p.x = nx; return; }
        if (s1.y0 < s0.y1 - 3) { bail(); return; }
      }
      for (const o of TR.ledges) if (ox < o.x0 && nx >= o.x0 && p.y > o.top + 2) { bail(); return; }
      p.x = nx; p.y = g1.y; p.ang = g1.ang;
      if (s1.kind === 'stairs') { p.jitter = (Math.floor(p.x / 30) % 2) * 2; if (Math.floor(nx / 30) !== Math.floor(ox / 30)) fx.clack(); } else p.jitter = 0;
      const jn = Math.floor(nx / 200); if (jn !== S.lastJoint) { S.lastJoint = jn; if (s1.kind === 'flat' && jn % 3 !== 0) fx.clack(); }
      if (S.combo) { if (IN.down) p.linkT = Math.max(p.linkT, 0.25); p.linkT -= dt; if ((p.linkT <= 0 && !IN.down) || p.linkT < -1.2) bankCombo(); }
    } else if (p.state === 'air') {
      p.airT += dt; p.popT += dt; p.vy = Math.min(p.vy + GRAV * dt, 2600);
      const ox = p.x, oy = p.y; p.x += p.vx * dt; p.y += p.vy * dt;
      p.crouch = lerp(p.crouch, 0.55, 1 - Math.exp(-dt * 6));
      if (fl) { if (!p.flip && !p.grab) startFlip(fl); else if (p.flip) p.flipQ = fl; }
      if (p.flip) { p.flip.t += dt; if (p.flip.t >= p.flip.dur) { completeFlip(false); if (p.flipQ) { startFlip(p.flipQ); p.flipQ = null; } } }
      if (IN.down && p.pressAir && !p.flip && S.clock - p.lastPress > 0.16 && p.airT > 0.1) { if (!p.grab) p.grab = { t: 0, name: GRABS[heldDir() || 'none'] || 'Indy' }; p.grab.t += dt; }
      else if (p.grab && !IN.down) endGrab();
      if (p.vy > -80) for (const g of TR.grind) { if (g.x0 > p.x + 20) break; if (g.x1 < p.x - 2) continue;
        const ry = railY(g, p.x), ryo = railY(g, ox);
        if ((oy <= ryo + 3 && p.y >= ry - 1) || (g.kind === 'ledge' && ox < g.x0 && p.x >= g.x0 && p.y > g.y0 && p.y - g.y0 < 28)) { if (p.x < g.x1 - 24) { startGrind(g); return; } } }
      for (const o of TR.ledges) if (ox < o.x0 && p.x >= o.x0 && p.y > o.top + 2) { if (p.y - o.top < 28) { p.y = o.top; startGrind(TR.grind.find((g) => g.o === o)); return; } bail(); return; }
      const g = groundAt(p.x);
      if (p.y >= g.y) { const go = groundAt(ox); p.landVy = p.vy; if (oy <= g.y + 2 || g.s === go.s || p.y - g.y < 36) land(g); else bail(); }
    } else if (p.state === 'grind') {
      const gd = p.grind, g = gd.g; gd.t += dt; p.crouch = lerp(p.crouch, 0.42, 1 - Math.exp(-dt * 8));
      p.x += p.vx * dt; p.y = railY(g, p.x); p.ang = Math.atan2(g.y1 - g.y0, g.x1 - g.x0);
      fx.sparks(p.x, p.y, gd.d, p.vx);
      if (re) { pop(true); return; }
      if (p.x >= g.x1) { endGrind(); p.state = 'air'; p.vy = p.vx * Math.tan(p.ang) - 40; p.popT = 9; p.airT = 0; p.airTricks = 1; p.popped = false; p.lastFlip = null; p.flipCount = 0; }
    } else if (p.state === 'bail') {
      p.bailT += dt; p.vy += GRAV * dt; p.x += p.vx * 0.5 * dt; p.y += p.vy * dt; p.vx *= Math.pow(0.25, dt);
      const g = groundAt(p.x); if (p.y > g.y) { p.y = g.y; p.vy = -p.vy * 0.35; if (Math.abs(p.vy) < 60) p.vy = 0; }
      const b = p.bb; if (b) { b.vy += GRAV * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt; const gb = groundAt(b.x); if (b.y > gb.y - 6) { b.y = gb.y - 6; b.vy = -b.vy * 0.4; b.vr *= 0.6; b.vx *= 0.7; } }
      if (p.bailT > 1.05) respawn();
    }
    const acc = (p.vy - prevVy) / dt;
    p.ponyV += (-p.ponyY * 90 - p.ponyV * 9 - acc * 0.02) * dt; p.ponyY = clamp(p.ponyY + p.ponyV * dt, -16, 16);
    for (const c of TR.cones) { if (S.cones.has(c) || Math.abs(p.x - c.x) > 16 || p.y <= c.y - 30 || p.state === 'bail') continue; S.cones.add(c); fx.cone(c, p.vx); }
    collect(dt);
    const tgt = p.state === 'air' ? clamp(Math.atan2(p.vy, p.vx) * 0.25, -0.25, 0.35) : p.ang;
    p.bodyAng = lerp(p.bodyAng, tgt, 1 - Math.exp(-dt * (p.state === 'air' ? 5 : 14)));
  }
  // entrées : { k: 'a' (appui) | 'l' | 'r' | 'u' | 'd', down }
  function apply(e) {
    if (record && S.inputs.length < 6000) S.inputs.push([msOf(S.tick), e.k, e.down ? 1 : 0]);
    if (e.k === 'a') { if (e.down && !IN.down) { IN.down = true; IN.pressEvt = true; } else if (!e.down && IN.down) { IN.down = false; IN.relEvt = true; } }
    else if (IN.dir[e.k] != null) { if (e.down) { IN.dir[e.k] = 1; IN.flick = e.k; } else IN.dir[e.k] = 0; }
  }
  function finish() {
    S.done = true; S.score = Math.round(S.trickScore + S.speedPts + S.distPts);
    const distance = Math.round(Math.max(0, P.x - S.x0));
    S.result = { score: S.score, trickScore: S.trickScore, speedPts: Math.round(S.speedPts), distPts: Math.round(S.distPts), meters: Math.round(distance / 80), topKmh: Math.round(S.topKmh),
      bestCombo: S.bestCombo, bestNames: S.bestNames, tricks: S.tricks, perfects: S.perfects, coins: S.coins, letters: S.letters, cassette: S.cassette, dropCaught: S.dropCaught, dropId: S.drop ? S.drop.id : null,
      proof: { seed: TR.seed >>> 0, duration_ms: msOf(S.tick), score: S.score, distance, coins: S.coins, letters: S.letters.length, cassette: S.cassette, drop_caught: S.dropCaught,
        max_speed: Math.round(S.topKmh), events: S.events.slice(), inputs: S.inputs.slice() } };
    fx.done(S.result);
  }
  // un pas de 1/120 s ; inputs = entrées de ce pas
  function step(inputs) {
    if (S.done) { if (P.state !== 'bail') P.vx = lerp(P.vx, 0, STEP * 1.4); P.x += P.vx * STEP; const g = groundAt(P.x); if (P.state === 'ride') P.y = g.y; return; }
    if (inputs) for (const e of inputs) apply(e);
    S.tick++; S.clock = S.tick * STEP; const dt = STEP;
    if (S.boostT > 0) S.boostT -= dt; if (S.magnetT > 0) S.magnetT -= dt;
    if (S.ending <= 0) { S.t = S.clock; if (S.t >= RUN_LEN) { S.t = RUN_LEN; S.ending = dt; if (IN.down) { IN.down = false; IN.relEvt = false; } fx.timeUp(); } }
    else { S.ending += dt; if ((P.state === 'ride' && S.ending > 0.25) || S.ending > 2.6) { if (P.state === 'grind') endGrind(); bankCombo(); finish(); return; } }
    if (!S.drop && dropProduct && S.t >= 47) placeDrop();
    updatePlayer(dt);
    const kmh = P.vx * KMH;
    if (S.ending <= 0) { S.topKmh = Math.max(S.topKmh, kmh); S.speedPts += Math.max(0, kmh - 28) * 10 * dt; S.distPts = Math.max(0, (P.x - S.x0) / 80) * 3; }
    S.score = Math.round(S.trickScore + S.speedPts + S.distPts);
  }
  return { S, P, IN, step, apply, heldDir, comboView, get kmh() { return P.vx * KMH; } };
}

// Rejoue un run complet sans affichage (contrôle du déterminisme, fantôme, serveur)
export function replayRun(TR, inputs, opts = {}) {
  const sim = createSim(TR, opts); let i = 0; const max = HZ * (RUN_LEN + 6);
  const byTick = new Map(); for (const [ms, k, d] of inputs) { const t = tickOf(ms); if (!byTick.has(t)) byTick.set(t, []); byTick.get(t).push({ k, down: !!d }); }
  while (!sim.S.done && i < max) { sim.step(byTick.get(sim.S.tick) || null); i++; }
  return sim;
}
