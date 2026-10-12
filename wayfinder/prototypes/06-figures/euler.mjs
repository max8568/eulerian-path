// One-stroke logic shared by the generator (and later the game).
// A figure is { pts: [[x, y], ...], edges: [[a, b, bulge?], ...] }; `drawn` is a boolean per edge.

export function degrees(n, edges, drawn) {
  const deg = new Array(n).fill(0);
  edges.forEach(([a, b], i) => { if (!drawn || !drawn[i]) { deg[a]++; deg[b]++; } });
  return deg;
}

// Are all edges not yet drawn connected, reachable from `from` (or from any endpoint when from is null)?
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

export const oddVertices = deg => deg.map((d, v) => (d % 2 ? v : -1)).filter(v => v >= 0);

export function isOneStroke(fig) {
  const n = fig.pts.length, deg = degrees(n, fig.edges);
  return fig.edges.length > 0 && connected(n, fig.edges) && oddVertices(deg).length <= 2;
}

// Can every remaining edge still be drawn starting from vertex c?
export function solvable(n, edges, drawn, c) {
  const deg = degrees(n, edges, drawn);
  if (deg.every(d => d === 0)) return true;
  if (c == null) return true;
  if (deg[c] === 0 || !connected(n, edges, drawn, c)) return false;
  const odd = oddVertices(deg);
  return odd.length === 0 || (odd.length === 2 && odd.includes(c));
}

export function validStarts(fig) {
  const n = fig.pts.length, deg = degrees(n, fig.edges), odd = oddVertices(deg);
  return odd.length === 2 ? odd : deg.map((d, v) => (d > 0 ? v : -1)).filter(v => v >= 0);
}

// A child who picks a random start, then at each point picks a random undrawn line, and restarts
// from a new random start when stuck. Returns the numbers the difficulty research suggested.
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
  // lines drawn after the walk became impossible to finish (the start itself counts as a step)
  function delayAfterMistake(start, path) {
    const drawn = new Array(m).fill(false);
    if (!solvable(n, E, drawn, start)) return path.length;
    for (let k = 0; k < path.length; k++) {
      drawn[path[k].e] = true;
      const cur = E[path[k].e][0] === path[k].from ? E[path[k].e][1] : E[path[k].e][0];
      if (!solvable(n, E, drawn, cur)) return path.length - (k + 1);
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
  return {
    pRandom: p,
    pGoodStart: triesGood ? okGood / triesGood : 0,
    avgLines,
    delay: fails ? delay / fails : 0,
  };
}
