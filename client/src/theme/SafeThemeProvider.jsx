import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // your customized theme

const SafeThemeProvider = ({ children }) => {
  try {
    if (!theme) throw new Error('Theme is undefined');
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    );
  } catch (error) {
    console.error('ThemeProvider fallback:', error.message);
    return <>{children}</>; // render app even if theming fails
  }
};

export default SafeThemeProvider;