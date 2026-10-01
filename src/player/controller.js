// Physique arcade du skater : roulage sur le champ de hauteur, airs, vert, grinds, manuals, chutes.
// Pas de moteur physique : un point qui glisse sur une surface analytique, avec des règles de jeu.
import * as THREE from 'three';
import { GRAVITY } from '../config.js';

const UP = new THREE.Vector3(0, 1, 0);
const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _n = new THREE.Vector3(), _q = new THREE.Quaternion();
const STEP = 1 / 120;

export const dirFromYaw = (yaw, out = new THREE.Vector3()) => out.set(Math.sin(yaw), 0, Math.cos(yaw));
const wrap = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

export class SkaterController {
  constructor(park, tricks, events) {
    this.park = park;
    this.terrain = park.terrain;
    this.tricks = tricks;
    this.ev = events; // { emit(name, data) }
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.normal = new THREE.Vector3(0, 1, 0);
    this.visualUp = new THREE.Vector3(0, 1, 0);
    this.yaw = Math.PI;
    this.fakie = false;
    this.state = 'ground';
    this.stats = { pop: 1, grip: 1, glisse: 1 };
    this.acc = 0;
    this.crouch = 0;
    this.pushPhase = 0; this.pushing = 0;
    this.grindBuffer = 0;
    this.manualBuffer = 0;
    this.landGrace = 0;
    this.lastSafe = { pos: new THREE.Vector3(), yaw: Math.PI, t: 0 };
    this.bailTimer = 0;
    this.air = { t: 0, vert: false, autoTurn: 0, autoRate: 0, spin: 0, spinVel: 0, takeoff: new THREE.Vector3(), wallN: new THREE.Vector3(), transfer: false };
    this.grind = null;
    this.manual = null;
    this.speed = 0;
    this.surfaceKind = 'concrete';
    this.frozen = false;
    // mode assisté (défaut) : vitesse de croisière, montée de rampe facilitée, réception
    // alignée, grinds aimantés, équilibre stable
    this.assist = true;
    this.grindTarget = null;
  }

  reset(x, z, yaw) {
    const h = this.terrain.height(x, z);
    this.pos.set(x, h, z); this.vel.set(0, 0, 0); this.yaw = yaw; this.fakie = false;
    this.state = 'ground'; this.grind = null; this.manual = null; this.bailTimer = 0;
    this.normal.set(0, 1, 0); this.visualUp.set(0, 1, 0); this.crouch = 0;
    this.lastSafe.pos.copy(this.pos); this.lastSafe.yaw = yaw;
    this.landGrace = 0;
  }

  forward(out = new THREE.Vector3()) { return dirFromYaw(this.yaw, out); }

  update(dt, input) {
    // entrées « une fois » lues à la cadence d'affichage
    const b = input.btn;
    if (b.grind.pressed) this.grindBuffer = 0.4;
    if (b.manual.pressed) this.manualBuffer = 0.3;
    this.grindBuffer = Math.max(0, this.grindBuffer - dt);
    this.manualBuffer = Math.max(0, this.manualBuffer - dt);

    if (this.frozen) return;
    if (this.state === 'bail') { this.updateBail(dt); return; }

    // tricks déclenchés à l'image (pas dans les sous-pas)
    this.handleActions(dt, input);

    this.acc += Math.min(dt, 0.1);
    while (this.acc >= STEP) {
      this.acc -= STEP;
      if (this.state === 'ground') this.stepGround(STEP, input);
      else if (this.state === 'air') this.stepAir(STEP, input);
      else if (this.state === 'grind') this.stepGrind(STEP, input);
      if (this.state === 'bail') break;
    }
    this.speed = this.state === 'grind' ? Math.abs(this.grind ? this.grind.u : 0) : this.vel.length();

    // orientation visuelle : suit la normale au sol, se redresse en l'air
    const targetUp = this.state === 'ground' ? this.normal : UP;
    const k = this.state === 'ground' ? 18 : 5;
    this.visualUp.lerp(targetUp, 1 - Math.exp(-k * dt)).normalize();

    if (this.state === 'ground' && this.landGrace > 0) {
      this.landGrace -= dt;
      if (this.landGrace <= 0 && !this.manual) this.tricks.bank();
    }
  }

