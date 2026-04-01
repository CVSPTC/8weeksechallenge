// 8-Weken Challenge — Service Worker
// Cache versie — verhoog dit bij updates
const CACHE = '8w-challenge-v1';

// Bestanden die offline beschikbaar moeten zijn
const PRECACHE = [
  '/',
  '/index.html'
];

// Installatie: precache de app shell
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(PRECACHE);
    })
  );
  self.skipWaiting();
});

// Activatie: verwijder oude caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache-first voor app shell, network-first voor de rest
self.addEventListener('fetch', function(event) {
  // Sla cross-origin requests over (bijv. Google Fonts)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;

      return fetch(event.request).then(function(response) {
        // Sla geldige responses op in cache
        if (response && response.status === 200 && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Offline fallback: stuur index.html terug
        return caches.match('/index.html');
      });
    })
  );
});
