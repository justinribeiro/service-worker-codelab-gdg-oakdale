
importScripts('serviceworker-cache-polyfill.js');
var CACHE_VERSION = 2;
var CURRENT_CACHES = {
  mycache: 'my-cache-v-' + CACHE_VERSION,
  github: 'my-github-v-' + CACHE_VERSION
};

self.addEventListener('install', function(event) {
  var urlsToCache = [
    '/index.html',
    '/css/main.css',
    '/js/github_api.js',
    '/js/main-v1.js'
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

  var requestURL = new URL(event.request.url);

  console.log('Handling fetch event for', requestURL);

  if (requestURL.hostname == 'api.github.com') {
    event.respondWith(githubApiResponse(event.request));
  } else {
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
  }
});

function githubApiResponse(request) {
  if (request.headers.get('X-Cache') !== null && request.headers.get('X-Cache') == 'x-cache/only') {
    console.log('Returning Github response from cache');
    return caches.match(request);
  }
  else {
    return fetch(request.clone()).then(function(response) {
      return caches.open(CURRENT_CACHES['github']).then(function(cache) {

          var cacheRequest = request.clone();
          var cacheResponse = response.clone();

          cache.put(cacheRequest, cacheResponse).then(function() {
            console.log("Adding new Github response to cache", cacheRequest, cacheResponse);
          }, function() {
            console.log("Something went horribly wrong");
          });

        return response;
      });
    });
  }
}
