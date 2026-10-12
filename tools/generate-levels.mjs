// Build the 1000 levels from curve.json and the drawn shape levels.
// Run: node tools/generate-levels.mjs   →  site/levels.json
// Candidate pools are cached in tools/out/pools/ (delete that folder after changing how figures are made).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { isOneStroke, simulate, degrees, oddVertices, seededRandom } from '../site/euler.js';
import { makeLattice, toFigure, canonical } from './lattice.mjs';
import { crossings, pointsClear } from './geometry.mjs';
import { CURVE, rulesFor, isShapeLevel, target, LEVELS_PER_CHAPTER, CHAPTERS } from './curve.mjs';
import { placeShapes } from './check-shapes.mjs';

const POOL_SIZE = { 3: 1500, 4: 3000, 5: 3000 };
const QUICK_ATTEMPTS = 800, FINAL_ATTEMPTS = 5000;
const poolDir = new URL('./out/pools/', import.meta.url);
mkdirSync(poolDir, { recursive: true });

// every distinct figure one method can make on one grid, with its difficulty numbers
function pool(G, method) {
  const file = new URL(`${method}-${G}x${G}-${POOL_SIZE[G]}.json`, poolDir);
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  const rand = seededRandom(1000 * G + (method === 'trail' ? 1 : 2));
  const gen = makeLattice(G, rand)[method], seen = new Set(), out = [];
  for (let tries = 0; out.length < POOL_SIZE[G] && tries < POOL_SIZE[G] * 60; tries++) {
    const list = gen(), fig = toFigure(list, G);
    if (fig.edges.length < 3 || !isOneStroke(fig) || !pointsClear(fig)) continue;
    const key = canonical(list, G);
    if (seen.has(key)) continue;
    seen.add(key);
    const s = simulate(fig, QUICK_ATTEMPTS, rand, { withDelay: false });
    out.push({ ...fig, key, odd: oddVertices(degrees(fig.pts.length, fig.edges)).length, crossings: crossings(fig), avgLines: s.avgLines });
  }
  writeFileSync(file, JSON.stringify(out));
  console.log(`pool ${method} ${G}×${G}: ${out.length} distinct figures`);
  return out;
}

const pools = {};
const getPool = (G, method) => (pools[`${G}${method}`] ||= pool(G, method));
const used = new Set();
const fits = (c, r) =>
  !used.has(c.key) && Number.isFinite(c.avgLines) &&
  (r.odd === 'any' || (r.odd === 'none' ? c.odd === 0 : c.odd === 2)) &&
  (r.crossing === 'any' || (r.crossing === 'none' ? c.crossings === 0 : c.crossings > 0));
// the unused candidate whose difficulty is closest to the target (compared on a log scale)
function choose(candidates, r, goal) {
  let best = null, bd = Infinity;
  for (const c of candidates) {
    if (!fits(c, r)) continue;
    const d = Math.abs(Math.log(c.avgLines) - Math.log(goal));
    if (d < bd) { bd = d; best = c; }
  }
  if (!best) throw new Error(`no candidate left for level rules ${JSON.stringify(r)}`);
  used.add(best.key);
  return best;
}

const rand = seededRandom(7);
function finalStats(fig) {
  const s = simulate(fig, FINAL_ATTEMPTS, rand);
  return {
    lines: fig.edges.length, odd: oddVertices(degrees(fig.pts.length, fig.edges)).length,
    avgLines: +s.avgLines.toFixed(1), pRandom: +s.pRandom.toFixed(3), delay: +s.delay.toFixed(1), crossings: crossings(fig),
  };
}

const shapeChapters = placeShapes();
const badShapes = shapeChapters.flatMap(ch => ch.shapes.filter(s => s.issues.length));
if (badShapes.length) throw new Error(`fix these shape levels first (node tools/check-shapes.mjs): ${badShapes.map(s => s.name).join(', ')}`);
const shapeAt = new Map(shapeChapters.flatMap(ch => ch.shapes.map(s => [s.level, s])));

const levels = [];
for (let level = 1; level <= LEVELS_PER_CHAPTER * CHAPTERS; level++) {
  const r = rulesFor(level);
  if (isShapeLevel(level) && shapeAt.has(level)) {
    const s = shapeAt.get(level);
    levels.push({ level, chapter: r.chapter, kind: 'shape', name: s.name, pts: s.pts, edges: s.edges,
      stats: { lines: s.stats.lines, odd: s.stats.odd, avgLines: s.stats.avgLines, pRandom: s.stats.pRandom, delay: s.stats.delay, crossings: s.stats.crossings } });
    continue;
  }
  // a shape level not drawn yet gets a generated stand-in at the shape-level difficulty
  const standIn = isShapeLevel(level);
  const rules = standIn ? { ...r, odd: r.odd === 'none' && r.chapter === 1 ? 'none' : 'any', crossing: r.crossing === 'none' ? 'none' : 'any' } : r;
  const goal = standIn ? target(level) * CURVE.shapeLevels.targetFactor : r.target;
  const candidates = standIn ? [...getPool(r.grid, 'trail'), ...getPool(r.grid, 'cycles')] : getPool(r.grid, r.method);
  const c = choose(candidates, rules, goal);
  const fig = { pts: c.pts, edges: c.edges };
  levels.push({ level, chapter: r.chapter, kind: 'generated', ...(standIn ? { placeholder: true } : {}), grid: r.grid, pts: fig.pts, edges: fig.edges, stats: finalStats(fig) });
}

writeFileSync(new URL('../site/levels.json', import.meta.url), JSON.stringify(levels));

// how close each chapter came to the curve
for (let ch = 1; ch <= CHAPTERS; ch++) {
  const gen = levels.filter(l => l.chapter === ch && l.kind === 'generated' && !l.placeholder);
  const ratios = gen.map(l => l.stats.avgLines / rulesFor(l.level).target);
  const stand = levels.filter(l => l.chapter === ch && l.placeholder).length;
  console.log(`chapter ${String(ch).padStart(2)}: ${CURVE.grid.find(g => ch >= g.fromChapter && ch <= g.toChapter).size}×, generated vs target ×${Math.min(...ratios).toFixed(2)}–×${Math.max(...ratios).toFixed(2)}, avgLines ${Math.min(...gen.map(l => l.stats.avgLines))}–${Math.max(...gen.map(l => l.stats.avgLines))}${stand ? `, ${stand} shape stand-ins` : ''}`);
}
console.log(`wrote site/levels.json: ${levels.length} levels, ${(JSON.stringify(levels).length / 1024).toFixed(0)} KB`);
