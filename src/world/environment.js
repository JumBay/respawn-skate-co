// Ciel et lumière : HDRI CC0 « sunset_jhbcentral » (Poly Haven) — un toit de ville au crépuscule.
// Le HDR 1k éclaire la scène (PMREM) ; une version JPEG plus fine sert de fond visible.
// Le soleil est retrouvé dans le HDR (pixel le plus lumineux) pour aligner la lumière directionnelle.
import * as THREE from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';

export function createEnvironment(scene, quality, { assetBase, renderer }) {
  const fogColor = new THREE.Color('#b9a0a6');
  scene.fog = new THREE.Fog(fogColor, 80, 420);
  scene.background = new THREE.Color('#8f7a8c');
  scene.backgroundIntensity = 1;
  scene.environmentIntensity = 0.75;

  const hemi = new THREE.HemisphereLight('#c7c9ff', '#8a6f63', 0.35);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffcf9c', 3.6);
  sun.position.set(-40, 30, -50);
  scene.add(sun); scene.add(sun.target);
  const sunDir = new THREE.Vector3(-0.6, 0.35, -0.7).normalize();
  if (quality.shadows) {
    sun.castShadow = true;
    const s = sun.shadow;
    s.mapSize.set(2048, 2048);
    s.camera.near = 1; s.camera.far = 220;
    const e = 26; s.camera.left = -e; s.camera.right = e; s.camera.top = e; s.camera.bottom = -e;
    s.bias = -0.0004; s.normalBias = 0.03;
    s.radius = 2.5; s.blurSamples = 10;
  }

  // rotation du ciel : la ville la plus dense face au spawn
  const rotY = 2.2;
  scene.backgroundRotation.set(0, rotY, 0);
  scene.environmentRotation.set(0, rotY, 0);

  const ready = (async () => {
    const pmrem = new THREE.PMREMGenerator(renderer);
    try {
      const hdr = await new HDRLoader().setDataType(THREE.HalfFloatType).loadAsync(`${assetBase}env/sky_1k.hdr`);
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      // soleil = pixel le plus lumineux de la moitié haute
      const { data, width, height } = hdr.image;
      let best = 0, bx = 0, by = 0;
      const toF = (h) => THREE.DataUtils.fromHalfFloat(h);
      for (let y = 0; y < height / 2; y += 2) for (let x = 0; x < width; x += 2) {
        const i = (y * width + x) * 4;
        const l = toF(data[i]) * 0.3 + toF(data[i + 1]) * 0.6 + toF(data[i + 2]) * 0.1;
        if (l > best) { best = l; bx = x; by = y; }
      }
      // equirect de three : u = atan2(z, x) / 2PI + 0.5, v = asin(y) / PI + 0.5 (v vers le haut)
      const phi = (bx / width - 0.5) * Math.PI * 2;
      const lat = (0.5 - by / height) * Math.PI;
      // on tourne le ciel pour placer le couchant au nord-ouest (face au spawn, en contre-jour doux)
      const want = Math.atan2(-0.75, -0.66); // azimut voulu (z, x)
      const rot = phi - want;
      scene.backgroundRotation.set(0, rot, 0);
      scene.environmentRotation.set(0, rot, 0);
      const d = new THREE.Vector3(Math.cos(want) * Math.cos(lat), Math.sin(lat), Math.sin(want) * Math.cos(lat));
      // soleil relevé (~32°) : des ombres franches et lisibles, la couleur reste celle du couchant
      d.y = Math.max(d.y, 0.62);
      sunDir.copy(d.normalize());
      scene.environment = pmrem.fromEquirectangular(hdr).texture;
      hdr.dispose();
    } catch (e) { console.warn('[respawn] HDR', e); }
    pmrem.dispose();
    new THREE.TextureLoader().load(`${assetBase}env/${quality.tier === 'high' ? 'sky_4k' : 'sky_2k'}.jpg`, (t) => {
      t.mapping = THREE.EquirectangularReflectionMapping;
      t.colorSpace = THREE.SRGBColorSpace;
      scene.background = t;
    });
  })();

  function follow(p) {
    sun.position.set(p.x + sunDir.x * 90, p.y + Math.max(25, sunDir.y * 90), p.z + sunDir.z * 90);
    sun.target.position.set(p.x, p.y, p.z);
  }

  return { follow, sun, hemi, ready, sunDir };
}
