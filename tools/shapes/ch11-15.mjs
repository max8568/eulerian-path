// Shape levels for chapters 11–15 (levels 510 … 750). Drawn with kit.mjs; see its notes on keeping figures drawable.
import { build, circle, ring, zigzag, lerp, arcs, ends } from './kit.mjs';

const oval = (cx, cy, rx, ry, n, start = -90) => ring(0, 0, 1, n, start).map(([x, y]) => [cx + rx * x, cy + ry * y]);
// legs under a body line from a to b: one path that goes down to the ground and back up n times
const legs = (a, b, n, groundY) => {
  const out = [a];
  for (let k = 0; k < n; k++) {
    const f1 = lerp(a, b, (k + .25) / n), f2 = lerp(a, b, (k + .75) / n);
    out.push([f1[0], groundY], [f2[0], groundY], lerp(a, b, (k + 1) / n));
  }
  return out;
};

// ---- 11 運動
const soccer = (() => {
  const o = arcs(.5, .5, .42, -90, 270, 10), op = ends(o), p = ring(.5, .5, .28, 5);
  return build('足球', { curves: o, loops: [[0, 2, 4, 1, 3].map(i => p[i])], paths: p.map((q, i) => [op[(2 * i + 9) % 10], q, op[2 * i + 1]]) });
})();

const racket = (() => {
  const v = oval(.5, .36, .27, .32, 8);
  return build('網球拍', { loops: [v, [v[1], v[3], v[5], v[7]]], paths: [[v[0], v[4], [.5, .96]]] });
})();

const trophy = (() => {
  const TL = [.24, .1], TR = [.76, .1], BR = [.6, .5], BL = [.4, .5];
  const la = lerp(TL, BL, .26), lb = lerp(TL, BL, .72), ra = lerp(TR, BR, .26), rb = lerp(TR, BR, .72);
  return build('獎盃', {
    loops: [[TL, TR, BR, BL], [[.5, .72], [.76, .9], [.24, .9]]],
    paths: [[[.5, .5], [.5, .72]]],
    curves: [[la, lb, .9], [la, lb, .45], [rb, ra, .9], [rb, ra, .45]],
  });
})();

const shuttle = (() => {
  const L = [.32, .74], R = [.68, .74], r0 = [.14, .1], r1 = [.86, .1];
  return build('羽毛球', {
    paths: [[L, r0, r1, R], [L, R], [r0, [.44, .74], [.38, .1], [.56, .74], [.62, .1], R]],
    curves: [[R, L, -1]],
  });
})();

const goal = (() => {
  const TL = [.08, .2], TR = [.92, .2], BL = [.08, .86], BR = [.92, .86];
  return build('球門', { paths: [[BL, TL, TR, BR], zigzag(TL, TR, BL, BR, 4), zigzag(BL, BR, TL, TR, 4)] });
})();

// ---- 12 天氣
const sun = (() => {
  const c = arcs(.5, .5, .22, 0, 360, 6), p = ends(c), rays = ring(.5, .5, .44, 6, 30);
  return build('太陽', { curves: [...c, [p[3], p[0], .45]], paths: rays.map((t, i) => [p[i], t, p[i + 1]]) });
})();

const cloud = (L, R, top) => [[L, [L[0] + .18, top + .06], -.8], [[L[0] + .18, top + .06], [R[0] - .26, top], -.8], [[R[0] - .26, top], R, -.8]];

const rain = (() => {
  const L = [.1, .46], R = [.9, .46];
  return build('雨', { curves: cloud(L, R, .2), paths: [[L, R], zigzag(L, R, [.02, .86], [.82, .86], 10)] });
})();

const lightning = (() => {
  // flat-bottomed cloud: rain on the left and right, a bolt from a to b in the middle
  const L = [.08, .44], R = [.92, .44], a = [.44, .44], b = [.64, .44];
  return build('閃電', {
    curves: cloud(L, R, .16),
    paths: [[L, R], zigzag(L, a, [.02, .76], [.36, .76], 4), zigzag(b, R, [.72, .76], [.98, .76], 4),
      [a, [.36, .7], [.46, .7], [.38, .96], [.64, .62], [.54, .62], b]],
  });
})();

const snowflake = (() => {
  const tips = ring(.5, .5, .44, 6), a = ring(.5, .5, .2, 6, -105), b = ring(.5, .5, .2, 6, -75);
  return build('雪花', { loops: [...tips.map((t, i) => [[.5, .5], a[i], t, b[i]]), a.flatMap((p, i) => [p, b[i]]), tips] });
})();

