const CACHE_NAME = 'vegi-rise-v3';
const ASSETS = [
  'index.html',
  'css/style.css',
  'js/app.js',
  'js/db.js',
  'js/utils.js',
  'js/ui.js',
  'js/game-engine.js',
  'js/sound.js',
  'js/gamification.js',
  'js/achievements.js',
  'js/home.js',
  'js/history.js',
  'js/achieve-page.js',
  'js/settings.js',
  'js/icon-map.js',
  'manifest.json',
  // App icons
  'images/app/icon-192.png',
  'images/app/icon-512.png',
  // Navigation icons
  'images/nav/nav-home.png',
  'images/nav/nav-history.png',
  'images/nav/nav-achievements.png',
  'images/nav/nav-settings.png',
  // Section icons
  'images/section/sec-fire.png',
  'images/section/sec-broccoli.png',
  'images/section/sec-clock.png',
  'images/section/sec-chart.png',
  'images/section/sec-sunrise.png',
  'images/section/sec-sound.png',
  'images/section/sec-warning.png',
  // Badge icons
  'images/badge/badge-medal.png',
  'images/badge/badge-muscle.png',
  'images/badge/badge-crown.png',
  'images/badge/badge-confetti.png',
  'images/badge/badge-sparkle.png',
  'images/badge/badge-glowing-star.png',
  'images/badge/badge-dragon.png',
  'images/badge/badge-seedling.png',
  'images/badge/badge-leafy-green.png',
  'images/badge/badge-salad.png',
  'images/badge/badge-herb.png',
  'images/badge/badge-tree.png',
  'images/badge/badge-mountain.png',
  'images/badge/badge-fuji.png',
  'images/badge/badge-globe.png',
  'images/badge/badge-planet.png',
  'images/badge/badge-rocket.png',
  'images/badge/badge-star.png',
  'images/badge/badge-target.png',
  'images/badge/badge-green-heart.png',
  'images/badge/badge-sun.png',
  'images/badge/badge-sun-face.png',
  'images/badge/badge-dizzy.png',
  'images/badge/badge-memo.png',
  'images/badge/badge-clipboard.png',
  'images/badge/badge-book.png',
  'images/badge/badge-books.png',
  'images/badge/badge-file-cabinet.png',
  'images/badge/badge-gem.png',
  'images/badge/badge-crystal-ball.png',
  'images/badge/badge-diamond.png',
  'images/badge/badge-rainbow.png',
  'images/badge/badge-rooster.png',
  'images/badge/badge-party.png',
  'images/badge/badge-cake.png',
  'images/badge/badge-fireworks.png',
  'images/badge/badge-shooting-star.png',
  'images/badge/badge-military-medal.png',
  'images/badge/badge-card-index.png',
  'images/badge/badge-plate.png',
  'images/badge/badge-yoga.png',
  'images/badge/badge-hundred.png',
  'images/badge/badge-lock.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ナビゲーションリクエスト: network-first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 静的アセット: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          // 有効なレスポンスのみキャッシュ更新
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