  // ---------------------------------------------------------------------------------------------
  handleActions(dt, input) {
    const b = input.btn;
    // ollie : on s'accroupit en tenant, on saute en relâchant
    if (b.ollie.down && (this.state === 'ground' || this.state === 'grind')) this.crouch = Math.min(1, this.crouch + dt * 5);
    else this.crouch = Math.max(0, this.crouch - dt * 8);
    if (b.ollie.released && (this.state === 'ground' || this.state === 'grind')) this.ollie(Math.min(1, b.ollie.t / 0.3));

    if (this.state === 'ground') {
      // grind demandé au sol : petit ollie automatique, le grind est gardé en mémoire
      if (b.grind.pressed) { const r = this.findRail(this.assist ? 2.4 : 1.6, 1.2); if (r) this.grindHop(r); }
      if (this.manualBuffer > 0 && !this.manual && this.speed > 1.2) this.startManual(input);
      else if (b.manual.pressed && this.manual) this.endManual(true);
      if (b.special.pressed && this.manual && this.tricks.specialReady()) this.tricks.special('manual', input.dir8());
    }
    if (this.state === 'air') {
      if (b.flip.pressed) this.tricks.flip(input.dir8());
      if (b.grab.pressed) this.tricks.grab(input.dir8());
      if (b.grab.released) this.tricks.releaseGrab();
      if (b.special.pressed && this.tricks.specialReady()) this.tricks.special('air', input.dir8());
    }
    if (this.state === 'grind' && b.special.pressed && this.tricks.specialReady()) this.tricks.special('grind', input.dir8());
  }

  ollie(charge = 0.5) {
    // ollie arcade : même un appui bref passe un funbox, chargé il monte nettement plus haut
    const pop = (this.assist ? 6.3 + charge * 1.3 : 5.2 + charge * 1.6) * this.stats.pop;
    if (this.state === 'grind') {
      const g = this.grind;
      this.vel.copy(g.rail.dir).multiplyScalar(g.u);
      this.vel.y = Math.max(this.vel.y, 0) + pop * 0.85;
      this.endGrind(false);
      this.enterAir(false, 'ollie');
    } else {
      // impulsion le long de la normale (et un peu de vertical pur sur pente)
      _n.copy(this.normal);
      this.vel.addScaledVector(_n, pop * 0.55).addScaledVector(UP, pop * 0.5);
      if (this.manual) this.endManual(false);
      this.pos.addScaledVector(_n, 0.03);
      this.enterAir(this.normal.y < 0.5, 'ollie');
    }
    this.ev.emit('ollie', { charge });
  }

  // saut aimanté vers un rail : on vise le dessus du rail, il est accroché à l'apex
  grindHop(hit) {
    const r = hit.rail, p = this.pos;
    const cx = r.a.x + r.dir.x * hit.s, cy = r.a.y + r.dir.y * hit.s, cz = r.a.z + r.dir.z * hit.s;
    const rise = Math.max(0.15, cy - p.y + 0.22);
    const vy = Math.sqrt(2 * GRAVITY * rise);
    const T = vy / GRAVITY;
    // composante le long du rail gardée, l'écart latéral comblé en T
    const along = this.vel.x * r.dir.x + this.vel.z * r.dir.z;
    const hl = Math.hypot(r.dir.x, r.dir.z) || 1;
    const ax = (r.dir.x / hl) * along, az = (r.dir.z / hl) * along;
    // point visé : où sera le rail en T, avancé de la vitesse le long du rail
    const tx = cx + ax * T, tz = cz + az * T;
    const lx = (tx - p.x) / T - ax, lz = (tz - p.z) / T - az;
    this.vel.set(ax + lx, vy, az + lz);
    if (this.manual) this.endManual(false);
    this.grindTarget = r;
    this.grindBuffer = 0.8;
    this.pos.y += 0.02;
    this.enterAir(false, 'ollie');
    this.ev.emit('ollie', { charge: 0.3 });
  }

