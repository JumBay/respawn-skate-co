// Respawn Street Run (2D) : point d'entrée. Même API que le jeu 3D (src/main.js) pour que les scripts
// de la boutique changent à peine :
//   mount(el|null, { overlay, shopUrl, onEvent, supabase, server, rulesUrl, newsletter, tryOn, vestiaire, remember, zIndex, cartMode, autopilot })
//   -> { destroy, pause, openWardrobe, openLeaderboard, bridge, engine }    wasExited() / clearExited()
// Serveur : CONTRAT-SERVEUR.md. `supabase: { url, anonKey }` branche rewards-supabase.js ; `server`
// accepte tout objet aux mêmes méthodes (faux serveur de test). Sans les deux : mode hors ligne
// (pas de classement ni de codes, record et fantôme locaux). AUCUN code promo dans ce bundle.
// Événements : opts.onEvent(nom, données) et window « respawn:<nom> » (liste dans README).
import css from './styles.css?inline';
import { createEngine, RUN_LEN } from './engine.js';
import { createAudio } from './audio.js';
import { drawIcon, drawRider, drawBoardPlan, DISP, ACID, CRAIE, INK } from './draw.js';
import { CAT, pieceOf, lookOf, dressFromItems, shortName, SKINS, PROTECT_SLOTS, MOUNT_SLOTS } from './looks.js';
import { t, getLang, setLang, setDefaultLang, onLang, fmt, price } from './i18n.js';
import { deviceId, readChallenge, challengeLink, subscribeNewsletter } from './rewards.js';
import { createSupabaseServer } from './rewards-supabase.js';
import { dailySeed } from './track.js';
import { trickLabel } from './engine.js';
import { createShopBridge } from '../../src/shop-bridge.js';
import { pickSize } from '../../src/data/catalog.js';
import { load, save } from '../../src/core/storage.js';

export const wasExited = () => !!load('exited', false);
export const clearExited = () => save('exited', false);
export const version = '2d-3';

// Défi d'ami toujours retrouvable : le meilleur run est gardé en localStorage (clé « respawn:challenge »),
// le lien se reconstruit à la demande, même hors ligne et sans que le jeu soit monté.
function bestChallengeLink(shopUrl = '/') {
  const b = load('challenge', null); if (!b || !b.s) return null;
  const p = load('p2d', null) || {};
  return challengeLink({ seed: b.s, score: b.sc, ref: p.ref || b.r || undefined, name: p.pseudo || b.n || undefined, run: b.run || undefined, shopUrl });
}
export const getChallengeLink = ({ shopUrl = '/' } = {}) => bestChallengeLink(shopUrl);
// Pour le bouton flottant de la boutique : partage (mobile) ou copie le lien du meilleur run.
export async function shareChallenge({ shopUrl = '/', text } = {}) {
  const link = bestChallengeLink(shopUrl); if (!link) return { ok: false, reason: 'no_run' };
  const b = load('challenge', null) || {};
  try { window.dispatchEvent(new CustomEvent('respawn:share', { detail: { kind: 'challenge', score: b.sc, link, from: 'outside' } })); } catch (e) { /* rien */ }
  const msg = text || t('shareText', { score: fmt(b.sc || 0) });
  try { if (navigator.share && matchMedia('(pointer:coarse)').matches) { await navigator.share({ url: link, text: msg }); return { ok: true, link, method: 'share' }; } } catch (e) { if (e && e.name === 'AbortError') return { ok: false, link, reason: 'aborted' }; }
  try { await navigator.clipboard.writeText(link); return { ok: true, link, method: 'clipboard' }; } catch (e) { return { ok: false, link, reason: 'clipboard' }; }
}

