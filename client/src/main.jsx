import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import SafeThemeProvider from './theme/SafeThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Testing component to verify ThemeProvider works properly
const TestThemeComponent = () => {
  console.log("Rendering test MUI component outside main app");
  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, padding: '10px', background: '#f5f5f5', borderRadius: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <Button variant="contained" color="primary">
        Theme Test Button
      </Button>
    </div>
  );
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SafeThemeProvider>
      <CssBaseline />
      <TestThemeComponent />
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