// Moteur audio du jeu : WebAudio pur, aucun fichier son.
// Tout est synthétisé : SFX ponctuels, roulement/grind continus, boucle musicale.

const MUSIC_VOL = 0.3;
const SFX_VOL = 0.9;
const BPM = 95;
const STEP = 60 / BPM / 4; // durée d'une double croche
const AHEAD = 0.12;
const RATE_MIN = 0.04;
const RATE = { powerslide: 0.3 };

// Réglages du roulement par surface (fréquence, Q, volume, profondeur du grain)
const SURF = {
  concrete: { f: 700, q: 0.7, g: 1, lfo: 0.3 },
  ramp: { f: 480, q: 1.0, g: 0.9, lfo: 0.15 },
  bowl: { f: 900, q: 0.6, g: 0.8, lfo: 0.08 },
  deck: { f: 380, q: 1.3, g: 1, lfo: 0.45 },
  metal: { f: 2200, q: 3, g: 0.7, lfo: 0.2 },
  air: { f: 700, q: 0.7, g: 0, lfo: 0 },
};

// Boucle : 8 mesures, accords Em C G D Em C D D
const CHORDS = [[64, 67, 71], [60, 64, 67], [59, 62, 67], [62, 66, 69]];
const ROOTS = [40, 36, 43, 38];
const PROG = [0, 1, 2, 3, 0, 1, 3, 3];
const KICK_A = [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0];
const KICK_B = [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1];
const GHOST = [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1];
const BASS = [0, -1, -1, 0, -1, -1, 12, -1, -1, -1, 0, -1, -1, 7, -1, 12];

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this._muted = false;
    this._musicOn = true;
    this._paused = false;
    this._intTarget = 0;
    this._int = 0;
    this._timer = null;
    this._last = Object.create(null);
    this._grindOn = false;
    this._roll = { g: -1, f: -1, q: -1, lr: -1, ld: -1 };
    this._grind = { g: -1, f: -1 };
    this._var = new Int8Array(8).fill(-1);
  }

  // Création / reprise du contexte au premier geste utilisateur
  unlock() {
    try {
      if (this.ctx) {
        if (!this._paused && this.ctx.state === 'suspended') this.ctx.resume();
        return;
      }
      const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
      if (!AC) return;
      const c = (this.ctx = new AC());
      this.comp = c.createDynamicsCompressor();
      this.comp.threshold.value = -14;
      this.comp.ratio.value = 4;
      this.master = c.createGain();
      this.master.gain.value = this._muted ? 0 : 1;
      this.comp.connect(this.master);
      this.master.connect(c.destination);
      this.sfx = c.createGain();
      this.sfx.gain.value = SFX_VOL;
      this.sfx.connect(this.comp);
      this.music = c.createGain();
      this.music.gain.value = 0;
      this.music.connect(this.comp);
      // Bus batterie saturé légèrement pour le grain
      this.drums = c.createGain();
      const sh = c.createWaveShaper();
      const curve = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) curve[i] = Math.tanh((i / 511.5 - 1) * 2.2);
      sh.curve = curve;
      this.drums.connect(sh);
      sh.connect(this.music);
      this._buildNoise();
      this._buildRoll();
      this._buildGrind();
      if (this._musicOn) this._startMusic();
      if (c.state === 'suspended') c.resume();
    } catch (e) {
      this.ctx = null;
    }
  }

  get muted() {
    return this._muted;
  }

  setMuted(b) {
    this._muted = !!b;
    try {
      if (this.ctx) this.master.gain.setTargetAtTime(this._muted ? 0 : 1, this.ctx.currentTime, 0.03);
    } catch (e) {}
  }

  setMusic(b) {
    this._musicOn = !!b;
    try {
      if (!this.ctx) return;
      if (this._musicOn) this._startMusic();
      else this._stopMusic();
    } catch (e) {}
  }

  setIntensity(x) {
    this._intTarget = clamp01(+x || 0);
  }

  // Appelé à chaque frame : aucune allocation, on ne pousse que les changements
  setRoll(speed, surface) {
    try {
      if (!this.ctx) return;
      const s = SURF[surface] || SURF.concrete;
      const k = clamp01((speed || 0) / 18);
      const g = speed > 0.3 ? s.g * (0.08 + 0.32 * Math.sqrt(k)) : 0;
      const f = s.f * (0.6 + 0.9 * k);
      const r = this._roll, t = this.ctx.currentTime;
      if (Math.abs(g - r.g) > 0.004) { r.g = g; this.rollGain.gain.setTargetAtTime(g, t, 0.06); }
      if (Math.abs(f - r.f) > 8) { r.f = f; this.rollBp.frequency.setTargetAtTime(f, t, 0.08); }
      if (s.q !== r.q) { r.q = s.q; this.rollBp.Q.setTargetAtTime(s.q, t, 0.05); }
      const lr = 3 + (speed || 0) * 1.6, ld = g * s.lfo;
      if (Math.abs(lr - r.lr) > 0.3) { r.lr = lr; this.rollLfo.frequency.setTargetAtTime(lr, t, 0.1); }
      if (Math.abs(ld - r.ld) > 0.003) { r.ld = ld; this.rollLfoGain.gain.setTargetAtTime(ld, t, 0.06); }
    } catch (e) {}
  }

  setGrind(on, speed) {
    try {
      if (!this.ctx) return;
      on = !!on;
      if (on && !this._grindOn) this.play('bonk', { volume: 0.5 });
      this._grindOn = on;
      const k = clamp01((speed || 0) / 14);
      const g = on ? 0.14 + 0.12 * k : 0;
      const f = 1900 + 1400 * k;
      const r = this._grind, t = this.ctx.currentTime;
      if (Math.abs(g - r.g) > 0.004) { r.g = g; this.grindGain.gain.setTargetAtTime(g, t, on ? 0.02 : 0.06); }
      if (Math.abs(f - r.f) > 20) {
        r.f = f;
        this.grindBp.frequency.setTargetAtTime(f, t, 0.05);
        this.grindO1.frequency.setTargetAtTime(f * 0.71, t, 0.05);
        this.grindO2.frequency.setTargetAtTime(f * 1.07, t, 0.05);
      }
    } catch (e) {}
  }

  play(name, opts = {}) {
    try {
      const c = this.ctx;
      if (!c || this._paused) return;
      const fn = SFX[name];
      if (!fn) return;
      const now = typeof performance !== 'undefined' ? performance.now() / 1000 : Date.now() / 1000;
      const prev = this._last[name] || -1;
      if (now - prev < (RATE[name] || RATE_MIN)) return;
      this._last[name] = now;
      fn(this, c.currentTime + 0.005, opts || {}, opts && opts.volume != null ? clamp01(opts.volume) : 1);
    } catch (e) {}
  }

  pause() {
    this._paused = true;
    try {
      if (this.ctx) this.ctx.suspend();
    } catch (e) {}
  }

  resume() {
    this._paused = false;
    try {
      if (this.ctx) this.ctx.resume();
    } catch (e) {}
  }

  dispose() {
    try {
      this._stopMusic();
      if (this.ctx) this.ctx.close();
    } catch (e) {}
    this.ctx = null;
  }

  // ---- Construction ----

  _buildNoise() {
    const c = this.ctx, n = c.sampleRate * 2;
    this.white = c.createBuffer(1, n, c.sampleRate);
    this.brown = c.createBuffer(1, n, c.sampleRate);
    const w = this.white.getChannelData(0), b = this.brown.getChannelData(0);
    let last = 0;
    for (let i = 0; i < n; i++) {
      const r = Math.random() * 2 - 1;
      w[i] = r;
      last = (last + 0.02 * r) / 1.02;
      b[i] = last * 3.5;
    }
  }

  _loop(buf) {
    const s = this.ctx.createBufferSource();
    s.buffer = buf;
    s.loop = true;
    s.start();
    return s;
  }

  _buildRoll() {
    const c = this.ctx;
    this.rollSrc = this._loop(this.brown);
    const hiSrc = this._loop(this.white);
    const hiG = c.createGain();
    hiG.gain.value = 0.12;
    this.rollBp = c.createBiquadFilter();
    this.rollBp.type = 'bandpass';
    this.rollBp.frequency.value = 700;
    this.rollGain = c.createGain();
    this.rollGain.gain.value = 0;
    this.rollSrc.connect(this.rollBp);
    hiSrc.connect(hiG);
    hiG.connect(this.rollBp);
    this.rollBp.connect(this.rollGain);
    this.rollGain.connect(this.sfx);
    // LFO : grain des roues qui module le volume
    this.rollLfo = c.createOscillator();
    this.rollLfo.type = 'triangle';
    this.rollLfo.frequency.value = 5;
    this.rollLfoGain = c.createGain();
    this.rollLfoGain.gain.value = 0;
    this.rollLfo.connect(this.rollLfoGain);
    this.rollLfoGain.connect(this.rollGain.gain);
    this.rollLfo.start();
    this._cont = [this.rollSrc, hiSrc, this.rollLfo];
  }

  _buildGrind() {
    const c = this.ctx;
    const src = this._loop(this.white);
    this.grindBp = c.createBiquadFilter();
    this.grindBp.type = 'bandpass';
    this.grindBp.frequency.value = 2400;
    this.grindBp.Q.value = 5;
    this.grindO1 = c.createOscillator();
    this.grindO1.type = 'sawtooth';
    this.grindO2 = c.createOscillator();
    this.grindO2.type = 'square';
    const og = c.createGain();
    og.gain.value = 0.18;
    // Vibrato rapide pour le crissement
    const lfo = c.createOscillator();
    lfo.frequency.value = 17;
    const lg = c.createGain();
    lg.gain.value = 45;
    lfo.connect(lg);
    lg.connect(this.grindO1.detune);
    lg.connect(this.grindO2.detune);
    this.grindGain = c.createGain();
    this.grindGain.gain.value = 0;
    src.connect(this.grindBp);
    this.grindO1.connect(og);
    this.grindO2.connect(og);
    og.connect(this.grindBp);
    this.grindBp.connect(this.grindGain);
    this.grindGain.connect(this.sfx);
    this.grindO1.start();
    this.grindO2.start();
    lfo.start();
    this._cont.push(src, this.grindO1, this.grindO2, lfo);
  }

  // ---- Briques de synthèse ----

  _env(p, t, a, peak, dur) {
    p.setValueAtTime(0.0001, t);
    p.linearRampToValueAtTime(Math.max(0.0002, peak), t + a);
    p.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  // Oscillateur enveloppé, glissando optionnel vers f2
  _tone(dest, t, f, dur, gain, type = 'sine', f2 = 0, a = 0.003) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (f2 > 0) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    this._env(g.gain, t, a, gain, dur);
    o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + dur + 0.05);
    return o;
  }

  // Bruit filtré enveloppé, balayage optionnel du filtre vers f2
  _noise(dest, t, dur, gain, type = 'bandpass', f = 1000, q = 1, f2 = 0, buf = this.white, a = 0.002) {
    const c = this.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf;
    s.loop = true;
    fl.type = type;
    fl.frequency.setValueAtTime(f, t);
    if (f2 > 0) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    fl.Q.value = q;
    this._env(g.gain, t, a, gain, dur);
    s.connect(fl);
    fl.connect(g);
    g.connect(dest);
    s.start(t, Math.random() * 1.5);
    s.stop(t + dur + 0.05);
    return s;
  }

  // ---- Musique ----

  _startMusic() {
    if (!this.ctx || this._timer) return;
    const t = this.ctx.currentTime;
    this.music.gain.cancelScheduledValues(t);
    this.music.gain.setTargetAtTime(MUSIC_VOL, t, 0.4);
    this._next = t + 0.1;
    this._s = 0;
    this._timer = setInterval(() => this._tick(), 25);
  }

  _stopMusic() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
    if (this.ctx) this.music.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
  }

  _tick() {
    try {
      const c = this.ctx;
      if (!c || c.state !== 'running') return;
      const now = c.currentTime;
      if (this._next < now - 0.05) this._next = now + 0.02; // onglet throttlé
      while (this._next < now + AHEAD) {
        this._step(this._s, this._next);
        this._next += STEP;
        this._s = (this._s + 1) % 128;
      }
    } catch (e) {}
  }

  _step(s, t0) {
    const bar = (s >> 4) & 7, i = s & 15;
    if (s === 0) {
      // Nouvelle variation à chaque cycle de 8 mesures
      for (let b = 0; b < 8; b++) this._var[b] = Math.random() < 0.4 ? 2 + ((Math.random() * 12) | 0) : -1;
    }
    this._int += (this._intTarget - this._int) * 0.08;
    const it = this._int;
    const t = t0 + (i & 1 ? STEP * 0.12 : 0); // léger swing
    const d = this.drums, m = this.music;
    const fill = bar === 7 && i >= 12;
    const K = bar & 1 ? KICK_B : KICK_A;
    if (K[i] || this._var[bar] === i) this._kick(t);
    if (i === 4 || i === 12) this._snare(t, 1);
    else if (fill) this._snare(t, 0.35 + (i - 12) * 0.15);
    else if (GHOST[i] && Math.random() < 0.3) this._snare(t, 0.18);
    if (!(i & 1)) this._noise(d, t, 0.04, i & 3 ? 0.12 : 0.18, 'highpass', 7500, 0.7);
    if (i === 14 && (bar & 3) === 3) this._noise(d, t, 0.28, 0.13, 'highpass', 6500, 0.7);
    if (it > 0.05 && i & 1) this._noise(d, t, 0.03, 0.1 * it, 'highpass', 9000, 0.7);
    // Basse saw + square à travers un passe-bas
    const ch = PROG[bar], b = BASS[i];
    if (b >= 0 && !(fill && i > 12)) this._bass(t, mtof(ROOTS[ch] + b), STEP * (i === 0 ? 2.5 : 1.6));
    // Accords courts
    if (i === 6 || (i === 14 && bar & 1) || (i === 11 && bar === 3)) this._stab(t, CHORDS[ch]);
    // Couche « hype » : arpège lead
    if (it > 0.05 && !(i & 1)) {
      const notes = CHORDS[ch], n = notes[(i >> 1) % 3] + 12 + ((i >> 3) & 1) * 12;
      this._tone(m, t, mtof(n), STEP * 0.9, 0.07 * it, 'square');
    }
  }

  _kick(t) {
    const d = this.drums;
    this._tone(d, t, 150, 0.32, 0.95, 'sine', 42, 0.002);
    this._noise(d, t, 0.015, 0.25, 'lowpass', 3000, 0.7);
  }

  _snare(t, v) {
    const d = this.drums;
    this._noise(d, t, 0.18, 0.45 * v, 'bandpass', 1900, 0.6);
    this._tone(d, t, 200, 0.1, 0.35 * v, 'triangle', 150);
  }

  _bass(t, f, dur) {
    const c = this.ctx, lp = c.createBiquadFilter(), g = c.createGain();
    lp.type = 'lowpass';
    lp.Q.value = 6;
    lp.frequency.setValueAtTime(900, t);
    lp.frequency.exponentialRampToValueAtTime(220, t + dur);
    this._env(g.gain, t, 0.005, 0.32, dur);
    lp.connect(g);
    g.connect(this.music);
    const o1 = c.createOscillator(), o2 = c.createOscillator();
    o1.type = 'sawtooth';
    o2.type = 'square';
    o1.frequency.value = f;
    o2.frequency.value = f * 0.5;
    o1.connect(lp);
    o2.connect(lp);
    o1.start(t);
    o2.start(t);
    o1.stop(t + dur + 0.05);
    o2.stop(t + dur + 0.05);
  }

  _stab(t, notes) {
    const c = this.ctx, lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1700;
    lp.connect(this.music);
    for (let k = 0; k < 3; k++) {
      this._tone(lp, t, mtof(notes[k]), 0.16, 0.07, 'sawtooth');
      this._tone(lp, t, mtof(notes[k]) * 1.004, 0.16, 0.05, 'square');
    }
  }
}

