import React, { useEffect, useState, useContext } from 'react';
import { DataContext } from '../DataContext';
import type { DataContextType } from '../DataContext';

interface HeaderProps {
  version?: string;
}

const Header: React.FC<HeaderProps> = ({ version = 'v0.0.27' }) => {
  const { data } = useContext(DataContext) as DataContextType;
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NEW_VERSION_AVAILABLE') {
          setUpdateAvailable(true);
        }
      });

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });

        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);
      });
    }
  }, []);

  const handleUpdate = () => {
    if (updateAvailable && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
      window.location.reload();
    }
  };

  return (
    <>
      <div className="header" style={{
        background: 'transparent',
        padding: '10px 15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
      }}>
        <img 
          src={data.theme === 'light' ? '/logo-light.png' : '/logo-dark.png'} 
          alt="Pump Inc Logo" 
          className="logo" 
          style={{
            height: '40px',
            width: 'auto',
            objectFit: 'contain',
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: 'none',
            outline: 'none',
            imageRendering: '-webkit-optimize-contrast',
            mixBlendMode: 'normal',
          }}
        />
        <span id="app-version" style={{
          position: 'absolute',
          right: '15px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '0.45em',
          color: 'var(--text-muted)',
          fontWeight: '400',
        }}>
          Alpha {version}
        </span>
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