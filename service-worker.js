self.addEventListener('install', function(event) {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open('index').then(function(cache) {
      return cache.addAll(
        [
          './assets',
        ]
      );
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[ServiceWorker] Activate');
});

self.addEventListener('fetch', function(event) {});

