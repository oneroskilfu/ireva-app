import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography, Button, Container } from '@mui/material';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5',
    },
    secondary: {
      main: '#9333EA',
    },
  },
});

// This is a completely standalone app component that doesn't depend on any other providers
export default function MuiStandaloneApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Standalone Material-UI App
          </Typography>
          <Typography variant="body1" paragraph>
            This page is completely independent and doesn't use the application's
            global ThemeProvider to avoid any conflicts.
          </Typography>
          <Button variant="contained" color="primary">
            Primary Button
          </Button>
          <Button variant="contained" color="secondary" sx={{ ml: 2 }}>
            Secondary Button
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
}