const SIZE_OPTS = {
  top: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], bottom: ['36', '38', '40', '42', '44', '46'], shoe: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  protect: ['S', 'M', 'L'], deck: ['7.75', '8', '8.25', '8.5'],
};
const DEFAULT = { v: 1, gender: 'f', skin: 0, wear: { head: 11, top: 4, bottom: 8, feet: 14, deck: 20, wheels: 24 }, sizes: { top: 'M', bottom: '40', shoe: '40', protect: 'M', deck: '8.25' },
  best: 0, unlocked: [], muted: false, music: true, pid: '', rotateOk: false, mode: 'daily', bestRun: null, streak: 0, email: '', pseudo: '', tickets: 0 };
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
  if (opts.lang) setDefaultLang(opts.lang);
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
  profileRef = profile;
  const saveProfile = () => save('p2d', profile);
  const exclusives = CAT.products.filter((p) => p.exclusive_unlock).map((p) => p.id);
  const isLocked = (id) => exclusives.includes(id) && !profile.unlocked.includes(id);
  const profileForBridge = () => ({ sizes: profile.sizes });
  const bridge = createShopBridge({ catalog: CAT, shopUrl, mode: opts.cartMode, onAdd: (d) => emit('cartAdd', d) });
  const did = deviceId();
  let server = null;
  try { server = opts.server || (opts.supabase && opts.supabase.url ? createSupabaseServer(opts.supabase) : null); } catch (e) { server = null; }
  const withTimeout = (p, ms) => Promise.race([Promise.resolve(p), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
  const srv = async (fn, args, ms = 6000) => { if (!server || !server[fn]) return null; try { return await withTimeout(server[fn](args), ms); } catch (e) { return { reason: String((e && e.message) || e), _err: true }; } };
  const challenge = readChallenge();
  // défi d'ami : fantôme du parrain préchargé, jamais remplacé par le fantôme local (sauf son propre lien)
  const ch = { ghost: null, state: challenge ? 'loading' : 'none', own: !!(challenge && profile.ref && challenge.r === profile.ref) };
  const chName = () => (challenge && (challenge.n || (ch.ghost && ch.ghost.pseudo))) || t('aRider');
  let drawInfo = null;

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
    audio, autopilot,
    hooks: { onTick, onCombo, onHint, onEnd, onCollect },
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
    // en-tête collant : aperçu du skater (fenêtre étroite), pseudo, onglets
    const mini = H('canvas', { class: 'mini', 'aria-hidden': 'true' });
    const pbar = H('div', { class: 'pbar' }, profile.pseudo
      ? [H('b', {}, profile.pseudo), profile.best ? H('span', {}, ' · ' + t('pseudoBest', { s: fmt(profile.best) })) : null, ' · ', H('button', { class: 'lnk', onClick: () => openPseudo() }, t('pseudoEdit'))]
      : [H('button', { class: 'lnk', onClick: () => openPseudo() }, t('pseudoNone'))]);
    const tabs = H('nav', { class: 'tabs', 'aria-label': t('kicker') });
    const phead = H('div', { class: 'phead' }, H('div', { class: 'prow' }, mini, H('div', { class: 'pcol' }, pbar, tabs)));
    scroll.append(H('div', { class: 'kicker' }, tryP ? t('tryKicker') : t('kicker')));
    scroll.append(H('h1', { html: tryP ? shortName(tryP) : `${t('title1')}<br>${t('title2')} <i>${t('title3')}</i>` }));
    if (tryP) scroll.append(H('p', { class: 'lead' }, t('tryText')));
    if (challenge) scroll.append(H('div', { class: 'challenge' }, ch.own ? t('chOwn') : t('beat', { name: chName(), score: fmt(challenge.sc || 0) }), H('div', { style: 'font-weight:600;font-size:12px;opacity:.85;margin-top:2px' }, ch.state === 'ok' ? t('chGhostOk') : ch.state === 'loading' ? t('chGhostLoading') : t('chGhostMissing'))));
    if (!tryP) {
      const modeSeg = H('div', { class: 'seg', role: 'group', 'aria-label': 'Mode' }, ...['daily', 'free'].map((m) => H('button', { class: profile.mode === m ? 'on' : '', 'aria-pressed': String(profile.mode === m), onClick: () => { profile.mode = m; saveProfile(); renderWardrobe(); audio.SFX.ui(); } }, t(m === 'daily' ? 'modeDaily' : 'modeFree'))));
      const best = load('challenge', null);
      scroll.append(H('div', { class: 'row' }, modeSeg, H('button', { class: 'btn btn-ghost btn-sm', style: 'margin-left:auto', onClick: () => openLeaderboard() }, t('leaderboard')),
        best && best.s ? H('button', { class: 'btn btn-buy btn-sm', onClick: () => shareBest(), title: t('challengeBest', { score: fmt(best.sc) }) }, t('challengeFriend')) : null));
      scroll.append(drawBox());
    }
    const seg = H('div', { class: 'seg', role: 'group', 'aria-label': 'Silhouette' }, ...['f', 'm'].map((g) => H('button', { class: profile.gender === g ? 'on' : '', 'aria-pressed': String(profile.gender === g), onClick: () => { profile.gender = g; changed(); } }, t(g === 'f' ? 'women' : 'men'))));
    const skins = H('div', { class: 'skins' }, ...SKINS.map((sk, i) => H('button', { class: profile.skin === i ? 'on' : '', style: 'background:' + sk.s, 'aria-label': t(i ? 'skinDark' : 'skinLight'), 'aria-pressed': String(profile.skin === i), onClick: () => { profile.skin = i; changed(); } })));
    scroll.append(H('div', { class: 'row' }, seg, skins));
    // tailles
    const sz = H('details', { class: 'sizes', 'data-sec': 'sizes' }); if (load('sizesOpen', root.clientWidth >= 600)) sz.open = true;
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
      const d = H('div', { class: 'slot', 'data-sec': row.k });
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
    panel.append(phead, scroll, foot);
    keys.textContent = t('keysHint');
    for (const sec of scroll.querySelectorAll('[data-sec]')) { const k = sec.dataset.sec;
      tabs.append(H('button', { 'data-k': k, onClick: () => { if (k === 'sizes') sec.open = true; scroll.scrollTo({ top: sec.offsetTop - scroll.offsetTop - 6, behavior: 'smooth' }); } }, k === 'sizes' ? t('tab_sizes') : t('slot_' + k))); }
    const markTab = () => { let cur = null; for (const sec of scroll.querySelectorAll('[data-sec]')) if (sec.offsetTop - scroll.offsetTop - 30 <= scroll.scrollTop) cur = sec.dataset.sec;
      for (const b of tabs.children) b.classList.toggle('on', b.dataset.k === cur); };
    scroll.addEventListener('scroll', markTab, { passive: true }); setTimeout(markTab, 0);
    drawMini(mini);
    scroll.scrollTop = scrollMem; scroll.addEventListener('scroll', () => { scrollMem = scroll.scrollTop; });
  }
  let scrollMem = 0;
  function drawMini(cv) {
    const d = Math.min(window.devicePixelRatio || 1, 2), w = 92, h = 118; cv.width = w * d; cv.height = h * d;
    const x = cv.getContext('2d'); x.scale(d, d); const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#4A1E5C'); g.addColorStop(1, '#E25A4E'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#2A2A2E'; x.fillRect(0, h - 12, w, 12);
    const L = lookOf(profile, 0); x.save(); x.translate(w / 2 - 8, h - 12); x.scale(0.62, 0.62);
    x.save(); x.translate(50, -52); x.rotate(-Math.PI / 2 + 0.1); drawBoardPlan(x, L); x.restore();
    drawRider(x, { hip: { x: 0, y: -75 }, lean: -0.02, fb: { x: -17, y: 0 }, ff: { x: 17, y: 0 }, hb: { x: -22, y: -68 }, eb: 'out', hf: { x: 43, y: -106 }, ef: 'down', tilt: 0, shoeAng: 0, board: { show: 0 }, pony: { x: 0, y: 0 }, blink: 0, smile: true }, L);
    x.restore();
  }
  // pseudo : saisie à la demande (barre du haut de la garde-robe)
  function openPseudo(then) {
    const card = H('div', { class: 'card small' }, H('h2', {}, t('pseudoTitle')), H('p', {}, t('pseudoText')));
    const prev = modal ? modal.firstChild : null;
    closeModal(); modal = H('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, card); root.append(modal);
    card.append(H('button', { class: 'btn btn-ghost btn-sm', style: 'margin-top:10px;width:100%', onClick: () => { closeModal(); if (prev) { modal = H('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, prev); root.append(modal); } } }, t('close')));
    askPseudo(card, () => { closeModal(); if (prev) { modal = H('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, prev); root.append(modal); } if (screen === 'wardrobe') renderWardrobe(); if (then) then(); });
  }
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
  const scoreEl = H('b', {}, '0'), lootEl = H('span', { class: 'h-loot', html: '<i class="coin"></i><span>0</span>' }), skateEl = H('span', { class: 'h-skate' }, ...'SKATE'.split('').map((ch) => H('i', {}, ch))), ghostEl = H('span', { class: 'h-ghost hidden' });
  const tbar = H('i'), tsec = H('b', {}, '60');
  const cnames = H('div', { class: 'names' }), cpts = H('b', {}, '0'), cmult = H('span');
  const comboEl = H('div', { class: 'combo idle' }, cnames, H('div', { class: 'pts' }, cpts, cmult));
  const spdN = H('b', {}, '0'), speedo = H('div', { class: 'speedo', role: 'img', 'aria-label': 'km/h' }, H('div', {}, spdN, H('small', {}, 'KM/H')));
  const fx = H('div', { class: 'fx' }), tuto = H('div', { class: 'tuto off' });
  hud.append(H('div', { class: 'h-score' }, H('small', {}, t('score').toUpperCase()), scoreEl, H('div', { class: 'h-row' }, lootEl, skateEl), ghostEl), H('div', { class: 'h-time' }, H('div', { class: 'bar' }, tbar), tsec), comboEl, speedo, fx, tuto);
  root.append(hud);
  let ghostName = '';
  let lastSec = -1, lastScore = -1, lastKmh = -1, lastFx = '', tutoT = 0, lastCoins = -1, lastLetters = null;
  function onTick(s) {
    if (s.score !== lastScore) { lastScore = s.score; scoreEl.textContent = fmt(s.score); }
    tbar.style.transform = 'scaleX(' + (s.left / RUN_LEN).toFixed(4) + ')';
    const sec = Math.ceil(s.left); if (sec !== lastSec) { lastSec = sec; tsec.textContent = sec; tsec.classList.toggle('low', sec <= 10); }
    const k = Math.round(s.kmh); if (k !== lastKmh) { lastKmh = k; spdN.textContent = k; speedo.style.setProperty('--p', Math.min(1, Math.max(0, (k - 20) / 40)).toFixed(3)); speedo.classList.toggle('hot', k >= 48); }
    if (s.coins !== lastCoins) { lastCoins = s.coins; lootEl.lastChild.textContent = s.coins; }
    if (s.letters !== lastLetters) { lastLetters = s.letters; [...skateEl.children].forEach((n) => n.classList.toggle('on', s.letters.includes(n.textContent))); }
    if (s.ghost != null) { const d = s.score - s.ghost; ghostEl.classList.remove('hidden'); ghostEl.textContent = t('vsName', { name: ghostName }) + ' : ' + (d >= 0 ? '+' : '−') + fmt(Math.abs(d)); ghostEl.classList.toggle('ahead', d >= 0); } else ghostEl.classList.add('hidden');
    const f = (s.boost ? 'b' : '') + (s.magnet ? 'm' : ''); if (f !== lastFx) { lastFx = f; fx.innerHTML = (s.boost ? '<span>BOOST</span>' : '') + (s.magnet ? '<span class="mag">' + t('magnet').replace(/\s*!$/, '') + '</span>' : ''); }
    if (tutoT > 0) { tutoT -= 1 / 60; if (tutoT <= 0) tuto.classList.add('off'); }
  }
  function onCombo(c, extra) {
    if (extra && extra.banked != null) { comboEl.classList.add('bank'); cpts.textContent = '+' + fmt(extra.banked); cmult.textContent = ''; setTimeout(() => { comboEl.classList.remove('bank'); if (!engine.sim.S.combo) comboEl.classList.add('idle'); }, 650); return; }
    if (extra && extra.lost) { comboEl.classList.add('lost'); setTimeout(() => { comboEl.classList.remove('lost'); comboEl.classList.add('idle'); }, 700); return; }
    if (!c) { if (!comboEl.classList.contains('bank') && !comboEl.classList.contains('lost')) comboEl.classList.add('idle'); return; }
    comboEl.classList.remove('idle', 'bank', 'lost'); cnames.textContent = c.names.slice(-5).join(' + '); cpts.textContent = fmt(c.pts); cmult.textContent = '× ' + c.mult;
  }
  const TOUCH = matchMedia('(pointer:coarse)').matches;
  function onHint(k) { const key = 'hint_' + k + (TOUCH && (k === 'ollie' || k === 'flip') ? 'T' : ''); tuto.innerHTML = t(key); tuto.classList.remove('off'); tutoT = 4.2; }
  // objets du run : pas de produit au panier ; les exclusifs se débloquent par leur objectif
  // (catalog.json exclusive_unlock : cassette -> 6, gap nommé -> 15, S-K-A-T-E -> 22)
  function unlock(id) { if (!profile.unlocked.includes(id) && CAT.byId.get(id)) { profile.unlocked.push(id); saveProfile(); emit('exclusiveUnlocked', { id }); emit('objectiveUnlocked', { id: 'exclusive-' + id, first: true, products: [id] }); toast(t('excl') + ' : ' + shortName(CAT.byId.get(id)), 3200); } }
  function onCollect(kind, it, S) {
    if (kind === 'letter') { emit('letter', { ch: it.ch, letters: S.letters }); if (S.letters.length === 5) unlock(22); }
    else if (kind === 'cassette') { emit('cassette', {}); unlock(6); }
    else if (kind === 'drop') emit('dropCaught', { product_id: it.id });
    else if (kind === 'dropSpawn') emit('dropSpawn', { product_id: it.id });
    else if (kind === 'boost' || kind === 'magnet') emit('bonus', { kind });
  }

  // --- écrans : pause, rotation, fin, vestiaire ---------------------------------------------------
  let screen = 'wardrobe', modal = null, endAt = 0, lastRes = null, session = null;
  function closeModal() { if (modal) { modal.remove(); modal = null; } }
  function openModal(card, cls) { closeModal(); modal = H('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, card); if (cls) modal.classList.add(cls); root.append(modal); const f = card.querySelector('button'); if (f) try { f.focus({ preventScroll: true }); } catch (e) { /* rien */ } return modal; }
  function openPause() {
    if (screen !== 'run' || engine.G.paused) return;
    engine.setPaused(true); audio.SFX.pause(); audio.stopMusic(); audio.loops(0, 0, 0); setTimeout(() => { if (engine.G.paused) audio.suspend(); }, 160); emit('pause', {});
    const musicBtn = H('button', { class: 'btn btn-ghost', onClick: () => { profile.music = !profile.music; audio.setMusic(profile.music); saveProfile(); musicBtn.textContent = t(profile.music ? 'musicOn' : 'musicOff'); } }, t(profile.music ? 'musicOn' : 'musicOff'));
    openModal(H('div', { class: 'card small' }, H('h2', {}, t('pause')), H('p', {}, t('controls')),
      H('div', { class: 'stack' }, H('button', { class: 'btn btn-ride', onClick: resume }, t('resume')), H('button', { class: 'btn btn-ghost', onClick: () => { closeModal(); startRun(true); } }, t('restart')),
        musicBtn, H('button', { class: 'btn btn-ghost', onClick: () => { closeModal(); showWardrobe(); } }, t('wardrobe')))));
  }
  function resume() { closeModal(); engine.setPaused(false); audio.unlock(); if (!profile.muted) audio.startMusic(); }
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
    // défi d'ami : mode libre avec la graine du parrain (run-start accepte `seed`)
    const mode = challenge ? 'free' : profile.mode;
    let run = null;
    if (server) { const r = await srv('runStart', { device_id: did, mode, referrer: challenge && challenge.r ? challenge.r : undefined, seed: challenge ? challenge.s : undefined }, 5000);
      if (r && r.run_id && r.seed != null) { run = { ...r, online: true }; if (r.player) { if (r.player.ref) profile.ref = r.player.ref; if (r.player.pseudo) profile.pseudo = r.player.pseudo; saveProfile(); } } }
    if (!run) run = { run_id: null, seed: challenge ? challenge.s : mode === 'daily' ? dailySeed() : ((Math.random() * 2 ** 31) >>> 0) || 1, mode, online: false };
    if (run.prize) drawInfo = { ...(drawInfo || {}), prize: run.prize, ends_at: run.prize.ends_at || (drawInfo && drawInfo.ends_at) };
    // fantôme : celui du parrain (défi), sinon mon meilleur run sur cette graine
    let ghost = null;
    if (challenge) {
      if (ch.state === 'loading') await chReady;
      if (ch.ghost && (ch.ghost.seed >>> 0) === (run.seed >>> 0)) ghost = { ...ch.ghost, pseudo: chName() };
      else if (ch.own && profile.bestRun && (profile.bestRun.seed >>> 0) === (run.seed >>> 0)) ghost = { ...profile.bestRun, pseudo: profile.pseudo || t('ghost') };
      if (!ghost) setTimeout(() => toast(t('chGhostMissing'), 4000), 900);
    } else if (profile.bestRun && (profile.bestRun.seed >>> 0) === (run.seed >>> 0)) ghost = { ...profile.bestRun, pseudo: profile.pseudo || t('ghost') };
    ghostName = ghost ? (challenge ? chName() : ghost.pseudo || t('ghost')) : '';
    session = run;
    engine.wipe(() => {
      screen = 'run'; panel.classList.add('hidden'); keys.classList.add('hidden'); brand.classList.add('hidden'); hud.classList.remove('hidden'); pauseBtn.classList.remove('hidden');
      refreshLook(); engine.setGhostLook(ghostLookOf(profile.gender === 'f' ? 'm' : 'f'));
      const st = engine.startRun(run.seed, ghost, null, run.drop && run.drop.product_id ? Number(run.drop.product_id) : null); if (!profile.muted) audio.startMusic();
      emit('runStart', { run_id: run.run_id, seed: run.seed, mode, online: run.online, ghost: st.ghost, drop_product: st.drop });
    });
  }
  function onEnd(res) {
    lastRes = res; screen = 'end'; endAt = performance.now(); audio.stopMusic(); pauseBtn.classList.add('hidden');
    const rec = res.score > (profile.best || 0) && res.score > 0;
    if (rec) profile.best = res.score;
    if (!(session && session.online)) { const b = load('challenge', null); if (!b || res.score > (b.sc || 0)) save('challenge', { s: res.proof.seed, sc: res.score, run: null, r: null, n: profile.pseudo || null, at: Date.now() }); }
    const prevRun = profile.bestRun;
    if (!prevRun || prevRun.seed !== res.proof.seed || res.score > prevRun.score) profile.bestRun = { seed: res.proof.seed, inputs: res.proof.inputs, score: res.score, drop: res.dropId };
    if (res.proof.events.some((e) => e[1] === 'gap')) unlock(15);
    saveProfile();
    if (window.__r2dCheck) { const rp = engine.replay(res.proof.seed, res.proof.inputs, res.dropId); window.__r2dCheck(rp && rp.score === res.score && rp.proof.distance === res.proof.distance, rp, res); }
    emit('runEnd', { run_id: session && session.run_id, score: res.score, distance: res.proof.distance, max_speed: res.topKmh, coins: res.coins, letters: res.letters, cassette: res.cassette, drop_caught: res.dropCaught, online: !!(session && session.online) });
    const fin = session && session.online && session.run_id ? srv('runFinish', { run_id: session.run_id, device_id: did, proof: res.proof }, 9000) : Promise.resolve(null);
    setTimeout(() => showEnd(res, rec, fin), 700);
  }
  const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return iso; } };
  // fantôme : silhouette bleu pâle, tenue par défaut, couleurs uniformes
  function ghostLookOf(gender) {
    const L = lookOf({ ...DEFAULT, gender }, 0), C = ['#A9DDF3', '#7FC0DC', '#E8F8FF'];
    for (const k of Object.keys(L)) if (L[k] && typeof L[k] === 'object' && L[k].c) L[k] = { ...L[k], c: C };
    return { ...L, skin: '#D4F1FF', skinSh: '#9FD3EC', hair: '#7FC0DC', lip: '#7FC0DC' };
  }
  function drawBox(extra) {
    const box = H('div', { class: 'drawbox' });
    const fill = () => {
      box.innerHTML = '';
      const d = drawInfo, prize = d && d.prize;
      if (!prize && !profile.streak) { box.classList.add('hidden'); return; } box.classList.remove('hidden');
      if (prize && prize.image) box.append(H('img', { src: prize.image, alt: '', loading: 'lazy' }));
      const tk = d && d.my_tickets != null ? d.my_tickets : null;
      box.append(H('div', { class: 'txt' }, H('small', {}, t('draw')), H('b', {}, prize ? prize.title : ''),
        H('span', {}, [d && d.ends_at ? t('drawEnds', { d: fmtDate(d.ends_at) }) : null, tk != null ? t(tk > 1 ? 'ticketsP' : 'tickets', { n: tk }) : null].filter(Boolean).join(' · ')),
        d && d.eligible === false ? H('span', { class: 'lw' }, t('drawEligible')) : null,
        d && d.last_winner ? H('span', { class: 'lw' }, t('lastWinner', { p: d.last_winner.pseudo, lot: d.last_winner.prize })) : null));
      if (profile.streak > 0) box.append(H('div', { class: 'streak', title: t(profile.streak > 1 ? 'streakP' : 'streak', { n: profile.streak }) }, H('i', { html: '<svg viewBox="0 0 24 24"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9.5z" fill="#FF6A1A"/><path d="M12 13c1 1.5 2.4 2.3 2.4 4a2.4 2.4 0 0 1-4.8 0c0-1 .5-1.8 1.2-2.4.1.9.6 1.4 1.2 1.4z" fill="#FFD54A"/></svg>' }), H('b', {}, String(profile.streak))));
      if (extra) box.append(extra);
    };
    fill(); box._fill = fill; return box;
  }
  async function refreshDraw() { if (!server) return; const d = await srv('drawInfo', { device_id: did }, 5000); if (d && !d._err && (d.prize || d.ends_at)) { drawInfo = d; if (d.my_tickets != null) { profile.tickets = d.my_tickets; saveProfile(); } if (screen === 'wardrobe') renderWardrobe(); } }
  function showEnd(res, rec, finP) {
    hud.classList.add('hidden');
    const big = H('div', { class: 'big' }, '0');
    const card = H('div', { class: 'card' }, H('div', { class: 'kicker', style: 'margin-top:6px' }, t('endKicker')), big,
      H('div', { style: 'font-size:13px;color:var(--craie2)' }, t('points'), rec ? H('span', { class: 'rec' }, t('record')) : null));
    if (challenge && challenge.sc && !ch.own) { const d = challenge.sc - res.score; card.append(H('div', { class: 'challenge chend', style: 'margin-top:10px' }, H('b', {}, d < 0 ? t('chWon', { name: chName() }) : t('chLost', { name: chName(), d: fmt(d) })), H('button', { class: 'btn btn-buy btn-sm', onClick: () => shareChallenge(res) }, t('chResend')))); }
    card.append(H('div', { class: 'stats bd' }, H('div', {}, H('small', {}, t('bdTricks')), H('b', {}, fmt(res.trickScore))), H('div', {}, H('small', {}, t('bdSpeed')), H('b', {}, fmt(res.speedPts))), H('div', {}, H('small', {}, t('bdDist')), H('b', {}, fmt(res.distPts)))));
    card.append(H('div', { class: 'stats' }, H('div', {}, H('small', {}, t('topSpeed')), H('b', {}, res.topKmh + ' km/h')), H('div', {}, H('small', {}, 'S-K-A-T-E'), H('b', {}, (res.letters.length + '/5') + (res.cassette ? ' + K7' : ''))), H('div', {}, H('small', {}, t('bestCombo')), H('b', {}, fmt(res.bestCombo)))));
    if (res.bestNames) card.append(H('div', { class: 'note' }, H('b', {}, t('bestChain') + ' : '), res.bestNames.split(' + ').map(trickLabel).join(' + ')));
    const status = H('div', { class: 'note' }, session && session.online ? t('codeWait') : t('offline'));
    const rewardsBox = H('div', { class: 'rewards' }), tick = H('div', { class: 'ticketfx hidden' });
    card.append(H('div', { class: 'sect' }, H('h3', {}, t('rewardsTitle')), H('button', { class: 'btn btn-ghost btn-sm', onClick: () => openLeaderboard() }, t('leaderboard'))), status, rewardsBox, tick);
    const dbox = drawBox(); card.append(dbox);
    card.append(H('div', { class: 'endbtns' }, H('button', { class: 'btn btn-ride', onClick: () => startRun(true), html: t('again') + ' <kbd>Espace</kbd>' }), H('button', { class: 'btn btn-ghost', onClick: () => showWardrobe() }, t('wardrobe'))));
    card.append(H('div', { class: 'sharebtns' }, H('button', { class: 'btn btn-ghost btn-sm', onClick: () => shareChallenge(res) }, t('challengeFriend')), H('button', { class: 'btn btn-ghost btn-sm', onClick: () => shareCard(res) }, t('share'))));
    const plan = cartPlan();
    card.append(H('div', { class: 'shopline' }, H('span', {}, t('outfit') + ' : ', H('b', {}, t(plan.length > 1 ? 'articlesP' : 'articles', { n: plan.length }) + ' · ' + price(total(plan)))), H('button', { class: 'btn btn-buy btn-sm', onClick: (ev) => buyOutfit(ev.currentTarget) }, t('buyShort'))));
    openModal(card);
    const t0 = performance.now(); const step = () => { const k = Math.min(1, (performance.now() - t0) / 900); big.textContent = fmt(res.score * (1 - (1 - k) * (1 - k))); if (k < 1 && !destroyed) requestAnimationFrame(step); }; step();
    Promise.resolve(finP).then((f) => {
      if (destroyed) return;
      if (!session || !session.online) return;
      if (!f || f._err) { status.textContent = t('offline'); return; }
      if (f.accepted === false) { status.textContent = t('refused', { r: f.reason || '?' }); return; }
      { const b = load('challenge', null); if (!b || !b.run || res.score > (b.sc || 0)) save('challenge', { s: res.proof.seed, sc: res.score, run: session.run_id, r: profile.ref || null, n: profile.pseudo || null, at: Date.now() }); }
      status.textContent = f.ranks ? t('rankLine', { d: f.ranks.day ?? '–', w: f.ranks.week ?? '–' }) : '';
      if (f.streak != null) { profile.streak = f.streak; saveProfile(); }
      if (f.tickets_earned > 0) { tick.textContent = t('ticketGain', { n: f.tickets_earned }) + (f.tickets_earned > 1 ? 's' : ''); tick.classList.remove('hidden'); audio.SFX.token(); profile.tickets = (profile.tickets || 0) + f.tickets_earned; if (drawInfo) drawInfo.my_tickets = (drawInfo.my_tickets || 0) + f.tickets_earned; }
      dbox._fill();
      const rws = Array.isArray(f.rewards) ? f.rewards : [];
      if (!rws.length) rewardsBox.append(H('div', { class: 'note' }, t('noReward')));
      for (const rw of rws) rewardsBox.append(rewardBox(rw));
      emit('runFinished', { accepted: f.accepted !== false, score: f.score, ranks: f.ranks, tickets_earned: f.tickets_earned, streak: f.streak, rewards: rws.map((r) => ({ kind: r.kind, product_id: r.product_id })) });
      if (f.needs_pseudo) askPseudo();
      refreshDraw();
    });
  }
  // une récompense : bouton → formulaire e-mail + cases → claim → code
  function rewardBox(rw) {
    const col = { skate: '#C8FF2E', score: '#DDE3EA', drop: '#FFD54A' }[rw.kind] || '#FFD54A';
    const p = rw.product_id ? CAT.byId.get(Number(rw.product_id)) : null;
    const box = H('div', { class: 'reward', style: '--tier:' + col }, p ? iconEl(p.id, 42) : H('div', { class: 'coin' }, '%'), H('div', { class: 'lbl' }, rw.label || t('rw_' + rw.kind), H('small', {}, t('rw_' + rw.kind) + (p ? ' · ' + shortName(p) : ''))));
    const go = H('button', { class: 'btn btn-ride btn-sm', onClick: () => { go.remove(); box.append(form()); } }, t('claimBtn')); box.append(go);
    function form() {
      const f = H('form', { class: 'claim', novalidate: true });
      const email = H('input', { type: 'email', required: true, autocomplete: 'email', placeholder: t('email'), 'aria-label': t('email'), value: profile.email || '' });
      const nl = H('input', { type: 'checkbox' }); // jamais pré-cochée
      const ok = H('input', { type: 'checkbox', required: true });
      const rules = opts.rulesUrl ? H('a', { href: opts.rulesUrl, target: '_blank', rel: 'noopener' }, t('rulesLink')) : H('span', {}, t('rulesLink'));
      const lbl = H('label', { class: 'chk' }, ok, H('span', {}, ...t('rules', { link: '\u0000' }).split('\u0000').flatMap((x, i) => (i ? [rules, x] : [x]))));
      const err = H('div', { class: 'err' }), btn = H('button', { class: 'btn btn-ride btn-sm', type: 'submit' }, t('claimGo'));
      f.append(email, H('label', { class: 'chk' }, nl, H('span', {}, t('newsletter'))), lbl, err, btn);
      f.addEventListener('submit', async (e) => {
        e.preventDefault(); err.textContent = '';
        const em = email.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { err.textContent = t('emailBad'); email.focus(); return; }
        if (!ok.checked) { err.textContent = t('rulesNeeded'); return; }
        btn.disabled = true; btn.textContent = '…';
        const r = await srv('claim', { run_id: session.run_id, device_id: did, email: em, newsletter: nl.checked, reward: { kind: rw.kind, ...(rw.product_id ? { product_id: rw.product_id } : {}) } }, 9000);
        if (!r || !r.ok || !r.code) { btn.disabled = false; btn.textContent = t('claimGo'); const why = (r && r.reason) || '?'; err.textContent = t('claimErr_' + why) !== 'claimErr_' + why ? t('claimErr_' + why) : t('claimErr', { r: why }); return; }
        profile.email = em; saveProfile();
        f.replaceWith(codeView(r, p));
        if (lastRes && !box.parentNode.querySelector('.chbox')) { const link = myChallenge(lastRes);
          box.after(H('div', { class: 'chbox' }, H('b', {}, t('challengeThis')), H('span', { class: 'note', style: 'margin:0' }, t('challengeThisText')),
            H('div', { class: 'cv-acts' }, H('button', { type: 'button', class: 'btn btn-buy btn-sm', onClick: () => shareChallenge(lastRes) }, t('challengeFriend'))))); }
        emit('rewardClaimed', { kind: rw.kind, product_id: rw.product_id || null, newsletter: nl.checked });
        if (nl.checked) { const n = await subscribeNewsletter(opts.newsletter, em, shopUrl); emit('newsletter', { ok: !!n.ok, reason: n.reason || null }); if (n.ok) toast(t('nlOk'), 5000); }
      });
      setTimeout(() => email.focus(), 50);
      return f;
    }
    return box;
  }
  function codeView(r, p) {
    const code = H('code', { tabindex: '0' }, r.code);
    const copy = H('button', { type: 'button', class: 'btn btn-ghost btn-sm', onClick: async () => { try { await navigator.clipboard.writeText(r.code); toast(t('codeCopied')); } catch (e) { const rg = document.createRange(); rg.selectNodeContents(code); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(rg); } } }, t('codeCopy'));
    return H('div', { class: 'codeview' }, H('div', { class: 'cv-top' }, code, copy),
      H('div', { class: 'note', style: 'margin:0' }, [r.label, r.value != null ? (typeof r.value === 'number' ? '-' + r.value + ' %' : r.value) : null, r.expires_at ? t('codeValid', { d: fmtDate(r.expires_at) }) : null].filter(Boolean).join(' · ')),
      H('div', { class: 'cv-acts' }, r.apply_url ? H('a', { class: 'btn btn-ride btn-sm', href: new URL(r.apply_url, new URL(shopUrl, location.href)).href, target: '_top' }, t('applyCart')) : null,
        p && p.url ? H('a', { class: 'btn btn-ghost btn-sm', href: new URL(p.url, new URL(shopUrl, location.href)).href, target: '_top' }, t('seeProduct')) : null));
  }
  function ensurePseudo(then) { if (profile.pseudo) return then(); openPseudo(then); }
  function askPseudo(hostCard, onDone) {
    const input = H('input', { type: 'text', minlength: 2, maxlength: 12, autocomplete: 'nickname', 'aria-label': t('pseudoTitle'), value: profile.pseudo || '' });
    const err = H('div', { class: 'err' }), btn = H('button', { class: 'btn btn-ride', type: 'submit' }, t('pseudoOk'));
    const f = H('form', { class: 'claim' }, input, err, btn);
    const box = H('div', { class: 'pseudobox' }, H('h3', {}, t('pseudoTitle')), H('p', { class: 'note' }, t('pseudoText')), f);
    const host = hostCard || (modal && modal.querySelector('.card')); if (host) { if (hostCard) host.append(box); else host.insertBefore(box, host.children[3] || null); }
    f.addEventListener('submit', async (e) => {
      e.preventDefault(); const v = input.value.trim(); if (v.length < 2) { err.textContent = t('pseudo_too_short'); return; } if (v.length > 12) { err.textContent = t('pseudo_too_long'); return; }
      btn.disabled = true; const r = server ? await srv('pseudo', { device_id: did, pseudo: v }, 6000) : { ok: true, pseudo: v }; btn.disabled = false;
      if (r && r.ok) { profile.pseudo = r.pseudo || v; saveProfile(); { const b = load('challenge', null); if (b) save('challenge', { ...b, n: profile.pseudo }); } box.replaceWith(H('div', { class: 'note' }, '✓ ' + profile.pseudo)); emit('pseudoSet', { pseudo: profile.pseudo }); if (onDone) onDone(); }
      else { const why = (r && r.reason) || '?'; err.textContent = t('pseudo_' + why) !== 'pseudo_' + why ? t('pseudo_' + why) : t('pseudoErr', { r: why }); }
    });
    setTimeout(() => input.focus(), 60);
  }
  // classement : jour / semaine / tout
  async function openLeaderboard(period = 'day') {
    const prev = modal ? modal.firstChild : null, prevScreen = screen;
    const body = H('div', { class: 'lb' }, H('div', { class: 'note' }, server ? t('codeWait') : t('lbOffline')));
    const tabs = H('div', { class: 'seg' }, ...[['day', 'lbDay'], ['week', 'lbWeek'], ['all', 'lbAll']].map(([k, l]) => H('button', { class: k === period ? 'on' : '', onClick: () => openLeaderboard(k) }, t(l))));
    const back = H('button', { class: 'btn btn-ghost', onClick: () => { closeModal(); if (prev && prevScreen === 'end') { modal = H('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, prev); root.append(modal); } } }, getLang() === 'en' ? 'Back' : 'Retour');
    const card = H('div', { class: 'card' }, H('div', { class: 'kicker', style: 'margin-top:6px' }, 'Respawn Street Run'), H('h2', {}, t('leaderboard')), tabs, body, H('div', { class: 'endbtns' }, H('button', { class: 'btn btn-ride', onClick: () => startRun(true) }, t('again')), back));
    closeModal(); modal = H('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, card); root.append(modal); if (prev) modal._prev = prev;
    emit('leaderboardOpen', { period });
    if (!server) return;
    const d = await srv('leaderboard', { period, device_id: did }, 6000);
    body.innerHTML = '';
    if (!d || d._err) { body.append(H('div', { class: 'note' }, t('lbOffline'))); return; }
    const me = d.me || null, top = d.top || [];
    if (!top.length) body.append(H('div', { class: 'note' }, t('lbEmpty')));
    const list = H('ol', { class: 'lblist' });
    for (const r of top.slice(0, 10)) list.append(H('li', { class: r.me || (me && me.rank === r.rank) ? 'me' : '' }, H('span', { class: 'rk' }, '#' + r.rank), H('span', { class: 'ps' }, r.pseudo || '—', r.badge ? H('em', { class: 'medal ' + r.badge }, '') : null), H('b', {}, fmt(r.score))));
    body.append(list);
    if (me && me.rank) {
      const near = H('ol', { class: 'lblist near' });
      if (me.above) near.append(H('li', {}, H('span', { class: 'rk' }, '#' + (me.rank - 1)), H('span', { class: 'ps' }, me.above.pseudo), H('b', {}, fmt(me.above.score))));
      near.append(H('li', { class: 'me' }, H('span', { class: 'rk' }, '#' + me.rank), H('span', { class: 'ps' }, profile.pseudo || (top.find((r) => r.me) || {}).pseudo || me.pseudo || t('lbMe')), H('b', {}, fmt(me.score))));
      if (load('challenge', null)) near.append(H('li', { class: 'share' }, H('button', { class: 'btn btn-buy btn-sm', onClick: () => shareBest() }, t('challengeFriend') + ' · ' + t('challengeBestShort'))));
      if (me.below) near.append(H('li', {}, H('span', { class: 'rk' }, '#' + (me.rank + 1)), H('span', { class: 'ps' }, me.below.pseudo), H('b', {}, fmt(me.below.score))));
      body.append(H('div', { class: 'sect' }, H('h3', {}, t('lbMe') + ' : #' + me.rank)), near,
        H('div', { class: 'challenge' }, me.rank === 1 ? t('lbFirst') : t('lbGap', { d: fmt(d.gap_to_next != null ? d.gap_to_next : me.above ? me.above.score - me.score : 0), r: me.rank - 1 })));
    }
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
    x.font = '700 34px "Space Grotesk", system-ui, sans-serif'; x.fillStyle = ACID; x.fillText(`${res.topKmh} km/h · combo ${fmt(res.bestCombo)} · S-K-A-T-E ${res.letters.length}/5`, 64, Hc * 0.72 + 250);
    if (profile.pseudo) { x.font = '44px ' + DISP; x.fillStyle = CRAIE; x.textAlign = 'right'; x.fillText(profile.pseudo.toUpperCase(), Wc - 64, 110); x.textAlign = 'left'; }
    x.font = '700 30px "Space Grotesk", system-ui, sans-serif'; x.fillStyle = CRAIE; x.fillText(getLang() === 'en' ? 'Beat my score →' : 'Bats mon score →', 64, Hc - 50);
    return c;
  }
  // lien de défi : ref PUBLIC du joueur (jamais le device_id) ; sans ref (hors ligne), pas de parrain
  const myChallenge = (res) => challengeLink({ seed: res.proof.seed, score: res.score, ref: profile.ref || undefined, name: profile.pseudo || undefined, run: session && session.online ? session.run_id : undefined, shopUrl });
  async function shareCard(res) {
    const c = renderCard(res), link = myChallenge(res);
    emit('share', { kind: 'card', score: res.score, link });
    const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
    try {
      const file = new File([blob], 'respawn-run.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: t('shareTitle'), text: t('shareText', { score: fmt(res.score) }) + ' ' + link }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'respawn-run.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast(t('pngSaved'));
  }
  async function shareChallenge(res) { ensurePseudo(() => challengePanel(myChallenge(res), res.score)); }
  async function shareBest() { const b = load('challenge', null); if (!b) { toast(t('chNoRun'), 3500); return; } ensurePseudo(() => challengePanel(bestChallengeLink(shopUrl), b.sc)); }
  function challengePanel(link, score) {
    save('challengeLast', link); emit('share', { kind: 'challenge', score, link, panel: true });
    const msg = t('shareText', { score: fmt(score) }) + ' ' + link;
    const input = H('input', { class: 'chlink', type: 'text', readonly: true, value: link, 'aria-label': 'Lien', onFocus: (e) => e.target.select() });
    const copy = H('button', { class: 'btn btn-buy btn-sm', onClick: async () => { try { await navigator.clipboard.writeText(link); toast(t('copied')); } catch (e) { input.focus(); input.select(); } } }, t('chCopy'));
    const acts = H('div', { class: 'chacts' }, copy,
      H('a', { class: 'btn btn-ghost btn-sm', href: 'https://wa.me/?text=' + encodeURIComponent(msg), target: '_blank', rel: 'noopener' }, 'WhatsApp'),
      H('a', { class: 'btn btn-ghost btn-sm', href: 'sms:?&body=' + encodeURIComponent(msg) }, 'SMS'),
      navigator.share ? H('button', { class: 'btn btn-ghost btn-sm', onClick: async () => { try { await navigator.share({ url: link, text: t('shareText', { score: fmt(score) }) }); } catch (e) { /* annulé */ } } }, t('chShare')) : null);
    const prev = modal ? modal.firstChild : null;
    const card = H('div', { class: 'card small chpanel' }, H('div', { class: 'kicker', style: 'margin-top:6px' }, t('chPanelTitle')),
      H('div', { class: 'chprev' }, H('small', {}, t('chPanelPreview')), H('b', {}, t('chTitle', { name: profile.pseudo || t('aRider') })), H('span', { class: 'big' }, fmt(score) + ' pts'), H('span', {}, t('chGhostOk'))),
      H('p', {}, t('chPanelText')), input, acts,
      H('button', { class: 'btn btn-ghost', style: 'width:100%;margin-top:10px', onClick: () => { closeModal(); if (prev) { modal = H('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, prev); root.append(modal); } } }, t('close')));
    closeModal(); modal = H('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, card); root.append(modal);
  }
  async function shareLink(link, score) {
    save('challengeLast', link);
    emit('share', { kind: 'challenge', score, link });
    const res = { score };
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
    const tg = e.composedPath ? e.composedPath()[0] : e.target; if (tg && /INPUT|TEXTAREA|SELECT/.test(tg.tagName || '')) return;
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
  const onVis = () => { if (document.hidden) { engine.stop(); audio.loops(0, 0, 0); audio.suspend(); if (screen === 'run') openPause(); } else engine.start(); };
  const onBlur = () => { audio.loops(0, 0, 0); audio.suspend(); if (screen === 'run' && !engine.G.paused) openPause(); };
  const onGameInput = () => { if (!destroyed && (screen === 'run' || screen === 'wardrobe' || screen === 'end')) audio.unlock(); };
  window.addEventListener('blur', onBlur); root.addEventListener('pointerdown', onGameInput); root.addEventListener('keydown', onGameInput);
  document.addEventListener('visibilitychange', onVis);
  const ro = new ResizeObserver(() => { engine.resize(); if (screen === 'wardrobe' || screen === 'vest') engine.setSceneRect(sceneRect()); });
  ro.observe(root);
  const offLang = onLang(() => { root.lang = getLang(); renderTop(); if (screen === 'wardrobe') renderWardrobe(); });

  // --- démarrage -------------------------------------------------------------------------------
  renderTop(); engine.resize();
  if (context === 'vestiaire') showVestiaire();
  else if (context === 'tryOn') showWardrobe(Number(opts.tryOn));
  else showWardrobe();
  engine.start();
  fontsReady.then(() => { if (!destroyed) { engine.rebuild(); if (screen === 'wardrobe') renderWardrobe(); } });
  emit('ready', { context, version, online: !!server, device_id: did });
  function challengeLanding() {
    const status = H('p', {}, ch.state === 'ok' ? t('chGhostOk') : ch.state === 'loading' ? t('chGhostLoading') : t('chGhostMissing'));
    const card = H('div', { class: 'card small chland' }, H('div', { class: 'kicker', style: 'margin-top:6px' }, t('chKicker')),
      H('h2', {}, ch.own ? t('chOwnTitle') : t('chTitle', { name: chName() })), H('div', { class: 'big', style: 'font-size:56px' }, fmt(challenge.sc || 0)), H('div', { class: 'note' }, t('points')), status);
    if (ch.own) card.append(H('p', {}, t('chOwn')), H('button', { class: 'btn btn-buy', style: 'width:100%;margin-bottom:10px', onClick: () => shareBest() }, t('challengeFriend')));
    card.append(H('div', { class: 'stack' }, H('button', { class: 'btn btn-ride', onClick: () => startRun() }, ch.own ? t('chOwnPlay') : t('chAccept')), H('button', { class: 'btn btn-ghost', onClick: () => closeModal() }, t('wardrobe'))));
    if (context === 'home' && screen === 'wardrobe') openModal(card);
    return status;
  }
  let chStatusEl = null;
  const chReady = challenge ? (async () => {
    if (server && (challenge.run || challenge.r)) { const gh = await srv('ghost', challenge.run ? { run_id: challenge.run } : { ref: challenge.r }, 5000); if (gh && Array.isArray(gh.inputs) && gh.inputs.length) ch.ghost = gh; }
    ch.state = ch.ghost && (ch.ghost.seed >>> 0) === challenge.s ? 'ok' : 'missing';
    if (chStatusEl) chStatusEl.textContent = ch.state === 'ok' ? t('chGhostOk') : t('chGhostMissing');
    const h1 = modal && modal.querySelector('.chland h2'); if (h1 && !ch.own) h1.textContent = t('chTitle', { name: chName() });
    if (screen === 'wardrobe') renderWardrobe();
    emit('challengeOpen', { own: ch.own, ghost: ch.state === 'ok', score: challenge.sc });
  })() : Promise.resolve();
  if (challenge && context === 'home') chStatusEl = challengeLanding();
  refreshDraw();

  const api = {
    get engine() { return engine; },
    bridge: () => bridge,
    pause: () => openPause(),
    openWardrobe: (id) => showWardrobe(id),
    openShop: (id) => showWardrobe(id),
    openLeaderboard: (p) => openLeaderboard(p),
    audioState: () => ({ state: audio.state, music: audio.musicPlaying }),
    audioContext: () => audio.context,
    challengeLink: () => (lastRes ? myChallenge(lastRes) : null),
    bestChallengeLink: () => bestChallengeLink(shopUrl),
    shareChallenge: () => shareBest(),
    destroy() {
      if (destroyed) return; destroyed = true;
      engine.destroy(); audio.dispose(); ro.disconnect(); offLang();
      window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); document.removeEventListener('visibilitychange', onVis); window.removeEventListener('blur', onBlur);
      host.remove(); if (layer) { layer.remove(); document.documentElement.style.overflow = prevOverflow || ''; }
      emit('destroy', {});
    },
  };
  if (autopilot || qs.has('debug')) window.__r2d = { api, engine, profile, CAT };
  return api;
}
