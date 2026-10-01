// Petit bus d'événements entre la physique, le score, le son et l'interface.
export class Events {
  constructor() { this.h = new Map(); }
  on(name, fn) { if (!this.h.has(name)) this.h.set(name, new Set()); this.h.get(name).add(fn); return () => this.h.get(name).delete(fn); }
  emit(name, data) { const s = this.h.get(name); if (s) for (const fn of [...s]) { try { fn(data); } catch (e) { console.error('[respawn]', name, e); } } }
}
