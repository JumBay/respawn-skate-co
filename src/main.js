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
import { Run } from './game/run.js';
import { createHUD } from './ui/hud.js';
import { createTouchControls } from './ui/touch.js';
import { createShop, goalLabel } from './ui/shop.js';
import { createShopBridge } from './shop-bridge.js';
import { challengeLink, readChallenge, shareCard } from './game/share.js';
import { recordScore } from './profile.js';
import { load, save } from './core/storage.js';
import { OBJECTIVE_LABELS, fmt } from './i18n.js';
import { dailyLabel } from './game/run.js';

// L'intégration (accueil de la boutique) peut savoir si le visiteur a fermé le jeu.
export const wasExited = () => !!load('exited', false);
export const clearExited = () => save('exited', false);

export async function mount(el, opts = {}) {
  const shopUrl = opts.shopUrl || '/';
  // couche plein écran : le jeu crée son propre calque fixe au-dessus de la page et bloque le
  // défilement tant qu'il est monté (rendu à l'identique au démontage)
  let layer = null, prevOverflow = null, api = null, destroyed = false;
  if (opts.overlay || !el) {
    layer = document.createElement('div');
    layer.className = 'rs-layer';
    layer.setAttribute('role', 'region');
    layer.setAttribute('aria-label', 'Respawn Skate Co.');
    Object.assign(layer.style, { position: 'fixed', inset: '0', zIndex: String(opts.zIndex || 2147483000), background: '#2a1b52' });
    (el || document.body).appendChild(layer);
    el = layer;
    prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
  }
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
    save('exited', true);
    emitOut('exit', {});
    if (opts.onExit) opts.onExit();
    else if (layer) api.destroy();
    else location.href = shopUrl;
  };
  // événements vers l'intégration : opts.onEvent(nom, données) et window « respawn:<nom> »
  const emitOut = (name, data) => {
    try { if (opts.onEvent) opts.onEvent(name, data); } catch (e) { /* rien */ }
    try { window.dispatchEvent(new CustomEvent('respawn:' + name, { detail: data })); } catch (e) { /* rien */ }
  };

  // barre du haut : toujours visible
  const profile = loadProfile();
  const audio = new AudioEngine();
  audio.setMuted(!!profile.muted);
  const soundBtn = h('button', { class: 'rs-chip', 'aria-pressed': String(!profile.muted), onClick: () => {
    profile.muted = !profile.muted; audio.setMuted(profile.muted); saveProfile(profile); renderTop();
  } });
  const langBtn = h('button', { class: 'rs-chip', onClick: () => setLang(getLang() === 'fr' ? 'en' : 'fr') });
  const shopBtn = h('a', { class: 'rs-chip rs-chip--shop', href: shopUrl, onClick: (e) => { e.preventDefault(); exitToShop(); } });
  const topbar = h('div', { class: 'rs-topbar' }, langBtn, soundBtn, shopBtn);
  function renderTop() {
    soundBtn.innerHTML = ''; soundBtn.append(icon(profile.muted ? 'soundOff' : 'soundOn'), h('span', { class: 'rs-chip-label' }, t(profile.muted ? 'sound.off' : 'sound.on')));
    soundBtn.setAttribute('aria-pressed', String(!profile.muted));
    langBtn.textContent = t('lang'); langBtn.setAttribute('aria-label', getLang() === 'fr' ? 'English' : 'Français');
    shopBtn.innerHTML = ''; shopBtn.append(icon('shop'), h('span', { class: 'rs-chip-label' }, t(opts.onExit || layer ? 'shopmode.exit' : 'shopmode')));
  }
  renderTop();

  // --- sans WebGL : l'affiche, et la boutique ------------------------------------------------------------
  if (!hasWebGL2()) {
    root.append(h('div', { class: 'rs-fallback' }, h('div', {},
      h('h1', { class: 'rs-logo' }, 'Respawn', h('small', {}, 'Skate Co.')),
      h('p', {}, t('webgl.text')),
      h('a', { class: 'rs-btn rs-btn--acid', href: shopUrl }, t('shopmode')))), topbar);
    api = { destroy: () => { if (destroyed) return; destroyed = true; root.remove(); if (layer) { layer.remove(); document.documentElement.style.overflow = prevOverflow || ''; } emitOut('destroy', {}); } };
    return api;
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

  let game = null, spawnUI = null, input = null, cat = null, hud = null, touch = null, run = null, bridge = null, shopUI = null, modal = null;
  const state = { screen: 'title', tuto: null, countdown: 0, challenge: readChallenge(), slowmo: 0, newUnlocks: [] };
  const toastEl = h('div', { class: 'rs-toast rs-hidden', role: 'status', 'aria-live': 'polite' });
  root.appendChild(toastEl);
  let toastT = 0;
  function toast(text, ms = 2600) {
    toastEl.textContent = text; toastEl.classList.remove('rs-hidden');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.add('rs-hidden'), ms);
  }

  async function boot() {
    loadbar.style.width = '15%';
    cat = await loadCatalog({ catalog: opts.catalog, catalogUrl: opts.catalogUrl, assetBase });
    bridge = createShopBridge({ catalog: cat, shopUrl, mode: opts.cartMode });
    loadbar.style.width = '35%';
    const canvas = h('canvas', { class: 'rs-canvas', 'aria-hidden': 'true', tabindex: '-1' });
    root.insertBefore(canvas, ui);
    input = new Input(window);
    game = new Game({ canvas, quality, assetBase, input });
    game.audio = audio;
    run = new Run(game, game.ev);
    wireEvents();
    hud = createHUD({ quality, onPause: () => openPause(), onShop: () => openShop() });
    hud.el.classList.add('rs-hidden');
    ui.appendChild(hud.el);
    if (quality.touch) { touch = createTouchControls(input); touch.show(false); ui.appendChild(touch.el); }
    game.onFrame = onFrame;
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
    if (state.challenge) press.textContent = t('challenge.from', { name: state.challenge.name, score: fmt(state.challenge.score) });
    if (!profile.created || qs.has('spawn')) openSpawn();
    else { press.classList.remove('rs-hidden'); loadbar.parentElement.classList.add('rs-hidden'); waitStart(); }
    emitOut('ready', {});
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
      audio.unlock(); audio.setMusic(profile.music !== false);
      play();
    };
    window.addEventListener('keydown', start); title.addEventListener('pointerdown', start);
    cleanups.push(() => { window.removeEventListener('keydown', start); title.removeEventListener('pointerdown', start); });
  }

  // --- caméra des écrans d'habillage (spawn, shop) : le perso tourne doucement, décalé du panneau ---
  function showcaseCamera(side = -0.95) {
    let a = 0.9;
    game.cameraOverride = (cam, dt) => {
      if (!quality.reducedMotion) a += dt * 0.22;
      const p = game.ctrl.pos;
      const narrow = root.clientWidth < 760;
      const dist = narrow ? 4.4 : 3.7, lift = narrow ? 1.5 : 1.2;
      cam.position.set(p.x + Math.sin(a) * dist, p.y + lift, p.z + Math.cos(a) * dist);
      const sv = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
      const look = new THREE.Vector3(p.x, p.y + (narrow ? 0.45 : 0.9), p.z).addScaledVector(sv, narrow ? 0 : side);
      cam.lookAt(look);
      if (cam.fov !== 45) { cam.fov = 45; cam.updateProjectionMatrix(); }
    };
  }

  // --- spawn point -------------------------------------------------------------------------------------
  function openSpawn() {
    closeModal(); closeShop(true);
    state.screen = 'spawn';
    title.classList.add('rs-out');
    showHUD(false);
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
      onDropIn: () => { profile.created = true; saveProfile(profile); audio.unlock(); audio.setMusic(profile.music !== false); closeSpawn(); play(); },
    });
    ui.appendChild(spawnUI.el);
    showcaseCamera(-0.95);
    setTimeout(() => spawnUI && spawnUI.focus(), 50);
  }
  function closeSpawn() {
    if (spawnUI) { spawnUI.el.remove(); spawnUI = null; }
    game.cameraOverride = null;
  }

  // --- jeu --------------------------------------------------------------------------------------------------
  function showHUD(on) {
    hud && hud.el.classList.toggle('rs-hidden', !on);
    touch && touch.show(on);
  }

  function play(mode) {
    closeModal();
    state.screen = 'play';
    title.classList.add('rs-out');
    game.cameraOverride = null;
    game.mode = 'play';
    game.paused = false; game.timeScale = 1;
    showHUD(true);
    const first = !profile.tutorialDone;
    run.start(mode || (first ? 'free' : 'run'));
    hud.setObjectives(run);
    hud.setLetters(run.letters, false);
    game.snapCamera();
    if (first) startTuto();
    else countdown();
    if (state.challenge) toast(t('challenge.from', { name: state.challenge.name, score: fmt(state.challenge.score) }), 4200);
    emitOut('runStart', { mode: run.mode });
    root.focus && root.focus();
  }

  function countdown() {
    if (run.mode !== 'run') return;
    state.countdown = 1.6;
    hud.pop(t('run.ready'));
    audio.play('countdown');
  }

  // tutoriel intégré au premier run : une consigne à la fois, validée par le geste lui-même
  const TUTO = ['push', 'ollie', 'flip', 'grab', 'grind', 'manual'];
  function startTuto() { state.tuto = { i: 0, t: 0 }; showTuto(); }
  function showTuto() {
    const s = state.tuto;
    if (!s) { hud.setTuto(null); return; }
    const key = 'tuto.' + TUTO[s.i] + (quality.touch ? '.touch' : '');
    hud.setTuto(`${s.i + 1}/${TUTO.length} · ${t(key)}${quality.touch ? '' : '   ·   ' + (getLang() === 'en' ? 'Esc: skip' : 'Échap : passer')}`);
  }
  function tutoDone(step) {
    const s = state.tuto;
    if (!s || TUTO[s.i] !== step) return;
    audio.play('letter');
    s.i++;
    if (s.i >= TUTO.length) endTuto(); else showTuto();
  }
  function endTuto() {
    state.tuto = null; hud.setTuto(null);
    profile.tutorialDone = true; saveProfile(profile);
    hud.pop(getLang() === 'en' ? 'Timed run!' : 'Run chronométré !', 'rs-acid');
    run.start('run'); hud.setObjectives(run); hud.setLetters(run.letters, false);
    countdown();
  }

  function onFrame(dt, sdt) {
    if (!run || state.screen === 'title') return;
    const b = input.btn;
    if (state.screen === 'play') {
      if (b.pause.pressed) { if (state.tuto) { endTuto(); } else openPause(); return; }
      if (b.respawn.pressed) { audio.play('respawn'); play(run.mode); return; }
      if (b.mute.pressed) { profile.muted = !profile.muted; audio.setMuted(profile.muted); saveProfile(profile); renderTop(); }
      if (state.countdown > 0) {
        const before = state.countdown; state.countdown -= dt;
        if (before > 0.8 && state.countdown <= 0.8) { hud.pop(t('run.go'), 'rs-acid'); audio.play('go'); }
      } else run.update(sdt);
      // juice : ralenti court sur les grosses réceptions
      if (state.slowmo > 0) { state.slowmo -= dt; game.timeScale = state.slowmo > 0 ? 0.4 : 1; }
      // tutoriel
      const c = game.ctrl;
      if (state.tuto) {
        state.tuto.t += dt;
        if (TUTO[state.tuto.i] === 'push' && c.speed > 5) tutoDone('push');
        if (TUTO[state.tuto.i] === 'manual' && c.manual && c.manual.t > 0.6) tutoDone('manual');
      }
      // zone du shop
      const z = game.park.shopZone;
      const near = Math.hypot(c.pos.x - z.x, c.pos.z - z.z) < z.r && c.state === 'ground';
      hud.setPrompt(near ? `${t('hud.enterShop')}${quality.touch ? '' : ' (E)'}` : null);
      if (near && b.interact.pressed) openShop();
      // HUD
      hud.setScore(game.tricks.score);
      hud.setTime(run.time, run.mode);
      hud.setSpecial(game.tricks.special);
      touch && touch.setSpecialReady(game.tricks.specialReady());
      const bal = c.state === 'grind' && c.grind ? c.grind.balance : c.manual ? c.manual.balance : null;
      hud.setBalance(bal, !!c.manual && c.state !== 'grind');
      hud.tick(dt);
      // son de roulement et de grind
      const kind = c.state === 'grind' ? 'metal' : (c.surfaceKind || 'concrete');
      audio.setRoll(c.state === 'ground' ? c.speed : 0, kind);
      audio.setGrind(c.state === 'grind', c.speed);
      audio.setIntensity(Math.min(1, game.tricks.combo.items.length / 8));
    } else {
      audio.setRoll(0, 'concrete'); audio.setGrind(false, 0);
      if (state.screen === 'results' && (b.respawn.pressed || b.ollie.pressed)) { audio.play('click'); play('run'); }
      if (state.screen === 'shop' && (b.pause.pressed)) closeShop();
    }
  }

  function wireEvents() {
    const E = game.ev;
    const fr = () => getLang() !== 'en';
    E.on('ollie', () => { audio.play('ollie'); tutoDone('ollie'); });
    E.on('land', (e) => { audio.play('land', { impact: e.impact }); });
    E.on('bonk', () => audio.play('bonk'));
    E.on('flipStart', () => { audio.play('flip'); tutoDone('flip'); });
    E.on('grabStart', () => { audio.play('grab'); tutoDone('grab'); });
    E.on('grind', () => tutoDone('grind'));
    E.on('bail', () => { audio.play('bail'); if (state.screen === 'play') hud.pop(t('bail'), 'rs-cone'); });
    E.on('respawn', () => audio.play('respawn'));
    E.on('cone', () => audio.play('cone'));
    E.on('powerslide', () => audio.play('powerslide'));
    E.on('combo', (c) => hud && hud.setCombo(c));
    E.on('bank', (e) => {
      hud.bank(e); audio.play('bank', { total: e.total });
      if (e.total >= 2500) hud.pop(`+${fmt(e.total)}`, e.total >= 10000 ? 'rs-acid' : '');
    });
    E.on('comboLost', () => { hud.lost(); audio.play('comboLost'); });
    E.on('special', (e) => { audio.play('special'); hud.pop(e.name, 'rs-acid'); state.slowmo = quality.reducedMotion ? 0 : 0.5; });
    E.on('gap', (e) => { audio.play('gap'); hud.pop(e.gap.name + ' !', 'rs-acid'); });
    E.on('landing', (e) => { if (e.quality === 'perfect') hud.pop(t('perfect')); });
    E.on('bigAir', () => { if (!quality.reducedMotion) state.slowmo = 0.35; });
    E.on('letter', (e) => { audio.play('letter'); hud.setLetters(run.letters, run.cassette); hud.pop(e.all ? 'S-K-A-T-E !' : e.ch, 'rs-acid'); });
    E.on('cassette', () => { audio.play('cassette'); hud.setLetters(run.letters, true); hud.pop(fr() ? 'Cassette cachée !' : 'Hidden tape!', 'rs-acid'); });
    E.on('tick', () => audio.play('countdown'));
    E.on('objectiveUnlocked', (e) => {
      hud.setObjectives(run);
      const first = !(profile.unlocked || []).includes(e.id);
      if (first) {
        profile.unlocked = [...(profile.unlocked || []), e.id]; saveProfile(profile);
        const prods = cat.products.filter((p) => p.exclusive_unlock && isUnlocked(p, [e.id], OBJECTIVES));
        state.newUnlocks.push(...prods);
        if (prods.length) setTimeout(() => toast(`${t('results.unlocked')} · ${prods.map((p) => p.name.split(',')[0]).join(', ')}`, 3800), 900);
      }
      hud.pop('✓ ' + OBJECTIVE_LABELS[getLang()][e.id]);
      emitOut('objectiveUnlocked', { id: e.id, first, products: cat.products.filter((p) => p.exclusive_unlock && isUnlocked(p, [e.id], OBJECTIVES)).map((p) => p.id) });
    });
    E.on('tierReached', (e) => {
      hud.pop((fr() ? 'Palier ' : 'Tier ') + e.tier.toUpperCase(), 'rs-acid');
      emitOut('tierReached', { tier: e.tier, score: e.score, reward: rewardFor(e.tier) });
    });
    E.on('dailyDone', () => { hud.setObjectives(run); hud.pop(t('daily.title') + ' ✓', 'rs-acid'); emitOut('dailyDone', { key: run.daily.key }); });
    E.on('runEnd', (r) => onRunEnd(r));
    E.on('sleep', () => { audio.pause(); if (state.screen === 'play' && !state.tuto) openPause(); });
    E.on('wake', () => { if (!profile.muted) audio.resume(); });
  }

  // Récompenses : points d'accroche seulement. L'intégration peut fournir opts.rewards
  // ({ bronze: { label, code } … }) ; le jeu les affiche, il n'en crée aucune.
  function rewardFor(tier) { return (opts.rewards && opts.rewards[tier]) || null; }

  function onRunEnd(r) {
    if (r.mode !== 'run') return;
    hud.pop(t('run.timeup'));
    audio.play('timeup');
    game.timeScale = quality.reducedMotion ? 1 : 0.3;
    setTimeout(() => showResults(r), quality.reducedMotion ? 300 : 1400);
  }

  function showResults(r) {
    game.timeScale = 1;
    state.screen = 'results';
    game.mode = 'menu';
    showHUD(false);
    const prevBest = (profile.best && profile.best[0] && profile.best[0].score) || 0;
    recordScore(profile, r.score);
    profile.stats.runs = (profile.stats.runs || 0) + 1;
    profile.stats.bails = (profile.stats.bails || 0) + r.stats.bails;
    profile.stats.tricks = (profile.stats.tricks || 0) + r.stats.tricks;
    const dk = r.daily.key;
    profile.daily = { [dk]: Math.max((profile.daily || {})[dk] || 0, r.daily.done ? 1 : 0) };
    saveProfile(profile);
    const newBest = r.score > prevBest && r.score > 0;
    const L = OBJECTIVE_LABELS[getLang()];
    const tier = r.tiers[r.tiers.length - 1];
    const reward = tier ? rewardFor(tier) : null;
    const lines = [
      h('div', { class: 'rs-resline' }, h('span', {}, t('results.best')), h('b', {}, fmt(Math.max(prevBest, r.score)))),
      h('div', { class: 'rs-resline' }, h('span', {}, t('results.combo')), h('b', {}, fmt(r.bestCombo))),
      h('div', { class: 'rs-resline' }, h('span', {}, t('results.objectives')), h('b', {}, `${r.objectives.length}/${OBJECTIVES.length}`)),
      h('div', { class: 'rs-resline' }, h('span', {}, t('daily.title')), h('b', {}, (r.daily.done ? '✓ ' : '✗ ') + dailyLabel(r.daily, getLang()))),
    ];
    if (state.challenge) {
      const won = r.score > state.challenge.score;
      lines.push(h('div', { class: 'rs-resline' }, h('span', {}, `vs ${state.challenge.name}`), h('b', {}, `${fmt(state.challenge.score)} ${won ? '— ' + (getLang() === 'en' ? 'beaten!' : 'battu !') : ''}`)));
    }
    const extra = [];
    if (tier) extra.push(h('div', { class: 'rs-unlock' }, `${t('results.tier')} : ${tier.toUpperCase()}${reward && reward.label ? ' · ' + reward.label : ''}`));
    if (state.newUnlocks.length) extra.push(h('div', { class: 'rs-unlock' }, `${t('results.unlocked')} : ${state.newUnlocks.map((p) => p.name.split(',')[0]).join(', ')}`));
    if (r.objectives.length) extra.push(h('p', { class: 'rs-hint' }, r.objectives.map((id) => '✓ ' + L[id]).join(' · ')));
    const shareBtn = h('button', { class: 'rs-btn rs-btn--ghost', onClick: async () => {
      const link = challengeLink({ name: profile.name, score: r.score, loadout: profile.loadout, gender: profile.gender, skin: profile.skin, hair: profile.head, hairColor: profile.hairColor }, shopUrlAbs());
      const res = await shareCard({ game, score: r.score, bestCombo: r.bestCombo, name: profile.name, lang: getLang(), tier, url: link });
      if (res === 'downloaded') toast('PNG ✓');
    } }, t('results.share'));
    const chalBtn = h('button', { class: 'rs-btn rs-btn--ghost', onClick: async () => {
      const link = challengeLink({ name: profile.name, score: r.score, loadout: profile.loadout, gender: profile.gender, skin: profile.skin, hair: profile.head, hairColor: profile.hairColor }, shopUrlAbs());
      try {
        if (quality.touch && navigator.share) await navigator.share({ url: link, text: t('challenge.from', { name: profile.name || 'Rider', score: fmt(r.score) }) });
        else { await navigator.clipboard.writeText(link); toast(t('results.copied')); }
      } catch (e) {
        if (e && e.name === 'AbortError') return;
        // presse-papiers refusé : le lien s'affiche, sélectionné, à copier à la main
        const box = h('input', { class: 'rs-input', readonly: true, value: link, 'aria-label': t('results.challenge'), onFocus: (ev) => ev.target.select() });
        chalBtn.replaceWith(box); box.focus(); box.select();
      }
    } }, t('results.challenge'));
    openModal(t('results.title'),
      h('div', { class: 'rs-bigscore' }, fmt(r.score)),
      newBest ? h('div', { class: 'rs-unlock' }, t('results.newbest')) : null,
      ...lines, ...extra,
      h('div', { class: 'rs-menu', style: { marginTop: '14px' } },
        h('button', { class: 'rs-btn rs-btn--acid rs-btn--big', onClick: () => play('run') }, `${t('results.again')} (R)`),
        h('button', { class: 'rs-btn rs-btn--pink', onClick: () => openShop() }, t('results.shop')),
        h('div', { class: 'rs-actions' }, shareBtn, chalBtn)));
    state.newUnlocks = [];
    emitOut('runEnd', { score: r.score, bestCombo: r.bestCombo, objectives: r.objectives, tiers: r.tiers, newBest, daily: r.daily.done });
  }
  const shopUrlAbs = () => { const u = new URL(location.href); u.hash = ''; return u.href; };

  // --- modales : pause, commandes, résultats ---------------------------------------------------------
  function openModal(titleText, ...content) {
    closeModal();
    const card = h('div', { class: 'rs-card', role: 'dialog', 'aria-modal': 'true', 'aria-label': titleText }, h('h2', {}, titleText), ...content);
    modal = h('div', { class: 'rs-modal' }, card);
    ui.appendChild(modal);
    const f = card.querySelector('button'); f && setTimeout(() => f.focus(), 30);
  }
  function closeModal() { if (modal) { modal.remove(); modal = null; } }

  function openPause() {
    if (state.screen !== 'play') return;
    state.screen = 'pause';
    game.paused = true; audio.pause();
    showHUD(false);
    const resume = () => { closeModal(); state.screen = 'play'; game.paused = false; if (!profile.muted) audio.resume(); showHUD(true); input.clearEdges(); };
    const onKey = (e) => { if ((e.code === 'Escape' || e.key === 'p') && state.screen === 'pause') { e.preventDefault(); window.removeEventListener('keydown', onKey); resume(); } };
    setTimeout(() => window.addEventListener('keydown', onKey), 0);
    cleanups.push(() => window.removeEventListener('keydown', onKey));
    openModal(t('pause.title'), h('div', { class: 'rs-menu' },
      h('button', { class: 'rs-btn rs-btn--acid rs-btn--big', onClick: () => { window.removeEventListener('keydown', onKey); resume(); } }, t('pause.resume')),
      h('button', { class: 'rs-btn', onClick: () => { window.removeEventListener('keydown', onKey); play('run'); } }, t('pause.run')),
      h('button', { class: 'rs-btn', onClick: () => { window.removeEventListener('keydown', onKey); play('free'); } }, t('pause.free')),
      h('button', { class: 'rs-btn rs-btn--pink', onClick: () => { window.removeEventListener('keydown', onKey); game.paused = false; openShop(); } }, t('pause.shop')),
      h('button', { class: 'rs-btn', onClick: () => { window.removeEventListener('keydown', onKey); game.paused = false; openSpawn(); } }, t('pause.spawn')),
      h('button', { class: 'rs-btn rs-btn--ghost', onClick: () => controls() }, t('pause.controls')),
      h('p', { class: 'rs-hint' }, `${t('daily.title')} : ${dailyLabel(run.daily, getLang())}`)));
    function controls() {
      const K = (k, d) => [h('span', {}, ...k.map((x) => h('kbd', {}, x))), h('span', {}, d)];
      const fr = getLang() !== 'en';
      modal.querySelector('.rs-card').append(h('div', { class: 'rs-keys', style: { marginTop: '14px' } },
        ...K(['↑', 'W/Z'], fr ? 'pousser' : 'push'), ...K(['← →'], fr ? 'tourner' : 'steer'), ...K(['Espace'], fr ? 'ollie (maintenir, relâcher)' : 'ollie (hold, release)'),
        ...K(['J', 'X'], 'flip + direction'), ...K(['K', 'C'], 'grab + direction'), ...K(['L', 'V'], 'grind'), ...K(['U', 'N'], 'manual'),
        ...K(['I', 'B'], fr ? 'spécial (jauge pleine)' : 'special (full meter)'), ...K(['R'], fr ? 'relancer le run' : 'restart run'), ...K(['E'], 'shop'), ...K(['Échap', 'P'], 'pause'), ...K(['M'], fr ? 'son' : 'sound')));
    }
  }

  // --- shop -------------------------------------------------------------------------------------------
  function openShop() {
    if (!cat) return;
    closeModal();
    const from = state.screen;
    state.shopFrom = from === 'results' ? 'results' : 'play';
    state.screen = 'shop';
    game.paused = false;
    game.mode = 'shop';
    showHUD(false);
    shopUI = createShop({
      catalog: cat, profile, bridge,
      isUnlocked: (p) => isUnlocked(p, profile.unlocked || [], OBJECTIVES),
      unlockGoal: (p) => goalLabel(p, OBJECTIVES),
      toast,
      onTry: async (p) => {
        const items = p.slot === 'pack' ? p.pack_items.map((id) => cat.byId.get(id)).filter(Boolean) : [p];
        for (const it of items) if (it.slot && it.slot !== 'pack') profile.loadout[it.slot] = it.id;
        saveProfile(profile);
        await game.setLook(lookFromProfile(profile, cat));
        applyStats();
        audio.play('click');
      },
      onClose: () => closeShop(),
    });
    ui.appendChild(shopUI.el);
    showcaseCamera(0.95);
    emitOut('shopOpen', {});
    setTimeout(() => shopUI && shopUI.focus(), 30);
  }
  function closeShop(silent) {
    if (!shopUI) return;
    shopUI.el.remove(); shopUI = null;
    game.cameraOverride = null;
    if (silent) return;
    if (state.shopFrom === 'results' || (run && run.ended)) { play('run'); return; }
    state.screen = 'play'; game.mode = 'play'; showHUD(true); game.snapCamera(); input.clearEdges();
  }

  const offLang = onLang(() => { root.setAttribute('lang', getLang()); renderTop(); if (spawnUI) spawnUI.render(); if (shopUI) shopUI.render(); if (hud) { hud.relabel(); run && hud.setObjectives(run); } if (state.tuto) showTuto(); press.textContent = t(quality.touch ? 'title.tap' : 'title.press'); });
  cleanups.push(offLang);

  function exposeDev() {
    window.__rs = game;
    window.__dev = {
      THREE, run, hud, state, openShop, openPause, showResults, play, loadFresh, photo: (n) => applyPhoto(game, n), profile, cat,
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

  api = {
    get game() { return game; },
    openSpawn: () => game && openSpawn(),
    openShop: () => game && openShop(),
    pause: () => openPause(),
    bridge: () => bridge,
    destroy() {
      if (destroyed) return; destroyed = true;
      for (const f of cleanups) try { f(); } catch (e) { /* rien */ }
      if (game) { game.dispose(); }
      if (input) input.dispose();
      audio.dispose();
      root.remove();
      if (layer) { layer.remove(); document.documentElement.style.overflow = prevOverflow || ''; }
      emitOut('destroy', {});
    },
  };
  return api;
}
