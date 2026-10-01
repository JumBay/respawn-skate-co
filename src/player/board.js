// Planche construite en code : plateau galbé (kicks + concave), grip, graphisme dessous,
// trucks, roues et roulements aux couleurs des produits du catalogue.
import * as THREE from 'three';
import { gripTexture, deckGraphicCanvas, canvasTexture, loadImage } from '../world/textures.js';
import { PALETTE } from '../config.js';

const L = 0.81; // longueur (≈ 32")

function halfWidth(x, w) {
  const r = w / 2, a = Math.abs(x), flat = L / 2 - r;
  if (a <= flat) return r;
  const d = Math.min(r, a - flat);
  return Math.sqrt(Math.max(0, r * r - d * d));
}
function deckY(x, s) {
  const a = Math.abs(x), k0 = 0.255;
  let y = 0;
  if (a > k0) { const t = a - k0; y += t * t * 0.95 + t * 0.12; }
  y += 0.0045 * s * s; // concave
  return y;
}

function deckSurface(w, top, thick = 0.012) {
  const NX = 44, NZ = 8;
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= NX; i++) {
    const x = -L / 2 + (i / NX) * L;
    const hw = Math.max(0.0005, halfWidth(x, w));
    for (let j = 0; j <= NZ; j++) {
      const s = (j / NZ) * 2 - 1;
      const z = s * hw;
      const y = deckY(x, s) + (top ? thick : 0);
      pos.push(x, y, z);
      uv.push(i / NX, j / NZ);
    }
  }
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
    const a = i * (NZ + 1) + j, b = a + NZ + 1;
    if (top) idx.push(a, a + 1, b, b, a + 1, b + 1); else idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function deckEdge(w, thick = 0.012) {
  const NX = 44, pos = [], idx = [];
  const ring = [];
  for (let i = 0; i <= NX; i++) { const x = -L / 2 + (i / NX) * L; ring.push([x, halfWidth(x, w), 1]); }
  for (let i = NX; i >= 0; i--) { const x = -L / 2 + (i / NX) * L; ring.push([x, -halfWidth(x, w), -1]); }
  for (const [x, z, s] of ring) { const y = deckY(x, s); pos.push(x, y, z, x, y + thick, z); }
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const a = i * 2, b = ((i + 1) % n) * 2;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

function wheelGeometry(radius, width) {
  const pts = [];
  const r = radius, hw = width / 2, b = Math.min(0.008, r * 0.3);
  pts.push(new THREE.Vector2(0.006, -hw));
  pts.push(new THREE.Vector2(r - b, -hw));
  for (let i = 1; i <= 4; i++) { const a = (i / 4) * Math.PI / 2; pts.push(new THREE.Vector2(r - b + Math.sin(a) * b, -hw + b - Math.cos(a) * b)); }
  for (let i = 0; i <= 4; i++) { const a = (i / 4) * Math.PI / 2; pts.push(new THREE.Vector2(r - b + Math.cos(a) * b, hw - b + Math.sin(a) * b)); }
  pts.push(new THREE.Vector2(0.006, hw));
  const g = new THREE.LatheGeometry(pts, 20);
  g.rotateX(Math.PI / 2); // axe de la roue le long de z
  return g;
}

export class Board {
  constructor({ quality }) {
    this.group = new THREE.Group();
    this.group.name = 'board';
    this.quality = quality;
    this.wheels = [];
    this.spin = 0;
    this.deckTop = 0.1;
    this.build({});
  }

  // setup : { deck, wheels, trucks, bearings, griptape } -> produits (ou null)
  async build(setup) {
    const g = this.group;
    while (g.children.length) { const c = g.children.pop(); c.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
    this.wheels = [];
    const deck = setup.deck, wheels = setup.wheels, trucks = setup.trucks, bearings = setup.bearings, grip = setup.griptape;
    const widthIn = (deck && deck.specs && deck.specs.width_in) || this.widthIn || 8.25;
    const w = widthIn * 0.0254;
    const diam = ((wheels && wheels.specs && wheels.specs.diameter_mm) || 54) / 1000;
    const r = diam / 2;
    const truckH = 0.05;
    const deckBottom = r + truckH;
    this.deckTop = deckBottom + 0.012;
    const hi = this.quality.tier === 'high';

    const deckGroup = new THREE.Group();
    deckGroup.position.y = deckBottom;
    g.add(deckGroup);
    this.deck = deckGroup;

    const gripColor = (grip && grip.colors && grip.colors.primary) || '#111114';
    const topMat = new THREE.MeshStandardMaterial({ map: gripTexture(gripColor), roughness: 1 });
    const gc = deckGraphicCanvas(deck, null);
    const graphic = canvasTexture(gc);
    const botMat = new THREE.MeshPhysicalMaterial({ map: graphic, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.35 });
    const ply = (deck && deck.colors && deck.colors.accent) || PALETTE.acid;
    const edgeMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#d9b98a').lerp(new THREE.Color(ply), 0.35), roughness: 0.7 });
    const top = new THREE.Mesh(deckSurface(w, true), topMat);
    const bot = new THREE.Mesh(deckSurface(w, false), botMat);
    const edge = new THREE.Mesh(deckEdge(w), edgeMat);
    for (const m of [top, bot, edge]) { m.castShadow = hi; deckGroup.add(m); }
    this.deckMeshes = [top, bot, edge];
    // graphisme réel du produit, s'il se charge
    if (deck && deck.graphic) {
      loadImage(deck.graphic).then((img) => {
        if (!img) return;
        const c2 = deckGraphicCanvas(deck, img);
        const m = this.botMat || botMat; m.map = canvasTexture(c2); m.needsUpdate = true;
      });
    }

    // trucks
    const tColor = (trucks && trucks.colors && trucks.colors.primary) || '#c9ccd3';
    const tMat = new THREE.MeshStandardMaterial({ color: tColor, roughness: 0.32, metalness: 1 });
    const bushing = new THREE.MeshStandardMaterial({ color: (trucks && trucks.colors && trucks.colors.accent) || PALETTE.cone, roughness: 0.6 });
    const wColor = (wheels && wheels.colors && wheels.colors.primary) || PALETTE.chalk;
    const wMat = new THREE.MeshPhysicalMaterial({ color: wColor, roughness: 0.48, clearcoat: 0.3 });
    const bColor = (bearings && bearings.colors && bearings.colors.primary) || '#2b2d33';
    const bMat = new THREE.MeshStandardMaterial({ color: bColor, roughness: 0.3, metalness: 0.8 });
    const wGeo = wheelGeometry(r, 0.034);
    const axleW = w * 0.5 + 0.02;
    for (const sx of [-1, 1]) {
      const tx = sx * 0.2;
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.008, 0.06), tMat);
      base.position.set(tx, deckBottom - 0.004, 0); g.add(base);
      const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, axleW * 2, 8), tMat);
      hanger.rotation.x = Math.PI / 2; hanger.position.set(tx - sx * 0.008, r, 0); g.add(hanger);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.03, truckH - 0.006, 4, 1), tMat);
      body.position.set(tx - sx * 0.01, r + (truckH - 0.006) / 2, 0); body.rotation.y = Math.PI / 4; g.add(body);
      const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.016, 10), bushing);
      bush.position.set(tx, deckBottom - 0.016, 0); g.add(bush);
      for (const sz of [-1, 1]) {
        const wh = new THREE.Mesh(wGeo, wMat);
        wh.position.set(tx - sx * 0.008, r, sz * axleW);
        wh.castShadow = hi;
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.036, 10), bMat);
        hub.rotation.x = Math.PI / 2; wh.add(hub);
        g.add(wh); this.wheels.push(wh);
      }
    }
    this.radius = r;
    this.widthIn = widthIn;
    this.botMat = bot.material;
  }

  update(dt, speed) {
    this.spin += (speed / Math.max(0.02, this.radius)) * dt;
    for (const w of this.wheels) w.rotation.z = -this.spin;
  }
}
