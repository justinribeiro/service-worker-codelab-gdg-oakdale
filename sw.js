
importScripts('serviceworker-cache-polyfill.js');
var CACHE_VERSION = 1;
var CURRENT_CACHES = {
  mycache: 'my-cache-v-' + CACHE_VERSION,
  myimgs: 'my-imgs-v-' + CACHE_VERSION,
};

self.addEventListener('install', function(event) {
  
  var urlsToCache = [
    '/service-worker-codelab-gdg-oakdale/index.html',
    '/service-worker-codelab-gdg-oakdale/styles.css',
    '/service-worker-codelab-gdg-oakdale/pygment_trac.css',
    '/service-worker-codelab-gdg-oakdale/javascripts/scale.fix.js',
    ''
  ];

  // The fast and dirty approach
  var imgsToCache = [
    '/images/step-01-inspect-in-tools.png',
    '/images/step-01-registration.png',
    '/images/step-02-console-logging.png',
    '/images/step-02-more-registration.png',
    '/images/step-03-devtools-network-panel.png',
    '/images/step-03-fetch-and-store.png',
    '/images/step-03-serve-from-cache.png',
    '/images/step-04-serviceworker-codelab-testing.png'
  ];

  console.log("Install:", urlsToCache);

  event.waitUntil(function(){
      caches.open(CURRENT_CACHES['mycache']).then(function(cache) {
        cache.addAll(urlsToCache.map(function(urlToPrefetch) {
          return new Request(urlToPrefetch, {mode: 'no-cors'});
        })).then(function() {
          console.log('All resources have been fetched and cached.');
        });
      }).catch(function(error) {
        console.error('Pre-fetching failed:', error);
      });

      caches.open(CURRENT_CACHES['myimgs']).then(function(cache) {
        cache.addAll(imgsToCache.map(function(imgsToPreCache) {
          return new Request(imgsToPreCache, {mode: 'no-cors'});
        })).then(function() {
          console.log('All resources have been fetched and cached.');
        });
      }).catch(function(error) {
        console.error('Pre-fetching failed:', error);
      });
    }
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

  var requestURL = new URL(event.request.url);
  console.log('Handling fetch event for', requestURL);

  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log('Found response in cache:', response);
        return response;
      }

      console.log('No response found in cache. Fetch from network...');

      var fetchRequest = event.request.clone();
      return fetch(fetchRequest).then(
        function(response) {
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          var responseToCache = response.clone();

          caches.open(CURRENT_CACHES['mycache']).then(function(cache) {
              var cacheRequest = event.request.clone();
              console.log("Adding to cache");
              cache.put(cacheRequest, responseToCache);
            });

          return response;
        });
    })
  );
  
});

