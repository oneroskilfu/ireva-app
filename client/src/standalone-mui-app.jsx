import React from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Button, 
  Container, 
  Typography, 
  Box,
  Paper
} from '@mui/material';

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

// Minimal MUI App
function StandaloneMuiApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Standalone Material UI Application
          </Typography>
          
          <Typography variant="body1" paragraph>
            This is a minimal standalone Material UI application that doesn't rely on any other providers or components.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, my: 4 }}>
            <Button variant="contained" color="primary">Primary Button</Button>
            <Button variant="contained" color="secondary">Secondary Button</Button>
            <Button variant="outlined" color="primary">Outlined Button</Button>
          </Box>
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              color="primary" 
              component="a" 
              href="/"
            >
              Back to Main Application
            </Button>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

// Only mount if this file is loaded directly
if (document.getElementById('standalone-mui-root')) {
  const root = createRoot(document.getElementById('standalone-mui-root'));
  root.render(<StandaloneMuiApp />);
}

export default StandaloneMuiApp;