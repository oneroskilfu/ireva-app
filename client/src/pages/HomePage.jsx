// src/pages/HomePage.jsx
import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { Box, Button, Container, Grid, Typography, Card, CardContent } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';

// Simple fallback component
const Fallback = () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading UI components...</div>;

const NewHomePage = () => {
  return (
    <Box>
      {/* SEO HEAD */}
      <Helmet>
        <title>iREVA - Smart Real Estate Investing Platform</title>
        <meta name="description" content="Invest in fractional real estate assets securely with crypto integration, smart contracts, and high ROI opportunities. Join iREVA today!" />
        
        {/* OpenGraph for social sharing */}
        <meta property="og:title" content="iREVA - Smart Real Estate Investing Platform" />
        <meta property="og:description" content="Invest smarter with iREVA. Verified properties, fractional ownership, crypto support, and blockchain security." />
        <meta property="og:image" content="/assets/ireva-og-image.png" />
        <meta property="og:url" content="https://yourdomain.com" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="iREVA - Smart Real Estate Investing Platform" />
        <meta name="twitter:description" content="Real estate investments made simple and secure through crypto and blockchain technology." />
        <meta name="twitter:image" content="/assets/ireva-og-image.png" />
      </Helmet>

      {/* Hero Section */}
      <Box
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
          px: 2
        }}
      >
        <Typography variant="h2" fontWeight="bold" gutterBottom>
          Building Wealth Together: Real Estate, Reimagined.
        </Typography>
        <Typography variant="h5" mb={4}>
          Fractional investment in premium real estate projects, powered by innovation and trust.
        </Typography>
        <Button variant="contained" size="large" sx={{ mr: 2 }}>
          Get Started
        </Button>
        <Button variant="outlined" size="large" sx={{ color: 'white', borderColor: 'white', mt: 2 }}>
          See Opportunities
        </Button>
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

      {/* How It Works */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
          How It Works
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {[
            "Sign Up and Complete KYC",
            "Browse Verified Investment Projects",
            "Invest and Track ROI",
            "Withdraw or Reinvest Earnings",
            "Manage Crypto Wallet"
          ].map((step, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
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
        <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
          Key Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {[
            { title: "Own Real Estate with Ease", desc: "Direct ownership shares, no huge upfront capital." },
            { title: "Crypto-Enabled Investments", desc: "Optional deposits via stablecoins and Bitcoin." },
            { title: "Smart Contract Escrow", desc: "Secure transaction settlements powered by blockchain." },
            { title: "Seamless Mobile Experience", desc: "Invest and monitor anywhere with our PWA app." },
            { title: "Fully Regulated Compliance", desc: "KYC, AML, and legal protections in place." },
            { title: "Transparent Reporting", desc: "Real-time dashboards and project updates." },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2">{feature.desc}</Typography>
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

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: '#f8f8f8',
          py: 4,
          textAlign: 'center'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} iREVA Platform. All rights reserved.
        </Typography>
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