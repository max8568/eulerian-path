// Figures on a G×G grid of points; lines only join neighbouring points (8 directions).
// Two ways to make a figure that can always be drawn in one stroke:
//   trail  — walk a random route without reusing a line; the route itself is the answer
//   cycles — overlay a few closed shapes; a line shared by two shapes cancels out, so every point stays
//            even; half the time one line is then removed, which leaves exactly two odd points
import { isOneStroke } from '../site/euler.js';

const DIRS = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const key = p => p.join(',');
const pairKey = (p, q) => [key(p), key(q)].sort().join('|');

export function makeLattice(G, rand) {
  const ri = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const pick = arr => arr[Math.floor(rand() * arr.length)];
  const inGrid = ([x, y]) => x >= 0 && y >= 0 && x < G && y < G;
  const neighbours = p => DIRS.map(([dx, dy]) => [p[0] + dx, p[1] + dy]).filter(inGrid);
  function steps(p, q) {
    const dx = Math.sign(q[0] - p[0]), dy = Math.sign(q[1] - p[1]), out = [];
    for (let c = p; key(c) !== key(q);) { const n = [c[0] + dx, c[1] + dy]; out.push([c, n]); c = n; }
    return out;
  }
  const polygon = corners => corners.flatMap((c, i) => steps(c, corners[(i + 1) % corners.length]));

  const MAX_TRAIL = { 3: 12, 4: 22, 5: 36 }[G] || 22;
  function trail() {
    const L = ri(3, MAX_TRAIL), used = new Set(), list = [];
    let cur = [ri(0, G - 1), ri(0, G - 1)];
    for (let i = 0; i < L; i++) {
      const opts = neighbours(cur).filter(q => !used.has(pairKey(cur, q)));
      if (!opts.length) break;
      const q = pick(opts); used.add(pairKey(cur, q)); list.push([cur, q]); cur = q;
    }
    return list;
  }

  function randomShape() {
    const kind = ri(0, 2);
    if (kind === 0) {
      const w = ri(1, Math.min(2, G - 1)), h = ri(1, Math.min(2, G - 1)), x = ri(0, G - 1 - w), y = ri(0, G - 1 - h);
      return polygon([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
    }
    if (kind === 1) {
      const k = ri(1, Math.min(2, G - 1)), x = ri(0, G - 1 - k), y = ri(0, G - 1 - k);
      const sq = [[x, y], [x + k, y], [x + k, y + k], [x, y + k]], skip = ri(0, 3);
      return polygon(sq.filter((_, i) => i !== skip));
    }
    const cx = ri(1, G - 2), cy = ri(1, G - 2);
    return polygon([[cx, cy - 1], [cx + 1, cy], [cx, cy + 1], [cx - 1, cy]]);
  }
  function cycles() {
    const set = new Map();
    for (let i = ri(1, G); i > 0; i--)
      for (const [p, q] of randomShape()) { const k = pairKey(p, q); set.has(k) ? set.delete(k) : set.set(k, [p, q]); }
    const list = [...set.values()];
    if (list.length > 3 && rand() < 0.5) {
      const i = ri(0, list.length - 1), trial = list.filter((_, j) => j !== i);
      if (isOneStroke(toFigure(trial, G))) return trial;
    }
    return list;
  }

  return { trail, cycles };
}

// lattice line list → figure in the unit square (grid spans 0.1 … 0.9)
export function toFigure(list, G) {
  const unit = c => 0.1 + c * (0.8 / (G - 1));
  const idx = new Map(), pts = [], edges = [];
  const id = p => { if (!idx.has(key(p))) { idx.set(key(p), pts.length); pts.push([+unit(p[0]).toFixed(4), +unit(p[1]).toFixed(4)]); } return idx.get(key(p)); };
  for (const [p, q] of list) edges.push([id(p), id(q)]);
  return { pts, edges };
}

// the same figure up to rotation, mirroring and shifting (also across grid sizes)
export function canonical(list, G) {
  const syms = [p => p, ([x, y]) => [G-1-x, y], ([x, y]) => [x, G-1-y], ([x, y]) => [G-1-x, G-1-y],
    ([x, y]) => [y, x], ([x, y]) => [G-1-y, x], ([x, y]) => [y, G-1-x], ([x, y]) => [G-1-y, G-1-x]];
  return syms.map(f => {
    const m = list.map(([p, q]) => [f(p), f(q)]);
    const mx = Math.min(...m.flat().map(p => p[0])), my = Math.min(...m.flat().map(p => p[1]));
    return m.map(([p, q]) => pairKey([p[0] - mx, p[1] - my], [q[0] - mx, q[1] - my])).sort().join(';');
  }).sort()[0];
}
