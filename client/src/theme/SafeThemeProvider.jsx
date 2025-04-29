import React, { useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Enable deep theme debugging in Vite development mode
const VITE_DEBUG_THEME = import.meta.env.DEV || false;

// Import with debugging - using dynamic import for Vite compatibility
let customTheme;
try {
  // Use regular import for better Vite HMR compatibility
  customTheme = require('./theme').default;
  
  if (VITE_DEBUG_THEME) {
    console.log("Theme imported successfully:", !!customTheme);
    console.log("Vite Dev Mode Theme Debugging Enabled");
  }
} catch (error) {
  console.error("ERROR IMPORTING THEME:", error.message);
  customTheme = null;
}

// Create a safe fallback theme in case the custom one fails
const fallbackTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

// Use the custom theme with a fallback if it's missing
const theme = customTheme || fallbackTheme;

const SafeThemeProvider = ({ children }) => {
  const [themeStatus, setThemeStatus] = useState({
    loaded: !!customTheme,
    error: null,
    viteInitialized: false
  });
  
  useEffect(() => {
    // This will run once after the component mounts (Vite compatibility check)
    if (!themeStatus.viteInitialized) {
      // Wait for Vite's hot module replacement system to stabilize
      setTimeout(() => {
        // Check theme again after a brief delay (helps with Vite HMR)
        const themeAvailable = !!customTheme && !!customTheme.palette;
        
        if (!themeAvailable) {
          console.error("THEME OBJECT IS MISSING! Using fallback theme.");
          console.error("This might be a Vite-specific context issue.");
          setThemeStatus({
            loaded: false,
            error: 'Theme failed to load after initialization',
            viteInitialized: true
          });
        } else {
          console.log("Theme loaded successfully with palette:", {
            primary: customTheme.palette?.primary?.main || 'undefined',
            secondary: customTheme.palette?.secondary?.main || 'undefined'
          });
          setThemeStatus({
            loaded: true,
            error: null,
            viteInitialized: true
          });
        }
      }, 100);
    }
  }, [themeStatus.viteInitialized]);
  
  // Show a debugging message for Vite-specific theme issues
  const ThemeStatusIndicator = () => {
    if (!VITE_DEBUG_THEME || themeStatus.loaded) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '20px',
        background: 'rgba(255,255,255,0.9)',
        zIndex: 9999,
        border: '2px solid red',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: '80%',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 10px', color: '#d32f2f' }}>Vite Theme Loading Issue</h3>
        <p style={{ margin: '0 0 15px' }}>
          There was a problem with theme initialization in Vite development mode.
          <br />
          Try refreshing the page or restarting the development server.
        </p>
        <div style={{ fontSize: '14px', textAlign: 'left', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
          <strong>Error:</strong> {themeStatus.error || 'Unknown theme error'}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '15px',
            padding: '8px 16px',
            background: '#2e7d32',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
    );
  };

  // Additional runtime check with detailed logging
  if (!theme) {
    console.error("THEME OBJECT IS MISSING! Using fallback theme in render.");
    
    return (
      <ThemeProvider theme={fallbackTheme}>
        <ThemeStatusIndicator />
        {children}
      </ThemeProvider>
    );
  }
  
  return (
    <ThemeProvider theme={theme}>
      <ThemeStatusIndicator />
      {children}
    </ThemeProvider>
  );
};

export default SafeThemeProvider;