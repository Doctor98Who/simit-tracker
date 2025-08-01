export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Clear old caches on load
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name !== 'simit-tracker-cache-v0.1.23') {
              caches.delete(name);
            }
          });
        });
      }

      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
}