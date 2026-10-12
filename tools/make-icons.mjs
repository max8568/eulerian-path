// Draw the app icon — a pencil drawing a fish on a tilted paper card — and the link preview image.
// Chrome turns the drawings into PNG files, so it has to be installed (or set CHROME to its path).
// Run: node tools/make-icons.mjs  →  site/icons/icon-{180,192,512}.png, icon-maskable-512.png, site/og.png
import { writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const INK = '#4A3B52', TODO = '#E7D9EA', ORANGE = '#E8662F';

const line = ([a, b], [c, d], col, w) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
const dot = ([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="#fff" stroke="${INK}" stroke-width="6"/>`;

// the fish from chapter 2, four of its seven lines already drawn, the pencil on the next dot
const FISH = [[.88, .5], [.6, .28], [.38, .5], [.6, .72], [.1, .28], [.1, .72]].map(([x, y]) => [x * 280, y * 280]);
const ROUTE = [2, 4, 5, 2, 1, 0, 3, 2], DONE = 4;
const TIP = FISH[ROUTE[DONE]];
const fishLines = ROUTE.slice(1).map((p, i) => line(FISH[ROUTE[i]], FISH[p], i < DONE ? ORANGE : TODO, 18)).join('');
// 340×300 card centred on (0, 0)
const CARD = `
  <g transform="rotate(-8) translate(-170 -150)" filter="url(#shadow)">
    <rect width="340" height="300" rx="28" fill="#fff"/>
    <g transform="translate(30 10)">${fishLines}${FISH.map(dot).join('')}
      <g transform="translate(${TIP[0]} ${TIP[1]}) rotate(-40)">
        <polygon points="0,0 -16,-40 16,-40" fill="#F6C7A1"/><polygon points="0,0 -6,-15 6,-15" fill="${INK}"/>
        <rect x="-16" y="-170" width="32" height="130" fill="#4DABF7"/><rect x="-16" y="-190" width="32" height="22" rx="6" fill="#FF8FA3"/>
      </g>
    </g>
  </g>`;
const DEFS = `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD43B"/><stop offset="1" stop-color="#FF922B"/></linearGradient>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#B0570E" flood-opacity=".35"/></filter>
</defs>`;

// scale: Android cuts maskable icons to a circle, so the card is shrunk to stay inside it
const icon = (size, scale = 1) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">${DEFS}
  <rect width="512" height="512" fill="url(#bg)"/><g transform="translate(256 262) scale(${scale})">${CARD}</g></svg>`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">${DEFS}
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g transform="translate(300 325) scale(1.15)">${CARD}</g>
  <text x="580" y="300" font-family="Segoe UI, Arial Rounded MT Bold, sans-serif" font-weight="700" font-size="76" fill="${INK}">eulerian-path</text>
  <text x="584" y="370" font-family="Microsoft JhengHei, PingFang TC, Noto Sans TC, sans-serif" font-weight="700" font-size="34" fill="${INK}" opacity=".8">給小朋友玩的畫線遊戲，共 1000 關</text>
</svg>`;

const chrome = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find(p => p && existsSync(p));
if (!chrome) throw new Error('Chrome not found; set CHROME to its path');

const tmp = mkdtempSync(join(tmpdir(), 'icons-'));
function render(svg, w, h, out) {
  const page = join(tmp, 'page.html');
  writeFileSync(page, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;overflow:hidden}svg{display:block}</style>${svg}`);
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${w},${h}`,
    `--screenshot=${fileURLToPath(new URL(out, import.meta.url))}`, pathToFileURL(page).href], { stdio: 'ignore' });
}
for (const size of [180, 192, 512]) render(icon(size), size, size, `../site/icons/icon-${size}.png`);
render(icon(512, 0.78), 512, 512, '../site/icons/icon-maskable-512.png');
render(og, 1200, 630, '../site/og.png');
rmSync(tmp, { recursive: true });
console.log('wrote site/icons/icon-180.png, icon-192.png, icon-512.png, icon-maskable-512.png, site/og.png');
