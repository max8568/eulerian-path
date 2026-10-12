// Draw the app icon — a star you can draw in one stroke — and save it as PNG files.
// Run: node tools/make-icons.mjs   →  site/icons/icon-{180,192,512}.png
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const BG = [242, 120, 75], LINE = [255, 255, 255], DOT = [255, 212, 59], DOT_RING = [74, 59, 82];

const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = buf => { let c = 0xFFFFFFFF; for (const b of buf) c = CRC[(c ^ b) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, rgb) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) { raw[y * (size * 3 + 1)] = 0; rgb.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const segDist = (px, py, [ax, ay], [bx, by]) => {
  const vx = bx - ax, vy = by - ay, u = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(px - ax - u * vx, py - ay - u * vy);
};
// unit-square drawing: a pentagram (one stroke) with dots at its five points
const P = [0, 1, 2, 3, 4].map(k => { const a = (-90 + 72 * k) * Math.PI / 180; return [0.5 + 0.33 * Math.cos(a), 0.53 + 0.33 * Math.sin(a)]; });
const LINES = [0, 1, 2, 3, 4].map(k => [P[k], P[(k + 2) % 5]]);
function colourAt(x, y) {
  for (const p of P) {
    const d = Math.hypot(x - p[0], y - p[1]);
    if (d < 0.045) return DOT;
    if (d < 0.062) return DOT_RING;
  }
  if (LINES.some(([a, b]) => segDist(x, y, a, b) < 0.03)) return LINE;
  return BG;
}

mkdirSync(new URL('../site/icons/', import.meta.url), { recursive: true });
for (const size of [180, 192, 512]) {
  const rgb = Buffer.alloc(size * size * 3), S = 3; // 3×3 samples per pixel for smooth edges
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const acc = [0, 0, 0];
    for (let i = 0; i < S; i++) for (let j = 0; j < S; j++) {
      const c = colourAt((x + (i + 0.5) / S) / size, (y + (j + 0.5) / S) / size);
      acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2];
    }
    for (let k = 0; k < 3; k++) rgb[(y * size + x) * 3 + k] = Math.round(acc[k] / (S * S));
  }
  writeFileSync(new URL(`../site/icons/icon-${size}.png`, import.meta.url), png(size, rgb));
}
console.log('wrote site/icons/icon-180.png, icon-192.png, icon-512.png');
