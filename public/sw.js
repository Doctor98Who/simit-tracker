// sw.js - Simple service worker for PWA
const CACHE_VERSION = 'v0.1.20';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    self.clients.claim();
});