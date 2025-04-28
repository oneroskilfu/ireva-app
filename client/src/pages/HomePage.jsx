// src/pages/HomePage.jsx
import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent,
  Link,
  Divider
} from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';

// Simple fallback component
const Fallback = () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading UI components...</div>;

const NewHomePage = () => {
  return (
    <Box>
      {/* Enhanced SEO HEAD with Comprehensive Meta Tags */}
      <Helmet>
        {/* Basic SEO Meta Tags */}
        <title>iREVA - Smart Real Estate Investing Platform</title>
        <meta name="description" content="Invest in fractional real estate assets securely with crypto integration, smart contracts, and high ROI opportunities. Join iREVA today!" />
        <meta name="keywords" content="real estate investment, property investing, fractional ownership, crypto real estate, blockchain properties, Nigeria real estate, African property market" />
        <meta name="author" content="iREVA Investment Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Enhanced OpenGraph for better social sharing */}
        <meta property="og:title" content="iREVA - Smart Real Estate Investing Platform" />
        <meta property="og:description" content="Invest smarter with iREVA. Verified properties, fractional ownership, crypto support, and blockchain security." />
        <meta property="og:image" content="/assets/ireva-og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="iREVA Real Estate Investment Platform Interface" />
        <meta property="og:url" content="https://yourdomain.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="iREVA" />
        <meta property="og:locale" content="en_US" />
        
        {/* Enhanced Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="iREVA - Smart Real Estate Investing Platform" />
        <meta name="twitter:description" content="Real estate investments made simple and secure through crypto and blockchain technology." />
        <meta name="twitter:image" content="/assets/ireva-og-image.png" />
        <meta name="twitter:image:alt" content="iREVA Investment Platform Screenshot" />
        <meta name="twitter:site" content="@iREVAPlatform" />
        <meta name="twitter:creator" content="@iREVAPlatform" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://yourdomain.com" />
        
        {/* Structured Data for Search Engines (JSON-LD) */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "iREVA",
            "url": "https://yourdomain.com",
            "logo": "https://yourdomain.com/assets/ireva-logo.png",
            "description": "A cutting-edge real estate investment platform leveraging blockchain technology for secure and transparent property investments.",
            "sameAs": [
              "https://facebook.com/iREVAPlatform",
              "https://twitter.com/iREVAPlatform",
              "https://linkedin.com/company/ireva-platform",
              "https://instagram.com/iREVAPlatform"
            ],
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "123 Investment Avenue",
              "addressLocality": "Lagos",
              "addressRegion": "Lagos State",
              "postalCode": "100001",
              "addressCountry": "Nigeria"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+234-000-0000",
              "contactType": "customer service",
              "availableLanguage": ["English"]
            }
          }
        `}</script>
        
        {/* Additional Structured Data for the Investment Platform */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "iREVA Investment Platform",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1024"
            }
          }
        `}</script>
      </Helmet>

      {/* Enhanced Hero Section with Accessibility Improvements */}
      <Box
        component="section"
        aria-labelledby="hero-heading"
        sx={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1568605114967-8130f3a36994)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          color: 'white',
          px: 2,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', // Dark overlay for better text readability
            zIndex: 1
          }
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
              background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block'
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
        {/* Add logos here if needed */}
      </Container>

      {/* How It Works - with enhanced accessibility */}
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

      {/* Features Section - with enhanced accessibility and animations */}
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
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
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

      {/* Opportunities Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
          Investment Opportunities
        </Typography>
        <Typography variant="subtitle1" textAlign="center" mb={4}>
          Discover hand-picked projects with potential high returns.
        </Typography>
        {/* You can create Opportunity Cards here later */}
        <Button variant="contained" size="large" fullWidth>
          See All Opportunities
        </Button>
      </Container>

      {/* Crypto Integration Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
          Crypto Integration
        </Typography>
        <Typography variant="subtitle1" textAlign="center" mb={4}>
          Deposit, invest, and withdraw using stablecoins and Bitcoin — fast, secure, and global.
        </Typography>
      </Container>

      {/* Testimonials Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
          What Investors Are Saying
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {[
            "Investing with iREVA has simplified my real estate journey!",
            "Seamless experience, great projects, crypto-ready platform.",
            "Best decision I made for growing my passive income."
          ].map((quote, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="body2">"{quote}"</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Security Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
          Security & Compliance
        </Typography>
        <Typography variant="subtitle1" textAlign="center" mb={4}>
          Your investments are protected by strong regulations and blockchain security.
        </Typography>
      </Container>

      {/* Final CTA */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          textAlign: 'center',
          py: 6,
          px: 2
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Ready to Start Your Wealth Journey?
        </Typography>
        <Button variant="contained" size="large" sx={{ mt: 3 }}>
          Create Your Free Account
        </Button>
      </Box>

      {/* Enhanced Footer with Accessibility Improvements */}
      <Box
        component="footer"
        sx={{
          backgroundColor: '#f8f8f8',
          py: 6,
          px: 2
        }}
        role="contentinfo"
        aria-label="Site footer"
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" component="h4" fontWeight="bold" gutterBottom>
                iREVA Platform
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                The future of real estate investment, powered by cutting-edge technology and accessible to everyone.
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" component="h4" fontWeight="bold" gutterBottom>
                Quick Links
              </Typography>
              <Box component="nav" aria-label="Footer navigation">
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                  {['About Us', 'Investments', 'How It Works', 'FAQ', 'Contact'].map((item) => (
                    <Box component="li" key={item} sx={{ mb: 1 }}>
                      <Link 
                        href="#"
                        aria-label={`Go to ${item} page`}
                        sx={{ 
                          color: 'text.secondary',
                          textDecoration: 'none',
                          '&:hover': { 
                            color: 'primary.main',
                            textDecoration: 'underline' 
                          }
                        }}
                      >
                        {item}
                      </Link>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" component="h4" fontWeight="bold" gutterBottom>
                Legal Information
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'AML Policy', 'Investment Risks'].map((item) => (
                  <Box component="li" key={item} sx={{ mb: 1 }}>
                    <Link 
                      href="#"
                      aria-label={`Read our ${item}`}
                      sx={{ 
                        color: 'text.secondary',
                        textDecoration: 'none',
                        '&:hover': { 
                          color: 'primary.main',
                          textDecoration: 'underline' 
                        }
                      }}
                    >
                      {item}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              © {new Date().getFullYear()} iREVA Platform. All rights reserved.
            </Typography>
            
            <Typography variant="caption" color="text.secondary" component="p">
              Investing in real estate involves risks. Past performance is not indicative of future results. 
              Please read all offering documents carefully before investing.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

// Wrap the component with ErrorBoundary and Suspense
const HomepageWithErrorHandling = () => (
  <ErrorBoundary>
    <Suspense fallback={<Fallback />}>
      <NewHomePage />
    </Suspense>
  </ErrorBoundary>
);

export default HomepageWithErrorHandling;