// Catalogue -> dessin : chaque produit de catalog.json devient une pièce dessinable (gabarit,
// couleurs primary/secondary/accent, motif déduit du nom). Un nouveau produit du même gabarit
// se dessine sans toucher au code.
import raw from './catalog.json';
import { normalizeCatalog } from './catalog-norm.js';

export const CAT = normalizeCatalog(raw);

// motif imprimé / brodé, déduit du nom (ordre important)
export function motifOf(p) {
  const n = String(p.name || '').toLowerCase();
  if (/game ?over|pixel/.test(n)) return 'pixel';
  if (/halog|réfléchiss|reflechiss/.test(n)) return 'reflect';
  if (/night/.test(n)) return 'night';
  if (/cône|cone/.test(n)) return 'cone';
  if (/lampadaire|spawn point/.test(n)) return 'lamp';
  if (/respawn/.test(n)) return 'R';
  return p.slot === 'deck' ? 'stripes' : null;
}

const C = (p) => [p.colors.primary, p.colors.secondary, p.colors.accent];

// Pièce dessinable à partir d'un produit
export function pieceOf(p) {
  if (!p) return null;
  const g = p.gabarit, sp = p.specs || {};
  const base = { id: p.id, c: C(p), motif: motifOf(p) };
  switch (p.slot) {
    case 'top': return { ...base, g: g === 'hoodie' ? (sp.crop ? 'hoodiecrop' : 'hoodie') : g === 'jacket' ? 'jacket' : (sp.crop ? 'crop' : 'tshirt') };
    case 'bottom': return { ...base, g: g === 'shorts' ? 'shorts' : g === 'cargo' ? 'cargo' : 'jeans', hw: p.gender === 'women' || sp.fit === 'wide', wide: sp.fit === 'wide' || p.gender === 'men' };
    case 'head': return { ...base, g: g === 'beanie' ? 'beanie' : 'cap' };
    case 'feet': return { ...base, g: g === 'sneakers_high' ? 'high' : 'low' };
    default: return base;
  }
}

// emplacements portés (un produit par emplacement) ; « pack » = look complet
export const WEAR_SLOTS = ['head', 'helmet', 'top', 'bottom', 'feet', 'knees', 'elbows', 'wrists', 'deck', 'wheels', 'trucks', 'bearings', 'griptape'];
export const PROTECT_SLOTS = ['helmet', 'knees', 'elbows', 'wrists'];
export const MOUNT_SLOTS = ['trucks', 'bearings', 'griptape'];

export const SKINS = [
  { s: '#EDB990', sh: '#CF936B', hair: '#3A2216', lip: '#B86A5A' },
  { s: '#8B593A', sh: '#6B4128', hair: '#140E0B', lip: '#5E3324' },
];

// Look complet pour le dessin à partir de la tenue (emplacement -> id produit)
export function lookOf(out, bag = 0) {
  const sk = SKINS[out.skin] || SKINS[0];
  const L = { gender: out.gender === 'm' ? 'm' : 'f', skin: sk.s, skinSh: sk.sh, hair: sk.hair, lip: sk.lip, bag };
  for (const s of WEAR_SLOTS) L[s] = out.wear && out.wear[s] ? pieceOf(CAT.byId.get(out.wear[s])) : null;
  if (L.helmet) L.head = null; // le casque remplace casquette et bonnet
  return L;
}

// Le panier (ou une liste d'articles) porté : une pièce par emplacement, le reste au sac à dos
export function dressFromItems(items) {
  const wear = {}, bag = [];
  for (const it of items) {
    const p = CAT.byId.get(Number(it.id)); if (!p) continue;
    const parts = p.slot === 'pack' && p.pack_items.length ? p.pack_items : [p.id];
    const qty = Math.max(1, Math.min(20, Number(it.qty) || 1));
    for (let n = 0; n < qty; n++) for (const pid of parts) {
      const q = CAT.byId.get(pid); if (!q) continue;
      if (WEAR_SLOTS.includes(q.slot) && !wear[q.slot]) wear[q.slot] = q.id; else bag.push(q.id);
    }
  }
  return { wear, bag };
}

// Nom court lisible : type + nom propre (« Tee Spawn Point », « Plateau Game Over », « Roues Street 52 mm »)
const TYPE = { tshirt: 'Tee', hoodie: 'Hoodie', jacket: 'Veste', jeans: 'Jean', cargo: 'Cargo', shorts: 'Short', cap: 'Casquette', beanie: 'Bonnet', sneakers_low: '', sneakers_high: '',
  helmet: 'Casque', kneepads: 'Genouillères', elbowpads: 'Coudières', wristguards: 'Poignets', deck: 'Plateau', wheels: 'Roues', trucks: 'Trucks', bearings: 'Roulements', griptape: 'Grip', look: 'Look', complete: 'Skate complet' };
const GENERIC = /^(t-shirt|tee|crop|femme|homme|oversize|skate|de|hoodie|court|veste|coach|jean|baggy|large|pantalon|cargo|short|casquette|5|pans|bonnet|côtelé|docker|sneakers|basses|montantes|casque|genouillères|coudières|protège-poignets|plateau|roues|trucks|roulements|grip|look|complet|kit|protections|pack)$/i;
export const shortName = (p) => {
  const words = String(p.name).split(/[,:]/)[0].split(/\s+/);
  let i = 0; while (i < words.length - 1 && GENERIC.test(words[i])) i++;
  const rest = []; for (const w of words.slice(i)) { if (rest.length && /^[a-zà-ÿ]/.test(w) && !/^(mm|à|neuf|in)$/i.test(w)) break; rest.push(w); if (rest.length >= 3) break; }
  let type = TYPE[p.gabarit] ?? ''; if (p.gabarit === 'tshirt' && p.specs && p.specs.crop) type = 'Crop'; if (p.slot === 'pack' && /kit/i.test(p.name)) type = 'Kit'; if (p.slot === 'pack' && /^pack/i.test(p.name)) type = 'Pack';
  return ((type ? type + ' ' : '') + rest.join(' ')).trim();
};
