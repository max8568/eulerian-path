// Prototype: generate candidate figures three ways, measure them, and write a gallery to look at.
// Run: node generate.mjs   →  figures.json + index.html
// Survey: GRID=5 TARGET=3000 SURVEY=1 node generate.mjs   →  prints how many distinct figures each method finds and how hard they are
import { readFileSync, writeFileSync } from 'node:fs';
import { isOneStroke, simulate } from './euler.mjs';

function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261012);
const ri = (a, b) => a + Math.floor(rand() * (b - a + 1));
const pick = arr => arr[Math.floor(rand() * arr.length)];

// ---- lattice: points on a G×G grid; lines only join neighbouring points (8 directions)
const G = +(process.env.GRID || 4);
const TARGET = +(process.env.TARGET || 300);
const DIRS = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const inGrid = ([x, y]) => x >= 0 && y >= 0 && x < G && y < G;
const key = p => p.join(',');
const pairKey = (p, q) => [key(p), key(q)].sort().join('|');
const neighbours = p => DIRS.map(([dx, dy]) => [p[0] + dx, p[1] + dy]).filter(inGrid);
// split a straight run between two lattice points into unit steps
function steps(p, q) {
  const dx = Math.sign(q[0] - p[0]), dy = Math.sign(q[1] - p[1]), out = [];
  let c = p;
  while (key(c) !== key(q)) { const n = [c[0] + dx, c[1] + dy]; out.push([c, n]); c = n; }
  return out;
}
const polygon = corners => corners.flatMap((c, i) => steps(c, corners[(i + 1) % corners.length]));

// Method A: walk a random route without reusing a line; the route itself is the answer.
function genTrail() {
  const L = ri(3, { 3: 12, 4: 22, 5: 36 }[G] || 22), used = new Set(), list = [];
  let cur = [ri(0, G - 1), ri(0, G - 1)];
  for (let i = 0; i < L; i++) {
    const opts = neighbours(cur).filter(q => !used.has(pairKey(cur, q)));
    if (!opts.length) break;
    const q = pick(opts); used.add(pairKey(cur, q)); list.push([cur, q]); cur = q;
  }
  return list;
}

