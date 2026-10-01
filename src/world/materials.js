// Matières PBR à partir des textures CC0 Poly Haven préparées dans public/tex/<nom>/<res>/ :
// diff (couleur), nor (normale OpenGL), arm (R = occlusion, G = rugosité, B = métal).
import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cache = new Map();

export class MaterialBank {
  constructor({ assetBase, quality, renderer }) {
    this.base = assetBase;
    this.res = quality.tier === 'high' ? '1k' : '512';
    this.aniso = Math.min(8, renderer ? renderer.capabilities.getMaxAnisotropy() : 4);
    this.pending = [];
  }

  tex(name, map, { srgb = false, repeat = 1, res } = {}) {
    const url = `${this.base}tex/${name}/${res || this.res}/${map}.webp`;
    const key = url + '|' + repeat;
    if (cache.has(key)) return cache.get(key);
    const t = loader.load(url, undefined, undefined, () => {});
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    t.anisotropy = this.aniso;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    cache.set(key, t);
    return t;
  }

  // matière standard texturée ; les UV des maillages sont en mètres (scale = tuiles par mètre)
  pbr(name, { color = '#ffffff', scale = 0.33, metal = false, normalScale = 1, roughness = 1, minRough = 0.62, res, envMapIntensity = 1, ...rest } = {}) {
    const r = res;
    const m = new THREE.MeshStandardMaterial({
      color,
      map: this.tex(name, 'diff', { srgb: true, repeat: scale, res: r }),
      normalMap: this.tex(name, 'nor', { repeat: scale, res: r }),
      roughnessMap: this.tex(name, 'arm', { repeat: scale, res: r }),
      aoMap: this.tex(name, 'arm', { repeat: scale, res: r }),
      metalnessMap: metal ? this.tex(name, 'arm', { repeat: scale, res: r }) : null,
      metalness: metal ? 1 : 0,
      roughness,
      envMapIntensity,
      ...rest,
    });
    m.normalScale.set(normalScale, normalScale);
    // béton : jamais miroir (le soleil rasant ferait des taches de lumière irréalistes)
    if (minRough > 0) {
      m.onBeforeCompile = (sh) => {
        sh.fragmentShader = sh.fragmentShader.replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
          roughnessFactor = max( roughnessFactor, ${minRough.toFixed(2)} );`);
      };
      m.customProgramCacheKey = () => 'minr' + minRough.toFixed(2);
    }
    return m;
  }

  // tissus des vêtements (UV cylindriques en mètres, motif fin)
  fabric(name, { color = '#ffffff', scale = 7, sheen = 0.6, roughness = 0.9, normalScale = 0.9 } = {}) {
    const m = new THREE.MeshPhysicalMaterial({
      color,
      map: this.tex(name, 'diff', { srgb: true, repeat: scale, res: '512' }),
      normalMap: this.tex(name, 'nor', { repeat: scale, res: '512' }),
      roughnessMap: this.tex(name, 'arm', { repeat: scale, res: '512' }),
      roughness,
      sheen, sheenRoughness: 0.7, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.4),
    });
    m.normalScale.set(normalScale, normalScale);
    // le grain du tissu, pas sa couleur d'origine : on désature la texture de couleur
    m.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', `
        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D( map, vMapUv );
          float lum = dot( sampledDiffuseColor.rgb, vec3( 0.299, 0.587, 0.114 ) );
          diffuseColor.rgb *= mix( vec3( 1.0 ), vec3( lum * 1.9 ), 0.55 );
        #endif`);
    };
    m.customProgramCacheKey = () => 'fabric';
    return m;
  }
}
