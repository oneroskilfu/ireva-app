import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography, Button, Container } from '@mui/material';

// Simplest possible theme without any advanced configurations
const theme = createTheme();

function MinimalMui() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Minimal Material UI
          </Typography>
          <Typography variant="body1" paragraph>
            This is the simplest possible implementation with minimal configuration.
          </Typography>
          <Button variant="contained" color="primary">
            Primary Button
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default MinimalMui;