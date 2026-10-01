// Point d'entrée : mount(conteneur, options) installe le jeu en couche plein écran et renvoie
// { destroy() } pour le démonter proprement (WebGL, son, écouteurs). Affiche d'abord un écran titre
// instantané, charge le park en arrière-plan, ouvre le Spawn point à la première visite.
import * as THREE from 'three';
import css from './ui/styles.css?inline';
import { Game } from './game/game.js';
import { Input } from './core/input.js';
import { detectQuality, hasWebGL2 } from './core/quality.js';
import { loadFresh } from './player/skater.js';
import { applyPhoto } from './game/photo.js';
import { loadCatalog, loadoutStats, isUnlocked } from './data/catalog.js';
import { loadProfile, saveProfile, lookFromProfile } from './profile.js';
import { t, getLang, setLang, onLang } from './i18n.js';
import { h, icon, loadFonts } from './ui/dom.js';
import { createSpawnScreen } from './ui/spawn.js';
import { AudioEngine } from './core/audio.js';
import { OBJECTIVES } from './game/objectives.js';

export async function mount(el, opts = {}) {
  const shopUrl = opts.shopUrl || '/';
  const quality = detectQuality(opts);
  const assetBase = opts.assetBase || (import.meta.env && import.meta.env.DEV ? '/' : new URL(/* @vite-ignore */ '../public/', import.meta.url).href);
  const cleanups = [];
  loadFonts();

  // --- racine, styles -----------------------------------------------------------------------------
  const root = h('div', { class: 'rs-root', lang: getLang() });
  const style = h('style', {}, css);
  root.appendChild(style);
  el.appendChild(root);
  const ui = h('div', { class: 'rs-ui' });

  const exitToShop = () => {
    if (opts.onExit) opts.onExit(); else location.href = shopUrl;
  };

  // barre du haut : toujours visible
  const profile = loadProfile();
  const audio = new AudioEngine();
  audio.setMuted(!!profile.muted);
  const soundBtn = h('button', { class: 'rs-chip', 'aria-pressed': String(!profile.muted), onClick: () => {
    profile.muted = !profile.muted; audio.setMuted(profile.muted); saveProfile(profile); renderTop();
  } });
  const langBtn = h('button', { class: 'rs-chip', onClick: () => setLang(getLang() === 'fr' ? 'en' : 'fr') });
  const shopBtn = h('a', { class: 'rs-chip rs-chip--shop', href: shopUrl, onClick: (e) => { if (opts.onExit) { e.preventDefault(); exitToShop(); } } });
  const topbar = h('div', { class: 'rs-topbar' }, langBtn, soundBtn, shopBtn);
  function renderTop() {
    soundBtn.innerHTML = ''; soundBtn.append(icon(profile.muted ? 'soundOff' : 'soundOn'), h('span', { class: 'rs-chip-label' }, t(profile.muted ? 'sound.off' : 'sound.on')));
    soundBtn.setAttribute('aria-pressed', String(!profile.muted));
    langBtn.textContent = t('lang'); langBtn.setAttribute('aria-label', getLang() === 'fr' ? 'English' : 'Français');
    shopBtn.innerHTML = ''; shopBtn.append(icon('shop'), h('span', { class: 'rs-chip-label' }, t(opts.onExit ? 'shopmode.exit' : 'shopmode')));
  }
  renderTop();

  // --- sans WebGL : l'affiche, et la boutique ------------------------------------------------------------
  if (!hasWebGL2()) {
    root.append(h('div', { class: 'rs-fallback' }, h('div', {},
      h('h1', { class: 'rs-logo' }, 'Respawn', h('small', {}, 'Skate Co.')),
      h('p', {}, t('webgl.text')),
      h('a', { class: 'rs-btn rs-btn--acid', href: shopUrl }, t('shopmode')))), topbar);
    return { destroy: () => root.remove() };
  }

  // --- écran titre (affiche instantanée) -----------------------------------------------------------------
  const loadbar = h('i');
  const press = h('div', { class: 'rs-press rs-hidden' }, t(quality.touch ? 'title.tap' : 'title.press'));
  const title = h('div', { class: 'rs-title' }, h('div', {},
    h('h1', { class: 'rs-logo' }, 'Respawn', h('small', {}, 'Skate Co.')),
    h('p', { class: 'rs-tagline' }, t('title.tagline')),
    h('div', { class: 'rs-loadbar', role: 'progressbar', 'aria-label': t('title.loading') }, loadbar),
    press));
  root.append(ui, title, topbar);

  // animations réduites : on ne lance la 3D que sur demande
  if (quality.reducedMotion && !opts.forceStart) {
    const go = h('button', { class: 'rs-btn rs-btn--acid', onClick: () => { go.remove(); boot(); } }, t('reduced.play'));
    title.firstChild.append(h('p', { class: 'rs-tagline' }, t('reduced.text')), go);
    loadbar.parentElement.classList.add('rs-hidden');
  } else boot();

  let game = null, spawnUI = null, input = null, cat = null;
  const state = { screen: 'title' };

  async function boot() {
    loadbar.style.width = '15%';
    cat = await loadCatalog({ catalog: opts.catalog, catalogUrl: opts.catalogUrl, assetBase });
    loadbar.style.width = '35%';
    const canvas = h('canvas', { class: 'rs-canvas', 'aria-hidden': 'true', tabindex: '-1' });
    root.insertBefore(canvas, ui);
    input = new Input(window);
    game = new Game({ canvas, quality, assetBase, input });
    game.audio = audio;
    const lookFrom = () => lookFromProfile(profile, cat);
    await game.setLook(lookFrom());
    applyStats();
    loadbar.style.width = '80%';
    game.spawn();
    game.start();
    await Promise.race([game.env.ready, new Promise((r) => setTimeout(r, 2500))]);
    loadbar.style.width = '100%';
    title.classList.add('rs-over3d');
    if (import.meta.env && import.meta.env.DEV) exposeDev();
    const qs = new URLSearchParams(location.search);
    if (qs.get('photo')) { title.classList.add('rs-out'); topbar.classList.add('rs-hidden'); applyPhoto(game, qs.get('photo')); return; }
    if (qs.has('skeleton')) game.toggleSkeleton();
    if (!profile.created || qs.has('spawn')) openSpawn();
    else { press.classList.remove('rs-hidden'); loadbar.parentElement.classList.add('rs-hidden'); waitStart(); }
  }

  function applyStats() {
    const st = loadoutStats(cat, profile.loadout);
    game.ctrl.stats.pop = st.pop; game.ctrl.stats.grip = st.grip; game.ctrl.stats.glisse = st.glisse;
  }

  function waitStart() {
    state.screen = 'title';
    const start = (e) => {
      if (e.type === 'keydown' && !['Space', 'Enter'].includes(e.code)) return;
      if (e.type === 'pointerdown' && e.target.closest && e.target.closest('.rs-topbar')) return;
      window.removeEventListener('keydown', start); title.removeEventListener('pointerdown', start);
      audio.unlock();
      play();
    };
    window.addEventListener('keydown', start); title.addEventListener('pointerdown', start);
    cleanups.push(() => { window.removeEventListener('keydown', start); title.removeEventListener('pointerdown', start); });
  }

  // --- spawn point -------------------------------------------------------------------------------------
  function openSpawn() {
    state.screen = 'spawn';
    title.classList.add('rs-out');
    game.mode = 'spawn';
    game.spawn();
    const unlockedObjectives = profile.unlocked || [];
    spawnUI = createSpawnScreen({
      profile, catalog: cat,
      isUnlocked: (p) => isUnlocked(p, unlockedObjectives, OBJECTIVES),
      onChange: async (p, what) => {
        if (what !== 'name' && what !== 'sizes') await game.setLook(lookFromProfile(p, cat));
        applyStats();
        saveProfile(p);
        audio.play('click');
      },
      onDropIn: () => { profile.created = true; saveProfile(profile); audio.unlock(); closeSpawn(); play(); },
    });
    ui.appendChild(spawnUI.el);
    // caméra : le perso tourne doucement sur lui-même au spawn, décalé à droite du panneau
    let a = 0.9;
    game.cameraOverride = (cam, dt) => {
      if (!quality.reducedMotion) a += dt * 0.22;
      const p = game.ctrl.pos;
      const narrow = root.clientWidth < 760;
      const dist = narrow ? 4.4 : 3.7, lift = narrow ? 1.5 : 1.2;
      cam.position.set(p.x + Math.sin(a) * dist, p.y + lift, p.z + Math.cos(a) * dist);
      const side = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
      // le perso se place dans la partie libre de l'écran (à droite du panneau)
      const look = new THREE.Vector3(p.x, p.y + (narrow ? 0.45 : 0.9), p.z).addScaledVector(side, narrow ? 0 : -0.95);
      cam.lookAt(look);
      if (cam.fov !== 45) { cam.fov = 45; cam.updateProjectionMatrix(); }
    };
    setTimeout(() => spawnUI && spawnUI.focus(), 50);
  }
  function closeSpawn() {
    if (spawnUI) { spawnUI.el.remove(); spawnUI = null; }
    game.cameraOverride = null;
  }

  // --- jeu --------------------------------------------------------------------------------------------------
  function play() {
    state.screen = 'play';
    title.classList.add('rs-out');
    game.cameraOverride = null;
    game.mode = 'play';
    game.snapCamera();
    root.focus && root.focus();
  }

  const offLang = onLang(() => { root.setAttribute('lang', getLang()); renderTop(); if (spawnUI) spawnUI.render(); press.textContent = t(quality.touch ? 'title.tap' : 'title.press'); });
  cleanups.push(offLang);

  function exposeDev() {
    window.__rs = game;
    window.__dev = {
      THREE, loadFresh, photo: (n) => applyPhoto(game, n), profile, cat,
      orbit(deg = 0, dist = 2.4, hh = 1.1) {
        if (deg === null) { game.cameraOverride = null; return; }
        game.cameraOverride = (cam) => {
          const p = game.ctrl.pos, r = (deg * Math.PI) / 180;
          cam.position.set(p.x + Math.sin(r) * dist, p.y + hh, p.z + Math.cos(r) * dist);
          cam.lookAt(p.x, p.y + 0.8, p.z);
        };
      },
    };
    window.addEventListener('keydown', (e) => { if (e.code === 'F2') game.toggleSkeleton(); });
  }

  return {
    get game() { return game; },
    openSpawn: () => game && openSpawn(),
    destroy() {
      for (const f of cleanups) try { f(); } catch (e) { /* rien */ }
      if (game) { game.dispose(); }
      if (input) input.dispose();
      audio.dispose();
      root.remove();
    },
  };
}
