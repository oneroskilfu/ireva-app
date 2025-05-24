import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';

// Create a minimal theme to avoid any complex configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function VersionCompatibleMui() {
  return (
    // Important: Passing theme object directly without any wrappers or modifiers
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Version Compatible Material UI Test
          </Typography>
          
          <Typography variant="body1" paragraph>
            This is a basic test of Material UI components with minimal configuration.
            We're using a direct ThemeProvider with a simple theme object to avoid version conflicts.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, my: 4 }}>
            <Button variant="contained" color="primary">
              Primary Button
            </Button>
            
            <Button variant="contained" color="secondary">
              Secondary Button
            </Button>
            
            <Button variant="outlined" color="primary">
              Outlined Button
            </Button>
          </Box>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="contained" color="primary" component="a" href="/">
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default VersionCompatibleMui;