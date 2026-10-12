// Shape levels for chapters 16–20 (levels 760 … 1000). Drawn with kit.mjs; see its notes on keeping figures drawable.
import { build, circle, zigzag, lerp, arcs, ends } from './kit.mjs';

// two curves between the same two points: a closed shape that hangs from a, or a thick handle
const lens = (a, b, k1, k2 = -k1) => [[a, b, k1], [a, b, k2]];
// a ring of points at two radii joined into one zigzag loop (a crown, a star of petals …)
const star = (cx, cy, r1, r2, n, start = -90) => Array.from({ length: 2 * n }, (_, i) => {
  const a = (start + i * 180 / n) * Math.PI / 180, r = i % 2 ? r2 : r1;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});

// ---- 16 廚房
const pan = (() => {
  const o = arcs(.4, .5, .34, 0, 360, 6), p = ends(o), i = arcs(.4, .5, .2, 30, 390, 6), q = ends(i);
  return build('平底鍋', { curves: [...o, ...i], loops: [p.slice(0, 6).flatMap((x, k) => [x, q[k]])], paths: [[p[0], [.96, .5]]] });
})();

const teapot = (() => {
  const b = arcs(.5, .62, .28, -90, 270, 8), p = ends(b), tip = [.06, .36];
  return build('茶壺', {
    curves: [...b, ...circle(.5, .24, .1), ...lens(p[6], tip, .25), [p[1], p[3], .8], [p[1], p[3], .4]],
    paths: [[tip, [.12, .24], [.06, .12]]],
  });
})();

const pot = (() => {
  const TL = [.16, .4], TR = [.84, .4], BR = [.8, .9], BL = [.2, .9], top = [.5, .24];
  return build('鍋子', {
    loops: [[TL, TR, BR, BL]],
    curves: [[TL, top, -.25], [top, TR, -.25], ...lens(top, [.5, .12], .5),
      ...lens(lerp(TL, BL, .2), lerp(TL, BL, .5), .9, .4), ...lens(lerp(TR, BR, .5), lerp(TR, BR, .2), .9, .4)],
  });
})();

const fridge = (() => {
  const TL = [.22, .04], TR = [.78, .04], BR = [.78, .86], BL = [.22, .86], ml = [.22, .36], mr = [.78, .36], h = [.34, .36];
  return build('冰箱', {
    loops: [[TL, TR, BR, BL]],
    paths: [[ml, mr]],
    curves: [...lens(h, [.34, .2], .3), ...lens(h, [.34, .56], .3), ...lens([.34, .86], [.34, .97], .5), ...lens([.66, .86], [.66, .97], .5)],
  });
})();

const toaster = (() => {
  const a = [.3, .4], b = [.49, .4], c = [.68, .4];
  return build('烤麵包機', {
    loops: [[[.1, .9], [.88, .9], [.88, .5], [.78, .4], [.2, .4], [.1, .5]]],
    paths: [[a, [.3, .18]], [[.44, .18], b, [.54, .18]], [[.68, .18], c]],
    curves: [[[.3, .18], [.44, .18], -.5], [[.54, .18], [.68, .18], -.5], ...lens([.88, .64], [.98, .64], .5), ...lens([.3, .9], [.3, .76], .5)],
  });
})();

// ---- 17 節日
const tree = build('聖誕樹', {
  loops: [[[.5, .18], [.68, .4], [.58, .4], [.78, .62], [.66, .62], [.88, .86], [.12, .86], [.34, .62], [.22, .62], [.42, .4], [.32, .4]],
    [[.5, .18], [.44, .09], [.5, 0], [.56, .09]]],
  curves: lens([.66, .62], [.66, .74], .6),
  paths: [[[.44, .86], [.44, .97], [.56, .97], [.56, .86]]],
});

const candy2 = (() => {
  const c = circle(.5, .5, .2), [T, R, B, L] = c.map(x => x[0]);
  return build('糖果', {
    curves: [...c, [T, B, .5], [T, B, -.5]],
    paths: [[T, B]],
    loops: [[L, [.08, .26], [.14, .38], [.04, .5], [.14, .62], [.08, .74]], [R, [.92, .26], [.86, .38], [.96, .5], [.86, .62], [.92, .74]]],
  });
})();

const lantern = (() => {
  const tl = [.38, .24], tr = [.62, .24], bl = [.38, .78], br = [.62, .78];
  return build('燈籠', {
    loops: [[[.38, .14], [.62, .14], tr, tl], [bl, br, [.62, .88], [.38, .88]]],
    curves: [[tl, bl, .9], [tl, bl, .35], [br, tr, .9], [br, tr, .35], ...lens([.5, .14], [.5, .03], .5)],
    paths: [zigzag([.38, .88], [.62, .88], [.38, .98], [.62, .98], 4)],
  });
})();

