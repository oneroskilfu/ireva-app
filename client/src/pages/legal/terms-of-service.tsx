import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Container, Typography, Box, Breadcrumbs, Link } from '@mui/material';
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
          Terms of Service
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Last Updated: April 27, 2025
          </Typography>
          
          <Typography variant="body1" paragraph>
            Please read these Terms of Service ("Terms") carefully before using the iREVA platform and services.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Acceptance of Terms
          </Typography>
          
          <Typography variant="body1" paragraph>
            By accessing or using our platform, you agree to be bound by these Terms and our Privacy Policy. If you do not agree with any part of these Terms, you may not use our services.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Eligibility
          </Typography>
          
          <Typography variant="body1" paragraph>
            You must be at least 18 years old and have the legal capacity to enter into a binding agreement to use our services. By using our platform, you represent and warrant that you meet these requirements.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Certain investment opportunities may require you to be an accredited investor or meet specific eligibility criteria. You are responsible for ensuring that you meet all applicable requirements for any investment you participate in.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Account Registration and Security
          </Typography>
          
          <Typography variant="body1" paragraph>
            To access certain features of our platform, you must create an account. You are responsible for:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                Providing accurate, current, and complete information during registration
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Maintaining the confidentiality of your account credentials
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                All activities that occur under your account
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Notifying us immediately of any unauthorized use of your account
              </Typography>
            </li>
          </ul>
          
          <Typography variant="body1" paragraph>
            We reserve the right to refuse service, terminate accounts, or cancel transactions at our discretion.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Investment Risks
          </Typography>
          
          <Typography variant="body1" paragraph>
            Investing in real estate and using cryptocurrency involves significant risks, including:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                Loss of principal investment
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Illiquidity and difficulty in exiting investments
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Market fluctuations and economic downturns
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Regulatory changes that may affect real estate or cryptocurrency
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Cryptocurrency volatility and technical risks
              </Typography>
            </li>
          </ul>
          
          <Typography variant="body1" paragraph>
            You should carefully review our Investor Risk Disclosure and conduct your own due diligence before making any investment. We strongly recommend consulting with financial, legal, and tax advisors.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            KYC and AML Compliance
          </Typography>
          
          <Typography variant="body1" paragraph>
            You agree to comply with our Know Your Customer (KYC) and Anti-Money Laundering (AML) procedures, which may include:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                Providing identification documents and personal information
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Verifying the source of funds used for investments
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Ongoing monitoring of transactions
              </Typography>
            </li>
          </ul>
          
          <Typography variant="body1" paragraph>
            Failure to complete these procedures may result in limited access to our services or termination of your account.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Intellectual Property
          </Typography>
          
          <Typography variant="body1" paragraph>
            All content, features, and functionality of our platform, including text, graphics, logos, icons, and software, are owned by iREVA or our licensors and are protected by copyright, trademark, and other intellectual property laws.
          </Typography>
          
          <Typography variant="body1" paragraph>
            You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, or store any material from our platform without our prior written consent.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Limitation of Liability
          </Typography>
          
          <Typography variant="body1" paragraph>
            To the maximum extent permitted by law, iREVA and our affiliates, officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to your use of our platform and services, even if advised of the possibility of such damages.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Our total liability for all claims arising from or related to these Terms shall not exceed the amount you have paid us in the six months preceding the claim.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Governing Law
          </Typography>
          
          <Typography variant="body1" paragraph>
            These Terms shall be governed by and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions. Any dispute arising from these Terms shall be resolved exclusively in the courts of Nigeria.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Changes to Terms
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may update these Terms from time to time. We will notify you of any material changes by posting the new Terms on our platform or by sending you an email. Your continued use of our services after such changes constitutes your acceptance of the revised Terms.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Contact Us
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you have any questions about these Terms, please contact us at:
          </Typography>
          
          <Typography variant="body1" paragraph>
            Email: legal@ireva.com
          </Typography>
          
          <Typography variant="body1" paragraph>
            Address: 123 Investment Street, Lagos, Nigeria
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
};

export default TermsOfServicePage;