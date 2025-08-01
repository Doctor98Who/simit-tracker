import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { Auth0ProviderWithHistory } from './components/Auth0ProviderWithHistory';
import './lib/supabase';

// Ensure CSS is loaded before rendering
const waitForStyles = () => {
  return new Promise((resolve) => {
    // Check if CSS variables are available
    const checkStyles = () => {
      const styles = getComputedStyle(document.documentElement);
      if (styles.getPropertyValue('--bg-dark')) {
        resolve(true);
      } else {
        requestAnimationFrame(checkStyles);
      }
    };
    
    // Start checking immediately
    checkStyles();
    
    // Fallback timeout to prevent infinite waiting
    setTimeout(() => resolve(true), 300);
  });
};

// Wait for critical styles before rendering
waitForStyles().then(() => {
  // Remove preloader
  const preloader = document.getElementById('app-preloader');
  if (preloader) {
    preloader.style.display = 'none';
  }
  
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  root.render(
    <Auth0ProviderWithHistory>
      <App />
    </Auth0ProviderWithHistory>
  );
});

serviceWorker.register();