// Respawn Street Run (2D) : point d'entrée. Même API que le jeu 3D (src/main.js) pour que les scripts
// de la boutique changent à peine :
//   mount(el|null, { overlay, shopUrl, onEvent, rewards, tryOn, vestiaire, remember, zIndex, cartMode, autopilot })
//   -> { destroy, pause, openWardrobe, bridge, engine }    wasExited() / clearExited()
// Événements : opts.onEvent(nom, données) et window « respawn:<nom> » : ready, shopOpen, runStart,
// runEnd, lootCaught, tierReached, codeRevealed, exclusiveUnlocked, objectiveUnlocked, cartAdd,
// buyOutfit, share, pause, exit, destroy.
// Récompenses : AUCUN code promo dans ce bundle. opts.rewards est un fournisseur asynchrone
// injecté par la page ({ session(), claim() }, voir rewards.js) ; sans lui, mode démo « CODE-DEMO ».
import css from './styles.css?inline';
import { createEngine, RUN_LEN } from './engine.js';
import { createAudio } from './audio.js';
import { drawIcon, drawRider, drawBoardPlan, DISP, ACID, CRAIE, INK } from './draw.js';
import { CAT, pieceOf, lookOf, dressFromItems, shortName, SKINS, PROTECT_SLOTS, MOUNT_SLOTS } from './looks.js';
import { t, getLang, setLang, onLang, fmt, price } from './i18n.js';
import { createRewards, readChallenge, challengeLink } from './rewards.js';
import { createShopBridge } from '../../src/shop-bridge.js';
import { pickSize } from '../../src/data/catalog.js';
import { load, save } from '../../src/core/storage.js';

export const wasExited = () => !!load('exited', false);
export const clearExited = () => save('exited', false);
export const version = '2d-1';

const SIZE_OPTS = {
  top: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], bottom: ['36', '38', '40', '42', '44', '46'], shoe: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  protect: ['S', 'M', 'L'], deck: ['7.75', '8', '8.25', '8.5'],
};
const DEFAULT = { v: 1, gender: 'f', skin: 0, wear: { head: 11, top: 4, bottom: 8, feet: 14, deck: 20, wheels: 24 }, sizes: { top: 'M', bottom: '40', shoe: '40', protect: 'M', deck: '8.25' },
  best: 0, unlocked: [], muted: false, music: true, pid: '', rotateOk: false };
const ROWS = [
  { k: 'head', ids: () => CAT.products.filter((p) => p.slot === 'head').map((p) => p.id), none: true },
  { k: 'top', ids: () => byGender('top') }, { k: 'bottom', ids: () => byGender('bottom') }, { k: 'feet', ids: () => slotIds('feet') },
  { k: 'deck', ids: () => slotIds('deck') }, { k: 'wheels', ids: () => slotIds('wheels') },
  { k: 'protect', multi: PROTECT_SLOTS, ids: () => CAT.products.filter((p) => PROTECT_SLOTS.includes(p.slot)).map((p) => p.id) },
  { k: 'mount', multi: MOUNT_SLOTS, ids: () => CAT.products.filter((p) => MOUNT_SLOTS.includes(p.slot)).map((p) => p.id) },
  { k: 'looks', pack: true, ids: () => slotIds('pack') },
];
function slotIds(s) { return CAT.products.filter((p) => p.slot === s).map((p) => p.id); }
let profileRef = null;
function byGender(s) { const g = profileRef && profileRef.gender === 'm' ? 'men' : 'women'; return CAT.products.filter((p) => p.slot === s).sort((a, b) => (b.gender === g) - (a.gender === g)).map((p) => p.id); }
const ICON = {
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9l6 6M22 9l-6 6"/></svg>',
  shop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  play: '<svg viewBox="0 0 20 20"><path d="M5 3l11 7-11 7z" fill="currentColor"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V7a3 3 0 0 0-6 0z"/></svg>',
  logo: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 3h24l17 17v24L44 61H20L3 44V20z" fill="#C8FF2E" stroke="#141416" stroke-width="3"/><path d="M22 47V17h13.5c6.5 0 10.5 3.6 10.5 9.3 0 4.2-2.3 7.2-6.1 8.4L46.5 47h-7.6l-5.8-11.4H29V47zm7-17.3h6c2.6 0 4-1.3 4-3.4s-1.4-3.4-4-3.4h-6z" fill="#141416"/></svg>',
};
const TIER_COL = { bronze: '#E7A06A', silver: '#DDE3EA', gold: '#FFD54A' };
const TIER_RANK = { bronze: 1, silver: 2, gold: 3 };

function loadFonts() {
  try {
    if (document.fonts && document.fonts.check('12px Anton') && document.fonts.check('12px "Space Grotesk"')) return Promise.resolve();
    if (!document.querySelector('link[data-respawn-fonts]')) {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.respawnFonts = '1';
      l.href = 'https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;600;700&display=swap'; document.head.appendChild(l);
    }
    return Promise.all([document.fonts.load('40px Anton'), document.fonts.load('700 14px "Space Grotesk"')]).catch(() => {});
  } catch (e) { return Promise.resolve(); }
}

