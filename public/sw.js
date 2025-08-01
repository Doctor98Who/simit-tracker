const CACHE_NAME = 'pump-inc-v0.1.25';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    self.clients.claim();
    
    // Only clear old caches, not the current one
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith('pump-inc-') && 
                           cacheName !== CACHE_NAME;
                }).map(cache => caches.delete(cache))
            );
        })
    );
});

// Cache CSS and JS files
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('version.json')) {
        event.respondWith(fetch(event.request, { cache: 'no-store' }));
        return;
    }
    
    // Cache CSS and JS files
    if (event.request.url.includes('.css') || event.request.url.includes('.js')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(response => {
                    return response || fetch(event.request).then(fetchResponse => {
                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;
                    });
                });
            })
        );
    }
});