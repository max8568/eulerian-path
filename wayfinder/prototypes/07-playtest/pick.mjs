// Pick the playtest levels from the figure-generation prototype's candidates.
// Run: node pick.mjs   →  levels.json + index.html (the playable page)
import { readFileSync, writeFileSync } from 'node:fs';
const src = JSON.parse(readFileSync(new URL('../06-figures/figures.json', import.meta.url), 'utf8'));
const letter = { trail: 'A', cycles: 'B' };
const pool = [
  ...src.methods.filter(m => letter[m.id]).flatMap(m => m.figures.map((f, i) => ({ id: letter[m.id] + (i + 1), ...f }))),
  ...src.shapes.map((f, i) => ({ id: 'S' + (i + 1), ...f })),
].filter(f => f.stats.avgLines <= 180).sort((a, b) => a.stats.avgLines - b.stats.avgLines);

const N = 24;
let chosen = Array.from({ length: N }, (_, i) => pool[Math.round(i * (pool.length - 1) / (N - 1))]);
// make sure the set has at least 4 recognisable shapes and 4 figures with crossings:
// swap in the unused candidate closest in difficulty to a chosen plain figure
function ensure(test, want) {
  while (chosen.filter(test).length < want) {
    const spare = pool.filter(f => test(f) && !chosen.includes(f));
    if (!spare.length) return;
    const add = spare[0];
    const plain = chosen.map((f, i) => [f, i]).filter(([f]) => !test(f) && !f.id.startsWith('S') && !(f.stats.crossings > 0) && f.stats.avgLines > 3);
    const [, i] = plain.sort((x, y) => Math.abs(x[0].stats.avgLines - add.stats.avgLines) - Math.abs(y[0].stats.avgLines - add.stats.avgLines))[0];
    chosen[i] = add;
  }
}
ensure(f => f.id.startsWith('S'), 4);
ensure(f => f.stats.crossings > 0, 4);
chosen = [...new Set(chosen)].sort((a, b) => a.stats.avgLines - b.stats.avgLines);
const levels = chosen.map(f => ({ id: f.id, name: f.name || null, pts: f.pts, edges: f.edges, stats: f.stats }));
writeFileSync(new URL('./levels.json', import.meta.url), JSON.stringify(levels));
for (const [i, f] of levels.entries())
  console.log(String(i + 1).padStart(2), f.id.padEnd(4), (f.name || '').padEnd(4), 'lines', f.stats.lines, 'odd', f.stats.odd, 'avg', f.stats.avgLines, 'p', f.stats.pRandom + '%', 'delay', f.stats.delay, 'cross', f.stats.crossings);
const tpl = readFileSync(new URL('./playtest.template.html', import.meta.url), 'utf8');
writeFileSync(new URL('./index.html', import.meta.url), tpl.replace('/*LEVELS*/null', JSON.stringify(levels)));
