const CACHE_PREFIX = 'bubble-hill:' + self.registration.scope + ':';
const CACHE_NAME = CACHE_PREFIX + '7daad7c436a17c59bcf3';
const FILES = ["assets/audio/breath.wav","assets/audio/dusk.wav","assets/audio/meadow.wav","assets/audio/pop.wav","assets/audio/pour.wav","assets/audio/stir.wav","assets/icons/apple-touch-icon.png","assets/icons/icon-192.png","assets/icons/icon-512.png","assets/icons/maskable-512.png","assets/scene-bg.jpg","assets/title/far.svg","assets/title/middle.svg","assets/title/near.svg","index.html","manifest.webmanifest","src/art/placeholder.js","src/audio/player.js","src/bubbles/film.js","src/bubbles/hoop-renderer.js","src/bubbles/hoop-system.js","src/bubbles/renderer.js","src/bubbles/single.js","src/bubbles/system.js","src/config.js","src/core/loop.js","src/core/state.js","src/core/viewport.js","src/data/characters.js","src/data/shapes.js","src/data/soap-colors.js","src/input/movement.js","src/input/pointers.js","src/main.js","src/pwa.js","src/scenes/character-select.js","src/scenes/hill.js","src/scenes/shape-select.js","src/scenes/soap-making.js","src/scenes/title.js","src/soap/model.js","src/soap/renderer.js","src/world/camera.js","src/world/hill-world.js","src/world/math.js","src/world/renderer.js","styles/app.css"];

// Only an explicit client button may activate a waiting version early.
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
});

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // A failed download rejects installation. The previous complete version stays active.
    await cache.addAll(FILES.map(file => new Request(new URL(file, self.registration.scope), {cache: 'reload'})));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Navigation always starts the complete, cached title screen, including launch query strings.
    const key = request.mode === 'navigate' ? new URL('index.html', self.registration.scope).href : request;
    const saved = await cache.match(key);
    return saved || fetch(request);
  })());
});