// ---- Effets ponctuels : (moteur, temps, options, volume) ----
const SFX = {
  ollie(a, t, o, v) {
    const s = a.sfx;
    a._noise(s, t, 0.035, 0.7 * v, 'highpass', 2200, 0.8);
    a._tone(s, t, 950, 0.045, 0.25 * v, 'triangle', 420);
    a._tone(s, t + 0.005, 130, 0.14, 0.8 * v, 'sine', 48);
  },
  land(a, t, o, v) {
    const s = a.sfx, k = clamp01((+o.impact || 0) / 20) * 0.8 + 0.2;
    a._tone(s, t, 95, 0.12 + 0.12 * k, (0.35 + 0.6 * k) * v, 'sine', 38);
    a._noise(s, t, 0.1 + 0.06 * k, (0.25 + 0.45 * k) * v, 'lowpass', 1100, 0.8);
    a._noise(s, t, 0.04, 0.25 * k * v, 'bandpass', 3200, 1.2);
  },
  bonk(a, t, o, v) {
    const s = a.sfx;
    a._tone(s, t, 430, 0.13, 0.5 * v, 'triangle', 290);
    a._tone(s, t, 1350, 0.06, 0.12 * v, 'square', 1100);
    a._noise(s, t, 0.03, 0.2 * v, 'bandpass', 1600, 1.5);
  },
  flip(a, t, o, v) {
    a._noise(a.sfx, t, 0.16, 0.28 * v, 'bandpass', 600, 1.4, 3200, a.white, 0.04);
  },
  grab(a, t, o, v) {
    a._noise(a.sfx, t, 0.2, 0.2 * v, 'bandpass', 2600, 0.8, 1100, a.white, 0.05);
  },
  bail(a, t, o, v) {
    const s = a.sfx;
    a._noise(s, t, 0.45, 0.8 * v, 'lowpass', 2600, 0.7, 400);
    a._tone(s, t, 85, 0.4, 0.9 * v, 'sine', 30);
    for (let k = 0; k < 4; k++) {
      const tt = t + 0.08 + k * 0.09 + Math.random() * 0.05;
      a._tone(s, tt, 500 + Math.random() * 450, 0.07, (0.35 - k * 0.06) * v, 'triangle', 320);
    }
  },
  respawn(a, t, o, v) {
    const s = a.sfx;
    a._tone(s, t, 180, 0.5, 0.16 * v, 'sawtooth', 1700, 0.02);
    const q = a._tone(s, t, 300, 0.42, 0.1 * v, 'square');
    for (let k = 1; k < 8; k++) q.frequency.setValueAtTime(200 + Math.random() * 300 * k, t + k * 0.05);
    a._noise(s, t + 0.35, 0.12, 0.15 * v, 'highpass', 4000, 0.7);
  },
  letter(a, t, o, v) {
    [76, 79, 84, 88].forEach((n, k) => a._tone(a.sfx, t + k * 0.05, mtof(n), 0.1, 0.16 * v, 'square'));
  },
  cassette(a, t, o, v) {
    const s = a.sfx;
    const src = a._noise(s, t, 0.32, 0.3 * v, 'bandpass', 900, 2.5, 2800);
    src.playbackRate.setValueAtTime(0.5, t);
    src.playbackRate.linearRampToValueAtTime(2.5, t + 0.2);
    src.playbackRate.linearRampToValueAtTime(0.7, t + 0.32);
    a._tone(s, t + 0.3, 1318, 0.5, 0.18 * v, 'sine');
    a._tone(s, t + 0.36, 1976, 0.55, 0.14 * v, 'sine');
  },
  bank(a, t, o, v) {
    const s = a.sfx, total = Math.max(0, +o.total || 0);
    const n = 2 + Math.min(3, Math.floor(Math.log10(total + 1) - 1));
    const ch = [72, 76, 79, 84, 88];
    for (let k = 0; k < Math.max(2, n); k++) {
      a._tone(s, t + k * 0.035, mtof(ch[k]), 0.6, 0.12 * v, 'triangle');
      a._tone(s, t + k * 0.035, mtof(ch[k] + 12), 0.35, 0.04 * v, 'sine');
    }
    a._tone(s, t, 2100, 0.06, 0.08 * v, 'square');
    a._tone(s, t + 0.06, 2700, 0.1, 0.08 * v, 'square');
  },
  comboLost(a, t, o, v) {
    a._tone(a.sfx, t, 320, 0.26, 0.16 * v, 'sawtooth', 110);
    a._tone(a.sfx, t, 327, 0.26, 0.12 * v, 'square', 105);
  },
  special(a, t, o, v) {
    [60, 64, 67, 72].forEach((n, k) => {
      const f = mtof(n);
      a._tone(a.sfx, t + k * 0.04, f * 0.5, 0.75, 0.09 * v, 'sawtooth', f, 0.08);
    });
    a._noise(a.sfx, t, 0.6, 0.1 * v, 'bandpass', 500, 2, 6000, a.white, 0.3);
  },
  gap(a, t, o, v) {
    a._tone(a.sfx, t, 880, 0.11, 0.15 * v, 'square');
    a._tone(a.sfx, t + 0.09, 1318, 0.18, 0.15 * v, 'square');
  },
  countdown(a, t, o, v) {
    a._tone(a.sfx, t, 660, 0.14, 0.3 * v, 'sine');
  },
  go(a, t, o, v) {
    a._tone(a.sfx, t, 1320, 0.3, 0.32 * v, 'sine');
  },
  timeup(a, t, o, v) {
    [220, 277, 330].forEach((f) => a._tone(a.sfx, t, f, 0.85, 0.12 * v, 'sawtooth', f * 0.97, 0.03));
  },
  click(a, t, o, v) {
    a._tone(a.sfx, t, 1800, 0.025, 0.12 * v, 'triangle');
  },
  hover(a, t, o, v) {
    a._tone(a.sfx, t, 2400, 0.018, 0.035 * v, 'sine');
  },
  cone(a, t, o, v) {
    a._tone(a.sfx, t, 720, 0.09, 0.35 * v, 'triangle', 540);
    a._noise(a.sfx, t, 0.03, 0.15 * v, 'bandpass', 2000, 1.2);
  },
  powerslide(a, t, o, v) {
    a._noise(a.sfx, t, 0.32, 0.35 * v, 'bandpass', 1900, 2, 850, a.white, 0.02);
  },
  trick(a, t, o, v) {
    a._tone(a.sfx, t, 1600, 0.03, 0.08 * v, 'sine');
  },
};
