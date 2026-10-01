// Son synthétisé (WebAudio) : boucles de roulement / grind / vent, bruitages, et une musique
// générée (boucle hip-hop lo-fi : batterie, basse, nappes) planifiée à l'avance. Tout coupable.
export function createAudio({ muted = false, music = true } = {}) {
  let c = null, master, musicBus, noise, roll, grind, wind, sched = 0, nextBeat = 0, step = 0, musicOn = music, isMuted = muted, playing = false;
  function init() {
    if (c) return true;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    try { c = new AC(); } catch (e) { return false; }
    master = c.createGain(); master.gain.value = isMuted ? 0 : 0.8;
    const comp = c.createDynamicsCompressor(); master.connect(comp).connect(c.destination);
    musicBus = c.createGain(); musicBus.gain.value = musicOn ? 0.55 : 0; musicBus.connect(master);
    const len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    let b = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; b = (b + 0.02 * w) / 1.02; d[i] = w * 0.6 + b * 3; }
    noise = buf;
    const loop = (type, f, q) => { const s = c.createBufferSource(); s.buffer = buf; s.loop = true; const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = c.createGain(); g.gain.value = 0; s.connect(fl).connect(g).connect(master); s.start(); return { g, fl }; };
    roll = loop('bandpass', 380, 0.8); grind = loop('bandpass', 2900, 7); wind = loop('lowpass', 700, 0.4);
    return true;
  }
  function unlock() { if (init() && c.state === 'suspended') c.resume().catch(() => {}); }
  function loops(r, g, w) { if (!c) return; const t = c.currentTime; roll.g.gain.setTargetAtTime(r, t, 0.05); grind.g.gain.setTargetAtTime(g, t, 0.03); wind.g.gain.setTargetAtTime(w, t, 0.15); }
  function tone(f, dur, type, vol, f2, delay, bus) {
    if (!c) return; const t = c.currentTime + (delay || 0); const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || 0.2, t + 0.005); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(bus || master); o.start(t); o.stop(t + dur + 0.02);
  }
  function burst(dur, type, f, q, vol, f2, delay, bus) {
    if (!c) return; const t = c.currentTime + (delay || 0); const s = c.createBufferSource(); s.buffer = noise;
    const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q || 1;
    const g = c.createGain(); g.gain.setValueAtTime(vol || 0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); s.connect(fl).connect(g).connect(bus || master); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.02);
  }
  const SFX = {
    pop() { burst(0.07, 'highpass', 1800, 0.7, 0.55); tone(170, 0.09, 'sine', 0.35, 55); },
    land(p) { p = Math.max(0, Math.min(1, p)); tone(110, 0.16, 'sine', 0.25 + 0.3 * p, 38); burst(0.14, 'lowpass', 900, 0.7, 0.3 + 0.3 * p); },
    flip() { burst(0.2, 'bandpass', 700, 2, 0.18, 3200); },
    perfect() { tone(988, 0.12, 'triangle', 0.18); tone(1480, 0.22, 'triangle', 0.16, 0, 0.06); },
    bank(n) { const b = [523, 659, 784, 1047]; for (let i = 0; i < Math.min(4, 1 + ((n / 3) | 0)); i++) tone(b[i], 0.18, 'square', 0.06, 0, i * 0.055); },
    slow() { tone(70, 0.7, 'sine', 0.5, 40); burst(0.6, 'lowpass', 400, 0.5, 0.25, 120); },
    cone() { tone(620, 0.06, 'triangle', 0.25, 300); burst(0.05, 'bandpass', 1500, 3, 0.25); },
    bail() { burst(0.35, 'lowpass', 600, 0.6, 0.7, 150); tone(220, 0.4, 'sawtooth', 0.08, 60); },
    clack() { burst(0.03, 'bandpass', 2200, 4, 0.12); },
    ui() { tone(880, 0.05, 'triangle', 0.12, 1200); },
    buy() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.25, 'triangle', 0.14, 0, i * 0.07)); burst(0.5, 'highpass', 5000, 1, 0.08, 9000, 0.2); },
    grindIn() { burst(0.08, 'bandpass', 3200, 5, 0.35); tone(1900, 0.05, 'square', 0.04); },
    go() { tone(440, 0.12, 'square', 0.07); tone(880, 0.25, 'square', 0.07, 0, 0.12); },
    loot() { [1047, 1319, 1568].forEach((f, i) => tone(f, 0.16, 'triangle', 0.13, 0, i * 0.045)); },
    token() { [784, 1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.3, 'triangle', 0.13, 0, i * 0.06)); burst(0.6, 'highpass', 6000, 1, 0.1, 10000, 0.15); },
    boost() { tone(220, 0.5, 'sawtooth', 0.09, 880); burst(0.5, 'bandpass', 600, 1, 0.25, 4000); },
    magnet() { tone(300, 0.35, 'sine', 0.2, 600); tone(450, 0.35, 'sine', 0.12, 900, 0.05); },
    pause() { tone(660, 0.08, 'triangle', 0.1, 440); },
  };
  // --- musique : 96 BPM, Am - F - C - G, planification par anticipation
  const BPM = 96, SPB = 60 / BPM / 2; // croches
  const ROOTS = [57, 53, 48, 55]; // la, fa, do, sol (midi)
  const CH = [[0, 3, 7], [0, 4, 7], [0, 4, 7], [0, 4, 7]];
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function kick(t) { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18); g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.28); o.connect(g).connect(musicBus); o.start(t); o.stop(t + 0.3); }
  function nz(t, dur, f, vol, type) { const s = c.createBufferSource(); s.buffer = noise; const fl = c.createBiquadFilter(); fl.type = type || 'highpass'; fl.frequency.value = f; const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); s.connect(fl).connect(g).connect(musicBus); s.start(t, Math.random()); s.stop(t + dur + 0.02); }
  function note(t, m, dur, type, vol) { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = hz(m); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g).connect(musicBus); o.start(t); o.stop(t + dur + 0.05); }
  function schedule() {
    if (!c || !playing) return;
    while (nextBeat < c.currentTime + 0.25) {
      const t = nextBeat, s = step % 16, bar = Math.floor(step / 16) % 4, root = ROOTS[bar];
      if (s === 0 || s === 7 || s === 10) kick(t);
      if (s === 4 || s === 12) { nz(t, 0.16, 1400, 0.35, 'bandpass'); nz(t, 0.09, 4000, 0.15); }
      if (s % 2 === 0) nz(t, 0.04, 8000, s % 4 === 2 ? 0.09 : 0.05);
      if (s === 0 || s === 3 || s === 8 || s === 11 || s === 14) note(t, root - 24 + (s === 14 ? 7 : 0), SPB * 1.8, 'triangle', 0.32);
      if (s === 0) for (const iv of CH[bar]) note(t, root + iv, SPB * 14, 'sine', 0.05);
      if (s === 6 || s === 13) note(t, root + 12 + CH[bar][(step >> 4) % 3], SPB * 1.2, 'triangle', 0.04);
      nextBeat += SPB * (s % 2 === 0 ? 1.08 : 0.92); // léger swing
      step++;
    }
  }
  function startMusic() { if (!c || playing) return; playing = true; nextBeat = c.currentTime + 0.05; step = 0; clearInterval(sched); sched = setInterval(schedule, 60); }
  function stopMusic() { playing = false; clearInterval(sched); }
  return {
    unlock, loops, SFX: new Proxy(SFX, { get: (o, k) => (...a) => { if (c && !isMuted && o[k]) o[k](...a); } }),
    startMusic, stopMusic,
    setMuted(m) { isMuted = m; if (master) master.gain.value = m ? 0 : 0.8; },
    setMusic(on) { musicOn = on; if (musicBus) musicBus.gain.setTargetAtTime(on ? 0.55 : 0, c.currentTime, 0.1); },
    suspend() { if (c && c.state === 'running') c.suspend().catch(() => {}); },
    resume() { if (c && c.state === 'suspended') c.resume().catch(() => {}); },
    dispose() { stopMusic(); if (c) try { c.close(); } catch (e) { /* rien */ } c = null; },
    get muted() { return isMuted; }, get music() { return musicOn; },
  };
}
