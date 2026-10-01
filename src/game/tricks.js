// Tricks, score et combos façon arcade : points par trick, multiplicateur, tricks répétés
// dévalués, jauge « spécial », gaps nommés.

export const FLIPS = {
  '': { name: 'Kickflip', pts: 100, roll: 1, yaw: 0, dur: 0.42 },
  w: { name: 'Kickflip', pts: 100, roll: 1, yaw: 0, dur: 0.42 },
  e: { name: 'Heelflip', pts: 100, roll: -1, yaw: 0, dur: 0.42 },
  s: { name: 'Pop Shove-it', pts: 100, roll: 0, yaw: 0.5, dur: 0.38 },
  n: { name: 'Impossible', pts: 250, roll: 0, yaw: 0, pitch: 1, dur: 0.45 },
  sw: { name: 'Tre Flip', pts: 400, roll: 1, yaw: 1, dur: 0.5 },
  se: { name: '360 Shove-it', pts: 250, roll: 0, yaw: 1, dur: 0.46 },
  nw: { name: 'Hardflip', pts: 350, roll: 1, yaw: 0, pitch: 0.5, dur: 0.46 },
  ne: { name: 'Varial Heelflip', pts: 350, roll: -1, yaw: -0.5, dur: 0.46 },
};
export const GRABS = {
  '': { name: 'Indy', pts: 150, pose: 'indy' },
  w: { name: 'Melon', pts: 150, pose: 'melon' },
  e: { name: 'Method', pts: 200, pose: 'method' },
  n: { name: 'Nosegrab', pts: 150, pose: 'nose' },
  s: { name: 'Tailgrab', pts: 150, pose: 'tail' },
  nw: { name: 'Stalefish', pts: 250, pose: 'stale' },
  ne: { name: 'Crail', pts: 250, pose: 'nose' },
  sw: { name: 'Mute', pts: 200, pose: 'melon' },
  se: { name: 'Benihana', pts: 300, pose: 'beni' },
};
const GRINDS = { '': ['50-50', 120], n: ['Nosegrind', 160], s: ['5-0', 160], nw: ['Crooked', 250], ne: ['Crooked', 250], sw: ['Feeble', 250], se: ['Smith', 250], w: ['Feeble', 250], e: ['Smith', 250] };
const SLIDES = { '': ['Boardslide', 150], n: ['Noseslide', 200], s: ['Tailslide', 200], e: ['Lipslide', 220], w: ['Lipslide', 220], nw: ['Bluntslide', 300], ne: ['Bluntslide', 300], sw: ['Nosebluntslide', 350], se: ['Nosebluntslide', 350] };
export const SPECIALS = {
  air: [
    { dirs: ['', 'n', 's'], name: 'Christ Air', pts: 1800, pose: 'christ', dur: 0.9 },
    { dirs: ['e', 'w', 'ne', 'nw'], name: 'Respawn 540 Flip', pts: 2500, flip: { roll: 2, yaw: 1.5, dur: 0.85 }, spin: Math.PI * 3 },
    { dirs: ['sw', 'se'], name: 'Double Tre Flip', pts: 2200, flip: { roll: 2, yaw: 2, dur: 0.8 } },
  ],
  grind: [{ name: 'Darkslide', pts: 1500 }],
  manual: [{ name: 'Casper', pts: 1200 }],
};

const spinPoints = (deg) => ({ 180: 100, 360: 250, 540: 500, 720: 900, 900: 1500, 1080: 2400 }[deg] || (deg > 1080 ? 3000 : 0));

export class TrickSystem {
  constructor(events) {
    this.ev = events;
    this.score = 0;
    this.special = 0;
    this.enabled = true;
    this.resetCombo();
    this.air = null;
    this.bestCombo = 0;
    this.stats = { tricks: 0, bails: 0, longestGrind: 0 };
  }

  resetCombo() {
    this.combo = { items: [], base: 0, active: false, counts: {} };
  }

  reset() {
    this.score = 0; this.special = 0; this.resetCombo(); this.air = null; this.grindT = null; this.manualT = null;
    this.bestCombo = 0; this.stats = { tricks: 0, bails: 0, longestGrind: 0 };
    this.emitCombo();
  }

  specialReady() { return this.special >= 0.999; }

  // ajoute un élément au combo, dévalué s'il a déjà été fait dans ce combo
  add(name, pts, { kind = 'trick', silent = false } = {}) {
    const c = this.combo;
    const n = c.counts[name] || 0;
    c.counts[name] = n + 1;
    const val = Math.round(pts * Math.pow(0.6, n));
    c.items.push({ name, pts: val, kind });
    c.base += val;
    c.active = true;
    this.stats.tricks++;
    if (!silent) this.ev.emit('trick', { name, pts: val, kind, repeat: n });
    this.special = Math.min(1, this.special + val / 3200);
    this.emitCombo();
    return val;
  }

