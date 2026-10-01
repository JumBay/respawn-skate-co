// Construit public/models/{women,men}.glb à partir des personnages Quaternius (CC0)
// téléchargés dans raw/ (poly.pizza, packs « Ultimate Modular Women / Men »).
// Un seul squelette par genre : toutes les pièces (tête, haut, bas, pieds) y sont rattachées,
// le jeu choisit ensuite lesquelles afficher. Compression meshopt + quantification.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { mergeDocuments, prune, dedup, weld, quantize, meshopt, resample, unpartition } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import fs from 'node:fs';

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });

const KEEP_ANIMS = ['Idle', 'Idle_Neutral', 'Wave', 'Death', 'HitRecieve', 'Roll', 'Run', 'Walk', 'Kick_Right', 'Interact'];
// Pièces gardées : celles qui servent de base aux produits (tee, hoodie, veste, jean, cargo,
// short, sneakers basses / montantes) et les coiffures. Le reste n'est pas embarqué.
const SKIP_MESH = {
  women: /^(Sword|Medieval_Body|Formal_Legs|Adventurer_Feet|Formal_Feet|Medieval_Feet)$/,
  men: /^(Backpack|Worker_Head|Punk_Body|Adventurer_Body|Worker_Body|Suit_Legs|Beach_Legs|Adventurer_Legs|Punk_Feet|Beach_Feet|Adventurer_Feet|Suit_Feet|Worker_Feet)$/,
};

const SETS = {
  women: { base: 'w_punk', others: ['w_anim2', 'w_adventurer', 'w_anim1', 'w_hooded'] },
  men: { base: 'm_casual', others: ['m_hoodie', 'm_punk', 'm_beach', 'm_adventurer', 'm_business', 'm_worker'] },
};

fs.mkdirSync('public/models', { recursive: true });

function dropAnim(a) {
  for (const c of a.listChannels()) c.dispose();
  for (const s of a.listSamplers()) { s.getInput()?.dispose(); s.getOutput()?.dispose(); s.dispose(); }
  a.dispose();
}

for (const [out, set] of Object.entries(SETS)) {
  const doc = await io.read(`raw/${set.base}.glb`);
  const root = doc.getRoot();
  const baseSkin = root.listSkins()[0];
  const baseMeshNode = root.listNodes().find((n) => n.getMesh());
  const meshParent = baseMeshNode.getParentNode();
  const baseScene = root.listScenes()[0];

  for (const name of set.others) {
    const src = await io.read(`raw/${name}.glb`);
    for (const a of src.getRoot().listAnimations()) dropAnim(a);
    const map = mergeDocuments(doc, src);
    for (const [, tgt] of map) {
      if (tgt.propertyType === 'Node' && tgt.getMesh()) {
        tgt.setSkin(baseSkin);
        meshParent.addChild(tgt);
      }
    }
    for (const s of root.listScenes()) if (s !== baseScene) s.dispose();
  }
  // Toutes les pièces sur la même peau, puis on retire les autres.
  for (const n of root.listNodes()) if (n.getMesh() && n.getSkin()) n.setSkin(baseSkin);
  for (const s of root.listSkins()) if (s !== baseSkin) s.dispose();
  for (const n of root.listNodes()) {
    const m = n.getMesh();
    if (m && SKIP_MESH[out].test(m.getName())) { n.dispose(); }
  }
  for (const a of root.listAnimations()) {
    const short = a.getName().replace('CharacterArmature|', '');
    if (!KEEP_ANIMS.includes(short)) dropAnim(a); else a.setName(short);
  }
  // Noeuds orphelins (os des fichiers fusionnés) : ceux qui ne sont plus dans la scène.
  const inScene = new Set();
  baseScene.traverse((n) => inScene.add(n));
  for (const n of root.listNodes()) if (!inScene.has(n)) n.dispose();

  // Les maillages doivent porter un nom unique : <Mesh>.
  const seen = {};
  for (const n of root.listNodes()) {
    const m = n.getMesh(); if (!m) continue;
    let nm = m.getName(); if (seen[nm]) nm = `${nm}_${++seen[nm]}`; else seen[nm] = 1;
    m.setName(nm); n.setName(nm);
  }

  await doc.transform(
    dedup(), prune(), weld(), resample(),
    quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 10, quantizeWeight: 8 }),
    prune(),
    meshopt({ encoder: MeshoptEncoder, level: 'high' }),
    unpartition()
  );
  await io.write(`public/models/${out}.glb`, doc);
  const meshes = root.listMeshes().map((m) => m.getName());
  console.log(out, (fs.statSync(`public/models/${out}.glb`).size / 1024).toFixed(0) + ' Ko', meshes.join(' '), '|', root.listAnimations().map((a) => a.getName()).join(','));
}
