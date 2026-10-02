// Moteur du run 2D : rendu Canvas 2D en couches, caméra, effets, entrées, fantôme, pilote auto.
// La physique et le score sont dans sim.js (pas fixe, déterministe) ; le parcours dans track.js.
import { drawRider, drawBoardSide, drawBoardPlan, drawIcon, drawBonus, rrect, fillOl, shade, INK, ACID, CONE, CRAIE, DISP, TAU, clamp } from './draw.js';
import { CAT, pieceOf, shortName } from './looks.js';
import { genTrack, groundAt as gAt, segIndexAt as segAt, railY, mulberry } from './track.js';
import { createSim, replayRun, tickOf, STEP, RUN_LEN, KMH } from './sim.js';
import { t } from './i18n.js';

export { RUN_LEN };
const lerp = (a, b, k) => a + (b - a) * k;
const sstep = (a, b, x) => { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
const easeOut = (x) => 1 - (1 - x) * (1 - x);
const GRAV = 2150;
export const trickLabel = (n) => String(n).replace(/(\d+)\|steps/g, (m, k) => t('steps', { n: k }));

export function createEngine(canvas, { audio, hooks = {}, autopilot = false } = {}) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const SFX = audio.SFX;
  let W = 0, H = 0, DPR = 1, BDPR = 1, S = 1;
  const BG = {};
  let TR = genTrack(1), SIM = createSim(TR), P = SIM.P, IN = SIM.IN, GHOST = null, ghostIn = null, ghostInfo = null, mainIn = null;
  const groundAt = (x) => gAt(TR, x), segIndexAt = (x) => segAt(TR, x);
  const G = { mode: 'scene', t: 0, ts: 1, slowT: 0, zoom: 1, shake: 0, shx: 0, shy: 0, cam: { x: 0, y: 0, s: 1 }, wipe: -1, wipeTo: null, big: null, hop: 0, paused: false,
    boostT: 0, magnetT: 0, acc: 0, scene: { rect: null }, hintI: 0 };
  const RP = { hip: { x: 0, y: 0 }, fb: { x: 0, y: 0 }, ff: { x: 0, y: 0 }, hb: { x: 0, y: 0 }, hf: { x: 0, y: 0 }, eb: 'down', ef: 'down', lean: 0, tilt: 0, board: { x: 0, y: 0, pitch: 0, roll: 0, yaw: 0, show: 1 }, pony: { x: 0, y: 0 }, blink: 0 };
  const parts = [], pops = [], coneFx = new Map();
  let look = null, ghostLook = null, rt = 0, raf = 0, last = 0, running = false, destroyed = false;
  const iconCache = new Map(), sprites = new Map();
  let spriteScale = 1;
  const queue = [], pend = [];

  // décor coûteux (textes néon, graffitis) peint une fois par palier d'échelle, puis copié
  function sprite(key, w, h, draw) {
    const q = Math.pow(2, Math.ceil(Math.log2(Math.max(0.25, spriteScale)) * 2) / 2), k = key + '@' + q;
    let c = sprites.get(k);
    if (!c) { if (sprites.size > 80) sprites.clear(); c = document.createElement('canvas'); c.width = Math.ceil(w * q); c.height = Math.ceil(h * q); const x = c.getContext('2d'); x.scale(q, q); x.translate(w / 2, h / 2); draw(x); sprites.set(k, c); }
    return c;
  }

  /* ------------------------------------------------------------ taille, fond */
  function resize() {
    const r = canvas.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    DPR = Math.min(window.devicePixelRatio || 1, 2); if (W * H * DPR * DPR > 5.2e6) DPR = Math.max(1, Math.sqrt(5.2e6 / (W * H)));
    BDPR = Math.min(DPR, 1.5);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    S = Math.min(H / 620, W / (H > W ? 560 : 980));
    buildBackdrop();
  }
  function mk(w, h, d) { d = d || BDPR; const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w * d)); c.height = Math.max(1, Math.ceil(h * d)); const x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); return [c, x]; }
  function pill(x, cx, cy, w, h) { x.beginPath(); x.moveTo(cx - w / 2 + h, cy - h / 2); x.lineTo(cx + w / 2 - h, cy - h / 2); x.arc(cx + w / 2 - h, cy, h / 2, -Math.PI / 2, Math.PI / 2); x.lineTo(cx - w / 2 + h, cy + h / 2); x.arc(cx - w / 2 + h, cy, h / 2, Math.PI / 2, Math.PI * 1.5); x.fill(); }
  function buildBackdrop() {
    const r = mulberry(11); let c, x, g;
    [c, x] = mk(W, H, 1); g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1F1438'); g.addColorStop(0.28, '#4A1E5C'); g.addColorStop(0.5, '#9C3460'); g.addColorStop(0.66, '#E25A4E'); g.addColorStop(0.8, '#FF9A52'); g.addColorStop(1, '#FFC874');
    x.fillStyle = g; x.fillRect(0, 0, W, H); BG.skyD = c;
    [c, x] = mk(W, H, 1); g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#05061A'); g.addColorStop(0.4, '#140F33'); g.addColorStop(0.7, '#2D1846'); g.addColorStop(1, '#5B2448'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) { const sx = r() * W, sy = r() * H * 0.55; x.fillStyle = 'rgba(243,240,232,' + (0.25 + r() * 0.6).toFixed(2) + ')'; const s = r() < 0.08 ? 2 : 1.2; x.fillRect(sx, sy, s, s); }
    BG.skyN = c;
    const R = Math.round(110 * S); [c, x] = mk(R * 5, R * 5); const cx = R * 2.5;
    g = x.createRadialGradient(cx, cx, R * 0.6, cx, cx, R * 2.5); g.addColorStop(0, 'rgba(255,190,120,.55)'); g.addColorStop(1, 'rgba(255,140,80,0)'); x.fillStyle = g; x.fillRect(0, 0, R * 5, R * 5);
    g = x.createLinearGradient(0, cx - R, 0, cx + R); g.addColorStop(0, '#FFF4C2'); g.addColorStop(0.6, '#FFC067'); g.addColorStop(1, '#FF7A45'); x.fillStyle = g; x.beginPath(); x.arc(cx, cx, R, 0, TAU); x.fill();
    x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 6; i++) x.fillRect(0, cx + R * (0.12 + i * 0.15), R * 5, R * (0.025 + i * 0.016)); x.globalCompositeOperation = 'source-over';
    BG.sun = c; BG.sunR = R;
    const TW = Math.ceil(Math.max(W, 1100) * 1.3); BG.TW = TW;
    [c, x] = mk(TW, H * 0.6);
    for (let i = 0; i < 9; i++) { const cxp = r() * TW, cy = H * (0.08 + r() * 0.38), w = (160 + r() * 320) * S, h = (10 + r() * 14) * S;
      for (const off of [0, -TW, TW]) { g = x.createLinearGradient(0, cy - h, 0, cy + h); g.addColorStop(0, 'rgba(255,170,140,.55)'); g.addColorStop(1, 'rgba(150,60,110,.35)'); x.fillStyle = g; pill(x, cxp + off, cy, w, h); pill(x, cxp + off + w * 0.25, cy - h * 0.7, w * 0.5, h * 0.8); } }
    BG.clouds = c;
    BG.far = cityTile(TW, r, { minH: 110, maxH: 300, minW: 44, maxW: 120, col1: '#9A4776', col2: '#C8607A', win: 'rgba(255,214,150,.45)', winP: 0.05, base: 420, detail: 0 });
    BG.mid = cityTile(TW, r, { minH: 150, maxH: 360, minW: 70, maxW: 170, col1: '#40204F', col2: '#56285E', base: 470, detail: 1, glow: true });
    BG.near = nearTile(TW, r);
    [c, x] = mk(W / 4, H / 4, 1); g = x.createRadialGradient(W / 8, H / 8, Math.min(W, H) / 12, W / 8, H / 8, Math.max(W, H) / 5.2);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(6,4,14,.55)'); x.fillStyle = g; x.fillRect(0, 0, W / 4, H / 4); BG.vig = c;
    iconCache.clear();
  }
  function cityTile(TW, r, o) {
    const u = S, Ht = o.base * u, base = Ht - 60 * u; const [c, x] = mk(TW, Ht); const [gc, gx] = o.glow ? mk(TW, Ht) : [null, null];
    let px = -20 * u; const blds = [];
    while (px < TW) { const w = (o.minW + r() * (o.maxW - o.minW)) * u, h = (o.minH + r() * (o.maxH - o.minH)) * u; blds.push({ x: px, w, h }); px += w * (0.86 + r() * 0.2); }
    const g = x.createLinearGradient(0, base - o.maxH * u, 0, base); g.addColorStop(0, o.col1); g.addColorStop(1, o.col2);
    for (const b of blds) for (const off of [0, -TW]) {
      const X = b.x + off, Y = base - b.h; x.fillStyle = g; x.fillRect(X, Y, b.w, b.h + 70 * u);
      if (o.detail) { x.fillStyle = o.col1;
        if (r() < 0.45) { const tw = 14 * u, tx = X + b.w * (0.2 + r() * 0.5); x.fillRect(tx, Y - 26 * u, tw, 20 * u); x.fillRect(tx - 2 * u, Y - 30 * u, tw + 4 * u, 5 * u); x.fillRect(tx + 2 * u, Y - 6 * u, 2 * u, 6 * u); x.fillRect(tx + tw - 4 * u, Y - 6 * u, 2 * u, 6 * u); }
        if (r() < 0.5) x.fillRect(X + b.w * 0.7, Y - 10 * u, 18 * u, 10 * u);
        if (r() < 0.3) x.fillRect(X + b.w * 0.4, Y - 48 * u, 2 * u, 48 * u);
        x.fillStyle = 'rgba(255,255,255,.035)'; x.fillRect(X, Y, 4 * u, b.h); }
      if (o.win) { x.fillStyle = o.win; for (let wy = Y + 10 * u; wy < base - 8 * u; wy += 13 * u) for (let wx = X + 6 * u; wx < X + b.w - 8 * u; wx += 11 * u) if (r() < o.winP) x.fillRect(wx, wy, 4 * u, 6 * u); }
      if (gx) for (let wy = Y + 16 * u; wy < base - 12 * u; wy += 19 * u) for (let wx = X + 9 * u; wx < X + b.w - 12 * u; wx += 15 * u) if (r() < 0.07) { gx.fillStyle = r() < 0.8 ? 'rgba(255,196,110,.85)' : 'rgba(140,240,255,.7)'; gx.fillRect(wx, wy, 6 * u, 9 * u); }
    }
    let signX = 0;
    if (gx) {
      const b = blds[Math.floor(blds.length * 0.35)] || blds[0]; signX = b.x + b.w * 0.5;
      neonSign(x, gx, signX, base - b.h - 20 * u, u, 'RESPAWN', ACID, 34);
      const b2 = blds[Math.floor(blds.length * 0.78)] || blds[1]; neonV(x, gx, b2.x + b2.w - 14 * u, base - b2.h + 40 * u, u, 'SKATE', CONE);
      const b3 = blds[Math.floor(blds.length * 0.12)] || blds[0]; neonSign(x, gx, b3.x + b3.w * 0.5, base - b3.h - 16 * u, u, '24/7', CRAIE, 20);
    }
    return { c, gc, h: Ht, base, signX };
  }
  function neonSign(x, gx, cx, by, u, txt, col, size) {
    const fs = size * u; gx.font = fs + 'px ' + DISP; const w = gx.measureText(txt).width;
    x.fillStyle = '#2A1733'; x.fillRect(cx - w / 2 - 8 * u, by - fs * 0.95, w + 16 * u, fs * 1.1); x.fillRect(cx - w / 2, by, 3 * u, 20 * u); x.fillRect(cx + w / 2 - 3 * u, by, 3 * u, 20 * u);
    gx.save(); gx.textAlign = 'center'; gx.shadowColor = col; gx.shadowBlur = 18 * u; gx.fillStyle = col; gx.fillText(txt, cx, by - fs * 0.12);
    gx.shadowBlur = 6 * u; gx.fillText(txt, cx, by - fs * 0.12); gx.shadowBlur = 0; gx.fillStyle = 'rgba(255,255,255,.55)'; gx.globalAlpha = 0.5; gx.fillText(txt, cx, by - fs * 0.12); gx.restore();
  }
  function neonV(x, gx, cx, ty, u, txt, col) {
    const fs = 18 * u; x.fillStyle = '#2A1733'; x.fillRect(cx - 12 * u, ty - 4 * u, 24 * u, txt.length * fs * 0.95 + 8 * u);
    gx.save(); gx.font = fs + 'px ' + DISP; gx.textAlign = 'center'; gx.shadowColor = col; gx.shadowBlur = 14 * u; gx.fillStyle = col;
    for (let i = 0; i < txt.length; i++) gx.fillText(txt[i], cx, ty + fs * 0.85 + i * fs * 0.95); gx.restore();
  }
  function nearTile(TW, r) {
    const u = S, Ht = 340 * u, base = Ht - 50 * u; const [c, x] = mk(TW, Ht); const [gc, gx] = mk(TW, Ht);
    const col = '#22142C'; x.fillStyle = col; x.fillRect(0, base, TW, 60 * u);
    const items = []; let px = 0; while (px < TW - 60 * u) { items.push({ x: px, t: r() }); px += (90 + r() * 170) * u; }
    for (const it of items) for (const off of [0, -TW, TW]) {
      const X = it.x + off; if (X < -300 * u || X > TW + 300 * u) continue;
      if (it.t < 0.42) { const h = (120 + it.t * 260) * u; x.fillStyle = col; x.fillRect(X - 4 * u, base - h * 0.55, 8 * u, h * 0.55);
        for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU, rr = (26 + ((k * 37) % 17)) * u; x.beginPath(); x.arc(X + Math.cos(a) * 22 * u, base - h * 0.62 + Math.sin(a) * 16 * u - 10 * u, rr, 0, TAU); x.fill(); }
        x.beginPath(); x.arc(X, base - h * 0.78, 32 * u, 0, TAU); x.fill();
      } else if (it.t < 0.7) { const h = 230 * u; x.fillStyle = col; x.fillRect(X - 2.5 * u, base - h, 5 * u, h); x.fillRect(X - 2.5 * u, base - h, 30 * u, 4 * u); x.fillRect(X + 20 * u, base - h - 2 * u, 16 * u, 8 * u);
        const g = gx.createRadialGradient(X + 28 * u, base - h + 6 * u, 0, X + 28 * u, base - h + 6 * u, 70 * u); g.addColorStop(0, 'rgba(255,214,140,.9)'); g.addColorStop(0.12, 'rgba(255,190,110,.45)'); g.addColorStop(1, 'rgba(255,170,90,0)');
        gx.fillStyle = g; gx.fillRect(X - 50 * u, base - h - 70 * u, 160 * u, 140 * u);
        gx.fillStyle = 'rgba(255,200,120,.08)'; gx.beginPath(); gx.moveTo(X + 22 * u, base - h + 6 * u); gx.lineTo(X + 34 * u, base - h + 6 * u); gx.lineTo(X + 90 * u, base); gx.lineTo(X - 34 * u, base); gx.fill();
      } else if (it.t < 0.85) { const w = 110 * u, h = 70 * u; x.fillStyle = col; x.beginPath(); x.moveTo(X, base); x.quadraticCurveTo(X + w * 0.9, base, X + w, base - h); x.lineTo(X + w + 8 * u, base - h); x.lineTo(X + w + 8 * u, base); x.fill();
        x.fillRect(X + w, base - h - 14 * u, 2 * u, 14 * u); x.fillRect(X + w - 2 * u, base - h - 14 * u, 14 * u, 2 * u);
      } else { const w = 180 * u, h = 60 * u; x.strokeStyle = col; x.lineWidth = 1.2 * u; x.globalAlpha = 0.8; x.beginPath();
        for (let k = 0; k <= w; k += 9 * u) { x.moveTo(X + k, base); x.lineTo(X + k + h * 0.5, base - h); x.moveTo(X + k + h * 0.5, base); x.lineTo(X + k, base - h); } x.stroke(); x.globalAlpha = 1;
        x.fillStyle = col; for (let k = 0; k <= w; k += 60 * u) x.fillRect(X + k, base - h - 4 * u, 4 * u, h + 4 * u); x.fillRect(X, base - h - 4 * u, w, 3 * u); }
    }
    return { c, gc, h: Ht, base };
  }


  /* ------------------------------------------------------------ entrées (file appliquée au pas suivant) */
  const KEYDIR = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd', KeyA: 'l', KeyD: 'r', KeyW: 'u', KeyS: 'd', KeyQ: 'l', KeyZ: 'u' };
  const PT = { down: false, tx: 0, ty: 0, swiped: null };
  const push = (k, down) => { if (G.mode === 'run' && !G.paused) queue.push({ k, down }); };
  function onKeyDown(e) {
    if (G.mode !== 'run' || G.paused) return false;
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); if (!e.repeat) { audio.unlock(); push('a', true); } return true; }
    const d = KEYDIR[e.code]; if (d) { e.preventDefault(); if (!e.repeat) push(d, true); return true; }
    return false;
  }
  function onKeyUp(e) {
    if (e.code === 'Space' || e.code === 'Enter') { if (G.mode === 'run') { e.preventDefault(); push('a', false); } }
    const d = KEYDIR[e.code]; if (d) push(d, false);
  }
  const onPDown = (e) => { if (G.mode !== 'run' || G.paused) return; e.preventDefault(); try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* rien */ } audio.unlock();
    PT.down = true; PT.tx = e.clientX; PT.ty = e.clientY; PT.swiped = null; push('a', true); };
  const onPMove = (e) => { if (!PT.down || G.mode !== 'run') return; const dx = e.clientX - PT.tx, dy = e.clientY - PT.ty;
    if (!PT.swiped && Math.hypot(dx, dy) > 26) { PT.swiped = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'l' : 'r') : dy < 0 ? 'u' : 'd'; push(PT.swiped, true); } };
  const onPUp = () => { if (!PT.down) return; PT.down = false; if (PT.swiped) push(PT.swiped, false); push('a', false); };
  canvas.addEventListener('pointerdown', onPDown); canvas.addEventListener('pointermove', onPMove); canvas.addEventListener('pointerup', onPUp); canvas.addEventListener('pointercancel', onPUp);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  function releaseAll() { if (IN.down) queue.push({ k: 'a', down: false }); for (const d of ['l', 'r', 'u', 'd']) if (IN.dir[d]) queue.push({ k: d, down: false }); PT.down = false; }

  /* ------------------------------------------------------------ effets (joueur réel seulement) */
  function part(o) { if (parts.length > 260) parts.shift(); parts.push(o); }
  function popup(text, x, y, col, size, life, sub) { pops.push({ text, x, y, col: col || CRAIE, size: size || 26, t: 0, life: life || 1.1, sub }); }
  function bigText(text, col, sub, life) { G.big = { text, col: col || ACID, sub, t: 0, life: life || 1.2 }; }
  const dust = (x, y, n, vx) => { for (let i = 0; i < n; i++) part({ x: x + (Math.random() - 0.5) * 70, y, vx: (Math.random() - 0.5) * 360 + (vx || 0) * 0.15, vy: -Math.random() * 160, life: 0.5 + Math.random() * 0.3, t: 0, k: 'dust', s: 7 + Math.random() * 10 }); };
  const stars = (x, y, n, c) => { for (let i = 0; i < n; i++) part({ x, y, vx: (Math.random() - 0.5) * 600, vy: (Math.random() - 0.5) * 600, life: 0.6, t: 0, k: 'star', c: c || ACID }); };
  const fx = {
    trick(name, pts, x, y) { popup(trickLabel(name).toUpperCase(), x + 10, y - 175, CRAIE, 24, 1, '+' + pts); },
    slowmo(m) { G.slowT = 0.55; SFX.slow(); bigText(t('combo') + ' ×' + m, ACID, '', 1.1); G.shake = Math.max(G.shake, 7);
      for (let i = 0; i < 34; i++) part({ x: P.x, y: P.y - 80, vx: (Math.random() - 0.5) * 900, vy: -200 - Math.random() * 700, life: 1.2, t: 0, k: 'conf', c: [ACID, CONE, CRAIE][i % 3], s: 4 + Math.random() * 4, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 20 }); },
    combo(v, extra) { if (hooks.onCombo) hooks.onCombo(v ? { ...v, names: v.names.map(trickLabel) } : null, extra); },
    bank(total, mult, x, y) { if (mult > 1) { SFX.bank(mult); popup('+' + total, x + 40, y - 230, ACID, 30, 1.2); } },
    pop(x, y) { SFX.pop(); for (let i = 0; i < 6; i++) part({ x: x - 30, y, vx: -200 - Math.random() * 200, vy: -Math.random() * 120, life: 0.45, t: 0, k: 'dust', s: 8 + Math.random() * 8 }); },
    flip() { SFX.flip(); },
    grindIn(x, y) { SFX.grindIn(); G.shake = Math.max(G.shake, 2.5); for (let i = 0; i < 10; i++) part({ x, y, vx: (Math.random() - 0.3) * 500, vy: -Math.random() * 400, life: 0.35, t: 0, k: 'spark' }); },
    sparks(x, y, d, vx) { if (Math.random() < 0.5) return; for (let i = 0; i < 2; i++) part({ x: x + (d === 'l' ? -28 : d === 'r' ? 26 : 0) + (Math.random() - 0.5) * 20, y: y - 2, vx: -vx * 0.5 - Math.random() * 260, vy: -60 - Math.random() * 360, life: 0.28 + Math.random() * 0.25, t: 0, k: 'spark' }); },
    grade(g, x, y) {
      if (g === 'perfect') { SFX.perfect(); popup(t('perfect'), x, y - 120, ACID, 34, 1); for (let i = 0; i < 14; i++) part({ x: x + (Math.random() - 0.5) * 60, y, vx: (Math.random() - 0.5) * 300, vy: -100 - Math.random() * 300, life: 0.6, t: 0, k: 'star', c: ACID }); }
      else if (g === 'limite') popup(t('sketchy'), x, y - 120, CONE, 24, 0.8); else if (g === 'rattrape') popup(t('caught'), x, y - 120, CONE, 24, 0.8); else popup(t('good'), x, y - 120, CRAIE, 20, 0.7);
    },
    land(pw, x, y, vx) { SFX.land(pw); G.shake = Math.max(G.shake, 2 + pw * 5); dust(x, y, 12, vx); },
    bail(x, y) { SFX.bail(); G.shake = 10; popup(t('ouch'), x, y - 170, CONE, 34, 0.9); if (hooks.onBail) hooks.onBail(); },
    respawn(x, y) { bigText(t('respawn'), ACID, t('respawnSub'), 1.1); SFX.go(); stars(x, y - 60, 24); },
    kickPop() { SFX.pop(); G.shake = 4; },
    clack() { SFX.clack(); },
    cone(c, vx) { coneFx.set(c, { x: c.x, y: c.y, vx: vx * 0.8 + 200, vy: -480 - Math.random() * 200, rot: 0, vr: 10 + Math.random() * 10, hit: 1 }); SFX.cone(); G.shake = Math.max(G.shake, 3); popup('TOC !', c.x, c.y - 60, CONE, 20, 0.6); },
    dropSpawn(d) { bigText('DROP', CONE, t('dropSub'), 1.4); SFX.boost(); if (hooks.onCollect) hooks.onCollect('dropSpawn', d); },
    collect(it, S) {
      if (it.k === 'coin') { SFX.coin(); for (let i = 0; i < 5; i++) part({ x: it.x, y: it.y, vx: (Math.random() - 0.5) * 260, vy: (Math.random() - 0.5) * 260, life: 0.35, t: 0, k: 'star', c: '#FFD54A' }); }
      else if (it.k === 'letter') { SFX.loot(); const w = 'SKATE'.split('').map((ch) => (S.letters.includes(ch) ? ch : '_')).join(' '); bigText(w, ACID, S.letters.length === 5 ? t('skateDone') : '', 1.3); stars(it.x, it.y, 20); }
      else if (it.k === 'cassette') { SFX.token(); bigText(t('cassette'), '#B9A6FF', '', 1.3); stars(it.x, it.y, 26, '#B9A6FF'); }
      else if (it.k === 'boost') { SFX.boost(); bigText(t('boost'), CONE, '', 0.8); G.shake = 4; }
      else if (it.k === 'magnet') { SFX.magnet(); bigText(t('magnet'), '#B9A6FF', '', 0.8); }
      else if (it.k === 'drop') { SFX.token(); const p = CAT.byId.get(it.id); bigText(t('dropCaught'), '#FFD54A', p ? shortName(p) : '', 1.6); G.shake = 8; stars(it.x, it.y, 40, '#FFD54A'); }
      if (hooks.onCollect) hooks.onCollect(it.k, it, S);
    },
    timeUp() { bigText(t('timeUp'), CONE, '', 1.3); releaseAll(); },
    done(res) { G.mode = 'end'; if (hooks.onEnd) hooks.onEnd(res); },
  };

  /* ------------------------------------------------------------ pose */
  function computePose(time, p = P, inp = IN) {
    const o = RP, c = p.crouch;
    let hipY = -63 + 20 * c, hipX = 1 + 3 * c, lean = 0.05 + 0.16 * c;
    const b = o.board; b.x = 0; b.y = 0; b.pitch = 0; b.roll = 0; b.yaw = 0; b.show = 1;
    let fbx = -24, ffx = 22, fby = 0, ffy = 0, attached = 1;
    const sw = Math.sin(time * 2.6) * 3;
    let hb = { x: -40, y: -76 + sw }, hf = { x: 39, y: -72 - sw }, eb = 'down', ef = 'down', tilt = 0;
    if (p.state === 'ride' && p.landT < 0.28) hipY += 6 * (1 - p.landT / 0.28);
    if (p.state === 'ride' && inp.down) { hb = { x: -34, y: -60 }; hf = { x: 36, y: -56 }; }
    if (p.state === 'air') {
      const pp = clamp(p.popT / 0.34, 0, 1); b.pitch = p.popT < 0.34 ? -0.6 * Math.sin(Math.PI * pp) : 0;
      hipY = -48; lean = 0.1; hb = { x: -44, y: -100 + sw }; hf = { x: 44, y: -96 - sw }; tilt = -0.06;
      if (p.popT < 0.12) { hipY = -62; lean = 0.02; }
      if (p.flip) { const u = clamp(p.flip.t / p.flip.dur, 0, 1), e = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u);
        b.roll = p.flip.f.roll * TAU * e; b.yaw = p.flip.f.yaw * TAU * e; b.y = Math.sin(Math.PI * u) * 9; b.pitch = 0; attached = 0;
        fbx = -27; ffx = 25; fby = -4 - 6 * Math.sin(Math.PI * u); ffy = -5 - 6 * Math.sin(Math.PI * u); hb = { x: -48, y: -108 }; hf = { x: 46, y: -104 }; }
      if (p.grab) { hipY = -38; b.y = -6; b.pitch = -0.14; lean = 0.18; const g = p.grab.name;
        if (g === 'Melon' || g === 'Stalefish') { hb = { x: -10, y: -2 }; eb = 'out'; hf = { x: 46, y: -106 }; } else { hf = { x: 8, y: -2 }; ef = 'out'; hb = { x: -46, y: -106 }; } tilt = 0.1; }
    }
    if (p.state === 'grind') {
      const d = p.grind.d; hb = { x: -50, y: -86 + sw * 0.6 }; hf = { x: 48, y: -88 - sw * 0.6 }; hipY = -52;
      if (d === 'l') b.pitch = -0.2; else if (d === 'r') { b.pitch = 0.18; lean = 0.22; }
      else if (d === 'd') { b.yaw = Math.PI / 2; b.roll = 0.42; fbx = -10; ffx = 9; lean = -0.06; hipY = -50; hb = { x: -52, y: -96 }; hf = { x: 52, y: -70 }; }
      else if (d === 'u') { b.pitch = 0.1; b.yaw = 0.5; }
    }
    if (attached) { const cp = Math.cos(b.pitch), spn = Math.sin(b.pitch), ys = b.yaw === Math.PI / 2 ? 1 : Math.max(0.45, Math.abs(Math.cos(b.yaw)));
      const tx = (v) => b.x + v * ys * cp, ty = (v) => b.y + v * ys * spn; fby = ty(fbx); ffy = ty(ffx); fbx = tx(fbx); ffx = tx(ffx); }
    o.hip.x = hipX; o.hip.y = hipY; o.lean = lean; o.fb.x = fbx; o.fb.y = fby; o.ff.x = ffx; o.ff.y = ffy; o.hb = hb; o.hf = hf; o.eb = eb; o.ef = ef; o.tilt = tilt;
    o.pony.x = -(p.vx / 600) * 3; o.pony.y = p.ponyY; o.shoeAng = attached ? b.pitch : 0; o.blink = time % 3.7 < 0.12 ? 1 : 0; o.smile = p.state !== 'bail';
    return o;
  }
  function standPose(time) {
    const o = RP, br = Math.sin(time * 2);
    o.hip.x = 0; o.hip.y = -75 + br * 0.5; o.lean = -0.02; o.fb.x = -17; o.fb.y = 0; o.ff.x = 17; o.ff.y = 0;
    o.hb = { x: -22, y: -68 + br }; o.eb = 'out'; o.hf = { x: 43, y: -106 }; o.ef = 'down'; o.tilt = Math.sin(time * 0.7) * 0.04; o.shoeAng = 0;
    o.board.show = 0; o.pony.x = Math.sin(time * 1.3) * 2; o.pony.y = Math.sin(time * 2.1) * 2; o.blink = time % 4.1 < 0.12 ? 1 : 0; o.smile = true;
    return o;
  }

  /* ------------------------------------------------------------ rendu */
  const night = () => (G.mode === 'run' || G.mode === 'end' ? 0.1 + 0.8 * sstep(0, 1, G.t / RUN_LEN) : 0.42);
  function drawBackdrop(camX, camY, nt) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.drawImage(BG.skyD, 0, 0, W, H);
    const R = BG.sunR, sunY = H * (0.5 + 0.28 * nt); ctx.globalAlpha = 1 - nt * 0.6; ctx.drawImage(BG.sun, W * 0.64 - R * 2.5, sunY - R * 2.5, R * 5, R * 5); ctx.globalAlpha = 1;
    if (nt > 0) { ctx.globalAlpha = sstep(0.05, 0.9, nt); ctx.drawImage(BG.skyN, 0, 0, W, H); ctx.globalAlpha = 1; }
    const TW = BG.TW, dy = camY + (0.7 * H) / S;
    const tile = (img, h, fx, base, fy) => { const y = base - h - clamp(dy * S * fy, -H * 0.25, H * 0.4); let x = -((camX * S * fx) % TW); if (x > 0) x -= TW; for (; x < W; x += TW) ctx.drawImage(img, x, y, TW, h); };
    ctx.globalAlpha = 0.8; tile(BG.clouds, H * 0.6, 0.015, H * 0.6, 0.01); ctx.globalAlpha = 1;
    const gl = H * 0.72;
    tile(BG.far.c, BG.far.h, 0.05, gl + 40 * S, 0.03);
    tile(BG.mid.c, BG.mid.h, 0.16, gl + 70 * S, 0.1);
    ctx.fillStyle = 'rgba(12,8,30,' + (nt * 0.42).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.55 + 0.45 * nt; tile(BG.mid.gc, BG.mid.h, 0.16, gl + 70 * S, 0.1); ctx.globalAlpha = 1;
    tile(BG.near.c, BG.near.h, 0.42, gl + 110 * S, 0.3);
    { const nb = gl + 110 * S - clamp(dy * S * 0.3, -H * 0.25, H * 0.4) - 2; if (nb < H) { ctx.fillStyle = '#22142C'; ctx.fillRect(0, nb, W, H - nb); } }
    ctx.globalAlpha = 0.3 + 0.7 * nt; tile(BG.near.gc, BG.near.h, 0.42, gl + 110 * S, 0.3); ctx.globalAlpha = 1;
  }
  const worldXf = (cam) => ctx.setTransform(DPR * cam.s, 0, 0, DPR * cam.s, DPR * (-cam.x * cam.s + G.shx), DPR * (-cam.y * cam.s + G.shy));
  const GRAFS = [{ t: 'RIDE', a: '#C8FF2E', b: '#5BD16A' }, { t: 'OLLIE', a: '#FF6A1A', b: '#FFC24A' }, { t: 'GRIND', a: '#FF5FA2', b: '#FF9A52' }, { t: 'SK8', a: '#7FE3FF', b: '#C8FF2E' }, { t: 'STREET', a: '#F3F0E8', b: '#FF6A1A' }];
  function drawGraffiti(c, cx, cy, i, size) {
    const g = GRAFS[i % GRAFS.length], w = size * (g.t.length * 0.62 + 1), h = size * 1.7;
    c.drawImage(sprite('g' + (i % GRAFS.length) + '|' + Math.round(size), w, h, (x) => paintGraffiti(x, g, size)), cx - w / 2, cy - h / 2, w, h);
  }
  function paintGraffiti(c, g, size) {
    c.save(); c.globalAlpha = 0.62; c.rotate(-0.06); c.font = size + 'px ' + DISP; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = size * 0.28; c.strokeText(g.t, 4, 5);
    c.strokeStyle = CRAIE; c.lineWidth = size * 0.26; c.strokeText(g.t, 0, 0); c.strokeStyle = INK; c.lineWidth = size * 0.15; c.strokeText(g.t, 0, 0);
    const gr = c.createLinearGradient(0, -size * 0.45, 0, size * 0.45); gr.addColorStop(0, g.a); gr.addColorStop(1, g.b); c.fillStyle = gr; c.fillText(g.t, 0, 0);
    c.fillStyle = g.b; for (let k = 0; k < 4; k++) c.fillRect(-size * 0.6 + k * size * 0.4, size * 0.36, size * 0.035, size * (0.12 + ((k * 7) % 5) * 0.05));
    c.restore();
  }
  function drawNeonRespawn(c, cx, cy, size, tt, nt) {
    const fl = Math.sin(tt * 23) > 0.97 || Math.sin(tt * 7.3) > 0.995 ? 0.55 : 1, nb = Math.round(nt * 10) / 10, w = size * 7.4, h = size * 2.4;
    c.drawImage(sprite('n' + size + '|' + fl + '|' + nb, w, h, (x) => paintNeon(x, size, fl, nb)), cx - w / 2, cy - h / 2, w, h);
  }
  function paintNeon(c, size, fl, nt) {
    c.save(); c.font = size + 'px ' + DISP; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    const w = c.measureText('RESPAWN').width; rrect(c, -w / 2 - size * 0.9, -size * 0.72, w + size * 1.5, size * 1.4, size * 0.18); c.fillStyle = '#1A1420'; c.fill(); c.strokeStyle = '#2E2533'; c.lineWidth = 3; c.stroke();
    const a = (0.55 + 0.45 * nt) * fl;
    c.globalAlpha = 0.13 * a; c.strokeStyle = ACID; c.lineWidth = size * 0.55; c.strokeText('RESPAWN', size * 0.3, 0);
    c.globalAlpha = 0.25 * a; c.lineWidth = size * 0.25; c.strokeText('RESPAWN', size * 0.3, 0);
    c.globalAlpha = 1; c.lineWidth = size * 0.09; c.strokeStyle = fl < 1 ? '#7A9A2A' : ACID; c.strokeText('RESPAWN', size * 0.3, 0);
    c.lineWidth = size * 0.03; c.strokeStyle = 'rgba(255,255,255,' + (0.8 * a).toFixed(2) + ')'; c.strokeText('RESPAWN', size * 0.3, 0);
    const ox = -w / 2 - size * 0.25; c.beginPath(); for (let i = 0; i < 8; i++) { const an = Math.PI / 8 + (i * Math.PI) / 4; c.lineTo(ox + Math.cos(an) * size * 0.42, Math.sin(an) * size * 0.42); } c.closePath();
    c.globalAlpha = 0.2; c.strokeStyle = CONE; c.lineWidth = size * 0.3; c.stroke(); c.globalAlpha = 1; c.lineWidth = size * 0.07; c.stroke(); c.lineWidth = size * 0.025; c.strokeStyle = 'rgba(255,240,220,.85)'; c.stroke();
    c.font = size * 0.55 + 'px ' + DISP; c.fillStyle = CONE; c.fillText('R', ox, size * 0.03); c.restore();
  }
  function drawWall(c, x0, x1, y, h, gi) {
    const top = y - h, g = c.createLinearGradient(0, top, 0, y); g.addColorStop(0, '#4A4450'); g.addColorStop(1, '#2C2931');
    c.fillStyle = g; c.fillRect(x0, top, x1 - x0, h); c.fillStyle = '#37323D'; c.fillRect(x0 - 6, top - 10, x1 - x0 + 12, 12); c.fillStyle = 'rgba(255,170,130,.35)'; c.fillRect(x0 - 6, top - 10, x1 - x0 + 12, 2);
    c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 2; c.beginPath(); for (let x = x0 + 120; x < x1; x += 120) { c.moveTo(x, top); c.lineTo(x, y); } c.stroke();
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x0, y - 26, x1 - x0, 26);
    if (gi >= 0) { const n = Math.max(1, Math.floor((x1 - x0) / 420)); for (let k = 0; k < n; k++) drawGraffiti(c, x0 + ((x1 - x0) * (k + 0.5)) / n, top + h * 0.45, gi + k, Math.min(70, h * 0.36)); }
  }
  function drawLamp(c, x, y, nt) {
    const h = 300; c.fillStyle = '#16131B'; c.fillRect(x - 4, y - h, 8, h); c.fillRect(x - 7, y - 16, 14, 16); c.fillRect(x - 4, y - h, 46, 6); c.fillStyle = '#24202A'; c.fillRect(x + 30, y - h - 4, 24, 11);
    const a = 0.25 + 0.75 * nt; const g = c.createRadialGradient(x + 42, y - h + 8, 2, x + 42, y - h + 8, 70);
    g.addColorStop(0, 'rgba(255,226,160,' + a.toFixed(2) + ')'); g.addColorStop(0.25, 'rgba(255,190,110,' + (a * 0.35).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,170,90,0)');
    c.fillStyle = g; c.fillRect(x - 30, y - h - 62, 144, 140);
    c.fillStyle = 'rgba(255,210,140,' + (a * 0.07).toFixed(3) + ')'; c.beginPath(); c.moveTo(x + 32, y - h + 7); c.lineTo(x + 52, y - h + 7); c.lineTo(x + 170, y); c.lineTo(x - 86, y); c.fill();
    c.fillStyle = '#FFE9B8'; c.globalAlpha = a; c.fillRect(x + 32, y - h + 6, 20, 2.5); c.globalAlpha = 1;
  }
  function drawProp(c, p) {
    if (p.k === 'bin') { rrect(c, p.x - 16, p.y - 48, 32, 48, 4); fillOl(c, '#2F4A3A', 2.2); c.fillStyle = '#253B2E'; c.fillRect(p.x - 14, p.y - 38, 28, 4); rrect(c, p.x - 19, p.y - 54, 38, 8, 3); fillOl(c, '#3A5A47', 2); }
    else if (p.k === 'hydrant') { rrect(c, p.x - 8, p.y - 34, 16, 34, 4); fillOl(c, CONE, 2.2); rrect(c, p.x - 13, p.y - 26, 26, 7, 3); fillOl(c, '#D9560F', 2); c.beginPath(); c.arc(p.x, p.y - 36, 7, Math.PI, 0); fillOl(c, '#D9560F', 2); }
    else if (p.k === 'drop') { c.fillStyle = ACID; c.fillRect(p.x - 60, p.y - 3, 60, 3); c.fillStyle = INK; for (let i = 0; i < 6; i++) c.fillRect(p.x - 58 + i * 10, p.y - 3, 5, 3); }
  }
  function drawSeg(c, s, vy1, tt) {
    const g = c.createLinearGradient(0, Math.min(s.y0, s.y1), 0, Math.min(s.y0, s.y1) + 320);
    g.addColorStop(0, '#3A3741'); g.addColorStop(0.06, '#2C2A31'); g.addColorStop(0.45, '#1E1D22'); g.addColorStop(1, '#141416');
    if (s.kind === 'pit') {
      const top = s.y0 - 170, gp = c.createLinearGradient(0, top, 0, s.y0); gp.addColorStop(0, '#17151B'); gp.addColorStop(1, '#0E0D11'); c.fillStyle = gp; c.fillRect(s.x0, top, s.x1 - s.x0, s.y0 - top);
      const wy = s.y0 - 34, gw = c.createLinearGradient(0, wy, 0, s.y0); gw.addColorStop(0, '#1E4A5A'); gw.addColorStop(1, '#0B1E28'); c.fillStyle = gw; c.fillRect(s.x0, wy, s.x1 - s.x0, 40);
      c.strokeStyle = 'rgba(255,160,110,.45)'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 7; i++) { const xx = s.x0 + ((i * 53 + tt * 40) % (s.x1 - s.x0 - 30)); c.moveTo(xx, wy + 5 + (i % 3) * 7); c.lineTo(xx + 18 + (i % 2) * 10, wy + 5 + (i % 3) * 7); } c.stroke();
      c.fillStyle = '#141416'; c.fillRect(s.x0, s.y0 + 4, s.x1 - s.x0, vy1 - s.y0);
      c.fillStyle = '#24222A'; c.fillRect(s.x0, top, 8, 170); c.fillRect(s.x1 - 8, top, 8, 170); c.fillStyle = 'rgba(255,170,130,.4)'; c.fillRect(s.x1 - 8, top, 8, 2);
      return;
    }
    c.beginPath();
    if (s.kind === 'stairs') {
      const st = TR.stairs.find((q) => q.x0 === s.x0); c.moveTo(s.x0, s.y0);
      for (let i = 0; i < st.n; i++) { c.lineTo(s.x0 + i * st.run, s.y0 + (i + 1) * st.rise); c.lineTo(s.x0 + (i + 1) * st.run, s.y0 + (i + 1) * st.rise); }
      c.lineTo(s.x1, vy1); c.lineTo(s.x0, vy1); c.closePath(); c.fillStyle = g; c.fill();
      c.strokeStyle = '#5A5462'; c.lineWidth = 3; c.beginPath(); for (let i = 0; i < st.n; i++) { const yy = s.y0 + (i + 1) * st.rise; c.moveTo(s.x0 + i * st.run, yy); c.lineTo(s.x0 + (i + 1) * st.run, yy); } c.stroke();
      c.strokeStyle = 'rgba(255,170,130,.5)'; c.lineWidth = 1.2; c.stroke(); c.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < st.n; i++) c.fillRect(s.x0 + i * st.run, s.y0 + i * st.rise + 1.5, 2.5, st.rise);
      return;
    }
    c.moveTo(s.x0, s.y0); c.lineTo(s.x1, s.y1); c.lineTo(s.x1, vy1); c.lineTo(s.x0, vy1); c.closePath(); c.fillStyle = g; c.fill();
    if (s.kind === 'kick') {
      c.beginPath(); c.moveTo(s.x0, s.y0); c.lineTo(s.x1, s.y1); c.lineTo(s.x1, s.y0); c.closePath(); c.fillStyle = '#3C424A'; c.fill();
      c.strokeStyle = '#2A2F35'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(s.x0 + 40, s.y0); c.lineTo(s.x0 + 40, s.y0 - (s.y0 - s.y1) * 0.33); c.moveTo(s.x0 + 80, s.y0); c.lineTo(s.x0 + 80, s.y0 - (s.y0 - s.y1) * 0.66); c.moveTo(s.x0 + 40, s.y0); c.lineTo(s.x0 + 80, s.y0 - (s.y0 - s.y1) * 0.66); c.stroke();
      c.fillStyle = '#3C424A'; c.fillRect(s.x1 - 6, s.y1, 6, s.y0 - s.y1 + 170); c.strokeStyle = ACID; c.lineWidth = 3; c.beginPath(); c.moveTo(s.x1 - 14, s.y1 + 5.5); c.lineTo(s.x1, s.y1); c.stroke();
    } else {
      c.beginPath(); c.moveTo(s.x0, s.y0 + 2); c.lineTo(s.x1, s.y1 + 2); c.lineTo(s.x1, s.y1 + 30); c.lineTo(s.x0, s.y0 + 30); c.closePath(); c.fillStyle = '#423E49'; c.fill();
      c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.moveTo(s.x0, s.y0 + 30); c.lineTo(s.x1, s.y1 + 30); c.lineTo(s.x1, s.y1 + 36); c.lineTo(s.x0, s.y0 + 36); c.fill();
      if (s.kind === 'flat') {
        c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 2; c.beginPath(); for (let x = Math.ceil(s.x0 / 160) * 160; x < s.x1; x += 160) { c.moveTo(x, s.y0 + 3); c.lineTo(x, s.y0 + 30); } c.stroke();
        c.fillStyle = 'rgba(255,255,255,.05)'; c.fillRect(s.x0, s.y0 + 3, s.x1 - s.x0, 4);
        c.fillStyle = 'rgba(243,240,232,.10)'; for (let x = Math.ceil(s.x0 / 150) * 150; x < s.x1 - 70; x += 150) c.fillRect(x, s.y0 + 128, 70, 7);
        c.fillStyle = 'rgba(255,106,26,.16)'; c.fillRect(s.x0, s.y0 + 52, s.x1 - s.x0, 3);
        for (let x = Math.ceil(s.x0 / 1100) * 1100; x < s.x1 - 40; x += 1100) { c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(x + 20, s.y0 + 90, 26, 5, 0, 0, TAU); c.fill(); }
      }
    }
    c.strokeStyle = s.kind === 'kick' ? '#9AA2AC' : '#55505D'; c.lineWidth = 4; c.beginPath(); c.moveTo(s.x0, s.y0); c.lineTo(s.x1, s.y1); c.stroke();
    c.strokeStyle = 'rgba(255,176,130,.55)'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(s.x0, s.y0 - 1.5); c.lineTo(s.x1, s.y1 - 1.5); c.stroke();
  }
  function drawLedge(c, o) {
    const h = o.y - o.top, w = o.x1 - o.x0;
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(o.x0 + w / 2, o.y, w / 2 + 16, 6, 0, 0, TAU); c.fill();
    if (o.style === 'banc') { c.fillStyle = '#2A2A2E'; for (let x = o.x0 + 24; x < o.x1 - 10; x += Math.max(60, (w - 48) / 3)) c.fillRect(x, o.top, 8, h); c.fillRect(o.x1 - 32, o.top, 8, h);
      rrect(c, o.x0, o.top - 2, w, 11, 3); fillOl(c, '#8A5A3A', 2.2); c.fillStyle = '#B9BEC4'; c.fillRect(o.x0, o.top - 3, w, 3); }
    else { const g = c.createLinearGradient(0, o.top, 0, o.y); g.addColorStop(0, o.style === 'manny' ? '#3A3F2B' : '#5D5866'); g.addColorStop(1, o.style === 'manny' ? '#262A1B' : '#38343F');
      c.beginPath(); c.rect(o.x0, o.top, w, h); c.fillStyle = g; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.2; c.stroke();
      if (o.style === 'manny') { c.fillStyle = ACID; c.globalAlpha = 0.85; c.fillRect(o.x0 + 6, o.top + h * 0.45, w - 12, 4); c.globalAlpha = 1; }
      else { c.fillStyle = 'rgba(0,0,0,.18)'; for (let x = o.x0 + 60; x < o.x1; x += 90) c.fillRect(x, o.top + 4, 2, h - 4); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(o.x0 + 2, o.top + 3, w - 4, 5); }
      drawCoping(c, o.x0, o.x1, o.top); }
  }
  function drawCoping(c, x0, x1, top) { c.fillStyle = '#C9CED4'; c.fillRect(x0 - 2, top - 3, x1 - x0 + 4, 4.5); c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(x0 - 2, top - 3, x1 - x0 + 4, 1.2); c.strokeStyle = INK; c.lineWidth = 1.4; c.strokeRect(x0 - 2, top - 3, x1 - x0 + 4, 4.5); }
  function railLine(c, r, x0, x1) {
    const col = r.style === 'plat' ? ACID : r.style === 'main' ? '#B9BEC4' : CONE, y0 = railY(r, x0), y1 = railY(r, x1);
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.strokeStyle = INK; c.lineWidth = r.style === 'plat' ? 9 : 8.5; c.lineCap = r.style === 'plat' ? 'butt' : 'round'; c.stroke();
    c.strokeStyle = col; c.lineWidth = r.style === 'plat' ? 5 : 4.6; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x0 + 4, y0 - 1.2); c.lineTo(x1 - 4, y1 - 1.2); c.stroke(); c.lineCap = 'round';
  }
  function drawRail(c, r) {
    c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); const L = r.x1 - r.x0, n = Math.max(2, Math.round(L / 150) + 1), posts = [];
    for (let i = 0; i < n; i++) posts.push(r.x0 + 12 + ((L - 24) * i) / (n - 1));
    for (const x of posts) { c.moveTo(x, railY(r, x)); c.lineTo(x, groundAt(x).y); } c.stroke(); c.strokeStyle = '#3A3540'; c.lineWidth = 4; c.stroke();
    for (const x of posts) { c.fillStyle = '#2A2630'; c.fillRect(x - 7, groundAt(x).y - 4, 14, 4); }
    railLine(c, r, r.x0, r.x1);
  }
  function drawCone(c, k) {
    const f = coneFx.get(k), o = f || k;
    c.save(); c.translate(o.x, o.y); if (f) c.rotate(f.rot);
    if (!f) { c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(0, 0, 18, 4, 0, 0, TAU); c.fill(); }
    rrect(c, -15, -5, 30, 5, 1.5); fillOl(c, '#C2420E', 2);
    c.beginPath(); c.moveTo(-11, -5); c.lineTo(-3.5, -34); c.lineTo(3.5, -34); c.lineTo(11, -5); c.closePath(); fillOl(c, CONE, 2.2);
    c.fillStyle = CRAIE; c.beginPath(); c.moveTo(-7.4, -16); c.lineTo(-5.4, -24); c.lineTo(5.4, -24); c.lineTo(7.4, -16); c.closePath(); c.fill(); c.restore();
  }
  function iconCanvas(id) {
    let ic = iconCache.get(id); if (ic) return ic;
    const p = CAT.byId.get(id); const [cv, x] = mk(100, 100, Math.min(2.5, S * DPR * 0.9)); if (p) drawIcon(x, p, pieceOf(p), CAT.byId); iconCache.set(id, cv); return cv;
  }
  function drawCoin(c, tt, ph) {
    const s = Math.cos(tt * 4 + ph); c.save(); c.scale(Math.max(0.18, Math.abs(s)), 1);
    c.beginPath(); c.arc(0, 0, 12, 0, TAU); fillOl(c, '#C98A1A', 2.2); c.beginPath(); c.arc(0, -1, 9.5, 0, TAU); c.fillStyle = '#FFD54A'; c.fill();
    if (Math.abs(s) > 0.4) { c.fillStyle = INK; c.font = '12px ' + DISP; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('R', 0, 0); }
    c.restore();
  }
  function drawItem(c, it, tt) {
    const bob = Math.sin(tt * 3 + it.ph) * 4; c.save(); c.translate(it.x, it.y + bob);
    if (it.k === 'coin') drawCoin(c, tt, it.ph);
    else if (it.k === 'boost' || it.k === 'magnet') drawBonus(c, it.k);
    else if (it.k === 'letter') {
      const g = c.createRadialGradient(0, 0, 4, 0, 0, 58); g.addColorStop(0, 'rgba(200,255,46,.5)'); g.addColorStop(1, 'rgba(200,255,46,0)'); c.fillStyle = g; c.fillRect(-58, -58, 116, 116);
      c.rotate(Math.sin(tt * 2 + it.ph) * 0.12); rrect(c, -24, -26, 48, 52, 10); fillOl(c, ACID, 3);
      c.fillStyle = INK; c.font = '40px ' + DISP; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(it.ch, 0, 2);
    } else if (it.k === 'cassette') {
      c.globalAlpha = 0.55 + 0.45 * Math.abs(Math.sin(tt * 2.5)); rrect(c, -26, -17, 52, 34, 5); fillOl(c, '#2A2A2E', 2.6); rrect(c, -20, -12, 40, 13, 3); fillOl(c, '#B9A6FF', 1.6);
      for (const x of [-10, 10]) { c.beginPath(); c.arc(x, -5.5, 4, 0, TAU); fillOl(c, CRAIE, 1.4); } c.fillStyle = '#B9A6FF'; c.fillRect(-14, 6, 28, 5); c.globalAlpha = 1;
    }
    c.restore();
  }
  function drawDrop(c, d, tt) {
    const bob = Math.sin(tt * 2.4) * 6; c.save(); c.translate(d.x, d.y + bob);
    const g = c.createRadialGradient(0, 0, 10, 0, 0, 110); g.addColorStop(0, 'rgba(255,213,74,.55)'); g.addColorStop(1, 'rgba(255,213,74,0)'); c.fillStyle = g; c.fillRect(-110, -110, 220, 220);
    c.strokeStyle = 'rgba(255,213,74,.5)'; c.lineWidth = 2; for (let i = 0; i < 8; i++) { const a = tt * 0.6 + (i * Math.PI) / 4; c.beginPath(); c.moveTo(Math.cos(a) * 46, Math.sin(a) * 46); c.lineTo(Math.cos(a) * 78, Math.sin(a) * 78); c.stroke(); }
    rrect(c, -36, -36, 72, 72, 6); fillOl(c, '#9A6A3A', 3); c.strokeStyle = '#6E4724'; c.lineWidth = 3; c.beginPath(); c.moveTo(-34, -34); c.lineTo(34, 34); c.moveTo(34, -34); c.lineTo(-34, 34); c.stroke();
    rrect(c, -36, -36, 72, 72, 6); c.strokeStyle = INK; c.lineWidth = 3; c.stroke();
    rrect(c, -25, -25, 50, 50, 9); fillOl(c, '#E4DFD3', 2.2); if (d.id) c.drawImage(iconCanvas(d.id), -22, -22, 44, 44);
    rrect(c, -30, 30, 60, 18, 5); fillOl(c, CONE, 2); c.fillStyle = INK; c.font = '14px ' + DISP; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('DROP -20 %', 0, 39.5);
    c.restore();
  }
  function drawWorld(cam, tt, nt) {
    const vx0 = cam.x - 40, vx1 = cam.x + W / cam.s + 40, vy1 = cam.y + H / cam.s + 40;
    worldXf(cam); const c = ctx; c.lineCap = 'round'; c.lineJoin = 'round';
    const iw = TR.introWall;
    if (iw && iw.x1 > vx0 && iw.x0 < vx1) { drawWall(c, iw.x0, iw.x1, iw.y, 175, -1); c.fillStyle = '#211B26'; c.fillRect(-470, -230, 6, 60); c.fillRect(-290, -230, 6, 60);
      drawNeonRespawn(c, -380, -262, 40, tt, nt); drawGraffiti(c, -1000, -86, 3, 58); drawGraffiti(c, -140, -86, 1, 50); }
    for (const w of TR.walls) if (w.x1 >= vx0 && w.x0 <= vx1) drawWall(c, w.x0, w.x1, w.y, w.h, w.g);
    for (const l of TR.lamps) if (l.x > vx0 - 200 && l.x < vx1 + 200) drawLamp(c, l.x, l.y, nt);
    for (const pr of TR.props) if (pr.x > vx0 - 60 && pr.x < vx1 + 60) drawProp(c, pr);
    const i0 = segIndexAt(vx0), i1 = segIndexAt(vx1); for (let i = i0; i <= i1; i++) drawSeg(c, TR.segs[i], vy1, tt);
    for (const o of TR.ledges) if (o.x1 >= vx0 && o.x0 <= vx1) drawLedge(c, o);
    for (const r of TR.rails) if (r.x1 >= vx0 && r.x0 <= vx1) drawRail(c, r);
    for (const k of TR.cones) if (k.x > vx0 - 200 && k.x < vx1 + 200) drawCone(c, k);
    if (G.mode !== 'scene') {
      const taken = SIM.S.taken;
      for (const it of TR.items) { if (it.x > vx1 + 80) break; if (it.x > vx0 - 80 && !taken.has(it.i)) drawItem(c, it, tt); }
      const d = SIM.S.drop; if (d && !SIM.S.dropCaught && d.x > vx0 - 120 && d.x < vx1 + 120) drawDrop(c, d, tt);
    }
  }
  function updateCones(dt) { for (const [c, k] of coneFx) { if (k.hit > 1) continue; k.vy += GRAV * dt; k.x += k.vx * dt; k.y += k.vy * dt; k.rot += k.vr * dt; const g = groundAt(k.x).y;
    if (k.y > g && k.vy > 0) { k.y = g; k.vy *= -0.35; k.vx *= 0.6; k.vr *= 0.5; if (Math.abs(k.vy) < 80) { k.vy = 0; k.hit = 2; k.rot = (Math.PI / 2) * (k.rot > 0 ? 1 : -1); } } } }

  function updateParts(dt) {
    for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.t += dt; if (q.t >= q.life) { parts.splice(i, 1); continue; }
      q.x += q.vx * dt; q.y += q.vy * dt; if (q.k !== 'dust') q.vy += GRAV * 0.6 * dt; else { q.vx *= 0.92; q.vy *= 0.9; } if (q.rot != null) q.rot += q.vr * dt; }
    for (let i = pops.length - 1; i >= 0; i--) { pops[i].t += dt; if (pops[i].t >= pops[i].life) pops.splice(i, 1); }
  }
  function drawParts(c) {
    for (const q of parts) { const k = q.t / q.life;
      if (q.k === 'dust') { c.globalAlpha = (1 - k) * 0.5; c.fillStyle = '#B9AFB8'; c.beginPath(); c.arc(q.x, q.y, q.s * (0.5 + k), 0, TAU); c.fill(); }
      else if (q.k === 'spark') { c.globalAlpha = 1 - k; c.strokeStyle = k < 0.35 ? '#FFF8D8' : k < 0.7 ? '#FFC24A' : '#FF6A1A'; c.lineWidth = 2.8 - k * 1.6; c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(q.x - q.vx * 0.035, q.y - q.vy * 0.035); c.stroke(); }
      else if (q.k === 'conf') { c.globalAlpha = 1 - k * k; c.fillStyle = q.c; c.save(); c.translate(q.x, q.y); c.rotate(q.rot); c.fillRect(-q.s / 2, -q.s / 4, q.s, q.s / 2); c.restore(); }
      else if (q.k === 'star') { c.globalAlpha = 1 - k; c.fillStyle = q.c; const s = 4 * (1 - k) + 1; c.fillRect(q.x - s / 2, q.y - s * 1.5, s, s * 3); c.fillRect(q.x - s * 1.5, q.y - s / 2, s * 3, s); } }
    c.globalAlpha = 1;
  }
  function drawPops(cam) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    for (const q of pops) { const k = q.t / q.life, sx = (q.x - cam.x) * cam.s, sy = (q.y - cam.y) * cam.s - k * 40;
      const sc = k < 0.15 ? easeOut(k / 0.15) * 1.15 : k < 0.25 ? 1.15 - (k - 0.15) * 1.5 : 1, a = k > 0.75 ? 1 - (k - 0.75) / 0.25 : 1;
      const fs = q.size * clamp(cam.s * 1.05, 0.85, 1.6) * sc; ctx.globalAlpha = a; ctx.font = fs + 'px ' + DISP;
      ctx.strokeStyle = INK; ctx.lineWidth = fs * 0.22; ctx.strokeText(q.text, sx, sy); ctx.fillStyle = q.col; ctx.fillText(q.text, sx, sy);
      if (q.sub) { ctx.font = fs * 0.62 + 'px ' + DISP; ctx.lineWidth = fs * 0.16; ctx.strokeText(q.sub, sx, sy + fs * 0.8); ctx.fillStyle = ACID; ctx.fillText(q.sub, sx, sy + fs * 0.8); } }
    ctx.globalAlpha = 1;
    const b = G.big;
    if (b) { const k = b.t / b.life, sc = k < 0.12 ? easeOut(k / 0.12) * 1.2 : k < 0.22 ? 1.2 - (k - 0.12) * 2 : 1, a = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      const fs = Math.min(W * 0.12, H * 0.15) * sc; ctx.globalAlpha = a; ctx.font = fs + 'px ' + DISP; ctx.save(); ctx.translate(W / 2, Math.max(H * 0.42, fs * 0.6 + 150)); ctx.rotate(-0.05);
      ctx.strokeStyle = INK; ctx.lineWidth = fs * 0.16; ctx.strokeText(b.text, 0, 0); ctx.fillStyle = b.col; ctx.fillText(b.text, 0, 0);
      if (b.sub) { ctx.font = fs * 0.26 + 'px ' + DISP; ctx.lineWidth = fs * 0.06; ctx.strokeText(b.sub.toUpperCase(), 0, fs * 0.62); ctx.fillStyle = CRAIE; ctx.fillText(b.sub.toUpperCase(), 0, fs * 0.62); }
      ctx.restore(); ctx.globalAlpha = 1; }
  }
  const LINES = []; for (let i = 0; i < 18; i++) LINES.push({ x: Math.random(), y: 0.3 + Math.random() * 0.66, l: 0.08 + Math.random() * 0.16, s: 0.8 + Math.random() * 0.8 });
  function drawSpeed(inten) {
    if (inten <= 0.01) return; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.lineCap = 'round';
    for (const l of LINES) { l.x -= (1 / 60) * l.s * 2.4 * (0.6 + inten); if (l.x + l.l < -0.05) { l.x = 1 + Math.random() * 0.3; l.y = 0.3 + Math.random() * 0.66; }
      ctx.strokeStyle = 'rgba(243,240,232,' + (inten * 0.09 * l.s).toFixed(3) + ')'; ctx.lineWidth = 1.5 + l.s; ctx.beginPath(); ctx.moveTo(l.x * W, l.y * H); ctx.lineTo((l.x + l.l * (0.5 + inten)) * W, l.y * H); ctx.stroke(); }
  }
  function drawForeground(camX) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = '#09070D'; const span = 2600, base = (camX * 1.35) % span;
    for (const [ox, k] of [[300, 0], [1250, 1], [1900, 0], [2350, 2]]) { let x = ox - base; if (x < -300) x += span; if (x > span - 300) x -= span; const sx = x * S, by = H; if (sx < -200 || sx > W + 200) continue;
      if (k === 0) { ctx.fillRect(sx, by - 70 * S, 14 * S, 70 * S); ctx.beginPath(); ctx.arc(sx + 7 * S, by - 70 * S, 7 * S, 0, TAU); ctx.fill(); }
      else if (k === 1) { ctx.beginPath(); for (let i = 0; i < 5; i++) ctx.arc(sx + i * 26 * S, by - (20 + ((i * 13) % 25)) * S, (30 + (i % 2) * 10) * S, 0, TAU); ctx.fill(); }
      else { ctx.fillRect(sx, by - 40 * S, 200 * S, 5 * S); ctx.fillRect(sx + 10 * S, by - 40 * S, 6 * S, 40 * S); ctx.fillRect(sx + 180 * S, by - 40 * S, 6 * S, 40 * S); } }
  }
  function sceneCam() {
    const r = G.scene.rect || { x: 0, y: 0, w: W, h: H };
    const s = Math.min(r.h / 440, r.w / 320), cx = r.x + r.w * 0.5, gy = r.y + r.h * 0.82;
    return { x: -380 + 5 - cx / s, y: -gy / s, s };
  }
  function sceneBgX() { const TW = BG.TW, tgt = W + (TW - W) / 2; return (((BG.mid.signX - tgt) % TW) + TW) % TW / (S * 0.16); }
  function drawPlayer(c, p, inp, L, alpha) {
    if (p.state === 'bail') {
      const b = p.bb; if (b) { c.save(); c.translate(b.x, b.y); c.rotate(b.rot); drawBoardSide(c, { x: 0, y: 0, pitch: 0, roll: 0, yaw: 0 }, L); c.restore(); }
      const o = computePose(rt, p, inp); o.board.show = 0; const k = p.bailT; o.hb = { x: -46, y: -110 + Math.sin(k * 20) * 10 }; o.hf = { x: 44, y: -40 + Math.cos(k * 18) * 10 }; o.fb = { x: -30, y: -10 }; o.ff = { x: 30, y: -30 }; o.hip.y = -50;
      c.save(); c.translate(p.x, p.y - 60); c.rotate(Math.min(k * 9, Math.PI * 1.6)); c.translate(0, 40); drawRider(c, o, L); c.restore(); return;
    }
    if (!alpha && p.inv > 0 && Math.floor(rt * 14) % 2 === 0) return;
    const o = computePose(rt, p, inp), slide = p.state === 'grind' && p.grind.d === 'd', lift = p.state === 'grind' ? (slide ? 3 : 12) : 19;
    c.save(); c.translate(p.x, p.y - (p.jitter || 0) - lift); c.rotate(p.bodyAng); drawRider(c, o, L); c.restore();
    if (slide && !alpha) { const g = p.grind.g; if (g.kind === 'rail') railLine(c, g.o, Math.max(g.x0, p.x - 16), Math.min(g.x1, p.x + 16)); else drawCoping(c, Math.max(g.x0, p.x - 14), Math.min(g.x1, p.x + 14), g.y0); }
  }
  function render() {
    const nt = night(), scene = G.mode === 'scene', cam = scene ? sceneCam() : G.cam; spriteScale = cam.s * DPR;
    drawBackdrop(scene ? sceneBgX() + rt * 2 : cam.x, cam.y, nt);
    drawWorld(cam, rt, nt);
    const c = ctx;
    if (scene) {
      const x = -380; c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x + 10, 0, 62, 7, 0, 0, TAU); c.fill(); drawParts(c);
      const hop = G.hop > 0 ? Math.sin(Math.PI * (1 - G.hop / 0.35)) * 12 : 0;
      if (look) { c.save(); c.translate(x + 50, -52 - hop * 0.3); c.rotate(-Math.PI / 2 + 0.1); drawBoardPlan(c, look); c.restore();
        c.save(); c.translate(x, -hop); drawRider(c, standPose(rt), look); c.restore(); }
    } else {
      // fantôme : silhouette semi-transparente, pseudo au-dessus
      if (GHOST && ghostLook) { const gp = GHOST.P; c.save(); c.globalAlpha = 0.36; drawPlayer(c, gp, GHOST.IN, ghostLook, true); c.restore();
        c.font = '15px ' + DISP; c.textAlign = 'center'; c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = 4; c.globalAlpha = 0.85;
        const lbl = (ghostInfo && ghostInfo.pseudo ? ghostInfo.pseudo : t('ghost')).toUpperCase(); c.strokeText(lbl, gp.x, gp.y - 178); c.fillStyle = '#B9E8FF'; c.fillText(lbl, gp.x, gp.y - 178); c.globalAlpha = 1; }
      drawParts(c);
      const sh = groundAt(P.x).y; c.fillStyle = 'rgba(0,0,0,' + (0.32 * clamp(1 - (sh - P.y) / 300, 0, 1)).toFixed(2) + ')'; c.beginPath(); c.ellipse(P.x, sh, 50 * clamp(1 - (sh - P.y) / 400, 0.4, 1), 6, 0, 0, TAU); c.fill();
      drawPlayer(c, P, IN, look, false);
      if (G.magnetT > 0) { c.strokeStyle = 'rgba(185,166,255,' + (0.25 + 0.15 * Math.sin(rt * 10)).toFixed(2) + ')'; c.lineWidth = 3; c.beginPath(); c.arc(P.x, P.y - 80, 150 + Math.sin(rt * 6) * 8, 0, TAU); c.stroke(); }
      drawForeground(cam.x);
      drawSpeed(G.mode === 'run' ? clamp((P.vx - 480) / 260, 0, 1) * 0.8 + (P.state === 'air' ? 0.25 : 0) + (G.slowT > 0 ? 0.6 : 0) + (G.boostT > 0 ? 0.7 : 0) : 0);
    }
    drawPops(cam);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.drawImage(BG.vig, 0, 0, W, H);
    if (G.slowT > 0) { ctx.fillStyle = 'rgba(200,255,46,' + (0.06 * Math.min(1, G.slowT * 4)).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
    if (G.boostT > 0) { ctx.fillStyle = 'rgba(255,106,26,' + (0.05 * Math.min(1, G.boostT)).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
    if (G.wipe >= 0) { const k = G.wipe, x = (k * 2.4 - 1.2) * W; ctx.fillStyle = ACID; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + W * 0.9, 0); ctx.lineTo(x + W * 0.6, H); ctx.lineTo(x - W * 0.3, H); ctx.fill();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(x + W * 0.05, 0); ctx.lineTo(x + W * 0.75, 0); ctx.lineTo(x + W * 0.45, H); ctx.lineTo(x - W * 0.25, H); ctx.fill(); }
  }

  /* ------------------------------------------------------------ boucle : simulation à pas fixe */
  let autoT = 0;
  function update(dtReal) {
    rt += dtReal;
    if (G.big) { G.big.t += dtReal; if (G.big.t >= G.big.life) G.big = null; }
    if (G.wipe >= 0) { G.wipe += dtReal / 0.5; if (G.wipe >= 0.5 && G.wipeTo) { const f = G.wipeTo; G.wipeTo = null; f(); } if (G.wipe >= 1) G.wipe = -1; }
    G.shake = Math.max(0, G.shake - dtReal * 30); G.shx = (Math.random() - 0.5) * G.shake; G.shy = (Math.random() - 0.5) * G.shake;
    if (G.mode === 'scene') { G.hop = Math.max(0, G.hop - dtReal); updateParts(dtReal); audio.loops(0, 0, 0); return; }
    if (G.slowT > 0) G.slowT -= dtReal;
    G.ts = lerp(G.ts, G.slowT > 0 ? 0.3 : 1, 1 - Math.exp(-dtReal * (G.slowT > 0 ? 20 : 6)));
    G.zoom = lerp(G.zoom, (G.slowT > 0 ? 1.07 : 1) * (1 - 0.1 * clamp((P.vx - 650) / 400, 0, 1)), 1 - Math.exp(-dtReal * 4));
    G.acc += dtReal * G.ts; let n = 0;
    while (G.acc >= STEP && n < 10) {
      G.acc -= STEP; n++;
      if (autopilot && !mainIn && G.mode === 'run' && (++autoT & 1)) autopilotStep();
      while (pend.length && pend[0].at <= SIM.S.tick) queue.push(pend.shift().e);
      const evs = mainIn ? mainIn.get(SIM.S.tick) || null : queue.length ? queue.splice(0) : null; if (mainIn) queue.length = 0;
      SIM.step(evs);
      if (GHOST) { GHOST.step(ghostIn.get(GHOST.S.tick) || null); if (!SIM.S.done) G.ghostDiff = Math.max(G.ghostDiff, Math.abs(GHOST.P.x - P.x) + Math.abs(GHOST.P.y - P.y)); }
    }
    if (n >= 10) G.acc = 0;
    const S2 = SIM.S; G.t = S2.t; G.boostT = S2.boostT; G.magnetT = S2.magnetT;
    const dt = dtReal * G.ts; updateCones(dt); updateParts(dt);
    const cam = G.cam, s = S * G.zoom; cam.s = s; const vw = W / s, vh = H / s;
    cam.x = P.x - vw * (W > H ? 0.28 : 0.22);
    const ga = groundAt(P.x).y, gb = groundAt(P.x + 380).y, gy = Math.min(ga, (ga + gb) / 2);
    let ty = gy - vh * (W > H ? 0.7 : 0.62); const head = P.y - 150 - vh * 0.14; if (head < ty) ty = head;
    cam.y = lerp(cam.y, ty, 1 - Math.exp(-dt * (P.state === 'air' ? 9 : 5)));
    const sp = P.vx / 700;
    audio.loops(G.mode === 'run' && P.state === 'ride' ? 0.1 * sp : 0, P.state === 'grind' ? 0.12 : 0, P.state === 'air' ? 0.05 + 0.05 * sp : 0.012);
    if (G.mode === 'run') {
      const h = TR.hints[G.hintI]; if (h && P.x > h.x) { G.hintI++; if (hooks.onHint) hooks.onHint(h.k); }
      if (hooks.onTick) hooks.onTick({ score: S2.score, left: Math.max(0, RUN_LEN - S2.t), kmh: P.vx * KMH, boost: S2.boostT > 0, magnet: S2.magnetT > 0, coins: S2.coins, letters: S2.letters, ghost: GHOST ? GHOST.S.score : null });
    }
  }
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const el = now - last; if (el < 1000 / 60 - 2) return; last = now;
    const dt = Math.min(el / 1000, 1 / 24);
    if (!G.paused) update(dt); else if (Math.floor(now / 100) === Math.floor((now - el) / 100)) return;
    render();
  }
  function start() { if (running || destroyed) return; running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(raf); raf = 0; }

  /* ------------------------------------------------------------ pilote automatique (démo et tests) */
  const A = { pressAt: 0, flicked: 0, cap: 0 };
  const aPress = () => { if (!IN.down) { queue.push({ k: 'a', down: true }); A.pressAt = SIM.S.clock; } };
  const aRel = () => { if (IN.down) queue.push({ k: 'a', down: false }); };
  const aFlick = (d) => { queue.push({ k: d, down: true }); pend.push({ at: SIM.S.tick + 3, e: { k: d, down: false } }); };
  function predictLand() { let x = P.x, y = P.y, vy = P.vy; for (let tt = 0; tt < 2.5; tt += 1 / 60) { vy += GRAV / 60; x += P.vx / 60; const oy = y; y += vy / 60;
    for (const g of TR.grind) { if (g.x0 > x + 20) break; if (g.x1 < x) continue; const ry = railY(g, x); if (oy <= ry && y >= ry && vy > -80 && x < g.x1 - 24) return { t: tt, grind: 1 }; }
    if (y >= groundAt(x).y) return { t: tt, grind: 0 }; } return { t: 2.5 }; }
  function autopilotStep() {
    const p = P, S2 = SIM.S;
    if (!A.cap) A.cap = 4 + ((Math.random() * 7) | 0);
    if (p.state === 'ride') {
      if (S2.drop && !S2.dropCaught && groundAt(p.x + 30).s.kind === 'kick') { aPress(); return; }
      A.flicked = 0; let tgt = null;
      for (const o of TR.grind) if (o.x0 > p.x + 20) { tgt = { x: o.x0, h: p.y - o.y0 }; break; }
      for (const k of TR.cones) if (!S2.cones.has(k) && k.x > p.x + 20 && (!tgt || k.x < tgt.x)) { tgt = { x: k.x - 30, h: 40 }; break; }
      for (const s of TR.stairs) if (s.x0 > p.x + 10 && (!tgt || s.x0 < tgt.x)) { tgt = { x: s.x0 - 10, h: 0 }; break; }
      for (const s of TR.segs) if (s.kind === 'kick' && s.x0 > p.x && (!tgt || s.x0 < tgt.x)) { tgt = { x: s.x0, h: -1, s }; break; }
      if (tgt) { const d = tgt.x - p.x;
        if (tgt.h === -1) { if (d < 150 && (S2.drop || Math.random() < 0.02)) aPress(); }
        else if (d < p.vx * 0.42 && d > p.vx * 0.08) aPress();
        if (IN.down && tgt.h >= 0 && d < p.vx * 0.17 && S2.clock - A.pressAt > 0.08) aRel(); if (IN.down && d < 0 && tgt.h >= 0) aRel(); }
      if (S2.combo && S2.combo.mult < A.cap && !IN.down && p.linkT < 0.5 && (!tgt || tgt.x - p.x > p.vx * 0.75)) aPress();
      if (IN.down && S2.combo && (!tgt || (tgt.h >= 0 && tgt.x - p.x > p.vx * 0.75)) && S2.clock - A.pressAt > 0.22) aRel();
      if (!S2.combo) A.cap = 0;
    } else if (p.state === 'air') {
      const pl = predictLand();
      if (!p.flip && !p.grab && pl.t > 0.48 && A.flicked < 2 && p.airT > 0.04) { aFlick(['l', 'r', 'u', 'd', 'l'][(Math.random() * 5) | 0]); A.flicked++; }
      if (IN.down && !p.grab && S2.clock - A.pressAt > 0.05 && p.airT < 0.2) aRel();
      if (!pl.grind && pl.t < 0.1 && !IN.down && !p.flip && p.airT > 0.15 && (!S2.combo || S2.combo.mult < A.cap)) aPress();
    } else if (p.state === 'grind') { const g = p.grind.g; if (g.x1 - p.x < p.vx * 0.22) { if (!IN.down) aPress(); else if (S2.clock - A.pressAt > 0.06) aRel(); } }
  }

  /* ------------------------------------------------------------ API */
  // ghost : { seed, inputs, pseudo, look? } ; ignoré si la graine diffère
  const byTick = (inputs) => { const m = new Map(); for (const [ms, k, d] of inputs) { const tk = tickOf(ms); if (!m.has(tk)) m.set(tk, []); m.get(tk).push({ k, down: !!d }); } return m; };
  // mainInputs (banc) : le joueur réel rejoue ces entrées au lieu du clavier
  // dropProduct : produit de la caisse Drop renvoyé par run-start (null = pas de caisse)
  function startRun(seed, ghost, mainInputs, dropProduct = null) {
    seed = seed >>> 0 || 1; TR = genTrack(seed);
    SIM = createSim(TR, { fx, dropProduct, record: true }); P = SIM.P; IN = SIM.IN;
    GHOST = null; ghostIn = null; ghostInfo = null;
    if (ghost && (ghost.seed >>> 0) === seed && Array.isArray(ghost.inputs) && ghost.inputs.length) {
      GHOST = createSim(TR, { dropProduct }); ghostInfo = ghost; ghostIn = byTick(ghost.inputs);
    }
    mainIn = mainInputs ? byTick(mainInputs) : null;
    Object.assign(G, { mode: 'run', t: 0, ts: 1, slowT: 0, zoom: 1, paused: false, boostT: 0, magnetT: 0, acc: 0, hintI: 0, ghostDiff: 0 });
    queue.length = 0; pend.length = 0; parts.length = 0; pops.length = 0; coneFx.clear(); PT.down = false;
    G.cam.y = groundAt(-380).y - (H / S) * (W > H ? 0.7 : 0.62); G.cam.x = P.x;
    bigText(t('go'), ACID, t('goSub'), 1); SFX.go(); fx.combo(null);
    return { seed, drop: dropProduct, ghost: !!GHOST };
  }
  return {
    G, get P() { return P; }, get TR() { return TR; }, get sim() { return SIM; }, get ghost() { return GHOST; },
    resize, start, stop, render,
    get running() { return running; },
    setLook(l) { look = l; }, setGhostLook(l) { ghostLook = l; },
    hop() { G.hop = 0.35; for (let i = 0; i < 10; i++) part({ x: -380 + (Math.random() - 0.5) * 60, y: -90 + (Math.random() - 0.5) * 80, vx: (Math.random() - 0.5) * 200, vy: -80 - Math.random() * 200, life: 0.6, t: 0, k: 'star', c: ACID }); },
    confetti() { const x = G.mode === 'scene' ? -380 : P.x, y = G.mode === 'scene' ? -90 : P.y - 80; for (let i = 0; i < 40; i++) part({ x, y, vx: (Math.random() - 0.5) * 700, vy: -200 - Math.random() * 600, life: 1.3, t: 0, k: 'conf', c: [ACID, CONE, CRAIE][i % 3], s: 5 + Math.random() * 4, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 20 }); },
    showScene(rect) { G.mode = 'scene'; G.paused = false; G.scene.rect = rect; parts.length = 0; pops.length = 0; TR = genTrack(1); SIM = createSim(TR); P = SIM.P; IN = SIM.IN; GHOST = null; },
    setSceneRect(rect) { G.scene.rect = rect; },
    wipe(fn) { G.wipe = 0; G.wipeTo = fn; },
    startRun,
    setPaused(v) { G.paused = !!v; if (v) releaseAll(); },
    onKeyDown, onKeyUp,
    rebuild() { if (W) buildBackdrop(); },
    iconCanvas,
    // contrôle du déterminisme : rejoue les entrées enregistrées et compare
    replay(seed, inputs, dropProduct = null) { const tr = genTrack(seed >>> 0); return replayRun(tr, inputs, { dropProduct }).S.result; },
    destroy() { destroyed = true; stop(); canvas.removeEventListener('pointerdown', onPDown); canvas.removeEventListener('pointermove', onPMove); canvas.removeEventListener('pointerup', onPUp); canvas.removeEventListener('pointercancel', onPUp); },
  };
}
