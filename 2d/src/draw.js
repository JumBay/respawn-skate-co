// Dessin vectoriel 2D : rider (vue de face, tourné vers la droite), planche vue de côté (flips en
// 3D projetée), planche vue de dessous, sac à dos, icônes de produits. Contour encre partout.
export const INK = '#141416', ACID = '#C8FF2E', CONE = '#FF6A1A', CRAIE = '#F3F0E8';
export const DISP = '"Anton",Impact,"Haettenschweiler","Futura Condensed ExtraBold","Arial Narrow",sans-serif';
export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

const shadeCache = new Map();
export function shade(hex, f) {
  const k = hex + f; let v = shadeCache.get(k); if (v) return v;
  const n = parseInt(String(hex).slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (f < 1) { r *= f; g *= f; b *= f; } else { const q = f - 1; r += (255 - r) * q; g += (255 - g) * q; b += (255 - b) * q; }
  v = 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')'; shadeCache.set(k, v); return v;
}
export function lum(hex) { const n = parseInt(String(hex).slice(1), 16); return (0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)) / 255; }
export function rrect(x, X, Y, w, h, r) { x.beginPath(); if (x.roundRect) x.roundRect(X, Y, w, h, r); else x.rect(X, Y, w, h); }
export function fillOl(c, col, lw) { c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = lw || 2.2; c.stroke(); }
function stroke2(c, pts, w, col, ol) {
  c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.strokeStyle = INK; c.lineWidth = w + (ol == null ? 4.4 : ol * 2); c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.stroke();
}
const rot = (o, a, x, y) => { const cs = Math.cos(a), sn = Math.sin(a); return { x: o.x + x * cs - y * sn, y: o.y + x * sn + y * cs }; };
function octa(c, cx, cy, s) { c.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; c.lineTo(cx + Math.cos(a) * s, cy + Math.sin(a) * s); } c.closePath(); }

