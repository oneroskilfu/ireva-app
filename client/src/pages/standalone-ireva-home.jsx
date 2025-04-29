// Self-contained homepage without external theme dependencies
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent,
  Link,
  Divider,
  CssBaseline
} from '@mui/material';

// Create a self-contained theme for this component
const standaloneTheme = createTheme({
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
    text: {
      primary: '#111827',
      secondary: '#4B5563',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #4F46E5 0%, #6366F1 100%)',
          '&:hover': {
            background: 'linear-gradient(90deg, #3730A3 0%, #4F46E5 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
          '&:hover': {
            boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
          },
        },
      },
    },
  },
});

const StandaloneIREVAHome = () => {
  return (
    <ThemeProvider theme={standaloneTheme}>
      <CssBaseline />
      <Box>
        {/* Hero Section with inline background */}
        <Box
          component="section"
          aria-labelledby="hero-heading"
          sx={{
            backgroundColor: '#1a365d',
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            textAlign: 'center',
            color: 'white',
            px: 2,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              maxWidth: '800px'
            }}
          >
            <Typography 
              variant="h2" 
              fontWeight="bold" 
              gutterBottom
              id="hero-heading"
              component="h1"
              sx={{
                textShadow: '1px 1px 4px rgba(0,0,0,0.7)',
                color: '#ffffff',
              }}
            >
              Building Wealth Together: Real Estate, Reimagined.
            </Typography>
            <Typography 
              variant="h5" 
              mb={4}
              component="p"
              sx={{
                textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                maxWidth: '700px',
                margin: '0 auto 2rem auto'
              }}
            >
              Fractional investment in premium real estate projects, powered by innovation and trust.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center',
                gap: 2
              }}
            >
              <Button 
                variant="contained" 
                size="large"
                aria-label="Get Started with iREVA"
                sx={{ 
                  fontWeight: 'bold',
                  padding: '10px 30px',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                  }
                }}
              >
                Get Started
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                aria-label="Browse investment opportunities"
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  borderWidth: '2px',
                  fontWeight: 'bold',
                  padding: '10px 30px',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white',
                    borderWidth: '2px',
                  }
                }}
              >
                See Opportunities
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Trust Section */}
        <Container sx={{ py: 8 }}>
          <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
            Trusted By Thousands
          </Typography>
          <Typography variant="subtitle1" textAlign="center" mb={4}>
            Over 5,000+ active investors building wealth with iREVA.
          </Typography>
        </Container>

        {/* How It Works Section */}
        <Container sx={{ py: 8 }}>
          <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom id="how-it-works-section" component="h2">
            How It Works
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }} role="list" aria-labelledby="how-it-works-section">
            {[
              "Sign Up and Complete KYC",
              "Browse Verified Investment Projects",
              "Invest and Track ROI",
              "Withdraw or Reinvest Earnings",
              "Manage Crypto Wallet"
            ].map((step, index) => (
              <Grid item xs={12} sm={6} md={4} key={index} role="listitem">
                <Card 
                  elevation={3}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold" gutterBottom component="h3">
                      Step {index + 1}
                    </Typography>
                    <Typography variant="body1">{step}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Features Section */}
        <Container sx={{ py: 8 }}>
          <Typography 
            variant="h4" 
            textAlign="center" 
            fontWeight="bold" 
            gutterBottom 
            id="key-features-section"
            component="h2"
          >
            Key Features
          </Typography>
          <Grid 
            container 
            spacing={4} 
            sx={{ mt: 4 }} 
            role="list" 
            aria-labelledby="key-features-section"
          >
            {[
              { 
                title: "Own Real Estate with Ease", 
                desc: "Direct ownership shares, no huge upfront capital.", 
                ariaLabel: "Feature: Real estate ownership made easy" 
              },
              { 
                title: "Crypto-Enabled Investments", 
                desc: "Optional deposits via stablecoins and Bitcoin.", 
                ariaLabel: "Feature: Cryptocurrency investment options" 
              },
              { 
                title: "Smart Contract Escrow", 
                desc: "Secure transaction settlements powered by blockchain.", 
                ariaLabel: "Feature: Blockchain-secured escrow services" 
              },
              { 
                title: "Seamless Mobile Experience", 
                desc: "Invest and monitor anywhere with our PWA app.", 
                ariaLabel: "Feature: Mobile-friendly investment tracking" 
              },
              { 
                title: "Fully Regulated Compliance", 
                desc: "KYC, AML, and legal protections in place.", 
                ariaLabel: "Feature: Regulatory compliance and security" 
              },
              { 
                title: "Transparent Reporting", 
                desc: "Real-time dashboards and project updates.", 
                ariaLabel: "Feature: Real-time investment performance reporting" 
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index} role="listitem">
                <Card 
                  elevation={2}
                  aria-label={feature.ariaLabel}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    borderLeft: '0px solid transparent',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6,
                      borderLeftWidth: '4px',
                      borderLeftStyle: 'solid',
                      borderLeftColor: 'primary.main',
                    }
                  }}
                >
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      gutterBottom
                      component="h3"
                      sx={{
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: '-4px',
                          left: 0,
                          width: '40px',
                          height: '3px',
                          backgroundColor: 'primary.main',
                          transition: 'width 0.3s ease',
                        },
                        '&:hover::after': {
                          width: '60px',
                        }
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        transition: 'color 0.3s ease',
                        '&:hover': {
                          color: 'text.primary',
                        }
                      }}
                    >
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Call to Action */}
        <Box
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            py: 8,
            textAlign: 'center'
          }}
        >
          <Container>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Ready to Start Your Investment Journey?
            </Typography>
            <Typography variant="subtitle1" mb={4} sx={{ maxWidth: '700px', mx: 'auto' }}>
              Join our growing community of investors and get access to exclusive property deals.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                backgroundColor: 'white', 
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                }
              }}
            >
              Create Your Account
            </Button>
          </Container>
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            backgroundColor: '#111827',
            color: 'white',
            py: 6
          }}
        >
          <Container>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  iREVA
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Building a better future through smart real estate investments.
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Platform
                </Typography>
                <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>How It Works</Link>
                <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Properties</Link>
                <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Pricing</Link>
                <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>FAQ</Link>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Company
                </Typography>
                <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>About Us</Link>
                <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Team</Link>
                <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Careers</Link>
                <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Press</Link>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Legal
                </Typography>
                <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Privacy Policy</Link>
                <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Terms of Service</Link>
                <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Disclaimer</Link>
                <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Compliance</Link>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Contact
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>support@ireva.com</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>+234 000 0000</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>Lagos, Nigeria</Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
            <Typography variant="body2" textAlign="center">
              © {new Date().getFullYear()} iREVA Investment Platform. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default StandaloneIREVAHome;