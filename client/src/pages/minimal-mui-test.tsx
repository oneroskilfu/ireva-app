import React from 'react';
import { ThemeProvider, createTheme, Button, Typography, Box, Container, Paper } from '@mui/material';

/**
 * Creates a minimal MUI theme for testing
 */
const minimalTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

/**
 * Minimal MUI Test Component
 * 
 * This is the most minimal possible implementation of Material UI
 * with only the essential components and no external dependencies.
 */
function MinimalMuiTest() {
  return (
    <ThemeProvider theme={minimalTheme}>
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Minimal MUI Test
            </Typography>
            <Typography variant="body1" paragraph>
              This is a minimal implementation with just the ThemeProvider and basic components.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" color="primary" sx={{ mr: 2 }}>
                Primary Button
              </Button>
              <Button variant="contained" color="secondary">
                Secondary Button
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default MinimalMuiTest;