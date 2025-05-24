import React from 'react';
import { Box, Container, Typography, Link, Divider, useTheme } from '@mui/material';
import { Link as WouterLink } from 'wouter';
import { Facebook, Twitter, Instagram, LinkedIn, YouTube, Email } from '@mui/icons-material';

export default function Footer() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: `1px solid ${theme.palette.divider}`,
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            mb: 4
          }}
        >
          {/* Company and Newsletter */}
          <Box sx={{ maxWidth: 350, mb: { xs: 4, md: 0 } }}>
            <Typography variant="h5" color="text.primary" gutterBottom fontWeight="bold">
              iREVA
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Africa's premier real estate investment platform leveraging blockchain technology to democratize property investments.
            </Typography>
          </Box>

          {/* Nav Links */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 4, md: 6 } }}>
            {/* Company Links */}
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
                Company
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
              </Box>
            </Box>

            {/* Legal Links */}
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
                Legal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link component={WouterLink} href="/legal/privacy-policy" color="text.secondary" underline="hover">
                  Privacy Policy
                </Link>
                <Link component={WouterLink} href="/legal/terms-of-service" color="text.secondary" underline="hover">
                  Terms of Service
                </Link>
                <Link component={WouterLink} href="/legal/investor-risk-disclosure" color="text.secondary" underline="hover">
                  Risk Disclosure
                </Link>
                <Link component={WouterLink} href="/legal" color="text.secondary" underline="hover">
                  Legal Center
                </Link>
              </Box>
            </Box>

            {/* Support Links */}
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
                Support
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link component={WouterLink} href="/help-center" color="text.secondary" underline="hover">
                  Help Center
                </Link>
                <Link component={WouterLink} href="/faqs" color="text.secondary" underline="hover">
                  FAQs
                </Link>
                <Link component={WouterLink} href="/contact" color="text.secondary" underline="hover">
                  Contact Us
                </Link>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Copyright and Social */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'center', md: 'flex-start' },
          gap: 2
        }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} iREVA. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="https://facebook.com" target="_blank" rel="noopener" color="text.secondary">
              <Facebook />
            </Link>
            <Link href="https://twitter.com" target="_blank" rel="noopener" color="text.secondary">
              <Twitter />
            </Link>
            <Link href="https://instagram.com" target="_blank" rel="noopener" color="text.secondary">
              <Instagram />
            </Link>
            <Link href="https://linkedin.com" target="_blank" rel="noopener" color="text.secondary">
              <LinkedIn />
            </Link>
            <Link href="https://youtube.com" target="_blank" rel="noopener" color="text.secondary">
              <YouTube />
            </Link>
            <Link href="mailto:ireva.investments@gmail.com" color="text.secondary">
              <Email />
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}