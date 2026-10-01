// Le skater : corps « Universal Base Characters » de Quaternius (CC0), vêtements générés en couches
// à partir du corps (coques décalées le long des normales, découpées par zones d'os), matières PBR
// de tissu, imprimé du produit, accessoires en code. Posture par cinématique inverse : les pieds
// restent verrouillés sur la planche, le corps suit des cibles (bassin, mains, regard).
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Board } from './board.js';
import { PALETTE } from '../config.js';
import { printCanvas, canvasTexture, loadImage } from '../world/textures.js';

// --- coiffures proposées, par genre ---------------------------------------------------------------
export const PARTS = {
  women: {
    heads: [
      { id: 'Hair_Long', label: 'Longs' },
      { id: 'Hair_Buns', label: 'Chignons' },
      { id: 'Hair_SimpleParted', label: 'Courts' },
      { id: 'Hair_BuzzedFemale', label: 'Rasés' },
    ],
  },
  men: {
    heads: [
      { id: 'Hair_SimpleParted', label: 'Raie' },
      { id: 'Hair_Buzzed', label: 'Rasés' },
      { id: 'Hair_Long', label: 'Longs' },
      { id: 'Hair_Beard', label: 'Rasés + barbe' },
    ],
  },
};
const ALL_HAIRS = ['Hair_Long', 'Hair_Buns', 'Hair_SimpleParted', 'Hair_BuzzedFemale', 'Hair_Buzzed', 'Hair_Beard', 'Eyebrows_Female', 'Eyebrows_Regular'];

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const cache = {};
export function loadCharacter(base, gender) {
  if (!cache[gender]) cache[gender] = loader.loadAsync(`${base}models/ubc_${gender}.glb`);
  return cache[gender];
}
export function loadFresh(base, gender) { return loader.loadAsync(`${base}models/ubc_${gender}.glb`); }

const _q = new THREE.Quaternion(), _v = new THREE.Vector3(), _v2 = new THREE.Vector3();
const _m = new THREE.Matrix4(), _m2 = new THREE.Matrix4();
const Y = new THREE.Vector3(0, 1, 0);
const lerp = THREE.MathUtils.lerp;
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));

// noms des os du squelette UBC (style Unreal)
const B = {
  root: 'root', body: 'pelvis', spine: ['spine_01', 'spine_02', 'spine_03'], neck: 'neck_01', head: 'Head',
  clav: { L: 'clavicle_l', R: 'clavicle_r' }, uarm: { L: 'upperarm_l', R: 'upperarm_r' }, farm: { L: 'lowerarm_l', R: 'lowerarm_r' }, hand: { L: 'hand_l', R: 'hand_r' },
  thigh: { L: 'thigh_l', R: 'thigh_r' }, calf: { L: 'calf_l', R: 'calf_r' }, foot: { L: 'foot_l', R: 'foot_r' }, ball: { L: 'ball_l', R: 'ball_r' },
};

// ------------------------------------------------------------------------------------------------
// Pose de repos = pose de modélisation (inverse-bind), redressée par une similitude R0 :
// X = côté gauche du perso (nez de la planche), Y = haut, Z = visage (côté orteils), mètres, pieds au sol.
class Rig {
  constructor(scene, skeleton, armature) {
    this.scene = scene;
    this.bones = skeleton.bones;
    this.by = {};
    this.bones.forEach((b, i) => { this.by[b.name] = i; });
    this.parent = this.bones.map((b) => (b.parent && b.parent.isBone ? this.bones.indexOf(b.parent) : -1));
    scene.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(scene.matrixWorld).invert();
    const nodeP = this.bones.map((b) => new THREE.Vector3().setFromMatrixPosition(_m.copy(inv).multiply(b.matrixWorld)));
    const bindM = skeleton.boneInverses.map((ib) => new THREE.Matrix4().copy(ib).invert());
    const bP = bindM.map((m) => new THREE.Vector3().setFromMatrixPosition(m));
    const ix = (n) => this.i(n);
    const footB = bP[ix(B.foot.L)].clone().add(bP[ix(B.foot.R)]).multiplyScalar(0.5);
    const footN = nodeP[ix(B.foot.L)].clone().add(nodeP[ix(B.foot.R)]).multiplyScalar(0.5);
    const up = bP[ix(B.head)].clone().sub(footB);
    const k = (nodeP[ix(B.head)].y - footN.y) / up.length();
    up.normalize();
    const left = bP[ix(B.uarm.L)].clone().sub(bP[ix(B.uarm.R)]);
    left.addScaledVector(up, -left.dot(up)).normalize();
    const fwd = new THREE.Vector3().crossVectors(left, up).normalize();
    const basis = new THREE.Matrix4().makeBasis(left, up, fwd).invert();
    const R0 = new THREE.Matrix4().makeScale(k, k, k).multiply(basis);
    const fb = footB.clone().applyMatrix4(R0);
    R0.premultiply(new THREE.Matrix4().makeTranslation(-fb.x, footN.y - fb.y, -fb.z));
    this.R0 = R0; this.k = k;
    this.bp = []; this.bq = []; this.bs = [];
    bindM.forEach((m, i) => {
      _m.copy(R0).multiply(m);
      const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
      _m.decompose(p, q, s);
      this.bp[i] = p; this.bq[i] = q; this.bs[i] = s;
    });
    this.armature = armature;
    this.p = this.bp.map((v) => v.clone());
    this.q = this.bones.map(() => new THREE.Quaternion());
    this.ybind = this.bq.map((q) => new THREE.Vector3(0, 1, 0).applyQuaternion(q));
    const L = (a, b) => this.bp[this.i(a)].distanceTo(this.bp[this.i(b)]);
    this.len = {};
    for (const s of ['L', 'R']) {
      this.len['thigh' + s] = L(B.thigh[s], B.calf[s]); this.len['shin' + s] = L(B.calf[s], B.foot[s]);
      this.len['uarm' + s] = L(B.uarm[s], B.farm[s]); this.len['farm' + s] = L(B.farm[s], B.hand[s]);
    }
    this.hipY = this.bp[this.i(B.body)].y;
    this.ankleY = this.bp[this.i(B.foot.L)].y;
    this.shoulderY = this.bp[this.i(B.uarm.L)].y;
  }

  i(name) { return this.by[name]; }

  inherit(i) {
    const pi = this.parent[i];
    if (pi < 0) { this.q[i].identity(); this.p[i].copy(this.bp[i]); return; }
    this.q[i].copy(this.q[pi]);
    _v.subVectors(this.bp[i], this.bp[pi]).applyQuaternion(this.q[pi]);
    this.p[i].copy(this.p[pi]).add(_v);
  }

