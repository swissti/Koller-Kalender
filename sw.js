// Service Worker v5 - aggressive update strategy
var CACHE_NAME = 'koller-v5';
var URLS = ['./', './index.html', './manifest.json'];

// Install: cache files immediately
self.addEventListener('install', function(e) {
  self.skipWaiting(); // activate immediately
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS);
    }).catch(function(){}) // don't fail install if caching fails
  );
});

// Activate: delete ALL old caches immediately
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(k) {
          if (k !== CACHE_NAME) {
            console.log('Deleting old cache:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(function() {
      return self.clients.claim(); // take control of all open pages
    })
  );
});

// Fetch: ALWAYS network first for HTML, then cache
self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  
  // For the main HTML file: always try network first
  if (url.indexOf('index.html') > -1 || url.endsWith('/') || url.endsWith('/Koller-Kalender')) {
    e.respondWith(
      fetch(e.request, {cache: 'no-store'}) // bypass browser cache
        .then(function(res) {
          if (res && res.status === 200) {
            var clone = res.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(e.request, clone);
            });
          }
          return res;
        })
        .catch(function() {
          return caches.match(e.request);
        })
    );
    return;
  }
  
  // For other resources: cache first
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});

// Listen for message to skip waiting (force update)
self.addEventListener('message', function(e) {
  if (e.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
