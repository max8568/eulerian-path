// Check every drawn shape level, measure it, place it in its chapter, and write a review page.
// Run: node tools/check-shapes.mjs [firstChapter lastChapter]   →  tools/out/shapes-review.html
// Exits with an error if any shape is unplayable or harder than the curve allows.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isOneStroke, simulate, degrees, oddVertices, seededRandom } from '../site/euler.js';
import { polyline, segDist, crossings } from './geometry.mjs';
import { CURVE, target } from './curve.mjs';
import { SHAPE_CHAPTERS } from './shapes/index.mjs';

// what would make a shape unplayable or confusing
export function problems(f) {
  const out = [], deg = degrees(f.pts.length, f.edges);
  if (!isOneStroke(f)) {
    const odd = oddVertices(deg);
    out.push(odd.length > 2 ? `畫不完：單數點 ${odd.length} 個 ${odd.map(v => `(${f.pts[v]})`).join(' ')}` : '畫不完：沒有連在一起');
  }
  f.pts.forEach((p, i) => f.pts.forEach((q, j) => { if (i < j && Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.09) out.push(`點 ${i} 和點 ${j} 太近`); }));
  f.pts.forEach((p, v) => f.edges.forEach((e, k) => {
    if (e[0] === v || e[1] === v) return;
    const L = polyline(f, e);
    if (L.some((_, i) => i > 0 && segDist(p, L[i - 1], L[i]) < 0.035)) out.push(`點 ${v} 壓在第 ${k} 條線上`);
  }));
  if (f.edges.flatMap(e => polyline(f, e)).some(([x, y]) => x < 0 || y < 0 || x > 1 || y > 1)) out.push('有線跑出範圍');
  return out;
}

// measure every shape and give it its level: inside a chapter, easiest first at 10, 20, … 50
export function placeShapes() {
  const rand = seededRandom(9);
  return SHAPE_CHAPTERS.map((ch, ci) => {
    const shapes = ch.shapes.map(s => {
      const sim = simulate(s, 5000, rand), deg = degrees(s.pts.length, s.edges);
      return { ...s, issues: problems(s), stats: {
        lines: s.edges.length, points: s.pts.length, odd: oddVertices(deg).length,
        avgLines: +sim.avgLines.toFixed(1), pRandom: +sim.pRandom.toFixed(3), pGoodStart: +sim.pGoodStart.toFixed(3),
        delay: +sim.delay.toFixed(1), crossings: crossings(s), curves: s.edges.filter(e => e[2]).length,
      } };
    }).sort((a, b) => a.stats.avgLines - b.stats.avgLines);
    shapes.forEach((s, k) => {
      s.level = ci * 50 + (k + 1) * 10;
      s.ratio = +(s.stats.avgLines / target(s.level)).toFixed(2);
      if (s.ratio > CURVE.shapeLevels.maxFactor) s.issues.push(`比難度表難 ${s.ratio} 倍，超過 ${CURVE.shapeLevels.maxFactor} 倍`);
    });
    return { chapter: ci + 1, theme: ch.theme, shapes };
  });
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const [from = 1, to = SHAPE_CHAPTERS.length] = process.argv.slice(2).map(Number);
  const placed = placeShapes().filter(ch => ch.chapter >= from && ch.chapter <= to);
  let bad = 0;
  for (const ch of placed) {
    console.log(`ch${ch.chapter} ${ch.theme}: ` + ch.shapes.map(s => `${s.level} ${s.name} L${s.stats.lines} avg${s.stats.avgLines} ×${s.ratio}`).join(' | '));
    for (const s of ch.shapes) if (s.issues.length) { bad++; console.log(`  ✗ ${s.level} ${s.name}: ${s.issues.join('; ')}`); }
  }
  mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
  const tpl = readFileSync(new URL('./shapes/review.template.html', import.meta.url), 'utf8');
  writeFileSync(new URL('./out/shapes-review.html', import.meta.url), tpl.replace('/*DATA*/null', JSON.stringify(placed)));
  console.log(bad ? `${bad} shapes have problems` : `all ${placed.reduce((n, c) => n + c.shapes.length, 0)} shapes OK`);
  process.exitCode = bad ? 1 : 0;
}
