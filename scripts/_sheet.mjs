import sharp from 'sharp';
import fs from 'fs';
const dir = process.argv[2], out = process.argv[3];
const files = fs.readdirSync(dir).filter(f => /\.(png|jpg)$/.test(f)).sort();
const W = 480, H = 240, cols = 2;
const rows = Math.ceil(files.length / cols);
const comps = [];
for (let i = 0; i < files.length; i++) {
  const img = await sharp(dir + '/' + files[i]).resize(W, H, { fit: 'cover' }).toBuffer();
  const svg = Buffer.from(`<svg width="${W}" height="24"><rect width="${W}" height="24" fill="black"/><text x="6" y="17" font-size="16" fill="white">${files[i]}</text></svg>`);
  comps.push({ input: img, left: (i % cols) * W, top: Math.floor(i / cols) * (H + 24) + 24 });
  comps.push({ input: svg, left: (i % cols) * W, top: Math.floor(i / cols) * (H + 24) });
}
await sharp({ create: { width: W * cols, height: rows * (H + 24), channels: 3, background: '#222' } }).composite(comps).jpeg({ quality: 80 }).toFile(out);
