import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  Box, 
  Button, 
  Container, 
  CssBaseline, 
  Typography 
} from '@mui/material';

// Create a simple theme with just the essentials for v5
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
});

// Main Component
const MuiV5Basic = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Material-UI v5 Basic Page
          </Typography>
          <Typography variant="body1" paragraph>
            This page uses Material-UI v5 with a minimal theme configuration.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="primary">
              Primary Button
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              sx={{ ml: 2 }}
            >
              Secondary Button
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default MuiV5Basic;