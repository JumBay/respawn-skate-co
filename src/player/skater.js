// Le skater : personnage modulaire Quaternius (CC0) + planche en code + pose calculée en code.
// Les animations du pack ne connaissent pas le skate : la posture (genoux fléchis, pieds sur la
// planche, bras d'équilibre, grabs, chutes) est obtenue par cinématique inverse sur le squelette.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Board } from './board.js';
import { PALETTE } from '../config.js';
import { printCanvas, canvasTexture, loadImage } from '../world/textures.js';

// --- Pièces du pack retenues, par genre --------------------------------------------------------
export const PARTS = {
  women: {
    heads: [
      { id: 'Casual_Head', label: 'Carré long' },
      { id: 'Formad_Head', label: 'Boucles' },
      { id: 'Adventurer_Head', label: 'Court' },
      { id: 'Punk_Head', label: 'Crête' },
      { id: 'Medieval_Head', label: 'Capuche' },
    ],
    top: { tshirt: 'Casual_Body', hoodie: 'Adventurer_Body', jacket: 'Punk_Body', tank: 'Formal_Body' },
    bottom: { jeans: 'Casual_Legs', cargo: 'Medieval_Legs', shorts: 'Adventurer_Legs', pants: 'Punk_Legs' },
    feet: { sneakers_low: 'Casual_Feet', sneakers_high: 'Punk_Feet' },
    hairMats: ['Hair_Brown', 'Hair_Blond', 'Hair', 'Red', 'Pink', 'White'],
  },
  men: {
    heads: [
      { id: 'Casual_Head', label: 'Bouclé' },
      { id: 'Casual2_Head', label: 'Queue de cheval' },
      { id: 'Beach_Head', label: 'Pics' },
      { id: 'Suit_Head', label: 'Raie' },
      { id: 'Punk_Head', label: 'Crête' },
      { id: 'Adventurer_Head', label: 'Barbe' },
    ],
    top: { tshirt: 'Casual2_Body', hoodie: 'Casual_Body', jacket: 'Suit_Body', tank: 'Beach_Body' },
    bottom: { jeans: 'Casual2_Legs', cargo: 'Worker_Legs', shorts: 'Casual_Legs', pants: 'Punk_Legs' },
    feet: { sneakers_low: 'Casual_Feet', sneakers_high: 'Casual2_Feet' },
    hairMats: ['Hair', 'Hair_Brown', 'Red', 'Red_Dark'],
  },
};
const GABARIT_TO_PART = {
  tshirt: ['top', 'tshirt'], hoodie: ['top', 'hoodie'], jacket: ['top', 'jacket'],
  jeans: ['bottom', 'jeans'], cargo: ['bottom', 'cargo'], shorts: ['bottom', 'shorts'],
  sneakers_low: ['feet', 'sneakers_low'], sneakers_high: ['feet', 'sneakers_high'],
};
const SKIN_MATS = /^(Skin|Skin_Darker)$/;
const EYE_MATS = /^(Eye|Eyebrows|Moustache)$/;

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const cache = {};
export function loadCharacter(base, gender) {
  if (!cache[gender]) cache[gender] = loader.loadAsync(`${base}models/${gender}.glb`);
  return cache[gender];
}

const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();
const _m = new THREE.Matrix4(), _m2 = new THREE.Matrix4();
const Y = new THREE.Vector3(0, 1, 0);
const lerp = THREE.MathUtils.lerp;
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));

// Normales lissées : le pack est en facettes ; on moyenne les normales des sommets confondus.
function smoothNormals(geo) {
  const p = geo.attributes.position, n = geo.attributes.normal;
  if (!p || !n) return;
  const map = new Map(), acc = [];
  const key = (i) => `${Math.round(p.getX(i) * 1e4)},${Math.round(p.getY(i) * 1e4)},${Math.round(p.getZ(i) * 1e4)}`;
  for (let i = 0; i < p.count; i++) {
    const k = key(i);
    let a = map.get(k); if (!a) { a = [0, 0, 0]; map.set(k, a); }
    a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i);
    acc[i] = a;
  }
  const out = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const a = acc[i], l = Math.hypot(a[0], a[1], a[2]) || 1;
    out[i * 3] = a[0] / l; out[i * 3 + 1] = a[1] / l; out[i * 3 + 2] = a[2] / l;
  }
  geo.setAttribute('normal', new THREE.BufferAttribute(out, 3));
}

function boxUV(geo, R0) {
  const p = geo.attributes.position, n = geo.attributes.normal;
  const uv = new Float32Array(p.count * 2);
  const v = new THREE.Vector3(), nn = new THREE.Vector3();
  const nm = new THREE.Matrix3().getNormalMatrix(R0);
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).applyMatrix4(R0);
    nn.fromBufferAttribute(n, i).applyMatrix3(nm);
    const ax = Math.abs(nn.x), ay = Math.abs(nn.y), az = Math.abs(nn.z);
    let a, b;
    if (ay >= ax && ay >= az) { a = v.x; b = v.z; } else if (ax >= az) { a = v.z; b = v.y; } else { a = v.x; b = v.y; }
    uv[i * 2] = a; uv[i * 2 + 1] = b;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

