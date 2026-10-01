// Écran « Spawn point » : création du skater (silhouette, peau, coiffure, tenue) et de ses tailles.
// Toute modification s'applique en direct au perso 3D ; « Drop in » lance la session.
import { h } from './dom.js';
import { t } from '../i18n.js';
import { SKIN_TONES, HAIR_COLORS, SIZE_OPTIONS } from '../config.js';
import { PARTS } from '../player/skater.js';
import { inStock } from '../data/catalog.js';

const SLOTS = [
  { slot: 'top', key: 'outfit.top' },
  { slot: 'bottom', key: 'outfit.bottom' },
  { slot: 'feet', key: 'outfit.feet' },
  { slot: 'head', key: 'outfit.head', optional: true },
  { slot: 'deck', key: 'outfit.deck' },
  { slot: 'wheels', key: 'outfit.wheels' },
];

export function createSpawnScreen({ profile, catalog, onChange, onDropIn, isUnlocked }) {
  let tab = 'rider';
  const root = h('section', { class: 'rs-spawn', 'aria-label': t('spawn.title') });
  const panel = h('div', { class: 'rs-panel' });
  const nametag = h('div', { class: 'rs-nametag', 'aria-hidden': 'true' });
  const body = h('div', { class: 'rs-tabbody' });
  const tabs = h('div', { class: 'rs-tabs', role: 'tablist' });
  const tabDefs = [['rider', 'tab.rider'], ['outfit', 'tab.outfit'], ['sizes', 'tab.sizes']];
  for (const [id, key] of tabDefs) {
    tabs.appendChild(h('button', { class: 'rs-tab', role: 'tab', 'aria-selected': String(tab === id), 'data-tab': id, onClick: () => { tab = id; render(); } }, t(key)));
  }
  const headP = h('p', {}, t('spawn.sub'));
  panel.append(
    h('div', { class: 'rs-panel-head' }, h('h2', {}, t('spawn.title')), headP),
    tabs, body,
  );
  const dropBtn = h('button', { class: 'rs-btn rs-btn--acid rs-btn--big', onClick: () => onDropIn() }, t('dropin'));
  root.append(panel, nametag, h('div', { class: 'rs-spawn-foot' }, dropBtn));

  const changed = (what) => { onChange(profile, what); render(); };

  function opts(list, current, set, { swatch = false, disabled = () => false, label = (x) => x } = {}) {
    return h('div', { class: 'rs-row', role: 'radiogroup' }, list.map((v) => h('button', {
      class: swatch ? 'rs-swatch' : 'rs-opt', role: 'radio', 'aria-checked': String(v === current),
      'aria-label': swatch ? v : null, style: swatch ? { background: v } : null,
      disabled: disabled(v) || null,
      onClick: () => { set(v); },
    }, swatch ? '' : label(v))));
  }

  // produits proposés pour un emplacement : bon genre, en stock, débloqués
  function choices(slot) {
    return catalog.products.filter((p) => p.slot === slot
      && (p.gender === 'unisex' || p.gender === profile.gender)
      && inStock(p) && isUnlocked(p));
  }

  function picker(slot, key, optional) {
    const list = choices(slot);
    if (!list.length) return null;
    const ids = optional ? [null, ...list.map((p) => p.id)] : list.map((p) => p.id);
    let i = ids.indexOf(profile.loadout[slot] ?? null);
    if (i < 0) i = 0;
    const cur = ids[i] != null ? catalog.byId.get(ids[i]) : null;
    const step = (d) => { const j = (i + d + ids.length) % ids.length; profile.loadout[slot] = ids[j]; changed('outfit'); };
    const dots = cur ? h('span', { class: 'rs-dots' }, [cur.colors.primary, cur.colors.secondary, cur.colors.accent].map((c) => h('i', { style: { background: c } }))) : null;
    return h('div', {},
      h('span', { class: 'rs-label' }, t(key)),
      h('div', { class: 'rs-picker' },
        h('button', { 'aria-label': '◀ ' + t(key), onClick: () => step(-1) }, '‹'),
        h('div', { class: 'rs-pick', 'aria-live': 'polite' },
          h('b', {}, cur ? cur.name.split(',')[0] : t('outfit.none')),
          h('span', {}, dots, cur ? `${cur.price_ttc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}` : '')),
        h('button', { 'aria-label': t(key) + ' ▶', onClick: () => step(1) }, '›')));
  }

  function render() {
    for (const b of tabs.children) { b.setAttribute('aria-selected', String(b.dataset.tab === tab)); b.textContent = t(tabDefs.find((d) => d[0] === b.dataset.tab)[1]); }
    headP.textContent = t('spawn.sub'); dropBtn.textContent = t('dropin');
    body.innerHTML = '';
    nametag.innerHTML = '';
    nametag.append(h('small', {}, 'RIDER'), profile.name || 'Rider');
    if (tab === 'rider') {
      const P = PARTS[profile.gender];
      body.append(
        h('label', { class: 'rs-field' }, h('span', { class: 'rs-label' }, t('rider.name')),
          h('input', { class: 'rs-input', maxlength: '14', value: profile.name || '', placeholder: 'Rider', autocomplete: 'off', spellcheck: 'false',
            onInput: (e) => { profile.name = e.target.value.replace(/[<>]/g, '').slice(0, 14); onChange(profile, 'name'); nametag.lastChild.textContent = profile.name || 'Rider'; } })),
        h('fieldset', { class: 'rs-field' }, h('legend', {}, t('rider.gender')),
          opts(['women', 'men'], profile.gender, (v) => { profile.gender = v; profile.head = PARTS[v].heads[0].id; changed('gender'); }, { label: (v) => t('rider.' + v) })),
        h('fieldset', { class: 'rs-field' }, h('legend', {}, t('rider.skin')),
          opts(SKIN_TONES, profile.skin, (v) => { profile.skin = v; changed('skin'); }, { swatch: true })),
        h('fieldset', { class: 'rs-field' }, h('legend', {}, t('rider.hair')),
          opts(P.heads.map((x) => x.id), profile.head, (v) => { profile.head = v; changed('head'); }, { label: (v) => P.heads.find((x) => x.id === v).label })),
        h('fieldset', { class: 'rs-field' }, h('legend', {}, t('rider.hairColor')),
          opts(HAIR_COLORS, profile.hairColor, (v) => { profile.hairColor = v; changed('hair'); }, { swatch: true })),
      );
    } else if (tab === 'outfit') {
      for (const s of SLOTS) { const el = picker(s.slot, s.key, s.optional); if (el) body.append(el); }
    } else {
      const S = profile.sizes;
      const set = (k) => (v) => { S[k] = v; changed('sizes'); };
      body.append(
        h('fieldset', { class: 'rs-field' }, h('legend', {}, t('sizes.top')), opts(SIZE_OPTIONS.top, S.top, set('top'))),
        h('fieldset', { class: 'rs-field' }, h('legend', {}, t('sizes.bottom')), opts(['36', '38', '40', '42', '44', '46'], S.bottom === 'M' ? '40' : S.bottom, set('bottom'))),
        h('fieldset', { class: 'rs-field' }, h('legend', {}, t('sizes.shoe')), opts(SIZE_OPTIONS.shoe, S.shoe, set('shoe'))),
        h('fieldset', { class: 'rs-field' }, h('legend', {}, t('sizes.protect')), opts(SIZE_OPTIONS.protect, S.protect, set('protect'))),
        h('fieldset', { class: 'rs-field' }, h('legend', {}, t('sizes.deck')), opts(SIZE_OPTIONS.deck, S.deck, set('deck'), { label: (v) => v.replace('.', ',') + '"' })),
        h('p', { class: 'rs-hint' }, t('sizes.hint')),
      );
    }
  }
  render();
  return { el: root, render, focus: () => dropBtn.focus() };
}
