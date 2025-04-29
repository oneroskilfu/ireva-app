import React, { useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Import with debugging
let customTheme;
try {
  // Dynamic import with error handling
  customTheme = require('./theme').default;
  console.log("Theme imported successfully:", !!customTheme);
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
  useEffect(() => {
    // Debug output on mount for theme verification
    if (!customTheme) {
      console.error("THEME OBJECT IS MISSING! Using fallback theme.");
    } else {
      console.log("Theme loaded successfully with palette:", {
        primary: customTheme.palette?.primary?.main || 'undefined',
        secondary: customTheme.palette?.secondary?.main || 'undefined'
      });
    }
  }, []);
  
  // Additional runtime check with detailed logging
  if (!theme) {
    console.error("THEME OBJECT IS MISSING! Using fallback theme in render.");
    return (
      <ThemeProvider theme={fallbackTheme}>
        {children}
      </ThemeProvider>
    );
  }
  
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export default SafeThemeProvider;