import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Breadcrumbs, 
  Link, 
  Divider, 
  Button, 
  Paper,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link as WouterLink } from 'wouter';
import { FileDown, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import FooterSimple from '@/components/layout/FooterSimple';

const PrivacyPolicyPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const effectiveDate = "April 1, 2025";

  // Function to handle PDF download - in a real implementation this would generate 
  // or serve a PDF file with the same content
  const handleDownloadPdf = () => {
    // This is a placeholder. In a production environment, you would either:
    // 1. Generate a PDF dynamically using jsPDF or similar library
    // 2. Serve a pre-created PDF from your server
    alert('PDF download functionality will be implemented in production');
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
              iREVA Privacy Policy
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
            Welcome to iREVA ("we", "our", or "us").
            We are committed to protecting your personal information and your right to privacy.
            This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit or use our platform, including any services, products, or features offered through iREVA.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Please read this policy carefully. If you do not agree with the terms, please do not use our platform.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            1. Information We Collect
          </Typography>
          
          <Typography variant="body1" paragraph>
            We collect information that you voluntarily provide to us when you:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">Register for an account</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Complete KYC/identity verification</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Invest in a project</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Request withdrawals</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Subscribe to newsletters</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Contact customer support</Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            This information may include:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">Full name, address, phone number, and email address</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Government-issued ID and documents for verification</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Wallet addresses for crypto transactions</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Investment history and transaction details</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Communication preferences</Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            We may also automatically collect:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">Device and usage data (IP address, browser type, device ID)</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Cookies and tracking technologies for platform optimization</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            2. How We Use Your Information
          </Typography>
          
          <Typography variant="body1" paragraph>
            We use your information to:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">Create and manage your account</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Process investments, withdrawals, and payouts</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Verify your identity to comply with regulatory requirements</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Communicate updates, confirmations, and marketing materials</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Improve platform features, security, and user experience</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Enforce our Terms of Service and policies</Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            We do not sell or rent your personal information to third parties.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            3. How We Share Your Information
          </Typography>
          
          <Typography variant="body1" paragraph>
            We only share your data with:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">Identity verification service providers (for KYC/AML compliance)</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Payment processors (for fiat and crypto transactions)</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Hosting and IT service providers (for platform operation)</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Legal authorities if required by law (e.g., anti-fraud, tax reporting)</Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            All partners are contractually required to safeguard your data.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            4. Crypto Transactions and Blockchain Data
          </Typography>
          
          <Typography variant="body1" paragraph>
            Please note:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">Cryptocurrency transactions are recorded on public blockchains.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Blockchain data may be accessible globally and immutable.</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">By investing with crypto, you acknowledge and accept the transparency nature of blockchain technology.</Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            We will only request blockchain addresses or crypto wallet data necessary for your investments or withdrawals.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            5. Data Retention
          </Typography>
          
          <Typography variant="body1" paragraph>
            We retain your information:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">As long as your account remains active</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">For as long as necessary to fulfill legal and regulatory obligations</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Or until you request deletion (subject to compliance restrictions)</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            6. Your Privacy Rights
          </Typography>
          
          <Typography variant="body1" paragraph>
            You have the right to:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">Access and request a copy of your data</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Correct inaccuracies in your profile</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Request deletion of your account (where permissible)</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">Withdraw consent to marketing communications</Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            To exercise your rights, contact us at: <Link href="mailto:ireva.investments@gmail.com">ireva.investments@gmail.com</Link>
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            7. Data Security
          </Typography>
          
          <Typography variant="body1" paragraph>
            We implement administrative, technical, and physical security measures to protect your data.
            However, no method of transmission over the internet is 100% secure.
            We encourage users to maintain strong passwords and monitor account activities.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            8. Third-Party Links
          </Typography>
          
          <Typography variant="body1" paragraph>
            Our platform may contain links to third-party websites or services.
            We are not responsible for the privacy practices of those external sites.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            9. Changes to This Policy
          </Typography>
          
          <Typography variant="body1" paragraph>
            We may update this Privacy Policy from time to time.
            We will notify you of any material changes through the platform or by email.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            10. Contact Us
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you have any questions about this Privacy Policy, please contact us:
          </Typography>
          
          <Typography variant="body1" paragraph>
            iREVA Support Team<br />
            Email: <Link href="mailto:ireva.investments@gmail.com">ireva.investments@gmail.com</Link>
          </Typography>
        </Paper>
      </Container>
      <FooterSimple />
    </div>
  );
};

export default PrivacyPolicyPage;