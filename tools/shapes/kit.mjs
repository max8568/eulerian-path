// Helpers for drawing shape levels by coordinates (unit square, y pointing down).
//
// build(name, { paths, loops, curves }) turns drawing strokes into a figure:
//   paths  — open polylines [[x, y], ...]
//   loops  — closed polygons [[x, y], ...]
//   curves — [p, q, bulge] single curved lines (bulge as in batch ch01-05.mjs)
// Points closer than 0.002 are merged; a straight line that passes over another stroke's point is
// split there; two straight lines that cross get a point where they cross. So a detail stroke that
// ends on an outline joins it, and no line ever crosses another without a point.
//
// Tip for keeping the figure drawable: every closed loop keeps all its points even, and one open
// stroke (or a chain of strokes end to start) only makes its two ends odd.

const EPS = 0.002;
const near = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < EPS;
const r4 = p => [+p[0].toFixed(4), +p[1].toFixed(4)];

function onSegment(p, a, b) {
  const vx = b[0] - a[0], vy = b[1] - a[1], l2 = vx * vx + vy * vy;
  const t = ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / l2;
  if (t <= 1e-6 || t >= 1 - 1e-6) return null;
  const d = Math.hypot(p[0] - a[0] - t * vx, p[1] - a[1] - t * vy);
  return d < EPS ? t : null;
}
function intersect(a, b, c, d) {
  const r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]], den = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(den) < 1e-12) return null;
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den, u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
  if (t <= 1e-6 || t >= 1 - 1e-6 || u <= 1e-6 || u >= 1 - 1e-6) return null;
  return [a[0] + t * r[0], a[1] + t * r[1]];
}

export function build(name, { paths = [], loops = [], curves = [] }) {
  const segs = [];
  for (const p of paths) for (let i = 1; i < p.length; i++) segs.push([p[i - 1], p[i]]);
  for (const p of loops) for (let i = 0; i < p.length; i++) segs.push([p[i], p[(i + 1) % p.length]]);
  const pts = [];
  const id = p => { let i = pts.findIndex(q => near(p, q)); if (i < 0) { i = pts.length; pts.push(r4(p)); } return i; };
  segs.forEach(([a, b]) => { id(a); id(b); });
  curves.forEach(([a, b]) => { id(a); id(b); });
  for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) {
    const x = intersect(...segs[i], ...segs[j]);
    if (x) id(x);
  }
  const seen = new Set(), edges = [];
  for (const [a, b] of segs) {
    const cuts = pts.map(p => [onSegment(p, a, b), p]).filter(([t]) => t != null).sort((x, y) => x[0] - y[0]).map(x => x[1]);
    const chain = [a, ...cuts, b];
    for (let i = 1; i < chain.length; i++) {
      const u = id(chain[i - 1]), v = id(chain[i]);
      const key = Math.min(u, v) + '-' + Math.max(u, v);
      if (u === v || seen.has(key)) continue;
      seen.add(key); edges.push([u, v]);
    }
  }
  for (const [a, b, bulge] of curves) edges.push([id(a), id(b), bulge]);
  return { name, pts, edges };
}

// a circle made of n arcs (n = 2 or 4), starting at the top and going clockwise on screen
export function circle(cx, cy, r, n = 4) {
  const pts = Array.from({ length: n }, (_, i) => { const a = (-90 + i * 360 / n) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
  const bulge = n === 2 ? -1 : -0.41;
  return pts.map((p, i) => [p, pts[(i + 1) % n], bulge]);
}

// part of a circle from angle a0 to a1 (degrees, clockwise on screen when a1 > a0), as n curved lines
export function arcs(cx, cy, r, a0, a1, n) {
  const p = i => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const bulge = -Math.tan((a1 - a0) / n * Math.PI / 720);
  return Array.from({ length: n }, (_, i) => [p(i), p(i + 1), bulge]);
}
// the points along a list of curves, in order (start of each, then the last end)
export const ends = cs => [...cs.map(c => c[0]), cs[cs.length - 1][1]];

// evenly spaced points from a to b (both included), for splitting an outline into pieces
export const along = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]);

// a regular polygon / star outline
export const ring = (cx, cy, r, n, start = -90) => Array.from({ length: n }, (_, i) => { const a = (start + i * 360 / n) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
// a zigzag bouncing between the line a1→a2 and the line b1→b2, n steps (n + 1 points)
export const zigzag = (a1, a2, b1, b2, n) => Array.from({ length: n + 1 }, (_, i) => (i % 2 ? lerp(b1, b2, i / n) : lerp(a1, a2, i / n)));
export { lerp };
