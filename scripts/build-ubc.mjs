// Construit public/models/ubc_women.glb et ubc_men.glb à partir des « Universal Base Characters »
// de Quaternius (version gratuite, licence CC0, quaternius.itch.io/universal-base-characters).
// Un corps + yeux + sourcils + toutes les coiffures, rattachés au même squelette (joints remappés
// par nom), textures recompressées en WebP, maillages compressés meshopt.
//   UBC=<dossier « Universal Base Characters[Standard] »> node scripts/build-ubc.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { mergeDocuments, prune, dedup, weld, quantize, meshopt, textureCompress } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';

const UBC = process.env.UBC;
if (!UBC) throw new Error('UBC=<dossier du kit> manquant');
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const BODY = `${UBC}/Base Characters/Godot - UE`;
const HAIR = `${UBC}/Hairstyles/Rigged to Head Bone/glTF (Godot -Unreal)`;
const TEX = `${UBC}/Base Characters/Textures`;

const SETS = {
  women: { body: 'Superhero_Female_FullBody', light: 'T_Superhero_Female_Light_BaseColor.png', hairs: ['Hair_Long', 'Hair_Buns', 'Hair_SimpleParted', 'Hair_BuzzedFemale', 'Eyebrows_Female'] },
  men: { body: 'Superhero_Male_FullBody', light: 'T_Superhero_Male_Ligh.png', hairs: ['Hair_SimpleParted', 'Hair_Buzzed', 'Hair_Long', 'Hair_Beard', 'Eyebrows_Regular'] },
};

for (const [out, set] of Object.entries(SETS)) {
  const doc = await io.read(`${BODY}/${set.body}.gltf`);
  const root = doc.getRoot();
  const baseSkin = root.listSkins()[0];
  const jointIndex = new Map(baseSkin.listJoints().map((j, i) => [j.getName(), i]));
  const scene = root.listScenes()[0];
  const meshParent = root.listNodes().find((n) => n.getMesh()).getParentNode() || null;

  // couleur de peau claire (teintée en jeu) à la place de la foncée
  for (const tex of root.listTextures()) {
    if (/Superhero_.*(Dark|BaseColor)/.test(tex.getName() || tex.getURI())) {
      tex.setImage(fs.readFileSync(path.join(TEX, set.light))).setMimeType('image/png');
    }
  }

  for (const h of set.hairs) {
    const src = await io.read(`${HAIR}/${h}.gltf`);
    const sSkin = src.getRoot().listSkins()[0];
    const remap = sSkin.listJoints().map((j) => jointIndex.get(j.getName()));
    // réécrit JOINTS_0 dans l'index du squelette du corps
    for (const m of src.getRoot().listMeshes()) for (const p of m.listPrimitives()) {
      const a = p.getAttribute('JOINTS_0'); if (!a) continue;
      const arr = a.getArray();
      const out2 = new Uint16Array(arr.length);
      for (let i = 0; i < arr.length; i++) out2[i] = remap[arr[i]] ?? 0;
      a.setArray(out2);
    }
    const map = mergeDocuments(doc, src);
    for (const [, tgt] of map) {
      if (tgt.propertyType === 'Node' && tgt.getMesh()) {
        tgt.setSkin(baseSkin);
        tgt.setName(h);
        tgt.getMesh().setName(h);
        if (meshParent) meshParent.addChild(tgt); else scene.addChild(tgt);
      }
    }
    for (const s of root.listScenes()) if (s !== scene) s.dispose();
  }
  for (const s of root.listSkins()) if (s !== baseSkin) s.dispose();
  // nœuds hors de la scène (os dupliqués des coiffures)
  const keep = new Set(); scene.traverse((n) => keep.add(n));
  for (const n of root.listNodes()) if (!keep.has(n)) n.dispose();
  // un seul buffer
  const buf = root.listBuffers()[0];
  for (const a of root.listAccessors()) a.setBuffer(buf);
  for (const b of root.listBuffers()) if (b !== buf) b.dispose();

  await doc.transform(
    dedup(), prune(), weld(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 82, slots: /^(baseColor|normal|metallicRoughness)/ }),
    quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12, quantizeWeight: 8 }),
    prune(),
    meshopt({ encoder: MeshoptEncoder, level: 'high' }),
  );
  // cheveux et yeux en 512
  await doc.transform(textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [512, 512], quality: 80, pattern: /Hair|Eye/ }));
  await io.write(`public/models/ubc_${out}.glb`, doc);
  console.log(out, (fs.statSync(`public/models/ubc_${out}.glb`).size / 1024).toFixed(0), 'Ko',
    root.listMeshes().map((m) => m.getName()).join(' '), '| mats', root.listMaterials().map((m) => m.getName()).join(' '));
}