const heart = (() => {
  const C = [.5, .3], L = [.14, .38], R = [.86, .38], tip = [.5, .9], S = [.02, .8], E = [.98, .62];
  return build('愛心', {
    curves: [[L, C, -.9], [C, R, -.9]],
    paths: [[L, tip, R], [S, E]],
    loops: [[E, [.86, .54], [.86, .74]], [S, [.14, .68], [.14, .88]]],
  });
})();

const partyHat = (() => {
  const A = [.5, .16], BL = [.2, .86], BR = [.8, .86];
  return build('生日帽', {
    paths: [[BL, A, BR], zigzag(A, BL, A, BR, 6)],
    curves: [...circle(.5, .08, .08), [BR, [.6, .86], .4], [[.6, .86], [.4, .86], .4], [[.4, .86], BL, .4]],
  });
})();

// ---- 18 太空
const astronaut = (() => {
  const h = arcs(.5, .44, .34, -90, 270, 8), p = ends(h);
  return build('太空人', {
    curves: [...h, [p[6], p[2], -.5], [p[6], p[2], .45], ...lens(p[6], [.06, .44], .6), ...lens(p[2], [.94, .44], .6)],
    paths: [[[.08, .98], p[5], p[3], [.92, .98]]],
  });
})();

const saturn = (() => {
  const L = [.24, .5], R = [.76, .5], moon = circle(.84, .14, .07);
  return build('土星', {
    curves: [...circle(.5, .5, .26), ...lens(L, [.04, .6], .35), ...lens(R, [.96, .4], .35), [L, R, .3], [L, R, -.25], [L, R, .6], [L, R, -.55], ...moon],
    paths: [[[.5, .24], moon[3][0]]],
  });
})();

const ufo = (() => {
  const SL = [.06, .5], SR = [.94, .5], DL = [.3, .5], DR = [.7, .5];
  const low = [SL, [.28, .66], [.5, .7], [.72, .66], SR];
  return build('飛碟', {
    paths: [[SL, SR]],
    curves: [[DL, DR, -1], ...circle(.5, .43, .07),
      ...low.slice(1).map((q, k) => [low[k], q, .2]), ...[1, 2, 3].flatMap(k => lens(low[k], [low[k][0], low[k][1] + .12], .6))],
  });
})();

const satellite = (() => {
  const panel = (x0, x1) => [[x0, .44], [x1, .44], [x1, .6], [x0, .6]];
  return build('衛星', {
    loops: [[[.38, .3], [.62, .3], [.62, .66], [.38, .66]], panel(.02, .28), panel(.72, .98)],
    paths: [[[.28, .44], [.72, .44]], zigzag([.02, .44], [.28, .44], [.02, .6], [.28, .6], 2), zigzag([.72, .44], [.98, .44], [.72, .6], [.98, .6], 2)],
    curves: lens([.5, .3], [.5, .14], .6),
  });
})();

const alien = (() => {
  const T = [.5, .22], R = [.84, .42], B = [.5, .9], L = [.16, .42];
  return build('外星人', {
    curves: [[T, R, -.45], [R, B, -.3], [B, L, -.3], [L, T, -.45], ...lens(L, [.42, .52], .35), ...lens(R, [.58, .52], .35), ...lens(T, [.5, .38], .5), ...lens(B, [.5, .76], .4)],
    paths: [[[.3, .04], T, [.7, .04]]],
  });
})();

// ---- 19 遊樂園
const ferris = (() => {
  const r = arcs(.5, .42, .36, -90, 270, 8), p = ends(r), C = [.5, .42];
  return build('摩天輪', {
    curves: [...r, ...[0, 2, 4, 6].flatMap(k => lens(C, p[k], .12)), ...[1, 7].flatMap(k => lens(p[k], lerp(C, p[k], 1.3), .5))],
    paths: [[[.22, .97], p[4], [.78, .97]]],
  });
})();

const coaster = (() => {
  const P = [[.04, .7], [.22, .2], [.4, .6], [.58, .3], [.76, .62], [.96, .4]];
  const sup = [P[0]];
  P.slice(1).forEach((q, k) => sup.push([(P[k][0] + q[0]) / 2, .92], q));
  const cart = ([x, y]) => [[x, y], [x - .06, y - .1], [x + .06, y - .1]];
  return build('雲霄飛車', {
    curves: P.slice(1).map((q, k) => [P[k], q, k % 2 ? .15 : -.15]),
    paths: [sup, [[.02, .92], [.98, .92]]],
    loops: [cart(P[1]), cart(P[3])],
  });
})();

