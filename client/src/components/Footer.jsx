import React from 'react';
import { Link as RouterLink } from 'wouter';
import { Box, Typography, Link, Container, Grid, Divider } from '@mui/material';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer"
      sx={{ 
        bgcolor: '#f5f5f5',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              iREVA
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Africa's premier real estate investment platform, making property investment accessible for everyone.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Explore
            </Typography>
            <Link component={RouterLink} to="/simple" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/projects" color="inherit" display="block" sx={{ mb: 1 }}>
              Projects
            </Link>
            <Link component={RouterLink} to="/about" color="inherit" display="block" sx={{ mb: 1 }}>
              About Us
            </Link>
            <Link component={RouterLink} to="/contact" color="inherit" display="block" sx={{ mb: 1 }}>
              Contact
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Investor
            </Typography>
            <Link component={RouterLink} to="/investor/dashboard" color="inherit" display="block" sx={{ mb: 1 }}>
              Dashboard
            </Link>
            <Link component={RouterLink} to="/simple/transactions" color="inherit" display="block" sx={{ mb: 1 }}>
              Transactions
            </Link>
            <Link component={RouterLink} to="/simple/settings" color="inherit" display="block" sx={{ mb: 1 }}>
              Settings
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Link component={RouterLink} to="/simple/privacy-policy" color="inherit" display="block" sx={{ mb: 1 }}>
              Privacy Policy
            </Link>
            <Link component={RouterLink} to="/simple/terms" color="inherit" display="block" sx={{ mb: 1 }}>
              Terms of Service
            </Link>
            <Link component={RouterLink} to="/legal/investor-risk-disclosure" color="inherit" display="block" sx={{ mb: 1 }}>
              Risk Disclosure
            </Link>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} iREVA. All rights reserved.
          </Typography>
          <Box>
            <Link component={RouterLink} to="/simple/privacy-policy" color="inherit" sx={{ ml: 2 }}>
              Privacy
            </Link>
            <Link component={RouterLink} to="/simple/terms" color="inherit" sx={{ ml: 2 }}>
              Terms
            </Link>
            <Link component={RouterLink} to="/legal/cookies-policy" color="inherit" sx={{ ml: 2 }}>
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;