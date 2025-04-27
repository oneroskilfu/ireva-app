import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Container, Typography, Box, Breadcrumbs, Link, Alert } from '@mui/material';
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
          Investor Risk Disclosure
        </Typography>

        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="body1">
            <strong>IMPORTANT:</strong> Investing in real estate and using cryptocurrency involves significant risks. This document provides information about those risks, but it is not exhaustive. You should carefully consider whether such investments are suitable for you in light of your financial condition and ability to bear the risks involved.
          </Typography>
        </Alert>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Last Updated: April 27, 2025
          </Typography>
          
          <Typography variant="body1" paragraph>
            This Investor Risk Disclosure document outlines the key risks associated with investing through the iREVA platform.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            General Investment Risks
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Loss of Principal:</strong> All investments involve the risk of losing some or all of your invested capital. Real estate investments are not insured by any government or private agency.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>No Guaranteed Returns:</strong> Past performance is not indicative of future results. Any projected returns, whether explicitly stated or implied, are estimates and not guarantees of actual performance.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Illiquidity:</strong> Real estate investments are generally illiquid, meaning you cannot readily convert them to cash. The investment periods are typically long-term (5+ years), and early withdrawal options may be limited or unavailable.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Economic Risks:</strong> Economic conditions, such as recessions, inflation, interest rate changes, and global economic events, can negatively impact real estate values and investment performance.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Real Estate Specific Risks
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Market Volatility:</strong> Real estate markets can be volatile and affected by various factors, including local economic conditions, property supply and demand, and neighborhood changes.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Property Management Risks:</strong> Poor property management can lead to decreased property values, higher vacancy rates, and lower returns.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Development Risks:</strong> For properties under development, risks include construction delays, cost overruns, zoning issues, and failure to secure necessary permits or approvals.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Regulatory Risks:</strong> Changes in real estate laws, zoning regulations, property taxes, or environmental regulations can adversely affect property values and investment returns.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Environmental Risks:</strong> Properties may be affected by environmental issues such as contamination, natural disasters, or climate change, which can lead to significant remediation costs or property devaluation.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Cryptocurrency and Blockchain Risks
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Volatility:</strong> Cryptocurrencies are highly volatile, with values that can fluctuate dramatically over short periods. This volatility can affect the value of your investments and the stability of transactions.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Technical Risks:</strong> Blockchain technology is relatively new and evolving. Technical issues, security vulnerabilities, or protocol changes could impact the functionality or security of blockchain-based investments.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Regulatory Uncertainty:</strong> Cryptocurrency regulations vary by country and are subject to change. New regulations could restrict or prohibit cryptocurrency transactions or ownership in certain jurisdictions.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Smart Contract Risks:</strong> Smart contracts may contain bugs, vulnerabilities, or unintended functions that could lead to loss of funds or other adverse outcomes.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Wallet Security:</strong> If you use cryptocurrency for investments, your digital assets' security depends on maintaining the security of your private keys and wallet. Loss of private keys can result in permanent loss of funds.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Platform and Operational Risks
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Platform Risks:</strong> iREVA's platform may experience technical issues, downtime, or security breaches that could affect your ability to access or manage your investments.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Counterparty Risks:</strong> Investments involve reliance on various third parties, including property managers, developers, and service providers. The failure of these parties to fulfill their obligations could negatively impact investments.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Business Continuity Risk:</strong> iREVA's ability to continue operations could be affected by various factors, including financial viability, regulatory changes, or major market disruptions.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            African Market Specific Risks
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Political and Economic Instability:</strong> Political changes, economic fluctuations, or social unrest in African countries can impact real estate markets and investment performance.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Currency Risks:</strong> Fluctuations in local currencies against major currencies like the USD can affect the value of investments when converted back to your home currency.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Legal and Regulatory Environment:</strong> Legal systems and property rights may differ across African countries, potentially affecting investment security and enforcement of agreements.
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Infrastructure Challenges:</strong> Inadequate infrastructure (roads, utilities, telecommunications) in some areas can affect property values and development projects.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Investment Suitability
          </Typography>
          
          <Typography variant="body1" paragraph>
            Before investing through iREVA, you should consider:
          </Typography>
          
          <ul>
            <li>
              <Typography variant="body1" paragraph>
                Your financial situation, including income, assets, liabilities, and other investments
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Your investment objectives and time horizon
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                Your risk tolerance and ability to sustain losses
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                The proportion of your overall portfolio that will be allocated to these investments
              </Typography>
            </li>
          </ul>
          
          <Typography variant="body1" paragraph>
            We strongly recommend consulting with financial, legal, and tax advisors before making investment decisions.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Acknowledgment
          </Typography>
          
          <Typography variant="body1" paragraph>
            By investing through iREVA, you acknowledge that you have read and understood this Investor Risk Disclosure, and you accept the risks involved in the investments you choose to make.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Contact Us
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you have any questions about investment risks, please contact us at:
          </Typography>
          
          <Typography variant="body1" paragraph>
            Email: investments@ireva.com
          </Typography>
          
          <Typography variant="body1" paragraph>
            Address: 123 Investment Street, Lagos, Nigeria
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
};

export default InvestorRiskDisclosurePage;