import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Container, Typography, Box, Breadcrumbs, Link, Divider } from '@mui/material';
import { Link as WouterLink } from 'wouter';

const CookiesPolicyPage: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={WouterLink} href="/" underline="hover" color="inherit">
            Home
          </Link>
          <Typography color="text.primary">Cookies Policy</Typography>
        </Breadcrumbs>

        <Typography variant="h2" component="h1" gutterBottom sx={{ mb: 4 }}>
          iREVA Cookies Policy
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Effective Date: April 1, 2025
          </Typography>
          
          <Typography variant="body1" paragraph>
            This Cookies Policy explains how iREVA uses cookies and similar technologies on our platform.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            1. What Are Cookies?
          </Typography>
          
          <Typography variant="body1" paragraph>
            Cookies are small text files placed on your device when you visit our website or use our platform.
            They help us improve your user experience, understand usage patterns, and personalize services.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            2. Types of Cookies We Use
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">Essential Cookies: Necessary for basic site functionality.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Analytics Cookies: Help us measure and improve performance.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Functional Cookies: Personalize your experience based on preferences.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Advertising Cookies: Deliver targeted marketing based on your interests (only if consented).</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            3. Managing Cookies
          </Typography>
          
          <Typography variant="body1" paragraph>
            You can set your browser to refuse all or some cookies.
            However, disabling cookies may limit your ability to use certain features.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            4. Third-Party Cookies
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may allow third-party services (e.g., Google Analytics) to place cookies.
            Their use of cookies is governed by their own privacy policies.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            5. Changes to This Policy
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may update our Cookies Policy occasionally.
            Updates will be posted with the effective date.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            6. Contact
          </Typography>
          
          <Typography variant="body1" paragraph>
            For any questions about this Cookies Policy:
            Email: ireva.investments@gmail.com
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
};

export default CookiesPolicyPage;