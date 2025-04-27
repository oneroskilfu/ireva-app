// A minimal standalone MUI homepage without dependencies on other components
import * as React from 'react';
import { 
  AppBar, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  CssBaseline, 
  Grid, 
  IconButton, 
  Link as MuiLink, 
  ThemeProvider, 
  Toolbar, 
  Typography, 
  createTheme 
} from '@mui/material';
import { Link } from 'wouter';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CelebrationIcon from '@mui/icons-material/Celebration';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5',
      light: '#6366F1',
      dark: '#3730A3',
    },
    secondary: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Simple nav items
const navItems = [
  { title: 'Home', link: '/' },
  { title: 'Properties', link: '/properties' },
  { title: 'About Us', link: '/company/team' },
  { title: 'Login', link: '/auth' },
];

// How it works steps
const steps = [
  {
    icon: <SearchIcon fontSize="large" />,
    title: "Browse Properties",
    description: "Explore our curated selection of high-quality real estate opportunities."
  },
  {
    icon: <AccountBalanceWalletIcon fontSize="large" />,
    title: "Invest Securely",
    description: "Fund your wallet and invest with as little as ₦250,000."
  },
  {
    icon: <TrendingUpIcon fontSize="large" />,
    title: "Track Performance",
    description: "Monitor your investments with our comprehensive analytics tools."
  },
  {
    icon: <CelebrationIcon fontSize="large" />,
    title: "Receive Returns",
    description: "Earn attractive returns over the 5-year maturity period."
  }
];

// Example featured properties
const featuredProperties = [
  {
    id: 1,
    name: 'Heritage Garden Estate',
    location: 'Abuja',
    imageUrl: 'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    return: '8.5%',
    minInvestment: '₦500,000',
    funded: '60%',
  },
  {
    id: 2,
    name: 'Westfield Retail Center',
    location: 'Lagos',
    imageUrl: 'https://images.unsplash.com/photo-1577415124269-fc1140a69e91?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    return: '9.8%',
    minInvestment: '₦250,000',
    funded: '82%',
  },
  {
    id: 3,
    name: 'Urban Heights Apartments',
    location: 'Port Harcourt',
    imageUrl: 'https://images.unsplash.com/photo-1576354302919-96748cb8299e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    return: '7.9%',
    minInvestment: '₦350,000',
    funded: '71%',
  }
];

// Simple navbar component
const SimpleNavbar = () => {
  return (
    <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              mr: 2,
              fontWeight: 700,
              color: theme.palette.primary.main,
              textDecoration: 'none',
            }}
          >
            iREVA
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Button
                key={item.title}
                component={Link}
                href={item.link}
                sx={{ 
                  mx: 1, 
                  color: 'text.primary',
                  '&:hover': {
                    color: theme.palette.primary.main,
                  }
                }}
              >
                {item.title}
              </Button>
            ))}
          </Box>
          
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <IconButton
              aria-label="menu"
              sx={{ color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

// Hero section
const Hero = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h1"
              sx={{
                mb: 2,
                fontWeight: 800,
                background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Invest in African Real Estate Today
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, fontSize: '1.25rem', color: 'text.secondary' }}>
              Start your real estate investment journey with as little as ₦250,000.
              Access premium properties and earn competitive returns.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                href="/auth"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #3730A3 0%, #6D28D9 100%)',
                  },
                }}
              >
                Start Investing
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/properties"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                Explore Properties
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              alt="Modern building"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 4,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// How it works section
const HowItWorks = () => {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="overline"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
              letterSpacing: 1,
              display: 'block',
              mb: 1,
            }}
          >
            SIMPLE PROCESS
          </Typography>
          
          <Typography variant="h2" sx={{ mb: 2 }}>
            How It Works
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary', 
              maxWidth: 800, 
              mx: 'auto', 
              fontSize: '1.25rem' 
            }}
          >
            Investing in African real estate has never been easier. Follow these simple steps.
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                  },
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: '-25px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 5px 15px rgba(79, 70, 229, 0.4)',
                  }}
                >
                  {step.icon}
                </Box>
                
                <CardContent sx={{ pt: 5, px: 3, textAlign: 'center' }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1, mt: 1 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Featured properties section
const FeaturedProperties = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{ mb: 2 }}>
            Featured Properties
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary', 
              maxWidth: 800, 
              mx: 'auto', 
              fontSize: '1.25rem',
              mb: 4,
            }}
          >
            Discover our handpicked selection of high-yield real estate investment opportunities.
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {featuredProperties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.id}>
              <Card
                sx={{
                  height: '100%',
                  overflow: 'hidden',
                  borderRadius: 4,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Box
                  component="img"
                  src={property.imageUrl}
                  alt={property.name}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                  }}
                />
                
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                    {property.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {property.location}
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Return
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {property.return}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Min. Investment
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {property.minInvestment}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Funded
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {property.funded}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Button
                    variant="contained"
                    component={Link}
                    href={`/property/${property.id}`}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      background: 'linear-gradient(90deg, #4F46E5 0%, #6366F1 100%)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #3730A3 0%, #4F46E5 100%)',
                      },
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            href="/properties"
            endIcon={<ArrowForwardIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderWidth: 2,
              borderRadius: 2,
              '&:hover': {
                borderWidth: 2,
              },
            }}
          >
            View All Properties
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

