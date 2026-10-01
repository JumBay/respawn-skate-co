// Banc de maniabilité : un « joueur robot » appuie sur les vraies touches (objet Input du jeu,
// mêmes boutons que le clavier) et pilote à vue vers une cible, comme un humain. Chaque scénario
// est joué N fois avec un départ et un timing légèrement différents (graine fixe : résultats
// reproductibles). La physique tourne seule, sans rendu, à 60 pas par seconde.
//
// En dev : window.__dev.bench() dans la console, ou ?bench dans l'URL (résultat dans la console
// et dans window.__benchResult).
import { SkaterController } from '../player/controller.js';
import { TrickSystem } from '../game/tricks.js';
import { Events } from '../core/events.js';
import { Input } from '../core/input.js';

const DT = 1 / 60;
const wrap = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// cap de la vitesse (ou de la planche à l'arrêt)
const heading = (c) => (Math.hypot(c.vel.x, c.vel.z) > 0.8 ? Math.atan2(c.vel.x, c.vel.z) : c.yaw + (c.fakie ? Math.PI : 0));

// gauche / droite au clavier pour viser un cap (zone morte de quelques degrés, comme un joueur)
function steerTo(keys, c, target, dead = 0.06) {
  const d = wrap(target - heading(c));
  keys.delete('left'); keys.delete('right');
  // tourner à gauche (x < 0) augmente le cap
  if (d > dead) keys.add('left'); else if (d < -dead) keys.add('right');
  return d;
}

export const SCENARIOS = {
  // Depuis le spawn : on pousse, demi-tour, puis on prend le quarter derrière le spawn et on fait un air.
  'quarter-air': {
    label: 'Quarter depuis le spawn + air',
    setup: (R) => ({ x: (R() - 0.5) * 1.2, z: 25 + (R() - 0.5) * 1.0, yaw: Math.PI + (R() - 0.5) * 0.2, turnAt: 1.0 + R() * 0.5 }),
    bot(t, c, keys, st) {
      keys.add('up');
      if (t < st.turnAt) { steerTo(keys, c, Math.PI); return; }
      steerTo(keys, c, 0); // demi-tour vers le quarter (+z)
    },
    judge(t, c, log) {
      const air = log.find((e) => e.name === 'takeoff' && e.vert);
      if (log.some((e) => e.name === 'bail')) return { done: true, ok: false, why: 'chute ' + (log.find((e) => e.name === 'bail').reason || '') };
      if (air) {
        const landed = log.find((e) => e.name === 'land' && e.t > air.t);
        if (landed && t > landed.t + 0.8) return { done: true, ok: log.maxAir >= 0.4, why: log.maxAir >= 0.4 ? 'ok' : `air trop bas (${log.maxAir.toFixed(2)} m)` };
      }
      if (t > 12) return { done: true, ok: false, why: air ? 'pas de réception' : 'pas de décollage vert' };
      return null;
    },
  },
  // Ollie sur le funbox : on arrive de côté, ollie chargé avant le bord, réception sur le dessus.
  'funbox-ollie': {
    label: 'Ollie chargé sur le funbox (0,9 m)',
    setup: (R) => ({ x: -13 + (R() - 0.5) * 1.5, z: 1.75 + (R() - 0.5) * 2.0, yaw: Math.PI / 2 + (R() - 0.5) * 0.2, popAt: 2.3 + (R() - 0.5) * 0.7 }),
    bot(t, c, keys, st) {
      steerTo(keys, c, Math.PI / 2);
      const dist = -4 - c.pos.x; // distance au flanc du funbox
      if (!st.popped) {
        keys.add('up');
        if (dist < st.popAt + 1.0 && !st.holding) { st.holding = true; st.holdT = t; }
        if (st.holding) { keys.add('ollie'); keys.delete('up'); }
        if (st.holding && (dist < st.popAt || t - st.holdT > 0.6)) { keys.delete('ollie'); st.popped = true; }
      } else keys.delete('up');
    },
    judge(t, c, log) {
      if (log.some((e) => e.name === 'bail')) return { done: true, ok: false, why: 'chute ' + (log.find((e) => e.name === 'bail').reason || '') };
      const land = log.find((e) => e.name === 'land');
      if (land) return { done: true, ok: land.y > 0.8, why: land.y > 0.8 ? 'ok' : 'retombé à côté' };
      if (t > 8) return { done: true, ok: false, why: 'pas de saut' };
      return null;
    },
  },
  // Grind sur le rail plat du parking : on longe le rail à environ 1 m et on appuie sur grind.
  'rail-grind': {
    label: 'Grind du rail plat (aimanté)',
    setup: (R) => ({ x: -16 + (R() < 0.5 ? -1 : 1) * (0.7 + R() * 0.6), z: 21 + (R() - 0.5) * 1.5, yaw: Math.PI + (R() - 0.5) * 0.12, pressZ: 13.5 + (R() - 0.5) * 1.5 }),
    bot(t, c, keys, st) {
      if (c.state === 'grind') { keys.clear(); return; }
      steerTo(keys, c, Math.PI);
      if (t < 1.6) keys.add('up'); else keys.delete('up');
      if (!st.pressed && c.pos.z < st.pressZ) { keys.add('grind'); st.pressed = true; st.pt = t; }
      if (st.pressed && t - st.pt > 0.1) keys.delete('grind');
    },
    judge(t, c, log) {
      const g = log.find((e) => e.name === 'grind');
      const ge = log.find((e) => e.name === 'grindEnd');
      if (log.some((e) => e.name === 'bail')) return { done: true, ok: false, why: 'chute ' + (log.find((e) => e.name === 'bail').reason || '') };
      if (ge && t > ge.t + 1.0) return { done: true, ok: ge.covered > 0.35, why: ge.covered > 0.35 ? 'ok' : `grind trop court (${(ge.covered * 100) | 0} %)` };
      if (t > 9) return { done: true, ok: false, why: g ? 'grind sans fin' : 'pas de grind' };
      return null;
    },
  },
};

