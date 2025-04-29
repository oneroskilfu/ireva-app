import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

// Component to debug theme and font loading issues
const ThemeDebugger = () => {
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [consoleErrors, setConsoleErrors] = useState([]);

  useEffect(() => {
    // Mock console.error to catch theme-related errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Only log errors that might be related to MUI or theming
      const errorString = args.join(' ');
      if (errorString.includes('MUI') || 
          errorString.includes('theme') || 
          errorString.includes('prop') || 
          errorString.includes('React') ||
          errorString.includes('component')) {
        setConsoleErrors(prev => [...prev, errorString.substring(0, 150) + '...']);
      }
      originalConsoleError(...args);
    };

    // Check if Roboto font is loaded
    document.fonts.ready.then(() => {
      if (!document.fonts.check('16px Roboto')) {
        setWarnings(prev => [...prev, 'Roboto font may not be loaded properly']);
      }
    });

    // Check for network errors related to font loading
    if (window.performance) {
      const resources = window.performance.getEntriesByType('resource');
      const fontErrors = resources.filter(resource => 
        resource.name.includes('font') && resource.duration === 0
      );
      
      if (fontErrors.length > 0) {
        setErrors(prev => [...prev, 'Font resources failed to load']);
      }
    }

    // Clean up
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // Only show if there are issues
  if (errors.length === 0 && warnings.length === 0 && consoleErrors.length === 0) {
    return null;
  }

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        position: 'fixed', 
        bottom: '80px', 
        right: '20px', 
        zIndex: 9999, 
        width: '350px',
        maxHeight: '300px',
        overflow: 'auto',
        p: 2
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <WarningIcon sx={{ mr: 1 }} color="warning" />
        Theme Debugger
      </Typography>
      
      {errors.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'error.main', fontWeight: 'bold' }}>
            Errors:
          </Typography>
          {errors.map((error, index) => (
            <Alert key={index} severity="error" sx={{ mb: 1 }} icon={<ErrorIcon />}>
              {error}
            </Alert>
          ))}
        </Box>
      )}
      
      {warnings.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'warning.main', fontWeight: 'bold' }}>
            Warnings:
          </Typography>
          {warnings.map((warning, index) => (
            <Alert key={index} severity="warning" sx={{ mb: 1 }}>
              {warning}
            </Alert>
          ))}
        </Box>
      )}
      
      {consoleErrors.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'error.main', fontWeight: 'bold' }}>
            Console Errors:
          </Typography>
          {consoleErrors.map((error, index) => (
            <Alert key={index} severity="error" sx={{ mb: 1, fontSize: '0.8rem' }}>
              {error}
            </Alert>
          ))}
        </Box>
      )}
      
      <Box mt={2} sx={{ display: 'flex', alignItems: 'center' }}>
        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
        <Typography variant="body2" color="success.main">
          MUI components loaded
        </Typography>
      </Box>
    </Paper>
  );
};

export default ThemeDebugger;