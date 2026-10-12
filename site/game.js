// The game screen: draw every line once by following it with a finger (SPEC.md §2, §3).
import { solvable, validStarts, nextEdge, otherEnd, undrawnAt, stepsBackToSolvable } from './euler.js';
import { chapterColor, chapterName, chapterEmoji, LAST_LEVEL } from './theme.js';
import { markCleared, markSkipped, addRecord, profile } from './store.js';
import { sounds } from './sound.js';
import { ICONS } from './icons.js';

const R = 34;            // touch radius of a point, CSS px
const TOL = 68;          // how far from a line the finger may stray and still be on it
const PAD = 40;          // space between the figure's square and the stage edge
const NS = 'http://www.w3.org/2000/svg';

export function gameScreen(root, levelData, nav) {
  const level = levelData.level, chapter = levelData.chapter;
  const fig = { pts: levelData.pts, edges: levelData.edges };
  const m = fig.edges.length;

  root.innerHTML = `
    <div class="screen game" style="--chapter:${chapterColor(chapter)}">
      <header class="g-top">
        <button class="round" data-act="back" aria-label="回選關">${ICONS.grid}</button>
        <div class="g-title"><span class="chip"><span class="emo">${chapterEmoji(chapter)}</span>${chapterName(chapter)}</span><span class="lvl">第 ${level} 關</span></div>
        <button class="round skip" data-act="skip" aria-label="跳過（按兩下）">${ICONS.skip}</button>
      </header>
      <div class="g-stage">
        <svg class="board" aria-label="畫圖區"><g class="g-edges"></g><g class="g-part"></g><g class="g-fx"></g><g class="g-verts"></g></svg>
        <div class="win" hidden>
          <div class="win-box">
            ${ICONS.star}
            <button class="big" data-act="next">下一關 ▶</button>
            <button class="small" data-act="back">回選關</button>
          </div>
        </div>
      </div>
      <nav class="g-tools">
        <button class="tool" data-act="undo" aria-label="退一步">${ICONS.undo}</button>
        <button class="tool" data-act="restart" aria-label="重來">${ICONS.restart}</button>
        <button class="tool hint" data-act="hint" aria-label="提示">${ICONS.hint}<span class="cool"></span></button>
      </nav>
    </div>`;
  const $ = sel => root.querySelector(sel);
  const svg = $('.board'), stage = $('.g-stage'), hintBtn = $('[data-act="hint"]'), skipBtn = $('[data-act="skip"]');

  // ---- state
  let V = [], E = [];                              // screen geometry of points and lines
  let drawn = new Array(m).fill(false), hist = [], cur = null;
  let dragging = false, prog = new Map(), active = null;
  let busy = false, cooling = false, done = false, wasStuck = false;
  let armedSkip = null, alive = true;
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (alive) fn(); }, ms); timers.add(t); return t; };
  const log = { t0: null, undo: 0, restart: 0, hint: 0, starts: [] };

  // ---- geometry: keep the grid spacing, centre the figure's own extent
  function unitExtent() {
    const xs = [], ys = [];
    const add = ([x, y]) => { xs.push(x); ys.push(y); };
    fig.pts.forEach(add);
    fig.edges.forEach(([a, b, bulge = 0]) => {
      if (!bulge) return;
      const A = fig.pts[a], B = fig.pts[b], dx = B[0] - A[0], dy = B[1] - A[1];
      const C = [(A[0] + B[0]) / 2 - dy * bulge, (A[1] + B[1]) / 2 + dx * bulge];
      for (let i = 1; i < 16; i++) { const t = i / 16, u = 1 - t; add([u*u*A[0] + 2*u*t*C[0] + t*t*B[0], u*u*A[1] + 2*u*t*C[1] + t*t*B[1]]); }
    });
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }
  const box = unitExtent();
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  function layout() {
    const w = svg.clientWidth, h = svg.clientHeight;
    if (!w || !h) return;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const size = Math.max(10, Math.min(w, h) - 2 * PAD);
    const ox = w / 2 - ((box[0] + box[2]) / 2) * size, oy = h / 2 - ((box[1] + box[3]) / 2) * size;
    V = fig.pts.map(([x, y]) => [ox + x * size, oy + y * size]);
    E = fig.edges.map(([a, b, bulge = 0]) => {
      const A = V[a], B = V[b], dx = B[0] - A[0], dy = B[1] - A[1];
      let pts, d;
      if (!bulge) { pts = [A, B]; d = `M${A}L${B}`; }
      else {
        const C = [(A[0] + B[0]) / 2 - dy * bulge, (A[1] + B[1]) / 2 + dx * bulge];
        pts = [];
        for (let i = 0; i <= 32; i++) { const t = i / 32, u = 1 - t; pts.push([u*u*A[0] + 2*u*t*C[0] + t*t*B[0], u*u*A[1] + 2*u*t*C[1] + t*t*B[1]]); }
        d = `M${A}Q${C} ${B}`;
      }
      const cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i - 1], pts[i]));
      return { a, b, pts, cum, len: cum[cum.length - 1], d };
    });
  }
  // a line's points walked starting from vertex v
  function poly(e, v) {
    const ed = E[e];
    if (ed.a === v) return ed;
    const pts = ed.pts.slice().reverse(), cum = pts.map((_, i) => ed.len - ed.cum[ed.pts.length - 1 - i]);
    return { pts, cum, len: ed.len };
  }
  function nearest(pl, p) {
    let best = { d: Infinity, t: 0 };
    for (let i = 0; i < pl.pts.length - 1; i++) {
      const a = pl.pts[i], b = pl.pts[i + 1], vx = b[0] - a[0], vy = b[1] - a[1], l2 = vx * vx + vy * vy || 1;
      const u = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / l2));
      const d = Math.hypot(p[0] - a[0] - u * vx, p[1] - a[1] - u * vy);
      if (d < best.d) best = { d, t: (pl.cum[i] + u * Math.sqrt(l2)) / pl.len };
    }
    return best;
  }
  function partial(pl, t) {
    const target = t * pl.len, out = [pl.pts[0]];
    for (let i = 1; i < pl.pts.length; i++) {
      if (pl.cum[i] <= target) { out.push(pl.pts[i]); continue; }
      const u = (target - pl.cum[i - 1]) / (pl.cum[i] - pl.cum[i - 1]), a = pl.pts[i - 1], b = pl.pts[i];
      out.push([a[0] + u * (b[0] - a[0]), a[1] + u * (b[1] - a[1])]);
      break;
    }
    return out;
  }

  // ---- rendering
  function el(tag, attrs, parent) { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.appendChild(n); return n; }
  const ptsAttr = pts => pts.map(p => p.join(',')).join(' ');
  const stuck = () => !done && !busy && cur != null && undrawnAt(fig, drawn, cur).length === 0;
  function render() {
    const gE = $('.g-edges'), gP = $('.g-part'), gV = $('.g-verts');
    gE.textContent = gP.textContent = gV.textContent = '';
    E.forEach((e, i) => el('path', { d: e.d, class: drawn[i] ? 'e-done' : 'e-todo' }, gE));
    // the line drawn furthest so far stays on screen even while the finger strays off it
    let showE = null, showT = 0;
    for (const [e, t] of prog) if (t > showT) { showT = t; showE = e; }
    if (dragging && cur != null && showE != null) el('polyline', { points: ptsAttr(partial(poly(showE, cur), showT)), class: 'e-part' }, gP);
    V.forEach((p, v) => {
      if (v === cur) {
        if (!done) el('circle', { cx: p[0], cy: p[1], r: 16, class: 'ring' }, gV);
        el('circle', { cx: p[0], cy: p[1], r: 16, class: 'v-here' }, gV);
      } else el('circle', { cx: p[0], cy: p[1], r: 13, class: 'v' }, gV);
    });
    const isStuck = stuck();
    hintBtn.classList.toggle('bounce', isStuck);
    if (isStuck && !wasStuck) sounds.stuck();
    wasStuck = isStuck;
    $('.win').hidden = !done;
  }

  // ---- records (SPEC.md §7)
  function record(result) {
    if (!log.t0 && result !== 'skipped') return;
    const s = levelData.stats || {};
    addRecord({
      level, result, seconds: log.t0 ? Math.round((Date.now() - log.t0) / 1000) : 0,
      undo: log.undo, restart: log.restart, hint: log.hint,
      starts: log.starts.length, goodStarts: log.starts.filter(Boolean).length, firstStartGood: log.starts.length ? log.starts[0] : null,
      lines: m, odd: s.odd, avgLines: s.avgLines, crossings: s.crossings, at: new Date().toISOString(),
    });
  }

  // ---- actions
  function chooseStart(v) {
    cur = v;
    if (!log.t0) log.t0 = Date.now();
    log.starts.push(validStarts(fig).includes(v));
  }
  function commit(e) {
    drawn[e] = true; hist.push({ e, from: cur }); cur = otherEnd(fig, e, cur);
    prog.clear(); active = null;
    sounds.line(hist.length - 1);
    try { navigator.vibrate && navigator.vibrate(12); } catch (x) { /* not supported */ }
    if (drawn.every(Boolean)) win();
  }
  function win() {
    done = true; dragging = false;
    markCleared(level); record('cleared');
    if (level === LAST_LEVEL) $('[data-act="next"]').hidden = true;
    sounds.win();
    later(() => confetti(stage), 50);
  }
  function undo() {
    if (busy || done) return;
    if (hist.length) { const h = hist.pop(); drawn[h.e] = false; cur = h.from; }
    else if (cur != null) cur = null;
    else return;
    log.undo++; render();
  }
  function restart() {
    if (busy || done) return;
    drawn.fill(false); hist = []; cur = null; log.restart++; render();
  }
  function flashEdge(e, from) {
    const pl = poly(e, from);
    const n = el('polyline', { points: ptsAttr(pl.pts), class: 'hint-line', 'stroke-dasharray': pl.len, 'stroke-dashoffset': pl.len }, $('.g-fx'));
    later(() => n.remove(), 2300);
  }
  function flashStarts() {
    for (const v of validStarts(fig)) {
      const n = el('circle', { cx: V[v][0], cy: V[v][1], r: 22, class: 'hint-dot' }, $('.g-fx'));
      later(() => n.remove(), 2500);
    }
  }
  function hint() {
    if (busy || cooling || done) return;
    log.hint++; if (!log.t0) log.t0 = Date.now();
    sounds.hint();
    cooling = true; hintBtn.disabled = true; hintBtn.classList.add('cooling');
    later(() => { cooling = false; hintBtn.disabled = false; hintBtn.classList.remove('cooling'); }, 5000);
    if (cur == null) { render(); flashStarts(); return; }
    let back = stepsBackToSolvable(fig, drawn, cur, hist);
    if (back === 0) { render(); flashEdge(nextEdge(fig, drawn, cur), cur); return; }
    // already doomed: take lines back one at a time, then show the line that should have been drawn
    busy = true; render();
    const step = () => {
      if (back > hist.length) { // even the starting point was wrong
        if (hist.length) { const h = hist.pop(); drawn[h.e] = false; cur = h.from; render(); later(step, 320); return; }
        cur = null; busy = false; render(); flashStarts(); return;
      }
      const h = hist.pop(); drawn[h.e] = false; cur = h.from; back--;
      if (back === 0) { busy = false; render(); later(() => flashEdge(nextEdge(fig, drawn, cur), cur), 250); return; }
      render(); later(step, 320);
    };
    later(step, 200);
  }
  function disarmSkip() { clearTimeout(armedSkip); armedSkip = null; skipBtn.classList.remove('armed'); }
  function skip() {
    if (busy || done) return;
    if (!armedSkip) { skipBtn.classList.add('armed'); armedSkip = setTimeout(disarmSkip, 3000); return; }
    disarmSkip();
    markSkipped(level); record('skipped');
    level < LAST_LEVEL ? nav.play(level + 1) : nav.chapters();
  }
  function leave() {
    if (!done) record('left');
    nav.levels(chapter);
  }

  // ---- input: follow the line with a finger
  const pos = ev => { const r = svg.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
  svg.addEventListener('pointerdown', ev => {
    if (busy || done) return;
    const p = pos(ev);
    if (cur == null) {
      let best = null, bd = Infinity;
      V.forEach((q, v) => { const d = dist(p, q); if (d <= R && d < bd) { bd = d; best = v; } });
      if (best == null) return;
      chooseStart(best);
    } else if (dist(p, V[cur]) > R) {
      const here = $('.v-here');
      if (here) { here.classList.remove('nudge'); void here.getBoundingClientRect(); here.classList.add('nudge'); }
      return;
    }
    dragging = true; prog.clear(); active = null;
    try { svg.setPointerCapture(ev.pointerId); } catch (x) { /* synthetic events */ }
    render();
  });
  svg.addEventListener('pointermove', ev => {
    if (!dragging || busy || done) return;
    const p = pos(ev);
    active = null; let bestT = 0;
    for (const e of undrawnAt(fig, drawn, cur)) {
      const { t, d } = nearest(poly(e, cur), p), was = prog.get(e) || 0;
      if (d > TOL) continue; // off the line: keep what is drawn so far and wait for the finger to come back
      if (t <= was + 0.35) prog.set(e, Math.max(was, t));
      if ((prog.get(e) || 0) > bestT) { bestT = prog.get(e); active = e; }
    }
    if (active != null && (bestT >= 0.9 || (bestT >= 0.5 && dist(p, V[otherEnd(fig, active, cur)]) <= R * 0.8))) commit(active);
    render();
  });
  const endDrag = () => { if (!dragging) return; dragging = false; prog.clear(); active = null; render(); };
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);

  root.querySelector('.game').addEventListener('click', ev => {
    const act = ev.target.closest('[data-act]')?.dataset.act;
    if (act === 'undo') undo();
    else if (act === 'restart') restart();
    else if (act === 'hint') hint();
    else if (act === 'skip') skip();
    else if (act === 'back') leave();
    else if (act === 'next') nav.play(level + 1);
  });

  const ro = new ResizeObserver(() => { layout(); render(); });
  ro.observe(svg);
  layout(); render();

  // for automated checks: the figure, current state and where the points are on screen
  window.__game = { level, fig, get state() { return { drawn: drawn.slice(), cur, hist: hist.slice(), done, busy, V: V.map(p => p.slice()) }; } };

  return () => { alive = false; ro.disconnect(); timers.forEach(clearTimeout); clearTimeout(armedSkip); };
}

// coloured paper bits bursting from the middle of the stage
function confetti(host) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas');
  c.className = 'confetti'; host.appendChild(c);
  const w = c.width = host.clientWidth * 2, h = c.height = host.clientHeight * 2, x = c.getContext('2d');
  const bits = Array.from({ length: 120 }, () => ({ x: w / 2, y: h / 2, vx: (Math.random() - .5) * w / 30, vy: -(Math.random() * h / 35 + h / 120), s: 14 + Math.random() * 16, c: `hsl(${Math.random() * 360} 80% 60%)`, r: Math.random() * 6 }));
  let f = 0;
  (function step() {
    x.clearRect(0, 0, w, h);
    for (const b of bits) { b.x += b.vx; b.y += b.vy; b.vy += h / 900; b.r += 0.2; x.save(); x.translate(b.x, b.y); x.rotate(b.r); x.fillStyle = b.c; x.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2); x.restore(); }
    if (++f < 90 && c.isConnected) requestAnimationFrame(step); else c.remove();
  })();
}
