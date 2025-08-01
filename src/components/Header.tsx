import React, { useEffect, useState, useContext } from 'react';
import { DataContext } from '../DataContext';
import type { DataContextType } from '../DataContext';

interface HeaderProps {
  version?: string;
}

const Header: React.FC<HeaderProps> = ({ version = 'v0.1.25' }) => {
  const { data } = useContext(DataContext) as DataContextType;
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

// Prevent background scrolling when changelog is open
useEffect(() => {
  if (showChangelog) {
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }
}, [showChangelog]);

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
    overflowY: 'auto',
  }} 
onClick={() => setShowChangelog(false)}>
  <div style={{
    background: 'var(--bg-dark)',
    borderRadius: '20px',
    padding: '0',
    maxWidth: '400px',
    width: '100%',
    maxHeight: '75vh',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
  }} onClick={(e) => e.stopPropagation()}>
    <div style={{
  padding: '16px 20px',
  borderBottom: '1px solid var(--border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'var(--bg-light)',
}}>
  <h3 style={{ 
    margin: 0, 
    fontSize: '1.2em',
    background: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: '700',
    letterSpacing: '-0.5px',
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
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '20px',
  paddingBottom: '32px',
  WebkitOverflowScrolling: 'touch',
  overscrollBehavior: 'contain',
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
                    v0.1.25
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
                    Features
                  </h4>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '20px',
                    color: 'var(--text)',
                    fontSize: '0.85em',
                    lineHeight: '1.6',
                  }}>
                    <li>Uploading picture as 'public' will populate it in feed under community tab</li>
                    <li>Friends can see public posts and interact with it</li>
                    <li>Complete overhaul of UI in many of the tabs</li>
                    <li>Added login capability!</li>
                    <li>Added cloud sync with Supabase</li>
                    <li>1RM progress tracking and charts</li>
                    <li>Can edit custom exercises now</li>
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
                    Bug Fixes
                  </h4>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '20px',
                    color: 'var(--text)',
                    fontSize: '0.85em',
                    lineHeight: '1.6',
                  }}>
                    <li>Finding friends is no longer case sensitive</li>
                    <li>Small bug fixes</li>
                    <li>Fixed seach bar going off screen in ExerciseTab</li>
                    <li>Fixed sync issues when refreshing/exiting browser</li>
                    <li>Fixed numerical display of sets involving warm up sets</li>
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