// Method B: overlay a few closed shapes; a line shared by two shapes cancels out, so every point stays even.
// Half the time one line is then removed, which leaves exactly two odd points.
function randomShape() {
  const kind = ri(0, 2);
  if (kind === 0) {
    const w = ri(1, 2), h = ri(1, 2), x = ri(0, G - 1 - w), y = ri(0, G - 1 - h);
    return polygon([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  }
  if (kind === 1) {
    const k = ri(1, 2), x = ri(0, G - 1 - k), y = ri(0, G - 1 - k);
    const sq = [[x, y], [x + k, y], [x + k, y + k], [x, y + k]], skip = ri(0, 3);
    return polygon(sq.filter((_, i) => i !== skip));
  }
  const cx = ri(1, G - 2), cy = ri(1, G - 2);
  return polygon([[cx, cy - 1], [cx + 1, cy], [cx, cy + 1], [cx - 1, cy]]);
}
function genCycles() {
  const set = new Map();
  for (let i = ri(1, G); i > 0; i--)
    for (const [p, q] of randomShape()) { const k = pairKey(p, q); set.has(k) ? set.delete(k) : set.set(k, [p, q]); }
  const list = [...set.values()];
  if (list.length > 3 && rand() < 0.5) {
    const i = ri(0, list.length - 1), trial = list.filter((_, j) => j !== i);
    if (isOneStroke(toFigure(trial))) return trial;
  }
  return list;
}

// Method C: draw a random connected shape, then repeat existing lines until at most two points are odd.
// The repeated lines are what the shop games call "double lines".
function genEulerize() {
  const target = ri(4, 11), pts = new Map(), simple = new Map();
  const s = [ri(0, G - 1), ri(0, G - 1)]; pts.set(key(s), s);
  while (pts.size < target) {
    const p = pick([...pts.values()]), q = pick(neighbours(p));
    if (!pts.has(key(q))) { pts.set(key(q), q); simple.set(pairKey(p, q), [p, q]); }
  }
  for (let i = ri(0, 4); i > 0; i--) {
    const p = pick([...pts.values()]), q = pick(neighbours(p).filter(n => pts.has(key(n))));
    if (q) simple.set(pairKey(p, q), [p, q]);
  }
  const adj = new Map([...pts.keys()].map(k => [k, []]));
  for (const [p, q] of simple.values()) { adj.get(key(p)).push(q); adj.get(key(q)).push(p); }
  const odd = [...adj.keys()].filter(k => adj.get(k).length % 2);
  const extra = [], keepTwo = rand() < 0.6;
  while (odd.length > (keepTwo ? 2 : 0)) {
    // breadth-first search from one odd point to the nearest other odd point, then repeat that route
    const a = odd.shift(), par = new Map([[a, null]]), q2 = [a]; let hit = null;
    while (q2.length && !hit) {
      const c = q2.shift();
      for (const n of adj.get(c)) {
        const nk = key(n); if (par.has(nk)) continue;
        par.set(nk, c); q2.push(nk);
        if (odd.includes(nk)) { hit = nk; break; }
      }
    }
    if (!hit) break;
    for (let c = hit; par.get(c); c = par.get(c)) extra.push([c.split(',').map(Number), par.get(c).split(',').map(Number)]);
    odd.splice(odd.indexOf(hit), 1);
  }
  return [...simple.values(), ...extra];
}

// ---- lattice line list → figure in a unit square; repeated lines between the same two points bend
const BULGES = [0, 0.38, -0.38, 0.62, -0.62];
const unit = c => 0.1 + c * (0.8 / (G - 1));
function toFigure(list) {
  const idx = new Map(), pts = [], count = new Map(), edges = [];
  const id = p => { if (!idx.has(key(p))) { idx.set(key(p), pts.length); pts.push([unit(p[0]), unit(p[1])]); } return idx.get(key(p)); };
  for (let [p, q] of list) {
    if (key(p) > key(q)) [p, q] = [q, p];
    const k = pairKey(p, q), n = count.get(k) || 0; count.set(k, n + 1);
    edges.push(BULGES[n] ? [id(p), id(q), BULGES[n]] : [id(p), id(q)]);
  }
  return { pts, edges, lattice: list.map(([p, q]) => [p, q]) };
}

// ---- geometry checks
function polyline(fig, [a, b, bulge = 0], pts = fig.pts) {
  const A = pts[a], B = pts[b];
  if (!bulge) return [A, B];
  const dx = B[0] - A[0], dy = B[1] - A[1], C = [(A[0] + B[0]) / 2 - dy * bulge, (A[1] + B[1]) / 2 + dx * bulge], out = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16, u = 1 - t; out.push([u*u*A[0] + 2*u*t*C[0] + t*t*B[0], u*u*A[1] + 2*u*t*C[1] + t*t*B[1]]); }
  return out;
}
function segDist(p, a, b) {
  const vx = b[0] - a[0], vy = b[1] - a[1], l2 = vx * vx + vy * vy || 1;
  const u = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / l2));
  return Math.hypot(p[0] - a[0] - u * vx, p[1] - a[1] - u * vy);
}
function segCross(a, b, c, d) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
}
// a point must not sit on (or almost on) a line it is not part of
function pointsClear(fig, pts) {
  const lines = fig.edges.map(e => polyline(fig, e, pts));
  return pts.every((p, v) => fig.edges.every((e, i) => e[0] === v || e[1] === v ||
    lines[i].every((_, k) => k === 0 || segDist(p, lines[i][k - 1], lines[i][k]) > 0.035)));
}
// pairs of lines that cross somewhere other than at a point
function crossings(fig, pts = fig.pts) {
  const lines = fig.edges.map(e => polyline(fig, e, pts)), near = (p, v) => Math.hypot(p[0] - pts[v][0], p[1] - pts[v][1]) < 0.04;
  let n = 0;
  for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
    let hit = false;
    for (let a = 1; a < lines[i].length && !hit; a++) for (let b = 1; b < lines[j].length && !hit; b++) {
      const p1 = lines[i][a - 1], p2 = lines[i][a], q1 = lines[j][b - 1], q2 = lines[j][b];
      if (!segCross(p1, p2, q1, q2)) continue;
      const shared = [fig.edges[i][0], fig.edges[i][1]].filter(v => v === fig.edges[j][0] || v === fig.edges[j][1]);
      if (shared.some(v => near(p1, v) || near(p2, v) || near(q1, v) || near(q2, v))) continue;
      hit = true;
    }
    if (hit) n++;
  }
  return n;
}
// the same graph with every point nudged off the grid
function jitter(fig) {
  const cell = 0.8 / (G - 1);
  for (let t = 0; t < 30; t++) {
    const pts = fig.pts.map(([x, y]) => [x + (rand() - 0.5) * 0.55 * cell, y + (rand() - 0.5) * 0.55 * cell]);
    const spaced = pts.every((p, i) => pts.every((q, j) => i === j || Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.45 * cell));
    if (spaced && pointsClear(fig, pts)) return pts;
  }
  return null;
}
// same figure up to rotation, mirroring and shifting on the grid
function canonical(list) {
  const syms = [p => p, ([x, y]) => [G-1-x, y], ([x, y]) => [x, G-1-y], ([x, y]) => [G-1-x, G-1-y],
    ([x, y]) => [y, x], ([x, y]) => [G-1-y, x], ([x, y]) => [y, G-1-x], ([x, y]) => [G-1-y, G-1-x]];
  return syms.map(f => {
    const m = list.map(([p, q]) => [f(p), f(q)]), mx = Math.min(...m.flat().map(p => p[0])), my = Math.min(...m.flat().map(p => p[1]));
    return m.map(([p, q]) => pairKey([p[0] - mx, p[1] - my], [q[0] - mx, q[1] - my])).sort().join(';');
  }).sort()[0];
}

