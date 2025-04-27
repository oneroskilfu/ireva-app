import React from 'react';
import { Box, Container, Typography, Paper, Divider, Link } from '@mui/material';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link as WouterLink } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function AMLStatement() {
  const effectiveDate = "April 1, 2025";

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <Container maxWidth="md" sx={{ py: 8, flex: 1 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Link 
              component={WouterLink} 
              href="/legal" 
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
                Back to Legal
              </Typography>
            </Link>
          </Box>

          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            iREVA Anti-Money Laundering (AML) Statement
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Effective Date: {effectiveDate}
          </Typography>
          
          <Typography variant="body1" paragraph>
            iREVA is committed to full compliance with all applicable anti-money laundering (AML) laws and regulations.
          </Typography>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            1. Our Policy
          </Typography>
          
          <Typography variant="body1" paragraph>
            We prohibit and actively prevent money laundering and any activity that facilitates money laundering or the funding of terrorist activities.
          </Typography>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            2. KYC and Identity Verification
          </Typography>
          
          <Typography variant="body1" paragraph>
            Before users are allowed to invest, iREVA will:
          </Typography>
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Conduct Know Your Customer (KYC) checks.
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Verify government-issued ID.
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Perform ongoing monitoring to detect suspicious activity.
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            3. Crypto Transaction Monitoring
          </Typography>
          
          <Typography variant="body1" paragraph>
            For users transacting in cryptocurrencies:
          </Typography>
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Wallet addresses may be screened against blockchain watchlists.
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                High-risk transactions may be flagged for additional review.
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Crypto deposits from prohibited jurisdictions are not allowed.
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            4. Reporting Obligations
          </Typography>
          
          <Typography variant="body1" paragraph>
            iREVA may be legally required to:
          </Typography>
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Report suspicious transactions to relevant authorities.
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Cooperate with investigations without informing the user ("no tipping off").
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            5. Staff Training
          </Typography>
          
          <Typography variant="body1" paragraph>
            All iREVA employees receive regular AML compliance training.
          </Typography>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            6. Contact
          </Typography>
          
          <Typography variant="body1" paragraph>
            Questions about this AML Statement:
          </Typography>
          <Typography variant="body1" paragraph>
            Email: <Link href="mailto:ireva.investments@gmail.com">ireva.investments@gmail.com</Link>
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </div>
  );
}