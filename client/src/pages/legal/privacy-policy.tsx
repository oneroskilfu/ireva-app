import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Container, Typography, Box, Breadcrumbs, Link } from '@mui/material';
import { Link as WouterLink } from 'wouter';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={WouterLink} href="/" underline="hover" color="inherit">
            Home
          </Link>
          <Typography color="text.primary">Privacy Policy</Typography>
        </Breadcrumbs>

        <Typography variant="h2" component="h1" gutterBottom sx={{ mb: 4 }}>
          Privacy Policy
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Last Updated: April 27, 2025
          </Typography>
          
          <Typography variant="body1" paragraph>
            iREVA ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Information We Collect
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Personal Data:</strong> We collect personal information that you voluntarily provide to us when you register on our platform, express interest in obtaining information about us or our products and services, or otherwise contact us. This information may include:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                Contact information (name, email address, phone number)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Identity verification documents (government IDs, proof of address)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Financial information (bank account details, investment history)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Cryptocurrency wallet addresses
              </Typography>
            </li>
          </ul>
          
          <Typography variant="body1" paragraph>
            <strong>Automatically Collected Data:</strong> When you access or use our platform, we automatically collect certain information, including:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                Device and browsing information (IP address, browser type, operating system)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Usage patterns and preferences
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Location data (if permitted by your device settings)
              </Typography>
            </li>
          </ul>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            How We Use Your Information
          </Typography>
          
          <Typography variant="body1" paragraph>
            We use the information we collect to:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                Provide, maintain, and improve our services
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Process transactions and manage your account
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Comply with legal and regulatory requirements, including KYC and AML obligations
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Send you updates, security alerts, and support messages
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Personalize your experience and provide tailored content
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Analyze usage patterns to improve our platform
              </Typography>
            </li>
          </ul>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Information Sharing and Disclosure
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may share your information with:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Service Providers:</strong> Third parties that perform services on our behalf, such as payment processing, data analysis, email delivery, and customer service.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Business Partners:</strong> Trusted companies we work with to provide property investments and related services.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Legal Requirements:</strong> When we believe disclosure is necessary to comply with a legal obligation, protect our rights, or protect the safety of our users or the public.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.
              </Typography>
            </li>
          </ul>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Data Security
          </Typography>
          
          <Typography variant="body1" paragraph>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Your Rights
          </Typography>
          
          <Typography variant="body1" paragraph>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                Right to access, correct, or delete your personal data
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Right to restrict or object to our processing of your data
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Right to data portability
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Right to withdraw consent (where processing is based on consent)
              </Typography>
            </li>
          </ul>
          
          <Typography variant="body1" paragraph>
            To exercise these rights, please contact us using the details provided below.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Contact Us
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
          </Typography>
          
          <Typography variant="body1" paragraph>
            Email: privacy@ireva.com
          </Typography>
          
          <Typography variant="body1" paragraph>
            Address: 123 Investment Street, Lagos, Nigeria
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
};

export default PrivacyPolicyPage;