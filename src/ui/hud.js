// HUD arcade : score, chrono, lettres S-K-A-T-E et cassette, jauge spécial, combo en cours,
// annonces (tricks, gaps, chutes), équilibre de grind / manual, objectifs, tutoriel, invite shop.
import { h, icon } from './dom.js';
import { t, fmt, getLang, OBJECTIVE_LABELS } from '../i18n.js';
import { OBJECTIVES } from '../game/objectives.js';
import { dailyLabel } from '../game/run.js';

export function createHUD({ quality, onPause, onShop }) {
  const score = h('div', { class: 'rs-score' }, h('span', {}, t('hud.score')), h('b', {}, '0'));
  const timer = h('div', { class: 'rs-timer', 'aria-live': 'off' }, '2:00');
  const letters = h('div', { class: 'rs-letters', 'aria-label': 'S-K-A-T-E' }, ...'SKATE'.split('').map((c) => h('i', { 'data-ch': c }, c)), h('i', { class: 'rs-tape', 'data-ch': 'tape' }, '▣'));
  const specialBar = h('i');
  const special = h('div', { class: 'rs-special' }, specialBar);
  const specialLabel = h('div', { class: 'rs-special-label' }, t('hud.special'));
  const comboTricks = h('div', { class: 'rs-tricks' });
  const comboPts = h('div', { class: 'rs-pts' });
  const combo = h('div', { class: 'rs-combo', 'aria-live': 'polite' }, comboTricks, comboPts);
  const balanceI = h('i');
  const balance = h('div', { class: 'rs-balance rs-hidden' }, balanceI);
  const objList = h('ul');
  const objTitle = h('h3', {}, t('objectives'));
  const objectives = h('div', { class: 'rs-objectives' }, objTitle, objList);
  const prompt = h('button', { class: 'rs-prompt rs-hidden', onClick: () => onShop() }, '');
  const tuto = h('div', { class: 'rs-tuto rs-hidden', role: 'status' });
  const pauseBtn = h('button', { class: 'rs-chip', 'aria-label': t('hud.pause'), onClick: () => onPause() }, icon('pause'), h('span', { class: 'rs-chip-label' }, t('hud.pause')));
  const shopBtn = h('button', { class: 'rs-chip', onClick: () => onShop() }, icon('shop'), h('span', { class: 'rs-chip-label' }, t('hud.shop')));
  const btns = h('div', { class: 'rs-hudbtns' }, shopBtn, pauseBtn);
  const fps = h('div', { class: 'rs-fps' });
  const el = h('div', { class: 'rs-hud' }, score, timer, letters, special, specialLabel, objectives, combo, balance, prompt, tuto, btns, fps);
  if (quality.touch) { btns.style.bottom = 'auto'; btns.style.right = 'auto'; btns.style.left = 'max(16px, env(safe-area-inset-left))'; btns.style.top = 'calc(max(12px, env(safe-area-inset-top)) + 150px)'; }
  // sur téléphone, la liste d'objectifs s'ouvre d'un tap sur le chrono
  timer.style.pointerEvents = 'auto';
  timer.addEventListener('click', () => objectives.classList.toggle('rs-open'));

  let comboFade = 0, lastScore = -1;
  const api = {
    el,
    setScore(n) { if (n !== lastScore) { score.lastChild.textContent = fmt(n); lastScore = n; } },
    setTime(sec, mode) {
      timer.classList.toggle('rs-free', mode !== 'run');
      if (mode !== 'run') { timer.textContent = t('hud.free'); timer.classList.remove('rs-warn'); return; }
      const s = Math.max(0, Math.ceil(sec));
      timer.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      timer.classList.toggle('rs-warn', s <= 10);
    },
    setLetters(set, tape) {
      for (const i of letters.children) i.classList.toggle('rs-on', i.dataset.ch === 'tape' ? !!tape : set.has(i.dataset.ch));
    },
    setSpecial(x) { specialBar.style.width = `${Math.round(x * 100)}%`; special.classList.toggle('rs-full', x >= 0.999); },
    setCombo(c) {
      if (!c.items.length) { if (comboFade <= 0) { comboTricks.textContent = ''; comboPts.textContent = ''; } return; }
      combo.classList.remove('rs-banked', 'rs-lost');
      comboFade = 0;
      const names = c.items.slice(-6).map((i) => i.name).join(' + ');
      comboTricks.textContent = (c.items.length > 6 ? '… + ' : '') + names;
      comboPts.innerHTML = '';
      comboPts.append(fmt(c.base), ' ', h('em', {}, `× ${c.mult}`));
    },
    bank(e) {
      combo.classList.add('rs-banked'); comboFade = 1.4;
      comboPts.innerHTML = ''; comboPts.append(`+${fmt(e.total)}`);
    },
    lost() {
      combo.classList.add('rs-lost'); comboFade = 1.2;
    },
    pop(text, cls = '') {
      const p = h('div', { class: 'rs-pop ' + cls, 'aria-hidden': 'true' }, text);
      el.appendChild(p);
      setTimeout(() => p.remove(), 1450);
    },
    setBalance(v, vertical) {
      if (v == null) { balance.classList.add('rs-hidden'); return; }
      balance.classList.remove('rs-hidden');
      balance.classList.toggle('rs-vertical', !!vertical);
      const k = Math.max(-1, Math.min(1, v)) * 50 + 50;
      if (vertical) { balanceI.style.top = `${100 - k}%`; balanceI.style.left = ''; } else { balanceI.style.left = `${k}%`; balanceI.style.top = ''; }
    },
    setObjectives(run) {
      const L = OBJECTIVE_LABELS[getLang()];
      objList.innerHTML = '';
      for (const o of OBJECTIVES) objList.append(h('li', { class: run.done.has(o.id) ? 'rs-done' : '' }, L[o.id]));
      objList.append(h('li', { class: run.dailyDone ? 'rs-done' : '' }, `${t('daily.title')} : ${dailyLabel(run.daily, getLang())}`));
      objTitle.textContent = t('objectives');
    },
    setPrompt(text) { if (!text) prompt.classList.add('rs-hidden'); else { prompt.textContent = text; prompt.classList.remove('rs-hidden'); } },
    setTuto(text) { if (!text) tuto.classList.add('rs-hidden'); else { tuto.textContent = text; tuto.classList.remove('rs-hidden'); } },
    setFps(v) { fps.textContent = v ? `${Math.round(v)} i/s` : ''; },
    tick(dt) {
      if (comboFade > 0) { comboFade -= dt; if (comboFade <= 0) { comboTricks.textContent = ''; comboPts.textContent = ''; combo.classList.remove('rs-banked', 'rs-lost'); } }
    },
    relabel() {
      score.firstChild.textContent = t('hud.score'); specialLabel.textContent = t('hud.special');
      pauseBtn.lastChild.textContent = t('hud.pause'); shopBtn.lastChild.textContent = t('hud.shop');
    },
  };
  return api;
}
