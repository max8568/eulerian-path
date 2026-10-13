import { test } from 'node:test';
import assert from 'node:assert/strict';
import { follower } from '../site/follow.js';

const TOL = 68;
// level 290 (whale): the finger moves along curve 9 in small steps; line 6, a short straight line leaving the
// same point, stays within reach and its progress runs ahead (measured: 19px away and 0.38 along when the finger
// is 0.1 along the curve, 49px and 1.0 at 0.3)
const whale = Array.from({ length: 30 }, (_, i) => {
  const s = (i + 1) / 100;
  return [{ e: 6, t: Math.min(1, s * 3.8), d: Math.min(49, s * 190) }, { e: 8, t: 0, d: 56 + s * 400 }, { e: 9, t: s, d: 0 }];
});

test('follower picks the line the finger is on, not a nearby line that is further along', () => {
  const f = follower(TOL);
  for (const hits of whale) assert.equal(f.move(hits), 9);
  assert.equal(f.progress(9), 0.3);
  assert.equal(f.progress(6), 1); // the nearby line ran to its end, and still was not picked
});

test('follower stays on its line when the finger wobbles closer to another line for a moment', () => {
  const f = follower(TOL);
  for (let i = 1; i <= 20; i++) f.move([{ e: 1, t: i / 40, d: 4 }, { e: 2, t: i / 40, d: 24 }]);
  assert.equal(f.move([{ e: 1, t: 0.52, d: 22 }, { e: 2, t: 0.52, d: 10 }]), 1);
  // and the line it is on keeps moving forward, so it can still be finished
  for (let i = 22; i <= 38; i++) f.move([{ e: 1, t: i / 40, d: 4 }, { e: 2, t: i / 40, d: 24 }]);
  assert.equal(f.progress(1), 0.95);
});

test('follower keeps progress when the finger strays off every line, and picks nothing', () => {
  const f = follower(TOL);
  f.move([{ e: 9, t: 0.3, d: 5 }]);
  assert.equal(f.move([{ e: 9, t: 0.6, d: 80 }]), null);
  assert.equal(f.progress(9), 0.3);
  assert.equal(f.last, 9);
});

test('follower ignores a jump far ahead along the line', () => {
  const f = follower(TOL);
  f.move([{ e: 2, t: 0.1, d: 5 }]);
  assert.equal(f.move([{ e: 2, t: 0.9, d: 5 }]), 2);
  assert.equal(f.progress(2), 0.1);
});

test('follower starts over after reset', () => {
  const f = follower(TOL);
  f.move([{ e: 2, t: 0.3, d: 5 }]);
  f.reset();
  assert.equal(f.progress(2), 0);
  assert.equal(f.last, null);
});
