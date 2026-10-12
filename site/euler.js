// One-stroke logic shared by the game (browser) and the level tools (Node).
// A figure is { pts: [[x, y], ...], edges: [[a, b, bulge?], ...] }; `drawn` is a boolean per edge.

export function degrees(n, edges, drawn) {
  const deg = new Array(n).fill(0);
  edges.forEach(([a, b], i) => { if (!drawn || !drawn[i]) { deg[a]++; deg[b]++; } });
  return deg;
}

export const oddVertices = deg => deg.map((d, v) => (d % 2 ? v : -1)).filter(v => v >= 0);

// Are all edges not yet drawn reachable from `from` (or from any endpoint when from is null)?
export function connected(n, edges, drawn, from = null) {
  const deg = degrees(n, edges, drawn);
  const start = from ?? deg.findIndex(d => d > 0);
  if (start < 0) return true;
  const adj = Array.from({ length: n }, () => []);
  edges.forEach(([a, b], i) => { if (!drawn || !drawn[i]) { adj[a].push(b); adj[b].push(a); } });
  const seen = new Set([start]), stack = [start];
  while (stack.length) for (const y of adj[stack.pop()]) if (!seen.has(y)) { seen.add(y); stack.push(y); }
  return deg.every((d, v) => d === 0 || seen.has(v));
}

export function isOneStroke(fig) {
  const n = fig.pts.length, deg = degrees(n, fig.edges);
  return fig.edges.length > 0 && connected(n, fig.edges) && oddVertices(deg).length <= 2;
}

// Can every remaining edge still be drawn starting from vertex c? (c == null: not started yet)
export function solvable(fig, drawn, c) {
  const n = fig.pts.length, deg = degrees(n, fig.edges, drawn);
  if (deg.every(d => d === 0)) return true;
  if (c == null) return true;
  if (deg[c] === 0 || !connected(n, fig.edges, drawn, c)) return false;
  const odd = oddVertices(deg);
  return odd.length === 0 || (odd.length === 2 && odd.includes(c));
}

// Points the whole figure can be drawn from.
export function validStarts(fig) {
  const deg = degrees(fig.pts.length, fig.edges), odd = oddVertices(deg);
  return odd.length === 2 ? odd : deg.map((d, v) => (d > 0 ? v : -1)).filter(v => v >= 0);
}

export const otherEnd = (fig, e, v) => (fig.edges[e][0] === v ? fig.edges[e][1] : fig.edges[e][0]);
export const undrawnAt = (fig, drawn, v) =>
  fig.edges.map((_, i) => i).filter(i => !drawn[i] && (fig.edges[i][0] === v || fig.edges[i][1] === v));

// A line to draw next from vertex c that keeps the figure finishable (undefined if none).
export function nextEdge(fig, drawn, c) {
  return undrawnAt(fig, drawn, c).find(e => {
    const d2 = drawn.slice(); d2[e] = true;
    return solvable(fig, d2, otherEnd(fig, e, c));
  });
}

// How many lines to take back from the end of `history` ([{ e, from }]) before the figure is
// finishable again; history.length + 1 means even the starting point was wrong.
export function stepsBackToSolvable(fig, drawn, cur, history) {
  const d = drawn.slice();
  let c = cur;
  for (let k = 0; k <= history.length; k++) {
    if (solvable(fig, d, c)) return k;
    if (k === history.length) break;
    const h = history[history.length - 1 - k];
    d[h.e] = false; c = h.from;
  }
  return history.length + 1;
}

// A child who picks a random start, then at each point picks a random undrawn line, and restarts
// from a new random start when stuck. Returns the difficulty numbers used to order levels.
export function simulate(fig, attempts, rng, { withDelay = true } = {}) {
  const n = fig.pts.length, E = fig.edges, m = E.length;
  const deg = degrees(n, E), starts = deg.map((d, v) => (d > 0 ? v : -1)).filter(v => v >= 0);
  const good = new Set(validStarts(fig));
  const inc = Array.from({ length: n }, () => []);
  E.forEach(([a, b], i) => { inc[a].push(i); if (b !== a) inc[b].push(i); });

  function walk(start) {
    const drawn = new Array(m).fill(false), path = [];
    let cur = start;
    for (;;) {
      const opts = inc[cur].filter(i => !drawn[i]);
      if (!opts.length) break;
      const e = opts[Math.floor(rng() * opts.length)];
      drawn[e] = true; path.push({ e, from: cur });
      cur = E[e][0] === cur ? E[e][1] : E[e][0];
    }
    return path;
  }
  // lines drawn after the walk became impossible to finish (a wrong start counts from the start)
  function delayAfterMistake(start, path) {
    const drawn = new Array(m).fill(false);
    if (!solvable(fig, drawn, start)) return path.length;
    for (let k = 0; k < path.length; k++) {
      drawn[path[k].e] = true;
      if (!solvable(fig, drawn, otherEnd(fig, path[k].e, path[k].from))) return path.length - (k + 1);
    }
    return 0;
  }

  let ok = 0, okGood = 0, triesGood = 0, linesOk = 0, linesFail = 0, fails = 0, delay = 0;
  for (let t = 0; t < attempts; t++) {
    const s = starts[Math.floor(rng() * starts.length)];
    const path = walk(s), win = path.length === m;
    if (good.has(s)) { triesGood++; if (win) okGood++; }
    if (win) { ok++; linesOk += path.length; }
    else { fails++; linesFail += path.length; if (withDelay) delay += delayAfterMistake(s, path); }
  }
  const p = ok / attempts;
  // expected lines until the first success = lines of the winning try + failed tries before it
  const avgLines = p > 0 ? linesOk / ok + (fails ? linesFail / fails : 0) * (1 - p) / p : Infinity;
  return { pRandom: p, pGoodStart: triesGood ? okGood / triesGood : 0, avgLines, delay: fails ? delay / fails : 0 };
}

// Deterministic random numbers (mulberry32) so generated levels are the same on every run.
export function seededRandom(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
