import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as serviceWorker from './serviceWorker'; // We'll create this file

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the service worker for PWA
serviceWorker.register();