import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Typography, Container, Box } from '@mui/material';

// Create a simple theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function MinimalApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Minimal Working Example
          </Typography>
          <Typography variant="body1">
            This is a minimal app to test basic Material-UI and React functionality.
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default MinimalApp;