// ------------------------------------------------------------------------------------------------
class Rig {
  constructor(scene, skeleton, armature) {
    this.scene = scene;
    this.bones = skeleton.bones;
    this.by = {};
    this.bones.forEach((b, i) => { this.by[b.name.replace(/\./g, '')] = i; });
    this.parent = this.bones.map((b) => (b.parent && b.parent.isBone ? this.bones.indexOf(b.parent) : -1));
    const mesh = skeleton._mesh;
    scene.updateMatrixWorld(true);
    // poses de liaison (bind) en espace modèle
    this.bp = []; this.bq = []; this.bs = [];
    // Pose de repos = la pose de MODÉLISATION (inverse-bind) : c'est la seule où chaque morceau de
    // maillage est bien au bout de son os (la pose des nœuds du pack a des pieds « cibles d'IK »
    // décollés des tibias). Les inverse-bind sont dans un repère couché et à une autre échelle :
    // on les redresse par une similitude R0 (axes tirés du squelette, taille de la pose des nœuds).
    const inv = new THREE.Matrix4().copy(scene.matrixWorld).invert();
    const nodeP = this.bones.map((b) => new THREE.Vector3().setFromMatrixPosition(_m.copy(inv).multiply(b.matrixWorld)));
    const bindM = skeleton.boneInverses.map((ib) => new THREE.Matrix4().copy(ib).invert());
    const bP = bindM.map((m) => new THREE.Vector3().setFromMatrixPosition(m));
    const ix = (n) => this.i(n);
    const footB = bP[ix('Foot.L')].clone().add(bP[ix('Foot.R')]).multiplyScalar(0.5);
    const footN = nodeP[ix('Foot.L')].clone().add(nodeP[ix('Foot.R')]).multiplyScalar(0.5);
    const up = bP[ix('Head')].clone().sub(footB);
    const k = (nodeP[ix('Head')].y - footN.y) / up.length();
    up.normalize();
    const left = bP[ix('UpperArm.L')].clone().sub(bP[ix('UpperArm.R')]);
    left.addScaledVector(up, -left.dot(up)).normalize();
    const fwd = new THREE.Vector3().crossVectors(left, up).normalize();
    const basis = new THREE.Matrix4().makeBasis(left, up, fwd).invert(); // repère bind -> modèle
    const R0 = new THREE.Matrix4().makeScale(k, k, k).multiply(basis);
    const fb = footB.clone().applyMatrix4(R0);
    R0.premultiply(new THREE.Matrix4().makeTranslation(0 - fb.x, footN.y - fb.y, 0 - fb.z));
    this.R0 = R0;
    this.bp = []; this.bq = []; this.bs = [];
    bindM.forEach((m, i) => {
      _m.copy(R0).multiply(m);
      const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
      _m.decompose(p, q, s);
      this.bp[i] = p; this.bq[i] = q; this.bs[i] = s;
    });
    void mesh;
    this.armature = armature;
    this.armInv = new THREE.Matrix4();
    // poses courantes
    this.p = this.bp.map((v) => v.clone());
    this.q = this.bones.map(() => new THREE.Quaternion());
    this.ybind = this.bq.map((q) => new THREE.Vector3(0, 1, 0).applyQuaternion(q));
    const L = (a, b) => this.bp[this.i(a)].distanceTo(this.bp[this.i(b)]);
    this.len = {
      thighL: L('UpperLeg.L', 'LowerLeg.L'), shinL: L('LowerLeg.L', 'Foot.L'),
      thighR: L('UpperLeg.R', 'LowerLeg.R'), shinR: L('LowerLeg.R', 'Foot.R'),
      uarmL: L('UpperArm.L', 'LowerArm.L'), farmL: L('LowerArm.L', 'Wrist.L'),
      uarmR: L('UpperArm.R', 'LowerArm.R'), farmR: L('LowerArm.R', 'Wrist.R'),
    };
    this.hipY = this.bp[this.i('Body')].y;
  }

  i(name) { return this.by[name.replace(/\./g, '')]; }

  // hérite du parent (position et rotation de « déformation »)
  inherit(i) {
    const pi = this.parent[i];
    if (pi < 0) { this.q[i].identity(); this.p[i].copy(this.bp[i]); return; }
    this.q[i].copy(this.q[pi]);
    _v.subVectors(this.bp[i], this.bp[pi]).applyQuaternion(this.q[pi]);
    this.p[i].copy(this.p[pi]).add(_v);
  }

  // tourne l'os (et ce qui en hérite ensuite) de R, en espace modèle, autour de sa tête
  rotate(i, R) { this.q[i].premultiply(R); }

  // oriente l'axe Y de l'os vers d (espace modèle), torsion minimale
  aim(i, d) {
    const cur = this._a || (this._a = new THREE.Vector3());
    const want = this._b || (this._b = new THREE.Vector3());
    const r = this._r || (this._r = new THREE.Quaternion());
    want.copy(d).normalize();
    cur.copy(this.ybind[i]).applyQuaternion(this.q[i]).normalize();
    r.setFromUnitVectors(cur, want);
    this.q[i].premultiply(r);
  }

