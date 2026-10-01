// Catalogue de la boutique (contrat catalog.json de PROJECT.md) : chargement interchangeable
// et règles de jeu dérivées (emplacement, taille du profil, stats ludiques, déblocages).
import sample from './catalog.sample.json';

export async function loadCatalog({ catalog, catalogUrl, assetBase }) {
  if (catalog && catalog.products) return normalize(catalog);
  const urls = [catalogUrl, `${assetBase}catalog.json`].filter(Boolean);
  for (const u of urls) {
    try {
      const r = await fetch(u, { cache: 'no-cache' });
      if (r.ok) { const d = await r.json(); if (d && d.products && d.products.length) return normalize(d); }
    } catch (e) { /* on essaie la suite */ }
  }
  return normalize(sample);
}

const SLOT_GROUP = {
  head: 'clothes', top: 'clothes', bottom: 'clothes', feet: 'shoes',
  helmet: 'protection', knees: 'protection', elbows: 'protection', wrists: 'protection',
  deck: 'hardware', wheels: 'hardware', trucks: 'hardware', bearings: 'hardware', griptape: 'hardware',
  pack: 'looks',
};

function normalize(d) {
  const products = d.products.map((p) => ({
    ...p,
    group: SLOT_GROUP[p.slot] || 'clothes',
    colors: { primary: '#2a2a2e', secondary: '#141416', accent: '#C8FF2E', ...(p.colors || {}) },
    sizes: (p.sizes || []).map((s) => ({ ...s, stock: s.stock == null ? 99 : s.stock })),
    stats: { pop: 0, grip: 0, glisse: 0, ...(p.stats || {}) },
    pack_items: p.pack_items || [],
  }));
  const byId = new Map(products.map((p) => [p.id, p]));
  return { raw: d, products, byId, categories: d.categories || [], sample: !!d.sample };
}

// --- Tailles --------------------------------------------------------------------------------------
// Quel champ du profil s'applique à un produit, et quelle taille lui correspond.
const norm = (s) => String(s).replace(',', '.').replace(/["″]/g, '').replace(/\s*mm$/, '').trim().toUpperCase();

export function profileKeyFor(p) {
  if (p.slot === 'top' || (p.slot === 'pack' && p.cart_field === 'prodVar[1-1]' && p.sizes.some((s) => /^X?S$|^M$|^X*L$/.test(s.label)) && !['helmet', 'knees'].includes(p.slot))) return 'top';
  if (p.slot === 'bottom') return 'bottom';
  if (p.slot === 'feet') return 'shoe';
  if (['helmet', 'knees', 'elbows', 'wrists'].includes(p.slot)) return 'protect';
  if (p.slot === 'deck' || p.gabarit === 'complete') return 'deck';
  if (p.slot === 'trucks') return 'axle';
  return null;
}

// Taille équivalente : un bas en 36-46 depuis une taille XS-XXL, un axe depuis la largeur de planche.
const TOP_TO_FR = { XS: '36', S: '38', M: '40', L: '42', XL: '44', XXL: '46' };
const DECK_TO_AXLE = { '7.75': '139', '8.0': '139', '8': '139', '8.25': '149', '8.5': '149' };

export function wantedLabel(p, profile) {
  const sz = profile.sizes || {};
  let key = profileKeyFor(p);
  // packs de protections en S/M/L
  if (p.slot === 'pack' && p.sizes.length && p.sizes.every((s) => /^[SML]$/.test(s.label))) key = 'protect';
  if (!key) return p.sizes.length ? p.sizes[0].label : null;
  let want = key === 'axle' ? DECK_TO_AXLE[norm(sz.deck || '8.25')] : sz[key];
  if (key === 'bottom' && want && !/^\d+$/.test(want) && p.sizes.some((s) => /^\d+$/.test(s.label))) want = TOP_TO_FR[want] || want;
  return want;
}

// La taille à mettre au panier : celle du profil si dispo, sinon la plus proche en stock.
export function pickSize(p, profile) {
  if (!p.sizes.length) return { size: null, exact: true, available: true };
  const want = wantedLabel(p, profile);
  const labels = p.sizes.map((s) => norm(s.label));
  let i = want != null ? labels.indexOf(norm(want)) : -1;
  if (i < 0 && p.sizes.length === 1) i = 0;
  if (i < 0) {
    // valeur numérique la plus proche (pointure, largeur, axe)
    const w = parseFloat(norm(want || ''));
    if (!isNaN(w)) {
      let best = 0, bd = Infinity;
      labels.forEach((l, k) => { const d = Math.abs(parseFloat(l) - w); if (d < bd) { bd = d; best = k; } });
      i = best;
    } else i = Math.floor(p.sizes.length / 2);
  }
  if (p.sizes[i].stock > 0) return { size: p.sizes[i], exact: norm(p.sizes[i].label) === norm(want || p.sizes[i].label), available: true };
  // en rupture : la plus proche disponible
  for (let d = 1; d < p.sizes.length; d++) {
    for (const k of [i + d, i - d]) if (p.sizes[k] && p.sizes[k].stock > 0) return { size: p.sizes[k], exact: false, available: true, wanted: p.sizes[i].label };
  }
  return { size: p.sizes[i], exact: false, available: false, wanted: p.sizes[i].label };
}

export const inStock = (p) => !p.sizes.length || p.sizes.some((s) => s.stock > 0);

// --- Stats ludiques (0-10 dans le catalogue) -> multiplicateurs doux du jeu -------------------
export function loadoutStats(cat, loadout) {
  const ids = Object.values(loadout || {}).filter(Boolean);
  const prods = ids.map((id) => cat.byId.get(id)).filter(Boolean);
  const avg = (k, slots) => {
    const v = prods.filter((p) => slots.includes(p.slot) && p.stats[k] > 0).map((p) => p.stats[k]);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 6;
  };
  const pop = avg('pop', ['deck', 'wheels', 'trucks']);
  const grip = avg('grip', ['griptape', 'deck', 'trucks', 'wheels', 'feet']);
  const glisse = avg('glisse', ['wheels', 'bearings', 'trucks', 'deck']);
  // 6/10 = neutre ; 10/10 = +8 %
  const f = (x) => 1 + (x - 6) * 0.02;
  return { pop: f(pop), grip: f(grip), glisse: f(glisse), raw: { pop, grip, glisse } };
}

// Le produit est-il débloqué ? exclusive_unlock = libellé d'objectif (voir game/run.js).
export function isUnlocked(p, unlockedObjectives, objectives) {
  if (!p.exclusive_unlock) return true;
  const key = String(p.exclusive_unlock).toLowerCase();
  return objectives.some((o) => unlockedObjectives.includes(o.id) && (o.id === key || o.labels.some((l) => l.toLowerCase() === key)));
}
