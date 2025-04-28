import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Link, 
  Grid, 
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  useTheme
} from '@mui/material';
import { Link as WouterLink } from 'wouter';
import { FileDown, FileText, Shield, AlertTriangle, BookOpen, Cookie, LockKeyhole, Scale } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface LegalDocumentProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkPath: string;
  pdfPath: string;
}

const LegalDocument: React.FC<LegalDocumentProps> = ({ 
  title, 
  description, 
  icon, 
  linkPath, 
  pdfPath 
}) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0} 
      sx={{ 
        height: '100%',
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', mb: 2, color: 'primary.main' }}>
          {icon}
        </Box>
        <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button 
          component={WouterLink} 
          href={linkPath} 
          variant="text" 
          size="small" 
          startIcon={<FileText size={16} />}
        >
          View
        </Button>
        <Button 
          href={pdfPath} 
          target="_blank" 
          variant="text" 
          size="small" 
          startIcon={<FileDown size={16} />}
        >
          Download
        </Button>
      </CardActions>
    </Card>
  );
};

const LegalCenterPage: React.FC = () => {
  const theme = useTheme();
  const effectiveDate = "April 28, 2025";

  const legalDocuments = [
    {
      title: "Terms of Service",
      description: "Our terms and conditions for using the iREVA platform, including platform rules and user responsibilities.",
      icon: <Scale size={24} />,
      linkPath: "/legal/terms-of-service",
      pdfPath: "/pdfs/terms-of-service.pdf"
    },
    {
      title: "Privacy Policy",
      description: "How we collect, use, and protect your personal information when you use our platform.",
      icon: <LockKeyhole size={24} />,
      linkPath: "/legal/privacy-policy",
      pdfPath: "/pdfs/privacy-policy.pdf"
    },
    {
      title: "Cookies Policy",
      description: "Our use of cookies and similar technologies, and how you can manage them.",
      icon: <Cookie size={24} />,
      linkPath: "/legal/cookies-policy",
      pdfPath: "/pdfs/cookies-policy.pdf"
    },
    {
      title: "Investor Risk Disclosure",
      description: "Important information about risks associated with real estate investments through iREVA.",
      icon: <AlertTriangle size={24} />,
      linkPath: "/legal/investor-risk-disclosure",
      pdfPath: "/pdfs/investor-risk-disclosure.pdf"
    },
    {
      title: "Crypto Risk Disclosure",
      description: "Special considerations and risks when using cryptocurrency for investments.",
      icon: <AlertTriangle size={24} />,
      linkPath: "/legal/crypto-risk-disclosure",
      pdfPath: "/pdfs/crypto-risk-disclosure.pdf"
    },
    {
      title: "AML Statement",
      description: "Our Anti-Money Laundering (AML) and Know Your Customer (KYC) policies and procedures.",
      icon: <Shield size={24} />,
      linkPath: "/legal/aml-statement",
      pdfPath: "/pdfs/aml-statement.pdf"
    },
    {
      title: "GDPR Commitment",
      description: "Our compliance with the European Union's General Data Protection Regulation (GDPR).",
      icon: <BookOpen size={24} />,
      linkPath: "/legal/gdpr-commitment",
      pdfPath: "/pdfs/gdpr-commitment.pdf"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          py: { xs: 4, md: 6 },
          mb: { xs: 4, md: 6 }
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Legal Center
          </Typography>
          <Typography variant="subtitle1">
            All the legal information you need to know about using iREVA's real estate investment platform.
            Last updated: {effectiveDate}
          </Typography>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ flex: 1, mb: 6 }}>
        <Grid container spacing={3}>
          {legalDocuments.map((doc, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <LegalDocument {...doc} />
            </Grid>
          ))}
        </Grid>
        
        <Paper elevation={0} sx={{ mt: 6, p: 4, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            Need Assistance?
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions or concerns about our legal documents or need clarification on our policies, 
            please don't hesitate to reach out to our support team.
          </Typography>
          <Typography variant="body1">
            Contact us at: <Link href="mailto:support@ireva.com">support@ireva.com</Link>
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </div>
  );
};

export default LegalCenterPage;