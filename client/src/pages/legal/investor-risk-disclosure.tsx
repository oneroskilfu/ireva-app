import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Link, 
  Divider, 
  Button, 
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link as WouterLink } from 'wouter';
import { FileDown, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const InvestorRiskDisclosurePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const effectiveDate = "April 1, 2025";

  // Function to handle PDF download
  const handleDownloadPdf = () => {
    window.open('/pdfs/investor-risk-disclosure.pdf', '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <Container maxWidth="md" sx={{ py: 8, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Link 
            component={WouterLink} 
            href="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <ArrowLeft size={18} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Back to Home
            </Typography>
          </Link>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, mb: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              Investor Risk Disclosure
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleDownloadPdf}
              startIcon={<FileDown size={18} />}
              sx={{ mt: 2 }}
            >
              Download PDF
            </Button>
            
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 3 }}>
              Effective Date: {effectiveDate}
            </Typography>
          </Box>

          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
            IMPORTANT: This document contains important information regarding the risks associated with investing in real estate through the iREVA platform. Please read it carefully before making any investment decisions.
          </Typography>
          
          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            1. General Investment Risks
          </Typography>
          
          <Typography variant="body1" paragraph>
            Investing in real estate through iREVA involves significant risks, including:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">
                <strong>Loss of Capital:</strong> You could lose some or all of your investment. Past performance is not indicative of future results.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Lack of Liquidity:</strong> Real estate investments are generally illiquid. There is no guaranteed secondary market for your investment. The 5-year maturity period means your capital will be committed for that duration.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Market Risks:</strong> Real estate markets can be volatile and affected by economic conditions, interest rates, and local market factors. Property values may decline.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Development Risks:</strong> Property development projects may face delays, cost overruns, or regulatory challenges.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            2. Risks Specific to African Real Estate Markets
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">
                <strong>Political/Regulatory Risk:</strong> Changes in government, regulations, or political instability may impact property rights, values, or development plans.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Currency Risk:</strong> Fluctuations in local currencies against your investment currency may affect your actual returns when converted back.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Infrastructure Limitations:</strong> Inadequate infrastructure may impact property development timelines or values.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Title/Ownership Risks:</strong> Despite our due diligence, property title issues can arise in certain markets.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            3. Platform-Specific Risks
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">
                <strong>Operational Risk:</strong> The iREVA platform is relatively new and its business model unproven over the long term.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Technology Risk:</strong> The platform relies on technology that may be subject to failures, breaches, or interruptions.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Concentration Risk:</strong> If you invest in multiple properties through iREVA, you may have concentration risk in a single platform.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            4. Cryptocurrency-Related Risks
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">
                <strong>Volatility:</strong> Cryptocurrencies experience significant price volatility that may affect the value of your investment when converting between crypto and fiat currencies.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Regulatory Risk:</strong> Cryptocurrency regulations are evolving globally and may change in ways that adversely affect your investment.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Security Risks:</strong> Despite security measures, cryptocurrency transactions have inherent security risks, including smart contract vulnerabilities.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Transaction Irreversibility:</strong> Cryptocurrency transactions cannot be reversed once confirmed on the blockchain.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            5. Tax and Legal Considerations
          </Typography>
          
          <Typography variant="body1" paragraph>
            Tax laws regarding real estate investments and cryptocurrency transactions vary by jurisdiction and may change. iREVA does not provide tax or legal advice, and you should consult with qualified professionals regarding your specific situation.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            6. Risk Mitigation Efforts
          </Typography>
          
          <Typography variant="body1" paragraph>
            While iREVA cannot eliminate these risks, we take steps to mitigate them through:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">
                <strong>Due Diligence:</strong> Thorough property and market analysis before listing investment opportunities.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Legal Structure:</strong> Using secure legal structures for each investment.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Transparent Reporting:</strong> Regular updates on property status and performance.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Smart Contract Audits:</strong> Third-party security audits for blockchain-based transactions.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            7. Investor Acknowledgment
          </Typography>
          
          <Typography variant="body1" paragraph>
            By investing through iREVA, you acknowledge that you:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">
                Have read and understood this risk disclosure.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                Can afford to bear the economic risk of your investment for the full 5-year term.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                Have sufficient knowledge and experience to evaluate the merits and risks of the investment.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                Have consulted with financial, tax, and legal advisors as needed.
              </Typography>
            </Box>
          </Box>

          <Typography variant="body1" paragraph sx={{ mt: 4, fontStyle: 'italic' }}>
            This risk disclosure is not exhaustive and cannot identify all investment risks. You should carefully evaluate your financial situation, risk tolerance, and investment objectives before investing through iREVA.
          </Typography>

          <Typography variant="body1" paragraph>
            For questions about risk, contact us at{' '}
            <Link href="mailto:ireva.investments@gmail.com">ireva.investments@gmail.com</Link>.
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </div>
  );
};

export default InvestorRiskDisclosurePage;