export function runScenario(game, name, { trials = 20, seed = 7, assist } = {}) {
  const sc = SCENARIOS[name];
  const R = rng(seed + name.length * 101);
  const results = [];
  for (let k = 0; k < trials; k++) {
    const ev = new Events();
    const tricks = new TrickSystem(ev);
    const ctrl = new SkaterController(game.park, tricks, ev);
    if (assist != null) ctrl.assist = assist;
    const input = new Input(new EventTarget());
    const st = sc.setup(R);
    ctrl.reset(st.x, st.z, st.yaw);
    const log = []; log.maxAir = 0;
    let t = 0;
    for (const n of ['takeoff', 'land', 'bail', 'grind', 'grindEnd', 'ollie']) ev.on(n, (e) => log.push({ name: n, t, vert: e && e.vert, reason: e && e.reason, covered: e && e.covered, y: ctrl.pos.y }));
    let verdict = null;
    while (!verdict) {
      sc.bot(t, ctrl, input.keys, st);
      input.update(DT);
      ctrl.update(DT, input);
      tricks.decay && tricks.decay(DT);
      if (ctrl.state === 'air') {
        const lip = game.park.terrain.height(ctrl.air.takeoff.x, ctrl.air.takeoff.z);
        log.maxAir = Math.max(log.maxAir, ctrl.pos.y - Math.max(lip, ctrl.air.takeoff.y));
      }
      t += DT;
      verdict = sc.judge(t, ctrl, log);
    }
    input.dispose();
    results.push(verdict);
  }
  const ok = results.filter((r) => r.ok).length;
  const why = {};
  for (const r of results) if (!r.ok) why[r.why] = (why[r.why] || 0) + 1;
  return { name, label: sc.label, ok, trials, rate: Math.round((ok / trials) * 100), failures: why };
}

export function runBench(game, opts = {}) {
  const out = Object.keys(SCENARIOS).map((n) => runScenario(game, n, opts));
  console.table(out.map((r) => ({ scénario: r.label, réussis: `${r.ok}/${r.trials}`, taux: r.rate + ' %', échecs: JSON.stringify(r.failures) })));
  return out;
}