  // dernier élément du combo mis à jour en direct (grab tenu, grind, manual)
  live(item, name, pts) {
    item.name = name;
    const d = pts - item.pts;
    item.pts = pts; this.combo.base += d;
    this.special = Math.min(1, this.special + Math.max(0, d) / 4000);
    this.emitCombo();
  }

  emitCombo() {
    const c = this.combo;
    this.ev.emit('combo', { items: c.items, base: c.base, mult: c.items.length, active: c.active, special: this.special });
  }

  // --- air ---------------------------------------------------------------------------------------
  startAir(vert, reason) {
    this.air = { vert, reason, flips: [], flip: null, grab: null, grabItem: null, specialFlip: null, t: 0, tricksCount: 0, pose: null, specialPose: null };
  }

  flip(dir) {
    const a = this.air; if (!a || a.flip) return;
    const def = FLIPS[dir] || FLIPS[''];
    a.flip = { ...def, t: 0 };
    a.flips.push(def.name);
    a.tricksCount++;
    this.ev.emit('flipStart', { def });
  }

  grab(dir) {
    const a = this.air; if (!a || a.grab) return;
    const def = GRABS[dir] || GRABS[''];
    a.grab = { ...def, t: 0 };
    a.tricksCount++;
    this.ev.emit('grabStart', { def });
  }

  releaseGrab() {
    const a = this.air; if (!a || !a.grab) return;
    this.finishGrab();
  }

  finishGrab() {
    const a = this.air, g = a.grab;
    const pts = g.pts + Math.round(Math.max(0, g.t - 0.2) * 260);
    a.done = a.done || [];
    a.done.push({ name: g.name, pts });
    a.grab = null;
  }

  special(context, dir) {
    if (!this.specialReady()) return;
    if (context === 'air') {
      const a = this.air; if (!a) return;
      const def = SPECIALS.air.find((s) => s.dirs.includes(dir)) || SPECIALS.air[0];
      a.done = a.done || [];
      a.done.push({ name: def.name, pts: def.pts, special: true });
      if (def.flip) { a.flip = { name: def.name, roll: def.flip.roll, yaw: def.flip.yaw, dur: def.flip.dur, t: 0, special: true }; }
      if (def.pose) a.specialPose = { pose: def.pose, t: 0, dur: def.dur };
      if (def.spin) a.extraSpin = def.spin;
      a.tricksCount++;
      this.special = Math.max(0, this.special - 0.3);
      this.ev.emit('special', { name: def.name, pts: def.pts });
    } else if (context === 'grind' && this.grindItem) {
      const def = SPECIALS.grind[0];
      this.grindSpecial = true;
      this.add(def.name, def.pts, { kind: 'special' });
      this.special = Math.max(0, this.special - 0.3);
      this.ev.emit('special', { name: def.name, pts: def.pts });
    } else if (context === 'manual' && this.manualItem) {
      const def = SPECIALS.manual[0];
      this.add(def.name, def.pts, { kind: 'special' });
      this.special = Math.max(0, this.special - 0.3);
      this.ev.emit('special', { name: def.name, pts: def.pts });
    }
  }

  updateAir(dt) {
    const a = this.air; if (!a) return;
    a.t += dt;
    if (a.flip) {
      a.flip.t += dt;
      if (a.flip.t >= a.flip.dur) {
        if (!a.flip.special) { a.done = a.done || []; a.done.push({ name: a.flip.name, pts: a.flip.pts }); }
        a.flip = null;
      }
    }
    if (a.grab) a.grab.t += dt;
    if (a.specialPose) { a.specialPose.t += dt; if (a.specialPose.t > a.specialPose.dur) a.specialPose = null; }
  }

  // une figure de flip encore en cours à l'atterrissage = chute
  busy() {
    const a = this.air;
    return !!(a && a.flip && a.flip.t < a.flip.dur * 0.82);
  }

