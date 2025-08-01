import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

interface Auth0ProviderWithHistoryProps {
  children: React.ReactNode;
}

export const Auth0ProviderWithHistory: React.FC<Auth0ProviderWithHistoryProps> = ({ children }) => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN!;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID!;

  const onRedirectCallback = (appState: any) => {
    // Handle redirect after login
    window.location.replace(appState?.returnTo || window.location.pathname);
  };

  // Check for corrupted auth state on mount
  React.useEffect(() => {
    // If we detect corrupted auth state, clear it
    const auth0Storage = localStorage.getItem(`@@auth0spajs@@::${clientId}::${domain}::openid profile email`);
    if (auth0Storage) {
      try {
        JSON.parse(auth0Storage);
      } catch (e) {
        console.error('Corrupted Auth0 state detected, clearing...');
        // Clear all Auth0 related localStorage items
        Object.keys(localStorage).forEach(key => {
          if (key.includes('auth0') || key.includes('@@auth0')) {
            localStorage.removeItem(key);
          }
        });
        // Reload to start fresh
        window.location.reload();
      }
    }
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
      // Prevent redirect loops on mobile
      skipRedirectCallback={window.location.pathname !== '/'}
    >
      {children}
    </Auth0Provider>
  );
};