  rotate(i, R) { this.q[i].premultiply(R); }

  aim(i, d) {
    const cur = this._a || (this._a = new THREE.Vector3());
    const want = this._b || (this._b = new THREE.Vector3());
    const r = this._r || (this._r = new THREE.Quaternion());
    want.copy(d).normalize();
    cur.copy(this.ybind[i]).applyQuaternion(this.q[i]).normalize();
    r.setFromUnitVectors(cur, want);
    this.q[i].premultiply(r);
  }

  apply() {
    _m2.copy(this.scene.matrixWorld).invert().multiply(this.armature.matrixWorld);
    const W = this._W || (this._W = this.bones.map(() => new THREE.Matrix4()));
    const q = this._qq || (this._qq = new THREE.Quaternion());
    for (let i = 0; i < this.bones.length; i++) {
      q.copy(this.q[i]).multiply(this.bq[i]);
      W[i].compose(this.p[i], q, this.bs[i]);
      const pi = this.parent[i];
      _m.copy(pi < 0 ? _m2 : W[pi]).invert().multiply(W[i]);
      const b = this.bones[i];
      _m.decompose(b.position, b.quaternion, b.scale);
    }
  }
}

function solve2(A, T, l1, l2, pole, outK) {
  const dir = _v.subVectors(T, A);
  let d = dir.length();
  dir.divideScalar(d || 1);
  d = Math.min(Math.max(d, Math.abs(l1 - l2) + 1e-3), l1 + l2 - 1e-3);
  const a = Math.acos(THREE.MathUtils.clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  _v2.copy(pole).addScaledVector(dir, -pole.dot(dir)).normalize();
  outK.copy(A).addScaledVector(dir, Math.cos(a) * l1).addScaledVector(_v2, Math.sin(a) * l1);
  return d;
}

// UV en mètres, projection par face dominante (repère modèle) : grain des tissus régulier
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
  return new THREE.BufferAttribute(uv, 2);
}

// ------------------------------------------------------------------------------------------------
// Vêtements : coques générées à partir du corps.
// Chaque sommet du corps connaît son os dominant et sa position (repère modèle) ; une pièce est
// l'ensemble des triangles dont les 3 sommets sont dans sa zone, décalés le long de la normale lissée.
function analyzeBody(body, rig) {
  const g = body.geometry;
  const pos = g.attributes.position, nor = g.attributes.normal, si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  const n = pos.count;
  const model = new Float32Array(n * 3), dom = new Int16Array(n);
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(rig.R0);
    model[i * 3] = v.x; model[i * 3 + 1] = v.y; model[i * 3 + 2] = v.z;
    let best = 0, bw = -1;
    for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; best = si.getComponent(i, k); } }
    dom[i] = best;
  }
  // normales lissées (sommets confondus moyennés) en espace sommets
  const map = new Map(), acc = new Float32Array(n * 3);
  const key = (i) => `${Math.round(pos.getX(i) * 1e4)},${Math.round(pos.getY(i) * 1e4)},${Math.round(pos.getZ(i) * 1e4)}`;
  const groups = [];
  for (let i = 0; i < n; i++) { const k = key(i); let gi = map.get(k); if (gi == null) { gi = groups.length; groups.push([0, 0, 0]); map.set(k, gi); } const a = groups[gi]; a[0] += nor.getX(i); a[1] += nor.getY(i); a[2] += nor.getZ(i); acc[i] = gi; }
  const sn = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = groups[acc[i]]; const l = Math.hypot(a[0], a[1], a[2]) || 1; sn[i * 3] = a[0] / l; sn[i * 3 + 1] = a[1] / l; sn[i * 3 + 2] = a[2] / l; }
  const names = body.skeleton.bones.map((b) => b.name);
  const nm = new THREE.Matrix3().getNormalMatrix(rig.R0), mn = new Float32Array(n * 3), t = new THREE.Vector3();
  for (let i = 0; i < n; i++) { t.set(sn[i * 3], sn[i * 3 + 1], sn[i * 3 + 2]).applyMatrix3(nm).normalize(); mn[i * 3] = t.x; mn[i * 3 + 1] = t.y; mn[i * 3 + 2] = t.z; }
  return { model, dom, names, sn, mn, index: g.index.array.slice(), uv: boxUV(g, rig.R0) };
}

