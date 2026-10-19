/* Pure fold geometry for the paper peel. No DOM access, so it can be unit-tested in Node.
 *
 * The sheet is a w×h rectangle with its top-right corner at (w, 0). Pulling that corner
 * by (dx, dy) — left and down — folds the sheet along the perpendicular bisector between
 * the original corner and its new position (the crease). Everything on the corner's side
 * of the crease is lifted away and reflected across it to form the visible paper back.
 */

export const MAX_PULL = 2.15; // multiples of width/height; large enough to clear the whole sheet

export function foldGeometry(width, height, pullX, pullY) {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const dx = clamp(pullX, 0.001, w * MAX_PULL);
  const dy = clamp(pullY, 0.001, h * MAX_PULL);

  // Crease: points p with n·p = c, where n points from the dragged corner toward the original one.
  const nx = dx;
  const ny = -dy;
  const c = nx * (w - dx / 2) + ny * (dy / 2);
  const signed = ([x, y]) => nx * x + ny * y - c; // > 0 on the lifted (corner) side
  const rect = [[0, 0], [w, 0], [w, h], [0, h]];

  function clip(keep) {
    const out = [];
    rect.forEach((a, i) => {
      const b = rect[(i + 1) % rect.length];
      const da = signed(a);
      const db = signed(b);
      if (keep(da)) out.push(a);
      if (keep(da) !== keep(db)) {
        const t = da / (da - db);
        out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
      }
    });
    return out;
  }

  const remaining = clip(v => v <= 0);
  const revealed = clip(v => v > 0);
  const lengthSq = nx * nx + ny * ny;
  const reflect = ([x, y]) => {
    const k = (2 * signed([x, y])) / lengthSq;
    return [x - k * nx, y - k * ny];
  };
  const flap = revealed.map(reflect);

  const corner = [w - dx, dy]; // where the lifted corner now sits
  const mid = [w - dx / 2, dy / 2]; // midpoint of the crease segment between corner positions
  const length = Math.sqrt(lengthSq);
  const toCorner = [-dx / length, dy / length]; // unit vector from crease toward the flap tip
  const crease = revealed.filter(point => Math.abs(signed(point)) < 1e-6 * length * Math.max(w, h));

  return {
    remaining,
    revealed,
    flap,
    corner,
    mid,
    crease,
    direction: toCorner,
    progress: Math.min(1, polygonArea(revealed) / (w * h))
  };
}

export function polygonArea(points) {
  let sum = 0;
  points.forEach(([x1, y1], i) => {
    const [x2, y2] = points[(i + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  });
  return Math.abs(sum) / 2;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
