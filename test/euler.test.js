import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isOneStroke, solvable, validStarts, nextEdge, stepsBackToSolvable, simulate, seededRandom, otherEnd } from '../site/euler.js';

// two triangles joined by one line (the "dumbbell"): odd points are 2 and 3
const dumbbell = { pts: [[0,0],[0,1],[1,.5],[2,.5],[3,0],[3,1]], edges: [[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,3]] };
const triangle = { pts: [[0,0],[1,0],[.5,1]], edges: [[0,1],[1,2],[2,0]] };
const none = n => new Array(n).fill(false);

test('isOneStroke accepts 0 or 2 odd points and rejects 4', () => {
  assert.equal(isOneStroke(triangle), true);
  assert.equal(isOneStroke(dumbbell), true);
  const star = { pts: [[0,0],[1,0],[0,1],[1,1],[.5,.5]], edges: [[4,0],[4,1],[4,2],[4,3]] };
  assert.equal(isOneStroke(star), false);
  const apart = { pts: [[0,0],[1,0],[5,5],[6,5]], edges: [[0,1],[2,3]] };
  assert.equal(isOneStroke(apart), false);
});

test('validStarts: the two odd points, or every point when all are even', () => {
  assert.deepEqual(validStarts(dumbbell).sort(), [2, 3]);
  assert.deepEqual(validStarts(triangle), [0, 1, 2]);
});

test('solvable: a wrong start is already doomed', () => {
  assert.equal(solvable(dumbbell, none(7), null), true);
  assert.equal(solvable(dumbbell, none(7), 2), true);
  assert.equal(solvable(dumbbell, none(7), 0), false);
});

test('solvable: crossing the bridge too early dooms the drawing', () => {
  const drawn = none(7); drawn[3] = true; // 2 → 3 first: left triangle can never be reached again
  assert.equal(solvable(dumbbell, drawn, 3), false);
  const ok = none(7); ok[1] = true; // 2 → 1, still fine
  assert.equal(solvable(dumbbell, ok, 1), true);
});

test('nextEdge never chooses the bridge while the triangle is unfinished', () => {
  const e = nextEdge(dumbbell, none(7), 2);
  assert.notEqual(e, 3);
  // following nextEdge from a valid start always finishes the figure
  const drawn = none(7); let cur = 2;
  for (let i = 0; i < 7; i++) { const n = nextEdge(dumbbell, drawn, cur); assert.notEqual(n, undefined); drawn[n] = true; cur = otherEnd(dumbbell, n, cur); }
  assert.ok(drawn.every(Boolean));
});

test('stepsBackToSolvable finds the mistake', () => {
  // start at 2, take the bridge to 3, then draw 3 → 4: the mistake was one line plus the next
  const drawn = none(7); drawn[3] = true; drawn[4] = true;
  const history = [{ e: 3, from: 2 }, { e: 4, from: 3 }];
  assert.equal(stepsBackToSolvable(dumbbell, drawn, 4, history), 2);
  // a wrong start: nothing drawn but standing on point 0
  assert.equal(stepsBackToSolvable(dumbbell, none(7), 0, []), 1);
  // already fine
  assert.equal(stepsBackToSolvable(dumbbell, none(7), 2, []), 0);
});

test('simulate: a triangle always succeeds, the dumbbell often fails', () => {
  const t = simulate(triangle, 500, seededRandom(1));
  assert.equal(t.pRandom, 1);
  assert.equal(t.avgLines, 3);
  const d = simulate(dumbbell, 4000, seededRandom(2));
  assert.ok(d.pRandom > 0.15 && d.pRandom < 0.3, `pRandom ${d.pRandom}`);
  assert.ok(d.avgLines > 15, `avgLines ${d.avgLines}`);
});

test('seededRandom repeats the same sequence for the same seed', () => {
  const a = seededRandom(42), b = seededRandom(42);
  for (let i = 0; i < 5; i++) assert.equal(a(), b());
});
