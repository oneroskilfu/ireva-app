import React, { forwardRef } from 'react';
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
 * Creates a simple theme instance
 */
const muiTheme = createTheme({
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

/**
 * Forwarded Material UI Example
 * 
 * This component uses forwardRef to ensure compatibility with
 * React's strict requirements for component composition.
 */
const ForwardedMuiExample = forwardRef((props, ref) => {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box ref={ref} {...props}>
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
              Forwarded MUI Example
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom>
              Using forwardRef for React compatibility
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
      </Box>
    </ThemeProvider>
  );
});

// Set display name for better debugging
ForwardedMuiExample.displayName = 'ForwardedMuiExample';

export default ForwardedMuiExample;