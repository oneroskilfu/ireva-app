import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  CardMedia,
  Container
} from '@mui/material';
import MainLayout from '../components/layouts/MainLayout';

const featuredProperties = [
  {
    id: 1,
    title: 'Luxury Apartment Complex',
    location: 'Lagos, Nigeria',
    type: 'Residential',
    minInvestment: '$1,000',
    expectedROI: '12%',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3'
  },
  {
    id: 2,
    title: 'Commercial Plaza',
    location: 'Accra, Ghana',
    type: 'Commercial',
    minInvestment: '$2,500',
    expectedROI: '14%',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3'
  },
  {
    id: 3,
    title: 'Residential Development',
    location: 'Nairobi, Kenya',
    type: 'Mixed-Use',
    minInvestment: '$800',
    expectedROI: '10%',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3'
  }
];

function HomePage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 8,
          borderRadius: 2,
          mb: 6,
          backgroundImage: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Invest in African Real Estate
              </Typography>
              <Typography
                variant="h5"
                sx={{ mb: 4, fontWeight: 400 }}
              >
                Access premium property investments with as little as $100
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={RouterLink}
                  to="/projects"
                  sx={{ 
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px 0 rgba(0,0,0,0.2)'
                  }}
                >
                  Browse Properties
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={RouterLink}
                  to="/auth"
                  sx={{ 
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Get Started
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-4.0.3"
                alt="Real estate investment"
                sx={{
                  width: '100%',
                  borderRadius: 4,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  transform: { md: 'rotate(2deg)' }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Properties */}
      <Box sx={{ mt: 8, mb: 6 }}>
        <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
          Featured Investment Opportunities
        </Typography>
        <Grid container spacing={4}>
          {featuredProperties.map((property) => (
            <Grid item xs={12} md={4} key={property.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                  },
                  borderRadius: 2
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={property.imageUrl}
                  alt={property.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {property.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {property.location} • {property.type}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Box>
                      <Typography variant="overline" display="block" color="text.secondary">
                        Min. Investment
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        {property.minInvestment}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="overline" display="block" color="text.secondary">
                        Expected ROI
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {property.expectedROI}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    component={RouterLink}
                    to={`/property/${property.id}`}
                    sx={{ mt: 3 }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            component={RouterLink} 
            to="/projects" 
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none'
            }}
          >
            See All Properties
          </Button>
        </Box>
      </Box>

      {/* How It Works */}
      <Box sx={{ py: 8, bgcolor: '#f5f7ff', borderRadius: 2, my: 6 }}>
        <Container>
          <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
            How iREVA Works
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box 
                  sx={{ 
                    display: 'inline-flex',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    mb: 2
                  }}
                >
                  1
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Browse Properties
                </Typography>
                <Typography variant="body1">
                  Explore our curated selection of premium real estate investment opportunities across Africa.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box 
                  sx={{ 
                    display: 'inline-flex',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    mb: 2
                  }}
                >
                  2
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Invest Securely
                </Typography>
                <Typography variant="body1">
                  Use our secure platform to invest in properties using various payment methods, including cryptocurrency.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box 
                  sx={{ 
                    display: 'inline-flex',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    mb: 2
                  }}
                >
                  3
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  Track Returns
                </Typography>
                <Typography variant="body1">
                  Monitor your investment portfolio and receive regular returns directly to your wallet.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </MainLayout>
  );
}

export default HomePage;