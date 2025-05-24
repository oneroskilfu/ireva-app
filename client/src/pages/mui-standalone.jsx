import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Link as WouterLink } from 'wouter';
import { 
  AppBar, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  CssBaseline, 
  Grid, 
  Link,
  Paper, 
  Toolbar, 
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
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

// Feature Card Component
const FeatureCard = ({ title, description, icon }) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
      <Box sx={{ 
        width: 60, 
        height: 60, 
        borderRadius: '50%', 
        bgcolor: 'primary.light', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        mx: 'auto', 
        mb: 2,
        color: 'primary.main',
        fontSize: 24
      }}>
        {icon}
      </Box>
      <Typography variant="h3" component="h3" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

// Property Card Component
const PropertyCard = ({ title, location, price }) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Box 
      sx={{ 
        bgcolor: '#e2e8f0', 
        height: 200, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#94a3b8'  
      }}
    >
      Property Image
    </Box>
    <CardContent>
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {location}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          ${price.toLocaleString()}
        </Typography>
        <Button size="small" variant="contained">View Details</Button>
      </Box>
    </CardContent>
  </Card>
);

// Main Component
const MuiStandalone = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        {/* Header/Navigation */}
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              iREVA
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              <Button component={WouterLink} href="/mui-standalone" color="inherit">Home</Button>
              <Button component={WouterLink} href="/mui-standalone/properties" color="inherit">Properties</Button>
              <Button component={WouterLink} href="/mui-standalone/about" color="inherit">About</Button>
              <Button component={WouterLink} href="/mui-standalone/contact" color="inherit">Contact</Button>
              <Button color="primary" variant="contained">Login</Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Hero Section */}
        <Box
          sx={{
            pt: 8,
            pb: 6,
            bgcolor: 'background.paper',
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography
                  component="h1"
                  variant="h1"
                  color="text.primary"
                  gutterBottom
                  sx={{
                    background: 'linear-gradient(90deg, #4F46E5, #9333EA)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Invest in African Real Estate
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph>
                  iREVA democratizes property investment, making it accessible to everyone through blockchain technology and fractional ownership.
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                  <Button variant="contained" size="large">
                    Explore Properties
                  </Button>
                  <Button variant="outlined" size="large">
                    Learn More
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    height: 400,
                    bgcolor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                  }}
                >
                  Property Image Placeholder
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Featured Properties Section */}
        <Container sx={{ py: 8 }} maxWidth="lg">
          <Typography
            component="h2"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Featured Properties
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {[
              { title: 'Luxury Villa', location: 'Lagos, Nigeria', price: 250000 },
              { title: 'Modern Apartment', location: 'Nairobi, Kenya', price: 150000 },
              { title: 'Commercial Space', location: 'Accra, Ghana', price: 350000 },
            ].map((property, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <PropertyCard {...property} />
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Why Choose iREVA Section */}
        <Box sx={{ bgcolor: '#f1f5f9', py: 8 }}>
          <Container maxWidth="lg">
            <Typography
              component="h2"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Why Choose iREVA?
            </Typography>
            <Grid container spacing={4} sx={{ mt: 2 }}>
              {[
                {
                  title: 'Blockchain Security',
                  description: 'All investments are secured through blockchain technology and smart contracts.',
                  icon: '1'
                },
                {
                  title: 'Fractional Ownership',
                  description: 'Invest with as little as $100 and own a share of premium real estate.',
                  icon: '2'
                },
                {
                  title: 'Regular ROI',
                  description: 'Earn consistent returns from rental income and property appreciation.',
                  icon: '3'
                },
              ].map((feature, index) => (
                <Grid item key={index} xs={12} md={4}>
                  <FeatureCard {...feature} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ bgcolor: 'background.paper', pt: 6, pb: 4 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                  iREVA
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Revolutionizing real estate investment in Africa through blockchain technology and fractional ownership.
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Quick Links
                </Typography>
                <nav>
                  <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Link href="/mui-standalone/properties" sx={{ color: 'text.secondary', textDecoration: 'none' }}>
                        Properties
                      </Link>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Link href="/mui-standalone/about" sx={{ color: 'text.secondary', textDecoration: 'none' }}>
                        About Us
                      </Link>
                    </Box>
                  </Box>
                </nav>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Legal
                </Typography>
                <nav>
                  <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Link href="/mui-standalone/privacy-policy" sx={{ color: 'text.secondary', textDecoration: 'none' }}>
                        Privacy Policy
                      </Link>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Link href="/mui-standalone/terms" sx={{ color: 'text.secondary', textDecoration: 'none' }}>
                        Terms of Service
                      </Link>
                    </Box>
                  </Box>
                </nav>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Contact
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Email: info@ireva.com
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Phone: +234 800 123 4567
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lagos, Nigeria
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 5 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                © {new Date().getFullYear()} iREVA. All rights reserved.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MuiStandalone;