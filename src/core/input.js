// Entrées : clavier, manette (Gamepad API) et commandes tactiles virtuelles, fusionnées.
// Chaque bouton expose down (maintenu), pressed (appuyé à cette image), released.

const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  Space: 'ollie',
  KeyJ: 'flip', KeyX: 'flip',
  KeyK: 'grab', KeyC: 'grab',
  KeyL: 'grind', KeyV: 'grind',
  KeyU: 'manual', KeyN: 'manual',
  KeyI: 'special', KeyB: 'special',
  Escape: 'pause', KeyP: 'pause',
  KeyE: 'interact', Enter: 'interact',
  KeyR: 'respawn',
  KeyM: 'mute',
};
// e.code désigne la position physique : WASD en QWERTY = ZQSD en AZERTY, sans rien changer.
// Les touches de menu (M, P, E, R) se lisent aussi par leur lettre (e.key), quelle que soit la disposition.
const KEYMAP_LETTER = { m: 'mute', p: 'pause', e: 'interact', r: 'respawn' };

export const BUTTONS = ['ollie', 'flip', 'grab', 'grind', 'manual', 'special', 'pause', 'interact', 'respawn', 'mute'];

export class Input {
  constructor(target = window) {
    this.keys = new Set();
    this.virtual = { x: 0, y: 0, buttons: new Set() };
    this.state = { x: 0, y: 0 };
    this.btn = {};
    for (const b of BUTTONS) this.btn[b] = { down: false, pressed: false, released: false, t: 0 };
    this.enabled = true;
    this.lastDevice = 'keyboard';
    this._onKey = (e) => {
      if (!this.enabled) return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      const k = KEYMAP_LETTER[(e.key || '').toLowerCase()] || KEYMAP[e.code];
      if (!k) return;
      if (e.type === 'keydown') {
        this.keys.add(k);
        if (k !== 'pause' && k !== 'interact') e.preventDefault();
      } else this.keys.delete(k);
      this.lastDevice = 'keyboard';
    };
    this._blur = () => this.keys.clear();
    target.addEventListener('keydown', this._onKey);
    target.addEventListener('keyup', this._onKey);
    window.addEventListener('blur', this._blur);
    this.target = target;
  }

  dispose() {
    this.target.removeEventListener('keydown', this._onKey);
    this.target.removeEventListener('keyup', this._onKey);
    window.removeEventListener('blur', this._blur);
  }

  setStick(x, y) { this.virtual.x = x; this.virtual.y = y; this.lastDevice = 'touch'; }
  setButton(name, down) { if (down) this.virtual.buttons.add(name); else this.virtual.buttons.delete(name); this.lastDevice = 'touch'; }

  update(dt) {
    let x = 0, y = 0;
    const down = new Set();
    if (this.keys.has('left')) x -= 1;
    if (this.keys.has('right')) x += 1;
    if (this.keys.has('up')) y += 1;
    if (this.keys.has('down')) y -= 1;
    for (const b of BUTTONS) if (this.keys.has(b)) down.add(b);

    // manette (mise en correspondance standard)
    const pads = (navigator.getGamepads && navigator.getGamepads()) || [];
    for (const gp of pads) {
      if (!gp || !gp.connected) continue;
      const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      const b = (i) => gp.buttons[i] && gp.buttons[i].pressed;
      let gx = Math.abs(ax) > 0.22 ? ax : 0, gy = Math.abs(ay) > 0.22 ? -ay : 0;
      if (b(14)) gx = -1; if (b(15)) gx = 1; if (b(12)) gy = 1; if (b(13)) gy = -1;
      if (gx || gy) { x = gx; y = gy; this.lastDevice = 'gamepad'; }
      const map = { 0: 'ollie', 2: 'flip', 1: 'grab', 3: 'grind', 6: 'manual', 7: 'manual', 5: 'special', 4: 'special', 9: 'pause', 8: 'respawn' };
      for (const [i, name] of Object.entries(map)) if (b(+i)) { down.add(name); this.lastDevice = 'gamepad'; }
    }

    // tactile
    if (this.virtual.x || this.virtual.y) { x = this.virtual.x; y = this.virtual.y; }
    for (const b of this.virtual.buttons) down.add(b);

    this.state.x = Math.max(-1, Math.min(1, x));
    this.state.y = Math.max(-1, Math.min(1, y));
    for (const b of BUTTONS) {
      const s = this.btn[b], d = down.has(b);
      s.pressed = d && !s.down;
      s.released = !d && s.down;
      s.down = d;
      s.t = d ? s.t + dt : 0;
    }
  }

  // direction tenue (8 directions) au moment d'un trick : 'n','ne','e','se','s','sw','w','nw' ou ''
  dir8() {
    const { x, y } = this.state;
    if (Math.hypot(x, y) < 0.4) return '';
    const a = Math.atan2(y, x); // 0 = droite, PI/2 = haut
    const names = ['e', 'ne', 'n', 'nw', 'w', 'sw', 's', 'se'];
    const i = Math.round(((a + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 4)) % 8;
    return names[i];
  }

  clearEdges() { for (const b of BUTTONS) { this.btn[b].pressed = false; this.btn[b].released = false; } }
}
