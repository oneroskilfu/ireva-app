import { useState, useEffect } from 'react';
import {
  Modal, Box, Typography, Button, CircularProgress
} from '@mui/material';
import axios from 'axios';
import LegalPdfViewer from './LegalPdfViewer';

export default function LegalUpdateModal({ currentUser }) {
  const [open, setOpen] = useState(false);
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  
  useEffect(() => {
    if (!currentUser) return;
    checkCompliance();
  }, [currentUser]);

  const checkCompliance = async () => {
    try {
      const { data } = await axios.get('/api/compliance/check-latest', {
        params: { userId: currentUser.id }
      });
      if (data.needsAcceptance) {
        setDoc(data.document);
        setOpen(true);
      }
    } catch (error) {
      console.error('Error checking compliance:', error);
    }
  };

  const acceptDocument = async () => {
    try {
      setLoading(true);
      await axios.post('/api/compliance/accept-latest', {
        userId: currentUser.id,
        documentType: doc.document_type,
        version: doc.version
      });
      setOpen(false);
      // Only reload if absolutely necessary - better UX to avoid page reload
    } catch (error) {
      console.error('Error accepting document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = () => {
    setViewerOpen(true);
  };

  if (!doc) return null;

  return (
    <>
      <Modal 
        open={open} 
        disableEscapeKeyDown // Prevent closing with ESC key
        disableBackdropClick // Prevent closing by clicking outside
      >
        <Box
          sx={{
            width: { xs: '90%', sm: 500 }, 
            bgcolor: 'background.paper', 
            p: 4, 
            mx: 'auto', 
            mt: '15vh',
            borderRadius: 2, 
            boxShadow: 24
          }}
        >
          <Typography variant="h5" mb={2} fontWeight="bold" color="primary">
            Important Update
          </Typography>
          
          <Typography variant="subtitle1" mb={3} fontWeight="medium">
            We've updated our {doc.title || doc.document_type.replace(/_/g, ' ')}
          </Typography>
          
          <Typography mb={3}>
            To continue using the iREVA platform, please review and accept our latest
            {doc.document_type === 'terms_of_service' ? ' Terms of Service' : 
             doc.document_type === 'privacy_policy' ? ' Privacy Policy' :
             doc.document_type === 'investor_risk_disclosure' ? ' Investor Risk Disclosure' : 
             doc.document_type === 'crypto_risk_disclosure' ? ' Cryptocurrency Risk Disclosure' : 
             ` ${doc.document_type.replace(/_/g, ' ')}`}.
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={2} mt={4}>
            <Button 
              variant="outlined" 
              fullWidth
              onClick={handleViewDocument}
            >
              View Document
            </Button>
            
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={acceptDocument}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Processing...
                </>
              ) : (
                "Accept and Continue"
              )}
            </Button>
            
            <Typography variant="caption" align="center" mt={1} color="text.secondary">
              Version: {doc.version} | Last Updated: {doc.lastUpdated || 'Recently'}
            </Typography>
          </Box>
        </Box>
      </Modal>
      
      {/* Integrate LegalPdfViewer for document viewing */}
      {viewerOpen && doc && (
        <LegalPdfViewer
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          pdfUrl={doc.pdfUrl}
          title={doc.title || doc.document_type.replace(/_/g, ' ')}
          version={doc.version}
          lastUpdated={doc.lastUpdated}
          documentType={doc.document_type}
        />
      )}
    </>
  );
}