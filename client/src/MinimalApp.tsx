import { Button, Container, Typography, Box, AppBar, Toolbar } from "@mui/material";

// Simple app with basic Material UI components
export default function MinimalApp() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">iREVA Platform</Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to iREVA
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Real Estate Investment Platform
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Button variant="contained" color="primary" sx={{ m: 1 }}>
              Get Started
            </Button>
            <Button variant="outlined" color="primary" sx={{ m: 1 }}>
              Learn More
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}