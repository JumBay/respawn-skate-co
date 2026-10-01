// Commandes tactiles : joystick flottant à gauche, grappe de boutons à droite (pouces).
// Multi-touch : chaque doigt est suivi par son identifiant ; tout passe par input.setStick/setButton.
import { h } from './dom.js';

const BTN = [
  ['ollie', 'OLLIE'], ['flip', 'FLIP'], ['grab', 'GRAB'], ['grind', 'GRIND'], ['manual', 'MANUAL'], ['special', 'SPÉCIAL'],
];

export function createTouchControls(input) {
  const knob = h('i');
  const stick = h('div', { class: 'rs-stick', 'aria-hidden': 'true' }, knob);
  const pad = h('div', { class: 'rs-pad' });
  const buttons = {};
  for (const [name, label] of BTN) {
    const b = h('button', { class: `rs-b-${name}`, 'aria-label': label, type: 'button' }, label);
    buttons[name] = b;
    pad.appendChild(b);
  }
  const el = h('div', { class: 'rs-touch' }, stick, pad);

  // joystick : le centre suit le premier contact dans la zone gauche
  let stickId = null, cx = 0, cy = 0;
  const R = 52;
  const setKnob = (dx, dy) => { knob.style.transform = `translate(${dx}px, ${dy}px)`; };
  const onStickDown = (e) => {
    if (stickId !== null) return;
    stickId = e.pointerId;
    const r = stick.getBoundingClientRect();
    cx = r.left + r.width / 2; cy = r.top + r.height / 2;
    stick.setPointerCapture && stick.setPointerCapture(e.pointerId);
    onStickMove(e);
    e.preventDefault();
  };
  const onStickMove = (e) => {
    if (e.pointerId !== stickId) return;
    let dx = e.clientX - cx, dy = e.clientY - cy;
    const d = Math.hypot(dx, dy);
    if (d > R) { dx *= R / d; dy *= R / d; }
    setKnob(dx, dy);
    const nx = dx / R, ny = -dy / R;
    // zone morte douce
    const m = Math.hypot(nx, ny);
    const k = m < 0.15 ? 0 : (m - 0.15) / 0.85 / m;
    input.setStick(nx * k, ny * k);
    e.preventDefault();
  };
  const onStickUp = (e) => {
    if (e.pointerId !== stickId) return;
    stickId = null; setKnob(0, 0); input.setStick(0, 0);
  };
  stick.addEventListener('pointerdown', onStickDown);
  stick.addEventListener('pointermove', onStickMove);
  stick.addEventListener('pointerup', onStickUp);
  stick.addEventListener('pointercancel', onStickUp);

  // boutons : appui maintenu (ollie chargé, grab tenu)
  for (const [name, b] of Object.entries(buttons)) {
    const down = (e) => { b.classList.add('rs-held'); input.setButton(name, true); b.setPointerCapture && b.setPointerCapture(e.pointerId); e.preventDefault(); if (navigator.vibrate && name === 'ollie') try { navigator.vibrate(8); } catch (_) { /* rien */ } };
    const up = () => { b.classList.remove('rs-held'); input.setButton(name, false); };
    b.addEventListener('pointerdown', down);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  el.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });

  return {
    el,
    setSpecialReady(on) { buttons.special.classList.toggle('rs-ready', !!on); },
    show(on) { el.classList.toggle('rs-hidden', !on); if (!on) { input.setStick(0, 0); for (const n of Object.keys(buttons)) input.setButton(n, false); } },
  };
}
