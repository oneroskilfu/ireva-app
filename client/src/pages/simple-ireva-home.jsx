import React from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  Avatar
} from '@mui/material';
import {
  CheckCircle,
  TrendingUp,
  Security,
  AccountBalanceWallet,
  CurrencyBitcoin,
  Analytics,
  EmojiEvents,
  Share,
  VerifiedUser,
  KeyboardArrowRight,
  Groups,
  Payments,
  Shield,
  Menu as MenuIcon
} from '@mui/icons-material';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5',
      light: '#6366F1',
      dark: '#4338CA',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

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

export default function SimpleIREVAHome() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Navbar */}
      <AppBar position="fixed" sx={{ backgroundColor: 'white', color: 'text.primary', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="a" 
            href="/"
            sx={{ 
              textDecoration: 'none', 
              color: 'text.primary', 
              fontWeight: 700,
              flexGrow: 1
            }}
          >
            iREVA
          </Typography>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button href="/projects" sx={{ color: 'text.primary' }}>
              Properties
            </Button>
            <Button href="/crypto-education" sx={{ color: 'text.primary' }}>
              Crypto Education
            </Button>
            <Button href="/auth" variant="contained" color="primary">
              Get Started
            </Button>
          </Box>
          
          <IconButton 
            sx={{ display: { md: 'none' } }}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, pt: 8, pb: 4 }}>
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              py: 8,
              borderRadius: 2,
              mb: 6,
              mt: 4,
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
                      href="/projects"
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
                      href="/auth"
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
                        href={`/property/${property.id}`}
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
                href="/projects" 
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

          {/* Tiered Investment Opportunities */}
          <Box sx={{ my: 8 }}>
            <Container>
              <Typography variant="h4" component="h2" sx={{ mb: 2, fontWeight: 700, textAlign: 'center' }}>
                Tiered Investment Opportunities
              </Typography>
              <Typography variant="body1" sx={{ mb: 5, textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
                Choose the investment tier that suits your goals and level of accreditation.
                Our platform offers flexible options for all types of investors.
              </Typography>
              
              <Grid container spacing={4}>
                {/* Tier 1: Starter */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 4, 
                      height: '100%', 
                      borderRadius: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0, 
                      bgcolor: 'primary.light', 
                      py: 0.5, 
                      px: 2,
                      borderBottomLeftRadius: 10,
                      color: 'white'
                    }}>
                      <Typography variant="subtitle2">No Accreditation Required</Typography>
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                      Starter Tier
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Perfect for first-time investors looking to explore real estate opportunities.
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <List dense sx={{ flexGrow: 1 }}>
                      <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="$100 - $10,000 investments" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="8-10% expected annual ROI" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="Lower-risk residential properties" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="Standard KYC verification" />
                      </ListItem>
                    </List>
                    <Button 
                      variant="outlined" 
                      href="/auth"
                      sx={{ mt: 3 }}
                    >
                      Start Investing
                    </Button>
                  </Paper>
                </Grid>
                
                {/* Tier 2: Growth */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={4} 
                    sx={{ 
                      p: 4, 
                      height: '100%', 
                      borderRadius: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                      transform: 'scale(1.05)',
                      bgcolor: 'primary.main',
                      color: 'white',
                      zIndex: 2
                    }}
                  >
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0, 
                      bgcolor: 'secondary.main', 
                      py: 0.5, 
                      px: 2,
                      borderBottomLeftRadius: 10,
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      <Typography variant="subtitle2">MOST POPULAR</Typography>
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      Growth Tier
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
                      For experienced investors looking for balanced risk and rewards.
                    </Typography>
                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
                    <List dense sx={{ flexGrow: 1 }}>
                      <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" sx={{ color: 'white' }} /></ListItemIcon>
                        <ListItemText primary="$10,000 - $50,000 investments" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" sx={{ color: 'white' }} /></ListItemIcon>
                        <ListItemText primary="10-15% expected annual ROI" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" sx={{ color: 'white' }} /></ListItemIcon>
                        <ListItemText primary="Mixed residential & commercial" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" sx={{ color: 'white' }} /></ListItemIcon>
                        <ListItemText primary="Advanced investor verification" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" sx={{ color: 'white' }} /></ListItemIcon>
                        <ListItemText primary="Early access to new properties" />
                      </ListItem>
                    </List>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      href="/auth"
                      sx={{ mt: 3 }}
                    >
                      Join Growth Tier
                    </Button>
                  </Paper>
                </Grid>
                
                {/* Tier 3: Premium */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 4, 
                      height: '100%', 
                      borderRadius: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0, 
                      bgcolor: '#D4AF37', 
                      py: 0.5, 
                      px: 2,
                      borderBottomLeftRadius: 10,
                      color: 'white'
                    }}>
                      <Typography variant="subtitle2">Accredited Investors</Typography>
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 1, color: '#D4AF37' }}>
                      Premium Tier
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      For accredited investors seeking maximum returns on premium properties.
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <List dense sx={{ flexGrow: 1 }}>
                      <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="$50,000+ investments" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="15-20% expected annual ROI" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="Premium commercial properties" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="Full accreditation verification" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="Exclusive early access" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="Priority customer support" />
                      </ListItem>
                    </List>
                    <Button 
                      variant="outlined" 
                      href="/auth"
                      sx={{ mt: 3 }}
                    >
                      Apply for Premium
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          </Box>

          {/* Payment Methods */}
          <Box sx={{ py: 8, bgcolor: '#f9f9f9', borderRadius: 2, my: 6 }}>
            <Container>
              <Grid container spacing={6} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
                    Multiple Payment Options
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 4 }}>
                    Invest your way with our flexible payment options, including traditional and cryptocurrency methods.
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AccountBalanceWallet color="primary" />
                        <Typography variant="body1">Digital Wallet</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Payments color="primary" />
                        <Typography variant="body1">Credit/Debit Cards</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CurrencyBitcoin color="primary" />
                        <Typography variant="body1">Cryptocurrencies</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Security color="primary" />
                        <Typography variant="body1">Smart Contracts</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
                      Accepted Cryptocurrencies:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label="USDT" />
                      <Chip label="USDC" />
                      <Chip label="ETH" />
                      <Chip label="BTC" />
                      <Chip label="BNB" />
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80"
                    alt="Cryptocurrency payment"
                    sx={{
                      width: '100%',
                      borderRadius: 4,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    }}
                  />
                </Grid>
              </Grid>
            </Container>
          </Box>

          {/* Analytics Dashboard Preview */}
          <Box sx={{ my: 8 }}>
            <Container>
              <Grid container spacing={6} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80"
                    alt="Analytics Dashboard"
                    sx={{
                      width: '100%',
                      borderRadius: 4,
                      boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
                    Track Your Investment Performance
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 4 }}>
                    Our comprehensive analytics dashboard gives you real-time insights into your investment portfolio.
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon><Analytics color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Real-time ROI Analytics" 
                        secondary="Monitor your returns with intuitive charts and graphs"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><TrendingUp color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Performance Tracking" 
                        secondary="Compare your investments against market benchmarks"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Groups color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Portfolio Diversification" 
                        secondary="View your investment spread across different property types"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Shield color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Secure Transaction History" 
                        secondary="All investment transactions are recorded on blockchain"
                      />
                    </ListItem>
                  </List>
                  
                  <Button 
                    variant="contained" 
                    href="/dashboard"
                    sx={{ mt: 3 }}
                    endIcon={<KeyboardArrowRight />}
                  >
                    Explore Dashboard
                  </Button>
                </Grid>
              </Grid>
            </Container>
          </Box>

          {/* Call to Action */}
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <Container maxWidth="md">
              <Typography variant="h3" component="h2" sx={{ mb: 3, fontWeight: 800 }}>
                Ready to Start Investing?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 400, color: 'text.secondary' }}>
                Join thousands of investors building wealth through African real estate
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large"
                  href="/auth"
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    fontSize: '1.1rem',
                    borderRadius: 2
                  }}
                >
                  Create Account
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  href="/projects"
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    fontSize: '1.1rem',
                    borderRadius: 2
                  }}
                >
                  Browse Properties
                </Button>
              </Box>
            </Container>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          mt: 'auto'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} iREVA - Real Estate Investment Platform
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
}