// Objectifs d'un run (ids stables : la boutique peut y rattacher un produit exclusif
// via le champ exclusive_unlock du catalogue, qui accepte l'id ou le libellé français).
import { OBJECTIVE_LABELS } from '../i18n.js';

export const OBJECTIVES = [
  { id: 'score-amateur', type: 'score', value: 15000 },
  { id: 'score-pro', type: 'score', value: 50000 },
  { id: 'score-sick', type: 'score', value: 120000 },
  { id: 'skate', type: 'letters' },
  { id: 'cassette', type: 'cassette' },
  { id: 'gap', type: 'gap', value: 1 },
  { id: 'combo-10k', type: 'combo', value: 10000 },
].map((o) => ({ ...o, labels: [OBJECTIVE_LABELS.fr[o.id], OBJECTIVE_LABELS.en[o.id]] }));

// paliers de score (points d'accroche pour les récompenses : codes promo, points fidélité…)
export const TIERS = [
  { id: 'bronze', score: 15000 },
  { id: 'silver', score: 50000 },
  { id: 'gold', score: 120000 },
];
