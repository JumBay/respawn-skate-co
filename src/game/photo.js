// Mode photo : scène et pose figées, caméra fixée. Sert à juger le rendu capture par capture
// (?photo=ride-back, ride-34, ollie, grind, bowl, side, front, back) et aux cartes de partage.
import * as THREE from 'three';
import { dirFromYaw } from '../player/controller.js';

export const PHOTOS = {
  // ride de dos, caméra de jeu
  'ride-back': { x: -5.5, z: 19, yaw: Math.PI, speed: 8, st: { crouch: 0.15 }, cam: 'game' },
  // ride de 3/4 avant, caméra basse
  'ride-34': { x: -6, z: 13, yaw: Math.PI * 0.92, speed: 8, st: { crouch: 0.2 }, cam: { az: 2.3, dist: 3.6, h: 1.0, look: 0.8 } },
  // ollie au-dessus du plat devant la funbox
  ollie: { x: -6.5, z: 10, yaw: Math.PI, speed: 7, y: 0.75, air: true, st: { crouch: 0, air: true }, cam: { az: -1.15, dist: 3.6, h: 0.9, look: 0.9 } },
  // air au-dessus du bowl (indy), caméra basse dans le bowl
  bowl: { x: 24, z: -5.0, yaw: -1.0, speed: 6, yAbs: 1.7, air: true, st: { crouch: 0, air: true, grab: { pose: 'indy', name: 'Indy' } }, cam: { pos: [21.6, -0.9, -8.9], look: [24.2, 1.7, -5.0], fov: 55 } },
  // grind sur le rail plat
  grind: { x: -16, z: 6, yaw: Math.PI, speed: 6, yAbs: 0.48, st: { crouch: 0.15, grind: true }, cam: { az: 2.0, dist: 3.4, h: 0.6, look: 0.9 } },
  // pose de profil / face / dos (mise au point)
  side: { x: 0, z: 22, yaw: Math.PI, speed: 0, st: { crouch: 0.1 }, cam: { az: Math.PI / 2, dist: 2.6, h: 0.9, look: 0.85 } },
  front: { x: 0, z: 22, yaw: Math.PI, speed: 0, st: { crouch: 0.1 }, cam: { az: Math.PI, dist: 2.8, h: 1.0, look: 0.85 } },
  back: { x: 0, z: 22, yaw: Math.PI, speed: 0, st: { crouch: 0.1 }, cam: { az: 0, dist: 2.8, h: 1.2, look: 0.85 } },
  top: { x: 0, z: 22, yaw: Math.PI, speed: 0, st: { crouch: 0.1 }, cam: { az: 0.01, dist: 0.3, h: 3.2, look: 0 } },
};

export function applyPhoto(game, name) {
  const P = PHOTOS[name];
  if (!P) return false;
  const c = game.ctrl;
  c.reset(P.x, P.z, P.yaw);
  if (P.y) c.pos.y += P.y;
  if (P.yAbs != null) c.pos.y = P.yAbs;
  const f = dirFromYaw(P.yaw);
  c.vel.copy(f).multiplyScalar(P.speed);
  c.state = P.air ? 'air' : 'ground';
  c.speed = P.speed;
  game.photo = { name, st: { speed: P.speed, ...P.st } };
  for (const col of game.park.collectibles) col.obj.visible = false;
  game.cam.yaw = P.yaw;
  if (P.cam === 'game') {
    game.cameraOverride = null;
    game.snapCamera();
    game.cameraOverride = () => {};
  } else {
    const k = P.cam;
    if (k.pos) {
      game.cameraOverride = (cam) => {
        cam.position.set(...k.pos); cam.lookAt(new THREE.Vector3(...k.look));
        if (cam.fov !== (k.fov || 50)) { cam.fov = k.fov || 50; cam.updateProjectionMatrix(); }
      };
      return true;
    }
    game.cameraOverride = (cam) => {
      // az : angle autour du skater, mesuré depuis l'arrière (0 = derrière, PI/2 = côté orteils)
      const a = P.yaw + Math.PI + k.az;
      const p = c.pos;
      cam.position.set(p.x + Math.sin(a) * k.dist, p.y + k.h, p.z + Math.cos(a) * k.dist);
      cam.lookAt(new THREE.Vector3(p.x, p.y + k.look, p.z));
      if (cam.fov !== 50) { cam.fov = 50; cam.updateProjectionMatrix(); }
    };
  }
  return true;
}
