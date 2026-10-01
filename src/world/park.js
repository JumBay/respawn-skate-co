// Le skatepark : un lieu dense pensé pour enchaîner les lignes (funbox, ledges peints, rails,
// escaliers et handrail, half-pipe, bowl, quarters, shop). Une seule source : chaque module
// ajouté au Terrain (physique) est aussi dessiné ici, avec son ombre de contact peinte.
import * as THREE from 'three';
import { Terrain, box, wedge, quarter, stairs, bowl } from './terrain.js';
import {
  concreteTexture, rampTexture, asphaltTexture, graffitiTexture, neonTexture,
  fenceTexture, glowTexture, rng, canvasTexture,
} from './textures.js';
import { PALETTE } from '../config.js';

// --- UV en coordonnées du monde : même densité de texture sur toutes les faces --------------
function worldUV(geo, scale = 0.25) {
  geo = geo.index ? geo.toNonIndexed() : geo;
  geo.computeVertexNormals();
  const p = geo.attributes.position, n = geo.attributes.normal;
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    let u, v;
    if (ay >= ax && ay >= az) { u = p.getX(i); v = p.getZ(i); }
    else if (ax >= az) { u = p.getZ(i); v = p.getY(i); }
    else { u = p.getX(i); v = p.getY(i); }
    uv[i * 2] = u * scale; uv[i * 2 + 1] = v * scale;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

function tri(pos, a, b, c) { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); }
function quad(pos, a, b, c, d) { tri(pos, a, b, c); tri(pos, a, c, d); }
function geoFrom(pos) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return g;
}
function qpPoint(q, u, l, h) {
  const a = q.start + q.sgn * u;
  return q.ax === 'x' ? [a, h, l] : [l, h, a];
}

// carrelage de piscine (bande sous le coping du bowl)
function tileTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#d9dde0'; ctx.fillRect(0, 0, 256, 64);
  for (let y = 0; y < 2; y++) for (let x = 0; x < 8; x++) {
    const v = 0.85 + Math.random() * 0.15;
    ctx.fillStyle = `rgb(${Math.round(18 * v)},${Math.round(70 * v)},${Math.round(150 * v)})`;
    ctx.fillRect(x * 32 + 1.5, y * 32 + 1.5, 29, 29);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1.56, 6.25);
  return t;
}

// ombre de contact (fausse occlusion ambiante) : bord sombre et doux autour d'une emprise
let aoTex = null;
function aoTexture() {
  if (aoTex) return aoTex;
  const S = 128, c = document.createElement('canvas'); c.width = c.height = S;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = Math.max(0, Math.abs(x - S / 2 + 0.5) - S * 0.3) / (S * 0.2);
    const dy = Math.max(0, Math.abs(y - S / 2 + 0.5) - S * 0.3) / (S * 0.2);
    const d = Math.min(1, Math.hypot(dx, dy));
    const a = Math.pow(1 - d, 1.6) * 0.55;
    const i = (y * S + x) * 4;
    img.data[i] = 30; img.data[i + 1] = 18; img.data[i + 2] = 48; img.data[i + 3] = a * 255;
  }
  ctx.putImageData(img, 0, 0);
  aoTex = new THREE.CanvasTexture(c);
  return aoTex;
}