const balloon = (() => {
  const T = [.5, .06], L = [.14, .36], R = [.86, .36], NL = [.4, .68], NR = [.6, .68], BTL = [.36, .8], BTR = [.64, .8];
  return build('熱氣球', {
    curves: [[T, R, -.4], [R, NR, -.3], [NL, L, -.3], [L, T, -.4], [T, NL, .2], [T, NR, -.2], [T, NL, -.08], [T, NR, .08], [T, NL, .45], [T, NR, -.45]],
    loops: [[BTL, BTR, [.64, .94], [.36, .94]]],
    paths: [[NL, NR], [NL, BTL], [NR, BTR], zigzag(BTL, BTR, [.36, .94], [.64, .94], 3)],
  });
})();

const carousel = (() => {
  const apex = [.5, .12], RL = [.14, .3], RR = [.86, .3], c = [RL, [.32, .3], [.5, .3], [.68, .3], RR];
  return build('旋轉木馬', {
    loops: [[apex, RR, RL], [[.02, .84], [.98, .84], [.98, .94], [.02, .94]]],
    curves: [...c.slice(1).map((q, k) => [c[k], q, .4]), ...lens(apex, [.6, .04], .4)],
    paths: [[RL, [.14, .84]], [RR, [.86, .84]]],
  });
})();

const candy = (() => {
  const r = arcs(.5, .36, .28, -90, 270, 10).map(([a, b]) => [a, b, -.6]), p = ends(r);
  const q = arcs(.5, .36, .13, -54, 306, 5), inner = ends(q);
  return build('棉花糖', {
    curves: [...r, ...q],
    loops: [[0, 1, 2, 3, 4].flatMap(k => [p[2 * k + 1], inner[k]])],
    paths: [[p[5], [.5, .97]]],
  });
})();

// ---- 20 綜合
const crown = (() => {
  const TL = [.1, .62], TR = [.9, .62], BL = [.1, .82], BR = [.9, .82], tips = [[.1, .22], [.5, .16], [.9, .22]];
  return build('皇冠', {
    loops: [[TL, TR, BR, BL]],
    paths: [[TL, tips[0], [.3, .44], tips[1], [.7, .44], tips[2], TR], zigzag(TL, TR, BL, BR, 5)],
    curves: circle(.5, .1, .06, 2),
  });
})();

const robot = build('機器人', {
  loops: [[[.3, .06], [.7, .06], [.7, .28], [.3, .28]], [[.2, .4], [.8, .4], [.8, .74], [.2, .74]],
    [[.2, .5], [.04, .62], [.1, .7]], [[.8, .5], [.96, .62], [.9, .7]],
    [[.5, .74], [.32, .95], [.44, .95], [.5, .84], [.56, .95], [.68, .95]]],
  paths: [[[.5, .28], [.5, .4]]],
});

const train = (() => {
  // the wheels stand on the rail, which holds the engine and the carriage together
  const wheel = x => circle(x, .81, .07, 2);
  return build('火車', {
    loops: [[[.04, .26], [.22, .26], [.22, .46], [.32, .46], [.32, .3], [.42, .3], [.42, .46], [.54, .46], [.54, .74], [.04, .74]],
      [[.64, .42], [.98, .42], [.98, .74], [.64, .74]]],
    curves: [.16, .42, .74, .88].flatMap(wheel),
    paths: [[[.02, .88], [.98, .88]]],
  });
})();

const bear = (() => {
  const f = arcs(.5, .52, .34, -90, 270, 8), p = ends(f), m = circle(.5, .72, .14), [mT, , mB] = m.map(x => x[0]), nose = [.5, .68];
  return build('小熊', {
    curves: [...f, ...lens(p[7], [.12, .14], 1), ...lens(p[1], [.88, .14], 1), ...m, ...lens(mT, nose, .5)],
    paths: [[nose, mB]],
  });
})();

const flower = (() => {
  const c = arcs(.5, .3, .1, -90, 270, 6), p = ends(c), pts = star(.5, .3, .1, .26, 6);
  return build('花盆', {
    curves: [...c, ...lens([.5, .62], [.7, .6], .5)],
    loops: [pts, [[.26, .74], [.74, .74], [.66, .96], [.34, .96]]],
    paths: [[p[3], [.5, .62], [.5, .74]]],
  });
})();

export const CHAPTERS = [
  { theme: '廚房', shapes: [pan, teapot, pot, fridge, toaster] },
  { theme: '節日', shapes: [tree, candy2, lantern, heart, partyHat] },
  { theme: '太空', shapes: [astronaut, saturn, ufo, satellite, alien] },
  { theme: '遊樂園', shapes: [ferris, coaster, balloon, carousel, candy] },
  { theme: '綜合', shapes: [crown, robot, train, bear, flower] },
];
