import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

// Create a basic theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5',
      light: '#6366F1',
      dark: '#3730A3',
    },
    secondary: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Standalone page wrapper that's isolated from the app's providers
const StandalonePage: React.FC = () => {
  // Simple welcome content
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: 20,
        textAlign: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`
      }}>
        <h1 style={{ 
          color: '#ffffff', 
          marginBottom: 20,
          fontSize: '2.5rem',
          fontWeight: 700
        }}>
          Welcome to iREVA
        </h1>
        
        <p style={{ 
          color: '#ffffff', 
          marginBottom: 30,
          fontSize: '1.2rem',
          maxWidth: 600
        }}>
          Africa's premier real estate investment platform
        </p>
        
        <div>
          <button style={{
            background: '#ffffff',
            color: theme.palette.primary.main,
            padding: '12px 24px',
            borderRadius: 8,
            fontSize: '1rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            marginRight: 16,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            View Properties
          </button>
          
          <button style={{
            background: 'rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: 8,
            fontSize: '1rem',
            fontWeight: 600,
            border: '2px solid #ffffff',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            Learn More
          </button>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default StandalonePage;