const rainbow = (() => {
  // three half circles; the feet are joined by short lines, so only the middle band's feet are odd
  const band = r => arcs(.5, .78, r, 180, 360, 2), [o, m, i] = [.42, .32, .22].map(band);
  // a cloud hanging under each outer foot
  const cloudAt = (P, s) => { const [a, b, c] = [[.04, .9], [.18, .96], [.3, .9]].map(([x, y]) => [.5 + s * (x - .5), y]);
    return s > 0 ? [[P, a, .4], [a, b, .4], [b, c, .4], [c, P, -.2]] : [[a, P, .4], [b, a, .4], [c, b, .4], [P, c, -.2]]; };
  return build('彩虹', {
    curves: [...o, ...m, ...i, ...cloudAt([.08, .78], 1), ...cloudAt([.92, .78], -1)],
    paths: [[[.08, .78], [.18, .78], [.28, .78]], [[.72, .78], [.82, .78], [.92, .78]]],
  });
})();

// ---- 13 恐龍
const egg = (() => {
  const T = [.5, .1], R = [.82, .58], B = [.5, .92], L = [.18, .58];
  const z = zigzag(L, R, [.18, .46], [.82, .46], 6);
  const dia = (p, d) => [p, [p[0] - .05, p[1] + d * .1], [p[0], p[1] + d * .2], [p[0] + .05, p[1] + d * .1]];
  return build('恐龍蛋', {
    curves: [[T, R, -.55], [R, B, -.45], [B, L, -.45], [L, T, -.55]],
    paths: [z], loops: [dia(z[1], -1), dia(z[5], -1)],
  });
})();

const stego = (() => {
  // back: half an oval; plates: a zigzag just outside it
  const at = (t, s) => { const a = Math.PI * (1 + t / 4); return [.46 + .32 * s * Math.cos(a), .6 + .26 * s * Math.sin(a)]; };
  const B = Array.from({ length: 5 }, (_, k) => at(k, 1));
  const plates = B.flatMap((p, k) => (k < 4 ? [p, at(k + .5, 1.4)] : [p]));
  return build('劍龍', {
    paths: [B, plates, legs(B[0], B[4], 2, .9), [B[0], [.04, .8]]],
    loops: [[B[4], [.97, .6], [.92, .7]]],
  });
})();

const ptero = (() => {
  const C = [.5, .4], D = [.5, .66], tl = [.04, .3], tr = [.96, .3];
  return build('翼龍', {
    paths: [[C, tl, D], [C, tr, D], zigzag(C, tl, D, tl, 4), zigzag(C, tr, D, tr, 4)],
    loops: [[C, [.36, .14], [.62, .22]]],
  });
})();

const brachio = (() => {
  const chest = [.74, .64], rear = [.3, .7];
  return build('長頸龍', {
    loops: [[[.04, .76], [.32, .48], [.6, .44], [.7, .14], [.8, .06], [.94, .12], [.82, .2], [.76, .5], chest, rear]],
    paths: [legs(chest, rear, 2, .94)],
  });
})();

const trike = (() => {
  // wavy frill, face hanging from its lowest point, two horns, a mouth
  const frill = arcs(.5, .48, .4, -90, 270, 8).map(([a, b]) => [a, b, -.5]);
  const HL = [.38, .36], HR = [.62, .36];
  return build('三角龍', {
    curves: [...frill, [HL, [.32, .22], .3], [HL, [.32, .22], -.3], [HR, [.68, .22], .3], [HR, [.68, .22], -.3]],
    loops: [[HL, HR, [.68, .62], [.5, .88], [.32, .62]]],
    paths: [[[.32, .62], [.68, .62]]],
  });
})();

// ---- 14 農場
const barn = (() => {
  const d = [[.34, .92], [.34, .6], [.66, .6], [.66, .92]];
  return build('穀倉', {
    loops: [[[.12, .92], [.88, .92], [.88, .46], [.74, .24], [.5, .1], [.26, .24], [.12, .46]], [[.5, .1], [.42, .3], [.58, .3]]],
    paths: [d, [d[1], d[3]], [d[2], d[0]]],
  });
})();

