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

const TermsPage = () => {
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
          <Typography color="text.primary">Terms of Service</Typography>
        </Breadcrumbs>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              iREVA Terms of Service
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
              Welcome to iREVA. These Terms of Service ("Terms") govern your access to and use of the iREVA platform, including our website, mobile application, and services (collectively, the "Platform").
            </Typography>
            <Typography paragraph>
              By accessing or using our Platform, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Platform.
            </Typography>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              2. Eligibility
            </Typography>
            <Typography paragraph>
              To use our Platform, you must:
            </Typography>
            <ul>
              <Typography component="li">Be at least 18 years old</Typography>
              <Typography component="li">Have the legal capacity to enter into a binding contract</Typography>
              <Typography component="li">Not be prohibited from using the Platform under the laws of your jurisdiction</Typography>
              <Typography component="li">Complete our Know Your Customer (KYC) and Anti-Money Laundering (AML) verification process if you wish to invest</Typography>
            </ul>
            <Typography paragraph>
              By using our Platform, you represent and warrant that you meet all eligibility requirements.
            </Typography>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              3. Account Registration
            </Typography>
            <Typography paragraph>
              To access certain features of our Platform, you must create an account. When you register, you agree to:
            </Typography>
            <ul>
              <Typography component="li">Provide accurate, current, and complete information</Typography>
              <Typography component="li">Maintain and promptly update your account information</Typography>
              <Typography component="li">Keep your password secure and confidential</Typography>
              <Typography component="li">Notify us immediately of any unauthorized access to your account</Typography>
              <Typography component="li">Be responsible for all activities that occur under your account</Typography>
            </ul>
            <Typography paragraph>
              We reserve the right to suspend or terminate your account if any information provided is inaccurate, misleading, or incomplete.
            </Typography>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              4. Investment Services
            </Typography>
            <Typography paragraph>
              Our Platform facilitates investments in real estate properties in African markets. By using our investment services, you acknowledge and agree that:
            </Typography>
            <ul>
              <Typography component="li">All investments involve risk, including the potential loss of principal</Typography>
              <Typography component="li">Past performance is not indicative of future results</Typography>
              <Typography component="li">We do not provide investment, financial, legal, or tax advice</Typography>
              <Typography component="li">You are solely responsible for your investment decisions</Typography>
              <Typography component="li">You have reviewed and understand the investment documents for each property</Typography>
              <Typography component="li">Investments are subject to a minimum investment amount and holding period</Typography>
              <Typography component="li">We may impose limitations on investments based on regulatory requirements</Typography>
            </ul>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              5. Fees and Payments
            </Typography>
            <Typography paragraph>
              By investing through our Platform, you agree to pay all applicable fees as described in the offering documents for each investment opportunity. These may include:
            </Typography>
            <ul>
              <Typography component="li">Platform fees</Typography>
              <Typography component="li">Asset management fees</Typography>
              <Typography component="li">Performance fees</Typography>
              <Typography component="li">Transaction fees</Typography>
              <Typography component="li">Early redemption fees</Typography>
            </ul>
            <Typography paragraph>
              Payment processing on our Platform is handled by third-party payment processors. By using our Platform, you authorize us to charge your selected payment method for any investments made and fees incurred.
            </Typography>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              6. Cryptocurrency Transactions
            </Typography>
            <Typography paragraph>
              Our Platform supports investments using certain cryptocurrencies. By using this feature, you acknowledge and agree that:
            </Typography>
            <ul>
              <Typography component="li">Cryptocurrency transactions are irreversible once confirmed on the blockchain</Typography>
              <Typography component="li">You are responsible for providing the correct wallet addresses</Typography>
              <Typography component="li">Cryptocurrency values can be highly volatile</Typography>
              <Typography component="li">We may convert cryptocurrencies to fiat currency at prevailing market rates</Typography>
              <Typography component="li">Cryptocurrency transactions are subject to additional KYC/AML requirements</Typography>
              <Typography component="li">You will comply with all applicable laws regarding cryptocurrency transactions</Typography>
            </ul>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              7. User Conduct
            </Typography>
            <Typography paragraph>
              When using our Platform, you agree not to:
            </Typography>
            <ul>
              <Typography component="li">Violate any applicable law, regulation, or these Terms</Typography>
              <Typography component="li">Provide false, inaccurate, or misleading information</Typography>
              <Typography component="li">Impersonate any person or entity</Typography>
              <Typography component="li">Interfere with or disrupt the operation of the Platform</Typography>
              <Typography component="li">Attempt to gain unauthorized access to any part of the Platform</Typography>
              <Typography component="li">Use the Platform for fraudulent or illegal purposes</Typography>
              <Typography component="li">Engage in any activity that could damage, disable, or impair the Platform</Typography>
              <Typography component="li">Use any data mining, robots, or similar data gathering methods</Typography>
            </ul>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              8. Intellectual Property
            </Typography>
            <Typography paragraph>
              All content on our Platform, including text, graphics, logos, icons, images, audio clips, and software, is the property of iREVA or our licensors and is protected by copyright, trademark, and other intellectual property laws.
            </Typography>
            <Typography paragraph>
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any content from our Platform without our written permission.
            </Typography>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              9. Limitation of Liability
            </Typography>
            <Typography paragraph>
              To the maximum extent permitted by law, iREVA and its affiliates, officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, arising out of or in connection with your use of the Platform.
            </Typography>
            <Typography paragraph>
              Our total liability for all claims arising from or related to these Terms or your use of the Platform shall not exceed the amount you have invested through the Platform in the 12 months preceding the claim.
            </Typography>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              10. Indemnification
            </Typography>
            <Typography paragraph>
              You agree to indemnify, defend, and hold harmless iREVA and its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, or expenses, including reasonable attorneys' fees, arising out of or in any way connected with your access to or use of the Platform, your violation of these Terms, or your violation of any rights of another.
            </Typography>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              11. Governing Law and Dispute Resolution
            </Typography>
            <Typography paragraph>
              These Terms shall be governed by and construed in accordance with the laws of Nigeria, without regard to its conflict of law principles.
            </Typography>
            <Typography paragraph>
              Any dispute arising out of or relating to these Terms or your use of the Platform shall be resolved through binding arbitration in Lagos, Nigeria, in accordance with the rules of the Lagos Court of Arbitration. The decision of the arbitrator shall be final and binding.
            </Typography>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              12. Changes to These Terms
            </Typography>
            <Typography paragraph>
              We may update these Terms from time to time. We will notify you of material changes by posting the updated Terms on our Platform and, where required by law, seeking your consent. Your continued use of the Platform after such changes constitutes your acceptance of the revised Terms.
            </Typography>
          </Box>

          <Box sx={{ my: 4 }}>
            <Typography variant="h6" gutterBottom>
              13. Contact Information
            </Typography>
            <Typography paragraph>
              If you have questions about these Terms, please contact us at:
            </Typography>
            <Typography paragraph>
              Email: legal@ireva.com<br />
              Address: 123 Investment Avenue, Lagos, Nigeria<br />
              Phone: +234 123 456 7890
            </Typography>
          </Box>

          <Box sx={{ mt: 6, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="subtitle2" align="center">
              By using the iREVA platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </Typography>
            <Typography variant="subtitle2" align="center" sx={{ mt: 2 }}>
              Last Updated: {currentDate}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default TermsPage;