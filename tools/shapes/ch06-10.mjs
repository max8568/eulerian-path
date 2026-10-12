// Shape levels for chapters 6–10 (levels 260 … 500). Drawn with kit.mjs; see its notes on keeping figures drawable.
import { build, circle, ring, zigzag, lerp } from './kit.mjs';

// ---- 6 海洋
const whale = build('鯨魚', {
  paths: [[[.24, .55], [.06, .34], [.08, .74], [.24, .55]], [[.6, .28], [.5, .1], [.7, .1], [.6, .28]], [[.9, .58], [.72, .62]]],
  curves: [[[.24, .55], [.6, .28], -.25], [[.6, .28], [.9, .58], -.3], [[.9, .58], [.24, .55], -.38]],
});

const starfish = (() => {
  const o = ring(.5, .53, .43, 10).map((p, i) => (i % 2 ? lerp([.5, .53], p, .45) : p));
  return build('海星', { loops: [o, o.filter((_, i) => i % 2)] });
})();

const crab = (() => {
  const c = circle(.5, .58, .2), [T, R, B, L] = c.map(x => x[0]);
  return build('螃蟹', {
    curves: c,
    paths: [[L, [.12, .74], B, [.88, .74], R], [T, [.28, .14], [.42, .12], T], [T, [.58, .12], [.72, .14], T]],
  });
})();

const jellyfish = (() => {
  const L = [.15, .45], R = [.85, .45], A = [0, 1, 2, 3].map(i => lerp(L, R, i / 3));
  const zig = [A[0]];
  for (let i = 0; i < 3; i++) zig.push([(A[i][0] + A[i + 1][0]) / 2, i % 2 ? .78 : .9], A[i + 1]);
  return build('水母', { paths: [[L, R], zig], curves: [[L, R, -.62]] });
})();

const octopus = (() => {
  const L = [.18, .5], R = [.82, .5], A = [0, 1, 2, 3].map(i => lerp(L, R, i / 3));
  const curves = [[L, R, -.75]];
  for (let i = 0; i < 3; i++) { const tip = [(A[i][0] + A[i + 1][0]) / 2, .9]; curves.push([A[i], tip, .15], [tip, A[i + 1], .15]); }
  return build('章魚', { paths: [[L, R]], curves });
})();

// ---- 7 食物
const apple = (() => {
  const c = circle(.5, .58, .3), [T, R, , L] = c.map(x => x[0]), S = [.5, .12];
  return build('蘋果', {
    curves: [...c, [S, [.74, .1], .5], [S, [.74, .1], -.5]],
    paths: [[T, S]],
    loops: [[L, [.5, .46], R, [.5, .7]]],
  });
})();

const watermelon = (() => {
  const L = [.08, .32], R = [.92, .32], inL = [.18, .32], inR = [.82, .32];
  const seeds = zigzag([.36, .37], [.64, .37], [.36, .44], [.64, .44], 4);
  return build('西瓜', { paths: [[L, inL], [inR, R], [inL, ...seeds, inR]], curves: [[L, R, .62], [inL, inR, .55]] });
})();

const icecream = (() => {
  const L = [.26, .48], R = [.74, .48], tip = [.5, .94], T = [.5, .22];
  const zig1 = zigzag(L, tip, R, tip, 3);
  return build('冰淇淋', {
    paths: [[L, R], [L, tip, R], zig1],
    curves: [[L, T, -.35], [T, R, -.35], [T, [.5, .08], .6], [T, [.5, .08], -.6]],
  });
})();

const cake = build('蛋糕', {
  loops: [[[.1, .9], [.9, .9], [.9, .5], [.1, .5]]],
  paths: [[[.3, .5], [.3, .28], [.45, .28], [.45, .16], [.5, .06], [.55, .16], [.55, .28], [.7, .28], [.7, .5]]],
});

const burger = build('漢堡', {
  paths: [[[.1, .45], [.1, .82]], [[.9, .45], [.9, .82]], zigzag([.1, .55], [.9, .55], [.1, .66], [.9, .66], 7)],
  curves: [[[.1, .45], [.9, .45], -.5], [[.1, .82], [.9, .82], .2]],
});

// ---- 8 昆蟲
const dragonfly = (() => {
  const head = [.5, .14], neck = [.5, .26], mid = [.5, .42], tail = [.5, .94];
  return build('蜻蜓', {
    paths: [[neck, mid, [.5, .6], [.5, .77], tail]],
    loops: [[neck, [.14, .2], [.08, .3], mid], [neck, [.86, .2], [.92, .3], mid], [mid, [.12, .48], [.18, .58], mid], [mid, [.88, .48], [.82, .58], mid]],
    curves: [[head, neck, .9], [neck, head, .9]],
  });
})();

const ladybug = (() => {
  const c = circle(.5, .55, .32), [T, , B] = c.map(x => x[0]), s1 = [.5, .45];
  return build('瓢蟲', {
    curves: [...c, [T, [.5, .1], .8], [T, [.5, .1], -.8]],
    paths: [[T, B]],
    loops: [[s1, [.36, .38], [.38, .52]], [s1, [.64, .38], [.62, .52]]],
  });
})();

