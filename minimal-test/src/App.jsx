import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Button, Typography, Container, Box, Paper } from '@mui/material';

// Create a basic theme
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Minimal Material UI Test
          </Typography>
          
          <Typography variant="body1" paragraph>
            This is a minimal test of Material UI components with React 18.2.0
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
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
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;