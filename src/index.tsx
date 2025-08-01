import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { Auth0ProviderWithHistory } from './components/Auth0ProviderWithHistory';
import './lib/supabase';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <Auth0ProviderWithHistory>
    <App />
  </Auth0ProviderWithHistory>
);

serviceWorker.register();