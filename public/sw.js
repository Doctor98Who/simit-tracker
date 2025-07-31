// sw.js - Simple service worker with update notifications
const VERSION = 'v0.1.19'; // Update this number when you deploy changes

self.addEventListener('install', (event) => {
    console.log('Installing service worker version:', VERSION);
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Activating service worker version:', VERSION);
    self.clients.claim();
    
    // Notify all clients about the new version
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'NEW_VERSION_AVAILABLE',
                version: VERSION
            });
        });
    });
});

self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});