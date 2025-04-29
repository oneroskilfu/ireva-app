import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import SafeThemeProvider from './theme/SafeThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SafeThemeProvider>
      <CssBaseline />
      <App />
    </SafeThemeProvider>
  </React.StrictMode>
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // When new content is available, we can notify the user
    const waitingServiceWorker = registration.waiting;
    
    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener("statechange", (event) => {
        if (event.target.state === "activated") {
          // Force page reload once the new service worker is activated
          window.location.reload();
        }
      });
      
      // Send skip waiting message to the service worker
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }
  },
  onSuccess: (registration) => {
    console.log('Service worker registered successfully for offline use');
  }
});