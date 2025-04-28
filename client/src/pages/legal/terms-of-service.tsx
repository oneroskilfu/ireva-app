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

const TermsOfServicePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const effectiveDate = "April 1, 2025";

  // Function to handle PDF download
  const handleDownloadPdf = () => {
    window.open('/pdfs/terms-of-service.pdf', '_blank');
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
              iREVA Terms of Service
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

          <Typography variant="body1" paragraph>
            Welcome to iREVA!
            These Terms of Service ("Terms") govern your use of the iREVA platform and services ("Services").
          </Typography>
          
          <Typography variant="body1" paragraph>
            By accessing or using iREVA, you agree to be bound by these Terms. If you do not agree, do not use the platform.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
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

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
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

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
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

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
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

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            5. Fees
          </Typography>
          
          <Typography variant="body1" paragraph>
            iREVA may charge platform fees, transaction fees, or asset management fees.
            Details will be disclosed clearly before investment.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
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

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            7. No Financial Advice
          </Typography>
          
          <Typography variant="body1" paragraph>
            iREVA is a technology platform.
            We do not provide investment, tax, or legal advice.
          </Typography>
          
          <Typography variant="body1" paragraph>
            You acknowledge that any investment decision is made solely at your own risk.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
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

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            9. Amendments
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may update these Terms at any time.
            Material changes will be communicated via email or platform notification.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            10. Contact
          </Typography>
          
          <Typography variant="body1" paragraph>
            For questions about these Terms:
            Email: <Link href="mailto:ireva.investments@gmail.com">ireva.investments@gmail.com</Link>
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;