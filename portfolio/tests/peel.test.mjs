import { test } from 'node:test';
import assert from 'node:assert/strict';
import { foldGeometry, polygonArea, MAX_PULL } from '../js/peel-geometry.js';

const W = 1200, H = 800;
const close = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

test('remaining and revealed areas always add up to the sheet', () => {
  for (const [x, y] of [[1, 1], [60, 60], [300, 120], [900, 700], [W * 2, H * 2]]) {
    const g = foldGeometry(W, H, x, y);
    assert.ok(close(polygonArea(g.remaining) + polygonArea(g.revealed), W * H, 1e-3), `${x},${y}`);
  }
});

test('the flap is a mirror image: same area as the revealed part', () => {
  const g = foldGeometry(W, H, 420, 260);
  assert.ok(close(polygonArea(g.flap), polygonArea(g.revealed), 1e-3));
});

test('the original corner lands exactly where it was pulled', () => {
  const g = foldGeometry(W, H, 420, 260);
  const tip = g.flap.find(([x, y]) => close(x, W - 420, 1e-6) && close(y, 260, 1e-6));
  assert.ok(tip, 'reflected top-right corner should be at the pull point');
  assert.deepEqual(g.corner, [W - 420, 260]);
});

test('a small resting pull reveals only a sliver; the maximum pull clears the sheet', () => {
  assert.ok(foldGeometry(W, H, 58, 58).progress < 0.005);
  const open = foldGeometry(W, H, W * MAX_PULL, H * MAX_PULL);
  assert.equal(open.remaining.length, 0);
  assert.ok(close(open.progress, 1));
});

test('degenerate and extreme inputs stay finite', () => {
  for (const [w, h, x, y] of [[0, 0, 0, 0], [W, H, -50, -50], [W, H, NaN, Infinity], [W, H, 1e9, 1e9]]) {
    const g = foldGeometry(w, h, x, y);
    for (const p of [...g.remaining, ...g.revealed, ...g.flap]) p.forEach(n => assert.ok(Number.isFinite(n)));
  }
});
