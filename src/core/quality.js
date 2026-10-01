// Détection de l'appareil et niveau de qualité (ombres, effets, densité de pixels).
export function detectQuality(opts = {}) {
  const mq = (q) => typeof matchMedia === 'function' && matchMedia(q).matches;
  const coarse = mq('(pointer: coarse)');
  const reducedMotion = mq('(prefers-reduced-motion: reduce)');
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const mem = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  let tier = 'high';
  if (coarse || small) tier = 'mid';
  if ((coarse && (mem <= 4 || cores <= 4))) tier = 'low';
  const forced = opts.quality || new URLSearchParams(location.search).get('quality');
  if (forced === 'low' || forced === 'mid' || forced === 'high') tier = forced;
  const prq = parseFloat(new URLSearchParams(location.search).get('pr'));
  return {
    tier,
    touch: coarse || ('ontouchstart' in window && !mq('(pointer: fine)')),
    reducedMotion,
    shadows: tier === 'high',
    bloom: tier === 'high',
    pixelRatio: prq > 0 ? prq : Math.min(window.devicePixelRatio || 1, tier === 'high' ? 2 : tier === 'mid' ? 1.5 : 1.25),
  };
}

export function hasWebGL2() {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch (e) {
    return false;
  }
}