export async function mount(el, opts = {}) {
  const shopUrl = opts.shopUrl || '/';
  const context = opts.vestiaire ? 'vestiaire' : opts.tryOn ? 'tryOn' : 'home';
  const qs = new URLSearchParams(location.search);
  const autopilot = !!opts.autopilot || qs.has('auto');
  let layer = null, prevOverflow = null, destroyed = false;
  if (opts.overlay || !el) {
    layer = document.createElement('div'); layer.className = 'rs-layer rs-layer-2d'; layer.setAttribute('role', 'region'); layer.setAttribute('aria-label', 'Respawn Skate Co.');
    Object.assign(layer.style, { position: 'fixed', inset: '0', zIndex: String(opts.zIndex || 2147483000), background: '#141416' });
    (el || document.body).appendChild(layer); el = layer;
    prevOverflow = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden';
  } else if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  const host = document.createElement('div'); Object.assign(host.style, { position: 'absolute', inset: '0' }); el.appendChild(host);
  const shadow = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
  const fontsReady = loadFonts();

  const emit = (name, data = {}) => {
    try { if (opts.onEvent) opts.onEvent(name, data); } catch (e) { /* rien */ }
    try { window.dispatchEvent(new CustomEvent('respawn:' + name, { detail: data })); } catch (e) { /* rien */ }
  };

  // --- profil (localStorage protégé, préfixe respawn:) -----------------------------------------
  const stored = load('p2d', null) || {};
  const profile = { ...structuredClone(DEFAULT), ...stored, wear: { ...DEFAULT.wear, ...(stored.wear || {}) }, sizes: { ...DEFAULT.sizes, ...(stored.sizes || {}) } };
  if (!profile.pid) profile.pid = Math.random().toString(36).slice(2, 10);
  profileRef = profile;
  const saveProfile = () => save('p2d', profile);
  const exclusives = CAT.products.filter((p) => p.exclusive_unlock).map((p) => p.id);
  const isLocked = (id) => exclusives.includes(id) && !profile.unlocked.includes(id);
  const profileForBridge = () => ({ sizes: profile.sizes });
  const bridge = createShopBridge({ catalog: CAT, shopUrl, mode: opts.cartMode, onAdd: (d) => emit('cartAdd', d) });
  const rewards = createRewards(opts.rewards);
  const challenge = readChallenge();

  // --- DOM -------------------------------------------------------------------------------------
  const root = document.createElement('div'); root.className = 'r2d'; root.lang = getLang();
  const style = document.createElement('style'); style.textContent = css;
  shadow.append(style, root);
  const H = (tag, attrs = {}, ...kids) => { const n = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === 'class') n.className = v; else if (k === 'html') n.innerHTML = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2).toLowerCase(), v); else if (v != null && v !== false) n.setAttribute(k, v === true ? '' : v); } for (const c of kids.flat()) if (c != null && c !== false) n.append(c); return n; };
  const canvas = H('canvas', { class: 'scene', 'aria-label': 'Respawn Street Run' });
  const brand = H('div', { class: 'brand', html: ICON.logo + '<div><b>RESPAWN</b><span>SKATE CO.</span><em>Street Run</em></div>' });
  const top = H('div', { class: 'top' });
  const toastEl = H('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
  root.append(canvas, brand, top, toastEl);
  let toastT = 0;
  function toast(text, ms = 2600) { toastEl.textContent = text; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), ms); }

  const audio = createAudio({ muted: profile.muted, music: profile.music });
  const iconEl = (id, px = 56) => {
    const c = document.createElement('canvas'); const d = Math.min(window.devicePixelRatio || 1, 2); c.width = c.height = Math.round(px * d); const x = c.getContext('2d'); x.scale((px * d) / 100, (px * d) / 100);
    const g = x.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, '#ECE8DE'); g.addColorStop(1, '#CFC9BC'); x.fillStyle = g; x.beginPath(); if (x.roundRect) x.roundRect(0, 0, 100, 100, 18); else x.rect(0, 0, 100, 100); x.fill();
    const p = CAT.byId.get(id); if (p) { x.translate(8, 8); x.scale(0.84, 0.84); drawIcon(x, p, pieceOf(p), CAT.byId); } return c;
  };

  // --- état de la tenue ----------------------------------------------------------------------------
  let vestBag = 0, vestItems = null;
  const engine = createEngine(canvas, {
    audio, autopilot, exclusives: exclusives.filter((id) => !profile.unlocked.includes(id)), lootPool: CAT.products.filter((p) => !p.exclusive_unlock).map((p) => p.id),
    hooks: { onTick, onCombo, onHint, onEnd, onCatch },
  });
  const refreshLook = () => engine.setLook(lookOf(profile, context === 'vestiaire' && screen === 'vest' ? vestBag : 0));

  // --- barre du haut (toujours visible) ---------------------------------------------------------
  const langBtn = H('button', { class: 'chip', onClick: () => setLang(getLang() === 'fr' ? 'en' : 'fr') });
  const soundBtn = H('button', { class: 'chip', onClick: () => { profile.muted = !profile.muted; audio.setMuted(profile.muted); audio.unlock(); saveProfile(); renderTop(); } });
  const pauseBtn = H('button', { class: 'chip hidden', 'aria-label': t('pause'), html: ICON.pause, onClick: () => openPause() });
  const exitBtn = H('a', { class: 'chip chip-exit', href: shopUrl, onClick: (e) => { e.preventDefault(); exitToShop(); } });
  top.append(langBtn, soundBtn, pauseBtn, exitBtn);
  function renderTop() {
    langBtn.textContent = t('lang'); langBtn.setAttribute('aria-label', getLang() === 'fr' ? 'English' : 'Français');
    soundBtn.innerHTML = (profile.muted ? ICON.mute : ICON.sound) + '<span class="lbl">' + t(profile.muted ? 'soundOff' : 'soundOn') + '</span>';
    soundBtn.setAttribute('aria-pressed', String(!profile.muted)); pauseBtn.setAttribute('aria-label', t('pause'));
    const k = context === 'vestiaire' ? 'exitCart' : context === 'tryOn' ? 'exitProduct' : 'exit';
    exitBtn.innerHTML = ICON.shop + '<span class="lbl">' + t(k) + '</span><span class="lbs">' + (k === 'exit' ? t('exitShort') : t(k).split(' ').slice(-1)[0]) + '</span>'; exitBtn.setAttribute('aria-label', t(k));
  }
  function exitToShop() {
    if (opts.remember !== false && context === 'home') save('exited', true);
    emit('exit', { context });
    if (opts.onExit) opts.onExit(); else if (layer) api.destroy(); else location.href = shopUrl;
  }

  // --- garde-robe ---------------------------------------------------------------------------------
  const panel = H('aside', { class: 'panel', 'aria-label': t('kicker') });
  const keys = H('div', { class: 'keys' });
  root.append(panel, keys);
  function wornIds() { return Object.values(profile.wear).filter(Boolean); }
  function packComplete(pk) { return pk.pack_items.length && pk.pack_items.every((id) => wornIds().includes(id)); }
  // ce que « Acheter » met au panier : les looks complets portés remplacent leurs pièces
  function cartPlan() {
    let ids = wornIds().filter((id) => !isLocked(id));
    const packs = [];
    for (const pk of CAT.products.filter((p) => p.slot === 'pack' && p.pack_items.length)) if (pk.pack_items.every((id) => ids.includes(id))) { packs.push(pk.id); ids = ids.filter((id) => !pk.pack_items.includes(id)); }
    return [...packs, ...ids];
  }
  const total = (ids) => ids.reduce((a, id) => a + (CAT.byId.get(id) ? CAT.byId.get(id).price_ttc : 0), 0);
  function sizeLine(id) {
    const p = CAT.byId.get(id); if (!p) return { text: '', cls: '' };
    if (!p.sizes.length || (p.sizes.length === 1 && /unique/i.test(p.sizes[0].label))) return { text: t('sizeUnique'), cls: '' };
    const pk = pickSize(p, profileForBridge());
    if (!pk.available) return { text: t('sizeOut'), cls: 'warn' };
    if (!pk.exact && pk.wanted) return { text: t('sizeSwap', { w: pk.wanted, s: pk.size.label }), cls: 'warn' };
    return { text: t('sizeOk', { s: pk.size.label }), cls: 'ok' };
  }
  function chip(id, on, onClick) {
    const p = id ? CAT.byId.get(id) : null;
    const b = H('button', { class: 'chipp' + (on ? ' on' : '') + (p ? '' : ' none'), 'aria-pressed': String(!!on), title: p ? `${p.name} · ${price(p.price_ttc)}${isLocked(id) ? ' · ' + t('lockedHint') : ''}` : t('none'), onClick });
    if (p) b.append(iconEl(id, 44)); else b.append(H('span', { class: 'ph' }));
    b.append(H('span', { class: 'nm' }, p ? shortName(p) : t('none')), H('span', { class: 'pr' }, p ? price(p.price_ttc) : '—'));
    if (p && p.badge) b.append(H('span', { class: 'bd ' + p.badge }, { drop: 'Drop', limited: 'Limited', new: 'New' }[p.badge] || p.badge));
    if (p && isLocked(id)) b.append(H('span', { class: 'lock', title: t('lockedHint'), html: ICON.lock }));
    return b;
  }
  function renderWardrobe() {
    const tryP = context === 'tryOn' ? CAT.byId.get(Number(opts.tryOn)) : null;
    panel.innerHTML = '';
    const scroll = H('div', { class: 'panel-scroll' });
    scroll.append(H('div', { class: 'kicker' }, tryP ? t('tryKicker') : t('kicker')));
    scroll.append(H('h1', { html: tryP ? shortName(tryP) : `${t('title1')}<br>${t('title2')} <i>${t('title3')}</i>` }));
    if (tryP) scroll.append(H('p', { class: 'lead' }, t('tryText')));
    if (challenge) scroll.append(H('div', { class: 'challenge' }, t('challengeFrom', { name: challenge.n || 'Rider', score: fmt(challenge.sc || 0) })));
    const seg = H('div', { class: 'seg', role: 'group', 'aria-label': 'Silhouette' }, ...['f', 'm'].map((g) => H('button', { class: profile.gender === g ? 'on' : '', 'aria-pressed': String(profile.gender === g), onClick: () => { profile.gender = g; changed(); } }, t(g === 'f' ? 'women' : 'men'))));
    const skins = H('div', { class: 'skins' }, ...SKINS.map((sk, i) => H('button', { class: profile.skin === i ? 'on' : '', style: 'background:' + sk.s, 'aria-label': t(i ? 'skinDark' : 'skinLight'), 'aria-pressed': String(profile.skin === i), onClick: () => { profile.skin = i; changed(); } })));
    scroll.append(H('div', { class: 'row' }, seg, skins));
    // tailles
    const sz = H('details', { class: 'sizes' }); if (load('sizesOpen', root.clientWidth >= 600)) sz.open = true;
    sz.addEventListener('toggle', () => save('sizesOpen', sz.open));
    const sum = Object.entries(profile.sizes).map(([k, v]) => (k === 'deck' ? v + '"' : v)).join(' · ');
    sz.append(H('summary', {}, t('sizes'), H('small', {}, sum)));
    const grid = H('div', { class: 'grid' });
    for (const [k, list] of Object.entries(SIZE_OPTS)) {
      const sel = H('select', { 'aria-label': t('size_' + k), onChange: (e) => { profile.sizes[k] = e.target.value; saveProfile(); renderWardrobe(); audio.SFX.ui(); } });
      for (const v of list) { const o = H('option', { value: v }, k === 'deck' ? v.replace('.', getLang() === 'fr' ? ',' : '.') + '"' : v); if (String(profile.sizes[k]) === v) o.selected = true; sel.append(o); }
      grid.append(H('label', {}, t('size_' + k), sel));
    }
    sz.append(grid, H('p', {}, t('sizesHint'))); scroll.append(sz);
    // emplacements
    for (const row of ROWS) {
      const ids = row.ids(); if (!ids.length) continue;
      const d = H('div', { class: 'slot' });
      let info = { text: '', cls: '' };
      if (!row.multi && !row.pack) { const cur = profile.wear[row.k]; info = cur ? { ...sizeLine(cur), text: shortName(CAT.byId.get(cur)) + ' · ' + sizeLine(cur).text } : { text: t('none'), cls: '' }; if (cur && isLocked(cur)) info = { text: t('lockedHint'), cls: 'warn' }; }
      else if (row.multi) { const on = ids.filter((id) => profile.wear[CAT.byId.get(id).slot] === id); info = { text: on.length ? on.map((id) => sizeLine(id).text).join(' · ') : t('none'), cls: '' }; }
      d.append(H('div', { class: 'slot-h' }, H('b', {}, t('slot_' + row.k)), H('span', { class: info.cls }, info.text)));
      const ch = H('div', { class: 'chips' });
      for (const id of ids) {
        const p = CAT.byId.get(id);
        if (row.pack) ch.append(chip(id, packComplete(p), () => { for (const pid of p.pack_items) { const q = CAT.byId.get(pid); if (q) profile.wear[q.slot] = pid; } changed(); }));
        else if (row.multi) ch.append(chip(id, profile.wear[p.slot] === id, () => { profile.wear[p.slot] = profile.wear[p.slot] === id ? null : id; changed(); }));
        else ch.append(chip(id, profile.wear[row.k] === id, () => { profile.wear[row.k] = id; if (row.k === 'head') profile.wear.helmet = null; changed(); }));
      }
      if (row.none) ch.append(chip(0, !profile.wear[row.k] && !profile.wear.helmet, () => { profile.wear[row.k] = null; profile.wear.helmet = null; changed(); }));
      d.append(ch); scroll.append(d);
    }
    const plan = cartPlan(), n = plan.length;
    const foot = H('div', { class: 'panel-foot' },
      H('div', { class: 'total' }, H('span', {}, t('outfit') + ' : ', H('b', {}, t(n > 1 ? 'articlesP' : 'articles', { n }))), H('span', { class: 'eur' }, price(total(plan)))),
      H('div', { class: 'ctas' }, H('button', { class: 'btn btn-buy', id: 'buy', onClick: (e) => buyOutfit(e.currentTarget) }, t('buy')),
        H('button', { class: 'btn btn-ride', onClick: () => startRun(), html: t('ride') + ' ' + ICON.play })));
    panel.append(scroll, foot);
    keys.textContent = t('keysHint');
    scroll.scrollTop = scrollMem; scroll.addEventListener('scroll', () => { scrollMem = scroll.scrollTop; });
  }
  let scrollMem = 0;
  function changed() { saveProfile(); refreshLook(); renderWardrobe(); engine.hop(); audio.unlock(); audio.SFX.ui(); }
  async function buyOutfit(btn, ids) {
    audio.unlock();
    const plan = ids || cartPlan(); const skipped = (ids ? [] : wornIds()).filter(isLocked);
    if (!plan.length) return;
    if (btn) { btn.disabled = true; btn.classList.add('ok'); btn.textContent = '…'; }
    const res = await bridge.addLookToCart(plan, profileForBridge());
    const ok = res.filter((r) => r.ok), bad = res.filter((r) => !r.ok);
    audio.SFX.buy(); engine.confetti();
    let msg = t('addedToast', { n: ok.length }); if (ok.some((r) => r.mock)) msg += ' ' + t('addedMock');
    if (bad.length) msg += ' · ' + t('addFail', { list: bad.map((r) => (r.product ? shortName(r.product) : '?')).join(', ') });
    if (skipped.length) msg += ' · ' + t('lockedSkip', { list: skipped.map((id) => shortName(CAT.byId.get(id))).join(', ') });
    toast(msg, 4200);
    emit('buyOutfit', { items: plan, added: ok.length, failed: bad.length });
    if (btn) { btn.textContent = t('added'); setTimeout(() => { btn.disabled = false; btn.classList.remove('ok'); btn.textContent = btn.dataset.label || t('buy'); }, 2200); }
  }

  // --- HUD ----------------------------------------------------------------------------------------
  const hud = H('div', { class: 'hud hidden' });
  const scoreEl = H('b', {}, '0'), lootEl = H('span', { class: 'h-loot', html: ICON.shop + '<span>0</span>' });
  const tbar = H('i'), tsec = H('b', {}, '60');
  const cnames = H('div', { class: 'names' }), cpts = H('b', {}, '0'), cmult = H('span');
  const comboEl = H('div', { class: 'combo idle' }, cnames, H('div', { class: 'pts' }, cpts, cmult));
  const spdN = H('b', {}, '0'), speedo = H('div', { class: 'speedo', role: 'img', 'aria-label': 'km/h' }, H('div', {}, spdN, H('small', {}, 'KM/H')));
  const fx = H('div', { class: 'fx' }), tuto = H('div', { class: 'tuto off' });
  hud.append(H('div', { class: 'h-score' }, H('small', {}, t('score').toUpperCase()), scoreEl, lootEl), H('div', { class: 'h-time' }, H('div', { class: 'bar' }, tbar), tsec), comboEl, speedo, fx, tuto);
  root.append(hud);
  let lastSec = -1, lastScore = -1, lastKmh = -1, lastFx = '', tutoT = 0;
  function onTick(s) {
    if (s.score !== lastScore) { lastScore = s.score; scoreEl.textContent = fmt(s.score); }
    tbar.style.transform = 'scaleX(' + (s.left / RUN_LEN).toFixed(4) + ')';
    const sec = Math.ceil(s.left); if (sec !== lastSec) { lastSec = sec; tsec.textContent = sec; tsec.classList.toggle('low', sec <= 10); }
    const k = Math.round(s.kmh); if (k !== lastKmh) { lastKmh = k; spdN.textContent = k; speedo.style.setProperty('--p', Math.min(1, Math.max(0, (k - 20) / 40)).toFixed(3)); speedo.classList.toggle('hot', k >= 48); }
    const f = (s.boost ? 'b' : '') + (s.magnet ? 'm' : ''); if (f !== lastFx) { lastFx = f; fx.innerHTML = (s.boost ? '<span>BOOST</span>' : '') + (s.magnet ? '<span class="mag">' + t('magnet').replace(/\s*!$/, '') + '</span>' : ''); }
    if (tutoT > 0) { tutoT -= 1 / 60; if (tutoT <= 0) tuto.classList.add('off'); }
  }
  function onCombo(c, extra) {
    if (extra && extra.banked != null) { comboEl.classList.add('bank'); cpts.textContent = '+' + fmt(extra.banked); cmult.textContent = ''; setTimeout(() => { comboEl.classList.remove('bank'); if (!engine.G.combo) comboEl.classList.add('idle'); }, 650); return; }
    if (extra && extra.lost) { comboEl.classList.add('lost'); setTimeout(() => { comboEl.classList.remove('lost'); comboEl.classList.add('idle'); }, 700); return; }
    if (!c) { if (!comboEl.classList.contains('bank') && !comboEl.classList.contains('lost')) comboEl.classList.add('idle'); return; }
    comboEl.classList.remove('idle', 'bank', 'lost'); cnames.textContent = c.names.slice(-5).join(' + '); cpts.textContent = fmt(c.pts); cmult.textContent = '× ' + c.mult;
  }
  const TOUCH = matchMedia('(pointer:coarse)').matches;
  function onHint(k) { const key = 'hint_' + k + (TOUCH && (k === 'ollie' || k === 'flip') ? 'T' : ''); tuto.innerHTML = t(key); tuto.classList.remove('off'); tutoT = 4.2; }
  function onCatch(e) {
    const span = lootEl.querySelector('span'); span.textContent = engine.G.loot.length; lootEl.classList.remove('bump'); void lootEl.offsetWidth; lootEl.classList.add('bump');
    emit('lootCaught', { kind: e.k, id: e.id, tier: e.tier });
    if (e.k === 'token') emit('tierReached', { tier: e.tier, source: 'token' });
  }

  // --- écrans : pause, rotation, fin, vestiaire ---------------------------------------------------
  let screen = 'wardrobe', modal = null, endAt = 0, lastRes = null, session = null;
  function closeModal() { if (modal) { modal.remove(); modal = null; } }
  function openModal(card, cls) { closeModal(); modal = H('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, card); if (cls) modal.classList.add(cls); root.append(modal); const f = card.querySelector('button'); if (f) try { f.focus({ preventScroll: true }); } catch (e) { /* rien */ } return modal; }
  function openPause() {
    if (screen !== 'run' || engine.G.paused) return;
    engine.setPaused(true); audio.SFX.pause(); audio.stopMusic(); emit('pause', {});
    const musicBtn = H('button', { class: 'btn btn-ghost', onClick: () => { profile.music = !profile.music; audio.setMusic(profile.music); saveProfile(); musicBtn.textContent = t(profile.music ? 'musicOn' : 'musicOff'); } }, t(profile.music ? 'musicOn' : 'musicOff'));
    openModal(H('div', { class: 'card small' }, H('h2', {}, t('pause')), H('p', {}, t('controls')),
      H('div', { class: 'stack' }, H('button', { class: 'btn btn-ride', onClick: resume }, t('resume')), H('button', { class: 'btn btn-ghost', onClick: () => { closeModal(); startRun(true); } }, t('restart')),
        musicBtn, H('button', { class: 'btn btn-ghost', onClick: () => { closeModal(); showWardrobe(); } }, t('wardrobe')))));
  }
  function resume() { closeModal(); engine.setPaused(false); if (!profile.muted) audio.startMusic(); }
  function showWardrobe(focusId) {
    screen = 'wardrobe'; closeModal(); hud.classList.add('hidden'); pauseBtn.classList.add('hidden'); brand.classList.remove('hidden'); panel.classList.remove('hidden'); keys.classList.remove('hidden');
    audio.stopMusic(); audio.loops(0, 0, 0);
    if (focusId) { const p = CAT.byId.get(focusId); if (p) { if (p.slot === 'pack') for (const pid of p.pack_items) { const q = CAT.byId.get(pid); if (q) profile.wear[q.slot] = pid; } else profile.wear[p.slot] = p.id; saveProfile(); } }
    refreshLook(); renderWardrobe(); engine.showScene(sceneRect()); emit('shopOpen', { context });
  }
  function sceneRect() {
    const r = root.getBoundingClientRect(), land = r.width >= r.height;
    if (screen === 'vest') return land ? { x: 0, y: 0, w: r.width * 0.5, h: r.height } : { x: 0, y: 0, w: r.width, h: r.height * 0.44 };
    const pw = land ? Math.min(480, r.width * 0.47) : 0; return land ? { x: 0, y: 0, w: r.width - pw, h: r.height } : { x: 0, y: 0, w: r.width, h: r.height * 0.43 };
  }
  async function startRun(again) {
    audio.unlock();
    const r = root.getBoundingClientRect();
    if (!again && r.height > r.width && r.width < 600 && !profile.rotateOk) {
      openModal(H('div', { class: 'card small' }, H('h2', {}, t('rotateTitle')), H('p', {}, t('rotateText')),
        H('button', { class: 'btn btn-ride', onClick: () => { profile.rotateOk = true; saveProfile(); closeModal(); startRun(); } }, t('rotatePlay'))));
      return;
    }
    closeModal(); audio.SFX.go();
    try { if (document.activeElement && root.contains(document.activeElement)) document.activeElement.blur(); } catch (e) { /* rien */ }
    session = await rewards.session({ referrer: challenge && challenge.r, challengeSeed: challenge && challenge.s, player: profile.pid, lang: getLang() });
    engine.wipe(() => {
      screen = 'run'; panel.classList.add('hidden'); keys.classList.add('hidden'); brand.classList.add('hidden'); hud.classList.remove('hidden'); pauseBtn.classList.remove('hidden');
      lootEl.querySelector('span').textContent = '0'; refreshLook();
      engine.startRun(session.seed); if (!profile.muted) audio.startMusic();
      emit('runStart', { runId: session.runId, seed: session.seed, demo: !!session.demo });
    });
  }
  function onEnd(res) {
    lastRes = res; screen = 'end'; endAt = performance.now(); audio.stopMusic(); pauseBtn.classList.add('hidden');
    const rec = res.score > (profile.best || 0) && res.score > 0; if (rec) profile.best = res.score; saveProfile();
    const runProof = { runId: session && session.runId, ...res.proof };
    emit('runEnd', { score: res.score, distance: res.distance, topKmh: res.topKmh, loot: res.loot.map((l) => ({ kind: l.k, id: l.id, tier: l.tier })), runId: runProof.runId, demo: !!(session && session.demo) });
    setTimeout(() => showEnd(res, rec, runProof), 700);
  }
  function showEnd(res, rec, runProof) {
    hud.classList.add('hidden');
    const big = H('div', { class: 'big' }, '0');
    const card = H('div', { class: 'card' }, H('div', { class: 'kicker', style: 'margin-top:6px' }, t('endKicker')), big,
      H('div', { style: 'font-size:13px;color:var(--craie2)' }, t('points'), rec ? H('span', { class: 'rec' }, t('record')) : null));
    if (challenge && challenge.sc) { const d = challenge.sc - res.score; card.append(H('div', { class: 'challenge', style: 'margin-top:10px' }, d < 0 ? t('challengeBeat') : t('challengeLost', { d: fmt(d) }))); }
    card.append(H('div', { class: 'stats bd' }, H('div', {}, H('small', {}, t('bdTricks')), H('b', {}, fmt(res.trickScore))), H('div', {}, H('small', {}, t('bdSpeed')), H('b', {}, fmt(res.speedPts))), H('div', {}, H('small', {}, t('bdDist')), H('b', {}, fmt(res.distPts)))));
    card.append(H('div', { class: 'stats' }, H('div', {}, H('small', {}, t('topSpeed')), H('b', {}, res.topKmh + ' km/h')), H('div', {}, H('small', {}, t('bestCombo')), H('b', {}, fmt(res.bestCombo))), H('div', {}, H('small', {}, t('perfects')), H('b', {}, String(res.perfects)))));
    if (res.bestNames) card.append(H('div', { class: 'note' }, H('b', {}, t('bestChain') + ' : '), res.bestNames));
    // récompenses : jeton (meilleur palier), exclusifs, puis le butin
    const tokens = res.loot.filter((l) => l.k === 'token').sort((a, b) => TIER_RANK[b.tier] - TIER_RANK[a.tier]);
    if (tokens.length) {
      const tier = tokens[0].tier, box = H('div', { class: 'reward', style: '--tier:' + TIER_COL[tier] }, H('div', { class: 'coin' }, '%'), H('div', { class: 'lbl' }, t('codeTitle'), H('small', {}, t('tier_' + tier))), H('span', { class: 'note', style: 'margin:0' }, t('codeWait')));
      card.append(box);
      rewards.claim({ type: 'code', tier, runProof }).then((r) => {
        box.lastChild.remove();
        if (!r || !r.ok || !r.code) { box.append(H('span', { class: 'note', style: 'margin:0' }, (r && r.message) || t('codeFail'))); return; }
        const code = H('code', { tabindex: '0' }, r.code);
        const copy = H('button', { class: 'btn btn-ghost btn-sm', onClick: async () => { try { await navigator.clipboard.writeText(r.code); toast(t('codeCopied')); } catch (e) { const rg = document.createRange(); rg.selectNodeContents(code); const s = getSelection(); s.removeAllRanges(); s.addRange(rg); } } }, t('codeCopy'));
        box.append(code, copy); if (r.label) box.querySelector('.lbl small').textContent = t('tier_' + tier) + ' · ' + r.label;
        if (r.url) box.append(H('a', { class: 'btn btn-sm btn-ride', href: r.url, target: '_top' }, getLang() === 'en' ? 'Apply' : 'Appliquer'));
        if (r.demo) box.append(H('div', { class: 'note', style: 'flex-basis:100%;margin:0' }, t('codeDemo')));
        emit('codeRevealed', { tier, demo: !!r.demo });
      });
    }
    const excl = res.loot.filter((l) => l.k === 'excl');
    for (const e of excl) {
      const p = CAT.byId.get(e.id); if (!p) continue;
      rewards.claim({ type: 'exclusive', id: e.id, runProof }).then((r) => {
        if (r && r.ok) { if (!profile.unlocked.includes(e.id)) profile.unlocked.push(e.id); saveProfile(); emit('exclusiveUnlocked', { id: e.id, demo: !!r.demo }); emit('objectiveUnlocked', { id: 'exclusive-' + e.id, first: true, products: [e.id] }); }
      });
    }
    const prods = res.loot.filter((l) => l.k === 'prod' || l.k === 'excl');
    const uniq = [...new Map(prods.map((l) => [l.id, l])).values()];
    card.append(H('div', { class: 'sect' }, H('h3', {}, t('lootTitle') + ' : ' + t(uniq.length > 1 ? 'lootNP' : 'lootN', { n: uniq.length })),
      uniq.length > 1 ? H('button', { class: 'btn btn-buy btn-sm', onClick: (ev) => buyOutfit(ev.currentTarget, uniq.map((l) => l.id).filter((id) => !(isLocked(id) && !excl.some((x) => x.id === id)))) }, t('addAll')) : null));
    if (!uniq.length) card.append(H('div', { class: 'note' }, t('lootEmpty')));
    else { const list = H('div', { class: 'loot' });
      for (const l of uniq) { const p = CAT.byId.get(l.id); if (!p) continue; const ex = l.k === 'excl';
        list.append(H('div', { class: 'lootrow' + (ex ? ' ex' : '') }, iconEl(l.id, 48), H('div', { class: 'nm' }, shortName(p), H('small', {}, (ex ? t('excl') + ' · ' : '') + price(p.price_ttc) + ' · ' + sizeLine(l.id).text)),
          H('div', { class: 'acts' }, H('button', { class: 'btn btn-ghost btn-sm', onClick: () => { closeModal(); showWardrobe(l.id); } }, t('tryOn')),
            H('button', { class: 'btn btn-buy btn-sm', onClick: (ev) => buyOutfit(ev.currentTarget, [l.id]) }, getLang() === 'en' ? 'Add' : 'Ajouter')))); }
      card.append(list);
      rewards.claim({ type: 'product', ids: uniq.map((l) => l.id), runProof }).catch(() => {});
    }
    card.append(H('div', { class: 'endbtns' }, H('button', { class: 'btn btn-ride', onClick: () => startRun(true), html: t('again') + ' <kbd>Espace</kbd>' }), H('button', { class: 'btn btn-ghost', onClick: () => showWardrobe() }, t('wardrobe'))));
    card.append(H('div', { class: 'sharebtns' }, H('button', { class: 'btn btn-ghost btn-sm', onClick: () => shareCard(res) }, t('share')), H('button', { class: 'btn btn-ghost btn-sm', onClick: () => shareChallenge(res) }, t('challenge'))));
    const plan = cartPlan();
    card.append(H('div', { class: 'shopline' }, H('span', {}, t('outfit') + ' : ', H('b', {}, t(plan.length > 1 ? 'articlesP' : 'articles', { n: plan.length }) + ' · ' + price(total(plan)))), H('button', { class: 'btn btn-buy btn-sm', onClick: (ev) => buyOutfit(ev.currentTarget) }, t('buyShort'))));
    openModal(card);
    const t0 = performance.now(); const step = () => { const k = Math.min(1, (performance.now() - t0) / 900); big.textContent = fmt(res.score * (1 - (1 - k) * (1 - k))); if (k < 1 && !destroyed) requestAnimationFrame(step); }; step();
  }
  // --- partage : carte image + lien de défi ----------------------------------------------------
  function renderCard(res) {
    const Wc = 1080, Hc = 1350, c = document.createElement('canvas'); c.width = Wc; c.height = Hc; const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, Hc); g.addColorStop(0, '#1F1438'); g.addColorStop(0.45, '#9C3460'); g.addColorStop(0.75, '#FF9A52'); g.addColorStop(1, '#FFC874'); x.fillStyle = g; x.fillRect(0, 0, Wc, Hc);
    x.fillStyle = 'rgba(20,20,22,.9)'; x.fillRect(0, Hc * 0.72, Wc, Hc * 0.28);
    x.fillStyle = '#FFE9A8'; x.globalAlpha = 0.85; x.beginPath(); x.arc(Wc * 0.72, Hc * 0.5, 170, 0, Math.PI * 2); x.fill(); x.globalAlpha = 1;
    x.fillStyle = '#2A1733'; for (let i = 0; i < 9; i++) x.fillRect(i * 125 - 20, Hc * 0.72 - 120 - ((i * 97) % 260), 110, 400);
    const L = lookOf(profile, 0); x.save(); x.translate(Wc * 0.42, Hc * 0.72); x.scale(3.4, 3.4);
    x.save(); x.translate(50, -52); x.rotate(-Math.PI / 2 + 0.1); drawBoardPlan(x, L); x.restore();
    const o = { hip: { x: 0, y: -75 }, lean: -0.02, fb: { x: -17, y: 0 }, ff: { x: 17, y: 0 }, hb: { x: -22, y: -68 }, eb: 'out', hf: { x: 43, y: -106 }, ef: 'down', tilt: 0, shoeAng: 0, board: { show: 0 }, pony: { x: 0, y: 0 }, blink: 0, smile: true };
    drawRider(x, o, L); x.restore();
    x.textAlign = 'left'; x.fillStyle = ACID; x.font = '64px ' + DISP; x.fillText('RESPAWN', 64, 110); x.fillStyle = CRAIE; x.font = '30px ' + DISP; x.fillText('STREET RUN', 66, 152);
    x.font = '170px ' + DISP; x.fillStyle = CRAIE; x.strokeStyle = INK; x.lineWidth = 14; x.lineJoin = 'round'; const sc = fmt(res.score); x.strokeText(sc, 60, Hc * 0.72 + 190); x.fillText(sc, 60, Hc * 0.72 + 190);
    x.font = '700 34px "Space Grotesk", system-ui, sans-serif'; x.fillStyle = ACID; x.fillText(`${res.topKmh} km/h · combo ${fmt(res.bestCombo)} · ${res.loot.length} ${getLang() === 'en' ? 'loot' : 'butin'}`, 64, Hc * 0.72 + 250);
    const ids = [...new Set(res.loot.filter((l) => l.id).map((l) => l.id))].slice(0, 5);
    ids.forEach((id, i) => { const p = CAT.byId.get(id); if (!p) return; x.save(); x.translate(Wc - 140 - i * 120, 60); x.fillStyle = '#141416'; x.fillRect(0, 0, 110, 110); x.translate(5, 5); drawIcon(x, p, pieceOf(p), CAT.byId); x.restore(); });
    x.font = '700 30px "Space Grotesk", system-ui, sans-serif'; x.fillStyle = CRAIE; x.fillText(getLang() === 'en' ? 'Beat my score →' : 'Bats mon score →', 64, Hc - 50);
    return c;
  }
  async function shareCard(res) {
    const c = renderCard(res), link = challengeLink({ seed: res.seed, score: res.score, ref: profile.pid, shopUrl });
    emit('share', { kind: 'card', score: res.score, link });
    const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
    try {
      const file = new File([blob], 'respawn-run.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: t('shareTitle'), text: t('shareText', { score: fmt(res.score) }) + ' ' + link }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'respawn-run.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast(t('pngSaved'));
  }
  async function shareChallenge(res) {
    const link = challengeLink({ seed: res.seed, score: res.score, ref: profile.pid, shopUrl });
    emit('share', { kind: 'challenge', score: res.score, link });
    try { if (TOUCH && navigator.share) { await navigator.share({ url: link, text: t('shareText', { score: fmt(res.score) }) }); return; } await navigator.clipboard.writeText(link); toast(t('copied')); }
    catch (e) { if (e && e.name !== 'AbortError') toast(link, 6000); }
  }
  // --- vestiaire du panier : le skater porte les articles, doublons au sac à dos -----------------
  function showVestiaire() {
    screen = 'vest'; const items = (opts.vestiaire && opts.vestiaire.items) || [];
    const dress = dressFromItems(items); vestItems = dress; vestBag = dress.bag.length;
    engine.setLook(lookOf({ ...profile, wear: dress.wear }, vestBag));
    panel.classList.add('hidden'); keys.classList.add('hidden');
    engine.showScene(sceneRect());
    const worn = Object.values(dress.wear), card = H('div', { class: 'card' }, H('div', { class: 'kicker', style: 'margin-top:6px' }, t('vestKicker')), H('h2', {}, t('vestTitle')));
    if (!items.length) card.append(H('p', {}, t('vestEmpty')));
    card.append(H('div', { class: 'sect' }, H('h3', {}, t('vestWorn') + ' · ' + worn.length)), H('div', { class: 'vlist' }, ...worn.map((id) => H('div', {}, iconEl(id, 56), shortName(CAT.byId.get(id))))));
    card.append(H('div', { class: 'sect' }, H('h3', {}, t('vestBag') + ' · ' + dress.bag.length)), dress.bag.length ? H('div', { class: 'vlist' }, ...dress.bag.map((id) => H('div', {}, iconEl(id, 56), shortName(CAT.byId.get(id))))) : H('div', { class: 'note' }, t('vestBagEmpty')));
    card.append(H('div', { class: 'endbtns' }, H('button', { class: 'btn btn-ride', onClick: () => { for (const [s, id] of Object.entries(dress.wear)) profile.wear[s] = id; saveProfile(); showWardrobe(); startRun(); } }, t('vestRide')), H('button', { class: 'btn btn-ghost', onClick: exitToShop }, t('exitCart'))));
    const m = openModal(card); m.style.justifyContent = innerWidth >= innerHeight ? 'flex-end' : 'center'; m.style.alignItems = innerWidth >= innerHeight ? 'center' : 'flex-end';
    m.style.background = 'transparent'; card.style.width = innerWidth >= innerHeight ? 'min(520px,48%)' : '100%'; card.style.maxHeight = innerWidth >= innerHeight ? '100%' : '56%';
    emit('shopOpen', { context: 'vestiaire', worn: worn.length, bag: dress.bag.length });
  }

  // --- clavier ---------------------------------------------------------------------------------
  function onKeyDown(e) {
    if (destroyed) return;
    if (e.code === 'KeyM' && !e.target.closest?.('input,select,textarea')) { profile.muted = !profile.muted; audio.setMuted(profile.muted); saveProfile(); renderTop(); return; }
    if (screen === 'run') {
      if (e.code === 'Escape' || e.code === 'KeyP') { e.preventDefault(); if (engine.G.paused) resume(); else openPause(); return; }
      if (engine.G.paused) return;
      engine.onKeyDown(e); return;
    }
    if (screen === 'end' && engine.G.mode === 'end' && (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyR') && performance.now() - endAt > 1500) {
      const a = shadow.activeElement; if (e.code !== 'KeyR' && a && a.tagName === 'BUTTON' && !a.classList.contains('btn-ride')) return;
      e.preventDefault(); startRun(true); return; }
    if (screen === 'wardrobe' && !modal && e.code === 'Enter' && !(shadow.activeElement && /BUTTON|SELECT|SUMMARY/.test(shadow.activeElement.tagName))) { e.preventDefault(); startRun(); }
  }
  const onKeyUp = (e) => engine.onKeyUp(e);
  window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp);
  const onVis = () => { if (document.hidden) { engine.stop(); audio.suspend(); if (screen === 'run') openPause(); } else { engine.start(); audio.resume(); } };
  document.addEventListener('visibilitychange', onVis);
  const ro = new ResizeObserver(() => { engine.resize(); if (screen === 'wardrobe' || screen === 'vest') engine.setSceneRect(sceneRect()); });
  ro.observe(root);
  const offLang = onLang(() => { root.lang = getLang(); renderTop(); if (screen === 'wardrobe') renderWardrobe(); });
  document.addEventListener('pointerdown', () => audio.unlock(), { once: true });

  // --- démarrage -------------------------------------------------------------------------------
  renderTop(); engine.resize();
  if (context === 'vestiaire') showVestiaire();
  else if (context === 'tryOn') showWardrobe(Number(opts.tryOn));
  else showWardrobe();
  engine.start();
  fontsReady.then(() => { if (!destroyed) { engine.rebuild(); if (screen === 'wardrobe') renderWardrobe(); } });
  emit('ready', { context, version, demoRewards: rewards.demo });

  const api = {
    get engine() { return engine; },
    bridge: () => bridge,
    pause: () => openPause(),
    openWardrobe: (id) => showWardrobe(id),
    openShop: (id) => showWardrobe(id),
    destroy() {
      if (destroyed) return; destroyed = true;
      engine.destroy(); audio.dispose(); ro.disconnect(); offLang();
      window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); document.removeEventListener('visibilitychange', onVis);
      host.remove(); if (layer) { layer.remove(); document.documentElement.style.overflow = prevOverflow || ''; }
      emit('destroy', {});
    },
  };
  if (autopilot || qs.has('debug')) window.__r2d = { api, engine, profile, CAT };
  return api;
}
