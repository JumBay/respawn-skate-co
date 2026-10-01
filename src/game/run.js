// Une session : run chronométré de 2 minutes (ou session libre), objectifs, lettres S-K-A-T-E,
// cassette cachée, gaps nommés, paliers de score, défi du jour, défi d'un ami (lien).
import * as THREE from 'three';
import { RUN_SECONDS } from '../config.js';
import { OBJECTIVES, TIERS } from './objectives.js';
import { rng } from '../world/textures.js';

const _v = new THREE.Vector3();

// Défi du jour : le même pour tout le monde, tiré de la date (UTC).
export function dailyChallenge(date = new Date()) {
  const key = date.toISOString().slice(0, 10);
  const seed = [...key].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const R = rng(seed);
  const kinds = [
    { id: 'score', make: () => ({ target: 20000 + Math.round(R() * 6) * 5000 }) },
    { id: 'combo', make: () => ({ target: 3000 + Math.round(R() * 5) * 1500 }) },
    { id: 'grind', make: () => ({ target: 4 + Math.round(R() * 6) }) },
    { id: 'flips', make: () => ({ target: 5 + Math.round(R() * 6), trick: ['Kickflip', 'Heelflip', 'Pop Shove-it', 'Tre Flip'][(R() * 4) | 0] }) },
    { id: 'gaps', make: () => ({ target: 2 + Math.round(R() * 2) }) },
  ];
  const k = kinds[(R() * kinds.length) | 0];
  return { key, kind: k.id, ...k.make() };
}

export function dailyLabel(d, lang) {
  const fr = lang !== 'en';
  switch (d.kind) {
    case 'score': return fr ? `Faire ${d.target.toLocaleString('fr-FR')} points en un run` : `Score ${d.target.toLocaleString('en-US')} in one run`;
    case 'combo': return fr ? `Un combo de ${d.target.toLocaleString('fr-FR')} points` : `Land a ${d.target.toLocaleString('en-US')} combo`;
    case 'grind': return fr ? `Grinder ${d.target} secondes au total` : `Grind for ${d.target} seconds in total`;
    case 'flips': return fr ? `Placer ${d.target} ${d.trick}` : `Land ${d.target} ${d.trick}s`;
    case 'gaps': return fr ? `Passer ${d.target} gaps différents` : `Clear ${d.target} different gaps`;
    default: return '';
  }
}

export class Run {
  constructor(game, events) {
    this.game = game;
    this.ev = events;
    this.mode = 'free';
    this.active = false;
    this.time = RUN_SECONDS;
    this.daily = dailyChallenge();
    this.reset();
    const E = events;
    E.on('takeoff', (e) => { this.takeoff = e.pos.clone(); this.airStart = performance.now(); });
    E.on('land', (e) => this.onLand(e));
    E.on('grindEnd', (e) => this.onGrindEnd(e));
    E.on('bank', (e) => this.onBank(e));
    E.on('trick', (e) => this.onTrick(e));
    E.on('bail', () => { this.stats.bails++; });
  }

  reset() {
    this.score = 0;
    this.letters = new Set();
    this.cassette = false;
    this.gapsDone = new Set();
    this.done = new Set();
    this.tiers = new Set();
    this.bestCombo = 0;
    this.stats = { bails: 0, grindTime: 0, flips: {}, tricks: 0 };
    this.dailyProgress = 0;
    this.dailyDone = false;
  }

  start(mode = 'run') {
    this.mode = mode;
    this.reset();
    this.time = RUN_SECONDS;
    this.active = true;
    this.ended = false;
    const g = this.game;
    g.park.resetProps();
    g.tricks.reset();
    g.tricks.enabled = true;
    g.spawn();
    this.ev.emit('runStart', { mode });
  }

