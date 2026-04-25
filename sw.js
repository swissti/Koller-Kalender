// This service worker unregisters itself to prevent caching issues
self.addEventListener('install', function() {
  self.skipWaiting();
});
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.clients.claim();
    }).then(function() {
      // Tell all clients to reload
      return self.clients.matchAll().then(function(clients) {
        clients.forEach(function(client) { client.navigate(client.url); });
      });
    })
  );
});
// Pass all requests through without caching
self.addEventListener('fetch', function(e) {
  e.respondWith(fetch(e.request, {cache: 'no-store'}).catch(function() {
    return caches.match(e.request);
  }));
});
