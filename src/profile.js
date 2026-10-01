// Profil du joueur, gardé dans le navigateur : perso, tailles (profil d'achat), tenue portée,
// records, objectifs réussis, préférences. Lecture / écriture toujours protégées (storage.js).
import { load, save } from './core/storage.js';

const DEFAULT = {
  v: 1,
  created: false,
  name: '',
  gender: 'women',
  head: 'Casual_Head',
  skin: '#C98E62',
  hairColor: '#4A2F1E',
  socks: '#F3F0E8',
  stance: 'regular',
  sizes: { top: 'M', bottom: '40', shoe: '40', protect: 'M', deck: '8.25' },
  // emplacement -> id produit
  loadout: { top: 1, bottom: 9, head: 11, feet: 14, deck: 20, wheels: 24, trucks: 25, griptape: 27, bearings: 26 },
  best: [], // [{ score, date, name }]
  unlocked: [], // ids d'objectifs réussis (une fois suffit pour débloquer)
  tutorialDone: false,
  muted: false,
  music: true,
  daily: {}, // { 'AAAA-MM-JJ': meilleur score du défi }
  stats: { runs: 0, bails: 0, tricks: 0 },
};

export function loadProfile() {
  const p = load('profile', null);
  if (!p || typeof p !== 'object') return structuredClone(DEFAULT);
  return {
    ...structuredClone(DEFAULT), ...p,
    sizes: { ...DEFAULT.sizes, ...(p.sizes || {}) },
    loadout: { ...DEFAULT.loadout, ...(p.loadout || {}) },
    stats: { ...DEFAULT.stats, ...(p.stats || {}) },
  };
}

export function saveProfile(p) { return save('profile', p); }

// look complet pour le skater à partir du profil et du catalogue
export function lookFromProfile(p, cat) {
  const P = (slot) => (p.loadout[slot] ? cat.byId.get(p.loadout[slot]) || null : null);
  return {
    gender: p.gender, head: p.head, skin: p.skin, hairColor: p.hairColor, socks: p.socks,
    outfit: { top: P('top'), bottom: P('bottom'), head: P('head'), feet: P('feet'), helmet: P('helmet'), knees: P('knees'), elbows: P('elbows'), wrists: P('wrists') },
    board: { deck: P('deck'), wheels: P('wheels'), trucks: P('trucks'), griptape: P('griptape'), bearings: P('bearings') },
  };
}

export function recordScore(p, score, name) {
  p.best = [...(p.best || []), { score, date: new Date().toISOString().slice(0, 10), name: name || p.name || 'Rider' }]
    .sort((a, b) => b.score - a.score).slice(0, 5);
  return p.best;
}
