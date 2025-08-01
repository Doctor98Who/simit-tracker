import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

interface Auth0ProviderWithHistoryProps {
  children: React.ReactNode;
}

export const Auth0ProviderWithHistory: React.FC<Auth0ProviderWithHistoryProps> = ({ children }) => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN!;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID!;

  const onRedirectCallback = (appState: any) => {
    window.location.replace(appState?.returnTo || window.location.pathname);
  };

  // More aggressive Auth0 cleanup
  React.useEffect(() => {
    const checkAndCleanAuth0 = () => {
      let needsCleanup = false;
      
      // Check all Auth0 related keys
      Object.keys(localStorage).forEach(key => {
        if (key.includes('auth0') || key.includes('@@auth0')) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              // Try to parse - if it fails, it's corrupted
              JSON.parse(value);
              
              // Also check if it's an expired token
              const data = JSON.parse(value);
              if (data.body && data.body.expires_in) {
                const expiresAt = data.body.expires_at || (data.body.created_at + data.body.expires_in);
                if (expiresAt && expiresAt < Date.now() / 1000) {
                  console.log('Found expired Auth0 token');
                  needsCleanup = true;
                }
              }
            }
          } catch (e) {
            console.error('Found corrupted Auth0 data:', key);
            needsCleanup = true;
          }
        }
      });
      
      if (needsCleanup) {
        console.log('Cleaning Auth0 storage and reloading...');
        // Clear all Auth0 data
        Object.keys(localStorage).forEach(key => {
          if (key.includes('auth0') || key.includes('@@auth0')) {
            localStorage.removeItem(key);
          }
        });
        // Reload to start fresh
        window.location.reload();
      }
    };
    
    // Check immediately
    checkAndCleanAuth0();
    
    // Also check when window gains focus (user returns to tab)
    window.addEventListener('focus', checkAndCleanAuth0);
    
    return () => {
      window.removeEventListener('focus', checkAndCleanAuth0);
    };
  }, [clientId, domain]);

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      skipRedirectCallback={window.location.pathname !== '/'}
    >
      {children}
    </Auth0Provider>
  );
};