  enterAir(vert, reason = 'drop') {
    this.state = 'air';
    const a = this.air;
    a.t = 0; a.spin = 0; a.spinVel = 0; a.vert = vert; a.autoTurn = 0; a.transfer = false;
    a.takeoff.copy(this.pos);
    a.takeoffSurface = this.surfaceKind;
    if (vert) {
      // mur : la composante horizontale vers le mur devient une légère dérive vers le park
      a.wallN.set(this.normal.x, 0, this.normal.z);
      if (a.wallN.lengthSq() < 1e-6) a.wallN.copy(dirFromYaw(this.yaw)).negate();
      a.wallN.normalize();
      const vn = this.vel.dot(a.wallN);
      const holdTransfer = this._input && this._input.state.y > 0.6;
      a.transfer = holdTransfer;
      this.vel.addScaledVector(a.wallN, (holdTransfer ? -2.6 : 0.7) - vn);
      this.pos.addScaledVector(a.wallN, holdTransfer ? 0 : 0.1);
      const T = Math.max(0.4, (2 * Math.max(this.vel.y, 1)) / GRAVITY);
      a.autoTurn = Math.PI;
      // sens du demi-tour : celui de la vitesse latérale
      _v.crossVectors(UP, a.wallN);
      const side = this.vel.dot(_v);
      a.autoRate = (side >= 0 ? 1 : -1) * Math.PI / (T * 0.82);
    }
    if (this.manual) this.manual = null;
    this.landGrace = 0;
    this.tricks.startAir(vert, reason);
    this.ev.emit('takeoff', { vert, pos: this.pos.clone() });
  }