const TOP_RIGID = { from: [B.thigh.L, B.thigh.R], to: B.body };
function garmentZones(rig, A) {
  const bp = (nm) => rig.bp[rig.i(nm)];
  const waist = bp(B.body).y + 0.03;
  const knee = bp(B.calf.L).y;
  const ankle = rig.ankleY;
  const sh = (s) => bp(B.uarm[s]);
  const elbow = (s) => bp(B.farm[s]);
  const is = (i, ...list) => list.includes(A.names[A.dom[i]]);
  const y = (i) => A.model[i * 3 + 1];
  const armDist = (i, s) => { const p = sh(s); return Math.hypot(A.model[i * 3] - p.x, A.model[i * 3 + 1] - p.y, A.model[i * 3 + 2] - p.z); };
  const sideOf = (i) => (A.model[i * 3] > 0 ? 'L' : 'R');
  const isArm = (i) => is(i, B.uarm.L, B.uarm.R, B.farm.L, B.farm.R, B.hand.L, B.hand.R);
  // ourlet horizontal : tout ce qui est au-dessus de la ligne (tronc, bassin, haut des cuisses),
  // jamais une découpe qui suit la frontière des os (effet justaucorps)
  const trunkBones = [...B.spine, B.clav.L, B.clav.R, B.body, B.thigh.L, B.thigh.R];
  const above = (i, hem) => is(i, ...trunkBones) && y(i) > hem && y(i) < rig.shoulderY + 0.12;
  // ourlet : droit sur les côtés et le dos, remonté devant au centre (sinon le pli de l'aine
  // dessine un V de justaucorps quand le skater fléchit)
  const hemFront = (i) => {
    const x = Math.abs(A.model[i * 3]), z = A.model[i * 3 + 2];
    return z > 0 ? 0.1 * (1 - THREE.MathUtils.smoothstep(x, 0.04, 0.15)) : 0;
  };
  const torso = (i) => above(i, waist - 0.05 + hemFront(i));
  // drapé : le tissu tombe de la poitrine au lieu de coller sous le buste
  let chestZ = -1, chestY = 0;
  for (let i = 0; i < A.dom.length; i++) {
    if (!is(i, ...B.spine) || y(i) < waist + 0.12 || y(i) > rig.shoulderY) continue;
    if (Math.abs(A.model[i * 3]) < 0.12 && A.model[i * 3 + 2] > chestZ) { chestZ = A.model[i * 3 + 2]; chestY = y(i); }
  }
  const drape = (i, slope = 0.3) => {
    const nz = A.sn[i * 3 + 2];
    if (nz < 0.5 || y(i) > chestY || y(i) < waist - 0.12 || Math.abs(A.model[i * 3]) > 0.13) return 0;
    const target = chestZ - (chestY - y(i)) * slope;
    // fondu vers les côtés pour ne pas créer de marche
    const side = 1 - THREE.MathUtils.smoothstep(Math.abs(A.model[i * 3]), 0.07, 0.13);
    const low = THREE.MathUtils.smoothstep(y(i), waist + 0.02, waist + 0.2);
    return Math.min(0.045, Math.max(0, target - A.model[i * 3 + 2]) / nz) * side * low;
  };
  const chestPush = (i) => drape(i);
  const upperArm = (i) => is(i, B.uarm.L, B.uarm.R);
  const foreArm = (i) => is(i, B.farm.L, B.farm.R);
  const legs = (i) => (is(i, B.body, B.spine[0]) && y(i) < waist + 0.05) || is(i, B.thigh.L, B.thigh.R, B.calf.L, B.calf.R);
  const feet = (i) => /^(foot|ball)/.test(A.names[A.dom[i]]);
  void elbow;
  return {
    tshirt: { rigid: TOP_RIGID, test: (i) => torso(i) || (upperArm(i) && armDist(i, sideOf(i)) < 0.2), off: (i) => (upperArm(i) ? 0.02 : 0.03 + chestPush(i) + Math.max(0, waist + 0.2 - y(i)) * 0.06) },
    tank: { rigid: TOP_RIGID, test: (i) => torso(i) && !is(i, B.clav.L, B.clav.R), off: (i) => 0.018 + chestPush(i) },
    hoodie: { rigid: TOP_RIGID, test: (i) => above(i, waist - 0.07) || upperArm(i) || foreArm(i) || (is(i, B.neck) && y(i) < bp(B.neck).y + 0.02), off: (i) => (foreArm(i) ? 0.026 : upperArm(i) ? 0.032 : 0.04 + drape(i, 0.22) + Math.max(0, waist + 0.2 - y(i)) * 0.05) },
    jacket: { rigid: TOP_RIGID, test: (i) => above(i, waist - 0.06) || upperArm(i) || foreArm(i), off: (i) => (isArm(i) ? 0.028 : 0.034 + drape(i, 0.25)) },
    jeans: { rigid: { ...TOP_RIGID, minY: waist - 0.09 }, test: (i) => legs(i) && y(i) > ankle + 0.035, off: (i) => 0.011 + Math.max(0, knee - y(i)) * 0.03 },
    pants: { rigid: { ...TOP_RIGID, minY: waist - 0.09 }, test: (i) => legs(i) && y(i) > ankle + 0.05, off: () => 0.008 },
    cargo: { rigid: { ...TOP_RIGID, minY: waist - 0.09 }, test: (i) => legs(i) && y(i) > ankle + 0.06, off: (i) => 0.018 + THREE.MathUtils.smoothstep(waist - y(i), 0, 0.5) * 0.022 },
    shorts: { rigid: { ...TOP_RIGID, minY: waist - 0.09 }, test: (i) => legs(i) && y(i) > knee + 0.06, off: (i) => 0.016 + THREE.MathUtils.smoothstep(waist - y(i), 0, 0.35) * 0.02 },
    sneakers_low: { test: (i) => feet(i) || (is(i, B.calf.L, B.calf.R) && y(i) < ankle + 0.03), off: (i) => (/^ball/.test(A.names[A.dom[i]]) ? 0.024 : 0.016) + (A.mn[i * 3 + 1] < -0.4 ? 0.01 : 0) },
    sneakers_high: { test: (i) => feet(i) || (is(i, B.calf.L, B.calf.R) && y(i) < ankle + 0.13), off: (i) => (/^ball/.test(A.names[A.dom[i]]) ? 0.024 : 0.018) + (A.mn[i * 3 + 1] < -0.4 ? 0.01 : 0) },
    socks: { test: (i) => is(i, B.calf.L, B.calf.R) && y(i) < ankle + 0.17, off: () => 0.004 },
  };
}

function buildShell(body, A, zone, k) {
  const g = body.geometry;
  const n = g.attributes.position.count;
  const keep = new Uint8Array(n);
  for (let i = 0; i < n; i++) keep[i] = zone.test(i) ? 1 : 0;
  const idx = [];
  const src = A.index;
  for (let t = 0; t < src.length; t += 3) {
    const a = src[t], b = src[t + 1], c = src[t + 2];
    if (keep[a] && keep[b] && keep[c]) idx.push(a, b, c);
  }
  const pos = g.attributes.position;
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const o = keep[i] ? zone.off(i) / k : 0;
    out[i * 3] = pos.getX(i) + A.sn[i * 3] * o;
    out[i * 3 + 1] = pos.getY(i) + A.sn[i * 3 + 1] * o;
    out[i * 3 + 2] = pos.getZ(i) + A.sn[i * 3 + 2] * o;
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(out, 3));
  sg.setAttribute('normal', new THREE.BufferAttribute(A.sn, 3));
  sg.setAttribute('uv', A.uv);
  if (zone.rigid && body.skeleton) {
    // un haut ne suit pas les cuisses : leurs influences passent au bassin (sinon l'ourlet
    // descend entre les jambes quand le skater fléchit, effet justaucorps)
    const names = body.skeleton.bones.map((b) => b.name);
    const to = names.indexOf(zone.rigid.to);
    const from = zone.rigid.from.map((nm) => names.indexOf(nm)).filter((x) => x >= 0);
    const si = g.attributes.skinIndex.clone();
    const minY = zone.rigid.minY ?? -9;
    for (let i = 0; i < si.count; i++) {
      if (A.model[i * 3 + 1] < minY) continue;
      for (let c = 0; c < si.itemSize; c++) if (from.includes(si.getComponent(i, c))) si.setComponent(i, c, to);
    }
    sg.setAttribute('skinIndex', si);
  } else sg.setAttribute('skinIndex', g.attributes.skinIndex);
  sg.setAttribute('skinWeight', g.attributes.skinWeight);
  sg.setIndex(idx);
  return { geo: sg, keep, count: idx.length };
}