// ---- run
function measure(fig, attempts) {
  const s = simulate(fig, attempts, rand);
  return {
    lines: fig.edges.length, points: fig.pts.length,
    odd: fig.pts.map((_, v) => fig.edges.reduce((d, [a, b]) => d + (a === v) + (b === v), 0)).filter(d => d % 2).length,
    avgLines: +s.avgLines.toFixed(1), pRandom: Math.round(s.pRandom * 100), pGoodStart: Math.round(s.pGoodStart * 100),
    delay: +s.delay.toFixed(1), crossings: crossings(fig), doubles: fig.edges.filter(e => e[2]).length,
  };
}
const METHODS = [
  { id: 'trail', name: '先隨機畫一條路線，再把路線變成圖', gen: genTrail },
  { id: 'cycles', name: '把幾個封閉的形狀疊在一起', gen: genCycles },
  { id: 'eulerize', name: '隨便畫一張圖，再重複幾條線補成畫得完', gen: genEulerize },
];
const out = { generatedAt: new Date().toISOString(), grid: G, methods: [] };
for (const m of METHODS.filter(m => !process.env.SURVEY || m.id !== 'eulerize')) {
  const seen = new Set(), cands = [];
  let made = 0, invalid = 0, dupes = 0;
  while (cands.length < TARGET && made < TARGET * 60) {
    made++;
    const list = m.gen(), fig = toFigure(list);
    if (fig.edges.length < 3 || !isOneStroke(fig) || !pointsClear(fig, fig.pts)) { invalid++; continue; }
    const c = canonical(list);
    if (seen.has(c)) { dupes++; continue; }
    seen.add(c);
    cands.push({ fig, quick: simulate(fig, 600, rand, { withDelay: false }).avgLines });
  }
  cands.sort((a, b) => a.quick - b.quick);
  if (process.env.SURVEY) {
    const q = k => cands[Math.min(cands.length - 1, Math.floor(k * cands.length))].quick.toFixed(0);
    const evenShare = cands.filter(c => c.fig.edges.length && isOneStroke(c.fig) && c.fig.pts.every((_, v) => c.fig.edges.filter(e => e[0] === v || e[1] === v).length % 2 === 0)).length / cands.length;
    const crossShare = cands.filter(c => crossings(c.fig) > 0).length / cands.length;
    console.log(`grid ${G} ${m.id}: tries ${made}, distinct ${cands.length}, avgLines p10 ${q(.1)} p50 ${q(.5)} p90 ${q(.9)} max ${q(.999)}, all-even ${Math.round(evenShare * 100)}%, with crossings ${Math.round(crossShare * 100)}%`);
    continue;
  }
  const chosen = Array.from({ length: 20 }, (_, i) => cands[Math.round(i * (cands.length - 1) / 19)].fig);
  const figures = chosen.map(fig => {
    const free = jitter(fig);
    return { pts: fig.pts, free, edges: fig.edges, stats: { ...measure(fig, 5000), crossingsFree: free ? crossings(fig, free) : null } };
  }).sort((a, b) => a.stats.avgLines - b.stats.avgLines);
  out.methods.push({ id: m.id, name: m.name, made, invalid, dupes, unique: cands.length, figures });
  console.log(`${m.id}: made ${made}, invalid ${invalid}, duplicates ${dupes}, unique ${cands.length}`);
}