const bee = (() => {
  const hex = [[.24, .42], [.76, .42], [.86, .55], [.76, .68], [.24, .68], [.14, .55]];
  return build('蜜蜂', {
    loops: [hex],
    paths: [zigzag([.38, .42], [.62, .42], [.38, .68], [.62, .68], 2)],
    curves: [[[.38, .42], [.24, .14], .5], [[.24, .14], [.38, .42], .5], [[.62, .42], [.76, .14], -.5], [[.76, .14], [.62, .42], -.5]],
  });
})();

const caterpillar = (() => {
  const cs = [0, 1, 2, 3].map(i => circle(.22 + i * .18, .6, .09));
  return build('毛毛蟲', { curves: cs.flat(), loops: [[cs[3][0][0], [.68, .38], [.82, .38]]] });
})();

const ant = (() => {
  const h = circle(.2, .5, .1), t = circle(.42, .5, .12), a = circle(.7, .5, .16);
  return build('螞蟻', {
    curves: [...h, ...t, ...a],
    loops: [[h[0][0], [.1, .22], [.24, .2]]],
  });
})();

// ---- 9 建築
const tent = build('帳篷', {
  loops: [[[.06, .88], [.94, .88], [.5, .14]]],
  paths: [[[.36, .88], [.5, .5], [.64, .88]]],
  curves: [[[.5, .14], [.68, .1], .5], [[.5, .14], [.68, .1], -.5]],
});

const lighthouse = build('燈塔', {
  loops: [[[.3, .92], [.38, .42], [.62, .42], [.7, .92]]],
  paths: [[[.62, .42], [.6, .26], [.5, .1], [.4, .26], [.38, .42], ...zigzag([.38, .42], [.3, .92], [.62, .42], [.7, .92], 4).slice(1)]],
});

const castle = (() => {
  const top = [[.1, .3], [.1, .16], [.26, .16], [.26, .3], [.42, .3], [.42, .16], [.58, .16], [.58, .3], [.74, .3], [.74, .16], [.9, .16], [.9, .3]];
  return build('城堡', {
    loops: [[...top, [.9, .92], [.1, .92]]],
    paths: [[[.4, .92], [.4, .66], [.5, .56], [.6, .66], [.6, .92]]],
  });
})();

const windmill = (() => {
  const H = [.5, .3];
  return build('風車', {
    loops: [[[.36, .94], [.64, .94], [.6, .48], [.4, .48]], [H, [.18, .12], [.26, .04]], [H, [.88, .42], [.8, .5]], [H, [.74, .04], [.82, .12]], [H, [.2, .5], [.12, .42]]],
    paths: [[H, [.5, .48]]],
  });
})();

const bridge = (() => {
  const TL = [.12, .38], TR = [.88, .38], BL = [.12, .62], BR = [.88, .62];
  return build('橋', {
    loops: [[TL, TR, BR, BL]],
    paths: [zigzag(BL, BR, TL, TR, 6)],
  });
})();

// ---- 10 樂器
const drum = (() => {
  const TL = [.14, .35], TR = [.86, .35], BL = [.14, .82], BR = [.86, .82];
  return build('鼓', { loops: [[TL, TR, BR, BL]], paths: [zigzag(TL, TR, BL, BR, 6)] });
})();

const guitar = (() => {
  const low = circle(.5, .72, .2), up = circle(.5, .39, .13);
  return build('吉他', {
    curves: [...low, ...up],
    paths: [[[.5, .26], [.5, .1]], [[.5, .26], [.5, .92]]],
    loops: [[[.5, .1], [.42, .03], [.58, .03]]],
  });
})();

const trumpet = build('喇叭', {
  loops: [[[.08, .44], [.6, .44], [.6, .56], [.08, .56]]],
  curves: [[[.6, .44], [.92, .22], .15], [[.6, .56], [.92, .78], -.15], [[.92, .22], [.92, .78], -.2],
    [[.3, .44], [.3, .28], .7], [[.3, .44], [.3, .28], -.7], [[.44, .44], [.44, .28], .7], [[.44, .44], [.44, .28], -.7]],
});

const tambourine = (() => {
  const o = ring(.5, .5, .38, 8), inner = ring(.5, .5, .24, 8);
  return build('鈴鼓', { loops: [inner, o], paths: [[o[0], inner[0], inner[4], o[4]]] });
})();

const maracas = (() => {
  const a = circle(.26, .3, .16), b = circle(.74, .3, .16), E = [.5, .92];
  return build('沙鈴', { curves: [...a, ...b], paths: [[a[2][0], E, b[2][0]]] });
})();

export const CHAPTERS = [
  { theme: '海洋', shapes: [whale, starfish, crab, jellyfish, octopus] },
  { theme: '食物', shapes: [apple, watermelon, icecream, cake, burger] },
  { theme: '昆蟲', shapes: [dragonfly, ladybug, bee, caterpillar, ant] },
  { theme: '建築', shapes: [tent, lighthouse, castle, windmill, bridge] },
  { theme: '樂器', shapes: [drum, guitar, trumpet, tambourine, maracas] },
];