// ------------------------------------------------------------------------------------------------
export class Skater {
  constructor({ quality, assetBase, bank }) {
    this.quality = quality;
    this.assetBase = assetBase;
    this.bank = bank;
    this.matCache = new Map();
    this.group = new THREE.Group();
    this.group.name = 'skater';
    this.body = new THREE.Group();
    this.group.add(this.body);
    this.board = new Board({ quality });
    this.boardHolder = new THREE.Group();
    this.boardHolder.add(this.board.group);
    this.group.add(this.boardHolder);
    this.pose = { crouch: 0, grab: 0, lean: 0, push: 0, tuck: 0, manual: 0, bal: 0 };
    this.mode = 'skate';
    this.ready = false;
    this.t = 0;
    this.garments = [];
  }

  async setLook(look) {
    this.look = look;
    const gltf = await loadCharacter(this.assetBase, look.gender);
    if (this.gender !== look.gender) {
      if (this.char) this.body.remove(this.char);
      if (this.current) { this.current.stop(); this.current = null; this.mode = 'skate'; }
      this.char = gltf.scene;
      this.gender = look.gender;
      this.body.add(this.char);
      this.char.updateMatrixWorld(true);
      const u = gltf.userData;
      if (!u.rig) {
        let armature = null, body = null;
        u.meshes = {};
        this.char.traverse((o) => {
          if (o.name === 'Armature') armature = o;
          if (o.isSkinnedMesh) {
            o.frustumCulled = false;
            o.castShadow = this.quality.tier === 'high';
            const mn = (o.material && o.material.name) || '';
            if (/Superhero/.test(mn)) body = o;
            u.meshes[o.name] = o;
          }
        });
        if (!armature) armature = body.skeleton.bones[0].parent;
        u.rig = new Rig(this.char, body.skeleton, armature);
        u.body = body;
        u.A = analyzeBody(body, u.rig);
        u.bodyIndex = body.geometry.index.array.slice();
        // peau : texture claire teintée, rugosité et normale du kit
        u.skinMat = new THREE.MeshPhysicalMaterial({
          map: body.material.map, normalMap: body.material.normalMap, roughnessMap: body.material.roughnessMap,
          roughness: 1, sheen: 0.25, sheenRoughness: 0.6, sheenColor: new THREE.Color('#ff9a7e'), specularIntensity: 0.5,
        });
        body.material = u.skinMat;
        // cheveux : une matière physique teintée par coiffure
        for (const [name, m] of Object.entries(u.meshes)) {
          if (/Hair|Eyebrows/.test(name) || /Hair/.test((m.material && m.material.name) || '')) {
            const mm = m.material;
            m.material = new THREE.MeshPhysicalMaterial({ map: mm.map, normalMap: mm.normalMap, roughness: 0.55, sheen: 0.4, sheenRoughness: 0.35, alphaTest: mm.alphaTest || 0, transparent: false, side: THREE.DoubleSide });
            m.userData.hair = true;
          }
        }
        u.mixer = new THREE.AnimationMixer(this.char);
        u.clips = {};
        for (const c of gltf.animations) u.clips[c.name] = c;
        this.rig = u.rig;
        this.attachBoneProps(u);
        u.props = this.props;
      }
      this.u = u;
      this.rig = u.rig; this.mixer = u.mixer; this.clips = u.clips; this.props = u.props;
    }
    this.applyOutfit();
    this.ready = true;
    return this;
  }

  // ----------------------------------------------------------------------------------------------
  applyOutfit() {
    const look = this.look, u = this.u, P = PARTS[look.gender];
    const outfit = look.outfit || {};
    // coiffure
    const head = P.heads.find((h) => h.id === look.head) || P.heads[0];
    const hairColor = new THREE.Color(look.hairColor || '#4A2F1E');
    for (const name of ALL_HAIRS) {
      const m = u.meshes[name]; if (!m) continue;
      const isBrow = name.startsWith('Eyebrows');
      m.visible = isBrow ? false : name === head.id || (head.id === 'Hair_Beard' && name === 'Hair_Buzzed');
      if (m.material.color) m.material.color.copy(hairColor).multiplyScalar(1.6);
    }
    for (const m of Object.values(u.meshes)) if (m.userData.hair && !ALL_HAIRS.includes(m.name)) m.material.color.copy(hairColor).multiplyScalar(1.6);
    // casquette / bonnet / casque : on cache les cheveux longs qui traverseraient
    // peau
    const skin = new THREE.Color(look.skin || '#C98E62');
    const ref = new THREE.Color('#e8bfa0');
    u.skinMat.color.setRGB(Math.min(1.25, skin.r / ref.r), Math.min(1.25, skin.g / ref.g), Math.min(1.25, skin.b / ref.b));

    // vêtements
    for (const gm of this.garments) { gm.parent && gm.parent.remove(gm); gm.geometry.dispose(); }
    this.garments = [];
    const zones = garmentZones(this.rig, u.A);
    const FABRIC = { tshirt: 'jersey', tank: 'jersey', hoodie: 'jersey', jacket: 'poplin', jeans: 'denim', pants: 'denim', cargo: 'poplin', shorts: 'poplin', sneakers_low: 'suede', sneakers_high: 'suede', socks: 'jersey' };
    const pieces = [];
    const top = outfit.top, bottom = outfit.bottom, feet = outfit.feet;
    pieces.push({ kind: top ? top.gabarit : 'tank', prod: top, def: ['#f3f0e8', '#2a2a2e', PALETTE.acid] });
    pieces.push({ kind: bottom ? bottom.gabarit : 'jeans', prod: bottom, def: ['#2a3550', '#1f2840', PALETTE.cone] });
    const bottomKind = bottom ? bottom.gabarit : 'jeans';
    if (bottomKind === 'shorts' || bottomKind === 'cargo') pieces.push({ kind: 'socks', prod: null, def: [look.socks || '#f3f0e8'] });
    const shoeKind = feet ? feet.gabarit : 'sneakers_low';
    const shoeCols = feet && feet.colors ? [feet.colors.primary, feet.colors.secondary, feet.colors.accent] : ['#f3f0e8', '#141416', PALETTE.acid];
    const covered = new Uint8Array(u.A.model.length / 3);
    for (const pc of pieces) {
      const z = zones[pc.kind]; if (!z) continue;
      const sh = buildShell(u.body, u.A, z, this.rig.k);
      const cols = pc.prod && pc.prod.colors ? [pc.prod.colors.primary, pc.prod.colors.secondary, pc.prod.colors.accent] : pc.def;
      const mat = this.fabric(FABRIC[pc.kind] || 'jersey', cols[0], pc.kind);
      const mesh = new THREE.SkinnedMesh(sh.geo, mat);
      mesh.bind(u.body.skeleton, u.body.bindMatrix);
      mesh.frustumCulled = false;
      mesh.castShadow = this.quality.tier === 'high';
      u.body.parent.add(mesh);
      this.garments.push(mesh);
      if (pc.kind !== 'socks') for (let i = 0; i < sh.keep.length; i++) if (sh.keep[i]) covered[i] = 1;
    }
    // pieds cachés sous les baskets en code
    if (this.shoeParts) {
      const fz = zones.sneakers_low;
      for (let i = 0; i < covered.length; i++) if (fz.test(i)) covered[i] = 1;
      const upMat = this.fabric('suede', shoeCols[0], 'shoe');
      const soleCol = new THREE.Color(shoeCols[1] || '#f3f0e8');
      // une semelle très foncée sur une basket claire : on garde une semelle claire, la couleur 2 va à la bande
      for (const m of this.shoeParts.upper) m.material = upMat;
      for (const m of this.shoeParts.collar) { m.material = upMat; m.visible = shoeKind === 'sneakers_high'; }
      for (const m of this.shoeParts.sole) m.material.color.set(soleCol.getHSL({}).l < 0.15 && new THREE.Color(shoeCols[0]).getHSL({}).l > 0.6 ? '#ece6d8' : soleCol);
      for (const m of this.shoeParts.band) m.material.color.set(shoeCols[1] || '#141416');
      for (const m of this.shoeParts.lace) m.material.color.set(shoeCols[2] || '#f3f0e8');
    }
    // le corps ne garde que ce qui n'est pas couvert (pas de peau qui traverse les vêtements)
    const bi = [];
    const src = u.bodyIndex;
    for (let t = 0; t < src.length; t += 3) {
      const a = src[t], b = src[t + 1], c = src[t + 2];
      if (!(covered[a] && covered[b] && covered[c])) bi.push(a, b, c);
    }
    u.body.geometry.setIndex(bi);
    this.updateProps();
    this.board.build(look.board || {});
  }

