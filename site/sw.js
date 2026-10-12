// Keeps the game on the device so it plays without a network (SPEC.md §8).
// Files are served from the device straight away and refreshed in the background,
// so an update shows up the next time the game is opened.
const CACHE = 'yibihua';
const FILES = [
  './', 'index.html', 'style.css', 'app.js', 'game.js', 'euler.js', 'store.js', 'sound.js', 'theme.js', 'icons.js',
  'levels.json', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(req, { ignoreSearch: true });
    const fresh = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; });
    if (cached) { event.waitUntil(fresh.catch(() => {})); return cached; }
    return fresh;
  }));
});
