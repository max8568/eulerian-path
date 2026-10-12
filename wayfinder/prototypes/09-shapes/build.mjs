// Check every shape level, measure it, and write a page to review them.
// Run: node build.mjs   →  shapes.json + index.html
import { readFileSync, writeFileSync } from 'node:fs';
import { isOneStroke, simulate, degrees, oddVertices } from '../06-figures/euler.mjs';
import { CHAPTERS } from './batch1.mjs';

let seed = 9;
const rand = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

function polyline(f, [a, b, bulge = 0]) {
  const A = f.pts[a], B = f.pts[b];
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
const cross = (a, b, c, d) => { const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]); return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0; };
function crossings(f) {
  const L = f.edges.map(e => polyline(f, e)), near = (p, v) => Math.hypot(p[0] - f.pts[v][0], p[1] - f.pts[v][1]) < 0.04;
  let n = 0;
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
    const shared = [f.edges[i][0], f.edges[i][1]].filter(v => v === f.edges[j][0] || v === f.edges[j][1]);
    let hit = false;
    for (let a = 1; a < L[i].length && !hit; a++) for (let b = 1; b < L[j].length && !hit; b++)
      if (cross(L[i][a-1], L[i][a], L[j][b-1], L[j][b]) && !shared.some(v => [L[i][a-1], L[i][a], L[j][b-1], L[j][b]].some(p => near(p, v)))) hit = true;
    if (hit) n++;
  }
  return n;
}
// what would make a shape unplayable or confusing
function problems(f) {
  const out = [], deg = degrees(f.pts.length, f.edges);
  if (!isOneStroke(f)) out.push(`畫不完：單數點 ${oddVertices(deg).length} 個或沒有連在一起`);
  f.pts.forEach((p, i) => f.pts.forEach((q, j) => { if (i < j && Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.09) out.push(`點 ${i} 和點 ${j} 太近`); }));
  f.pts.forEach((p, v) => f.edges.forEach((e, k) => {
    if (e[0] === v || e[1] === v) return;
    const L = polyline(f, e);
    if (L.some((_, i) => i > 0 && segDist(p, L[i - 1], L[i]) < 0.035)) out.push(`點 ${v} 壓在第 ${k} 條線上`);
  }));
  if (f.edges.flatMap(e => polyline(f, e)).some(([x, y]) => x < 0 || y < 0 || x > 1 || y > 1)) out.push('有線跑出範圍');
  return out;
}

let bad = 0;
const out = CHAPTERS.map((ch, ci) => {
  const shapes = ch.shapes.map(s => {
    const issues = problems(s);
    if (issues.length) { bad++; console.log(`chapter ${ci + 1} ${s.name}:`, issues.join('; ')); }
    const sim = simulate(s, 6000, rand), deg = degrees(s.pts.length, s.edges);
    return { ...s, issues, stats: {
      lines: s.edges.length, points: s.pts.length, odd: oddVertices(deg).length,
      avgLines: +sim.avgLines.toFixed(1), pRandom: Math.round(sim.pRandom * 100), pGoodStart: Math.round(sim.pGoodStart * 100),
      delay: +sim.delay.toFixed(1), crossings: crossings(s), curves: s.edges.filter(e => e[2]).length,
    } };
  }).sort((a, b) => a.stats.avgLines - b.stats.avgLines);
  shapes.forEach((s, k) => { s.level = ci * 50 + (k + 1) * 10; });
  return { chapter: ci + 1, theme: ch.theme, shapes };
});
for (const ch of out) console.log(`ch${ch.chapter} ${ch.theme}:`, ch.shapes.map(s => `${s.level} ${s.name} L${s.stats.lines} avg${s.stats.avgLines} p${s.stats.pRandom}% x${s.stats.crossings}`).join(' | '));
console.log(bad ? `${bad} shapes have problems` : 'all shapes OK');
writeFileSync(new URL('./shapes.json', import.meta.url), JSON.stringify(out));
const tpl = readFileSync(new URL('./review.template.html', import.meta.url), 'utf8');
writeFileSync(new URL('./index.html', import.meta.url), tpl.replace('/*DATA*/null', JSON.stringify(out)));
