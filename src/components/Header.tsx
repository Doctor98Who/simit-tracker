import React, { useEffect, useState } from 'react';

interface HeaderProps {
  version?: string; // Optional prop for dynamic version
}
const Header: React.FC<HeaderProps> = ({ version = 'v0.0.24' }) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NEW_VERSION_AVAILABLE') {
          console.log('New version available:', event.data.version);
          setUpdateAvailable(true);
        }
      });

      // Check for updates when the page loads
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              console.log('New service worker installed');
              setUpdateAvailable(true);
            }
          });
        });

        // Check for updates periodically (every 30 minutes)
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);
      });
    }
  }, []);

  const handleUpdate = () => {
    if (updateAvailable) {
      // Send message to service worker to skip waiting
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
      }
      // Reload the page to get the new version
      window.location.reload();
    }
  };

  return (
    <>
      <div className="header">
        <img src="/icon.png" alt="Pump Inc. Logo" />
        <span id="app-version">{version}</span>
      </div>
      
      {updateAvailable && (
        <div style={{
          background: 'var(--accent-gradient)',
          color: 'white',
          padding: '10px',
          textAlign: 'center',
          fontSize: '0.9em',
          cursor: 'pointer'
        }} onClick={handleUpdate}>
          🎉 New version available! Tap here to update.
        </div>
      )}
    </>
  );
};

export default Header;