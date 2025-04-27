import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Container, Typography, Box, Breadcrumbs, Link, Divider } from '@mui/material';
import { Link as WouterLink } from 'wouter';

const InvestorRiskDisclosurePage: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={WouterLink} href="/" underline="hover" color="inherit">
            Home
          </Link>
          <Typography color="text.primary">Investor Risk Disclosure</Typography>
        </Breadcrumbs>

        <Typography variant="h2" component="h1" gutterBottom sx={{ mb: 4 }}>
          iREVA Investor Risk Disclosure
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Effective Date: April 1, 2025
          </Typography>
          
          <Typography variant="body1" paragraph>
            Investing through iREVA involves significant risk.
            Please read this Risk Disclosure carefully before investing.
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
            PLEASE READ THIS DISCLOSURE CAREFULLY BEFORE MAKING ANY INVESTMENT DECISIONS.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            1. No Guarantee of Returns
          </Typography>
          
          <Typography variant="body1" paragraph>
            Investments are not guaranteed.
            You may lose some or all of your investment.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            2. Illiquidity Risk
          </Typography>
          
          <Typography variant="body1" paragraph>
            Real estate investments may be illiquid for extended periods.
            There may be no secondary market to sell your investment quickly.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            3. Market Risk
          </Typography>
          
          <Typography variant="body1" paragraph>
            Factors such as market volatility, regulatory changes, and economic downturns can negatively affect investment performance.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            4. Crypto-Specific Risks
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you invest using cryptocurrency:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">Crypto values are volatile.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Regulatory changes could impact your investment.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">You must protect your own crypto assets (private keys, wallets).</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            5. Regulatory Risk
          </Typography>
          
          <Typography variant="body1" paragraph>
            Real estate crowdfunding laws and crypto regulations may evolve.
            These changes may impact your rights or the platform's operations.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            6. No Professional Advice
          </Typography>
          
          <Typography variant="body1" paragraph>
            iREVA does not provide financial, tax, or legal advice.
            We strongly encourage consulting with independent advisors before investing.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            7. Acknowledgment
          </Typography>
          
          <Typography variant="body1" paragraph>
            By investing through iREVA, you acknowledge that you understand and accept these risks.
          </Typography>
        </Box>

        <Box sx={{ mb: 4, p: 4, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
            IMPORTANT: This risk disclosure does not contain all information about the risks of investing through iREVA. Each investment opportunity has its own specific risks that will be detailed in the investment documentation.
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you have any questions about this risk disclosure or the risks associated with a specific investment opportunity, please contact us before investing:
          </Typography>
          
          <Typography variant="body1" paragraph>
            iREVA Support Team<br />
            Email: ireva.investments@gmail.com
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
};

export default InvestorRiskDisclosurePage;