  land({ spin, vert, fakie, quality, airTime }) {
    const a = this.air; if (!a) return null;
    if (a.grab) this.finishGrab();
    if (a.flip && a.flip.t >= a.flip.dur * 0.82) { if (!a.flip.special) { a.done = a.done || []; a.done.push({ name: a.flip.name, pts: a.flip.pts }); } a.flip = null; }
    const done = a.done || [];
    let deg = Math.round(Math.abs(spin) / Math.PI) * 180;
    const label = deg >= 180 ? `${spin > 0 ? 'BS' : 'FS'} ${vert ? deg + 180 : deg}` : '';
    let added = 0;
    if (done.length) {
      done.forEach((d, i) => {
        const nm = i === 0 && label ? `${label} ${d.name}` : d.name;
        const p = d.pts + (i === 0 ? spinPoints(deg) : 0);
        this.add(nm, p, { kind: d.special ? 'special' : 'air' });
        added++;
      });
    } else if (deg >= 180) {
      this.add(vert ? `${label} Air` : `${label}`, spinPoints(deg) + (vert ? 50 : 0), { kind: 'air' });
      added++;
    } else if (vert && airTime > 0.45) {
      this.add('Air', 60, { kind: 'air' }); added++;
    } else if (airTime > 0.38 && a.reason === 'ollie' && !this.combo.items.length) {
      this.add(fakie ? 'Fakie Ollie' : 'Ollie', 30, { kind: 'air' }); added++;
    } else if (airTime > 0.38 && a.reason === 'ollie') {
      this.add('Ollie', 30, { kind: 'air' }); added++;
    }
    if (quality === 'perfect' && added) this.ev.emit('landing', { quality: 'perfect' });
    if (quality === 'sketchy' && added) this.ev.emit('landing', { quality: 'sketchy' });
    this.air = null;
    return { added };
  }

  // --- grinds -------------------------------------------------------------------------------------
  grindStart(rail, slide, dir) {
    const [name, pts] = (slide ? SLIDES : GRINDS)[dir] || (slide ? SLIDES[''] : GRINDS['']);
    const base = rail.kind === 'coping' ? (slide ? 'Lip ' : 'Coping ') : '';
    const full = (rail.kind === 'coping' && !slide ? 'Coping ' : '') + name;
    if (this.air) { // les tricks faits avant le grind comptent
      const a = this.air;
      if (a.grab) this.finishGrab();
      if (a.flip) a.flip = null;
      for (const d of a.done || []) this.add(d.name, d.pts, { kind: 'air' });
      this.air = null;
    }
    this.grindT = 0; this.grindBase = pts; this.grindSpecial = false;
    this.add(full, pts, { kind: 'grind' });
    this.grindItem = this.combo.items[this.combo.items.length - 1];
    this.grindName = full;
    void base;
  }

  updateGrind(dt) {
    if (this.grindItem == null) return;
    this.grindT += dt;
    this.live(this.grindItem, this.grindName, this.grindBase + Math.round(this.grindT * 160));
  }

  grindEnd(rail, covered) {
    this.stats.longestGrind = Math.max(this.stats.longestGrind, this.grindT || 0);
    this.grindItem = null; this.grindT = null;
  }

  // --- manuals ------------------------------------------------------------------------------------
  manualStart(nose) {
    this.manualT = 0;
    this.manualName = nose ? 'Nose Manual' : 'Manual';
    this.add(this.manualName, 100, { kind: 'manual' });
    this.manualItem = this.combo.items[this.combo.items.length - 1];
  }

  updateManual(dt) {
    if (!this.manualItem) return;
    this.manualT += dt;
    this.live(this.manualItem, this.manualName, 100 + Math.round(this.manualT * 120));
  }

  manualEnd() { this.manualItem = null; }

  // --- gaps, objets --------------------------------------------------------------------------------
  gap(g) {
    this.add(g.name, g.points, { kind: 'gap' });
    this.ev.emit('gap', { gap: g });
  }

  // --- fin de combo ---------------------------------------------------------------------------------
  bank() {
    const c = this.combo;
    if (!c.active || !c.items.length) { this.resetCombo(); this.emitCombo(); return 0; }
    const mult = c.items.length;
    const total = c.base * mult;
    if (this.enabled) this.score += total;
    this.bestCombo = Math.max(this.bestCombo, total);
    this.ev.emit('bank', { total, base: c.base, mult, items: c.items.slice(), score: this.score });
    this.resetCombo();
    this.emitCombo();
    return total;
  }

  bail(reason) {
    const c = this.combo;
    const lost = c.base * c.items.length;
    this.stats.bails++;
    this.air = null; this.grindItem = null; this.manualItem = null;
    this.special = 0;
    this.ev.emit('comboLost', { lost, reason });
    this.resetCombo();
    this.emitCombo();
  }

  // pour l'affichage de la planche
  boardTrick() {
    const a = this.air;
    if (!a) return null;
    return { flip: a.flip, grab: a.grab, specialPose: a.specialPose };
  }

  decay(dt) {
    if (!this.combo.active) this.special = Math.max(0, this.special - dt * 0.012);
  }
}
