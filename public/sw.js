// sw.js - Simple service worker for PWA
const CACHE_VERSION = 'v0.1.24';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    self.clients.claim();
    
    // Clear all caches to force fresh content
   // event.waitUntil(
        //caches.keys().then(cacheNames => {
           // return Promise.all(
               // cacheNames.map(cache => caches.delete(cache))
           // );
      //  })
  //  );
});

// Force bypass cache for version.json
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('version.json')) {
        event.respondWith(
            fetch(event.request, { cache: 'no-store' })
        );
    }
});