export function ik(ax, ay, bx, by, l1, l2, pref, side) {
  const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1e-3; const dd = clamp(d, Math.abs(l1 - l2) + 0.5, l1 + l2 - 0.2);
  const a = Math.atan2(dy, dx), ac = Math.acos(clamp((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1));
  const j1 = { x: ax + Math.cos(a + ac) * l1, y: ay + Math.sin(a + ac) * l1 }, j2 = { x: ax + Math.cos(a - ac) * l1, y: ay + Math.sin(a - ac) * l1 };
  const j = pref === 'down' ? (j1.y > j2.y ? j1 : j2) : ((j1.x - j2.x) * side > 0 ? j1 : j2);
  const ex = bx - j.x, ey = by - j.y, el = Math.hypot(ex, ey) || 1; return { j, e: { x: j.x + (ex / el) * l2, y: j.y + (ey / el) * l2 } };
}

const PLAIN_TOP = { g: 'tshirt', c: ['#E9E4D8', '#C9C3B5', '#2A2A2E'], motif: null };
const PLAIN_BOT = { g: 'jeans', c: ['#2E3140', '#22242F', '#55586A'], motif: null };
const PLAIN_FEET = { g: 'low', c: ['#3A3A40', '#F3F0E8', '#77777E'] };

/* ---------------------------------------------------------------- rider */
// o : pose (repère local, origine = dessus de la planche au centre), L : look (looks.js)
export function drawRider(c, o, L) {
  c.lineCap = 'round'; c.lineJoin = 'round';
  if (o.board.show) drawBoardSide(c, o.board, L);
  const hip = o.hip, ln = o.lean, fem = L.gender === 'f';
  const bot = L.bottom || PLAIN_BOT, top = L.top || PLAIN_TOP, ft = L.feet || PLAIN_FEET;
  const hiT = ft.g === 'high', ank = hiT ? 11 : 7.5;
  const legs = [{ h: rot(hip, ln, -7, 2), f: o.fb, side: -1 }, { h: rot(hip, ln, 7, 2), f: o.ff, side: 1 }];
  const drawShoe = (f, side) => {
    c.save(); c.translate(f.x, f.y); c.rotate(o.shoeAng || 0);
    const w = 22, h = hiT ? 13 : 9.5, [c1, c2, c3] = ft.c;
    c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(-w / 2, -h * 0.55); c.quadraticCurveTo(-w / 2, -h, -w / 2 + 5, -h); c.lineTo(w / 2 - 5, -h);
    c.quadraticCurveTo(w / 2, -h, w / 2, -h * 0.55); c.lineTo(w / 2, 0); c.closePath(); fillOl(c, c1, 2.2);
    c.fillStyle = c2; c.fillRect(-w / 2 + 1, -3.6, w - 2, 3.2); c.strokeStyle = INK; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-w / 2 + 1, -3.8); c.lineTo(w / 2 - 1, -3.8); c.stroke();
    if (hiT) { c.fillStyle = c3; c.fillRect(-w / 2 + 1.5, -h + 4, w - 3, 2.6); }
    c.strokeStyle = lum(c1) > 0.5 ? shade(c1, 0.6) : shade(c1, 1.9); c.lineWidth = 1.3; c.beginPath();
    for (let i = 0; i < 3; i++) { c.moveTo(-3.5, -h + 2.5 + i * 2.2); c.lineTo(3.5, -h + 2.5 + i * 2.2); } c.stroke();
    if (!hiT && lum(c3) > 0.5) { c.fillStyle = c3; c.beginPath(); c.arc(side * 6, -5.8, 1.6, 0, TAU); c.fill(); }
    c.restore();
  };
  const pc = bot.c[0], pc2 = shade(bot.c[0], 0.82), shorts = bot.g === 'shorts';
  for (const lg of legs) { const an = { x: lg.f.x, y: lg.f.y - ank }; const r = ik(lg.h.x, lg.h.y, an.x, an.y, 34, 33, 'out', lg.side); lg.k = r.j; lg.a = r.e; }
  if (!shorts) for (const lg of legs) drawShoe(lg.f, lg.side);
  for (const lg of legs) {
    const h = lg.h, k = lg.k, a = lg.a;
    if (shorts) {
      stroke2(c, [k.x, k.y, a.x, a.y], 9.5, L.skin);
      c.strokeStyle = CRAIE; c.lineWidth = 10.5; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(a.x + (k.x - a.x) * 0.22, a.y + (k.y - a.y) * 0.22); c.stroke();
      drawShoe(lg.f, lg.side);
      stroke2(c, [h.x, h.y, k.x, k.y, k.x + (a.x - k.x) * 0.28, k.y + (a.y - k.y) * 0.28], 17, pc);
    } else {
      const wT = bot.wide ? 15.5 : 15, wS = bot.wide ? 16.5 : 14;
      c.beginPath(); c.moveTo(h.x, h.y); c.lineTo(k.x, k.y); c.lineTo(a.x, a.y); c.strokeStyle = INK; c.lineWidth = wS + 4.4; c.stroke();
      c.strokeStyle = pc; c.lineWidth = wT; c.beginPath(); c.moveTo(h.x, h.y); c.lineTo(k.x, k.y); c.stroke();
      c.lineWidth = wS; c.beginPath(); c.moveTo(k.x, k.y); c.lineTo(a.x, a.y); c.stroke();
      const dx = a.x - k.x, dy = a.y - k.y, dl = Math.hypot(dx, dy) || 1; c.strokeStyle = pc2; c.lineWidth = wS + 0.5; c.lineCap = 'butt'; c.beginPath();
      c.moveTo(a.x - (dx / dl) * 5, a.y - (dy / dl) * 5); c.lineTo(a.x - dx / dl, a.y - dy / dl); c.stroke(); c.lineCap = 'round';
      if (bot.g === 'jeans') { c.strokeStyle = bot.c[2]; c.globalAlpha = 0.55; c.lineWidth = 0.9; c.beginPath(); c.moveTo(h.x + lg.side * 5, h.y + 3); c.lineTo(k.x + lg.side * 6, k.y); c.lineTo(a.x + lg.side * 6, a.y - 4); c.stroke(); c.globalAlpha = 1; }
      if (bot.g === 'cargo') {
        const mx = h.x + (k.x - h.x) * 0.62, my = h.y + (k.y - h.y) * 0.62, an = Math.atan2(k.y - h.y, k.x - h.x);
        c.save(); c.translate(mx + lg.side * 3, my); c.rotate(an - Math.PI / 2); rrect(c, -4.5, -5.5, 9, 11, 2); fillOl(c, bot.c[1], 1.3);
        c.beginPath(); c.moveTo(-4.5, -2); c.lineTo(4.5, -2); c.strokeStyle = INK; c.lineWidth = 1; c.stroke(); c.restore();
      }
    }
    if (L.knees) { // genouillère : coque sur le genou
      const an = Math.atan2(a.y - k.y, a.x - k.x);
      c.save(); c.translate(k.x + (a.x - k.x) * 0.12, k.y + (a.y - k.y) * 0.12); c.rotate(an - Math.PI / 2);
      rrect(c, -9, -6, 18, 15, 6); fillOl(c, L.knees.c[0], 2); rrect(c, -7, -5, 14, 11, 5); fillOl(c, L.knees.c[1], 1.4);
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(-4, -3, 6, 2); c.restore();
    }
  }
  // torse (repère local : hanche, inclinaison)
  c.save(); c.translate(hip.x, hip.y); c.rotate(ln);
  const tg = top.g, [t1, t2, ta] = top.c;
  const sw = fem ? 13 : 15, hw = 12.5;
  const longT = tg === 'hoodie' || tg === 'jacket';
  const sww = longT ? sw + 1.5 : sw + 0.5;
  if (L.bag > 0) { // sac à dos : dépasse derrière les épaules, grossit avec les doublons
    const k = 1 + Math.min(L.bag, 8) * 0.09;
    rrect(c, -sww - 5 * k, -44 - 6 * k, 2 * sww + 10 * k, 40 * k, 8); fillOl(c, '#2A2A2E', 2.2);
    c.strokeStyle = ACID; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-sww - 2 * k, -42 - 6 * k); c.lineTo(sww + 2 * k, -42 - 6 * k); c.stroke();
  }
  if (tg === 'crop' || tg === 'hoodiecrop') { c.beginPath(); c.moveTo(-hw + 0.5, 4); c.lineTo(-hw + 1.5, -22); c.lineTo(hw - 1.5, -22); c.lineTo(hw - 0.5, 4); c.closePath(); fillOl(c, L.skin, 2.2); }
  const hiw = bot.hw ? -7 : -2;
  c.beginPath(); c.moveTo(-hw - 1.5, hiw); c.lineTo(hw + 1.5, hiw); c.lineTo(hw + 2.5, 9); c.quadraticCurveTo(0, 13, -hw - 2.5, 9); c.closePath(); fillOl(c, pc, 2.2);
  c.fillStyle = shade(pc, 0.7); c.fillRect(-hw - 1, hiw + 0.5, 2 * hw + 2, 2.8);
  if (bot.g === 'jeans') { c.fillStyle = bot.c[2]; c.fillRect(-2, hiw + 0.3, 4, 3.2); }
  const hem = tg === 'crop' ? -17 : tg === 'hoodiecrop' ? -6 : longT ? 8 : 5;
  const bw = longT ? hw + 2.5 : hw + 1;
  if (tg === 'hoodie') { c.beginPath(); c.ellipse(-6, -44, 11, 8, -0.3, 0, TAU); fillOl(c, shade(t1, 0.85), 2.2); }
  c.beginPath(); c.moveTo(-bw, hem); c.quadraticCurveTo(-bw - 2, -16, -sww, -34); c.quadraticCurveTo(-sww + 1, -41, -6, -42.5); c.lineTo(6, -42.5);
  c.quadraticCurveTo(sww - 1, -41, sww, -34); c.quadraticCurveTo(bw + 2, -16, bw, hem); c.quadraticCurveTo(0, hem + 2.5, -bw, hem); c.closePath(); fillOl(c, t1, 2.2);
  c.save(); c.clip(); c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(-bw - 3, -44, 6, 60); c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(bw - 6, -44, 6, 60); c.restore();
  if (tg === 'hoodie' || tg === 'hoodiecrop') { c.fillStyle = shade(t1, 0.8); c.fillRect(-bw + 0.5, hem - 4, 2 * bw - 1, 3.6); }
  if (tg === 'hoodie') { c.beginPath(); c.moveTo(-9, -3); c.lineTo(9, -3); c.lineTo(7, -14); c.lineTo(-7, -14); c.closePath(); c.fillStyle = shade(t1, 0.88); c.fill(); c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 1.2; c.stroke(); }
  if (tg === 'jacket') { c.strokeStyle = ta; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, -41); c.lineTo(0, hem); c.stroke(); }
  if (longT) { c.beginPath(); c.ellipse(0, -41.5, 9.5, 4.6, 0, 0, TAU); fillOl(c, tg === 'hoodie' ? shade(t1, 0.75) : t2, 2); }
  else { c.beginPath(); c.moveTo(-5.5, -42.4); c.quadraticCurveTo(0, -36, 5.5, -42.4); c.closePath(); fillOl(c, L.skin, 1.8); }
  if (tg === 'hoodie') { c.strokeStyle = ta; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-3, -38); c.lineTo(-3.6, -29); c.moveTo(3, -38); c.lineTo(3.6, -30); c.stroke(); }
  drawPrint(c, top.motif, ta, t1, tg);
  if (L.bag > 0) { c.strokeStyle = '#2A2A2E'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(-sww + 3, -38); c.lineTo(-bw + 2, -12); c.moveTo(sww - 3, -38); c.lineTo(bw - 2, -12); c.stroke(); }
  c.restore();
  // bras
  const shL = rot(hip, ln, -sww + 3, -36), shR = rot(hip, ln, sww - 3, -36);
  const arms = [{ s: shL, h: o.hb, pref: o.eb, side: -1 }, { s: shR, h: o.hf, pref: o.ef, side: 1 }];
  const sleeveFull = longT || tg === 'hoodiecrop';
  for (const ar of arms) {
    const r = ik(ar.s.x, ar.s.y, ar.h.x, ar.h.y, 22, 21, ar.pref, ar.side); const e = r.j, hd = r.e;
    if (sleeveFull) {
      stroke2(c, [ar.s.x, ar.s.y, e.x, e.y, hd.x, hd.y], 11, t1);
      const dx = hd.x - e.x, dy = hd.y - e.y, dl = Math.hypot(dx, dy) || 1; c.strokeStyle = shade(t1, 0.75); c.lineWidth = 11; c.lineCap = 'butt'; c.beginPath();
      c.moveTo(hd.x - (dx / dl) * 5, hd.y - (dy / dl) * 5); c.lineTo(hd.x - (dx / dl) * 1.5, hd.y - (dy / dl) * 1.5); c.stroke(); c.lineCap = 'round';
      if (tg === 'jacket') { const mx = ar.s.x + (e.x - ar.s.x) * 0.5, my = ar.s.y + (e.y - ar.s.y) * 0.5; c.strokeStyle = ta; c.lineWidth = 11; c.lineCap = 'butt'; c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + (e.x - ar.s.x) * 0.15, my + (e.y - ar.s.y) * 0.15); c.stroke(); c.lineCap = 'round'; }
    } else {
      stroke2(c, [ar.s.x, ar.s.y, e.x, e.y, hd.x, hd.y], 8.5, L.skin);
      stroke2(c, [ar.s.x, ar.s.y, ar.s.x + (e.x - ar.s.x) * 0.62, ar.s.y + (e.y - ar.s.y) * 0.62], 13, t1);
    }
    if (L.elbows) { c.save(); c.translate(e.x, e.y); c.rotate(Math.atan2(hd.y - e.y, hd.x - e.x)); rrect(c, -5, -7, 11, 14, 5); fillOl(c, L.elbows.c[1], 1.8); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(-2, -5, 4, 2); c.restore(); }
    if (L.wrists) { c.save(); c.translate(hd.x - (hd.x - e.x) * 0.22, hd.y - (hd.y - e.y) * 0.22); c.rotate(Math.atan2(hd.y - e.y, hd.x - e.x)); rrect(c, -5, -6, 9, 12, 2.5); fillOl(c, L.wrists.c[0], 1.6); c.fillStyle = L.wrists.c[1]; c.fillRect(-3.5, -5, 2.4, 10); c.restore(); }
    c.beginPath(); c.arc(hd.x, hd.y, 5.4, 0, TAU); fillOl(c, L.skin, 2.1);
  }
  const nk = rot(hip, ln, 0, -41), hc = rot(hip, ln, 1.5, -57);
  if (!longT) stroke2(c, [nk.x, nk.y, hc.x, hc.y + 6], 8, L.skin, 1.6);
  drawHead(c, hc.x, hc.y, ln * 0.45 + o.tilt, o, L);
}

