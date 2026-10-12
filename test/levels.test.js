// Checks site/levels.json against SPEC.md §6 and curve.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isOneStroke, degrees, oddVertices } from '../site/euler.js';
import { rulesFor, isShapeLevel, CURVE } from '../tools/curve.mjs';
import { pointsClear, crossings } from '../tools/geometry.mjs';

const levels = JSON.parse(readFileSync(new URL('../site/levels.json', import.meta.url), 'utf8'));
const odd = l => oddVertices(degrees(l.pts.length, l.edges)).length;

test('exactly 1000 levels, numbered 1–1000 in 20 chapters of 50', () => {
  assert.equal(levels.length, 1000);
  levels.forEach((l, i) => { assert.equal(l.level, i + 1); assert.equal(l.chapter, Math.ceil((i + 1) / 50)); });
});

test('every level can be drawn in one stroke and no point sits on a line it is not part of', () => {
  for (const l of levels) {
    assert.ok(isOneStroke(l), `level ${l.level} cannot be drawn in one stroke`);
    assert.ok(l.edges.length >= 3, `level ${l.level} has fewer than 3 lines`);
    assert.ok(pointsClear(l), `level ${l.level} has a point on a line`);
    for (const [x, y] of l.pts) assert.ok(x >= 0 && y >= 0 && x <= 1 && y <= 1, `level ${l.level} point outside the square`);
  }
});

test('every 10th level is a shape level (or a stand-in until it is drawn), the rest are generated', () => {
  for (const l of levels) {
    if (isShapeLevel(l.level)) assert.ok(l.kind === 'shape' || l.placeholder, `level ${l.level} should be a shape level`);
    else assert.ok(l.kind === 'generated' && !l.placeholder, `level ${l.level} should be generated`);
  }
});

test('no two levels are the same figure', () => {
  const seen = new Set();
  for (const l of levels) {
    const key = JSON.stringify([l.pts, l.edges]);
    assert.ok(!seen.has(key), `level ${l.level} repeats an earlier level`);
    seen.add(key);
  }
});

test('generated levels follow their chapter rules (grid, odd points, crossings)', () => {
  for (const l of levels.filter(x => x.kind === 'generated' && !x.placeholder)) {
    const r = rulesFor(l.level);
    assert.equal(l.grid, r.grid, `level ${l.level} grid`);
    const o = odd(l), c = crossings(l);
    if (r.odd === 'none') assert.equal(o, 0, `level ${l.level} should have no odd points`);
    if (r.odd === 'two') assert.equal(o, 2, `level ${l.level} should have two odd points`);
    if (r.crossing === 'none') assert.equal(c, 0, `level ${l.level} should have no crossings`);
    if (r.crossing === 'some') assert.ok(c > 0, `level ${l.level} should have a crossing`);
  }
});

test('generated levels stay near the difficulty curve', () => {
  for (const l of levels.filter(x => x.kind === 'generated' && !x.placeholder)) {
    const ratio = l.stats.avgLines / rulesFor(l.level).target;
    assert.ok(ratio > 0.5 && ratio < 2, `level ${l.level} is ×${ratio.toFixed(2)} of its target`);
  }
});

test('shape levels are at most 2.5× the curve', () => {
  for (const l of levels.filter(x => x.kind === 'shape')) {
    const ratio = l.stats.avgLines / rulesFor(l.level).target;
    assert.ok(ratio <= CURVE.shapeLevels.maxFactor, `shape level ${l.level} ${l.name} is ×${ratio.toFixed(2)}`);
  }
});
