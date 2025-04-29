import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia,
  Avatar,
  Stack,
  Divider,
  Paper,
  useTheme
} from '@mui/material';
import { 
  TrendingUp, 
  AccountBalance, 
  Security, 
  CreditCard, 
  Timeline, 
  Devices,
  CurrencyBitcoin,
  Speed,
  ArrowForward
} from '@mui/icons-material';
import { useLocation } from 'wouter';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            {icon}
          </Avatar>
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

const PropertyCard = ({ property }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
      <CardMedia
        component="img"
        height="140"
        image={property.image}
        alt={property.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {property.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {property.location}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Investment Goal
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            ${property.goal.toLocaleString()}
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Annual ROI
          </Typography>
          <Typography variant="body1" fontWeight="bold" color="success.main">
            {property.roi}%
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

const TestimonialCard = ({ testimonial }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
      <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', mb: 2 }}>
        "{testimonial.quote}"
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar src={testimonial.avatar} alt={testimonial.name} sx={{ mr: 2 }} />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {testimonial.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {testimonial.role}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

// Sample data
const featuredProperties = [
  {
    id: 1,
    title: 'Victoria Island Villa',
    location: 'Victoria Island, Lagos',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dmlsbGF8ZW58MHx8MHx8fDA%3D',
    goal: 1500000,
    roi: 12
  },
  {
    id: 2,
    title: 'Lekki Heights Apartments',
    location: 'Lekki Phase 1, Lagos',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YXBhcnRtZW50fGVufDB8fDB8fHww',
    goal: 850000,
    roi: 9.5
  },
  {
    id: 3,
    title: 'Abuja CBD Office Complex',
    location: 'Central Business District, Abuja',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8b2ZmaWNlJTIwYnVpbGRpbmd8ZW58MHx8MHx8fDA%3D',
    goal: 2100000,
    roi: 11
  }
];

const testimonials = [
  {
    id: 1,
    quote: "iREVA has completely transformed how I invest in real estate. The platform is intuitive, the investment options are diverse, and the returns have been excellent.",
    name: "Oluwaseun Adebayo",
    role: "Tech Entrepreneur",
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    id: 2,
    quote: "As a first-time real estate investor, I was looking for a platform that was easy to understand and trustworthy. iREVA exceeded my expectations in every way.",
    name: "Amara Okafor",
    role: "Financial Analyst",
    avatar: "https://i.pravatar.cc/150?img=5"
  },
  {
    id: 3,
    quote: "The crypto payment options make it incredibly easy to invest from anywhere in the world. The smart contract escrow gives me peace of mind that my investment is secure.",
    name: "Emmanuel Chukwu",
    role: "International Investor",
    avatar: "https://i.pravatar.cc/150?img=8"
  }
];

const HomePage = () => {
  const theme = useTheme();
  const [location, navigate] = useLocation();

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ 
        bgcolor: 'primary.dark', 
        color: 'white', 
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                fontWeight="bold"
                sx={{ mb: 2 }}
              >
                Invest in African Real Estate with Confidence
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                iREVA provides a secure platform for property investment with transparent returns and blockchain technology.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/investor/dashboard')}
                  sx={{ 
                    py: 1.5, 
                    px: 3,
                    borderRadius: 2
                  }}
                >
                  Start Investing
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    py: 1.5, 
                    px: 3,
                    borderRadius: 2,
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Learn More
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ 
                position: 'relative',
                height: 400,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Box 
                  component="img"
                  src="https://images.unsplash.com/photo-1556156653-e5a7c69cc4c7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHJlYWwlMjBlc3RhdGV8ZW58MHx8MHx8fDA%3D"
                  alt="Real Estate Investment"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 4,
                    boxShadow: 10
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
              Why Choose iREVA
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Our platform combines innovative technology with real estate expertise to provide a seamless investment experience.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard 
                icon={<TrendingUp fontSize="large" />}
                title="Competitive Returns"
                description="Earn up to 12% annual returns on carefully selected real estate investments across Africa."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard 
                icon={<Security fontSize="large" />}
                title="Blockchain Security"
                description="Smart contract escrow ensures your investment is secure and transactions are transparent."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard 
                icon={<CreditCard fontSize="large" />}
                title="Flexible Investments"
                description="Invest with as little as $100, using traditional payment methods or cryptocurrency."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard 
                icon={<AccountBalance fontSize="large" />}
                title="Verified Properties"
                description="All properties undergo rigorous verification and due diligence before listing."
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Properties Section */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h2" fontWeight="bold">
              Featured Properties
            </Typography>
            <Button 
              variant="outlined" 
              endIcon={<ArrowForward />}
              onClick={() => navigate('/properties')}
            >
              View All
            </Button>
          </Box>
          
          <Grid container spacing={4}>
            {featuredProperties.map((property) => (
              <Grid item key={property.id} xs={12} sm={6} md={4}>
                <PropertyCard property={property} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
              How It Works
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Start your real estate investment journey in just a few simple steps.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2,
                  fontSize: 36,
                  fontWeight: 'bold'
                }}>
                  1
                </Avatar>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Create an Account
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign up and complete our KYC verification process to ensure a secure platform for all investors.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2, 
                  fontSize: 36,
                  fontWeight: 'bold'
                }}>
                  2
                </Avatar>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Choose Properties
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Browse our curated selection of properties and select investments that match your goals.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2, 
                  fontSize: 36,
                  fontWeight: 'bold'
                }}>
                  3
                </Avatar>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Start Earning
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Track your investments through our dashboard and receive regular returns and updates.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
              What Our Investors Say
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Join thousands of satisfied investors who trust iREVA with their real estate investments.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial) => (
              <Grid item key={testimonial.id} xs={12} md={4}>
                <TestimonialCard testimonial={testimonial} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ 
        py: 10, 
        bgcolor: 'primary.main', 
        color: 'white',
        textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
            Ready to Start Investing?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join iREVA today and start building your real estate portfolio with as little as $100.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            color="secondary"
            onClick={() => navigate('/auth')}
            sx={{ 
              py: 1.5, 
              px: 4,
              borderRadius: 2,
              fontSize: 18
            }}
          >
            Create Account
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                iREVA
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                iREVA is a revolutionary real estate investment platform designed for the African market, making property investment accessible to everyone.
              </Typography>
              <Stack direction="row" spacing={1}>
                {/* Social media icons would go here */}
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Company
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">About Us</Typography>
                <Typography variant="body2" color="text.secondary">Team</Typography>
                <Typography variant="body2" color="text.secondary">Careers</Typography>
                <Typography variant="body2" color="text.secondary">Press</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Resources
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">Blog</Typography>
                <Typography variant="body2" color="text.secondary">FAQ</Typography>
                <Typography variant="body2" color="text.secondary">Support</Typography>
                <Typography variant="body2" color="text.secondary">Contact</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Legal
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">Terms</Typography>
                <Typography variant="body2" color="text.secondary">Privacy</Typography>
                <Typography variant="body2" color="text.secondary">Security</Typography>
                <Typography variant="body2" color="text.secondary">Compliance</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Products
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">Investments</Typography>
                <Typography variant="body2" color="text.secondary">Properties</Typography>
                <Typography variant="body2" color="text.secondary">For Developers</Typography>
                <Typography variant="body2" color="text.secondary">API</Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 iREVA. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;