  // applique les poses aux os de three (espace local de chaque os)
  apply() {
    this.armInv.copy(this.armature.matrixWorld);
    // matrice du parent de l'os racine, en espace modèle
    _m2.copy(this.scene.matrixWorld).invert().multiply(this.armature.matrixWorld);
    const W = this._W || (this._W = this.bones.map(() => new THREE.Matrix4()));
    for (let i = 0; i < this.bones.length; i++) {
      _q2.copy(this.q[i]).multiply(this.bq[i]);
      W[i].compose(this.p[i], _q2, this.bs[i]);
      const pi = this.parent[i];
      _m.copy(pi < 0 ? _m2 : W[pi]).invert().multiply(W[i]);
      const b = this.bones[i];
      _m.decompose(b.position, b.quaternion, b.scale);
    }
  }
}

// IK à deux os : renvoie la position du genou / coude
function solve2(A, T, l1, l2, pole, outK) {
  _v.subVectors(T, A);
  let d = _v.length();
  const dir = _v.divideScalar(d || 1);
  d = Math.min(Math.max(d, Math.abs(l1 - l2) + 1e-3), l1 + l2 - 1e-3);
  const a = Math.acos(THREE.MathUtils.clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  _v2.copy(pole).addScaledVector(dir, -pole.dot(dir)).normalize();
  outK.copy(A).addScaledVector(dir, Math.cos(a) * l1).addScaledVector(_v2, Math.sin(a) * l1);
  return d;
}

// ------------------------------------------------------------------------------------------------
export class Skater {
  constructor({ quality, assetBase, bank }) {
    this.quality = quality;
    this.bank = bank;
    this.matCache = new Map();
    this.assetBase = assetBase;
    this.group = new THREE.Group();
    this.group.name = 'skater';
    this.body = new THREE.Group(); // personnage, repère planche (X = nez, Z = côté orteils)
    this.group.add(this.body);
    this.board = new Board({ quality });
    this.boardHolder = new THREE.Group();
    this.boardHolder.add(this.board.group);
    this.group.add(this.boardHolder);
    this.accessories = new THREE.Group();
    this.pose = { crouch: 0, flipT: 0, grab: 0, lean: 0, push: 0, armSwing: 0, look: 0, bail: 0, tuck: 0, manual: 0 };
    this.mode = 'skate'; // 'skate' | 'idle' | 'clip'
    this.ready = false;
    this.t = 0;
    this.prints = [];
  }

  async setLook(look) {
    this.look = JSON.parse(JSON.stringify(look));
    const gltf = await loadCharacter(this.assetBase, look.gender);
    if (this.gender !== look.gender) {
      if (this.char) this.body.remove(this.char);
      if (this.current) { this.current.stop(); this.current = null; this.mode = 'skate'; }
      this.char = gltf.scene;
      this.gender = look.gender;
      this.body.add(this.char);
      // repère du modèle = repère de la planche : +X (côté gauche du perso) = nez, +Z (visage) = orteils
      this.char.updateMatrixWorld(true);
      const u = gltf.userData;
      if (!u.rig) {
        // première fois pour ce genre : squelette, pièces, matières, objets portés
        let skel = null, armature = null;
        u.parts = {};
        this.char.traverse((o) => {
          if (o.isSkinnedMesh && !skel) { skel = o.skeleton; skel._mesh = o; }
          if (o.name === 'CharacterArmature') armature = o;
          if (o.parent && o.parent.name === 'RootNode' && (o.isMesh || o.isGroup)) u.parts[o.name] = o;
          if (o.isMesh) {
            o.castShadow = this.quality.tier === 'high';
            o.frustumCulled = false;
            if (!o.userData.mat0) { o.userData.mat0 = o.material; o.material = o.material.clone(); o.userData.matName = o.userData.mat0.name; smoothNormals(o.geometry); }
          }
        });
        u.rig = new Rig(this.char, skel, armature);
        // UV en mètres (projection par face dominante, repère modèle) pour le grain des tissus
        this.char.traverse((o) => { if (o.isMesh) boxUV(o.geometry, u.rig.R0); });
        void 0;
        u.mixer = new THREE.AnimationMixer(this.char);
        u.clips = {};
        for (const c of gltf.animations) u.clips[c.name] = c;
        this.rig = u.rig;
        this.attachBoneProps();
        u.props = this.props;
      }
      this.rig = u.rig; this.parts = u.parts; this.mixer = u.mixer; this.clips = u.clips; this.props = u.props;
    }
    this.applyOutfit();
    this.ready = true;
    return this;
  }

  // ----------------------------------------------------------------------------------------------
  applyOutfit() {
    const look = this.look, P = PARTS[look.gender];
    const outfit = look.outfit || {};
    const want = new Set();
    const head = P.heads.find((h) => h.id === look.head) || P.heads[0];
    want.add(head.id);
    const pick = (slot, def) => {
      const prod = outfit[slot];
      const g = prod && prod.gabarit;
      const map = GABARIT_TO_PART[g];
      let key = map && map[0] === slot ? map[1] : def;
      if (slot === 'top' && !prod) key = look.baseTop || 'tank';
      if (slot === 'bottom' && !prod) key = look.baseBottom || 'jeans';
      if (slot === 'feet' && !prod) key = 'sneakers_low';
      return P[slot][key] || Object.values(P[slot])[0];
    };
    const top = pick('top', 'tshirt'), bottom = pick('bottom', 'jeans'), feet = pick('feet', 'sneakers_low');
    want.add(top); want.add(bottom); want.add(feet);
    for (const [name, o] of Object.entries(this.parts)) o.visible = want.has(name);

    const skin = new THREE.Color(look.skin || '#C98E62');
    const hair = new THREE.Color(look.hairColor || '#2a1d14');
    const FABRIC = { tshirt: 'jersey', tank: 'jersey', hoodie: 'jersey', jacket: 'poplin', jeans: 'denim', pants: 'denim', cargo: 'poplin', shorts: 'poplin', sneakers_low: 'suede', sneakers_high: 'suede' };
    const fabricFor = (kind, color, slot) => {
      const key = kind + color + slot;
      if (!this.matCache.has(key)) {
        const m = this.bank ? this.bank.fabric(kind, { color, scale: kind === 'denim' ? 9 : kind === 'suede' ? 10 : 8, sheen: kind === 'suede' ? 0.8 : 0.5 })
          : new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
        m.skinning = true;
        this.matCache.set(key, m);
      }
      return this.matCache.get(key);
    };
    const skinMat = this.skinMaterial(skin);
    const hairMat = this.hairMaterial(hair);
    const paint = (partName, prod, fallback, slot) => {
      const part = this.parts[partName]; if (!part) return;
      const meshes = [];
      part.traverse((o) => { if (o.isMesh) meshes.push(o); });
      // matières vêtement triées par surface : la plus grande = couleur principale
      const cloth = meshes.filter((m) => !SKIN_MATS.test(m.userData.matName) && !EYE_MATS.test(m.userData.matName) && !P.hairMats.includes(m.userData.matName) && m.userData.matName !== 'Earrings');
      cloth.sort((a, b) => b.geometry.index.count - a.geometry.index.count);
      const cols = prod && prod.colors ? [prod.colors.primary, prod.colors.secondary, prod.colors.accent] : fallback;
      const gab = (prod && prod.gabarit) || ({ top: look.baseTop || 'tank', bottom: look.baseBottom || 'jeans', feet: 'sneakers_low' })[slot];
      cloth.forEach((m, k) => {
        const c = cols && cols[Math.min(k, cols.length - 1)] ? cols[Math.min(k, cols.length - 1)] : '#' + m.userData.mat0.color.getHexString();
        // pièce secondaire (semelle, liseré) en matière lisse ; la principale dans le tissu du produit
        const kind = slot === 'feet' && k > 0 ? 'jersey' : (FABRIC[gab] || 'jersey');
        m.material = slot ? fabricFor(kind, c, slot) : m.material;
      });
      for (const m of meshes) {
        if (SKIN_MATS.test(m.userData.matName)) m.material = m.userData.matName === 'Skin_Darker' ? this.skinMaterial(skin.clone().multiplyScalar(0.85)) : skinMat;
        if (P.hairMats.includes(m.userData.matName)) m.material = hairMat;
      }
    };
    const baseCols = {
      top: [PALETTE.chalk, '#2a2a2e', PALETTE.acid],
      bottom: ['#23252c', '#3a3d46', PALETTE.cone],
      feet: ['#f3f0e8', '#141416', PALETTE.acid],
    };
    paint(top, outfit.top, baseCols.top, 'top');
    paint(bottom, outfit.bottom, baseCols.bottom, 'bottom');
    paint(feet, outfit.feet, baseCols.feet, 'feet');
    paint(head.id, null, null, null);
    if (this.skinMats) for (const m of this.skinMats) m.color.copy(skin);
    if (this.props && this.props.shinL) for (const side of ['L', 'R']) this.props['shin' + side].traverse((o) => { if (o.isMesh && o.userData.skin) o.material = skinMat; });
    if (this.sockMat) this.sockMat.color.set(look.socks || '#f3f0e8');
    // la capuche (tête « Capuche ») prend la couleur du haut
    if (head.id === 'Medieval_Head') {
      this.parts[head.id].traverse((o) => { if (o.isMesh && /^(DarkBrown|Brown|Black)$/.test(o.userData.matName)) o.material.color.set((outfit.top && outfit.top.colors.primary) || '#2a2a2e'); });
    }
    this.updateProps();
    this.setBoardSetup(look.board || {});
  }

  setBoardSetup(setup) { this.board.build(setup); }

  // peau : un peu de « sheen » rosé imite la diffusion sous la surface
  skinMaterial(color) {
    const key = 'skin' + color.getHexString();
    if (!this.matCache.has(key)) {
      this.matCache.set(key, new THREE.MeshPhysicalMaterial({
        color, roughness: 0.58, sheen: 0.35, sheenRoughness: 0.55, sheenColor: new THREE.Color('#ff8f73'),
        emissive: color.clone().multiplyScalar(0.06), specularIntensity: 0.4,
      }));
    }
    return this.matCache.get(key);
  }
  hairMaterial(color) {
    const key = 'hair' + color.getHexString();
    if (!this.matCache.has(key)) this.matCache.set(key, new THREE.MeshPhysicalMaterial({ color, roughness: 0.5, sheen: 0.5, sheenRoughness: 0.35, sheenColor: color.clone().multiplyScalar(1.6) }));
    return this.matCache.get(key);
  }

  // ----------------------------------------------------------------------------------------------
  // Objets portés construits en code : casquette, bonnet, casque, genouillères, coudières,
  // protège-poignets, imprimé de poitrine. Rattachés aux os, ils suivent la pose.
  attachBoneProps() {
    const b = (n) => this.rig.bones[this.rig.i(n)];
    this.props = {};
    const mk = (name, bone, obj) => { obj.name = name; obj.visible = false; bone.add(obj); this.props[name] = obj; return obj; };
    // échelle : les os ont une échelle monde de 100 (armature) ; on compense
    const s = 1 / this.rig.bs[0].x;
    const headB = b('Head'), chest = b('Chest');
    const wrap = (obj) => { const g = new THREE.Group(); g.add(obj); g.scale.setScalar(s); return g; };
    // les objets sont décrits en mètres dans le repère « modèle » : on corrige la rotation de l'os
    const fix = (obj, boneName) => {
      const i = this.rig.i(boneName);
      const g = wrap(obj);
      g.quaternion.copy(this.rig.bq[i]).invert();
      return g;
    };
    // tête : centre approximatif au-dessus de l'os
    const capMat = new THREE.MeshStandardMaterial({ color: PALETTE.acid, roughness: 0.8 });
    const cap = new THREE.Group();
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.128, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
    crown.scale.set(1.02, 0.78, 1.1);
    const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.014, 18, 1, false, -Math.PI / 2, Math.PI), capMat);
    visor.scale.set(1, 1, 0.8); visor.position.set(0, 0.005, 0.085); visor.rotation.x = 0.12;
    cap.add(crown, visor); cap.position.set(0, 0.165, 0.005);
    mk('cap', headB, fix(cap, 'Head'));
    const beanie = new THREE.Group();
    const bb = new THREE.Mesh(new THREE.SphereGeometry(0.122, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), capMat.clone());
    bb.scale.set(1, 1.08, 1.05);
    const fold = new THREE.Mesh(new THREE.CylinderGeometry(0.124, 0.126, 0.05, 18, 1, true), capMat.clone());
    fold.position.y = 0.01;
    beanie.add(bb, fold); beanie.position.set(0, 0.11, -0.005);
    mk('beanie', headB, fix(beanie, 'Head'));
    const helmet = new THREE.Group();
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.135, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.56), new THREE.MeshStandardMaterial({ color: '#111114', roughness: 0.35 }));
    shell.scale.set(1, 0.95, 1.1);
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.01, 0.2), new THREE.MeshStandardMaterial({ color: PALETTE.acid }));
    vent.position.set(0, 0.125, 0);
    helmet.add(shell, vent); helmet.position.set(0, 0.11, -0.005);
    mk('helmet', headB, fix(helmet, 'Head'));
    // protections
    const padMat = new THREE.MeshStandardMaterial({ color: '#141416', roughness: 0.6 });
    const capPad = new THREE.MeshStandardMaterial({ color: PALETTE.cone, roughness: 0.4 });
    const pad = (r, h) => { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.95, h, 12, 1, true), padMat); c.material.side = THREE.DoubleSide; const k = new THREE.Mesh(new THREE.SphereGeometry(r * 0.75, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), capPad); k.rotation.x = Math.PI / 2; k.position.z = r * 0.55; k.scale.set(1, 1, 0.6); g.add(c, k); return g; };
    for (const side of ['L', 'R']) {
      const knee = pad(0.065, 0.11); knee.position.set(0, 0.0, 0.01);
      mk('knee' + side, b('LowerLeg.' + side), fix(knee, 'LowerLeg.' + side));
      const elbow = pad(0.045, 0.08);
      mk('elbow' + side, b('LowerArm.' + side), fix(elbow, 'LowerArm.' + side));
      const wrist = pad(0.034, 0.07); wrist.position.set(0, 0.02, 0);
      mk('wrist' + side, b('Wrist.' + side), fix(wrist, 'Wrist.' + side));
    }
    // mollets + chaussettes : les pièces du pack ne couvrent pas toutes la jambe (pantalon court
    // + chaussure basse = tibia vide). Un mollet en code, rattaché au tibia, comble toujours.
    this.skinMats = [];
    this.sockMat = new THREE.MeshStandardMaterial({ color: '#f3f0e8', roughness: 0.9 });
    for (const side of ['L', 'R']) {
      const i = this.rig.i('LowerLeg.' + side);
      const len = this.rig.len['shin' + side];
      const g = new THREE.Group();
      const skinMat = new THREE.MeshStandardMaterial({ color: '#c98e62', roughness: 0.7 });
      this.skinMats.push(skinMat);
      const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.036, len * 0.55, 10), skinMat); calf.userData.skin = true;
      calf.position.y = -len * 0.275;
      const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.034, len * 0.42, 10), this.sockMat);
      sock.position.y = -len * 0.55 - len * 0.2;
      const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.0385, 0.037, 0.025, 10), new THREE.MeshStandardMaterial({ color: PALETTE.acid, roughness: 0.8 }));
      stripe.position.y = -len * 0.6;
      g.add(calf, sock, stripe);
      // l'axe du tibia au repos, en espace modèle (tête du genou -> cheville)
      const dir = new THREE.Vector3().subVectors(this.rig.bp[this.rig.i('Foot.' + side)], this.rig.bp[i]).normalize();
      const inner = new THREE.Group(); inner.add(g);
      inner.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
      const holder = fix(inner, 'LowerLeg.' + side);
      holder.visible = true;
      b('LowerLeg.' + side).add(holder);
      this.props['shin' + side] = holder;
    }

    // imprimé de poitrine (plan devant le torse)
    const printMat = new THREE.MeshStandardMaterial({ transparent: true, roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -4 });
    const print = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), printMat);
    print.position.set(0, -0.02, 0.122);
    mk('print', chest, fix(print, 'Chest'));
    // sac à dos (panier vestiaire) — caché par défaut
    const pack = new THREE.Group();
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.14), new THREE.MeshStandardMaterial({ color: '#1d1f24', roughness: 0.8 }));
    const flap = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.12, 0.15), new THREE.MeshStandardMaterial({ color: PALETTE.acid, roughness: 0.7 }));
    flap.position.y = 0.12; pack.add(bag, flap); pack.position.set(0, -0.02, -0.2);
    mk('pack', chest, fix(pack, 'Chest'));
  }

  updateProps() {
    if (!this.props) return;
    const o = (this.look && this.look.outfit) || {};
    const show = (name, on, prod) => {
      const p = this.props[name]; if (!p) return;
      p.visible = !!on;
      if (on && prod && prod.colors) {
        const cols = [prod.colors.primary, prod.colors.secondary, prod.colors.accent];
        let k = 0;
        p.traverse((m) => { if (m.isMesh && m.material.color && !m.material.map) { m.material.color.set(cols[Math.min(k, 2)] || cols[0]); k++; } });
      }
    };
    const head = o.head, g = head && head.gabarit;
    show('cap', g === 'cap', head);
    show('beanie', g === 'beanie', head);
    show('helmet', !!o.helmet, o.helmet);
    show('kneeL', !!o.knees, o.knees); show('kneeR', !!o.knees, o.knees);
    show('elbowL', !!o.elbows, o.elbows); show('elbowR', !!o.elbows, o.elbows);
    show('wristL', !!o.wrists, o.wrists); show('wristR', !!o.wrists, o.wrists);
    show('pack', !!(this.look && this.look.backpack), null);
    // imprimé : le graphisme du haut (ou un logo à ses couleurs)
    const top = o.top;
    const pr = this.props.print;
    if (top && top.gabarit !== 'jacket') {
      pr.visible = true;
      const m = pr.children[0].material;
      m.map = canvasTexture(printCanvas(top, null)); m.needsUpdate = true;
      if (top.graphic) loadImage(top.graphic).then((img) => { if (img && this.look.outfit.top === top) { m.map = canvasTexture(printCanvas(top, img)); m.needsUpdate = true; } });
    } else pr.visible = false;
  }

  // ----------------------------------------------------------------------------------------------
  playClip(name, { loop = true, fade = 0.25 } = {}) {
    if (!this.mixer || !this.clips[name]) return;
    const a = this.mixer.clipAction(this.clips[name]);
    if (this.current && this.current !== a) this.current.fadeOut(fade);
    a.reset(); a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce); a.clampWhenFinished = !loop;
    a.fadeIn(fade).play();
    this.current = a;
    this.mode = 'clip';
  }
  stopClip() { if (this.current) this.current.fadeOut(0.15); this.current = null; this.mode = 'skate'; }

  // ----------------------------------------------------------------------------------------------
  // Pose de skate. st : { crouch, push, pushPhase, flip:{t,dur,roll,yaw,pitch}, grab:{pose,t}, manual,
  // nose, grind, slide, balance, air, airT, bail, speed, steer, fakie, special }
  update(dt, st) {
    if (!this.ready) return;
    this.t += dt;
    if (this.mode === 'clip') { this.mixer.update(dt); this.boardHolder.position.set(0, 0, 0); return; }
    const P = this.pose;
    P.crouch = damp(P.crouch, st.crouch, 14, dt);
    P.push = damp(P.push, st.push ? 1 : 0, 8, dt);
    P.manual = damp(P.manual, st.manual ? (st.nose ? -1 : 1) : 0, 10, dt);
    P.grab = damp(P.grab, st.grab ? 1 : 0, 16, dt);
    P.tuck = damp(P.tuck, st.air ? 1 : 0, 6, dt);
    P.lean = damp(P.lean, st.steer || 0, 6, dt);
    P.bal = damp(P.bal || 0, st.balance || 0, 12, dt);
    this.board.update(dt, st.air ? 0 : st.speed || 0);
    this.solve(st);
  }

  solve(st) {
    const R = this.rig, P = this.pose;
    const deckY = this.board.deckTop;
    // --- planche (repère du skater) : flips, grabs, manuals, grinds --------------------------
    const bh = this.boardHolder;
    bh.position.set(0, 0, 0); bh.rotation.set(0, 0, 0);
    let feetLift = 0, boardUp = 0;
    if (st.flip) {
      const f = st.flip, k = Math.min(1, f.t / f.dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      bh.position.y = 0.22 + Math.sin(k * Math.PI) * 0.3;
      bh.rotation.order = 'YXZ';
      bh.rotation.x = (f.roll || 0) * e * Math.PI * 2;
      bh.rotation.y = (f.yaw || 0) * e * Math.PI * 2;
      bh.rotation.z = (f.pitch || 0) * e * Math.PI * 2;
      feetLift = 0.28 + Math.sin(k * Math.PI) * 0.18;
      // la planche tourne autour de son centre
      const c = deckY * 0.5;
      _v.set(0, c, 0).applyEuler(bh.rotation);
      bh.position.y += c - _v.y; bh.position.x -= _v.x; bh.position.z -= _v.z;
    } else if (st.air) {
      boardUp = 0.22 * P.tuck + 0.12 * P.grab;
      bh.position.y = boardUp;
      if (st.grab && st.grab.pose === 'beni') bh.rotation.x = 0.5 * P.grab;
      if (st.grab && st.grab.pose === 'christ') bh.rotation.z = 0.4;
    }
    if (st.manual) { const a = 0.22 * P.manual; bh.rotation.z = a; bh.position.y = Math.abs(Math.sin(a)) * 0.38; }
    if (st.darkslide) { bh.rotation.x = Math.PI; bh.position.y = deckY + 0.02; }

    // --- squelette ----------------------------------------------------------------------------
    for (let i = 0; i < R.bones.length; i++) R.inherit(i);
    const iBody = R.i('Body');
    // hauteur du bassin : accroupi, et plus bas en l'air / en grab
    const hip = R.hipY + deckY - (0.19 + 0.15 * P.crouch + 0.06 * P.tuck + 0.16 * P.grab + 0.05 * P.push) + boardUp * 0.25;
    R.p[iBody].set(0.0 - 0.03 * P.manual - 0.03, hip + (st.flip ? feetLift * 0.25 : 0), -0.02 + 0.04 * P.push);
    // corps de profil : buste tourné vers le nez, penché en avant
    const twist = 0.35 + 0.15 * P.push;
    _q.setFromAxisAngle(Y, twist * 0.4);
    R.rotate(iBody, _q);
    _q.setFromAxisAngle(_v.set(1, 0, 0), 0.12 + 0.18 * P.crouch + 0.22 * P.grab);
    R.rotate(iBody, _q);
    if (st.balance) { _q.setFromAxisAngle(_v.set(1, 0, 0), st.balance * 0.35); R.rotate(iBody, _q); }
    if (P.manual) { _q.setFromAxisAngle(_v.set(0, 0, 1), -P.manual * 0.25); R.rotate(iBody, _q); }
    const chain = ['Hips', 'Abdomen', 'Torso', 'Chest', 'Neck', 'Head'];
    for (const n of chain) R.inherit(R.i(n));
    // le buste se tourne encore un peu
    const iChest = R.i('Chest');
    _q.setFromAxisAngle(Y, twist * 0.5 + P.lean * 0.15); R.rotate(R.i('Torso'), _q); R.inherit(iChest);
    R.inherit(R.i('Neck'));
    const iHead = R.i('Head'); R.inherit(iHead);
    // la tête regarde vers le nez de la planche (sens de la marche)
    _q.setFromAxisAngle(Y, (st.fakie ? -0.6 : 0.85) - twist * 0.6);
    R.rotate(iHead, _q);
    // tous les os non pilotés suivent leurs parents
    for (let i = 0; i < R.bones.length; i++) {
      const nm = R.bones[i].name;
      if (nm === 'Root' || nm === 'Body' || chain.includes(nm)) continue; // (noms sans point : three retire les « . »)
      R.inherit(i);
    }

    // --- jambes (IK) -----------------------------------------------------------------------------
    const spread = 0.24 + 0.02 * P.crouch;
    const footY = deckY + boardUp + feetLift;
    const front = _v3.set(spread, footY, 0.0);
    const back = new THREE.Vector3(-spread - 0.03, footY + 0.005, 0.0);
    // poussée : pied arrière au sol, devant puis derrière
    if (P.push > 0.05 && !st.air) {
      const ph = (st.pushPhase || 0) * 5.2;
      const s = Math.sin(ph);
      back.lerp(new THREE.Vector3(-0.05 + s * 0.38, Math.max(0, -Math.cos(ph)) * 0.08 + 0.01, 0.2), P.push);
    }
    if (st.manual) { const a = 0.22 * P.manual; front.y += Math.max(0, Math.sin(a)) * 0.4 * (P.manual > 0 ? 1 : 0.4); back.y += Math.max(0, -Math.sin(a)) * 0.4; if (P.manual > 0) back.y += 0.0; }
    if (st.grab && st.grab.pose === 'christ') { front.y += 0.05; back.y += 0.05; }
    this.leg('L', front, new THREE.Vector3(0.3, 0, 1));
    this.leg('R', back, new THREE.Vector3(-0.1, 0, 1));

    // --- bras ------------------------------------------------------------------------------------
    const sh = (side) => R.p[R.i('UpperArm.' + side)];
    // bras en balancier, coudes pliés ; ils s'ouvrent avec la vitesse et dans les virages
    const open = Math.min(1, (st.speed || 0) / 9) * 0.06;
    let hl = new THREE.Vector3(0.27 + open, hip + 0.2 + Math.sin(this.t * 1.7) * 0.015 + P.lean * 0.06, 0.2 - P.lean * 0.08);
    let hr = new THREE.Vector3(-0.27 - open, hip + 0.16 - P.lean * 0.06, -0.08 + P.lean * 0.08);
    if (P.push > 0.05) { hl.lerp(new THREE.Vector3(0.38, hip - 0.05, 0.3), P.push); hr.lerp(new THREE.Vector3(-0.3, hip - 0.1, 0.1 + Math.sin((st.pushPhase || 0) * 5.2) * 0.25), P.push); }
    if (st.air) {
      // en l'air : bras levés et ouverts, coudes pliés (cibles atteignables)
      hl.lerp(new THREE.Vector3(0.34, hip + 0.42, 0.22), P.tuck);
      hr.lerp(new THREE.Vector3(-0.36, hip + 0.4, -0.12), P.tuck);
    }
    if (st.grind || st.manual) { hl.set(0.5, hip + 0.25 + P.bal * 0.25, 0.1); hr.set(-0.5, hip + 0.25 - P.bal * 0.25, 0.05); }
    if (st.grab) {
      // la main va chercher la planche
      const g = st.grab.pose;
      const by = boardUp + deckY;
      const tgt = {
        indy: [['R', 0.0, by, 0.12]], melon: [['L', -0.02, by, -0.12]], method: [['L', -0.06, by, -0.12]],
        nose: [['L', 0.36, by + 0.02, 0.0]], tail: [['R', -0.38, by + 0.02, 0.0]], stale: [['R', 0.0, by, -0.13]],
        beni: [['R', -0.3, by, 0.1]], christ: [],
      }[g] || [['R', 0.0, by, 0.12]];
      for (const [side, x, y, z] of tgt) {
        const h = new THREE.Vector3(x, y, z);
        if (side === 'L') hl.lerp(h, P.grab); else hr.lerp(h, P.grab);
      }
      if (g === 'christ') { hl.set(0.1, hip + 0.55, 0.62); hr.set(0.1, hip + 0.55, -0.62); }
      if (g === 'method') { _q.setFromAxisAngle(_v.set(1, 0, 0), -0.4 * P.grab); }
    }
    if (st.special && st.special.pose === 'christ') { hl.set(0.1, hip + 0.55, 0.62); hr.set(0.1, hip + 0.55, -0.62); }
    void sh;
    this.arm('L', hl, new THREE.Vector3(0.3, -0.6, -1));
    this.arm('R', hr, new THREE.Vector3(-0.3, -0.6, -1));
    // doigts, poignets et accessoires suivent
    for (let i = 0; i < R.bones.length; i++) {
      const nm = R.bones[i].name;
      if (/^(Index|Middle|Ring|Pinky|Thumb)/.test(nm) || nm.startsWith('PT')) R.inherit(i);
    }
    R.apply();
  }

  leg(side, target, pole) {
    const R = this.rig;
    const iU = R.i('UpperLeg.' + side), iL = R.i('LowerLeg.' + side), iF = R.i('Foot.' + side);
    R.inherit(iU);
    const A = R.p[iU].clone();
    const l1 = R.len['thigh' + side], l2 = R.len['shin' + side];
    const K = new THREE.Vector3();
    solve2(A, target, l1, l2, pole, K);
    R.aim(iU, _v.subVectors(K, A));
    R.inherit(iL);
    R.p[iL].copy(K);
    const T = A.clone().add(_v.subVectors(target, A).setLength(Math.min(A.distanceTo(target), l1 + l2 - 1e-3)));
    R.aim(iL, _v.subVectors(T, K));
    // pied à plat sur la planche, en travers (pointe vers le côté orteils)
    // la pointe du pied (axe Y de l'os) vers le côté orteils, un peu ouverte vers le nez / le tail
    const toe = side === 'L' ? 0.28 : -0.18;
    _v.copy(R.ybind[iF]); _v.y = 0; _v.normalize();
    _v2.set(Math.sin(toe), 0, Math.cos(toe));
    R.q[iF].setFromUnitVectors(_v, _v2);
    if (this._footRot) R.q[iF].premultiply(this._footRot);
    R.p[iF].copy(T);
  }

  arm(side, target, pole) {
    const R = this.rig;
    const iU = R.i('UpperArm.' + side), iL = R.i('LowerArm.' + side), iW = R.i('Wrist.' + side);
    R.inherit(R.i('Shoulder.' + side));
    R.inherit(iU);
    const A = R.p[iU].clone();
    const l1 = R.len['uarm' + side], l2 = R.len['farm' + side];
    const K = new THREE.Vector3();
    solve2(A, target, l1, l2, pole, K);
    R.aim(iU, _v.subVectors(K, A));
    R.inherit(iL); R.p[iL].copy(K);
    R.aim(iL, _v.subVectors(target, K));
    R.inherit(iW);
  }
}

// outil de mise au point (non utilisé par le jeu)
export function loadFresh(base, gender) { return loader.loadAsync(`${base}models/${gender}.glb`); }