if (process.env.SURVEY) process.exit(0);
// hand-drawn shapes a child would recognise, for comparison
const pent = k => { const a = (-90 + 72 * k) * Math.PI / 180; return [0.5 + 0.42 * Math.cos(a), 0.54 + 0.42 * Math.sin(a)]; };
const SHAPES = [
  { name: '鑽石', pts: [[.5,.1],[.12,.5],[.88,.5],[.5,.9]], edges: [[0,1],[0,2],[1,3],[2,3],[1,2]] },
  { name: '信封', pts: [[.1,.25],[.9,.25],[.9,.8],[.1,.8],[.5,.55]], edges: [[0,1],[1,2],[2,3],[3,0],[0,4],[4,1]] },
  { name: '蝴蝶結', pts: [[.5,.5],[.1,.15],[.1,.85],[.9,.15],[.9,.85]], edges: [[0,1],[1,2],[2,0],[0,3],[3,4],[4,0]] },
  { name: '魚', pts: [[.88,.5],[.6,.28],[.38,.5],[.6,.72],[.1,.28],[.1,.72]], edges: [[0,1],[1,2],[2,3],[3,0],[2,4],[4,5],[5,2]] },
  { name: '房子', pts: [[.15,.9],[.85,.9],[.85,.42],[.15,.42],[.5,.08]], edges: [[0,1],[1,2],[2,3],[3,0],[3,4],[4,2],[0,2],[1,3]] },
  { name: '帆船', pts: [[.25,.88],[.75,.88],[.92,.7],[.08,.7],[.5,.7],[.5,.1],[.85,.6]], edges: [[0,1],[1,2],[2,4],[4,3],[3,0],[4,5],[5,6],[6,4]] },
  { name: '星星', pts: [0,1,2,3,4].map(pent), edges: [[0,1],[1,2],[2,3],[3,4],[4,0],[0,2],[2,4],[4,1],[1,3],[3,0]] },
];
out.shapes = SHAPES.map(s => ({ ...s, free: null, stats: measure(s, 5000) }));

writeFileSync(new URL('./figures.json', import.meta.url), JSON.stringify(out));
const tpl = readFileSync(new URL('./gallery.template.html', import.meta.url), 'utf8');
writeFileSync(new URL('./index.html', import.meta.url), tpl.replace('/*DATA*/null', JSON.stringify(out)));
console.log('wrote figures.json and index.html');
