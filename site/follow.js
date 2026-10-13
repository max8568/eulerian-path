// Which line the finger is drawing (SPEC.md §2), worked out over the whole drag rather than one moment.
// Each finger move gives, for every line that may be drawn next, { e, t, d }: how far along the line the spot
// nearest the finger is (0–1) and how far the finger is from the line (px).
// The finger is drawing the line it has stayed closest to since the drag left the point. Going by the nearest
// line at one moment, or by the line furthest along, picks wrong lines when two lines leave the same point
// (especially when one is curved): another line can be further along, or the finger can wobble closer to it.
export function follower(tol, jump = 0.35) {
  let prog, away, last;
  const reset = () => { prog = new Map(); away = new Map(); last = null; };
  reset();
  return {
    reset,
    // returns the line being drawn, or null while the finger is off every line
    move(hits) {
      let best = null;
      for (const { e, t, d } of hits) {
        away.set(e, (away.get(e) || 0) + Math.min(d, 2 * tol));
        if (d > tol) continue; // off the line: keep what is drawn so far and wait for the finger to come back
        const was = prog.get(e) || 0;
        if (t <= was + jump) prog.set(e, Math.max(was, t)); // no jumping far ahead
        if (best == null || away.get(e) < away.get(best)) best = e;
      }
      if (best != null) last = best;
      return best;
    },
    progress: e => prog.get(e) || 0,
    // the line last being drawn; it stays on screen while the finger strays off it
    get last() { return last; },
  };
}