  update(dt) {
    if (!this.active) return;
    const g = this.game, c = g.ctrl;
    if (this.mode === 'run' && !this.ended) {
      this.time -= dt;
      if (this.time <= 10 && Math.ceil(this.time) !== Math.ceil(this.time + dt)) this.ev.emit('tick', { left: Math.ceil(this.time) });
      if (this.time <= 0) { this.time = 0; this.finish(); }
    }
    // ramassage : lettres et cassette (le corps du skater, pas les pieds)
    _v.copy(c.pos); _v.y += 0.9;
    for (const col of g.park.collectibles) {
      if (col.taken) continue;
      if (_v.distanceTo(col.obj.position) < col.r + 0.35) {
        col.taken = true; col.obj.visible = false;
        if (col.kind === 'letter') {
          this.letters.add(col.ch);
          g.tricks.add(`Lettre ${col.ch}`, 250, { kind: 'gap', silent: true });
          this.ev.emit('letter', { ch: col.ch, all: this.letters.size === 5 });
          if (this.letters.size === 5) this.complete('skate');
        } else {
          this.cassette = true;
          g.tricks.add('Cassette cachée', 1500, { kind: 'gap', silent: true });
          this.ev.emit('cassette', {});
          this.complete('cassette');
        }
      }
    }
    if (c.state === 'grind') this.stats.grindTime += dt;
    if (this.daily.kind === 'grind') this.setDaily(this.stats.grindTime);
    this.score = g.tricks.score;
  }

  onLand(e) {
    const g = this.game;
    if (!this.takeoff) return;
    for (const gap of g.park.gaps) {
      if (gap.type === 'air' && gap.from(this.takeoff) && gap.to(e.pos)) this.gap(gap);
      if (gap.type === 'land' && gap.on(e.pos)) this.gap(gap);
    }
    if (e.airTime > 1.15 || (e.res && e.res.added >= 3)) this.ev.emit('bigAir', { airTime: e.airTime });
    this.takeoff = null;
  }

  onGrindEnd(e) {
    for (const gap of this.game.park.gaps) {
      if (gap.type === 'grind' && e.rail.name === gap.rail && e.covered >= gap.fraction) this.gap(gap);
    }
  }

  gap(gap) {
    this.game.tricks.gap(gap);
    if (!this.gapsDone.has(gap.id)) {
      this.gapsDone.add(gap.id);
      this.complete('gap');
      if (this.daily.kind === 'gaps') this.setDaily(this.gapsDone.size);
    }
  }

  onTrick(e) {
    this.stats.tricks++;
    if (this.daily.kind === 'flips' && e.name.endsWith(this.daily.trick)) this.setDaily(this.dailyProgress + 1);
  }

  onBank(e) {
    this.bestCombo = Math.max(this.bestCombo, e.total);
    if (e.total >= 10000) this.complete('combo-10k');
    for (const o of OBJECTIVES) if (o.type === 'score' && e.score >= o.value) this.complete(o.id);
    for (const t of TIERS) if (e.score >= t.score && !this.tiers.has(t.id)) { this.tiers.add(t.id); this.ev.emit('tierReached', { tier: t.id, score: e.score }); }
    if (this.daily.kind === 'score') this.setDaily(e.score);
    if (this.daily.kind === 'combo') this.setDaily(Math.max(this.dailyProgress, e.total));
    this.score = e.score;
  }

  setDaily(v) {
    this.dailyProgress = v;
    if (!this.dailyDone && v >= this.daily.target) { this.dailyDone = true; this.ev.emit('dailyDone', { daily: this.daily }); }
  }

  complete(id) {
    if (this.done.has(id)) return;
    this.done.add(id);
    this.ev.emit('objectiveUnlocked', { id });
  }

  finish() {
    if (this.ended) return;
    this.ended = true;
    // le combo en cours est encaissé à la sonnerie
    this.game.tricks.bank();
    this.score = this.game.tricks.score;
    this.ev.emit('runEnd', this.results());
  }

  results() {
    return {
      mode: this.mode, score: this.game.tricks.score, bestCombo: this.bestCombo, letters: [...this.letters], cassette: this.cassette,
      gaps: [...this.gapsDone], objectives: [...this.done], tiers: [...this.tiers], daily: { ...this.daily, done: this.dailyDone, progress: this.dailyProgress },
      stats: { ...this.stats },
    };
  }
}
