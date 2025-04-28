import React from 'react';
import { Link } from 'wouter';
import { 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  CardMedia,
  Container,
  Chip,
  Paper,
  Divider,
  Stack,
  Avatar,
  ListItem,
  ListItemText,
  ListItemIcon,
  List
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
  Shield
} from '@mui/icons-material';
import SimpleMainLayout from '../components/layouts/SimpleMainLayout';

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
    <SimpleMainLayout>
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
                  component={Link}
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
                  component={Link}
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
                    component={Link}
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
            component={Link} 
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
                  component={Link}
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
                  component={Link}
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
                  component={Link}
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
                component={Link}
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

      {/* Achievements and Referrals */}
      <Box sx={{ py: 8, bgcolor: 'primary.main', color: 'white', borderRadius: 2, my: 6 }}>
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
                Investment Achievements
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                Earn badges and rewards as you grow your investment portfolio on iREVA.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <EmojiEvents sx={{ fontSize: 40, color: '#FFD700', mb: 1 }} />
                    <Typography variant="body2">Pioneer Investor</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <EmojiEvents sx={{ fontSize: 40, color: '#C0C0C0', mb: 1 }} />
                    <Typography variant="body2">Diversified Portfolio</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <EmojiEvents sx={{ fontSize: 40, color: '#CD7F32', mb: 1 }} />
                    <Typography variant="body2">Premium Member</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
                Referral Program
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                Invite friends to iREVA and earn rewards when they make their first investment.
              </Typography>
              
              <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Share sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" color="text.primary">Get $50 for every referral</Typography>
                    <Typography variant="body2" color="text.secondary">
                      When they make their first investment
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Your unique referral code:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ letterSpacing: 1 }}>IRV-REIUV</Typography>
                  <Button size="small" variant="outlined">Copy</Button>
                </Paper>
                
                <Button 
                  variant="contained" 
                  fullWidth
                  startIcon={<Share />}
                >
                  Invite Friends
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* KYC Verification */}
      <Box sx={{ my: 8 }}>
        <Container>
          <Typography variant="h4" component="h2" sx={{ mb: 2, fontWeight: 700, textAlign: 'center' }}>
            Safe, Secure, and Compliant
          </Typography>
          <Typography variant="body1" sx={{ mb: 5, textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
            iREVA prioritizes security and regulatory compliance to protect your investments.
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <List>
                <ListItem>
                  <ListItemIcon><VerifiedUser color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="KYC Verification" 
                    secondary="Complete identity verification for secure access to all platform features"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><VerifiedUser color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Blockchain Transparency" 
                    secondary="All transactions and smart contracts are recorded on the blockchain for full transparency"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><VerifiedUser color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Escrow Services" 
                    secondary="Funds are held in secure escrow accounts and released based on milestone achievements"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><VerifiedUser color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Document Verification" 
                    secondary="All property documents are verified by legal experts before listing"
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="contained" 
                  component={Link}
                  href="/auth"
                  sx={{ mr: 2 }}
                >
                  Get Verified Now
                </Button>
                <Button 
                  variant="outlined" 
                  component={Link}
                  href="/legal"
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h5" component="h3" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                  Complete KYC in 3 Simple Steps
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText primary="Verify your identity with government-issued ID" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText primary="Confirm your address with proof of residence" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                    <ListItemText primary="Complete accreditation verification (for Premium tier)" />
                  </ListItem>
                </List>
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f7ff', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Most verifications are completed within 24-48 hours, allowing you to start investing quickly and securely.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ py: 8, bgcolor: '#f5f7ff', borderRadius: 2, my: 6 }}>
        <Container>
          <Typography variant="h4" component="h2" sx={{ mb: 6, fontWeight: 700, textAlign: 'center' }}>
            What Our Investors Say
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar src="https://randomuser.me/api/portraits/men/1.jpg" sx={{ width: 60, height: 60, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Samuel Okonkwo</Typography>
                    <Typography variant="body2" color="text.secondary">Lagos, Nigeria</Typography>
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                  "iREVA has transformed how I invest in real estate. The platform is intuitive, and I've already seen a 12% return on my first investment. The crypto payment option was a game-changer for me."
                </Typography>
                <Box sx={{ display: 'flex', mt: 2 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Box key={star} component="span" sx={{ color: '#FFD700', mr: 0.5 }}>★</Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar src="https://randomuser.me/api/portraits/women/2.jpg" sx={{ width: 60, height: 60, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Amina Mensah</Typography>
                    <Typography variant="body2" color="text.secondary">Accra, Ghana</Typography>
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                  "As someone new to real estate investment, I appreciated the Starter Tier option. The analytics dashboard makes it easy to track my investments, and the KYC process was smooth and secure."
                </Typography>
                <Box sx={{ display: 'flex', mt: 2 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Box key={star} component="span" sx={{ color: '#FFD700', mr: 0.5 }}>★</Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar src="https://randomuser.me/api/portraits/men/3.jpg" sx={{ width: 60, height: 60, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">David Kamau</Typography>
                    <Typography variant="body2" color="text.secondary">Nairobi, Kenya</Typography>
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                  "The Premium Tier has exceeded my expectations. The exclusive access to high-yield properties and the blockchain-based escrow service provide peace of mind. I've already referred five friends!"
                </Typography>
                <Box sx={{ display: 'flex', mt: 2 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Box key={star} component="span" sx={{ color: '#FFD700', mr: 0.5 }}>★</Box>
                  ))}
                </Box>
              </Paper>
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
              component={Link}
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
              component={Link}
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
    </SimpleMainLayout>
  );
}

export default HomePage;