// Import social media icons
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

// Simple footer
const SimpleFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0f172a',
        color: 'white',
        py: 6,
        textAlign: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 3,
            background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          iREVA
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 3 }}>
          Democratizing Real Estate Investment in Africa
        </Typography>
        
        {/* Quick Links Section */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap', mb: 3 }}>
          <MuiLink
            component={Link}
            href="/company/team"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              '&:hover': { color: 'white', textDecoration: 'underline' },
              transition: 'color 0.2s ease',
            }}
          >
            About Us
          </MuiLink>
          <MuiLink
            component={Link}
            href="/properties"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              '&:hover': { color: 'white', textDecoration: 'underline' },
              transition: 'color 0.2s ease',
            }}
          >
            Projects
          </MuiLink>
          <MuiLink
            component={Link}
            href="/faq"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              '&:hover': { color: 'white', textDecoration: 'underline' },
              transition: 'color 0.2s ease',
            }}
          >
            FAQ
          </MuiLink>
          <MuiLink
            component={Link}
            href="/contact"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              '&:hover': { color: 'white', textDecoration: 'underline' },
              transition: 'color 0.2s ease',
            }}
          >
            Contact
          </MuiLink>
        </Box>
        
        {/* Newsletter Subscription */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box
            component="form"
            sx={{
              mt: 3,
              mb: 4,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
            }}
            onSubmit={(e) => {
              e.preventDefault();
              // Here you can add Firebase or EmailJS integration later
              alert('Subscribed successfully!');
            }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              required
              style={{
                padding: '10px 20px',
                borderRadius: '20px',
                border: 'none',
                width: '250px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                borderRadius: '20px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Subscribe
            </button>
          </Box>
        </motion.div>
        
        {/* Social Media Icons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          {[
            { icon: FacebookIcon, url: '#' },
            { icon: TwitterIcon, url: '#' },
            { icon: LinkedInIcon, url: '#' },
            { icon: InstagramIcon, url: '#' }
          ].map((social, index) => (
            <IconButton
              key={index}
              component="a"
              href={social.url}
              target="_blank"
              rel="noopener"
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': { 
                  color: 'white',
                  transform: 'translateY(-3px)',
                },
                transition: 'all 0.2s ease',
              }}
              size="small"
            >
              <social.icon />
            </IconButton>
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 4 }}>
          {navItems.map((item) => (
            <MuiLink
              key={item.title}
              component={Link}
              href={item.link}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                textDecoration: 'none',
                '&:hover': {
                  color: 'white',
                },
              }}
            >
              {item.title}
            </MuiLink>
          ))}
        </Box>
        
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          © {new Date().getFullYear()} iREVA. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

// Import scroll to top component
import ScrollToTop from '../components/ui/ScrollToTop';

// Main page component
export default function StandaloneMuiHome() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <SimpleNavbar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Hero />
          <HowItWorks />
          <FeaturedProperties />
        </Box>
        <SimpleFooter />
        <ScrollToTop />
      </Box>
    </ThemeProvider>
  );
}