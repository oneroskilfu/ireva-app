import React, { useState } from 'react';
import { Container, Typography, Box, Link, Button } from '@mui/material';
import { Eye, FileDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import FooterSimple from '@/components/layout/FooterSimple';
import LegalPdfViewer from '@/components/legal/LegalPdfViewer';

interface LegalDocument {
  title: string;
  description?: string;
  pdfPath: string;
}

const LegalCenterPage: React.FC = () => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentPdf, setCurrentPdf] = useState<LegalDocument | null>(null);
  
  const legalDocuments: LegalDocument[] = [
    {
      title: "Privacy Policy",
      description: "How we collect and handle your personal information",
      pdfPath: "/pdfs/privacy-policy.pdf"
    },
    {
      title: "Terms of Service",
      description: "The rules and guidelines for using our platform",
      pdfPath: "/pdfs/terms-of-service.pdf"
    },
    {
      title: "Investor Risk Disclosure",
      description: "Information about the risks of real estate investments",
      pdfPath: "/pdfs/investor-risk-disclosure.pdf"
    },
    {
      title: "Crypto Risk Disclosure",
      description: "Risks associated with cryptocurrency investments",
      pdfPath: "/pdfs/crypto-risk-disclosure.pdf"
    },
    {
      title: "AML/KYC Policy",
      description: "Our anti-money laundering and know your customer procedures",
      pdfPath: "/pdfs/aml-statement.pdf"
    },
    {
      title: "GDPR Compliance Notice",
      description: "How we comply with European data protection regulations",
      pdfPath: "/pdfs/gdpr-commitment.pdf"
    },
    {
      title: "Cookies Policy",
      description: "How we use cookies and similar technologies",
      pdfPath: "/pdfs/cookies-policy.pdf"
    }
  ];

  const handlePreviewClick = (document: LegalDocument) => {
    setCurrentPdf(document);
    setViewerOpen(true);
  };
  
  const handleDownloadClick = (pdfPath: string) => {
    window.open(pdfPath, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <Container maxWidth="md" sx={{ mt: 8, mb: 8, flex: 1 }}>
        <Typography variant="h4" gutterBottom align="center">
          Legal Center
        </Typography>

        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          Welcome to iREVA's Legal Center. Here you can find important legal documents regarding your use of our platform.
        </Typography>

        <Box display="flex" flexDirection="column" gap={3} sx={{ 
          p: 4, 
          border: '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          {legalDocuments.map((doc, index) => (
            <Box key={index} sx={{ 
              p: 3, 
              borderRadius: 1,
              border: '1px solid rgba(0, 0, 0, 0.08)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
            }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {doc.title}
              </Typography>
              
              {doc.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                  {doc.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<Eye size={16} />}
                  onClick={() => handlePreviewClick(doc)}
                >
                  Preview
                </Button>
                <Button 
                  size="small" 
                  variant="text" 
                  startIcon={<FileDown size={16} />}
                  onClick={() => handleDownloadClick(doc.pdfPath)}
                >
                  Download
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          For any questions regarding our legal documents, please contact <Link href="mailto:support@ireva.com">support@ireva.com</Link>
        </Typography>
      </Container>
      
      {currentPdf && (
        <LegalPdfViewer
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          pdfUrl={currentPdf.pdfPath}
          title={currentPdf.title}
        />
      )}
      
      <FooterSimple />
    </div>
  );
};

export default LegalCenterPage;