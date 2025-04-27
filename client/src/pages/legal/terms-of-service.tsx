import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Container, Typography, Box, Breadcrumbs, Link, Divider } from '@mui/material';
import { Link as WouterLink } from 'wouter';

const TermsOfServicePage: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={WouterLink} href="/" underline="hover" color="inherit">
            Home
          </Link>
          <Typography color="text.primary">Terms of Service</Typography>
        </Breadcrumbs>

        <Typography variant="h2" component="h1" gutterBottom sx={{ mb: 4 }}>
          iREVA Terms of Service
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Effective Date: April 1, 2025
          </Typography>
          
          <Typography variant="body1" paragraph>
            Welcome to iREVA!
            These Terms of Service ("Terms") govern your use of the iREVA platform and services ("Services").
          </Typography>
          
          <Typography variant="body1" paragraph>
            By accessing or using iREVA, you agree to be bound by these Terms. If you do not agree, do not use the platform.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            1. Eligibility
          </Typography>
          
          <Typography variant="body1" paragraph>
            You must:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">Be at least 18 years old.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Have full legal capacity to form binding contracts.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Not be restricted from investing under applicable laws (including securities laws).</Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            You must also complete all required KYC (Know Your Customer) verification processes.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            2. Account Registration
          </Typography>
          
          <Typography variant="body1" paragraph>
            You agree to:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">Provide accurate and complete information.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Maintain confidentiality of your login credentials.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Notify us immediately if you suspect unauthorized use.</Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            You are responsible for all activities conducted under your account.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            3. Investment Disclosures
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">All investments involve risks, including possible loss of capital.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Past performance does not guarantee future results.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">You are solely responsible for your investment decisions.</Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            You should consult independent financial or legal advisors if needed.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            4. Platform Use
          </Typography>
          
          <Typography variant="body1" paragraph>
            You agree not to:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">Violate any law, regulation, or these Terms.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Use the platform to transmit malicious software.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Interfere with the functionality or security of the platform.</Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            We may suspend or terminate your account if you breach these Terms.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            5. Fees
          </Typography>
          
          <Typography variant="body1" paragraph>
            iREVA may charge platform fees, transaction fees, or asset management fees.
            Details will be disclosed clearly before investment.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            6. Crypto Transactions
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you invest using cryptocurrencies:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">You accept the inherent volatility and risk.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Blockchain transactions are irreversible.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">iREVA is not responsible for lost private keys or incorrect wallet addresses.</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            7. No Financial Advice
          </Typography>
          
          <Typography variant="body1" paragraph>
            iREVA is a technology platform.
            We do not provide investment, tax, or legal advice.
          </Typography>
          
          <Typography variant="body1" paragraph>
            You acknowledge that any investment decision is made solely at your own risk.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            8. Limitation of Liability
          </Typography>
          
          <Typography variant="body1" paragraph>
            To the maximum extent permitted by law:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">iREVA shall not be liable for indirect, incidental, special, or consequential damages.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Our liability shall not exceed the fees paid by you to us over the past 12 months.</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            9. Amendments
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may update these Terms at any time.
            Material changes will be communicated via email or platform notification.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            10. Contact
          </Typography>
          
          <Typography variant="body1" paragraph>
            For questions about these Terms:
            Email: ireva.investments@gmail.com
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
};

export default TermsOfServicePage;