function drawPrint(c, m, ta, t1, tg) {
  if (!m) return;
  if (m === 'R' || m === 'reflect') {
    if (m === 'reflect') { const bw = tg === 'jacket' ? 15 : 13.5; c.fillStyle = ta; c.fillRect(-bw - 1, -30, 2 * bw + 2, 4.2); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(-bw - 1, -30, 2 * bw + 2, 1.2); }
    const cx = m === 'R' ? 0 : 6, cy = m === 'R' ? -25 : -35, s = m === 'R' ? 7.5 : 3.6;
    octa(c, cx, cy, s); fillOl(c, ACID, m === 'R' ? 1.6 : 1);
    c.fillStyle = INK; c.font = s * 1.6 + 'px ' + DISP; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('R', cx, cy + 0.5);
  } else if (m === 'lamp') {
    c.strokeStyle = ta; c.fillStyle = ta; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-6, -16); c.lineTo(-6, -33); c.lineTo(-1, -33); c.stroke();
    c.fillRect(-2.5, -34, 5, 3); c.globalAlpha = 0.45; c.beginPath(); c.moveTo(-2, -31); c.lineTo(2, -31); c.lineTo(7, -18); c.lineTo(-7, -18); c.fill(); c.globalAlpha = 1;
  } else if (m === 'cone') {
    c.beginPath(); c.moveTo(-6.5, -14); c.lineTo(-1.5, -33); c.lineTo(1.5, -33); c.lineTo(6.5, -14); c.closePath(); fillOl(c, ta, 1.3);
    c.fillStyle = CRAIE; c.fillRect(-4.2, -25, 8.4, 3); c.fillStyle = ta; c.fillRect(-9, -14.5, 18, 2.6); c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(-9, -14.5, 18, 2.6);
  } else if (m === 'night') {
    c.fillStyle = ta; c.beginPath(); c.arc(5, -30, 5, 0, TAU); c.fill(); c.fillStyle = t1; c.beginPath(); c.arc(7.4, -31.5, 4.3, 0, TAU); c.fill();
    c.font = '4.5px ' + DISP; c.textAlign = 'center'; c.fillStyle = ta; c.fillText('NIGHT', -3, -18);
  } else if (m === 'pixel') {
    c.fillStyle = ta; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2 === 0) c.fillRect(-6 + i * 3, -30 + j * 3, 2.6, 2.6);
  }
}

