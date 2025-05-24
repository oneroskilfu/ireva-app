import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create a basic fallback theme with custom colors
const fallbackTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700
    },
    h2: {
      fontWeight: 700
    },
    h3: {
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 8
  }
});

const SafeThemeProvider = ({ children }) => {
  try {
    return <ThemeProvider theme={fallbackTheme}>{children}</ThemeProvider>;
  } catch (error) {
    console.error('ThemeProvider error:', error.message);
    return <>{children}</>; // Render children even without a theme
  }
};

export default SafeThemeProvider;