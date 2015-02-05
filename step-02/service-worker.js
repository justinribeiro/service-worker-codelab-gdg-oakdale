
self.addEventListener('install', function(event) {
  console.log('Install event:', event);
});

self.addEventListener('activate', function(event) {
  console.log('Activate event:', event);
});
