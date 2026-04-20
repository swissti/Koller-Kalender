// Koller Kalender Service Worker
const CACHE = 'koller-kalender-v1';
const FILES = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Google Sheets Anfragen nicht cachen
  if(e.request.url.includes('script.google.com')){
    e.respondWith(fetch(e.request).catch(function(){return new Response('{}');}));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(res){
        var clone = res.clone();
        caches.open(CACHE).then(function(cache){cache.put(e.request, clone);});
        return res;
      });
    }).catch(function(){
      return caches.match('./index.html');
    })
  );
});
