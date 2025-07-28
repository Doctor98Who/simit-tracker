// sw.js
const CACHE_VERSION = 'v0.0.23';
const CACHE_NAME = 'simit-tracker-cache-' + CACHE_VERSION;
const urlsToCache = [
    '/',
    '/index.html',
    '/icon.png',
    '/manifest.json',
];

self.addEventListener('install', (event) => {
    console.log('Service Worker installing version:', CACHE_VERSION);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
    // Force the new service worker to take over immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating version:', CACHE_VERSION);
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    // Take control of all pages immediately
    self.clients.claim();
    
    // Notify all clients that there's a new version
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'NEW_VERSION_AVAILABLE',
                version: CACHE_VERSION
            });
        });
    });
});

self.addEventListener('fetch', (event) => {
    // Network-first strategy for HTML files to ensure updates
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone the response before caching
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(event.request);
                })
        );
        return;
    }
    
    // Cache-first strategy for other resources
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then((response) => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    
                    return response;
                });
            })
    );
});

self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    // Send version info when requested
    if (event.data.action === 'getVersion') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }
});