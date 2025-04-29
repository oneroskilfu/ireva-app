import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Paper,
  Card,
  CardContent,
  CardMedia,
  Stack,
  useTheme,
  Divider
} from '@mui/material';
import { 
  TrendingUp, 
  Security, 
  CreditCard, 
  Apartment,
  AccountBalance,
  Article
} from '@mui/icons-material';
import { useLocation } from 'wouter';
import AdminDashboardJS from '../components/admin/AdminDashboardJS';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.3s',
      '&:hover': {
        transform: 'translateY(-10px)',
        boxShadow: 6
      }
    }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Box sx={{ mb: 2, color: 'primary.main' }}>
          {icon}
        </Box>
        <Typography variant="h6" component="h3" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default function HomePage() {
  const theme = useTheme();
  const [location, navigate] = useLocation();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.dark',
          color: 'white',
          py: 8,
          background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  backgroundImage: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
                  backgroundClip: 'text',
                  color: 'transparent',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                Invest in Real Estate with Confidence
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4 }}>
                iREVA provides secure, accessible real estate investment opportunities with blockchain technology and smart contracts.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  size="large"
                  color="secondary"
                  onClick={() => navigate('/auth')}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    fontWeight: 'bold',
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)'
                  }}
                >
                  Start Investing
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                  onClick={() => navigate('/investor/dashboard')}
                >
                  View Dashboard
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  p: 2,
                }}
              >
                <Paper
                  elevation={10}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: 'white',
                    width: '100%',
                    maxWidth: 450,
                  }}
                >
                  <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                    Featured Investment Opportunity
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Premium Property in Lagos
                  </Typography>
                  <Box sx={{ my: 2 }}>
                    <Paper
                      sx={{
                        height: 200,
                        borderRadius: 2,
                        bgcolor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Apartment sx={{ fontSize: 60, color: 'primary.main' }} />
                    </Paper>
                  </Box>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Expected ROI: 12.5% per annum
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Minimum investment: ₦50,000
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/investor/properties')}
                  >
                    View Details
                  </Button>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom sx={{ mb: 6, fontWeight: 'bold' }}>
          Why Choose iREVA
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              icon={<TrendingUp sx={{ fontSize: 50 }} />}
              title="High Returns"
              description="Earn competitive returns on your real estate investments with our carefully curated properties."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              icon={<Security sx={{ fontSize: 50 }} />}
              title="Blockchain Security"
              description="Your investments are secured with blockchain technology and smart contracts for maximum transparency."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              icon={<CreditCard sx={{ fontSize: 50 }} />}
              title="Multiple Payment Options"
              description="Invest using traditional payment methods or cryptocurrencies including USDC and USDT."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              icon={<AccountBalance sx={{ fontSize: 50 }} />}
              title="Tiered Opportunities"
              description="Access different investment levels based on your accreditation status and investment goals."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              icon={<Article sx={{ fontSize: 50 }} />}
              title="Comprehensive KYC"
              description="Our thorough verification process ensures compliance and security for all investors."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              icon={<Apartment sx={{ fontSize: 50 }} />}
              title="Quality Properties"
              description="We select only the best properties with strong growth potential for our investment portfolio."
            />
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, background: `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.primary.main} 90%)`, color: 'white' }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Ready to Start Your Investment Journey?
                </Typography>
                <Typography variant="subtitle1" paragraph>
                  Join thousands of investors who are already growing their wealth with iREVA.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  onClick={() => navigate('/auth')}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    fontWeight: 'bold',
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.2)'
                  }}
                >
                  Create Account
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* Test Admin Dashboard Section */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Admin Dashboard Test
          </Typography>
          <Divider sx={{ mb: 4 }} />
          <AdminDashboardJS />
        </Container>
      </Box>
    </Box>
  );
}