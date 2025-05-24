import React from 'react';
import { 
  Typography, 
  Box, 
  Container, 
  Paper, 
  Button,
  Breadcrumbs,
  Link
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import MainLayout from '../components/layouts/MainLayout';

const PrivacyPolicyPage = () => {
  const currentDate = "April 28, 2025";

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link color="inherit" href="/">
            Home
          </Link>
          <Link color="inherit" href="/legal">
            Legal
          </Link>
          <Typography color="text.primary">Privacy Policy</Typography>
        </Breadcrumbs>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              iREVA Privacy Policy
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              sx={{ borderRadius: 2 }}
            >
              Download PDF
            </Button>
          </Box>

          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Effective Date: {currentDate}
          </Typography>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              1. Introduction
            </Typography>
            <Typography paragraph>
              Welcome to iREVA ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, mobile application, or use our services.
            </Typography>
            <Typography paragraph>
              This Privacy Policy applies to all users of the iREVA platform, including investors, property developers, and visitors. By accessing or using our platform, you agree to the terms outlined in this Privacy Policy.
            </Typography>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              2. Information We Collect
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              2.1 Personal Information
            </Typography>
            <Typography paragraph>
              We collect personal information that you voluntarily provide to us, including but not limited to:
            </Typography>
            <ul>
              <Typography component="li">Contact information (name, email address, phone number, address)</Typography>
              <Typography component="li">Account credentials (username, password)</Typography>
              <Typography component="li">Financial information (bank account details, payment card information)</Typography>
              <Typography component="li">Identification documents (passport, driver's license, national ID)</Typography>
              <Typography component="li">Tax identification numbers and related documentation</Typography>
              <Typography component="li">Employment information</Typography>
              <Typography component="li">Investment preferences and history</Typography>
            </ul>

            <Typography variant="subtitle2" gutterBottom>
              2.2 Automatically Collected Information
            </Typography>
            <Typography paragraph>
              When you access our platform, we automatically collect certain information, including:
            </Typography>
            <ul>
              <Typography component="li">Device information (IP address, browser type, operating system)</Typography>
              <Typography component="li">Usage information (pages visited, time spent on platform)</Typography>
              <Typography component="li">Location information (with your permission)</Typography>
              <Typography component="li">Cookies and similar tracking technologies</Typography>
            </ul>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              3. How We Use Your Information
            </Typography>
            <Typography paragraph>
              We use the information we collect for various purposes, including to:
            </Typography>
            <ul>
              <Typography component="li">Provide, maintain, and improve our services</Typography>
              <Typography component="li">Process investments and transactions</Typography>
              <Typography component="li">Verify your identity and prevent fraud</Typography>
              <Typography component="li">Comply with legal and regulatory requirements</Typography>
              <Typography component="li">Communicate with you about your account and investments</Typography>
              <Typography component="li">Send you marketing communications (with your consent)</Typography>
              <Typography component="li">Analyze usage patterns to enhance user experience</Typography>
              <Typography component="li">Conduct KYC (Know Your Customer) and AML (Anti-Money Laundering) checks</Typography>
            </ul>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              4. Sharing Your Information
            </Typography>
            <Typography paragraph>
              We may share your information with third parties in the following circumstances:
            </Typography>
            <ul>
              <Typography component="li">With service providers who help us operate our platform</Typography>
              <Typography component="li">With financial institutions to process transactions</Typography>
              <Typography component="li">With regulatory authorities as required by law</Typography>
              <Typography component="li">With property developers for investment-related purposes</Typography>
              <Typography component="li">With professional advisors (lawyers, accountants, auditors)</Typography>
              <Typography component="li">In connection with a business transaction (merger, acquisition, sale)</Typography>
              <Typography component="li">When you have given consent</Typography>
            </ul>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              5. Data Security
            </Typography>
            <Typography paragraph>
              We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. These measures include encryption, access controls, regular security assessments, and staff training.
            </Typography>
            <Typography paragraph>
              While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
            </Typography>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              6. Data Retention
            </Typography>
            <Typography paragraph>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. The criteria used to determine our retention periods include:
            </Typography>
            <ul>
              <Typography component="li">The duration of our relationship with you</Typography>
              <Typography component="li">Legal obligations to retain data for certain periods</Typography>
              <Typography component="li">Statute of limitations under applicable law</Typography>
              <Typography component="li">Ongoing or potential legal disputes</Typography>
            </ul>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              7. Your Rights
            </Typography>
            <Typography paragraph>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </Typography>
            <ul>
              <Typography component="li">Right to access your personal information</Typography>
              <Typography component="li">Right to correct inaccurate information</Typography>
              <Typography component="li">Right to delete your personal information</Typography>
              <Typography component="li">Right to restrict or object to processing</Typography>
              <Typography component="li">Right to data portability</Typography>
              <Typography component="li">Right to withdraw consent</Typography>
            </ul>
            <Typography paragraph>
              To exercise these rights, please contact us using the information in the "Contact Us" section below.
            </Typography>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              8. International Data Transfers
            </Typography>
            <Typography paragraph>
              Your information may be transferred to, stored, and processed in countries outside your country of residence. We ensure appropriate safeguards are in place to protect your information when transferred internationally.
            </Typography>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              9. Changes to This Privacy Policy
            </Typography>
            <Typography paragraph>
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on our platform and, where required by law, seeking your consent. We encourage you to review this Privacy Policy periodically.
            </Typography>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              10. Contact Us
            </Typography>
            <Typography paragraph>
              If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
            </Typography>
            <Typography paragraph>
              Email: privacy@ireva.com<br />
              Address: 123 Investment Avenue, Lagos, Nigeria<br />
              Phone: +234 123 456 7890
            </Typography>
          </Box>

          <Box sx={{ mt: 6, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="subtitle2" align="center">
              Last Updated: {currentDate}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default PrivacyPolicyPage;