import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  Paper,
  Card,
  CardContent,
  Grid
} from '@mui/material';

// App Routes/Pages Component
const MainAppRoutes = () => {
  return (
    <>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            iREVA Platform
          </Typography>
          <Button color="inherit" sx={{ ml: 1 }}>Login</Button>
          <Button variant="contained" color="secondary" sx={{ ml: 1 }}>Sign Up</Button>
        </Toolbar>
      </AppBar>
      
      <Container sx={{ mt: 4 }}>
        {/* Hero Section */}
        <Box sx={{ my: 6, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Welcome to iREVA
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ maxWidth: '600px', mx: 'auto', mb: 4, color: 'text.secondary' }}>
            Real Estate Investment Platform for Everyone
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              sx={{ 
                mr: 2, 
                px: 4, 
                py: 1.5,
                fontWeight: 500,
                boxShadow: '0 4px 8px rgba(46, 125, 50, 0.2)'
              }}
            >
              Explore Properties
            </Button>
            <Button 
              variant="outlined" 
              color="primary"
              size="large" 
              sx={{ 
                px: 4, 
                py: 1.5,
                fontWeight: 500 
              }}
            >
              Learn More
            </Button>
          </Box>
        </Box>
        
        {/* Features Section */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Secure Investments
                </Typography>
                <Typography variant="body1">
                  All investments are secured through smart contracts and escrow services, providing maximum security for your funds.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Diverse Properties
                </Typography>
                <Typography variant="body1">
                  Browse through a diverse range of properties across different locations, investment tiers, and potential returns.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Multiple Payment Options
                </Typography>
                <Typography variant="body1">
                  Invest using traditional payment methods or cryptocurrencies, including stablecoins like USDC and USDT.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* About Section */}
        <Paper sx={{ p: 4, mb: 6, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            About iREVA
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            iREVA is a cutting-edge real estate investment platform designed to democratize property investment. 
            Our platform makes high-quality real estate investments accessible to everyone, regardless of their financial background.
          </Typography>
          <Typography variant="body1">
            With a focus on security, transparency, and user experience, we offer a 5-year maturity model that provides 
            stable returns while contributing to community development and economic growth.
          </Typography>
        </Paper>
      </Container>
    </>
  );
};

// Main App Component
function App() {
  return <MainAppRoutes />;
}

export default App;