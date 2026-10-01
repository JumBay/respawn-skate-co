// Textures dessinées en code (canvas 2D) : béton, rampes, graffitis, néons, ciel, imprimés.
// Aucune image externe : tout est généré au chargement, une seule fois.
import * as THREE from 'three';
import { PALETTE } from '../config.js';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// Petit générateur pseudo-aléatoire déterministe (même parc à chaque visite).
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toTexture(c, { repeat = null, srgb = true, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  t.anisotropy = aniso;
  t.needsUpdate = true;
  return t;
}

function speckle(ctx, w, h, n, r, colors, rand) {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = colors[(rand() * colors.length) | 0];
    const s = r * (0.4 + rand());
    ctx.fillRect(rand() * w, rand() * h, s, s);
  }
}

// Béton de la dalle : grain, taches, joints de dilatation, traces de wax.
export function concreteTexture(size = 512, seed = 3) {
  const c = canvas(size, size), ctx = c.getContext('2d'), R = rng(seed);
  ctx.fillStyle = '#b9b3bd';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 40; i++) {
    const x = R() * size, y = R() * size, r = 20 + R() * 90;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const dark = R() < 0.6;
    g.addColorStop(0, dark ? 'rgba(60,40,70,0.12)' : 'rgba(255,255,255,0.10)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  speckle(ctx, size, size, 6000, 1.6, ['#a7a1ab', '#c6c0ca', '#9d97a3', '#cfc9d1', '#b0aab5'], R);
  // joints
  ctx.strokeStyle = 'rgba(60,45,75,0.55)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(size, 1); ctx.moveTo(1, 0); ctx.lineTo(1, size); ctx.stroke();
  ctx.strokeStyle = 'rgba(90,90,100,0.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(size, 4); ctx.moveTo(4, 0); ctx.lineTo(4, size); ctx.stroke();
  // fissures
  ctx.strokeStyle = 'rgba(70,55,85,0.35)'; ctx.lineWidth = 1.2;
  for (let k = 0; k < 4; k++) {
    let x = R() * size, y = R() * size; ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 0; i < 14; i++) { x += (R() - 0.5) * 30; y += (R() - 0.3) * 24; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  // traces de roues et de wax
  ctx.strokeStyle = 'rgba(40,30,50,0.10)'; ctx.lineWidth = 4;
  for (let k = 0; k < 6; k++) {
    const y = R() * size; ctx.beginPath(); ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.3, y + (R() - 0.5) * 120, size * 0.6, y + (R() - 0.5) * 120, size, y + (R() - 0.5) * 60); ctx.stroke();
  }
  return toTexture(c);
}

// Surface des rampes : panneaux lisses gris bleuté, rayures de planche.
export function rampTexture(size = 512, seed = 7) {
  const c = canvas(size, size), ctx = c.getContext('2d'), R = rng(seed);
  const g = ctx.createLinearGradient(0, 0, 0, size);
  g.addColorStop(0, '#f4f4f7'); g.addColorStop(1, '#e6e6ec');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  speckle(ctx, size, size, 3000, 1.2, ['#dcdce4', '#ffffff', '#d2d2da'], R);
  ctx.strokeStyle = 'rgba(30,20,50,0.35)'; ctx.lineWidth = 2;
  for (let i = 0; i <= 4; i++) { const y = (i / 4) * size; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size); ctx.stroke();
  // vis
  ctx.fillStyle = 'rgba(40,30,60,0.35)';
  for (let i = 0; i <= 4; i++) for (let j = 0; j < 8; j++) ctx.fillRect(j * size / 8 + 6, i * size / 4 + 4, 3, 3);
  ctx.strokeStyle = 'rgba(30,20,50,0.18)'; ctx.lineWidth = 1;
  for (let k = 0; k < 60; k++) {
    const x = R() * size, y = R() * size, l = 20 + R() * 80, a = (R() - 0.5) * 0.6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
  }
  return toTexture(c);
}

// Asphalte hors du park (plus sombre, gros grain).
export function asphaltTexture(size = 256, seed = 11) {
  const c = canvas(size, size), ctx = c.getContext('2d'), R = rng(seed);
  ctx.fillStyle = PALETTE.asphalt; ctx.fillRect(0, 0, size, size);
  speckle(ctx, size, size, 6000, 1.4, ['#1d1d21', '#26262b', '#0f0f12', '#2e2e33'], R);
  return toTexture(c);
}

// Graffiti générique : lettres épaisses à contour, ombre portée, coulures, étoiles.
const GRAFF_SETS = [
  { fill: [PALETTE.acid, '#7dff6a'], line: '#0b0b0d', glow: '#2b6bff' },
  { fill: [PALETTE.cone, '#ffd23e'], line: '#140a05', glow: '#ff2e88' },
  { fill: ['#ff5ec4', '#7c5cff'], line: '#0d0612', glow: PALETTE.acid },
  { fill: ['#4fd8ff', '#2e7bff'], line: '#04101a', glow: PALETTE.cone },
  { fill: [PALETTE.chalk, '#cfc9bb'], line: '#101012', glow: '#ff2e2e' },
];
export function graffitiTexture(word, variant = 0, seed = 5) {
  const W = 1024, H = 384, c = canvas(W, H), ctx = c.getContext('2d'), R = rng(seed);
  const set = GRAFF_SETS[variant % GRAFF_SETS.length];
  ctx.clearRect(0, 0, W, H);
  // nuage de bombe derrière
  for (let i = 0; i < 26; i++) {
    const x = W * 0.1 + R() * W * 0.8, y = H * 0.25 + R() * H * 0.5, r = 40 + R() * 90;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, set.glow + '55'); g.addColorStop(1, set.glow + '00');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const fontSize = Math.min(230, (W * 0.86) / Math.max(3, word.length) * 1.55);
  ctx.font = `900 ${fontSize}px Impact, 'Arial Black', sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.save();
  ctx.translate(W / 2, H / 2 + 6);
  ctx.rotate(-0.06 + R() * 0.05);
  ctx.transform(1, 0, -0.18, 1, 0, 0);
  // ombre 3D
  for (let d = 14; d > 0; d -= 2) { ctx.fillStyle = '#050507'; ctx.fillText(word, d, d); }
  ctx.lineJoin = 'round';
  ctx.lineWidth = 26; ctx.strokeStyle = set.line; ctx.strokeText(word, 0, 0);
  ctx.lineWidth = 10; ctx.strokeStyle = '#ffffff'; ctx.strokeText(word, 0, 0);
  const g = ctx.createLinearGradient(0, -fontSize / 2, 0, fontSize / 2);
  g.addColorStop(0, set.fill[0]); g.addColorStop(1, set.fill[1]);
  ctx.fillStyle = g; ctx.fillText(word, 0, 0);
  // reflets
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillRect(-W / 2, -fontSize * 0.42, W, fontSize * 0.12);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
  // coulures
  ctx.fillStyle = set.fill[1];
  for (let i = 0; i < 9; i++) {
    const x = W * 0.15 + R() * W * 0.7, y = H * 0.62 + R() * 30, l = 20 + R() * 70;
    ctx.fillRect(x, y, 4, l); ctx.beginPath(); ctx.arc(x + 2, y + l, 4, 0, Math.PI * 2); ctx.fill();
  }
  // étoiles et éclats
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 5; i++) {
    const x = R() * W, y = R() * H * 0.4 + 10, s = 8 + R() * 14;
    ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.25, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s * 0.25, y); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x, y + s * 0.25); ctx.lineTo(x + s, y); ctx.lineTo(x, y - s * 0.25); ctx.closePath(); ctx.fill();
  }
  return toTexture(c, { aniso: 4 });
}

// Enseigne néon : tube lumineux tracé avec halo (pour le bloom).
export function neonTexture(text, color, { w = 1024, h = 256, font = 'italic 900 150px "Arial Black", Impact, sans-serif' } = {}) {
  const c = canvas(w, h), ctx = c.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.shadowColor = color; ctx.shadowBlur = 40;
  ctx.strokeStyle = color; ctx.lineWidth = 14; ctx.strokeText(text, w / 2, h / 2);
  ctx.shadowBlur = 16; ctx.lineWidth = 8; ctx.strokeText(text, w / 2, h / 2);
  ctx.shadowBlur = 0; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.strokeText(text, w / 2, h / 2);
  return toTexture(c, { aniso: 4 });
}

// Façades lointaines : fenêtres allumées au hasard.
export function windowsTexture(seed = 13) {
  const W = 256, H = 512, c = canvas(W, H), ctx = c.getContext('2d'), R = rng(seed);
  ctx.fillStyle = '#0d0e15'; ctx.fillRect(0, 0, W, H);
  for (let y = 8; y < H - 8; y += 22) {
    for (let x = 8; x < W - 8; x += 18) {
      const on = R() < 0.32;
      ctx.fillStyle = on ? (R() < 0.7 ? '#ffcf7a' : (R() < 0.5 ? '#9fd8ff' : '#c8ff2e')) : '#151722';
      ctx.globalAlpha = on ? 0.55 + R() * 0.45 : 1;
      ctx.fillRect(x, y, 10, 13);
    }
  }
  ctx.globalAlpha = 1;
  return toTexture(c, { aniso: 2 });
}

// Grillage (alpha) pour la clôture.
export function fenceTexture() {
  const S = 128, c = canvas(S, S), ctx = c.getContext('2d');
  ctx.clearRect(0, 0, S, S);
  ctx.strokeStyle = '#9aa0aa'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(S, S); ctx.moveTo(S, 0); ctx.lineTo(0, S);
  ctx.moveTo(-S / 2, S / 2); ctx.lineTo(S / 2, S * 1.5); ctx.moveTo(S / 2, -S / 2); ctx.lineTo(S * 1.5, S / 2);
  ctx.stroke();
  const t = toTexture(c, { srgb: true, aniso: 4 });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Halo de lampadaire posé au sol (additif).
export function glowTexture(color = '#ffb25c') {
  const S = 256, c = canvas(S, S), ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, color + 'cc'); g.addColorStop(0.35, color + '55'); g.addColorStop(1, color + '00');
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  return toTexture(c, { aniso: 1 });
}

// Ombre de contact peinte (sous le skater sur téléphone).
export function blobShadowTexture() {
  const S = 128, c = canvas(S, S), ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  return toTexture(c, { aniso: 1 });
}

// Grip de la planche : papier de verre noir.
export function gripTexture(color = '#111114', seed = 21) {
  const S = 256, c = canvas(S, S), ctx = c.getContext('2d'), R = rng(seed);
  ctx.fillStyle = color; ctx.fillRect(0, 0, S, S);
  speckle(ctx, S, S, 5000, 1.2, ['#1b1b1f', '#2a2a30', '#0a0a0c'], R);
  return toTexture(c);
}

// Charge une image (graphisme d'un produit) en canvas si le serveur l'autorise (CORS).
const imageCache = new Map();
export function loadImage(url) {
  if (!url) return Promise.resolve(null);
  if (imageCache.has(url)) return imageCache.get(url);
  const p = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
    setTimeout(() => resolve(null), 8000);
  });
  imageCache.set(url, p);
  return p;
}

// Dessous de plateau : le graphisme du produit s'il charge, sinon une composition à ses couleurs.
export function deckGraphicCanvas(product, img) {
  const W = 1024, H = 256, c = canvas(W, H), ctx = c.getContext('2d');
  const col = (product && product.colors) || {};
  const p = col.primary || PALETTE.acid, s = col.secondary || PALETTE.asphalt, a = col.accent || PALETTE.cone;
  ctx.fillStyle = p; ctx.fillRect(0, 0, W, H);
  if (img) {
    if (img.height > img.width) {
      // graphisme en portrait (nose en haut) : on le couche, nose côté droit (= nez de la planche)
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -H / 2, -W / 2, H, W);
      ctx.restore();
    } else {
      const r = Math.max(W / img.width, H / img.height);
      const iw = img.width * r, ih = img.height * r;
      ctx.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
    }
    return c;
  }
  const R = rng((product && product.id) || 9);
  ctx.fillStyle = s;
  for (let i = 0; i < 7; i++) { ctx.save(); ctx.translate(R() * W, H / 2); ctx.rotate(0.5); ctx.fillRect(-6, -H, 18 + R() * 30, H * 2); ctx.restore(); }
  ctx.fillStyle = a; ctx.beginPath(); ctx.arc(W * 0.28, H / 2, H * 0.34, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = s; ctx.beginPath(); ctx.arc(W * 0.28, H / 2, H * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.font = `italic 900 ${H * 0.36}px Impact, 'Arial Black', sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 10; ctx.strokeStyle = s; ctx.strokeText('RESPAWN', W * 0.64, H / 2);
  ctx.fillStyle = PALETTE.chalk; ctx.fillText('RESPAWN', W * 0.64, H / 2);
  return c;
}

// Imprimé de vêtement (poitrine) : le graphisme du produit, sinon un logo à ses couleurs.
export function printCanvas(product, img) {
  const S = 256, c = canvas(S, S), ctx = c.getContext('2d');
  ctx.clearRect(0, 0, S, S);
  if (img) {
    const r = Math.min(S / img.width, S / img.height);
    ctx.drawImage(img, (S - img.width * r) / 2, (S - img.height * r) / 2, img.width * r, img.height * r);
    return c;
  }
  const col = (product && product.colors) || {};
  const a = col.accent || PALETTE.acid, s = col.secondary || PALETTE.chalk;
  ctx.fillStyle = a; ctx.beginPath(); ctx.arc(S / 2, S / 2 - 18, 74, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = col.primary || PALETTE.asphalt;
  ctx.font = `italic 900 120px Impact, 'Arial Black', sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('R', S / 2, S / 2 - 14);
  ctx.fillStyle = s; ctx.font = `900 34px Impact, 'Arial Black', sans-serif`;
  ctx.fillText('RESPAWN', S / 2, S - 34);
  return c;
}

export function canvasTexture(c) { return toTexture(c, { aniso: 4 }); }
