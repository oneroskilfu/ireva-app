import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardMedia,
  Grid,
  Paper
} from '@mui/material';
import { Home as HomeIcon, Menu as MenuIcon } from '@mui/icons-material';

// Create a simplified theme with iREVA colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5',
      light: '#6366F1',
      dark: '#3730A3',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
});

// Simple Navbar component
const Navbar = () => {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          iREVA
        </Typography>
        <Button color="inherit">Home</Button>
        <Button color="inherit">Properties</Button>
        <Button color="inherit">Invest</Button>
        <Button color="inherit">About</Button>
        <Button color="inherit" variant="outlined" sx={{ ml: 2 }}>Log In</Button>
        <Button color="secondary" variant="contained" sx={{ ml: 2 }}>Sign Up</Button>
      </Toolbar>
    </AppBar>
  );
};

// Property card component
const PropertyCard = ({ image, title, location, price, roi }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardMedia
        component="img"
        height="140"
        image={image || 'https://via.placeholder.com/300x140?text=Property+Image'}
        alt={title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {location}
        </Typography>
        <Typography variant="h6" component="div" color="primary" gutterBottom>
          ₦{price}
        </Typography>
        <Typography variant="body2" color="success.main">
          {roi}% Expected ROI
        </Typography>
        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Invest Now
        </Button>
      </CardContent>
    </Card>
  );
};

// Hero section
const HeroSection = () => {
  return (
    <Box
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 8,
        borderRadius: 2,
        mb: 6,
        backgroundImage: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h2" component="h1" gutterBottom>
              Invest in Premium Nigerian Real Estate
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 'normal' }}>
              Access high-return property investments with as little as ₦50,000
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              sx={{ mr: 2, px: 4, py: 1.5 }}
            >
              Start Investing
            </Button>
            <Button 
              variant="outlined" 
              sx={{ color: 'white', borderColor: 'white', px: 4, py: 1.5 }}
            >
              Learn More
            </Button>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper elevation={6} sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 2 }}>
              <Typography variant="h5" color="primary.dark" gutterBottom>
                Latest Investment Opportunity
              </Typography>
              <Typography variant="body1" color="text.primary" gutterBottom>
                Victoria Island Luxury Apartments
              </Typography>
              <Typography variant="h6" color="secondary.main" gutterBottom>
                18.5% Expected Annual ROI
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                50 units remaining out of 100
              </Typography>
              <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                View Details
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Main app component
const SimplifiedThemedApp = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
          <Container maxWidth="lg">
            <HeroSection />
            
            <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
              Featured Properties
            </Typography>
            
            <Grid container spacing={4}>
              {[
                { title: 'Lekki Phase 1 Apartments', location: 'Lekki, Lagos', price: '25,000,000', roi: 15.2 },
                { title: 'Ikoyi Executive Homes', location: 'Ikoyi, Lagos', price: '75,000,000', roi: 18.7 },
                { title: 'Abuja City Centre Complex', location: 'Central District, Abuja', price: '45,000,000', roi: 14.8 },
                { title: 'Port Harcourt Waterfront Villas', location: 'Port Harcourt', price: '35,000,000', roi: 16.5 }
              ].map((property, index) => (
                <Grid item key={index} xs={12} sm={6} md={3}>
                  <PropertyCard {...property} />
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 8, textAlign: 'center' }}>
              <Button variant="outlined" color="primary" size="large">
                View All Properties
              </Button>
            </Box>
            
            <Box sx={{ mt: 10, mb: 6 }}>
              <Typography variant="h3" component="h2" gutterBottom align="center">
                Why Invest with iREVA?
              </Typography>
              
              <Grid container spacing={4} sx={{ mt: 4 }}>
                {[
                  { title: 'Vetted Properties', description: 'All properties undergo strict due diligence and legal verification' },
                  { title: 'Start Small', description: 'Begin with as little as ₦50,000 and build your portfolio gradually' },
                  { title: 'Secured Investments', description: 'Smart contracts and escrow services protect your investments' },
                  { title: 'Regular Returns', description: 'Track performance and receive ROI payments directly to your wallet' }
                ].map((feature, index) => (
                  <Grid item key={index} xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', p: 3, textAlign: 'center' }}>
                      <Typography variant="h5" component="h3" gutterBottom color="primary">
                        {feature.title}
                      </Typography>
                      <Typography variant="body1">
                        {feature.description}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Container>
        </Box>
        
        <Box component="footer" sx={{ py: 4, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              © 2023 iREVA. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default SimplifiedThemedApp;