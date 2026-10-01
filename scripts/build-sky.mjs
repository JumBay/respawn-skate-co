// Fond de ciel composé à partir de deux HDRI CC0 Poly Haven :
//  - la ville (toits de Johannesburg, « sunset_jhbcentral ») découpée colonne par colonne,
//    l'enseigne de marque visible sur une tour effacée ;
//  - le ciel doré de « industrial_sunset_02_puresky » à la place du ciel couvert.
// Sortie : public/env/sky_4k.jpg (bureau), public/env/sky_2k.jpg (téléphone).
//   node scripts/build-sky.mjs
import sharp from 'sharp';
import fs from 'node:fs';

const CITY = 'raw/ph/sunset_jhbcentral_tonemapped.jpg';
const SKY = 'raw/ph/industrial_sunset_02_puresky_tonemapped.jpg';
const W = 4096, H = 2048;

const city = (await sharp(CITY, { limitInputPixels: false }).resize(W, H).raw().toBuffer({ resolveWithObject: true })).data;
const sky = (await sharp(SKY, { limitInputPixels: false }).resize(W, H).raw().toBuffer({ resolveWithObject: true })).data;

// 1. enseigne « Hollard » (tour à droite) : on repeint le bandeau en façade sombre
{
  const s = W / 8192;
  const x0 = Math.round(4292 * s), x1 = Math.round(4462 * s), y0 = Math.round(1632 * s), y1 = Math.round(1672 * s);
  // couleur de la façade juste en dessous du bandeau
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = y1 + 4; y < y1 + 14; y++) for (let x = x0 + 4; x < x1 - 4; x++) { const i = (y * W + x) * 3; r += city[i]; g += city[i + 1]; b += city[i + 2]; n++; }
  r /= n; g /= n; b /= n;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * W + x) * 3, k = 0.85 + 0.15 * Math.random();
    city[i] = r * k; city[i + 1] = g * k; city[i + 2] = b * k;
  }
}

// 2. silhouette de la ville : par colonne, première rangée qui n'est plus du ciel
const isSky = (x, y) => {
  const i = (y * W + x) * 3; const r = city[i] / 255, g = city[i + 1] / 255, b = city[i + 2] / 255;
  const l = 0.3 * r + 0.59 * g + 0.11 * b;
  return (l > 0.5 && b - r > -0.06) || (l > 0.6 && r > b);
};
const bound = new Float32Array(W);
for (let x = 0; x < W; x++) {
  // nuages roses mal classés au-dessus d'un immeuble clair (à gauche de la grande tour)
  let y = x > 1030 && x < 1300 ? 990 : x > 850 && x < 1225 ? 830 : 480;
  let run = 0;
  for (; y < H / 2 + 40; y++) { if (!isSky(x, y)) { run++; if (run >= 4) { y -= 3; break; } } else run = 0; }
  bound[x] = y;
}

// 3. composition : ville réchauffée (contre-jour doré) sous le ciel doré, bord adouci
const out = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = (y * W + x) * 3;
  const d = y - bound[x];
  const m = Math.min(1, Math.max(0, (d + 1) / 2.5)); // 0 = ciel, 1 = ville
  // la ville : un peu plus sombre et chaude, plus brumeuse vers l'horizon
  const haze = Math.max(0, 1 - Math.abs(y - H / 2) / 120) * 0.18;
  const cr = Math.min(255, city[i] * 0.9 * 1.08 + 255 * haze * 1.0);
  const cg = Math.min(255, city[i + 1] * 0.9 * 0.96 + 200 * haze);
  const cb = Math.min(255, city[i + 2] * 0.9 * 0.82 + 140 * haze);
  out[i] = sky[i] * (1 - m) + cr * m;
  out[i + 1] = sky[i + 1] * (1 - m) + cg * m;
  out[i + 2] = sky[i + 2] * (1 - m) + cb * m;
}
fs.mkdirSync('public/env', { recursive: true });
const img = sharp(out, { raw: { width: W, height: H, channels: 3 } });
await img.clone().jpeg({ quality: 84, mozjpeg: true }).toFile('public/env/sky_4k.jpg');
await img.clone().resize(2048, 1024).jpeg({ quality: 82, mozjpeg: true }).toFile('public/env/sky_2k.jpg');
fs.copyFileSync('raw/ph/industrial_sunset_02_puresky_1k.hdr', 'public/env/sky_1k.hdr');
await img.clone().resize(2048, 1024).extract({ left: 0, top: 300, width: 2048, height: 330 }).jpeg().toFile('raw/sky_preview.jpg');
console.log('ciel composé');
