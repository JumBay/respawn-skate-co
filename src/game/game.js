// Le moteur du jeu : rendu, boucle, caméra, et liaison physique / tricks / skater / run.
import * as THREE from 'three';
import { Pipeline } from '../world/post.js';
import { MaterialBank } from '../world/materials.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { createPark } from '../world/park.js';
import { createEnvironment } from '../world/environment.js';
import { SkaterController, dirFromYaw } from '../player/controller.js';
import { Skater } from '../player/skater.js';
import { TrickSystem } from './tricks.js';
import { Events } from '../core/events.js';

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _m = new THREE.Matrix4();

export class Game {
  constructor({ canvas, quality, assetBase, input, events }) {
    this.canvas = canvas;
    this.quality = quality;
    this.input = input;
    this.ev = events || new Events();
    this.assetBase = assetBase;
    this.timeScale = 1;
    this.paused = false;
    this.mode = 'menu'; // menu | play | shop | results
    this.fps = 60; this._fpsAcc = 0; this._fpsN = 0;

    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false });
    r.setPixelRatio(quality.pixelRatio);
    r.toneMapping = THREE.AgXToneMapping;
    r.toneMappingExposure = 1.15;
    r.outputColorSpace = THREE.SRGBColorSpace;
    if (quality.shadows) { r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap; }

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 600);
    this.env = createEnvironment(this.scene, quality, { assetBase, renderer: r });
    this.bank = new MaterialBank({ assetBase, quality, renderer: r });
    this.park = createPark({ quality, bank: this.bank });
    if (quality.tier !== 'low') {
      const gl = new GLTFLoader(); gl.setMeshoptDecoder(MeshoptDecoder);
      gl.loadAsync(`${assetBase}models/props.glb`).then((g) => this.park.addProps(g)).catch((e) => console.warn('[respawn] props', e));
    }
    this.scene.add(this.park.group);

    this.tricks = new TrickSystem(this.ev);
    this.ctrl = new SkaterController(this.park, this.tricks, this.ev);
    this.skater = new Skater({ quality, assetBase, bank: this.bank });
    this.scene.add(this.skater.group);

    // ombre peinte sous le skater (toujours, plus légère que l'ombre calculée)
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const ctx = c.getContext('2d'); const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    this.blob.renderOrder = 2;
    this.scene.add(this.blob);

    this.pipeline = new Pipeline(r, this.scene, this.camera, quality);

    this.cam = { yaw: Math.PI, pos: new THREE.Vector3(0, 3, 35), look: new THREE.Vector3(), shake: 0, fov: 62 };
    this.clock = new THREE.Timer();
    this.clock.connect(document);
    this.time = 0;
    this.onFrame = null;
    this.resize();
    this._resize = () => this.resize();
    window.addEventListener('resize', this._resize);
    this.ro = new ResizeObserver(this._resize);
    this.ro.observe(canvas.parentElement || canvas);

    this.ev.on('bail', () => { this.cam.shake = 0.5; });
    this.ev.on('land', (e) => { if (e.impact > 9) this.cam.shake = Math.min(0.35, e.impact * 0.02); });
  }

  resize() {
    const el = this.canvas.parentElement || this.canvas;
    const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // portrait : on recule un peu la caméra (fov plus large)
    this.portrait = h > w;
    this.camera.updateProjectionMatrix();
    this.pipeline.setSize(w, h, this.renderer.getPixelRatio());
  }

  async setLook(look) { await this.skater.setLook(look); }

  spawn() {
    const s = this.park.spawn;
    this.ctrl.reset(s.x, s.z, s.yaw);
    this.cam.yaw = s.yaw;
    this.snapCamera();
  }

  start() {
    const loop = (t) => {
      this.raf = requestAnimationFrame(loop);
      this.clock.update(t);
      const dt = Math.min(this.clock.getDelta(), 0.05);
      this.frame(dt);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() { cancelAnimationFrame(this.raf); }

  frame(dt) {
    // mesure des images par seconde (qualité adaptative)
    this._fpsAcc += dt; this._fpsN++;
    if (this._fpsAcc > 1) { this.fps = this._fpsN / this._fpsAcc; this._fpsAcc = 0; this._fpsN = 0; this.adapt(); }
    const sdt = this.paused ? 0 : dt * this.timeScale;
    this.time += sdt;
    this.input.update(dt);
    if (this.onFrame) this.onFrame(dt, sdt);
    if (!this.paused) {
      if (this.photo) { /* mode photo : tout est figé */ }
      else if (this.mode === 'play') this.ctrl.update(sdt, this.input);
      else this.ctrl.update(sdt, this.idleInput || (this.idleInput = fakeInput()));
      this.tricks.decay(sdt);
      this.park.update(this.time, sdt);
      this.syncSkater(sdt);
    }
    this.updateCamera(dt);
    this.env.follow(this.ctrl.pos);
    this.pipeline.render();
  }

  adapt() {
    // trop lent : on baisse la densité de pixels, puis le bloom
    if (this.fps < 40 && this.renderer.getPixelRatio() > 1) {
      this.renderer.setPixelRatio(Math.max(1, this.renderer.getPixelRatio() - 0.25));
      this.resize();
    } else if (this.fps < 32) {
      this.pipeline.setBloom(false);
    }
  }

  syncSkater(dt) {
    const c = this.ctrl, s = this.skater;
    const up = c.visualUp;
    const f = dirFromYaw(c.yaw, _v);
    f.addScaledVector(up, -f.dot(up)).normalize();
    const z = _v2.crossVectors(f, up).normalize();
    _m.makeBasis(f, up, z);
    s.group.quaternion.setFromRotationMatrix(_m);
    s.group.position.copy(c.pos);
    const bt = this.tricks.boardTrick();
    const st = {
      crouch: c.crouch, push: c.pushing && c.state === 'ground', pushPhase: c.pushPhase,
      air: c.state === 'air', flip: bt && bt.flip, grab: bt && bt.grab, special: bt && bt.specialPose,
      manual: !!c.manual, nose: c.manual && c.manual.nose, grind: c.state === 'grind',
      balance: c.grind ? c.grind.balance : (c.manual ? c.manual.balance : 0),
      speed: c.speed, steer: this.input.state.x, fakie: c.fakie,
      darkslide: c.state === 'grind' && this.tricks.grindSpecial,
    };
    if (this.photo && this.photo.st) Object.assign(st, this.photo.st);
    if (c.state === 'bail') {
      if (s.mode !== 'clip') s.playClip('Death', { loop: false, fade: 0.12 });
    } else if (s.mode === 'clip' && this.mode === 'play') s.stopClip();
    s.update(dt, st);
    // ombre peinte
    const h = this.park.terrain.sample(c.pos.x, c.pos.z);
    this.blob.position.set(c.pos.x, h.h + 0.03, c.pos.z);
    const n = this.park.terrain.normal(c.pos.x, c.pos.z, _v);
    this.blob.quaternion.setFromUnitVectors(_v2.set(0, 0, 1), n);
    const hgt = Math.max(0, c.pos.y - h.h);
    this.blob.material.opacity = Math.max(0, 0.9 - hgt * 0.25);
    this.blob.scale.setScalar(1 + hgt * 0.15);
  }

  snapCamera() {
    this.updateCamera(1, true);
  }

  updateCamera(dt, snap = false) {
    const c = this.ctrl, cam = this.cam, T = this.park.terrain;
    if (this.cameraOverride) { this.cameraOverride(this.camera, dt); return; }
    // cap : suit la direction de déplacement au sol, garde son cap en l'air
    const vh = Math.hypot(c.vel.x, c.vel.z);
    if (c.state === 'ground' && vh > 1.2 && c.normal.y > 0.55) {
      const target = Math.atan2(c.vel.x, c.vel.z);
      let d = target - cam.yaw; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
      cam.yaw += d * (1 - Math.exp(-(snap ? 99 : 3.2) * dt));
    } else if (c.state === 'grind' && c.grind) {
      const r = c.grind.rail.dir; const s = Math.sign(c.grind.u) || 1;
      const target = Math.atan2(r.x * s, r.z * s);
      let d = target - cam.yaw; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
      cam.yaw += d * (1 - Math.exp(-3 * dt));
    } else if (c.state === 'ground' && vh < 0.5 && Math.abs(this.input.state.x) > 0.1 && this.mode === 'play') {
      cam.yaw = c.yaw + (c.fakie ? Math.PI : 0) + 0 * dt;
    }
    const speed = c.speed;
    // caméra façon THPS : ~3 m derrière, ~1,7 m au-dessus, regard porté devant
    const dist = (this.portrait ? 4.1 : 3.2) + Math.min(1.1, speed * 0.06);
    const height = (this.portrait ? 2.0 : 1.65) + Math.min(0.35, speed * 0.025);
    const f = dirFromYaw(cam.yaw, _v);
    const tgt = _v2.copy(c.pos); tgt.y += 1.0;
    const want = new THREE.Vector3(tgt.x - f.x * dist, Math.max(c.pos.y, T.height(c.pos.x, c.pos.z)) + height, tgt.z - f.z * dist);
    // le terrain entre le skater et la caméra : on se rapproche
    for (let i = 1; i <= 6; i++) {
      const k = i / 6;
      const px = tgt.x + (want.x - tgt.x) * k, pz = tgt.z + (want.z - tgt.z) * k, py = tgt.y + (want.y - tgt.y) * k;
      const h = T.height(px, pz);
      if (h > py - 0.35) { want.set(tgt.x + (want.x - tgt.x) * (k - 0.17), Math.max(want.y, h + 0.6), tgt.z + (want.z - tgt.z) * (k - 0.17)); break; }
    }
    want.y = Math.max(want.y, T.height(want.x, want.z) + 0.5);
    const k = snap ? 1 : 1 - Math.exp(-(c.state === 'air' ? 4 : 6) * dt);
    cam.pos.lerp(want, k);
    const lookAt = tgt.clone().addScaledVector(f, 3.2);
    lookAt.y = tgt.y - 0.15 - (c.state === 'air' ? Math.max(0, c.pos.y - T.height(c.pos.x, c.pos.z) - 2) * 0.15 : 0);
    if (snap) cam.look.copy(lookAt); else cam.look.lerp(lookAt, 1 - Math.exp(-8 * dt));
    this.camera.position.copy(cam.pos);
    if (cam.shake > 0) {
      cam.shake = Math.max(0, cam.shake - dt);
      const s = cam.shake * 0.25;
      this.camera.position.x += (Math.random() - 0.5) * s; this.camera.position.y += (Math.random() - 0.5) * s;
    }
    this.camera.lookAt(cam.look);
    const fov = (this.portrait ? 72 : 62) + Math.min(9, speed * 0.55);
    cam.fov += (fov - cam.fov) * (1 - Math.exp(-3 * dt));
    if (Math.abs(this.camera.fov - cam.fov) > 0.05) { this.camera.fov = cam.fov; this.camera.updateProjectionMatrix(); }
  }

  // Squelette visible (mise au point de la posture) : touche F2 ou ?skeleton
  toggleSkeleton() {
    if (this.skelHelper) { this.scene.remove(this.skelHelper); this.skelHelper = null; return; }
    if (!this.skater.char) return;
    this.skelHelper = new THREE.SkeletonHelper(this.skater.char);
    this.skelHelper.material.depthTest = false; this.skelHelper.material.linewidth = 2;
    this.scene.add(this.skelHelper);
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this._resize);
    this.ro.disconnect();
    this.clock.disconnect && this.clock.disconnect();
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      for (const m of mats) { for (const k of Object.keys(m)) if (m[k] && m[k].isTexture) m[k].dispose(); m.dispose(); }
    });
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

function fakeInput() {
  const b = {};
  for (const n of ['ollie', 'flip', 'grab', 'grind', 'manual', 'special', 'pause', 'interact', 'respawn', 'mute']) b[n] = { down: false, pressed: false, released: false, t: 0 };
  return { state: { x: 0, y: 0 }, btn: b, dir8: () => '' };
}
