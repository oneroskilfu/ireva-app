import React from 'react';
import { Box, Container, Typography, Grid as MuiGrid, Link, TextField, Button, Stack, Divider, useTheme } from '@mui/material';
import { Link as WouterLink } from 'wouter';
import { Facebook, Twitter, Instagram, LinkedIn, YouTube, Email } from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
// Create a proper Grid component that won't have TypeScript issues with 'item' prop
const Grid = MuiGrid as React.ComponentType<React.ComponentProps<typeof MuiGrid> & { item?: boolean }>;

const Footer: React.FC = () => {
  const theme = useTheme();
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send this to your backend
    console.log('Subscribed with email:', email);
    setSubscribed(true);
    setEmail('');
    
    // Reset subscription status after 5 seconds
    setTimeout(() => {
      setSubscribed(false);
    }, 5000);
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: `1px solid ${theme.palette.divider}`,
        py: 8,
        mt: 'auto',
        boxShadow: `0 -4px 20px rgba(0, 0, 0, 0.05)`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" color="text.primary" gutterBottom fontWeight="bold">
                iREVA
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 300 }}>
                Africa's premier real estate investment platform leveraging blockchain technology to democratize property investments.
              </Typography>
            </Box>
            
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
                Newsletter
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Stay updated with the latest investment opportunities
              </Typography>
              
              <Box component="form" onSubmit={handleSubscribe} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Your email address"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ 
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                  disabled={subscribed}
                />
                <Button 
                  type="submit"
                  variant="contained" 
                  fullWidth
                  disabled={subscribed}
                  sx={{ 
                    borderRadius: 2,
                    py: 1,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  {subscribed ? 'Subscribed ✓' : 'Subscribe'}
                </Button>
              </Box>
            </MotionBox>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
              Company
            </Typography>
            <Stack spacing={1.5}>
              <Link component={WouterLink} href="/company/team" color="text.secondary" underline="hover">
                Our Team
              </Link>
              <Link component={WouterLink} href="/company/culture" color="text.secondary" underline="hover">
                Culture
              </Link>
              <Link component={WouterLink} href="/company/press" color="text.secondary" underline="hover">
                Press
              </Link>
              <Link component={WouterLink} href="/explore" color="text.secondary" underline="hover">
                Explore
              </Link>
              <Link component={WouterLink} href="/crypto-education" color="text.secondary" underline="hover">
                Crypto Education
              </Link>
            </Stack>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
              Investments
            </Typography>
            <Stack spacing={1.5}>
              <Link component={WouterLink} href="/properties" color="text.secondary" underline="hover">
                All Properties
              </Link>
              <Link component={WouterLink} href="/properties/residential" color="text.secondary" underline="hover">
                Residential
              </Link>
              <Link component={WouterLink} href="/properties/commercial" color="text.secondary" underline="hover">
                Commercial
              </Link>
              <Link component={WouterLink} href="/properties/industrial" color="text.secondary" underline="hover">
                Industrial
              </Link>
              <Link component={WouterLink} href="/properties/land" color="text.secondary" underline="hover">
                Land
              </Link>
            </Stack>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
              Support
            </Typography>
            <Stack spacing={1.5}>
              <Link component={WouterLink} href="/help-center" color="text.secondary" underline="hover">
                Help Center
              </Link>
              <Link component={WouterLink} href="/faqs" color="text.secondary" underline="hover">
                FAQs
              </Link>
              <Link component={WouterLink} href="/contact" color="text.secondary" underline="hover">
                Contact Us
              </Link>
            </Stack>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
              Legal
            </Typography>
            <Stack spacing={1.5}>
              <Link component={WouterLink} href="/legal/privacy-policy" color="text.secondary" underline="hover">
                Privacy Policy
              </Link>
              <Link component={WouterLink} href="/legal/terms-of-service" color="text.secondary" underline="hover">
                Terms of Service
              </Link>
              <Link component={WouterLink} href="/legal/cookies-policy" color="text.secondary" underline="hover">
                Cookies Policy
              </Link>
              <Link component={WouterLink} href="/legal/investor-risk-disclosure" color="text.secondary" underline="hover">
                Investor Risk Disclosure
              </Link>
            </Stack>
          </Grid>
        </Grid>
        
        <Divider sx={{ mt: 6, mb: 4 }} />
        
        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} iREVA. All rights reserved.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-end' }}>
              <MotionBox
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <Facebook sx={{ color: 'text.secondary' }} />
                </Link>
              </MotionBox>
              
              <MotionBox
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter sx={{ color: 'text.secondary' }} />
                </Link>
              </MotionBox>
              
              <MotionBox
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <Instagram sx={{ color: 'text.secondary' }} />
                </Link>
              </MotionBox>
              
              <MotionBox
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <LinkedIn sx={{ color: 'text.secondary' }} />
                </Link>
              </MotionBox>
              
              <MotionBox
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                  <YouTube sx={{ color: 'text.secondary' }} />
                </Link>
              </MotionBox>
              
              <MotionBox
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Link href="mailto:info@ireva.com">
                  <Email sx={{ color: 'text.secondary' }} />
                </Link>
              </MotionBox>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;