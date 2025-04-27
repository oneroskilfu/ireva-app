import React from 'react';
import { Box, Container, Typography, Paper, Divider, Link } from '@mui/material';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link as WouterLink } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function GDPRCommitment() {
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
            iREVA Data Protection & GDPR Commitment
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Effective Date: {effectiveDate}
          </Typography>
          
          <Typography variant="body1" paragraph>
            iREVA is committed to protecting your personal data.
            We adhere to global data protection principles, including GDPR standards.
          </Typography>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            1. Data We Collect
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Identification data (e.g., full name, address, government ID).
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Investment activity data.
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Crypto wallet information (only addresses, not private keys).
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            2. How We Use Your Data
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                To verify your identity.
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                To comply with legal obligations (e.g., AML/KYC requirements).
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                To process your investments and withdrawals.
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                To communicate relevant platform updates.
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            3. Data Rights
          </Typography>
          
          <Typography variant="body1" paragraph>
            You have the right to:
          </Typography>
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Access your personal data.
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Request correction or deletion.
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Object to certain processing activities.
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Withdraw consent at any time (subject to legal obligations).
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            4. Data Security
          </Typography>
          
          <Typography variant="body1" paragraph>
            We implement industry-standard security measures, including:
          </Typography>
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Data encryption (in transit and at rest).
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Access controls.
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Secure hosting infrastructure.
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            5. International Transfers
          </Typography>
          
          <Typography variant="body1" paragraph>
            If your data is transferred outside your home country, we ensure appropriate safeguards are in place.
          </Typography>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            6. Data Retention
          </Typography>
          
          <Typography variant="body1" paragraph>
            We retain your data for as long as necessary to:
          </Typography>
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Fulfill the purposes outlined.
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body1">
                Meet legal, accounting, or reporting requirements.
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            7. Contact
          </Typography>
          
          <Typography variant="body1" paragraph>
            For privacy inquiries or GDPR data requests:
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