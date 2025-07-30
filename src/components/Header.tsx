import React, { useEffect, useState, useContext } from 'react';
import { DataContext } from '../DataContext';
import type { DataContextType } from '../DataContext';

interface HeaderProps {
  version?: string;
}

const Header: React.FC<HeaderProps> = ({ version = 'v0.1.3' }) => {
  const { data } = useContext(DataContext) as DataContextType;
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Check for updates immediately on load
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });

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

        // Check for updates every 5 minutes
        setInterval(() => {
          registration.update();
        }, 5 * 60 * 1000);
      });

      // Also check when window regains focus
      window.addEventListener('focus', () => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
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
        <span 
          id="app-version" 
          onClick={() => setShowChangelog(true)}
          style={{
            position: 'absolute',
            right: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '0.45em',
            color: 'var(--text-muted)',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent-primary)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          Beta {version}
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

      {showChangelog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }} onClick={() => setShowChangelog(false)}>
          <div style={{
            background: 'var(--bg-dark)',
            borderRadius: '20px',
            padding: '0',
            maxWidth: '400px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--border)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-light)',
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.2em',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                What's New
              </h3>
              <button
                onClick={() => setShowChangelog(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.2em',
                  cursor: 'pointer',
                  padding: '0',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-lighter)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{
              padding: '20px',
              overflowY: 'auto',
              maxHeight: 'calc(80vh - 80px)',
            }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}>
                  <span style={{
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75em',
                    fontWeight: '600',
                  }}>
                    v0.1.3
                  </span>
                  <span style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85em',
                  }}>
                    Current Release
                  </span>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ 
                    color: 'var(--accent-primary)', 
                    fontSize: '0.9em',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    ✨ Features
                  </h4>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '20px',
                    color: 'var(--text)',
                    fontSize: '0.85em',
                    lineHeight: '1.6',
                  }}>
                    <li>Cloud sync with Supabase - no more lost data!</li>
                    <li>1RM progress tracking and charts</li>
                    <li>Exercise history viewing</li>
                    <li>Rest timer with custom durations</li>
                    <li>Drop set support (D sets)</li>
                    <li>Drag to reorder exercises</li>
                    <li>Multi-device support</li>
                  </ul>
                </div>
                
                <div>
                  <h4 style={{ 
                    color: '#22c55e', 
                    fontSize: '0.9em',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    🐛 Bug Fixes
                  </h4>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '20px',
                    color: 'var(--text)',
                    fontSize: '0.85em',
                    lineHeight: '1.6',
                  }}>
                    <li>Fixed Safari workout modal scrolling</li>
                    <li>Fixed profile photo uploads</li>
                    <li>Fixed light mode visibility issues</li>
                    <li>Fixed exercise selection on mobile</li>
                    <li>Fixed auto-populate previous weights</li>
                    <li>Fixed Firefox display issues</li>
                  </ul>
                </div>
              </div>
              
              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '16px',
                marginTop: '20px',
              }}>
                <p style={{
                  fontSize: '0.8em',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  margin: 0,
                }}>
                  Made with 💪 by Pump Inc
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;