// Le shop dans le jeu : catalogue en « objets de jeu », essayage en direct sur le skater,
// stats ludiques, tailles du profil (épuisées grisées), ajout au panier, achat du look porté,
// exclusifs verrouillés derrière un objectif.
import { h, icon } from './dom.js';
import { t, price, getLang, OBJECTIVE_LABELS } from '../i18n.js';
import { pickSize, inStock } from '../data/catalog.js';

const CATS = [
  ['all', 'shop.all', () => true],
  ['clothes', 'shop.clothes', (p) => p.group === 'clothes'],
  ['shoes', 'shop.shoes', (p) => p.group === 'shoes'],
  ['protection', 'shop.protection', (p) => p.group === 'protection'],
  ['hardware', 'shop.hardware', (p) => p.group === 'hardware'],
  ['looks', 'shop.looksTab', (p) => p.group === 'looks'],
];
const WEARABLE = ['top', 'bottom', 'head', 'feet', 'helmet', 'knees', 'elbows', 'wrists', 'deck', 'wheels', 'trucks', 'griptape', 'bearings'];

export function createShop({ catalog, profile, bridge, isUnlocked, unlockGoal, onTry, onClose, toast }) {
  let cat = 'all', sel = null, chosen = null;
  const list = h('div', { class: 'rs-products' });
  const cats = h('div', { class: 'rs-cats', role: 'tablist' });
  const detail = h('div', { class: 'rs-detail' });
  const title = h('h2', {}, t('shop.title'));
  const closeBtn = h('button', { class: 'rs-chip', onClick: () => onClose() }, icon('close'), h('span', { class: 'rs-chip-label' }, t('shop.close')));
  const head = h('div', { class: 'rs-panel-head' }, title, closeBtn);
  head.style.display = 'flex'; head.style.alignItems = 'center'; head.style.justifyContent = 'space-between'; head.style.gap = '10px';
  const scroller = h('div', { class: 'rs-tabbody' }, list);
  const panel = h('div', { class: 'rs-panel', role: 'dialog', 'aria-label': t('shop.title') }, head, cats, scroller, detail);
  const el = h('section', { class: 'rs-shop' }, h('div', { class: 'rs-shop-stage', onClick: () => onClose() }), panel);

  const lockedNow = (p) => !isUnlocked(p);
  const fits = (p) => p.gender === 'unisex' || !p.gender || p.gender === profile.gender || p.slot === 'pack';

  function renderCats() {
    cats.innerHTML = '';
    for (const [id, key, f] of CATS) {
      if (id !== 'all' && !catalog.products.some(f)) continue;
      cats.append(h('button', { class: 'rs-opt', role: 'tab', 'aria-selected': String(cat === id), 'aria-checked': String(cat === id), onClick: () => { cat = id; render(); } }, t(key)));
    }
  }

  function card(p) {
    const locked = lockedNow(p), out = !inStock(p);
    const worn = Object.values(profile.loadout).includes(p.id);
    const b = h('button', { class: 'rs-prod' + (sel === p ? ' rs-sel' : ''), onClick: () => select(p) },
      h('img', { src: p.images && p.images[0], alt: '', loading: 'lazy', decoding: 'async', crossorigin: 'anonymous' }),
      h('div', { class: 'rs-pname' }, p.name.split(',')[0]),
      h('div', { class: 'rs-price' }, price(p.price_ttc)));
    if (out) b.append(h('span', { class: 'rs-badge' }, t('shop.outOfStock')));
    else if (p.exclusive_unlock) b.append(h('span', { class: 'rs-badge rs-limited' }, 'EXCLU'));
    else if (p.badge === 'new') b.append(h('span', { class: 'rs-badge rs-new' }, getLang() === 'en' ? 'NEW' : 'NOUVEAU'));
    if (worn) b.append(h('span', { class: 'rs-badge', style: { left: 'auto', right: '12px', background: 'var(--acid)' } }, '✓'));
    if (locked) b.append(h('div', { class: 'rs-lock' }, '🔒 ' + unlockGoal(p)));
    return b;
  }

  function select(p) {
    sel = p;
    const pick = pickSize(p, profile);
    chosen = pick.size ? pick.size.label : null;
    // essayage immédiat si l'objet se porte
    if (!lockedNow(p) && (WEARABLE.includes(p.slot) || p.slot === 'pack')) onTry(p, false);
    render();
  }

  function renderDetail() {
    detail.innerHTML = '';
    if (!sel) { detail.classList.add('rs-hidden'); return; }
    detail.classList.remove('rs-hidden');
    const p = sel, locked = lockedNow(p);
    const st = p.stats || {};
    const stats = ['pop', 'grip', 'glisse'].filter((k) => st[k] > 0);
    const sizes = p.sizes.length ? h('div', { class: 'rs-row', role: 'radiogroup', 'aria-label': t('shop.yourSize') }, p.sizes.map((s) => h('button', {
      class: 'rs-opt', role: 'radio', 'aria-checked': String(s.label === chosen), disabled: s.stock <= 0 || null,
      title: s.stock <= 0 ? t('shop.outOfStock') : null,
      onClick: () => { chosen = s.label; renderDetail(); },
    }, String(s.label).replace('.', ',')))) : null;
    const pick = pickSize(p, profile);
    const swap = p.sizes.length && !pick.exact && pick.available && pick.wanted ? h('p', { class: 'rs-hint' }, t('shop.sizeSwap', { want: pick.wanted, got: pick.size.label })) : null;
    const add = h('button', { class: 'rs-btn rs-btn--acid', disabled: (locked || !inStock(p)) || null, onClick: async () => {
      add.disabled = true;
      const r = await bridge.addToCart(p.id, chosen, profile);
      add.disabled = false;
      if (r.ok) toast(`${t('shop.added')} · ${p.name.split(',')[0]}${r.size ? ' · ' + r.size : ''}${r.swapped ? ' (' + t('shop.sizeSwap', r.swapped) + ')' : ''}`);
      else toast(r.reason === 'out_of_stock' ? t('shop.outOfStock') : '⚠︎ ' + t('shop.cart'));
    } }, t('shop.add'));
    const wearable = WEARABLE.includes(p.slot) || p.slot === 'pack';
    const isWorn = Object.values(profile.loadout).includes(p.id);
    const wear = wearable ? h('button', { class: 'rs-btn rs-btn--ghost', disabled: locked || null, onClick: () => { onTry(p, true); render(); } }, isWorn ? t('shop.wear') + ' ✓' : t('shop.try')) : null;
    const view = h('a', { class: 'rs-btn rs-btn--ghost', href: p.url, target: '_top' }, t('shop.view'));
    detail.append(
      h('h3', {}, p.name),
      h('div', { class: 'rs-price' }, price(p.price_ttc)),
      locked ? h('div', { class: 'rs-unlock' }, '🔒 ' + t('shop.locked', { goal: unlockGoal(p) })) : null,
      stats.length ? h('div', { class: 'rs-stats', 'aria-label': t('shop.stats') }, h('span', { class: 'rs-label' }, t('shop.stats')),
        ...stats.map((k) => h('div', { class: 'rs-stat' }, h('span', {}, t('stat.' + k)), h('i', {}, h('b', { style: { width: `${st[k] * 10}%` } })), h('span', {}, String(st[k]))))) : null,
      sizes, swap,
      h('div', { class: 'rs-actions' }, add, wear, view),
    );
  }

  function render() {
    title.textContent = t('shop.title');
    closeBtn.lastChild.textContent = t('shop.close');
    renderCats();
    const f = CATS.find((c) => c[0] === cat)[2];
    list.innerHTML = '';
    const items = catalog.products.filter((p) => f(p) && fits(p))
      .sort((a, b) => (lockedNow(a) - lockedNow(b)) || (!inStock(a) - !inStock(b)));
    for (const p of items) list.append(card(p));
    // acheter le look porté (toujours en tête)
    const lookIds = Object.values(profile.loadout).filter(Boolean);
    const lookTotal = lookIds.map((id) => catalog.byId.get(id)).filter(Boolean).reduce((a, p) => a + p.price_ttc, 0);
    const lookBtn = h('button', { class: 'rs-btn rs-btn--pink', style: { gridColumn: '1 / -1' }, onClick: async () => {
      lookBtn.disabled = true;
      const res = await bridge.addLookToCart(lookIds.map((id) => ({ id })), profile);
      lookBtn.disabled = false;
      const ok = res.filter((r) => r.ok).length;
      const swaps = res.filter((r) => r.swapped).map((r) => `${r.product.name.split(' ')[0]} ${r.swapped.got}`);
      toast(`${t('shop.added')} · ${ok}/${res.length}${swaps.length ? ' · ' + swaps.join(', ') : ''}`);
    } }, `${t('shop.lookAdd')} · ${price(lookTotal)}`);
    list.prepend(lookBtn);
    renderDetail();
  }
  render();
  return { el, render, focus: () => closeBtn.focus(), select };
}

export function goalLabel(p, OBJECTIVES) {
  const L = OBJECTIVE_LABELS[getLang()];
  const key = String(p.exclusive_unlock || '').toLowerCase();
  const o = OBJECTIVES.find((x) => x.id === key || x.labels.some((l) => l.toLowerCase() === key));
  return o ? L[o.id] : p.exclusive_unlock;
}
