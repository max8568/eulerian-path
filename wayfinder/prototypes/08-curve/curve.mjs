// Target difficulty (average lines drawn until cleared) for any level, read from curve.json.
// Run: node curve.mjs   →  prints the target at every 10th level and checks the shape levels drawn so far
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const C = JSON.parse(readFileSync(new URL('./curve.json', import.meta.url), 'utf8'));

// within a chapter the target grows geometrically from (previous chapter end × startFactor) to this chapter's end
export function target(level) {
  const c = Math.ceil(level / 50) - 1, k = level - c * 50;
  const start = c ? C.chapterEnd[c - 1] * C.chapterStartFactor : C.firstLevelTarget, end = C.chapterEnd[c];
  return start * Math.pow(end / start, k / 50);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  for (let c = 0; c < 20; c++) console.log(`chapter ${c + 1}:`, [10, 20, 30, 40, 50].map(k => target(c * 50 + k).toFixed(0)).join(' '));
  const shapes = JSON.parse(readFileSync(new URL('../09-shapes/shapes.json', import.meta.url), 'utf8'));
  let over = 0;
  for (const ch of shapes) for (const s of ch.shapes) {
    const r = s.stats.avgLines / target(s.level);
    if (r > C.shapeLevels.maxFactor) { over++; console.log(`over the limit: level ${s.level} ${s.name} ×${r.toFixed(1)}`); }
  }
  console.log(over ? `${over} shape levels too hard` : `all drawn shape levels within ×${C.shapeLevels.maxFactor}`);
}