  // ---------------------------------------------------------------------------------------------
  stepGround(dt, input) {
    this._input = input;
    const T = this.terrain;
    const s = T.sample(this.pos.x, this.pos.z);
    this.surfaceKind = s.kind;
    const l = Math.hypot(s.gx, 1, s.gz);
    this.normal.set(-s.gx / l, 1 / l, -s.gz / l);
    const n = this.normal;
    const v = this.vel;
    // projette la vitesse sur le plan tangent (sécurité numérique)
    v.addScaledVector(n, -v.dot(n));

    const speed = v.length();
    const fwd = dirFromYaw(this.yaw, _w);
    // avant de la planche dans le plan tangent
    fwd.addScaledVector(n, -fwd.dot(n)).normalize();
    const sgn = this.fakie ? -1 : 1;

    // direction : tourne la vitesse et la planche autour de la normale
    const steer = input.state.x;
    const A = this.assist;
    if (Math.abs(steer) > 0.01) {
      // sur une paroi raide, on garde sa ligne (la direction sert surtout au plat)
      const wall = A && n.y < 0.75 ? 0.35 : 1;
      const rate = (A ? 3.3 - Math.min(1.0, speed * 0.05) : 2.7 - Math.min(1.1, speed * 0.06)) * this.stats.grip * (this.manual ? 0.6 : 1) * wall;
      const ang = -steer * rate * dt;
      _q.setFromAxisAngle(n, ang);
      v.applyQuaternion(_q);
      if (n.y > 0.45) this.yaw = wrap(this.yaw + ang);
    }

    // pousser / freiner
    const push = input.state.y > 0.3 && !this.manual;
    const brake = input.state.y < -0.5 && !this.manual;
    const maxPush = (A ? 11.5 : 9.5) * this.stats.glisse;
    const cruise = 7.5 * this.stats.glisse;
    this.pushing = 0;
    if (push && n.y > 0.85) {
      const along = v.dot(fwd) * sgn;
      if (along < maxPush) {
        v.addScaledVector(fwd, sgn * (A ? 11 : 9) * dt * (along < 2 ? 1.6 : 1));
        this.pushing = 1;
      }
    } else if (A && !brake && !this.manual && n.y > 0.9) {
      // croisière : une fois lancé, on garde un bon rythme sans avoir à pousser
      const along = v.dot(fwd) * sgn;
      if (along > 1.0 && along < cruise) v.addScaledVector(fwd, sgn * 4.5 * dt);
    }
    if (brake && speed > 0.2) {
      const dec = Math.min(speed, (A ? 15 : 10) * dt);
      v.addScaledVector(v, -dec / Math.max(speed, 1e-4));
      if (speed > 3) this.ev.emit('powerslide', { speed });
    }

    // gravité le long de la pente (assistée en montée : on atteint la lèvre et on décolle)
    _v.set(0, -GRAVITY, 0);
    _v.addScaledVector(n, -_v.dot(n));
    const climbing = v.y > 0.05 && n.y < 0.97;
    v.addScaledVector(_v, dt * (A && climbing ? 0.5 : 1));
    // en montant une paroi, la dérive latérale est absorbée : on monte droit vers la lèvre
    if (A && n.y < 0.9 && n.y > 0.05) {
      _n.set(n.x, 0, n.z).normalize();               // direction horizontale de la pente
      const lat = v.x * -_n.z + v.z * _n.x; // composante latérale
      v.x -= -_n.z * lat * (1 - Math.exp(-2.5 * dt));
      v.z -= _n.x * lat * (1 - Math.exp(-2.5 * dt));
    }

    // frottements : roulement + air
    const roll = (A ? 0.02 : 0.045) / this.stats.glisse;
    v.multiplyScalar(Math.max(0, 1 - roll * dt - 0.0016 * speed * dt));
    if (speed < 0.08 && !push && n.y > 0.97) v.set(0, 0, 0);

    // adhérence : la vitesse latérale à la planche est absorbée par les roues
    const along = v.dot(fwd);
    _v.copy(v).addScaledVector(fwd, -along);
    const gripK = (A ? 14 : 7) * this.stats.grip;
    v.addScaledVector(_v, -(1 - Math.exp(-gripK * dt)));

    // la planche suit la vitesse (sens fakie compris)
    const vh = Math.hypot(v.x, v.z);
    if (vh > 0.6 && n.y > 0.45) {
      const vy = Math.atan2(v.x, v.z);
      const target = this.fakie ? wrap(vy + Math.PI) : vy;
      let d = wrap(target - this.yaw);
      if (Math.abs(d) > Math.PI / 2) { this.fakie = !this.fakie; d = wrap(d + Math.PI); }
      this.yaw = wrap(this.yaw + d * (1 - Math.exp(-(A ? 16 : 10) * dt)));
    }
    // fakie quand on redescend en arrière d'une rampe
    const fdot = v.dot(dirFromYaw(this.yaw, _n));
    if (vh > 0.4 && n.y > 0.45) this.fakie = fdot < 0;

    // manual : équilibre avant / arrière
    if (this.manual) this.stepManual(dt, input);
    if (this.state !== 'ground') return;

    // déplacement
    const ox = this.pos.x, oy = this.pos.y, oz = this.pos.z;
    const nx = ox + v.x * dt, nz = oz + v.z * dt;
    const predY = oy + v.y * dt;
    const s2 = T.sample(nx, nz);
    const rise = s2.h - predY;
    if (rise > 0.28) {
      // mur : on essaie de glisser le long
      this.hitWall(ox, oy, oz, nx, nz, predY);
      return;
    }
    if (n.y < 0.2 && v.y > 0.8) {
      // quasi vertical en montant : on décolle (vert)
      this.pos.set(nx, predY, nz);
      this.enterAir(true, 'vert');
      return;
    }
    const drop = predY - s2.h;
    const launchTol = 0.012 + speed * 0.0022;
    if (drop > launchTol && speed > 2.2) {
      // le sol se dérobe (lèvre, bord, kicker) : on part en l'air avec la vitesse actuelle
      this.pos.set(nx, predY, nz);
      const steep = n.y < 0.5;
      this.enterAir(steep, steep ? 'vert' : 'lip');
      return;
    }
    // collé au sol, la vitesse suit la nouvelle pente en gardant sa norme
    this.pos.set(nx, s2.h, nz);
    const l2 = Math.hypot(s2.gx, 1, s2.gz);
    _n.set(-s2.gx / l2, 1 / l2, -s2.gz / l2);
    const mag = v.length();
    v.addScaledVector(_n, -v.dot(_n));
    const m2 = v.length();
    if (m2 > 1e-5) v.multiplyScalar(mag / m2);
    this.normal.copy(_n);

    this.collideObstacles();
    this.clampBounds();

    // dernier point sûr pour réapparaître
    this.lastSafe.t += dt;
    if (n.y > 0.98 && this.lastSafe.t > 0.6 && !this.manual && this.pos.y > -0.5) {
      this.lastSafe.t = 0; this.lastSafe.pos.copy(this.pos); this.lastSafe.yaw = this.yaw;
    }
    if (this.pushing) this.pushPhase += dt;
  }

