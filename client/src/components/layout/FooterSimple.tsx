import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import { Link as WouterLink } from 'wouter';

export default function FooterSimple() {
  return (
    <Box component="footer" sx={{ py: 3, backgroundColor: '#f9f9f9', mt: 'auto' }}>
      <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 1 }}>
          &copy; {new Date().getFullYear()} iREVA. All rights reserved.
        </Typography>
        <Box display="flex" gap={2}>
          <Link component={WouterLink} href="/legal/privacy-policy" color="inherit" underline="hover">
            Privacy Policy
          </Link>
          <Link component={WouterLink} href="/legal/terms-of-service" color="inherit" underline="hover">
            Terms of Service
          </Link>
          <Link component={WouterLink} href="/legal/investor-risk-disclosure" color="inherit" underline="hover">
            Risk Disclosure
          </Link>
          <Link component={WouterLink} href="/legal" color="inherit" underline="hover">
            Legal Center
          </Link>
        </Box>
      </Container>
    </Box>
  );
}