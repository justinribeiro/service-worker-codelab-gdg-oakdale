
importScripts('serviceworker-cache-polyfill.js');
var CACHE_VERSION = 1;
var CURRENT_CACHES = {
  mycache: 'my-cache-v-' + CACHE_VERSION
};

self.addEventListener('install', function(event) {
  var urlsToCache = [
    '/index.html',
    '/css/main.css'
  ];
  
  console.log("Install:", urlsToCache);

  event.waitUntil(
    caches.open(CURRENT_CACHES['mycache']).then(function(cache) {
      cache.addAll(urlsToCache.map(function(urlToPrefetch) {
        return new Request(urlToPrefetch, {mode: 'no-cors'});
      })).then(function() {
        console.log('All resources have been fetched and cached.');
      });
    }).catch(function(error) {
      console.error('Pre-fetching failed:', error);
    })
  );
});

self.addEventListener('activate', function(event) {
  
  console.log("Activate:", event);
  
  var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
    return CURRENT_CACHES[key];
  });

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (expectedCacheNames.indexOf(cacheName) == -1) {
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('Handling fetch event for', event.request.url);

  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log('Found response in cache:', response);
        return response;
      }

      console.log('No response found in cache. Fetch from network...');
      
      //
      //  This is a read-through cache in Matt Gaunt style
      //  See: http://www.html5rocks.com/en/tutorials/service-worker/introduction/
      //
      //  Variation: Jeff Posnick - Google Chrome team
      //  See: https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker/read-through-caching
      //
      var fetchRequest = event.request.clone();
      return fetch(fetchRequest).then(
        function(response) {
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          var responseToCache = response.clone();

          caches.open(CURRENT_CACHES['mycache']).then(function(cache) {
              var cacheRequest = event.request.clone();
              console.log("adding to cache");
              cache.put(cacheRequest, responseToCache);
            });

          return response;
        });
    })
  );
});
