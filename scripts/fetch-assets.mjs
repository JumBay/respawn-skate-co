// Télécharge et prépare les ressources CC0 de Poly Haven (polyhaven.com, licence CC0) :
// matières PBR (couleur + normale + ARM), ciel HDRI de crépuscule urbain, accessoires glTF.
// Tout est réduit et recompressé dans public/ (WebP, meshopt) pour tenir le budget de poids.
//   node scripts/fetch-assets.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, quantize, meshopt, textureCompress, resample, flatten, join, mergeDocuments, simplify } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const RAW = 'raw/ph';
const PUB = 'public';
fs.mkdirSync(RAW, { recursive: true });

const MATERIALS = {
  ground: 'concrete_floor_worn_001',
  smooth: 'brushed_concrete_2',
  wall: 'concrete_wall_008',
  asphalt: 'asphalt_02',
  container: 'container_side',
  paint: 'rusty_painted_metal',
  steel: 'metal_plate',
  denim: 'denim_fabric',
  jersey: 'cotton_jersey',
  poplin: 'stretch_poplin',
  suede: 'scuba_suede',
};
const HDRI = 'sunset_jhbcentral';
const PROPS = ['concrete_road_barrier', 'metal_trash_can', 'utility_box_01',
  'old_tyre', 'spray_paint_bottles_02', 'modular_street_seating', 'wooden_picnic_table', 'trashbag'];

async function api(id) {
  const r = await fetch(`https://api.polyhaven.com/files/${id}`, { headers: { 'User-Agent': 'respawn-skate-co build script' } });
  if (!r.ok) throw new Error(`${id}: ${r.status}`);
  return r.json();
}
async function download(url, file) {
  if (fs.existsSync(file) && fs.statSync(file).size > 0) return file;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const r = await fetch(url, { headers: { 'User-Agent': 'respawn-skate-co build script' } });
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  return file;
}

// --- matières -----------------------------------------------------------------------------------
async function materials() {
  for (const [key, id] of Object.entries(MATERIALS)) {
    const f = await api(id);
    const maps = { diff: f.Diffuse['1k'].jpg.url, nor: f.nor_gl['1k'].jpg.url, arm: f.arm['1k'].jpg.url };
    for (const [m, url] of Object.entries(maps)) {
      const src = await download(url, `${RAW}/tex/${id}_${m}.jpg`);
      for (const [res, size] of [['1k', 1024], ['512', 512]]) {
        const out = `${PUB}/tex/${key}/${res}/${m}.webp`;
        fs.mkdirSync(path.dirname(out), { recursive: true });
        await sharp(src).resize(size, size).webp({ quality: m === 'nor' ? 88 : 78 }).toFile(out);
      }
    }
    console.log('matière', key, id);
  }
}

// --- ciel ----------------------------------------------------------------------------------------
async function sky() {
  const f = await api(HDRI);
  const hdr = await download(f.hdri['1k'].hdr.url, `${RAW}/${HDRI}_1k.hdr`);
  fs.mkdirSync(`${PUB}/env`, { recursive: true });
  fs.copyFileSync(hdr, `${PUB}/env/sky_1k.hdr`);
  const jpg = await download(f.tonemapped.url, `${RAW}/${HDRI}_tonemapped.jpg`);
  await sharp(jpg, { limitInputPixels: false }).resize(4096, 2048).jpeg({ quality: 82, mozjpeg: true }).toFile(`${PUB}/env/sky_4k.jpg`);
  await sharp(jpg, { limitInputPixels: false }).resize(2048, 1024).jpeg({ quality: 80, mozjpeg: true }).toFile(`${PUB}/env/sky_2k.jpg`);
  console.log('ciel', HDRI);
}

// --- accessoires -----------------------------------------------------------------------------------
async function props() {
  await MeshoptEncoder.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
  let target = null;
  for (const id of PROPS) {
    const f = await api(id);
    const g = f.gltf['1k'].gltf;
    const dir = `${RAW}/models/${id}`;
    await download(g.url, `${dir}/${id}.gltf`);
    for (const [rel, inc] of Object.entries(g.include || {})) await download(inc.url, `${dir}/${rel}`);
    const doc = await io.read(`${dir}/${id}.gltf`);
    // un nœud racine nommé par accessoire
    const root = doc.getRoot();
    const scene = root.listScenes()[0];
    const holder = doc.createNode(id);
    for (const n of scene.listChildren()) { scene.removeChild(n); holder.addChild(n); }
    scene.addChild(holder);
    if (!target) target = doc;
    else {
      const map = mergeDocuments(target, doc);
      const tScene = target.getRoot().listScenes()[0];
      for (const s of target.getRoot().listScenes()) if (s !== tScene) { for (const n of s.listChildren()) tScene.addChild(n); s.dispose(); }
      void map;
    }
    console.log('accessoire', id);
  }
  // une seule mémoire tampon
  const buf = target.getRoot().listBuffers()[0];
  for (const a of target.getRoot().listAccessors()) a.setBuffer(buf);
  for (const b of target.getRoot().listBuffers()) if (b !== buf) b.dispose();
  await MeshoptSimplifier.ready;
  await target.transform(
    dedup(), prune(), weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.22, error: 0.002 }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [512, 512], quality: 80 }),
    quantize(), prune(),
    meshopt({ encoder: MeshoptEncoder, level: 'high' }),
  );
  fs.mkdirSync(`${PUB}/models`, { recursive: true });
  await io.write(`${PUB}/models/props.glb`, target);
  console.log('props.glb', (fs.statSync(`${PUB}/models/props.glb`).size / 1024).toFixed(0), 'Ko');
}

const what = process.argv[2] || 'all';
if (what === 'all' || what === 'materials') await materials();
if (what === 'all' || what === 'sky') await sky();
if (what === 'all' || what === 'props') await props();
void flatten; void join; void resample;
