/* Paper peel: the hero is a sheet that can be dragged back from its top-right corner.
 * - Pointer drag (mouse, pen, touch) starts only on the corner handle, so page scrolling is untouched.
 * - Click/tap on the handle, the "Meet Sky" buttons, Enter or Space all toggle it.
 * - Escape or "Back to the work" closes it and returns focus.
 * - Reduced motion: dragging still follows the pointer (direct manipulation), but nothing animates on its own.
 * - Without JavaScript the sheet never clips, and the same introduction appears in the About section.
 */
import { foldGeometry, MAX_PULL } from './peel-geometry.js';

const cover = document.querySelector('[data-peel]');
if (cover) initPeel(cover);

function initPeel(cover) {
  const sheet = cover.querySelector('.cover-sheet');
  const under = cover.querySelector('.cover-under');
  const handle = cover.querySelector('.peel-corner');
  const svg = cover.querySelector('.fold');
  const flap = svg.querySelector('.fold-flap');
  const flapShadow = svg.querySelector('.fold-flap-shadow');
  const revealShade = svg.querySelector('.fold-reveal-shade');
  const flapGradient = svg.querySelector('#flap-shade');
  const creaseGradient = svg.querySelector('#crease-shade');
  const openers = document.querySelectorAll('[data-peel-open]');
  const closers = cover.querySelectorAll('[data-peel-close]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const REST = 58; // the corner sits slightly lifted so it reads as a sheet
  const HOVER = 92;
  let open = false;
  let pull = [REST, REST];
  let frame = 0;
  let drag = null;
  let lastOpener = handle;

  const size = () => ({ w: cover.clientWidth, h: cover.clientHeight });
  const pts = list => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const openTarget = () => { const { w, h } = size(); return [w * MAX_PULL, h * MAX_PULL]; };

  function draw(x, y) {
    pull = [x, y];
    const { w, h } = size();
    const g = foldGeometry(w, h, x, y);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    sheet.style.clipPath = g.remaining.length > 2
      ? `polygon(${g.remaining.map(([px, py]) => `${px.toFixed(1)}px ${py.toFixed(1)}px`).join(', ')})`
      : 'polygon(0 0, 0 0, 0 0)';

    flap.setAttribute('points', pts(g.flap));
    flapShadow.setAttribute('points', pts(g.flap));
    revealShade.setAttribute('points', pts(g.revealed));

    // Paper back: darker in the crease, catching light toward the lifted tip.
    setLine(flapGradient, g.mid, g.corner);
    // Shadow the lifted sheet casts on the layer beneath, fading away from the crease.
    const reach = Math.min(140, 30 + Math.hypot(x, y) * 0.22);
    setLine(creaseGradient, g.mid, [g.mid[0] - g.direction[0] * reach, g.mid[1] - g.direction[1] * reach]);

    cover.style.setProperty('--peel-progress', g.progress.toFixed(3));
    cover.classList.toggle('is-lifted', g.progress > 0.02);
  }

  function setLine(gradient, [x1, y1], [x2, y2]) {
    gradient.setAttribute('x1', x1.toFixed(1));
    gradient.setAttribute('y1', y1.toFixed(1));
    gradient.setAttribute('x2', x2.toFixed(1));
    gradient.setAttribute('y2', y2.toFixed(1));
  }

  function animateTo(target, duration = 720) {
    cancelAnimationFrame(frame);
    if (reduced.matches) { draw(...target); return; }
    const from = [...pull];
    const start = performance.now();
    const step = now => {
      const t = Math.min(1, (now - start) / duration);
      const e = t < 1 ? 1 - Math.pow(1 - t, 4) : 1; // ease-out quart, like paper settling
      draw(from[0] + (target[0] - from[0]) * e, from[1] + (target[1] - from[1]) * e);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  }

  function setOpen(state, { focus = true } = {}) {
    open = state;
    cover.classList.toggle('is-open', open);
    handle.setAttribute('aria-expanded', String(open));
    handle.setAttribute('aria-label', open ? 'Fold the cover back' : 'Peel back the cover to meet Sky');
    openers.forEach(b => b.setAttribute('aria-expanded', String(open)));
    under.inert = !open;
    under.setAttribute('aria-hidden', String(!open));
    sheet.inert = open;
    animateTo(open ? openTarget() : [REST, REST], open ? 900 : 640);
    if (!focus) return;
    if (open) under.querySelector('h2').focus({ preventScroll: true });
    else lastOpener.focus({ preventScroll: true });
  }

  // ---------- Pointer drag on the corner ----------

  handle.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    cancelAnimationFrame(frame);
    const rect = cover.getBoundingClientRect();
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, rect, moved: false, startOpen: open };
    handle.setPointerCapture(event.pointerId);
    cover.classList.add('is-dragging');
  });

  handle.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 6) return;
    drag.moved = true;
    const { rect } = drag;
    // The corner follows the pointer: distance from the right edge and from the top.
    draw(Math.max(REST * 0.6, rect.right - event.clientX), Math.max(REST * 0.6, event.clientY - rect.top));
  });

  const endDrag = event => {
    if (!drag || event.pointerId !== drag.id) return;
    const { moved } = drag;
    drag = null;
    cover.classList.remove('is-dragging');
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    if (!moved) return; // a plain click/tap is handled by the click event
    handle.dataset.dragged = 'true';
    const { w, h } = size();
    const far = pull[0] > w * 0.32 || pull[1] > h * 0.38;
    lastOpener = handle;
    setOpen(far);
  };
  handle.addEventListener('pointerup', endDrag);
  handle.addEventListener('pointercancel', event => {
    if (!drag) return;
    drag = null;
    cover.classList.remove('is-dragging');
    animateTo(open ? openTarget() : [REST, REST]);
  });

  handle.addEventListener('click', () => {
    if (handle.dataset.dragged) { delete handle.dataset.dragged; return; }
    lastOpener = handle;
    setOpen(!open);
  });

  // A small lift on hover hints that the corner can move.
  handle.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' && !open && !drag && !reduced.matches) animateTo([HOVER, HOVER], 380);
  });
  handle.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse' && !open && !drag && !reduced.matches) animateTo([REST, REST], 420);
  });

  // ---------- Buttons and keys ----------

  openers.forEach(button => button.addEventListener('click', () => {
    lastOpener = button;
    if (!open) cover.scrollIntoView({ block: 'start', behavior: reduced.matches ? 'auto' : 'smooth' });
    setOpen(!open);
  }));
  closers.forEach(button => button.addEventListener('click', () => setOpen(false)));
  cover.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) { event.preventDefault(); setOpen(false); }
  });

  new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    draw(...(open ? openTarget() : [REST, REST]));
  }).observe(cover);

  under.inert = true;
  cover.classList.add('peel-ready');
  draw(REST, REST);
}
