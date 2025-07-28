import React, { useEffect, useState, useContext } from 'react';
import { DataContext } from '../DataContext'; // ✅ Fixed import path
import type { DataContextType } from '../DataContext'; // ✅ Also import the type
import logoDark from './public/logo-dark.png';
import logoLight from './public/logo-light.png';

interface HeaderProps {
  version?: string;
}

const Header: React.FC<HeaderProps> = ({ version = 'v0.0.24' }) => {
  const { data } = useContext(DataContext) as DataContextType; // ✅ Type assertion fixes 'unknown' error
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
        height: '100px',
        width: 'auto',
        objectFit: 'contain',
        backgroundColor: data.theme === 'dark' ? '#000000' : '#ffffff', // Match header background        border: 'none', // Remove any default border
        boxShadow: 'none', // Remove any shadow
        outline: 'none', // Remove any outline
  }}
/>
        <span id="app-version" style={{
          position: 'absolute',
          right: '15px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '0.6em',
          color: 'var(--text-muted)',
        }}>
          {version}
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