function drawHead(c, x, y, a, o, L) {
  c.save(); c.translate(x, y); c.rotate(a);
  const fem = L.gender === 'f', hd = L.helmet ? { g: 'helmet', c: L.helmet.c } : L.head;
  const hg = hd ? hd.g : null;
  if (fem) {
    const px = o.pony.x, py = o.pony.y;
    c.beginPath(); c.moveTo(-7, -15); c.bezierCurveTo(-24 + px * 0.3, -17 + py * 0.2, -28 + px * 0.6, 0 + py * 0.5, -23 + px, 15 + py);
    c.bezierCurveTo(-21 + px * 0.7, 4 + py * 0.5, -17 + px * 0.3, -4, -12, -3); c.closePath(); fillOl(c, L.hair, 2);
    c.fillStyle = ACID; c.beginPath(); c.ellipse(-12, -11, 2.2, 3.6, 0.5, 0, TAU); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  }
  c.beginPath(); c.ellipse(0, 0, 13.5, 15, 0, 0, TAU); fillOl(c, L.skin, 2.3);
  c.beginPath(); c.ellipse(-6, 2, 3.4, 4.4, 0, 0, TAU); fillOl(c, L.skin, 1.6); c.fillStyle = L.skinSh; c.beginPath(); c.ellipse(-6, 2.3, 1.4, 2.2, 0, 0, TAU); c.fill();
  c.beginPath();
  if (fem) { c.moveTo(-13.5, 6); c.bezierCurveTo(-17, -14, -2, -21, 9, -15); c.quadraticCurveTo(15.5, -10, 13.5, -4); c.quadraticCurveTo(7, -11, 1, -8.5); c.quadraticCurveTo(-5, -6, -8.5, 4); c.closePath(); }
  else { c.moveTo(-13.5, 3); c.bezierCurveTo(-16, -14, -3, -21, 9, -16); c.lineTo(13, -11); c.lineTo(9, -10.5); c.lineTo(7, -12.5); c.lineTo(4.5, -9.5); c.lineTo(1.5, -11.5); c.quadraticCurveTo(-6, -7, -8.5, 3); c.closePath(); }
  fillOl(c, L.hair, 2);
  const ey = o.blink ? 0.35 : 2.5; c.fillStyle = INK;
  c.beginPath(); c.ellipse(4.2, -1, 1.7, ey, 0, 0, TAU); c.ellipse(10.6, -1.4, 1.6, ey * 0.95, 0, 0, TAU); c.fill();
  if (!o.blink) { c.fillStyle = '#fff'; c.beginPath(); c.arc(4.7, -1.9, 0.6, 0, TAU); c.arc(11, -2.3, 0.55, 0, TAU); c.fill(); }
  c.strokeStyle = INK; c.lineWidth = 1.3; c.beginPath(); c.moveTo(2, -6); c.lineTo(6.3, -6.6); c.moveTo(9.2, -6.9); c.lineTo(12.6, -6.2); c.stroke();
  c.strokeStyle = L.skinSh; c.lineWidth = 1.5; c.beginPath(); c.moveTo(13.6, 0); c.quadraticCurveTo(16, 4, 13, 4.6); c.stroke();
  c.strokeStyle = L.lip; c.lineWidth = 1.5; c.beginPath(); c.moveTo(6, 8.2); c.quadraticCurveTo(9, o.smile ? 11.5 : 9.8, 11.6, 7.6); c.stroke();
  c.fillStyle = 'rgba(255,110,90,.22)'; c.beginPath(); c.arc(2.5, 4.5, 2.6, 0, TAU); c.fill();
  if (hd) {
    const [h1, , h3] = hd.c;
    if (hg === 'cap') {
      c.beginPath(); c.moveTo(-14.2, -3); c.bezierCurveTo(-15.5, -21, 11, -23, 13.6, -5); c.quadraticCurveTo(0, -7.5, -14.2, -3); c.closePath(); fillOl(c, h1, 2.2);
      c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -19); c.quadraticCurveTo(2, -12, 1.5, -6); c.stroke();
      c.beginPath(); c.moveTo(8, -6.5); c.quadraticCurveTo(20, -9, 27, -3.5); c.quadraticCurveTo(19, -1.5, 8, -3.5); c.closePath(); fillOl(c, shade(h1, 0.7), 2);
      rrect(c, 1, -14, 7.5, 5.5, 1.2); fillOl(c, h3, 1.2); c.beginPath(); c.arc(-1, -19.6, 1.6, 0, TAU); fillOl(c, h1, 1);
    } else if (hg === 'beanie') {
      c.beginPath(); c.moveTo(-15, -6); c.bezierCurveTo(-16.5, -30, 13.5, -31, 15, -6); c.closePath(); fillOl(c, h1, 2.2);
      c.strokeStyle = shade(h1, 0.82); c.lineWidth = 1.1; c.beginPath(); for (let i = -10; i <= 10; i += 4) { c.moveTo(i, -9); c.lineTo(i * 0.8, -23); } c.stroke();
      rrect(c, -16, -13.5, 32, 7.5, 3); fillOl(c, shade(h1, 0.9), 2); c.fillStyle = h3; c.fillRect(4, -12, 6, 4.5);
    } else if (hg === 'helmet') {
      c.beginPath(); c.moveTo(-16.5, 3); c.bezierCurveTo(-19, -28, 15, -31, 16.5, -8); c.lineTo(14, -7); c.quadraticCurveTo(-2, -8, -16.5, 3); c.closePath(); fillOl(c, h1, 2.3);
      c.strokeStyle = h3; c.lineWidth = 3; c.beginPath(); c.moveTo(-13, -14); c.quadraticCurveTo(-1, -24, 11, -15); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.ellipse(-4, -16, 6, 2.5, -0.3, 0, TAU); c.fill();
      c.strokeStyle = INK; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-9, -4); c.quadraticCurveTo(-6, 10, 4, 13.5); c.stroke();
    }
  }
  c.restore();
}