const pig = (() => {
  const h = arcs(.5, .5, .32, -90, 270, 8), p = ends(h), s = circle(.5, .67, .15, 2);
  return build('豬', {
    curves: [...h, ...s],
    loops: [[p[7], [.2, .1], p[0]], [p[0], [.8, .1], p[1]]],
    paths: [[s[0][0], s[1][0]]],
  });
})();

const cow = (() => {
  const TL = [.3, .22], TR = [.7, .22], BR = [.66, .62], BL = [.34, .62];
  const lens = (a, b, k) => [[a, b, k], [a, b, -k]];
  return build('牛', {
    loops: [[TL, TR, BR, BL]],
    curves: [[BL, BR, 1], ...lens(TL, [.14, .06], .3), ...lens(TR, [.86, .06], .3),
      ...lens(lerp(TL, BL, .25), [.1, .4], .4), ...lens(lerp(TR, BR, .25), [.9, .4], .4)],
  });
})();

const tractor = (() => {
  const w = circle(.28, .66, .24), [T, R, B] = w.map(x => x[0]), f = circle(.8, .78, .12);
  return build('拖拉機', {
    curves: [...w, ...f],
    loops: [[R, [.94, .66], [.94, .42], [.52, .42]], [[.1, .42], [.52, .42], [.52, .1], [.16, .1]]],
    paths: [[T, B]],
  });
})();

const fence = (() => {
  const picket = x => [[x - .07, .92], [x - .07, .3], [x, .16], [x + .07, .3], [x + .07, .92]];
  return build('柵欄', { loops: [picket(.22), picket(.5), picket(.78), [[.04, .44], [.96, .44], [.96, .72], [.04, .72]]] });
})();

// ---- 15 衣服
const tshirt = (() => {
  const NL = [.38, .1], NR = [.62, .1], SL = [.16, .18], SR = [.84, .18], AL = [.26, .38], AR = [.74, .38];
  return build('T恤', {
    curves: [[NR, NL, -.6]],
    paths: [[NL, SL, [.04, .36], [.16, .46], AL, [.26, .92], [.74, .92], AR, [.84, .46], [.96, .36], SR, NR], [AL, SL], [AR, SR], zigzag(AL, AR, [.26, .52], [.74, .52], 6)],
  });
})();

const pants = (() => {
  const WL = [.2, .08], WR = [.8, .08], FL = [.1, .92], FR = [.9, .92];
  const bl = lerp(WL, FL, .12), br = lerp(WR, FR, .12);
  return build('褲子', {
    loops: [[WL, WR, FR, [.6, .92], [.5, .4], [.4, .92], FL]],
    paths: [[bl, br], zigzag(WL, WR, bl, br, 5)],
  });
})();

const dress = (() => {
  const wl = [.36, .4], wr = [.64, .4], hl = [.1, .92], hr = [.9, .92];
  return build('洋裝', {
    loops: [[[.34, .08], [.66, .08], wr, hr, hl, wl]],
    paths: [[wl, wr], zigzag(wl, wr, hl, hr, 6), [[.44, .08], [.5, .2], [.56, .08]]],
  });
})();

const beanie = (() => {
  const TL = [.14, .62], TR = [.86, .62], BL = [.14, .82], BR = [.86, .82], top = [.5, .3];
  return build('毛線帽', {
    curves: [[TL, top, -.4], [top, TR, -.4], ...circle(.5, .2, .1)],
    loops: [[TL, TR, BR, BL]],
    paths: [zigzag(TL, TR, BL, BR, 7)],
  });
})();

const mitten = (() => {
  const CL = [.2, .72], CR = [.78, .72], BL = [.2, .92], BR = [.78, .92];
  return build('手套', {
    curves: [[CL, [.5, .08], -.75], [[.5, .08], [.74, .34], -.3], [[.74, .34], [.94, .3], -.6], [[.94, .3], [.8, .56], -.3]],
    paths: [[[.8, .56], CR, BR, BL, CL, CR], zigzag(CL, CR, BL, BR, 5)],
  });
})();

export const CHAPTERS = [
  { theme: '運動', shapes: [soccer, racket, trophy, shuttle, goal] },
  { theme: '天氣', shapes: [sun, rain, lightning, snowflake, rainbow] },
  { theme: '恐龍', shapes: [egg, stego, ptero, brachio, trike] },
  { theme: '農場', shapes: [barn, pig, cow, tractor, fence] },
  { theme: '衣服', shapes: [tshirt, pants, dress, beanie, mitten] },
];
