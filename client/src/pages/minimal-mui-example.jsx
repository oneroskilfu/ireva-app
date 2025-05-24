import React from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  Button, 
  Typography, 
  Box, 
  Container,
  CssBaseline,
  AppBar,
  Toolbar
} from '@mui/material';

/**
 * Minimal Material UI Example
 * 
 * This component is completely self-contained with no dependencies
 * on other providers or contexts in the application.
 */
export default function MinimalMuiExample() {
  // Create a simple theme instance
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#4F46E5',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#38bdf8',
      }
    },
  });

  // Render with self-contained ThemeProvider
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            iREVA
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Minimal MUI Example
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Self-contained component with its own ThemeProvider
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="contained" color="primary">
            Primary Action
          </Button>
          <Button variant="outlined" color="primary">
            Secondary Action
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
}