export function createPark({ quality, bank }) {
  const group = new THREE.Group();
  group.name = 'park';
  const terrain = new Terrain();
  terrain.bounds = { x0: -36, x1: 36, z0: -32, z1: 32 };
  const rails = [];
  const obstacles = [];
  const animated = [];
  const R = rng(42);
  const hi = quality.tier === 'high';

  // --- Matières PBR (textures CC0 Poly Haven) ---------------------------------------------------
  const texAsphalt = asphaltTexture(256); texAsphalt.wrapS = texAsphalt.wrapT = THREE.RepeatWrapping;
  const S = (o) => new THREE.MeshStandardMaterial(o);
  const P = (name, o) => bank.pbr(name, o);
  const M = {
    ground: P('ground', { color: '#d8d6da', scale: 0.25 }),
    concrete: P('smooth', { color: '#c9c6c4', scale: 0.33 }),
    concreteDark: P('wall', { color: '#8d8a90', scale: 0.33 }),
    ramp: P('smooth', { color: '#d4d2d0', scale: 0.3, roughness: 0.85 }),
    rampAlt: P('smooth', { color: '#b7c9cf', scale: 0.3, roughness: 0.85 }),
    rampSide: P('wall', { color: '#a7a3a6', scale: 0.33 }),
    bowl: P('smooth', { color: '#dcd9d6', scale: 0.3, roughness: 0.8 }),
    tile: S({ map: tileTexture(), color: '#ffffff', roughness: 0.22, metalness: 0 }),
    metal: P('steel', { color: '#d9dde2', scale: 1.2, metal: true, roughness: 0.7, minRough: 0.3, envMapIntensity: 1.2 }),
    rail: P('paint', { color: '#ffd23e', scale: 1.5, roughness: 0.9 }),
    red: P('wall', { color: '#d3333a', scale: 0.33 }),
    yellow: P('wall', { color: '#f2c12e', scale: 0.33 }),
    acid: S({ color: PALETTE.acid, emissive: PALETTE.acid, emissiveIntensity: 0.4 }),
    cone: S({ color: PALETTE.cone, roughness: 0.5 }),
    asphalt: P('asphalt', { color: '#9a96a0', scale: 0.12, res: '512' }),
    pole: P('steel', { color: '#3a3d44', scale: 1, metal: true, roughness: 0.8, minRough: 0.4 }),
    wall: P('wall', { color: '#cfcbc8', scale: 0.3 }),
    container: P('container', { color: '#e8763a', scale: 0.25, metal: true, roughness: 0.9, minRough: 0.45 }),
    pink: P('smooth', { color: '#ff5fa0', scale: 0.33, roughness: 0.75 }),
    white: S({ color: '#f3f0e8', roughness: 0.6 }),
  };
  void texAsphalt;
  const aoMat = new THREE.MeshBasicMaterial({ map: aoTexture(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });

  function mesh(geo, mat, { cast = true, receive = true } = {}) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = cast && hi; m.receiveShadow = receive && quality.shadows;
    group.add(m);
    return m;
  }
  function ao(x0, x1, z0, z1, pad = 0.9, y = 0.012) {
    const w = x1 - x0 + pad * 2, d = z1 - z0 + pad * 2;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), aoMat);
    m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
    m.renderOrder = 1;
    group.add(m);
  }

  // --- Constructeurs ---------------------------------------------------------------------------
  function addBox(x0, x1, z0, z1, h, { mat = M.concrete, side = null, kind = 'concrete', grind = null, edge = M.metal, aoPad = 0.7 } = {}) {
    const p = terrain.add(box(x0, x1, z0, z1, h, kind));
    const g = new THREE.BoxGeometry(x1 - x0, h, z1 - z0);
    g.translate((x0 + x1) / 2, h / 2, (z0 + z1) / 2);
    const geo = worldUV(g, 1);
    if (side) {
      geo.clearGroups();
      const n = geo.attributes.normal;
      for (let i = 0; i < n.count; i += 3) geo.addGroup(i, 3, n.getY(i) > 0.9 ? 0 : 1);
      mesh(geo, [mat, side]);
    } else mesh(geo, mat);
    if (grind) {
      const edges = [];
      if (grind === 'x' || grind === 'all') edges.push([[x0, h, z0], [x1, h, z0]], [[x0, h, z1], [x1, h, z1]]);
      if (grind === 'z' || grind === 'all') edges.push([[x0, h, z0], [x0, h, z1]], [[x1, h, z0], [x1, h, z1]]);
      for (const [a, b] of edges) addRail(a, b, { kind: 'ledge', visual: 'angle', mat: edge });
    }
    if (h > 0.01) ao(x0, x1, z0, z1, aoPad);
    return p;
  }

  function addWedge(x0, x1, z0, z1, h0, h1, dir, { mat = M.ramp, side = M.rampSide, kind = 'ramp' } = {}) {
    const p = terrain.add(wedge(x0, x1, z0, z1, h0, h1, dir, kind));
    const H = (x, z) => { const o = {}; p.sample(x, z, o); return o.h; };
    const c = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]].map(([x, z]) => [x, H(x, z), z]);
    const b = c.map(([x, , z]) => [x, 0, z]);
    const top = [], sides = [];
    quad(top, c[0], c[3], c[2], c[1]);
    quad(sides, b[0], b[1], c[1], c[0]); quad(sides, b[1], b[2], c[2], c[1]);
    quad(sides, b[2], b[3], c[3], c[2]); quad(sides, b[3], b[0], c[0], c[3]);
    mesh(worldUV(geoFrom(top), 1), mat);
    mesh(worldUV(geoFrom(sides), 1), side);
    ao(x0, x1, z0, z1, 0.6);
    const ax = dir[1], sgn = dir[0] === '+' ? 1 : -1;
    const hiEdge = ax === 'x' ? (sgn > 0 ? x1 : x0) : (sgn > 0 ? z1 : z0);
    if (h1 > 0.3) {
      if (ax === 'x') addRail([hiEdge, h1, z0], [hiEdge, h1, z1], { kind: 'coping', visual: 'pipe', radius: 0.035 });
      else addRail([x0, h1, hiEdge], [x1, h1, hiEdge], { kind: 'coping', visual: 'pipe', radius: 0.035 });
    }
    return p;
  }

  function addQuarter(opts, { graffiti = null, mat = M.ramp } = {}) {
    const q = terrain.add(quarter(opts));
    const N = 26, surf = [], deck = [], back = [], sides = [];
    const prof = [];
    for (let i = 0; i <= N; i++) { const u = (i / N) * q.uTop; prof.push([u, q.profile(u)[0]]); }
    const flip = q.sgn * (q.ax === 'x' ? 1 : -1) > 0;
    const Q = (u, l, h) => qpPoint(q, u, l, h);
    for (let i = 0; i < N; i++) {
      const [u0, h0] = prof[i], [u1, h1] = prof[i + 1];
      const a = Q(u0, q.l0, h0), b = Q(u0, q.l1, h0), c = Q(u1, q.l1, h1), d = Q(u1, q.l0, h1);
      if (flip) quad(surf, a, b, c, d); else quad(surf, a, d, c, b);
      for (const [l, f] of [[q.l0, flip], [q.l1, !flip]]) {
        const p0 = Q(u0, l, h0), p1 = Q(u1, l, h1), g0 = Q(u0, l, 0), g1 = Q(u1, l, 0);
        if (f) quad(sides, g0, g1, p1, p0); else quad(sides, g0, p0, p1, g1);
      }
    }
    const uT = q.uTop, uE = q.uTop + q.deck;
    {
      const a = Q(uT, q.l0, q.H), b = Q(uT, q.l1, q.H), c = Q(uE, q.l1, q.H), d = Q(uE, q.l0, q.H);
      if (flip) quad(deck, a, b, c, d); else quad(deck, a, d, c, b);
      const e = Q(uE, q.l0, 0), f = Q(uE, q.l1, 0);
      if (flip) quad(back, d, c, f, e); else quad(back, d, e, f, c);
      for (const [l, fl] of [[q.l0, flip], [q.l1, !flip]]) {
        const p0 = Q(uT, l, q.H), p1 = Q(uE, l, q.H), g0 = Q(uT, l, 0), g1 = Q(uE, l, 0);
        if (fl) quad(sides, g0, g1, p1, p0); else quad(sides, g0, p0, p1, g1);
      }
    }
    mesh(worldUV(geoFrom(surf), 1), mat);
    mesh(worldUV(geoFrom(deck), 1), M.concrete);
    mesh(worldUV(geoFrom(back), 1), M.rampSide);
    mesh(worldUV(geoFrom(sides), 1), M.rampSide);
    const a = Q(uT, q.l0, q.H), b = Q(uT, q.l1, q.H);
    addRail(a, b, { kind: 'coping', visual: 'pipe', radius: 0.055 });
    if (q.H > 2.5) {
      const len = Math.abs(q.l1 - q.l0);
      const p0 = Q(uE - 0.12, q.l0, q.H + 1.0), p1 = Q(uE - 0.12, q.l1, q.H + 1.0);
      addRail(p0, p1, { kind: 'rail', visual: 'round', radius: 0.035, posts: false, grind: false, mat: M.pole });
      const n = Math.max(2, Math.floor(len / 2.5));
      for (let k = 0; k <= n; k++) {
        const pp = Q(uE - 0.12, q.l0 + (k / n) * (q.l1 - q.l0), q.H + 0.5);
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), M.pole);
        post.position.set(pp[0], pp[1], pp[2]); group.add(post);
      }
    }
    const c0 = Q(0, q.l0, 0), c1 = Q(uE, q.l1, 0);
    ao(Math.min(c0[0], c1[0]), Math.max(c0[0], c1[0]), Math.min(c0[2], c1[2]), Math.max(c0[2], c1[2]), 0.8);
    if (graffiti) {
      for (const [l, nrm] of [[q.l0, -1], [q.l1, 1]]) {
        const mid = uE * 0.55;
        const p0 = Q(mid, l, 0);
        const w = Math.min(5.5, uE * 0.9), h = w * 0.375;
        addDecal(graffiti.word, graffiti.v + (nrm > 0 ? 1 : 0), [p0[0], Math.max(h / 2 + 0.15, q.H * 0.42), p0[2]],
          q.ax === 'x' ? [0, 0, nrm] : [nrm, 0, 0], w, h);
      }
    }
    return q;
  }

  function addStairs(x0, x1, z0, z1, hTop, n, dir) {
    const p = terrain.add(stairs(x0, x1, z0, z1, hTop, n, dir));
    const ax = dir[1], sgn = dir[0] === '+' ? 1 : -1;
    const a0 = ax === 'x' ? x0 : z0, a1 = ax === 'x' ? x1 : z1;
    const step = (a1 - a0) / n, rise = hTop / n;
    for (let k = 0; k < n; k++) {
      const h = hTop - rise * k;
      const s0 = sgn > 0 ? a0 + k * step : a1 - (k + 1) * step;
      const s1 = s0 + step;
      const g = ax === 'x' ? new THREE.BoxGeometry(step, h, z1 - z0) : new THREE.BoxGeometry(x1 - x0, h, step);
      if (ax === 'x') g.translate((s0 + s1) / 2, h / 2, (z0 + z1) / 2); else g.translate((x0 + x1) / 2, h / 2, (s0 + s1) / 2);
      mesh(worldUV(g, 1), M.concrete);
      const nose = new THREE.Mesh(ax === 'x' ? new THREE.BoxGeometry(0.06, 0.03, z1 - z0) : new THREE.BoxGeometry(x1 - x0, 0.03, 0.06), M.yellow);
      const edge = sgn > 0 ? s1 - 0.03 : s0 + 0.03;
      if (ax === 'x') nose.position.set(edge, h - 0.01, (z0 + z1) / 2); else nose.position.set((x0 + x1) / 2, h - 0.01, edge);
      group.add(nose);
    }
    ao(x0, x1, z0, z1, 0.6);
    return p;
  }

  function addRail(a, b, { kind = 'rail', name = null, visual = 'round', radius = 0.045, posts = true, grind = true, mat = null } = {}) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const dir = B.clone().sub(A); const len = dir.length(); dir.normalize();
    const rail = { a: A, b: B, dir, len, kind, name };
    if (grind) rails.push(rail);
    if (visual === 'round' || visual === 'pipe') {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, len, 10), mat || (visual === 'pipe' ? M.metal : M.rail));
      m.position.copy(A).add(B).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      m.castShadow = hi; group.add(m);
      if (visual === 'round' && posts) {
        const np = Math.max(2, Math.round(len / 3) + 1);
        for (let k = 0; k < np; k++) {
          const P = A.clone().lerp(B, 0.04 + (k / (np - 1)) * 0.92);
          const ground = terrain.height(P.x, P.z);
          const h = P.y - ground;
          if (h < 0.05) continue;
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, h, 8), mat || M.rail);
          post.position.set(P.x, ground + h / 2, P.z); post.castShadow = hi; group.add(post);
        }
        ao(Math.min(A.x, B.x), Math.max(A.x, B.x), Math.min(A.z, B.z), Math.max(A.z, B.z), 0.35);
      }
    } else if (visual === 'angle') {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, len), mat || M.metal);
      m.position.copy(A).add(B).multiplyScalar(0.5); m.position.y -= 0.03;
      m.lookAt(B.x, m.position.y + (B.y - A.y) / 2, B.z);
      group.add(m);
    }
    return rail;
  }

  function addDecal(word, variant, pos, normal, w, h) {
    const tex = graffitiTexture(word, variant, 7 + variant * 13 + word.length);
    const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(pos[0] + normal[0] * 0.03, pos[1], pos[2] + normal[2] * 0.03);
    m.lookAt(m.position.x + normal[0], m.position.y, m.position.z + normal[2]);
    group.add(m);
    return m;
  }

  function addNeon(text, color, pos, normal, w, { flicker = false } = {}) {
    const tex = neonTexture(text, color);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, color: new THREE.Color(1.7, 1.7, 1.7) });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), mat);
    m.position.set(...pos);
    m.lookAt(pos[0] + normal[0], pos[1] + normal[1], pos[2] + normal[2]);
    group.add(m);
    if (flicker) animated.push((t) => { mat.opacity = Math.sin(t * 31) > 0.94 || (t % 7 > 6.7 && Math.sin(t * 90) > 0) ? 0.3 : 1; });
    return m;
  }

  // mur d'enceinte en béton, avec une fresque tournée vers le park
  function addWall(x0, z0, x1, z1, h, word, v) {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const m = mesh(worldUV(new THREE.BoxGeometry(len, h, 0.4), 1), M.wall);
    m.position.set((x0 + x1) / 2, h / 2, (z0 + z1) / 2);
    m.rotation.y = Math.atan2(-(z1 - z0), x1 - x0);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(len, 0.08, 0.5), M.concreteDark);
    cap.position.set(m.position.x, h + 0.04, m.position.z); cap.rotation.y = m.rotation.y; group.add(cap);
    if (word) {
      const n = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), m.rotation.y);
      if (n.dot(new THREE.Vector3(-m.position.x, 0, -m.position.z)) < 0) n.negate();
      const w = Math.min(len * 0.8, 9);
      addDecal(word, v, [m.position.x + n.x * 0.21, h * 0.5, m.position.z + n.z * 0.21], [n.x, 0, n.z], w, Math.min(h * 0.95, w * 0.375));
    }
    return m;
  }

  function addFloorText(text, p, w, color) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.font = 'italic 900 170px Impact, "Arial Black", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 16; ctx.strokeStyle = '#1a1026'; ctx.strokeText(text, 512, 128);
    ctx.fillStyle = color; ctx.fillText(text, 512, 128);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: canvasTexture(c), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.rotation.x = -Math.PI / 2; m.position.set(...p); group.add(m);
    return m;
  }

  // --- Sol ---------------------------------------------------------------------------------------
  const B = terrain.bounds;
  const bw = bowl({ cx: 24, cz: -12, hx: 6, hz: 4.5, rc: 3.5, D: 2.6, R: 3.0 });
  terrain.addBowl(bw);
  function roundedRectPath(path, cx, cz, hx, hz, rc, seg = 10) {
    const pts = [];
    const corners = [[hx - rc, hz - rc, 0], [-(hx - rc), hz - rc, Math.PI / 2], [-(hx - rc), -(hz - rc), Math.PI], [hx - rc, -(hz - rc), Math.PI * 1.5]];
    for (const [ox, oz, a0] of corners) for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * Math.PI / 2;
      pts.push([cx + ox + Math.cos(a) * rc, cz + oz + Math.sin(a) * rc]);
    }
    pts.forEach(([x, z], i) => (i ? path.lineTo(x, -z) : path.moveTo(x, -z)));
    return pts;
  }
  {
    const shape = new THREE.Shape();
    shape.moveTo(B.x0, -B.z0); shape.lineTo(B.x0, -B.z1); shape.lineTo(B.x1, -B.z1); shape.lineTo(B.x1, -B.z0); shape.lineTo(B.x0, -B.z0);
    const hole = new THREE.Path();
    roundedRectPath(hole, bw.cx, bw.cz, bw.hx + bw.uTop, bw.hz + bw.uTop, bw.rc + bw.uTop, 12);
    shape.holes.push(hole);
    const g = new THREE.ShapeGeometry(shape, 12); g.rotateX(-Math.PI / 2);
    mesh(worldUV(g, 1), M.ground, { cast: false });
    const outer = new THREE.Shape();
    outer.moveTo(-300, 300); outer.lineTo(300, 300); outer.lineTo(300, -300); outer.lineTo(-300, -300); outer.lineTo(-300, 300);
    const h2 = new THREE.Path();
    h2.moveTo(B.x0, -B.z0); h2.lineTo(B.x1, -B.z0); h2.lineTo(B.x1, -B.z1); h2.lineTo(B.x0, -B.z1); h2.lineTo(B.x0, -B.z0);
    outer.holes.push(h2);
    const ga = new THREE.ShapeGeometry(outer); ga.rotateX(-Math.PI / 2); ga.translate(0, -0.02, 0);
    mesh(worldUV(ga, 1), M.asphalt, { cast: false });
  }
  // marquages au sol : variations de teinte, joints de dilatation, traces de roues et de wax,
  // bandes peintes. Un seul calque 2048 px posé sur toute la dalle (casse la répétition).
  {
    const SZ = quality.tier === 'high' ? 2048 : 1024;
    const c = document.createElement('canvas'); c.width = c.height = SZ;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, SZ, SZ);
    const k = SZ / (B.x1 - B.x0);
    const toPx = (x, z) => [(x - B.x0) * k, (z - B.z0) / (B.z1 - B.z0) * SZ];
    // grandes nappes plus sombres / plus claires (béton coulé en plusieurs fois)
    for (let i = 0; i < 60; i++) {
      const x = R() * SZ, y = R() * SZ, r = (40 + R() * 160) * k / 14;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const dark = R() < 0.65;
      g.addColorStop(0, dark ? 'rgba(40,34,38,0.26)' : 'rgba(255,250,245,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // joints de dilatation tous les 4 m (sciés, sombres, avec un léger liseré clair)
    for (let x = B.x0 + 4; x < B.x1; x += 4) { const [px] = toPx(x, 0); ctx.fillStyle = 'rgba(30,26,28,0.55)'; ctx.fillRect(px - 1, 0, 2.2, SZ); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(px + 1.2, 0, 1, SZ); }
    for (let z = B.z0 + 4; z < B.z1; z += 4) { const [, py] = toPx(0, z); ctx.fillStyle = 'rgba(30,26,28,0.55)'; ctx.fillRect(0, py - 1, SZ, 2.2); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(0, py + 1.2, SZ, 1); }
    // traces de roues (courbes sombres) et taches d'huile / de wax
    ctx.lineCap = 'round';
    for (let i = 0; i < 140; i++) {
      let x = R() * SZ, y = R() * SZ, a = R() * Math.PI * 2;
      ctx.strokeStyle = `rgba(25,20,24,${0.08 + R() * 0.16})`; ctx.lineWidth = 1.5 + R() * 3;
      ctx.beginPath(); ctx.moveTo(x, y);
      const n = 6 + R() * 10;
      for (let j = 0; j < n; j++) { a += (R() - 0.5) * 0.35; x += Math.cos(a) * 14; y += Math.sin(a) * 14; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    for (let i = 0; i < 90; i++) {
      const x = R() * SZ, y = R() * SZ, r = 3 + R() * 18;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(20,16,18,0.3)'); g.addColorStop(1, 'rgba(20,16,18,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r, r * (0.5 + R() * 0.5), R() * 3, 0, 7); ctx.fill();
    }
    // bandes peintes usées
    ctx.lineWidth = 0.18 * k; ctx.strokeStyle = 'rgba(232,186,40,0.75)'; ctx.setLineDash([1.6 * k, 1.1 * k]);
    let [ax, ay] = toPx(-18, 26), [bx, by] = toPx(-18, -24);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    [ax, ay] = toPx(12, 26); [bx, by] = toPx(12, -2);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(226,60,120,0.6)'; ctx.lineWidth = 0.22 * k;
    const [fx, fy] = toPx(0, 1.75);
    ctx.beginPath(); ctx.arc(fx, fy, 11 * k, 0, 7); ctx.stroke();
    // usure de la peinture : on gratte au hasard
    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 2500; i++) { ctx.fillStyle = `rgba(0,0,0,${R() * 0.5})`; ctx.fillRect(R() * SZ, R() * SZ, 2 + R() * 6, 1 + R() * 3); }
    ctx.globalCompositeOperation = 'source-over';
    const t = canvasTexture(c); t.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(B.x1 - B.x0, B.z1 - B.z0), new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, roughness: 1 }));
    m.rotation.x = -Math.PI / 2; m.position.set((B.x0 + B.x1) / 2, 0.006, (B.z0 + B.z1) / 2);
    m.receiveShadow = quality.shadows;
    group.add(m);
  }

  // --- Bowl à l'est ---------------------------------------------------------------------------
  {
    // anneaux répartis le long de l'arc (régulier jusque dans la partie verticale)
    const seg = 12, thTop = Math.asin(bw.uTop / bw.R);
    const hs = [];
    for (let i = 0; i <= 22; i++) hs.push((i / 22) * thTop);
    const thTile = Math.acos(1 - (bw.D - 0.2) / bw.R); // 20 cm de carrelage sous le coping
    hs.push(thTile); hs.sort((a, b) => a - b);
    const ringsArr = hs.map((th) => {
      const d = bw.R * Math.sin(th), h = -bw.D + bw.R * (1 - Math.cos(th));
      const pts = roundedRectPath(new THREE.Path(), bw.cx, bw.cz, bw.hx + d, bw.hz + d, bw.rc + d, seg);
      return { th, pts: pts.map(([x, z]) => [x, h, z]) };
    });
    const pos = [], tiles = [];
    for (let i = 0; i < ringsArr.length - 1; i++) {
      const A = ringsArr[i].pts, Bq = ringsArr[i + 1].pts;
      const isTile = ringsArr[i].th >= thTile - 1e-6;
      for (let k = 0; k < A.length; k++) {
        const k2 = (k + 1) % A.length;
        quad(isTile ? tiles : pos, A[k], A[k2], Bq[k2], Bq[k]);
      }
    }
    const N = ringsArr.length - 1;
    const ringsTop = ringsArr.map((r) => r.pts);
    mesh(worldUV(geoFrom(pos), 1), M.bowl, { cast: false });
    mesh(worldUV(geoFrom(tiles), 1), M.tile, { cast: false });
    const floor = new THREE.Shape();
    roundedRectPath(floor, bw.cx, bw.cz, bw.hx, bw.hz, bw.rc, seg);
    const fg = new THREE.ShapeGeometry(floor, 8); fg.rotateX(-Math.PI / 2); fg.translate(0, -bw.D, 0);
    mesh(worldUV(fg, 1), M.bowl, { cast: false });
    const top = ringsTop[N];
    const curve = new THREE.CatmullRomCurve3(top.map(([x, , z]) => new THREE.Vector3(x, 0.02, z)), true);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.055, 8, true), M.metal));
    const pts = curve.getSpacedPoints(48);
    for (let k = 0; k < pts.length - 1; k++) addRail([pts[k].x, 0.02, pts[k].z], [pts[k + 1].x, 0.02, pts[k + 1].z], { kind: 'coping', visual: null, name: 'bowl' });
    addFloorText('RESPAWN', [bw.cx, -bw.D + 0.01, bw.cz], 7, '#ff3d8b');
  }

  // --- Funbox au centre --------------------------------------------------------------------------
  addBox(-4, 4, -0.5, 4, 0.9, { side: M.concreteDark, grind: 'z', edge: M.rail });
  addWedge(-4, 4, -4.5, -0.5, 0, 0.9, '+z', { mat: M.ramp });
  addWedge(-4, 4, 4, 8, 0, 0.9, '-z', { mat: M.ramp });
  addRail([2.4, 0.9 + 0.42, -0.7], [2.4, 0.42, -4.3], { name: 'funbox-n' });
  addRail([-2.4, 0.9 + 0.42, 4.2], [-2.4, 0.42, 7.8], { name: 'funbox-s' });
  addDecal('NO COMPLY', 2, [-4.0, 0.45, 1.75], [-1, 0, 0], 4.2, 0.82);
  addDecal('KICK PUSH', 0, [4.0, 0.45, 1.75], [1, 0, 0], 4.2, 0.82);

  // manual pad rouge devant le spawn
  addBox(-2.5, 2.5, 14.5, 18, 0.25, { side: M.red, grind: 'all', edge: M.yellow });

  // --- Ouest proche : ledge rouge, rail plat ; est proche : ledge jaune, kicker rose ---------------
  addBox(-12, -11, 2, 16, 0.5, { side: M.red, mat: M.concrete, grind: 'z', edge: M.yellow });
  addRail([-16, 0.48, -1], [-16, 0.48, 15], { name: 'parking' });
  addBox(9, 10, 3, 14, 0.55, { side: M.yellow, mat: M.concrete, grind: 'z', edge: M.red });
  addWedge(4.5, 7.5, 11, 13, 0, 0.7, '-z', { mat: M.pink });

  // --- Half-pipe au nord ----------------------------------------------------------------------------
  const hpL0 = -14, hpL1 = 6;
  const qpA = addQuarter({ dir: '-z', start: -22, l0: hpL0, l1: hpL1, R: 3.6, H: 3.4, deck: 2.5 }, { graffiti: { word: 'DROP IN', v: 1 } });
  const qpB = addQuarter({ dir: '+z', start: -16, l0: hpL0, l1: hpL1, R: 3.6, H: 3.4, deck: 2.5 }, { graffiti: { word: 'SESSION', v: 3 } });
  addBox(hpL0, hpL1, -22, -16, 0.0001, { mat: M.ramp, kind: 'ramp', aoPad: 0 });
  const backB = qpB.start + qpB.uTop + qpB.deck;
  addNeon('RESPAWN', PALETTE.acid, [-4, 2.25, backB + 0.03], [0, 0, 1], 9, { flicker: true });

  // --- Rue à l'ouest : perron, 10 marches, handrail, banks -----------------------------------------
  addBox(-36, -24, -10, 2, 1.5, { side: M.concreteDark });
  addRail([-24, 1.5, 0], [-24, 1.5, 2], { kind: 'ledge', visual: 'angle', mat: M.yellow });
  addRail([-24, 1.5, -10], [-24, 1.5, -8], { kind: 'ledge', visual: 'angle', mat: M.yellow });
  addStairs(-24, -19.5, -8, 0, 1.5, 10, '+x');
  addRail([-24.3, 1.5 + 0.82, -0.7], [-19.4, 0.15 + 0.82, -0.7], { name: 'handrail', mat: M.red });
  addWedge(-36, -24, 2, 8, 0, 1.5, '-z', { mat: M.rampAlt });
  addWedge(-36, -24, -16, -10, 0, 1.5, '+z', { mat: M.rampAlt });

  // --- Shop (conteneur) au sud-est + kicker vers le toit -----------------------------------------------
  const shopX0 = 14, shopX1 = 26, shopZ0 = 22, shopZ1 = 25.5, shopH = 2.8;
  const roof = addBox(shopX0, shopX1, shopZ0, shopZ1, shopH, { mat: M.container, kind: 'deck' });
  for (let x = shopX0 + 0.25; x < shopX1; x += 0.5) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.08, shopH - 0.1, 0.05), M.container);
    r.position.set(x, shopH / 2, shopZ1 + 0.02); group.add(r);
  }
  addWedge(26.2, 31, 22, 25.5, 0, 1.6, '-x', { mat: M.pink });
  addNeon('SHOP', PALETTE.acid, [20, shopH - 0.55, shopZ0 - 0.04], [0, 0, -1], 5.2);
  {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.5), new THREE.MeshBasicMaterial({ color: '#ffe0b0', toneMapped: false }));
    win.position.set(20, 1.15, shopZ0 - 0.01); win.rotation.y = Math.PI; group.add(win);
  }
  const shopZone = { x: 20, z: 18.6, r: 3.4 };
  {
    const ring = new THREE.Mesh(new THREE.RingGeometry(shopZone.r - 0.25, shopZone.r, 48), new THREE.MeshBasicMaterial({ color: PALETTE.cone, transparent: true, opacity: 0.8, toneMapped: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(shopZone.x, 0.02, shopZone.z); group.add(ring);
    animated.push((t) => { ring.material.opacity = 0.5 + 0.35 * Math.sin(t * 3); });
    addFloorText('SHOP', [shopZone.x, 0.02, shopZone.z], 3.6, PALETTE.cone);
  }

  // --- Quarters et murs du pourtour -------------------------------------------------------------------
  addQuarter({ dir: '+x', start: 31.5, l0: -2, l1: 20, R: 3.0, H: 2.4, deck: 1.6 }, { mat: M.rampAlt });
  addQuarter({ dir: '+z', start: 28.6, l0: -20, l1: 10, R: 2.8, H: 2.0, deck: 1.6 }, { mat: M.rampAlt });
  addQuarter({ dir: '-x', start: -31.5, l0: 8, l1: 26, R: 2.8, H: 2.0, deck: 1.6 }, { mat: M.rampAlt });
  const wallH = 3.2;
  addWall(B.x0, B.z0, B.x1, B.z0, wallH, 'GRIND TIME', 1);
  addWall(B.x1, B.z0, B.x1, -2, wallH, 'WAX ON', 3);
  addWall(B.x1, -2, B.x1, B.z1, wallH, null, 0);
  addWall(B.x1, B.z1, B.x0, B.z1, wallH, 'RESPAWN', 0);
  addWall(B.x0, B.z1, B.x0, 2, wallH, null, 0);
  addWall(B.x0, 2, B.x0, B.z0, wallH, 'NO COMPLY', 2);
  {
    const ft = fenceTexture();
    const fh = 2.2;
    const sides = [[[B.x0, B.z0], [B.x1, B.z0]], [[B.x1, B.z0], [B.x1, B.z1]], [[B.x1, B.z1], [B.x0, B.z1]], [[B.x0, B.z1], [B.x0, B.z0]]];
    for (const [[ax, az], [bx, bz]] of sides) {
      const len = Math.hypot(bx - ax, bz - az);
      const tex = ft.clone(); tex.needsUpdate = true; tex.repeat.set(len / 0.9, fh / 0.9);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(len, fh), new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, color: '#4a3a66' }));
      m.position.set((ax + bx) / 2, wallH + fh / 2, (az + bz) / 2);
      m.rotation.y = Math.atan2(-(bz - az), bx - ax);
      group.add(m);
    }
  }

  // --- Point de spawn -------------------------------------------------------------------------------
  const spawn = { x: 0, z: 25, yaw: Math.PI };
  {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const ctx = c.getContext('2d');
    ctx.strokeStyle = PALETTE.acid; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(256, 256, 230, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([22, 18]); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(256, 256, 196, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = 'italic 900 78px Impact, "Arial Black", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 10; ctx.strokeStyle = '#1a1026'; ctx.strokeText('SPAWN', 256, 230);
    ctx.fillStyle = PALETTE.acid; ctx.fillText('SPAWN', 256, 230);
    ctx.font = '900 46px Impact, "Arial Black", sans-serif'; ctx.strokeText('POINT', 256, 300); ctx.fillText('POINT', 256, 300);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ map: canvasTexture(c), transparent: true, depthWrite: false, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(spawn.x, 0.015, spawn.z); group.add(m);
  }

  // --- Lampadaires (têtes lumineuses, halo doux au sol) -------------------------------------------------
  const glowMat = new THREE.MeshBasicMaterial({ map: glowTexture('#ffcf8a'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.22 });
  const lampHeadMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe2b0').multiplyScalar(1.8), toneMapped: false });
  const lampSpots = [[-14.5, 9], [7, -6], [14, 10], [-14, -6], [-20, 20], [-30, 12], [10, -26], [-20, -28], [30, 8], [32, -24], [6, 30], [-26, 30], [30, 28], [-33, -24]];
  const codeLamps = [];
  for (const [x, z] of lampSpots) {
    const hgt = 6.2;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, hgt, 8), M.pole);
    pole.position.set(x, hgt / 2, z); pole.castShadow = hi; group.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.08), M.pole); arm.position.set(x + 0.6, hgt - 0.1, z); group.add(arm);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 0.32), lampHeadMat); head.position.set(x + 1.2, hgt - 0.2, z); group.add(head);
    codeLamps.push(pole, arm, head);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), glowMat);
    glow.rotation.x = -Math.PI / 2; glow.position.set(x + 1.2, terrain.height(x + 1.2, z) + 0.03, z); group.add(glow);
    obstacles.push({ x, z, r: 0.22, kind: 'pole' });
    ao(x - 0.1, x + 0.1, z - 0.1, z + 0.1, 0.35);
  }

  // --- Cônes renversables, barrières, poubelles ----------------------------------------------------------
  const cones = [];
  {
    const coneGeo = new THREE.ConeGeometry(0.2, 0.55, 14); coneGeo.translate(0, 0.3, 0);
    const baseGeo = new THREE.BoxGeometry(0.42, 0.04, 0.42); baseGeo.translate(0, 0.02, 0);
    const stripeGeo = new THREE.CylinderGeometry(0.115, 0.15, 0.09, 14, 1, true); stripeGeo.translate(0, 0.34, 0);
    const spots = [[6.5, 19.5], [7.7, 20.7], [8.9, 19.5], [13, -4], [13.5, -2.8], [-20, 4], [-19, -11], [27, 14], [11, 24]];
    for (const [x, z] of spots) {
      const g = new THREE.Group();
      const c1 = new THREE.Mesh(coneGeo, M.cone); c1.castShadow = hi; g.add(c1);
      g.add(new THREE.Mesh(baseGeo, M.cone)); g.add(new THREE.Mesh(stripeGeo, M.white));
      g.position.set(x, terrain.height(x, z), z); group.add(g);
      cones.push({ obj: g, x, z, vx: 0, vy: 0, vz: 0, spin: 0, hit: false, home: [x, z] });
    }
    const bar = (x, z, rot) => {
      const g = new THREE.Group();
      for (const sx of [-0.8, 0.8]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.5), M.pole); leg.position.set(sx, 0.5, 0); g.add(leg); }
      const c = document.createElement('canvas'); c.width = 256; c.height = 32; const ctx = c.getContext('2d');
      for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#f3f0e8' : '#ff6a1a'; ctx.beginPath(); ctx.moveTo(i * 20 - 10, 32); ctx.lineTo(i * 20 + 10, 0); ctx.lineTo(i * 20 + 30, 0); ctx.lineTo(i * 20 + 10, 32); ctx.fill(); }
      const plank = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.24, 0.05), new THREE.MeshStandardMaterial({ map: canvasTexture(c) }));
      plank.position.y = 0.85; g.add(plank);
      g.position.set(x, 0, z); g.rotation.y = rot; group.add(g);
      obstacles.push({ x, z, r: 0.5, kind: 'barrier' });
    };
    void bar;
    for (const [x, z, r] of [[-8, 24, 0.3], [30, -2, 1.2], [-26, 14, 0.1], [10, -12, -0.4]]) obstacles.push({ x, z, r: 0.75, kind: 'barrier', rot: r });
    for (const [x, z] of [[-6, 28], [16, 6], [-28, 24], [8, -14], [29, 18]]) {
      obstacles.push({ x, z, r: 0.42, kind: 'bin', prop: 'bin' });
      ao(x - 0.3, x + 0.3, z - 0.3, z + 0.3, 0.4);
    }
  }

  // --- Lettres S-K-A-T-E et cassette -------------------------------------------------------------------
  const letterDefs = [
    { ch: 'S', pos: [0, 3.0, 1.75] },
    { ch: 'K', pos: [-4, 5.3, qpA.lip + 0.55] },
    { ch: 'A', pos: [24, 1.0, -12 + 4.5 + bw.uTop - 0.9] },
    { ch: 'T', pos: [-21.7, 2.7, -4] },
    { ch: 'E', pos: [-16, 1.45, 1.5] },
  ];
  const collectibles = [];
  for (const d of letterDefs) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const ctx = c.getContext('2d');
    ctx.font = 'italic 900 200px Impact, "Arial Black", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 18; ctx.strokeStyle = '#1a1026'; ctx.strokeText(d.ch, 128, 140);
    ctx.fillStyle = PALETTE.acid; ctx.fillText(d.ch, 128, 140);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTexture(c), toneMapped: false, depthWrite: false }));
    sp.scale.set(1.3, 1.3, 1);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.06, 8, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff3d8b').multiplyScalar(1.5), toneMapped: false }));
    const g = new THREE.Group(); g.add(sp); g.add(ring);
    g.position.set(...d.pos); group.add(g);
    collectibles.push({ id: 'letter-' + d.ch, ch: d.ch, kind: 'letter', obj: g, ring, pos: new THREE.Vector3(...d.pos), taken: false, r: 1.25 });
  }
  {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.4, 0.1), new THREE.MeshStandardMaterial({ color: '#16161a' }));
    const lc = document.createElement('canvas'); lc.width = 256; lc.height = 160;
    const lctx = lc.getContext('2d'); lctx.fillStyle = PALETTE.cone; lctx.fillRect(0, 0, 256, 160);
    lctx.fillStyle = '#16161a'; lctx.fillRect(0, 96, 256, 8);
    lctx.font = 'italic 900 44px Impact, sans-serif'; lctx.fillText('RESPAWN', 20, 60);
    lctx.font = '900 22px Impact, sans-serif'; lctx.fillText('SESSION MIX — FACE A', 20, 140);
    lctx.beginPath(); lctx.arc(78, 100, 16, 0, 7); lctx.arc(178, 100, 16, 0, 7); lctx.fill();
    const label = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: canvasTexture(lc), toneMapped: false }));
    label.position.z = 0.051; body.add(label);
    const label2 = label.clone(); label2.rotation.y = Math.PI; label2.position.z = -0.051; body.add(label2);
    g.add(body);
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.62, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.acid).multiplyScalar(1.6), toneMapped: false, side: THREE.DoubleSide, transparent: true }));
    g.add(halo);
    const pos = [20, shopH + 0.75, 24.2];
    g.position.set(...pos); group.add(g);
    collectibles.push({ id: 'cassette', kind: 'cassette', obj: g, ring: halo, pos: new THREE.Vector3(...pos), taken: false, r: 1.2 });
  }

  // --- Gaps nommés ----------------------------------------------------------------------------------------
  const inBowl = (x, z) => bw.sdf(x, z) < bw.uTop - 0.15;
  const gaps = [
    { id: 'gap-marches', name: 'LES 10 MARCHES', type: 'air', points: 500,
      from: (p) => p.x < -23.6 && p.y > 1.2 && p.z > -10.5 && p.z < 2.5, to: (p) => p.x > -19.3 && p.z > -11 && p.z < 3 && p.y < 0.3 },
    { id: 'gap-handrail', name: 'HANDRAIL DES 10 MARCHES', type: 'grind', points: 600, rail: 'handrail', fraction: 0.7 },
    { id: 'gap-parking', name: 'RAIL PLAT', type: 'grind', points: 750, rail: 'parking', fraction: 0.8 },
    { id: 'gap-bowl', name: 'TRANSFERT DU BOWL', type: 'air', points: 600,
      from: (p) => inBowl(p.x, p.z), to: (p) => !inBowl(p.x, p.z) && bw.sdf(p.x, p.z) > bw.uTop + 0.2 },
    { id: 'gap-funbox', name: 'PAR-DESSUS LA FUNBOX', type: 'air', points: 400,
      from: (p) => p.z < -0.4 && p.z > -6 && Math.abs(p.x) < 4.2, to: (p) => p.z > 4.1 && p.z < 12 && Math.abs(p.x) < 5 },
    { id: 'gap-toit', name: 'TOIT DU SHOP', type: 'land', points: 1000, on: (p) => p.x > shopX0 && p.x < shopX1 && p.z > shopZ0 && p.z < shopZ1 && p.y > shopH - 0.2 },
    { id: 'gap-deck', name: 'DECK DU HALF', type: 'land', points: 500, on: (p) => p.x > hpL0 && p.x < hpL1 && (p.z < qpA.lip - 0.2 || p.z > qpB.lip + 0.2) && p.z > -28.2 && p.z < -9.8 && p.y > 3.2 },
  ];

  function update(t, dt) {
    for (const f of animated) f(t);
    for (const c of collectibles) {
      if (c.taken) continue;
      c.obj.rotation.y = c.kind === 'cassette' ? t * 1.6 : 0;
      c.ring.rotation.y = t * 2.2;
      c.obj.position.y = c.pos.y + Math.sin(t * 2.4 + c.pos.x) * 0.12;
    }
    for (const c of cones) {
      if (!c.hit) continue;
      c.vy -= 19 * dt;
      c.x += c.vx * dt; c.z += c.vz * dt;
      const g = terrain.height(c.x, c.z);
      let y = c.obj.position.y + c.vy * dt;
      if (y < g) { y = g; c.vy *= -0.3; c.vx *= 0.7; c.vz *= 0.7; c.spin *= 0.7; }
      c.obj.position.set(c.x, y, c.z);
      c.obj.rotation.x += c.spin * dt; c.obj.rotation.z += c.spin * 0.6 * dt;
      if (Math.abs(c.vx) + Math.abs(c.vz) + Math.abs(c.vy) < 0.05 && y - g < 0.01) {
        c.hit = false; c.obj.rotation.x = Math.PI / 2 * Math.sign(c.obj.rotation.x || 1);
      }
    }
  }

  function resetProps() {
    for (const c of collectibles) { c.taken = false; c.obj.visible = true; }
    for (const c of cones) {
      c.hit = false; c.x = c.home[0]; c.z = c.home[1];
      c.obj.position.set(c.x, terrain.height(c.x, c.z), c.z); c.obj.rotation.set(0, 0, 0);
    }
  }

  // accessoires réalistes (Poly Haven, CC0) une fois chargés : lampadaires, poubelles, glissières…
  function addProps(gltf) {
    const byName = {};
    for (const n of gltf.scene.children) byName[n.name] = n;
    const place = (name, x, z, rot = 0, scale = 1, filter = null) => {
      const src = byName[name]; if (!src) return null;
      const o = src.clone(true);
      if (filter) o.traverse((c) => { if (c.isMesh && !filter(c)) c.visible = false; });
      o.position.set(x, terrain.height(x, z), z); o.rotation.y = rot; o.scale.setScalar(scale);
      o.traverse((c) => { if (c.isMesh) { c.castShadow = hi; c.receiveShadow = quality.shadows; } });
      group.add(o);
      return o;
    };
    if (byName.street_lamp_01) {
      for (const m of codeLamps) m.visible = false;
      for (const [x, z] of lampSpots) {
        place('street_lamp_01', x, z, 0, 1.5);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), lampHeadMat);
        head.position.set(x, terrain.height(x, z) + 3.6 * 1.5, z); group.add(head);
      }
    }
    for (const o of obstacles) {
      if (o.kind === 'bin') place('metal_trash_can', o.x, o.z, o.x * 0.7, 1, (c) => !/rust/.test(c.name) && !/rust/.test(c.parent && c.parent.name));
      if (o.kind === 'barrier') place('concrete_road_barrier', o.x, o.z, o.rot, 1.15);
    }
    // coin graffeur près du mur ouest, pneus, sacs, boîtier électrique, table
    place('spray_paint_bottles_02', -34.6, 20, 0.4, 1.4);
    place('old_tyre', -34.2, 22.5, 0, 1.4)?.rotation.set(Math.PI / 2, 0, 0.3);
    place('old_tyre', -33.6, 23.6, 0, 1.4)?.rotation.set(Math.PI / 2, 0, 1.1);
    place('trashbag', -33.8, 27.5, 0.6, 1.2);
    place('trashbag', 33.6, 29.8, 2.1, 1.1);
    place('utility_box_01', 34.4, 12, -Math.PI / 2, 1.2);
    place('utility_box_01', -4, -31.2, 0, 1.2);
    place('wooden_picnic_table', 32.5, 27, 0.2, 1);
    obstacles.push({ x: 32.5, z: 27, r: 1.2, kind: 'table' });
  }

  return { addProps, group, terrain, rails, obstacles, collectibles, cones, gaps, spawn, shopZone, lights: [], update, resetProps, bowl: bw, qpA, qpB, roof };
}
