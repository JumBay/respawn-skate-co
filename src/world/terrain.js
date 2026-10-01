// Le sol du park comme un champ de hauteur analytique : h(x, z) et sa pente exacte.
// Chaque module (bloc, plan incliné, quarter, bowl, marches) sait dire sa hauteur en un point ;
// le sol est le plus haut d'entre eux. La physique et les maillages lisent les mêmes données.

export class Terrain {
  constructor() {
    this.prims = [];
    this.bowls = [];
    this.bounds = { x0: -46, x1: 46, z0: -42, z1: 42 };
    this._s = { h: 0, gx: 0, gz: 0, kind: 'concrete', prim: null };
  }

  add(prim) { this.prims.push(prim); return prim; }
  addBowl(b) { this.bowls.push(b); return b; }

  // Remplit out { h, gx, gz, kind, prim } pour le point (x, z).
  sample(x, z, out = this._s) {
    out.h = 0; out.gx = 0; out.gz = 0; out.kind = 'concrete'; out.prim = null;
    for (const b of this.bowls) if (b.sample(x, z, out)) break;
    const tmp = Terrain._tmp;
    for (const p of this.prims) {
      if (x < p.bx0 || x > p.bx1 || z < p.bz0 || z > p.bz1) continue;
      if (p.sample(x, z, tmp) && tmp.h > out.h + 1e-6) {
        out.h = tmp.h; out.gx = tmp.gx; out.gz = tmp.gz; out.kind = tmp.kind; out.prim = p;
      }
    }
    return out;
  }

  height(x, z) { return this.sample(x, z, Terrain._tmp2).h; }

  normal(x, z, target) {
    const s = this.sample(x, z, Terrain._tmp2);
    const l = Math.hypot(s.gx, 1, s.gz);
    target.set(-s.gx / l, 1 / l, -s.gz / l);
    return target;
  }
}
Terrain._tmp = { h: 0, gx: 0, gz: 0, kind: '' };
Terrain._tmp2 = { h: 0, gx: 0, gz: 0, kind: '', prim: null };

// Bloc plein (ledge, plateforme, toit) : dessus plat.
export function box(x0, x1, z0, z1, h, kind = 'concrete') {
  return {
    type: 'box', x0, x1, z0, z1, h, kind,
    bx0: x0, bx1: x1, bz0: z0, bz1: z1,
    sample(x, z, o) { o.h = h; o.gx = 0; o.gz = 0; o.kind = kind; return true; },
  };
}

// Plan incliné (bank, kicker) : la hauteur passe de h0 à h1 le long de l'axe, dans le sens indiqué.
// dir : '+x' monte vers +x, '-x' vers -x, '+z', '-z'. base : hauteur du dessous (pour le maillage).
export function wedge(x0, x1, z0, z1, h0, h1, dir, kind = 'ramp') {
  const ax = dir[1];
  const sgn = dir[0] === '+' ? 1 : -1;
  const a0 = ax === 'x' ? x0 : z0, a1 = ax === 'x' ? x1 : z1;
  const len = a1 - a0;
  const slope = (h1 - h0) / len;
  return {
    type: 'wedge', x0, x1, z0, z1, h0, h1, dir, kind,
    bx0: x0, bx1: x1, bz0: z0, bz1: z1,
    sample(x, z, o) {
      const a = ax === 'x' ? x : z;
      const t = sgn > 0 ? (a - a0) : (a1 - a);
      o.h = h0 + slope * t;
      const g = slope * sgn;
      o.gx = ax === 'x' ? g : 0; o.gz = ax === 'z' ? g : 0; o.kind = kind;
      return true;
    },
  };
}

