import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  Box, 
  Button, 
  Container, 
  CssBaseline, 
  Typography 
} from '@mui/material';

// Create a Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5', // iREVA primary color
    },
    secondary: {
      main: '#9333EA',
    }
  }
});

// Main Component
const MuiBasic = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Material-UI Standalone Page
          </Typography>
          <Typography variant="body1" paragraph>
            This is a simple page that demonstrates the correct usage of Material-UI's ThemeProvider.
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
};

export default MuiBasic;