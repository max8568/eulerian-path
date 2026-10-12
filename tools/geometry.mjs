// Geometry checks for figures in the unit square (y pointing down).
// An edge [a, b, bulge] with bulge ≠ 0 is a quadratic curve whose control point is the chord midpoint
// plus bulge × (−dy, dx): a positive bulge bends to the right-hand side of a → b on screen.

export function polyline(fig, [a, b, bulge = 0], pts = fig.pts) {
  const A = pts[a], B = pts[b];
  if (!bulge) return [A, B];
  const dx = B[0] - A[0], dy = B[1] - A[1];
  const C = [(A[0] + B[0]) / 2 - dy * bulge, (A[1] + B[1]) / 2 + dx * bulge], out = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16, u = 1 - t;
    out.push([u * u * A[0] + 2 * u * t * C[0] + t * t * B[0], u * u * A[1] + 2 * u * t * C[1] + t * t * B[1]]);
  }
  return out;
}

export function segDist(p, a, b) {
  const vx = b[0] - a[0], vy = b[1] - a[1], l2 = vx * vx + vy * vy || 1;
  const u = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / l2));
  return Math.hypot(p[0] - a[0] - u * vx, p[1] - a[1] - u * vy);
}

const orient = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
const segCross = (a, b, c, d) => orient(a, b, c) * orient(a, b, d) < 0 && orient(c, d, a) * orient(c, d, b) < 0;

// pairs of lines that cross somewhere other than at a point
export function crossings(fig) {
  const L = fig.edges.map(e => polyline(fig, e));
  const near = (p, v) => Math.hypot(p[0] - fig.pts[v][0], p[1] - fig.pts[v][1]) < 0.04;
  let n = 0;
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
    const shared = [fig.edges[i][0], fig.edges[i][1]].filter(v => v === fig.edges[j][0] || v === fig.edges[j][1]);
    let hit = false;
    for (let a = 1; a < L[i].length && !hit; a++) for (let b = 1; b < L[j].length && !hit; b++) {
      const seg = [L[i][a - 1], L[i][a], L[j][b - 1], L[j][b]];
      if (segCross(...seg) && !shared.some(v => seg.some(p => near(p, v)))) hit = true;
    }
    if (hit) n++;
  }
  return n;
}

// a point must not sit on (or almost on) a line it is not part of
export function pointsClear(fig, minDist = 0.035) {
  return fig.pts.every((p, v) => fig.edges.every((e, k) => {
    if (e[0] === v || e[1] === v) return true;
    const L = polyline(fig, e);
    return L.every((_, i) => i === 0 || segDist(p, L[i - 1], L[i]) > minDist);
  }));
}

// extent of a figure: [minX, minY, maxX, maxY], curves included
export function extent(fig) {
  const all = fig.edges.flatMap(e => polyline(fig, e)).concat(fig.pts);
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