  hitWall(ox, oy, oz, nx, nz, predY) {
    const T = this.terrain, v = this.vel;
    const hx = T.height(nx, oz), hz = T.height(ox, nz);
    if (hx - predY <= 0.28) { this.pos.set(nx, hx, oz); v.z *= -0.15; }
    else if (hz - predY <= 0.28) { this.pos.set(ox, hz, nz); v.x *= -0.15; }
    else { v.x *= -0.25; v.z *= -0.25; }
    const sp = Math.hypot(v.x, v.z);
    this.ev.emit('bonk', { speed: sp });
  }

  collideObstacles() {
    const p = this.pos, v = this.vel;
    for (const o of this.park.obstacles) {
      const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz), r = o.r + 0.3;
      if (d < r && d > 1e-4) {
        const nx = dx / d, nz = dz / d;
        p.x = o.x + nx * r; p.z = o.z + nz * r;
        const vn = v.x * nx + v.z * nz;
        if (vn < 0) {
          const sp = v.length();
          v.x -= nx * vn * 1.4; v.z -= nz * vn * 1.4;
          if (!this.assist && sp > 8.5 && -vn > 6.5 && this.state === 'ground') { this.bail('obstacle'); return; }
          this.ev.emit('bonk', { speed: -vn });
        }
      }
    }
    // cônes : renversés au passage
    for (const c of this.park.cones) {
      if (c.hit) continue;
      const dx = c.x - p.x, dz = c.z - p.z, d = Math.hypot(dx, dz);
      if (d < 0.55 && p.y - c.obj.position.y < 0.6) {
        const sp = Math.max(3, v.length());
        c.hit = true; c.vx = v.x * 0.8 + dx * 2; c.vz = v.z * 0.8 + dz * 2; c.vy = 2.5 + sp * 0.25; c.spin = 8 + sp;
        this.ev.emit('cone', { cone: c });
      }
    }
  }

  clampBounds() {
    const b = this.terrain.bounds, p = this.pos, v = this.vel, m = 0.5;
    if (p.x < b.x0 + m) { p.x = b.x0 + m; v.x = Math.abs(v.x) * 0.3; this.ev.emit('bonk', { speed: 3 }); }
    if (p.x > b.x1 - m) { p.x = b.x1 - m; v.x = -Math.abs(v.x) * 0.3; this.ev.emit('bonk', { speed: 3 }); }
    if (p.z < b.z0 + m) { p.z = b.z0 + m; v.z = Math.abs(v.z) * 0.3; this.ev.emit('bonk', { speed: 3 }); }
    if (p.z > b.z1 - m) { p.z = b.z1 - m; v.z = -Math.abs(v.z) * 0.3; this.ev.emit('bonk', { speed: 3 }); }
  }

  // ---------------------------------------------------------------------------------------------
  stepAir(dt, input) {
    this._input = input;
    const a = this.air, v = this.vel, T = this.terrain;
    a.t += dt;
    v.y -= GRAVITY * dt;
    v.multiplyScalar(1 - 0.02 * dt);

    // vrille : gauche / droite
    const spinTarget = -input.state.x * 7.8;
    a.spinVel += (spinTarget - a.spinVel) * (1 - Math.exp(-9 * dt));
    const dy = a.spinVel * dt;
    this.yaw = wrap(this.yaw + dy);
    a.spin += dy;
    if (a.vert && a.autoTurn > 0) {
      const step = Math.min(a.autoTurn, Math.abs(a.autoRate) * dt);
      a.autoTurn -= step;
      this.yaw = wrap(this.yaw + Math.sign(a.autoRate) * step);
    }
    // en vert, tenir « haut » au sommet tente un transfert vers le deck
    if (a.vert && !a.transfer && input.state.y > 0.6 && v.y > 0 && a.t < 0.25) {
      a.transfer = true;
      v.addScaledVector(a.wallN, -2.4 - v.dot(a.wallN));
    }
    this.tricks.updateAir(dt);

    // réception assistée : près du sol en descendant, la planche se recale sur la trajectoire
    if (this.assist && v.y < 0) {
      const gh = T.height(this.pos.x, this.pos.z);
      const above = this.pos.y - gh;
      const vh = Math.hypot(v.x, v.z);
      if (above < 1.4 && vh > 0.8) {
        const vy = Math.atan2(v.x, v.z);
        const d1 = wrap(vy - this.yaw), d2 = wrap(vy + Math.PI - this.yaw);
        const d = Math.abs(d1) < Math.abs(d2) ? d1 : d2;
        if (Math.abs(d) < 1.9 && Math.abs(input.state.x) < 0.5) this.yaw = wrap(this.yaw + d * (1 - Math.exp(-7 * dt)));
      }
    }

    // grind ? (aimanté : un rail visé ou proche est attrapé de plus loin)
    if (this.grindBuffer > 0 || input.btn.grind.down) {
      const reach = this.assist ? 1.1 : 0.75;
      const r = this.findRail(reach, this.assist ? 1.0 : 0.75);
      if (r) { this.startGrind(r, input); return; }
      // en l'air, appui sur grind près d'un rail : on est attiré vers lui
      if (this.assist && !this.grindTarget) {
        const near = this.findRail(2.2, 2.0);
        if (near) { this.grindTarget = near.rail; }
      }
      if (this.assist && this.grindTarget) {
        const r2 = this.grindTarget;
        _v.subVectors(this.pos, r2.a);
        const s2 = Math.max(0, Math.min(r2.len, _v.dot(r2.dir)));
        const dx = r2.a.x + r2.dir.x * s2 - this.pos.x, dz = r2.a.z + r2.dir.z * s2 - this.pos.z;
        v.x += dx * 6 * dt; v.z += dz * 6 * dt;
      }
    }

    const ox = this.pos.x, oy = this.pos.y, oz = this.pos.z;
    const nx = ox + v.x * dt, ny = oy + v.y * dt, nz = oz + v.z * dt;
    const s = T.sample(nx, nz);
    if (ny <= s.h) {
      const prev = T.height(ox, oz);
      const fromSide = prev < oy - 0.05 ? false : true;
      if (s.h - ny > 0.35 + Math.abs(v.y) * dt * 2 || (fromSide && s.h - oy > 0.3)) {
        // on tape un flanc : on garde la chute, on perd l'horizontal
        const hx = T.height(nx, oz), hz = T.height(ox, nz);
        if (hx <= ny) { this.pos.set(nx, ny, oz); v.z *= -0.2; }
        else if (hz <= ny) { this.pos.set(ox, ny, nz); v.x *= -0.2; }
        else { this.pos.set(ox, ny, oz); v.x *= -0.2; v.z *= -0.2; }
        this.ev.emit('bonk', { speed: 3 });
        if (this.pos.y < T.height(this.pos.x, this.pos.z)) this.land(T.sample(this.pos.x, this.pos.z));
        return;
      }
      this.pos.set(nx, s.h, nz);
      this.land(s);
      return;
    }
    this.pos.set(nx, ny, nz);
    this.collideObstacles();
    this.clampBounds();
    if (this.pos.y < -10) this.bail('fall');
  }

  land(s) {
    const a = this.air, v = this.vel;
    const l = Math.hypot(s.gx, 1, s.gz);
    this.normal.set(-s.gx / l, 1 / l, -s.gz / l);
    const n = this.normal;
    this.surfaceKind = s.kind;
    const impact = -v.dot(n);
    // vitesse projetée sur la surface : sur une rampe, la chute devient de la vitesse
    v.addScaledVector(n, -v.dot(n));
    // alignement planche / vitesse
    const vh = Math.hypot(v.x, v.z);
    let ok = true, quality = 'clean', diff = 0;
    if (this.tricks.busy()) {
      // en assisté, un flip presque fini se pose quand même (réception limite)
      if (this.assist && this.tricks.air && this.tricks.air.flip && this.tricks.air.flip.t > this.tricks.air.flip.dur * 0.55) quality = 'sketchy';
      else { ok = false; quality = 'flip'; }
    }
    if (vh > 1.2) {
      const vy = Math.atan2(v.x, v.z);
      const d1 = Math.abs(wrap(vy - this.yaw)), d2 = Math.abs(wrap(vy + Math.PI - this.yaw));
      diff = Math.min(d1, d2);
      this.fakie = d2 < d1;
      const tol = ((this.assist ? 80 : 52) * Math.PI / 180) * this.stats.grip;
      if (diff > tol && ok) { ok = false; quality = 'angle'; }
      else {
        // aide à l'atterrissage : la planche se recale
        const target = this.fakie ? wrap(vy + Math.PI) : vy;
        this.yaw = target;
        if (quality !== 'sketchy') { if (diff < 0.2) quality = 'perfect'; else if (diff > tol * 0.7) quality = 'sketchy'; }
      }
    }
    if (!ok) { this.bail(quality); return; }
    this.state = 'ground';
    this.grindTarget = null;
    this.lastSafe.t = 0;
    this.visualUp.lerp(n, 0.5);
    const res = this.tricks.land({ spin: a.spin, vert: a.vert, fakie: this.fakie, quality, airTime: a.t });
    this.ev.emit('land', { impact, quality, pos: this.pos.clone(), takeoff: a.takeoff.clone(), airTime: a.t, kind: s.kind, res });
    // manual en arrivant (bouton tenu ou tout juste pressé)
    if (this.manualBuffer > 0 || (this._input && this._input.btn.manual.down)) this.startManual(this._input);
    else this.landGrace = 0.28;
  }

  // ---------------------------------------------------------------------------------------------
  findRail(maxDist, maxAbove) {
    const p = this.pos;
    let best = null, bestD = maxDist;
    for (const r of this.park.rails) {
      _v.subVectors(p, r.a);
      let s = _v.dot(r.dir);
      if (s < -0.2 || s > r.len + 0.2) continue;
      s = Math.max(0.05, Math.min(r.len - 0.05, s));
      const cx = r.a.x + r.dir.x * s, cy = r.a.y + r.dir.y * s, cz = r.a.z + r.dir.z * s;
      const dh = Math.hypot(p.x - cx, p.z - cz);
      const dyv = p.y - cy;
      if (dyv < -0.45 || dyv > maxAbove) continue;
      if (this.state === 'air' && this.vel.y > (this.assist ? 1.5 : 3.5) && dyv < 0.15) continue;
      if (dh < bestD) { bestD = dh; best = { rail: r, s }; }
    }
    return best;
  }

  startGrind(hit, input) {
    const r = hit.rail;
    let u = this.vel.dot(r.dir);
    const fwd = dirFromYaw(this.yaw, _w);
    const align = Math.abs(fwd.dot(new THREE.Vector3(r.dir.x, 0, r.dir.z).normalize()));
    if (Math.abs(u) < 2.5) u = (u >= 0 ? 1 : -1) * 3.2;
    const slide = align < 0.6;
    const dir = input ? input.dir8() : '';
    this.state = 'grind';
    this.grind = { rail: r, s: hit.s, u, slide, balance: (Math.random() - 0.5) * 0.15, balVel: 0, t: 0, startS: hit.s, minS: hit.s, maxS: hit.s };
    // la planche se cale sur le rail (le long, ou en travers pour un slide)
    const ry = Math.atan2(r.dir.x, r.dir.z) + (u < 0 ? Math.PI : 0);
    this.grind.baseYaw = slide ? ry + (wrap(this.yaw - ry) > 0 ? Math.PI / 2 : -Math.PI / 2) : ry;
    this.yaw = this.grind.baseYaw;
    this.fakie = false;
    this.grindBuffer = 0;
    this.grindTarget = null;
    this.tricks.grindStart(r, slide, dir);
    this.ev.emit('grind', { rail: r });
  }

  stepGrind(dt, input) {
    const g = this.grind, r = g.rail;
    g.t += dt;
    g.u += -GRAVITY * r.dir.y * dt;
    g.u *= 1 - 0.05 * dt;
    g.s += g.u * dt;
    g.minS = Math.min(g.minS, g.s); g.maxS = Math.max(g.maxS, g.s);
    // équilibre : il dérive de plus en plus, gauche / droite le corrige
    const diff = 1.2 + g.t * 0.35;
    if (this.assist) {
      // équilibre simple : il revient de lui-même au centre, gauche / droite l'aide ; ça ne se
      // corse qu'après quelques secondes
      const unstable = Math.max(0, g.t - 3) * 0.6;
      g.balVel += (g.balance * (unstable - 2.2) + (Math.random() - 0.5) * 0.9) * dt;
    } else g.balVel += (g.balance * diff * 2.2 + (Math.random() - 0.5) * 1.6) * dt / Math.max(0.7, this.stats.grip);
    g.balVel += input.state.x * 5.5 * dt;
    g.balVel *= 1 - 1.6 * dt;
    g.balance += g.balVel * dt;
    this.pos.set(r.a.x + r.dir.x * g.s, r.a.y + r.dir.y * g.s, r.a.z + r.dir.z * g.s);
    this.vel.copy(r.dir).multiplyScalar(g.u);
    this.tricks.updateGrind(dt);
    if (Math.abs(g.balance) > 1) { this.endGrind(false); this.bail('balance'); return; }
    if (g.s < 0 || g.s > r.len || Math.abs(g.u) < 0.4) {
      this.vel.y = Math.max(this.vel.y, 0) + 1.3;
      this.endGrind(false);
      this.enterAir(false, 'grindEnd');
    }
  }

  endGrind() {
    if (!this.grind) return;
    const g = this.grind;
    const covered = (g.maxS - g.minS) / g.rail.len;
    this.tricks.grindEnd(g.rail, covered);
    this.ev.emit('grindEnd', { rail: g.rail, covered });
    this.grind = null;
  }

  // ---------------------------------------------------------------------------------------------
  startManual(input) {
    if (!input || this.state !== 'ground') return;
    const dir = input.dir8();
    const nose = dir === 'n' || dir === 'ne' || dir === 'nw';
    this.manual = { nose, balance: (Math.random() - 0.5) * 0.1, balVel: 0, t: 0 };
    this.manualBuffer = 0;
    this.landGrace = 0;
    this.tricks.manualStart(nose);
  }

  stepManual(dt, input) {
    const m = this.manual;
    m.t += dt;
    const diff = 1.1 + m.t * 0.3;
    m.balVel += (m.balance * diff * 2.0 + (Math.random() - 0.5) * 1.4) * dt / Math.max(0.7, this.stats.grip);
    m.balVel -= input.state.y * 5 * dt;
    m.balVel *= 1 - 1.5 * dt;
    m.balance += m.balVel * dt;
    this.tricks.updateManual(dt);
    if (Math.abs(m.balance) > 1 || this.speed < 0.6) {
      if (Math.abs(m.balance) > 1) { this.manual = null; this.bail('manual'); }
      else this.endManual(true);
    }
  }

  endManual(bank) {
    if (!this.manual) return;
    this.manual = null;
    this.tricks.manualEnd();
    if (bank) this.landGrace = 0.15;
  }

  // ---------------------------------------------------------------------------------------------
  bail(reason) {
    if (this.state === 'bail') return;
    this.state = 'bail';
    this.bailTimer = 0;
    this.grind = null; this.manual = null;
    this.bailVel = this.vel.clone();
    this.tricks.bail(reason);
    this.ev.emit('bail', { reason, pos: this.pos.clone(), vel: this.vel.clone() });
  }

  updateBail(dt) {
    this.bailTimer += dt;
    // le corps glisse et s'arrête
    const T = this.terrain;
    this.vel.y -= GRAVITY * dt;
    this.vel.x *= 1 - 2.5 * dt; this.vel.z *= 1 - 2.5 * dt;
    let nx = this.pos.x + this.vel.x * dt, nz = this.pos.z + this.vel.z * dt, ny = this.pos.y + this.vel.y * dt;
    const h = T.height(nx, nz);
    if (h - ny > 0.5 && h > this.pos.y + 0.3) { nx = this.pos.x; nz = this.pos.z; this.vel.x = this.vel.z = 0; }
    if (ny < h) { ny = h; this.vel.y = 0; }
    this.pos.set(nx, ny, nz);
    this.normal.set(0, 1, 0);
    if (this.bailTimer > 1.9) this.respawn();
  }

  respawn() {
    const p = this.lastSafe.pos;
    this.reset(p.x, p.z, this.lastSafe.yaw);
    this.ev.emit('respawn', { pos: this.pos.clone() });
  }
}