  fabric(kind, color, gab) {
    const key = kind + color + gab;
    if (!this.matCache.has(key)) {
      const scale = kind === 'denim' ? 9 : kind === 'suede' ? 12 : 8;
      const m = this.bank ? this.bank.fabric(kind, { color, scale, sheen: kind === 'suede' ? 0.8 : 0.5 }) : new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
      m.side = THREE.DoubleSide;
      this.matCache.set(key, m);
    }
    return this.matCache.get(key);
  }

  setBoardSetup(setup) { this.board.build(setup); }

  // ----------------------------------------------------------------------------------------------
  // Accessoires en code rattachés aux os : casquette, bonnet, casque, protections, imprimé, sac.
  attachBoneProps(u) {
    const R = this.rig;
    const bone = (n) => R.bones[R.i(n)];
    this.props = {};
    const fix = (obj, boneName, at) => {
      // objet décrit en mètres, repère modèle, autour du point « at » (modèle)
      const i = R.i(boneName);
      const g = new THREE.Group(); g.add(obj);
      g.scale.setScalar(1 / R.bs[i].x);
      g.quaternion.copy(R.bq[i]).invert();
      const inner = new THREE.Group(); inner.add(g);
      if (at) {
        // décalage du point d'ancrage par rapport à la tête de l'os, exprimé en repère de l'os
        const off = at.clone().sub(R.bp[i]).applyQuaternion(R.bq[i].clone().invert()).multiplyScalar(1 / R.bs[i].x);
        g.position.copy(off);
      }
      inner.visible = false;
      bone(boneName).add(inner);
      return inner;
    };
    // repères tirés du maillage : sommet du crâne, poitrine
    const A = u.A;
    let top = -1, chestZ = -1, cx = 0, cy = 0;
    const headI = A.names.indexOf(B.head), chestBone = A.names.indexOf(B.spine[2]);
    let hx = 0, hz = 0, hn = 0;
    for (let i = 0; i < A.dom.length; i++) {
      const x = A.model[i * 3], y = A.model[i * 3 + 1], z = A.model[i * 3 + 2];
      if (A.dom[i] === headI) { if (y > top) top = y; hx += x; hz += z; hn++; }
      if (A.dom[i] === chestBone && Math.abs(x) < 0.03 && z > chestZ) { chestZ = z; cy = y; cx = x; }
    }
    hx /= hn; hz /= hn;
    const headTop = new THREE.Vector3(hx, top, hz);
    const capMat = new THREE.MeshPhysicalMaterial({ color: PALETTE.acid, roughness: 0.85, sheen: 0.5 });
    const cap = new THREE.Group();
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.118, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
    crown.scale.set(1.06, 0.72, 1.12);
    const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.098, 0.01, 28, 1, false, -Math.PI / 2, Math.PI), capMat);
    visor.scale.set(1, 1, 1.25); visor.position.set(0, 0.004, 0.1); visor.rotation.x = 0.12;
    const button = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 6), capMat);
    button.position.y = 0.118 * 0.72;
    cap.add(crown, visor, button); cap.position.set(0, -0.07, 0.008);
    this.props.cap = fix(cap, B.head, headTop);
    const beanie = new THREE.Group();
    const bb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.56), capMat.clone());
    bb.scale.set(1.04, 1.05, 1.1);
    const fold = new THREE.Mesh(new THREE.CylinderGeometry(0.112, 0.114, 0.045, 24, 1, true), capMat.clone());
    fold.position.y = 0.0;
    beanie.add(bb, fold); beanie.position.set(0, -0.09, 0);
    this.props.beanie = fix(beanie, B.head, headTop);
    const helmet = new THREE.Group();
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.125, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.58), new THREE.MeshPhysicalMaterial({ color: '#111114', roughness: 0.3, clearcoat: 0.8 }));
    shell.scale.set(1.04, 0.95, 1.12);
    helmet.add(shell); helmet.position.set(0, -0.085, 0);
    this.props.helmet = fix(helmet, B.head, headTop);
    // protections
    const padMat = new THREE.MeshPhysicalMaterial({ color: '#141416', roughness: 0.7, sheen: 0.4 });
    const capPad = new THREE.MeshPhysicalMaterial({ color: PALETTE.cone, roughness: 0.35, clearcoat: 0.5 });
    const pad = (r, h) => { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.95, h, 16, 1, true), padMat); c.material.side = THREE.DoubleSide; const kk = new THREE.Mesh(new THREE.SphereGeometry(r * 0.75, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), capPad); kk.rotation.x = Math.PI / 2; kk.position.z = r * 0.55; kk.scale.set(1, 1, 0.6); g.add(c, kk); return g; };
    for (const s of ['L', 'R']) {
      this.props['knee' + s] = fix(pad(0.07, 0.11), B.calf[s], R.bp[R.i(B.calf[s])].clone().add(new THREE.Vector3(0, -0.02, 0)));
      this.props['elbow' + s] = fix(pad(0.05, 0.08), B.farm[s]);
      this.props['wrist' + s] = fix(pad(0.04, 0.07), B.hand[s], R.bp[R.i(B.farm[s])].clone().lerp(R.bp[R.i(B.hand[s])], 0.85));
    }
    // baskets en code (les coques suivaient les orteils) : semelle extrudée, tige galbée, bande, lacets
    const footI = (sd) => [A.names.indexOf(B.foot[sd]), A.names.indexOf(B.ball[sd])];
    this.shoeParts = { upper: [], sole: [], band: [], lace: [], collar: [] };
    for (const sd of ['L', 'R']) {
      const ids = footI(sd);
      let x0 = 9, x1 = -9, y0 = 9, y1 = -9, z0 = 9, z1 = -9;
      for (let i = 0; i < A.dom.length; i++) {
        if (!ids.includes(A.dom[i])) continue;
        const x = A.model[i * 3], y = A.model[i * 3 + 1], z = A.model[i * 3 + 2];
        if (y > R.ankleY + 0.05) continue;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); z0 = Math.min(z0, z); z1 = Math.max(z1, z);
      }
      const L = z1 - z0 + 0.012, W = x1 - x0 + 0.014, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2 + 0.004;
      const foot = (a, b, k = 0.55) => {
        const sh = new THREE.Shape();
        const N = 40;
        for (let j = 0; j <= N; j++) {
          const t = (j / N) * Math.PI * 2, c = Math.cos(t), sn = Math.sin(t);
          let x = a * Math.sign(c) * Math.abs(c) ** k, z = b * Math.sign(sn) * Math.abs(sn) ** k;
          x *= 1 + 0.1 * (z / b) - (z < -b * 0.3 ? 0.08 : 0);
          // voûte : le bord intérieur se creuse un peu
          if ((sd === 'L' ? x < 0 : x > 0) && Math.abs(z) < b * 0.35) x *= 0.93;
          if (j === 0) sh.moveTo(x, z); else sh.lineTo(x, z);
        }
        return sh;
      };
      const ext = (shape, depth, bevel) => {
        const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 8 });
        g.rotateX(Math.PI / 2); g.translate(0, depth, 0);
        return g;
      };
      const shoe = new THREE.Group();
      const soleH = 0.02;
      const sole = new THREE.Mesh(ext(foot(W / 2, L / 2), soleH, 0.005), new THREE.MeshStandardMaterial({ roughness: 0.8 }));
      const band = new THREE.Mesh(ext(foot(W / 2 + 0.003, L / 2 + 0.003), 0.008, 0.002), new THREE.MeshStandardMaterial({ roughness: 0.6 }));
      band.position.y = soleH - 0.002;
      const upH = Math.max(0.06, R.ankleY - y0 + 0.005);
      // tige : talon haut à l'arrière, bout bas devant (deux demi-ellipsoïdes fondus)
      const up = new THREE.Group();
      const hemi = new THREE.SphereGeometry(1, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2);
      const back = new THREE.Mesh(hemi, null); back.scale.set(W / 2 * 0.95, upH, L * 0.36); back.position.set(0, soleH, -L * 0.12);
      const toe = new THREE.Mesh(hemi, null); toe.scale.set(W / 2 * 0.93, upH * 0.55, L * 0.33); toe.position.set(0, soleH, L * 0.15);
      up.add(back, toe);
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(W * 0.48, W * 0.52, 0.11, 20, 1, true), null);
      collar.position.set(0, soleH + upH * 0.7, -L * 0.18);
      const lace = new THREE.Mesh(new THREE.BoxGeometry(W * 0.32, 0.012, L * 0.34), new THREE.MeshStandardMaterial({ roughness: 0.7 }));
      lace.position.set(0, soleH + upH * 0.68, L * 0.06); lace.rotation.x = -0.5;
      shoe.add(sole, band, up, collar, lace);
      shoe.position.set(0, -0.004, 0);
      shoe.traverse((m) => { if (m.isMesh) m.castShadow = true; });
      this.shoeParts.sole.push(sole); this.shoeParts.band.push(band); this.shoeParts.upper.push(back, toe); this.shoeParts.collar.push(collar); this.shoeParts.lace.push(lace);
      this.props['shoe' + sd] = fix(shoe, B.foot[sd], new THREE.Vector3(cx, y0, cz));
    }
    // imprimé de poitrine
    const printMat = new THREE.MeshStandardMaterial({ transparent: true, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -4 });
    const print = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.19), printMat);
    this.printMat = printMat;
    this.props.print = fix(print, B.spine[2], new THREE.Vector3(cx, cy - 0.05, chestZ + 0.05));
    // sac à dos (panier vestiaire)
    const pack = new THREE.Group();
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.36, 0.14), new THREE.MeshPhysicalMaterial({ color: '#1d1f24', roughness: 0.8, sheen: 0.4 }));
    const flap = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.12, 0.15), new THREE.MeshStandardMaterial({ color: PALETTE.acid, roughness: 0.7 }));
    flap.position.y = 0.13; pack.add(bag, flap);
    this.props.pack = fix(pack, B.spine[2], new THREE.Vector3(0, cy - 0.05, -0.17));
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
    if (this.props.shoeL) { this.props.shoeL.visible = true; this.props.shoeR.visible = true; }
    // sous un couvre-chef, les cheveux longs restent mais les coiffures hautes sont masquées
    if (this.u && (g === 'beanie' || o.helmet)) for (const name of ['Hair_Buns']) if (this.u.meshes[name]) this.u.meshes[name].visible = false;
    show('kneeL', !!o.knees, o.knees); show('kneeR', !!o.knees, o.knees);
    show('elbowL', !!o.elbows, o.elbows); show('elbowR', !!o.elbows, o.elbows);
    show('wristL', !!o.wrists, o.wrists); show('wristR', !!o.wrists, o.wrists);
    show('pack', !!(this.look && this.look.backpack), null);
    const top = o.top;
    const pr = this.props.print;
    if (top && top.gabarit !== 'jacket') {
      pr.visible = true;
      const m = this.printMat;
      m.map = canvasTexture(printCanvas(top, null)); m.needsUpdate = true;
      if (top.graphic) loadImage(top.graphic).then((img) => { if (img && this.look.outfit.top === top) { m.map = canvasTexture(printCanvas(top, img)); m.needsUpdate = true; } });
    } else pr.visible = false;
  }

  // ----------------------------------------------------------------------------------------------
  playClip(name, { loop = true, fade = 0.25 } = {}) {
    if (!this.mixer || !this.clips[name]) { this.mode = 'bail'; return; }
    const a = this.mixer.clipAction(this.clips[name]);
    if (this.current && this.current !== a) this.current.fadeOut(fade);
    a.reset(); a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce); a.clampWhenFinished = !loop;
    a.fadeIn(fade).play();
    this.current = a;
    this.mode = 'clip';
  }
  stopClip() { if (this.current) this.current.fadeOut(0.15); this.current = null; this.mode = 'skate'; this.bailT = 0; }

  // st : { crouch, push, pushPhase, flip, grab, manual, nose, grind, balance, air, speed, steer, fakie, special, bail }
  update(dt, st) {
    if (!this.ready) return;
    this.t += dt;
    if (this.mode === 'clip') { this.mixer.update(dt); return; }
    const P = this.pose;
    P.crouch = damp(P.crouch, st.crouch, 14, dt);
    P.push = damp(P.push, st.push ? 1 : 0, 8, dt);
    P.manual = damp(P.manual, st.manual ? (st.nose ? -1 : 1) : 0, 10, dt);
    P.grab = damp(P.grab, st.grab ? 1 : 0, 16, dt);
    P.tuck = damp(P.tuck, st.air ? 1 : 0, 6, dt);
    P.lean = damp(P.lean, st.steer || 0, 6, dt);
    P.bal = damp(P.bal, st.balance || 0, 12, dt);
    this.bailT = st.bail ? (this.bailT || 0) + dt : 0;
    this.board.update(dt, st.air ? 0 : st.speed || 0);
    this.solve(st);
  }

  solve(st) {
    const R = this.rig, P = this.pose;
    const deckY = this.board.deckTop;
    const bh = this.boardHolder;
    bh.position.set(0, 0, 0); bh.rotation.set(0, 0, 0);
    let feetLift = 0, boardUp = 0;
    if (st.bail) {
      // chute : la planche file, le corps bascule et s'effondre
      const k = Math.min(1, this.bailT / 0.6);
      bh.position.set(0.8 * k, 0.15 * Math.sin(k * Math.PI), 0.4 * k); bh.rotation.set(k * 2.5, 0, k * 1.2);
    } else if (st.flip) {
      const f = st.flip, k = Math.min(1, f.t / f.dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      bh.position.y = 0.22 + Math.sin(k * Math.PI) * 0.3;
      bh.rotation.order = 'YXZ';
      bh.rotation.x = (f.roll || 0) * e * Math.PI * 2;
      bh.rotation.y = (f.yaw || 0) * e * Math.PI * 2;
      bh.rotation.z = (f.pitch || 0) * e * Math.PI * 2;
      feetLift = 0.28 + Math.sin(k * Math.PI) * 0.18;
      const c = deckY * 0.5;
      _v.set(0, c, 0).applyEuler(bh.rotation);
      bh.position.y += c - _v.y; bh.position.x -= _v.x; bh.position.z -= _v.z;
    } else if (st.air) {
      boardUp = 0.22 * P.tuck + 0.12 * P.grab;
      bh.position.y = boardUp;
      if (st.grab && st.grab.pose === 'beni') bh.rotation.x = 0.5 * P.grab;
    }
    if (st.manual) { const a = 0.22 * P.manual; bh.rotation.z = a; bh.position.y = Math.abs(Math.sin(a)) * 0.38; }
    if (st.darkslide) { bh.rotation.x = Math.PI; bh.position.y = deckY + 0.02; }

    for (let i = 0; i < R.bones.length; i++) R.inherit(i);
    const iBody = R.i(B.body);
    const legLen = R.len.thighL + R.len.shinL;
    // hauteur du bassin au-dessus des pieds (genoux fléchis), plus bas en l'air / en grab
    const bend = 0.13 + 0.12 * P.crouch + 0.06 * P.tuck + 0.14 * P.grab + 0.04 * P.push;
    let hip = R.hipY - R.ankleY + deckY + R.ankleY - bend * legLen + boardUp * 0.25;
    let bodyX = -0.03 * P.manual - 0.03, bodyZ = -0.02 + 0.04 * P.push;
    if (st.bail) { const k = Math.min(1, this.bailT / 0.5); hip = lerp(hip, R.hipY * 0.32, k); bodyZ -= 0.25 * k; }
    R.p[iBody].set(bodyX, hip + (st.flip ? feetLift * 0.25 : 0), bodyZ);
    const twist = 0.35 + 0.15 * P.push;
    _q.setFromAxisAngle(Y, twist * 0.4); R.rotate(iBody, _q);
    _q.setFromAxisAngle(_v.set(1, 0, 0), 0.12 + 0.18 * P.crouch + 0.22 * P.grab); R.rotate(iBody, _q);
    if (st.balance) { _q.setFromAxisAngle(_v.set(1, 0, 0), st.balance * 0.35); R.rotate(iBody, _q); }
    if (P.manual) { _q.setFromAxisAngle(_v.set(0, 0, 1), -P.manual * 0.25); R.rotate(iBody, _q); }
    if (st.bail) { const k = Math.min(1, this.bailT / 0.6); _q.setFromAxisAngle(_v.set(1, 0, 0), -1.2 * k); R.rotate(iBody, _q); }
    const chain = [...B.spine, B.neck, B.head];
    for (const n of chain) R.inherit(R.i(n));
    _q.setFromAxisAngle(Y, twist * 0.5 + P.lean * 0.15); R.rotate(R.i(B.spine[2]), _q);
    R.inherit(R.i(B.neck)); R.inherit(R.i(B.head));
    _q.setFromAxisAngle(Y, (st.fakie ? -0.6 : 0.85) - twist * 0.6); R.rotate(R.i(B.head), _q);
    for (let i = 0; i < R.bones.length; i++) {
      const nm = R.bones[i].name;
      if (nm === B.root || nm === B.body || chain.includes(nm)) continue;
      R.inherit(i);
    }

    // jambes : pieds verrouillés sur la planche (cheville au-dessus du plateau)
    const spread = 0.24 + 0.02 * P.crouch;
    const footY = deckY + boardUp + feetLift + R.ankleY;
    const front = new THREE.Vector3(spread, footY, 0.0);
    const back = new THREE.Vector3(-spread - 0.03, footY + 0.005, 0.0);
    if (P.push > 0.05 && !st.air) {
      const ph = (st.pushPhase || 0) * 5.2, s = Math.sin(ph);
      back.lerp(new THREE.Vector3(-0.05 + s * 0.38, R.ankleY + Math.max(0, -Math.cos(ph)) * 0.08 + 0.01, 0.2), P.push);
    }
    if (st.manual) { const a = 0.22 * P.manual; front.y += Math.max(0, Math.sin(a)) * 0.4 * (P.manual > 0 ? 1 : 0.4); back.y += Math.max(0, -Math.sin(a)) * 0.4; }
    if (st.bail) { const k = Math.min(1, this.bailT / 0.5); front.lerp(new THREE.Vector3(0.35, R.ankleY, 0.55), k); back.lerp(new THREE.Vector3(-0.2, R.ankleY, 0.6), k); }
    this.leg('L', front, new THREE.Vector3(0.3, 0, 1));
    this.leg('R', back, new THREE.Vector3(-0.1, 0, 1));

    // bras
    const sy = R.shoulderY - (R.hipY - hip);
    const open = Math.min(1, (st.speed || 0) / 9) * 0.06;
    const hl = new THREE.Vector3(0.3 + open, sy - 0.42 + Math.sin(this.t * 1.7) * 0.015 + P.lean * 0.06, 0.2 - P.lean * 0.08);
    const hr = new THREE.Vector3(-0.3 - open, sy - 0.46 - P.lean * 0.06, -0.08 + P.lean * 0.08);
    if (P.push > 0.05) { hl.lerp(new THREE.Vector3(0.38, sy - 0.55, 0.3), P.push); hr.lerp(new THREE.Vector3(-0.3, sy - 0.6, 0.1 + Math.sin((st.pushPhase || 0) * 5.2) * 0.25), P.push); }
    if (st.air) { hl.lerp(new THREE.Vector3(0.36, sy - 0.12, 0.22), P.tuck); hr.lerp(new THREE.Vector3(-0.38, sy - 0.14, -0.12), P.tuck); }
    if (st.grind || st.manual) { hl.set(0.52, sy - 0.25 + P.bal * 0.25, 0.1); hr.set(-0.52, sy - 0.25 - P.bal * 0.25, 0.05); }
    if (st.grab) {
      const g = st.grab.pose, by = boardUp + deckY;
      const tgt = {
        indy: [['R', 0.0, by, 0.12]], melon: [['L', -0.02, by, -0.12]], method: [['L', -0.06, by, -0.12]],
        nose: [['L', 0.36, by + 0.02, 0.0]], tail: [['R', -0.38, by + 0.02, 0.0]], stale: [['R', 0.0, by, -0.13]],
        beni: [['R', -0.3, by, 0.1]], christ: [],
      }[g] || [['R', 0.0, by, 0.12]];
      for (const [side, x, yy, z] of tgt) { const h = new THREE.Vector3(x, yy, z); if (side === 'L') hl.lerp(h, P.grab); else hr.lerp(h, P.grab); }
      if (g === 'christ') { hl.set(0.1, sy + 0.1, 0.62); hr.set(0.1, sy + 0.1, -0.62); }
    }
    if (st.special && st.special.pose === 'christ') { hl.set(0.1, sy + 0.1, 0.62); hr.set(0.1, sy + 0.1, -0.62); }
    if (st.bail) { const k = Math.min(1, this.bailT / 0.4); hl.lerp(new THREE.Vector3(0.35, 0.15, 0.3), k); hr.lerp(new THREE.Vector3(-0.35, 0.15, 0.3), k); }
    this.arm('L', hl, new THREE.Vector3(0.3, -0.6, -1));
    this.arm('R', hr, new THREE.Vector3(-0.3, -0.6, -1));
    for (let i = 0; i < R.bones.length; i++) if (/^(index|middle|ring|pinky|thumb)/.test(R.bones[i].name)) R.inherit(i);
    R.apply();
  }

  leg(side, target, pole) {
    const R = this.rig;
    const iU = R.i(B.thigh[side]), iL = R.i(B.calf[side]), iF = R.i(B.foot[side]), iB = R.i(B.ball[side]);
    R.inherit(iU);
    const A = R.p[iU].clone();
    const l1 = R.len['thigh' + side], l2 = R.len['shin' + side];
    const K = new THREE.Vector3();
    solve2(A, target, l1, l2, pole, K);
    R.aim(iU, _v2.subVectors(K, A).clone());
    R.inherit(iL); R.p[iL].copy(K);
    const T = A.clone().add(_v.subVectors(target, A).setLength(Math.min(A.distanceTo(target), l1 + l2 - 1e-3)));
    R.aim(iL, T.clone().sub(K));
    // pied à plat, pointe vers le côté orteils, un peu ouverte
    const toe = side === 'L' ? 0.28 : -0.18;
    const fb = R.bp[iB].clone().sub(R.bp[iF]); fb.y = 0; fb.normalize();
    R.q[iF].setFromUnitVectors(fb, new THREE.Vector3(Math.sin(toe), 0, Math.cos(toe)));
    R.p[iF].copy(T);
    R.inherit(iB);
  }

  arm(side, target, pole) {
    const R = this.rig;
    const iU = R.i(B.uarm[side]), iL = R.i(B.farm[side]), iW = R.i(B.hand[side]);
    R.inherit(R.i(B.clav[side]));
    R.inherit(iU);
    const A = R.p[iU].clone();
    const l1 = R.len['uarm' + side], l2 = R.len['farm' + side];
    const K = new THREE.Vector3();
    solve2(A, target, l1, l2, pole, K);
    R.aim(iU, K.clone().sub(A));
    R.inherit(iL); R.p[iL].copy(K);
    R.aim(iL, target.clone().sub(K));
    R.inherit(iW);
  }
}
