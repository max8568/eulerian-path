// Keeps the game on the device so it plays without a network (SPEC.md §8).
// Every file is checked with the server first (unchanged files come back as "not modified"),
// so an update shows up as soon as the game is opened. With no network, or when the server
// takes longer than 3 seconds, the copy on the device is used.
const CACHE = 'yibihua';
const FILES = [
  './', 'index.html', 'style.css', 'app.js', 'game.js', 'follow.js', 'euler.js', 'store.js', 'sound.js', 'theme.js', 'icons.js',
  'version.js', 'levels.json', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
];
const WAIT = 3000;

self.addEventListener('install', event => {
  // 'reload': skip the browser's own short-term copies, which can be up to 10 minutes old on GitHub Pages
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const fresh = fetch(req, { cache: 'no-cache' }).then(res => { if (res.ok) cache.put(req, res.clone()); return res; });
    event.waitUntil(fresh.catch(() => {}));
    const cached = await cache.match(req, { ignoreSearch: true });
    if (!cached) return fresh;
    return Promise.race([fresh.catch(() => cached), new Promise(done => setTimeout(done, WAIT, cached))]);
  }));
});