/* ---------------------------------------------------------------- planche vue de côté */
const DECKU = []; for (let u = -47; u <= 47; u += 4.7) DECKU.push(u);
const kickY = (u) => { const a = Math.abs(u); return a > 33 ? (a - 33) * 0.6 : 0; };
const DEF_DECK = { c: ['#141416', '#C9A26B', ACID], motif: 'lamp' };
export function drawBoardSide(c, b, L) {
  c.save(); c.translate(b.x, b.y); c.rotate(b.pitch);
  const cr = Math.cos(b.roll), sr = Math.sin(b.roll); let cy = Math.cos(b.yaw); if (Math.abs(cy) < 0.24) cy = cy < 0 ? -0.24 : 0.24;
  const half = 11, t = 2.6, top = [], bot = [];
  for (const u of DECKU) { const k = kickY(u); const ctr = -k * cr + t * 0.5 * cr, hh = half * Math.abs(sr) + t * 0.5 * Math.abs(cr) + 0.3; top.push(u * cy, ctr - hh); bot.push(u * cy, ctr + hh); }
  const wc = L.wheels ? L.wheels.c[0] : CRAIE, hub = L.bearings ? L.bearings.c[1] : 'rgba(0,0,0,.25)';
  const tc = L.trucks ? L.trucks.c : ['#B9BEC4', '#8A8F95'];
  const dk = L.deck || DEF_DECK, grip = L.griptape ? L.griptape.c : ['#1C1C1F', '#1C1C1F', '#E8E1D0'];
  const truck = (front) => {
    const u = (front ? 27 : -27) * cy, by = t * cr;
    for (const side of [-1, 1]) {
      const wy = by + 13 * cr + side * 10 * sr;
      c.beginPath(); c.ellipse(u, wy, 6.2 * Math.max(0.35, Math.abs(cy)), 6.2 * Math.max(0.55, Math.abs(cr)), 0, 0, TAU); fillOl(c, side * sr > 0 ? shade(wc, 0.7) : wc, 1.8);
      c.fillStyle = hub; c.beginPath(); c.arc(u, wy, 1.9, 0, TAU); c.fill();
    }
    c.strokeStyle = INK; c.lineWidth = 5.2; c.beginPath(); c.moveTo(u, by); c.lineTo(u, by + 11 * cr); c.stroke(); c.strokeStyle = tc[0]; c.lineWidth = 3; c.stroke();
    c.beginPath(); c.moveTo(u - 6 * Math.abs(cy), by + 1.5 * cr); c.lineTo(u + 6 * Math.abs(cy), by + 1.5 * cr); c.strokeStyle = INK; c.lineWidth = 4; c.stroke(); c.strokeStyle = tc[1]; c.lineWidth = 2; c.stroke();
  };
  if (cr >= 0) { truck(false); truck(true); }
  c.beginPath(); c.moveTo(top[0], top[1]); for (let i = 2; i < top.length; i += 2) c.lineTo(top[i], top[i + 1]); for (let i = bot.length - 2; i >= 0; i -= 2) c.lineTo(bot[i], bot[i + 1]); c.closePath();
  if (Math.abs(sr) < 0.28) {
    c.fillStyle = dk.c[1]; c.fill(); c.save(); c.clip(); c.fillStyle = grip[0]; const gy = cr >= 0 ? -1 : 1;
    c.beginPath(); for (let i = 0; i < top.length; i += 2) { const yy = cr >= 0 ? top[i + 1] : bot[i + 1]; c.lineTo(top[i], yy + gy * -1.8); } for (let i = top.length - 2; i >= 0; i -= 2) { const yy = cr >= 0 ? top[i + 1] : bot[i + 1]; c.lineTo(top[i], yy - gy * 1.4); } c.fill();
    c.restore(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
  } else if (sr > 0) {
    c.fillStyle = grip[0]; c.fill(); c.save(); c.clip(); c.fillStyle = grip[2] || 'rgba(255,255,255,.1)'; c.globalAlpha = 0.18; for (let i = 0; i < 14; i++) c.fillRect(-40 + i * 6, -8 + ((i * 7) % 9), 1.2, 1.2); c.globalAlpha = 1; c.restore(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
  } else { c.save(); c.clip(); c.translate(0, t * 0.5 * cr); c.transform(cy, 0, 0, -sr, 0, 0); drawDeckGraphic(c, dk); c.restore(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); }
  if (cr < 0) { truck(false); truck(true); }
  c.restore();
}
// graphisme du dessous de plateau, repère (u = longueur -52..52, w = largeur -14..14)
export function drawDeckGraphic(c, dk) {
  const [c0, , ca] = dk.c; c.fillStyle = c0; c.fillRect(-52, -16, 104, 32);
  const m = dk.motif;
  if (m === 'lamp') {
    c.strokeStyle = ca; c.lineWidth = 2.6; c.beginPath(); c.moveTo(-30, 6); c.lineTo(22, 6); c.lineTo(22, -2); c.stroke(); c.fillStyle = ca; c.fillRect(18, -5, 9, 4);
    c.globalAlpha = 0.4; c.beginPath(); c.moveTo(19, -1); c.lineTo(26, -1); c.lineTo(40, 10); c.lineTo(8, 10); c.fill(); c.globalAlpha = 1; octa(c, -38, 0, 5); c.fill();
  } else if (m === 'cone') {
    c.fillStyle = ca; for (const s of [-1, 1]) { c.fillRect(s * 36 - 3, -14, 6, 28); c.fillRect(s * 44 - 1.5, -14, 3, 28); }
    c.beginPath(); c.moveTo(-20, -9); c.lineTo(-20, 9); c.lineTo(22, 1.5); c.lineTo(22, -1.5); c.closePath(); c.fill(); c.fillStyle = CRAIE; c.fillRect(-6, -6, 5, 12); c.fillRect(6, -3.5, 4, 7);
  } else if (m === 'pixel') {
    const P2 = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];
    for (let r = 0; r < P2.length; r++) for (let q = 0; q < 7; q++) if (P2[r][q] === '1') { c.fillStyle = r < 2 ? ACID : ca; c.fillRect(-36 + q * 3.2, -9 + r * 3.2, 3, 3); }
    c.fillStyle = ca; for (let i = 0; i < 9; i++) for (let j = 0; j < 2; j++) if ((i + j) % 2 === 0) c.fillRect(-4 + i * 4, -5 + j * 6, 3.4, 3.4);
    c.fillStyle = ACID; c.fillRect(34, -10, 3, 20);
  } else if (m === 'R') { octa(c, 0, 0, 9); c.fillStyle = ca; c.fill(); c.fillStyle = INK; c.font = '14px ' + DISP; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('R', 0, 1); }
  else { c.fillStyle = ca; for (let i = -3; i <= 3; i++) c.fillRect(i * 12 - 2, -14, 4, 28); }
}
// planche debout, dessous visible (garde-robe, vestiaire)
export function drawBoardPlan(c, L, withTrucks = true) {
  const dk = L.deck || DEF_DECK, wc = L.wheels ? L.wheels.c[0] : CRAIE, tc = L.trucks ? L.trucks.c : ['#C3C8CE', '#8A8F95'];
  if (withTrucks) for (const u of [-31, 31]) for (const s of [-1, 1]) { rrect(c, u - 5.5, s * 14.5 - 5, 11, 10, 3); fillOl(c, wc, 2); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(u - 5.5, s * 14.5 - 0.6, 11, 1.2); }
  c.beginPath(); c.moveTo(-34, -15); c.lineTo(34, -15); c.bezierCurveTo(52, -15, 53, 15, 34, 15); c.lineTo(-34, 15); c.bezierCurveTo(-53, 15, -52, -15, -34, -15); c.closePath();
  c.save(); c.clip(); drawDeckGraphic(c, dk); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(-52, -15, 104, 4); c.restore();
  c.strokeStyle = dk.c[1]; c.lineWidth = 3.5; c.stroke(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
  if (withTrucks) for (const u of [-31, 31]) { rrect(c, u - 4, -11, 8, 22, 3); fillOl(c, tc[0], 1.8); c.fillStyle = tc[1]; c.fillRect(u - 1, -9, 2, 18); c.beginPath(); c.arc(u, 0, 3, 0, TAU); fillOl(c, tc[1], 1.4); }
}

/* ---------------------------------------------------------------- icônes produits (boîte 100 x 100) */
export function drawIcon(c, p, piece, byId) {
  const [c0, c1, c2] = piece.c, m = piece.motif;
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  const g = p.gabarit;
  if (g === 'tshirt' || g === 'hoodie' || g === 'jacket') {
    const crop = !!(p.specs && p.specs.crop), longS = g !== 'tshirt', bh = crop ? 64 : 84;
    c.beginPath(); c.moveTo(36, 18); c.lineTo(18, 24); c.lineTo(longS ? 8 : 10, longS ? 74 : 46); c.lineTo(longS ? 20 : 24, longS ? 76 : 50); c.lineTo(28, 40); c.lineTo(28, bh); c.lineTo(72, bh); c.lineTo(72, 40);
    c.lineTo(longS ? 80 : 76, longS ? 76 : 50); c.lineTo(longS ? 92 : 90, longS ? 74 : 46); c.lineTo(82, 24); c.lineTo(64, 18); c.quadraticCurveTo(50, 28, 36, 18); c.closePath(); fillOl(c, c0, 3);
    if (g === 'hoodie') { c.beginPath(); c.ellipse(50, 20, 15, 7, 0, 0, TAU); fillOl(c, shade(c0, 0.8), 2.5); if (!crop) { rrect(c, 37, 58, 26, 14, 4); fillOl(c, shade(c0, 0.88), 2); } c.strokeStyle = c2; c.lineWidth = 2; c.beginPath(); c.moveTo(46, 26); c.lineTo(45, 38); c.moveTo(54, 26); c.lineTo(55, 38); c.stroke(); }
    if (g === 'jacket') { c.strokeStyle = c2; c.lineWidth = 2; c.beginPath(); c.moveTo(50, 22); c.lineTo(50, bh); c.stroke(); }
    c.save(); c.translate(50, 70); c.scale(1.35, 1.35); drawPrint(c, m, c2, c0, g === 'jacket' ? 'jacket' : 'tshirt'); c.restore();
  } else if (g === 'jeans' || g === 'cargo' || g === 'shorts') {
    const len = g === 'shorts' ? 56 : 90;
    c.beginPath(); c.moveTo(28, 10); c.lineTo(72, 10); c.lineTo(78, len); c.lineTo(54, len); c.lineTo(50, 34); c.lineTo(46, len); c.lineTo(22, len); c.closePath(); fillOl(c, c0, 3);
    c.fillStyle = shade(c0, 0.7); c.fillRect(29, 11, 42, 6); if (g === 'jeans') { c.strokeStyle = c2; c.lineWidth = 1.4; c.beginPath(); c.moveTo(34, 18); c.lineTo(30, len - 2); c.moveTo(66, 18); c.lineTo(70, len - 2); c.stroke(); }
    if (g === 'cargo') { for (const x of [27, 61]) { rrect(c, x, 46, 13, 15, 2); fillOl(c, c1, 2); } }
  } else if (g === 'cap') {
    c.beginPath(); c.moveTo(18, 62); c.bezierCurveTo(16, 22, 74, 18, 76, 60); c.closePath(); fillOl(c, c0, 3);
    c.beginPath(); c.moveTo(60, 58); c.quadraticCurveTo(84, 54, 94, 66); c.quadraticCurveTo(80, 70, 60, 64); c.closePath(); fillOl(c, shade(c0, 0.7), 2.5);
    rrect(c, 38, 36, 16, 12, 2); fillOl(c, c2, 2);
  } else if (g === 'beanie') {
    c.beginPath(); c.moveTo(20, 60); c.bezierCurveTo(16, 8, 84, 8, 80, 60); c.closePath(); fillOl(c, c0, 3);
    c.strokeStyle = shade(c0, 0.8); c.lineWidth = 2; c.beginPath(); for (let x = 30; x <= 70; x += 8) { c.moveTo(x, 54); c.lineTo(x, 24); } c.stroke();
    rrect(c, 16, 54, 68, 18, 6); fillOl(c, shade(c0, 0.9), 3); c.fillStyle = c2; c.fillRect(56, 58, 12, 9);
  } else if (g === 'helmet') {
    c.beginPath(); c.moveTo(14, 70); c.bezierCurveTo(10, 10, 90, 10, 86, 62); c.lineTo(80, 64); c.quadraticCurveTo(46, 58, 14, 70); c.closePath(); fillOl(c, c0, 3);
    c.strokeStyle = c2; c.lineWidth = 6; c.beginPath(); c.moveTo(24, 40); c.quadraticCurveTo(50, 18, 76, 38); c.stroke();
  } else if (g === 'sneakers_low' || g === 'sneakers_high') {
    const hi = g === 'sneakers_high';
    c.beginPath(); c.moveTo(12, 74); c.lineTo(12, hi ? 22 : 44); c.lineTo(hi ? 40 : 34, hi ? 20 : 40); c.quadraticCurveTo(54, 50, 74, 54); c.quadraticCurveTo(92, 58, 90, 74); c.closePath(); fillOl(c, c0, 3);
    rrect(c, 10, 70, 82, 10, 3); fillOl(c, c1, 2.5); if (hi) { c.fillStyle = c2; c.fillRect(14, 30, 26, 6); }
    c.strokeStyle = lum(c0) > 0.5 ? shade(c0, 0.55) : CRAIE; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 3; i++) { c.moveTo(42 + i * 7, 46 + i * 3); c.lineTo(48 + i * 7, 42 + i * 3); } c.stroke();
    if (lum(c2) > 0.4 && !hi) { c.fillStyle = c2; c.beginPath(); c.arc(30, 58, 5, 0, TAU); c.fill(); }
  } else if (g === 'kneepads' || g === 'elbowpads') {
    rrect(c, 24, 14, 52, 74, 22); fillOl(c, c0, 3); rrect(c, 31, 22, 38, 46, 16); fillOl(c, c1, 2.5); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(38, 28, 14, 5);
    c.fillStyle = c2; c.fillRect(24, 74, 52, 5);
  } else if (g === 'wristguards') {
    rrect(c, 26, 12, 48, 78, 10); fillOl(c, c0, 3); rrect(c, 40, 16, 10, 70, 4); fillOl(c, c1, 2); c.fillStyle = c1; c.fillRect(28, 30, 44, 4); c.fillRect(28, 66, 44, 4);
  } else if (g === 'deck' || g === 'complete') {
    c.translate(50, 50); c.rotate(-Math.PI / 4); c.scale(0.82, 0.82); drawBoardPlan(c, { deck: piece, wheels: g === 'complete' ? { c: ['#F3F0E8'] } : null }, g === 'complete');
  } else if (g === 'wheels') {
    for (const [x, y] of [[34, 40], [62, 62]]) { c.beginPath(); c.arc(x, y, 24, 0, TAU); fillOl(c, c0, 3); c.beginPath(); c.arc(x, y, 9, 0, TAU); fillOl(c, c1, 2); }
  } else if (g === 'trucks') {
    rrect(c, 12, 30, 76, 14, 6); fillOl(c, c0, 3); rrect(c, 36, 44, 28, 24, 4); fillOl(c, c1, 3); c.fillStyle = c2; c.beginPath(); c.arc(50, 37, 4, 0, TAU); c.fill();
  } else if (g === 'bearings') {
    for (const [x, y] of [[36, 40], [64, 60]]) { c.beginPath(); c.arc(x, y, 20, 0, TAU); fillOl(c, c0, 3); c.beginPath(); c.arc(x, y, 12, 0, TAU); fillOl(c, c1, 2); c.beginPath(); c.arc(x, y, 5, 0, TAU); fillOl(c, c2, 2); }
  } else if (g === 'griptape') {
    c.save(); c.translate(50, 50); c.rotate(-0.3); rrect(c, -22, -40, 44, 80, 8); fillOl(c, c0, 3); c.fillStyle = c2; c.globalAlpha = 0.35; for (let i = 0; i < 40; i++) c.fillRect(-18 + ((i * 13) % 36), -36 + ((i * 29) % 72), 2, 2); c.globalAlpha = 1; c.restore();
  } else if (g === 'look' || p.slot === 'pack') {
    const ids = (p.pack_items || []).slice(0, 3);
    ids.forEach((id, i) => { const q = byId && byId.get(id); if (!q) return; c.save(); c.translate(6 + i * 22, 6 + (i % 2) * 14); c.scale(0.62, 0.62); drawIcon(c, q, { c: [q.colors.primary, q.colors.secondary, q.colors.accent], motif: null }, byId); c.restore(); });
  }
  c.restore();
}

/* ---------------------------------------------------------------- objets à attraper */
const TOKEN = { bronze: ['#D98A4A', '#8A4E22'], silver: ['#DDE3EA', '#7E8894'], gold: ['#FFD54A', '#B07A10'] };
export function drawToken(c, tier, t, label) {
  const [a, b] = TOKEN[tier] || TOKEN.bronze, s = Math.cos(t * 3);
  c.save(); c.scale(Math.max(0.15, Math.abs(s)), 1);
  c.beginPath(); c.arc(0, 0, 26, 0, TAU); fillOl(c, b, 3); c.beginPath(); c.arc(0, -1.5, 22, 0, TAU); c.fillStyle = a; c.fill();
  c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; c.beginPath(); c.arc(0, -1.5, 17, -2.6, -0.8); c.stroke();
  c.fillStyle = INK; c.font = '18px ' + DISP; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label || '%', 0, 0);
  c.restore();
}
export function drawBonus(c, kind) {
  c.beginPath(); c.arc(0, 0, 22, 0, TAU); fillOl(c, kind === 'boost' ? CONE : '#7C5CFF', 3);
  c.fillStyle = CRAIE; c.strokeStyle = INK; c.lineWidth = 2;
  if (kind === 'boost') { c.beginPath(); c.moveTo(3, -15); c.lineTo(-9, 2); c.lineTo(-1, 2); c.lineTo(-4, 15); c.lineTo(9, -3); c.lineTo(1, -3); c.closePath(); c.fill(); c.stroke(); }
  else { c.lineWidth = 7; c.strokeStyle = CRAIE; c.beginPath(); c.arc(0, -2, 9, Math.PI, 0); c.lineTo(9, 9); c.moveTo(-9, -2); c.lineTo(-9, 9); c.stroke(); c.fillStyle = INK; c.fillRect(-12.5, 6, 7, 5); c.fillRect(5.5, 6, 7, 5); }
}
