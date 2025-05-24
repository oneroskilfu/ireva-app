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

const AMLStatementPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const effectiveDate = "April 1, 2025";

  // Function to handle PDF download
  const handleDownloadPdf = () => {
    window.open('/pdfs/aml-statement.pdf', '_blank');
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
              Anti-Money Laundering Statement
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
            iREVA is committed to maintaining the highest standards of Anti-Money Laundering (AML) compliance and preventing the use of our platform for money laundering, terrorist financing, or other illegal activities. This statement outlines our commitment to AML regulations and the measures we implement to detect and prevent such activities.
          </Typography>
          
          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            1. Our Commitment
          </Typography>
          
          <Typography variant="body1" paragraph>
            iREVA is committed to:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">
                Complying with all applicable AML laws and regulations across jurisdictions where we operate.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                Implementing robust AML policies, procedures, and controls to detect and prevent money laundering.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                Conducting thorough due diligence on all users and monitoring transactions for suspicious activity.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                Cooperating fully with law enforcement and regulatory authorities.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            2. Know Your Customer (KYC) Procedures
          </Typography>
          
          <Typography variant="body1" paragraph>
            We implement comprehensive KYC procedures to verify the identity of all users. These procedures include:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">
                <strong>Identity Verification:</strong> We require government-issued photo ID and other identifying documents.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Address Verification:</strong> We verify user addresses through appropriate documentation.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Enhanced Due Diligence:</strong> For higher-risk users or transactions, we conduct additional verification steps.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Ongoing Verification:</strong> We periodically update and re-verify user information.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            3. Transaction Monitoring
          </Typography>
          
          <Typography variant="body1" paragraph>
            We actively monitor transactions on our platform to identify potentially suspicious activities, including:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">
                Unusual transaction patterns or volumes
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                Transactions from high-risk countries or jurisdictions
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                Multiple small transactions that appear to be structured to avoid reporting thresholds
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                Transactions that do not align with a user's profile or investment history
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            4. Reporting and Record Keeping
          </Typography>
          
          <Typography variant="body1" paragraph>
            We maintain comprehensive records of all transactions and user information in accordance with regulatory requirements. We promptly report suspicious activities to the appropriate regulatory authorities.
          </Typography>
          
          <Typography variant="body1" paragraph>
            We require all employees to complete regular AML training to ensure they understand their responsibilities in detecting and preventing money laundering activities.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            5. Cryptocurrency-Specific Measures
          </Typography>
          
          <Typography variant="body1" paragraph>
            For cryptocurrency transactions, we implement additional measures including:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">
                <strong>Blockchain Analysis:</strong> We use specialized tools to analyze the source and history of cryptocurrency funds.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Wallet Verification:</strong> We verify that users control the wallets they use for transactions.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Transaction Limits:</strong> We implement appropriate transaction limits based on user verification levels.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Jurisdictional Controls:</strong> We prevent transactions from countries subject to sanctions or with inadequate AML frameworks.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            6. User Cooperation
          </Typography>
          
          <Typography variant="body1" paragraph>
            By using the iREVA platform, users agree to:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">
                Provide accurate and complete information during the KYC process
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                Update their information promptly if there are any changes
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                Respond to requests for additional information in a timely manner
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                Not use the platform for any illegal activities, including money laundering
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            7. Contact Information
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you have any questions about our AML policies or procedures, please contact our Compliance Team at{' '}
            <Link href="mailto:compliance@ireva.com">compliance@ireva.com</Link>.
          </Typography>

          <Typography variant="body2" paragraph sx={{ mt: 4, fontStyle: 'italic' }}>
            This statement is subject to change. Any significant changes will be communicated to users through the platform or via email.
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </div>
  );
};

export default AMLStatementPage;