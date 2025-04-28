import React from 'react';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import FooterSimple from '@/components/layout/FooterSimple';
import { Link as WouterLink } from 'wouter';

// Create a basic theme
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

// Standalone page wrapper that's isolated from the app's providers
const StandalonePage: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header/Navigation */}
        <AppBar position="static" color="transparent" elevation={0} sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)' }}>
          <Container maxWidth="lg">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: theme.palette.primary.main }}>
                iREVA
              </Typography>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                <Button color="inherit" component={WouterLink} href="/properties">Properties</Button>
                <Button color="inherit" component={WouterLink} href="/crypto-education">Crypto</Button>
                <Button color="inherit" component={WouterLink} href="/explore">Explore</Button>
                <Button color="inherit" component={WouterLink} href="/auth">Login</Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  component={WouterLink} 
                  href="/auth"
                  sx={{ 
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    }
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        {/* Main Hero Section */}
        <Box 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2, md: 6 },
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
          }}
        >
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              color: 'white',
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700
            }}
          >
            Real Estate Investments <br /> Powered by Blockchain
          </Typography>
          
          <Typography 
            variant="h5" 
            component="p" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 4,
              maxWidth: 700,
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            Africa's premier platform democratizing property investments with secure, 
            transparent, and accessible opportunities for everyone.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Button 
              variant="contained" 
              size="large"
              component={WouterLink}
              href="/properties"
              sx={{ 
                bgcolor: 'white',
                color: theme.palette.primary.main,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              View Properties
            </Button>
            
            <Button 
              variant="outlined" 
              size="large"
              component={WouterLink}
              href="/auth"
              sx={{ 
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Start Investing
            </Button>
          </Box>
        </Box>

        {/* Footer Component */}
        <FooterSimple />
      </Box>
    </ThemeProvider>
  );
};

export default StandalonePage;