// Quarter pipe : transition en arc de cercle (rayon R, hauteur H) puis deck plat.
// Le rideur MONTE dans la direction dir en partant de la ligne start (x ou z selon dir),
// sur l'étendue latérale [l0, l1].
export function quarter({ dir, start, l0, l1, R, H, deck = 2.2, kind = 'ramp' }) {
  const ax = dir[1];
  const sgn = dir[0] === '+' ? 1 : -1;
  const uTop = Math.sqrt(R * R - (R - H) * (R - H));
  const len = uTop + deck;
  const end = start + sgn * len;
  const a0 = Math.min(start, end), a1 = Math.max(start, end);
  const p = {
    type: 'quarter', dir, start, l0, l1, R, H, deck, uTop, kind, ax, sgn,
    bx0: ax === 'x' ? a0 : l0, bx1: ax === 'x' ? a1 : l1,
    bz0: ax === 'z' ? a0 : l0, bz1: ax === 'z' ? a1 : l1,
    // point de la lèvre (coping), en coordonnée le long de l'axe
    lip: start + sgn * uTop,
    profile(u) { // hauteur et pente le long de u
      if (u <= uTop) {
        const r = Math.sqrt(Math.max(1e-6, R * R - u * u));
        return [R - r, u / r];
      }
      return [H, 0];
    },
    sample(x, z, o) {
      const a = ax === 'x' ? x : z;
      const u = (a - start) * sgn;
      if (u < 0 || u > len) return false;
      const [h, s] = p.profile(u);
      o.h = h; o.kind = u <= uTop ? kind : 'deck';
      const g = s * sgn;
      o.gx = ax === 'x' ? g : 0; o.gz = ax === 'z' ? g : 0;
      return true;
    },
  };
  return p;
}

// Escalier qui DESCEND dans la direction dir, de hTop à 0, en n marches.
export function stairs(x0, x1, z0, z1, hTop, n, dir) {
  const ax = dir[1];
  const sgn = dir[0] === '+' ? 1 : -1;
  const a0 = ax === 'x' ? x0 : z0, a1 = ax === 'x' ? x1 : z1;
  const len = a1 - a0, step = len / n, rise = hTop / n;
  return {
    type: 'stairs', x0, x1, z0, z1, hTop, n, dir, kind: 'concrete',
    bx0: x0, bx1: x1, bz0: z0, bz1: z1,
    sample(x, z, o) {
      const a = ax === 'x' ? x : z;
      const t = sgn > 0 ? (a - a0) : (a1 - a); // distance depuis le haut
      const k = Math.min(n - 1, Math.max(0, Math.floor(t / step)));
      o.h = hTop - rise * k; // marche k

      o.gx = 0; o.gz = 0; o.kind = 'concrete';
      return true;
    },
  };
}

// Bowl creusé : fond en rectangle arrondi (demi-côtés hx, hz, coin rc), profondeur D,
// transition en arc de rayon R jusqu'au niveau du sol.
export function bowl({ cx, cz, hx, hz, rc, D, R }) {
  const uTop = Math.sqrt(R * R - (R - D) * (R - D));
  const b = {
    type: 'bowl', cx, cz, hx, hz, rc, D, R, uTop,
    // distance signée au bord du fond (négative dedans) + gradient de cette distance
    sdf(x, z, g) {
      const px = x - cx, pz = z - cz;
      const qx = Math.abs(px) - (hx - rc), qz = Math.abs(pz) - (hz - rc);
      const mx = Math.max(qx, 0), mz = Math.max(qz, 0);
      const outside = Math.hypot(mx, mz);
      let d;
      if (outside > 0) {
        d = outside - rc;
        if (g) { g[0] = (mx / outside) * Math.sign(px); g[1] = (mz / outside) * Math.sign(pz); }
      } else {
        d = Math.max(qx, qz) - rc;
        if (g) { if (qx > qz) { g[0] = Math.sign(px); g[1] = 0; } else { g[0] = 0; g[1] = Math.sign(pz); } }
      }
      return d;
    },
    sample(x, z, o) {
      const g = b._g;
      const d = b.sdf(x, z, g);
      if (d >= uTop) return false;
      if (d <= 0) { o.h = -D; o.gx = 0; o.gz = 0; o.kind = 'bowl'; return true; }
      const r = Math.sqrt(Math.max(1e-6, R * R - d * d));
      o.h = -D + (R - r);
      const s = d / r;
      o.gx = s * g[0]; o.gz = s * g[1]; o.kind = 'bowl';
      return true;
    },
    _g: [0, 0],
  };
  return b;
}
