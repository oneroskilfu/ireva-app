import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import SafeThemeProvider from './theme/SafeThemeProvider';
import ThemeDebugger from './theme/ThemeDebugger';
import ThemeDebugTest from './components/ThemeDebugTest';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Add Font Links Component to ensure fonts load properly
const FontLinks = () => (
  <div style={{ display: 'none' }}>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
    />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/icon?family=Material+Icons"
    />
  </div>
);

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

// Error boundary to catch theme-related rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Theme error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          border: '1px solid red',
          borderRadius: '4px',
          backgroundColor: '#fff8f8'
        }}>
          <h2>Theme Error Detected</h2>
          <p>There was an error with the theme: {this.state.error?.message}</p>
          <p>Please check the console for more details.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <SafeThemeProvider>
        <CssBaseline />
        <FontLinks />
        {/* Removed debug components now that theme is working correctly */}
        <App />
      </SafeThemeProvider>
    </ErrorBoundary>
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