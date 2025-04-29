import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  Paper 
} from '@mui/material';

// Simple App component with basic MUI elements
function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            iREVA Platform
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
      
      <Container sx={{ mt: 4 }}>
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to iREVA
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Real Estate Investment Platform
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Button variant="contained" color="primary" sx={{ mr: 2 }}>
              Learn More
            </Button>
            <Button variant="outlined" color="secondary">
              Sign Up
            </Button>
          </Box>
        </Box>
        
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            About Us
          </Typography>
          <Typography variant="body1">
            iREVA is a cutting-edge real estate investment platform designed 
            to make property investment accessible to everyone.
          </Typography>
        </Paper>
      </Container>
    </>
  );
}

export default App;