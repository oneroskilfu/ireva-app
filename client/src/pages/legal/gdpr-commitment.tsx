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

const GDPRCommitmentPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const effectiveDate = "April 1, 2025";

  // Function to handle PDF download
  const handleDownloadPdf = () => {
    window.open('/pdfs/gdpr-commitment.pdf', '_blank');
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
              GDPR Commitment Statement
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
            At iREVA, we are committed to respecting and protecting your privacy and personal data. This GDPR Commitment Statement outlines our approach to data protection in accordance with the General Data Protection Regulation (GDPR) and other applicable data protection laws.
          </Typography>
          
          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            1. Our Commitment to GDPR Compliance
          </Typography>
          
          <Typography variant="body1" paragraph>
            iREVA is committed to ensuring that all personal data processing activities comply with GDPR principles. This means we:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">
                <strong>Process data lawfully, fairly, and transparently</strong> – We clearly inform you about how and why we collect and use your data.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Collect data for specified, explicit, and legitimate purposes</strong> – We only collect data for purposes that we have clearly explained to you.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Minimize data collection</strong> – We only collect personal data that is necessary for the purposes we have specified.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Ensure data accuracy</strong> – We take steps to ensure the personal data we hold is accurate and up to date.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Limit data retention</strong> – We do not keep personal data for longer than necessary.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Ensure data security</strong> – We implement appropriate technical and organizational measures to protect personal data.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            2. Your Rights Under GDPR
          </Typography>
          
          <Typography variant="body1" paragraph>
            We respect and uphold your rights under the GDPR, which include:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">
                <strong>Right to be informed</strong> – You have the right to know how we collect and use your personal data.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Right of access</strong> – You can request a copy of the personal data we hold about you.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Right to rectification</strong> – You can request that we correct inaccurate or incomplete data.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Right to erasure</strong> – In certain circumstances, you can request that we delete your personal data.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Right to restrict processing</strong> – You can request that we limit how we use your data.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Right to data portability</strong> – You can request a copy of your data in a machine-readable format.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Right to object</strong> – You can object to certain types of processing, including direct marketing.
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>Rights related to automated decision making and profiling</strong> – You have rights regarding automated decisions with legal or significant effects.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            3. How We Implement GDPR Requirements
          </Typography>

          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
            Data Protection by Design and Default
          </Typography>
          
          <Typography variant="body1" paragraph>
            We integrate data protection considerations into our business processes and technical systems from the start. This includes conducting Data Protection Impact Assessments (DPIAs) when necessary and implementing privacy-enhancing technologies.
          </Typography>

          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold', mt: 3 }}>
            Data Processing Records
          </Typography>
          
          <Typography variant="body1" paragraph>
            We maintain detailed records of our data processing activities, including the purposes of processing, data categories, recipient categories, transfers, retention periods, and security measures.
          </Typography>

          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold', mt: 3 }}>
            Data Protection Officer
          </Typography>
          
          <Typography variant="body1" paragraph>
            We have appointed a Data Protection Officer (DPO) who is responsible for monitoring compliance with the GDPR and other data protection laws, advising on data protection obligations, and acting as a contact point for data subjects and supervisory authorities.
          </Typography>

          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold', mt: 3 }}>
            Security Measures
          </Typography>
          
          <Typography variant="body1" paragraph>
            We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including pseudonymization and encryption of personal data, ensuring confidentiality, integrity, availability, and resilience of processing systems, and regular testing of security measures.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            4. International Data Transfers
          </Typography>
          
          <Typography variant="body1" paragraph>
            As a global platform operating across multiple jurisdictions, we may transfer personal data to countries outside the European Economic Area (EEA). When we do so, we ensure that appropriate safeguards are in place to protect your data, such as:
          </Typography>
          
          <Box component="ul" sx={{ pl: 4 }}>
            <Box component="li">
              <Typography variant="body1">
                Standard Contractual Clauses approved by the European Commission
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                Binding Corporate Rules
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                Adequacy decisions by the European Commission
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            5. Data Breach Procedures
          </Typography>
          
          <Typography variant="body1" paragraph>
            We have implemented procedures to detect, report, and investigate personal data breaches. In the event of a breach that may pose a risk to your rights and freedoms, we will notify the relevant supervisory authority without undue delay and, where feasible, within 72 hours of becoming aware of the breach. If the breach is likely to result in a high risk to your rights and freedoms, we will also notify you directly.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            6. Employee Training
          </Typography>
          
          <Typography variant="body1" paragraph>
            We provide regular data protection training to all employees who have access to personal data. This training ensures that our team understands the importance of data protection and their responsibilities under the GDPR.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            7. Contact Information
          </Typography>
          
          <Typography variant="body1" paragraph>
            If you have any questions about our GDPR compliance or wish to exercise your rights, please contact our Data Protection Officer at{' '}
            <Link href="mailto:dpo@ireva.com">dpo@ireva.com</Link>.
          </Typography>

          <Typography variant="body2" paragraph sx={{ mt: 4, fontStyle: 'italic' }}>
            This GDPR Commitment Statement complements our Privacy Policy and forms part of our overall approach to data protection. We review our data protection practices regularly to ensure ongoing compliance with the GDPR and other applicable data protection laws.
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </div>
  );
};

export default GDPRCommitmentPage;