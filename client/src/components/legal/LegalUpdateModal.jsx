import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Typography, Button, CircularProgress, Box 
} from '@mui/material';
import axios from 'axios';
import LegalPdfViewer from './LegalPdfViewer';
import LegalTextViewer from './LegalTextViewer';

/**
 * A modal component that checks if the user needs to accept any updated legal documents
 * and shows them for acceptance
 */
export default function LegalUpdateModal({ currentUser }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [agreeing, setAgreeing] = useState(false);
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    checkCompliance();
  }, [currentUser]);

  // When acceptance is complete, recheck for any additional documents
  useEffect(() => {
    if (accepted) {
      setAccepted(false);
      checkCompliance();
    }
  }, [accepted]);

  // Check if user needs to accept any legal documents
  const checkCompliance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/compliance/check-latest');
      
      if (response.data.needsAcceptance) {
        setDocument(response.data.document);
        setOpen(true);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error checking compliance:", err);
      setError("Unable to check legal document status. Please try again later.");
      setLoading(false);
    }
  };

  // Handle user accepting the document
  const handleAccept = async () => {
    if (!document) return;
    
    try {
      setAgreeing(true);
      
      await axios.post('/api/compliance/accept-latest', {
        documentType: document.documentType,
        version: document.version
      });
      
      setAgreeing(false);
      setAccepted(true);
      setOpen(false);
      
      // Force page reload to ensure all components are updated with new compliance state
      window.location.reload();
    } catch (err) {
      console.error("Error accepting document:", err);
      setError("Unable to record your acceptance. Please try again.");
      setAgreeing(false);
    }
  };

  // Map document type to display name
  const getDocumentDisplayName = (docType) => {
    const docTypes = {
      'terms_of_service': 'Terms of Service',
      'privacy_policy': 'Privacy Policy',
      'investor_risk_disclosure': 'Investor Risk Disclosure',
      'crypto_risk_disclosure': 'Crypto Risk Disclosure',
      'aml_statement': 'Anti-Money Laundering Statement',
      'gdpr_commitment': 'GDPR Commitment',
      'cookies_policy': 'Cookies Policy'
    };
    
    return docTypes[docType] || docType;
  };

  // Get document type from technical name to proper display name
  const getDocumentName = () => {
    if (!document) return '';
    return getDocumentDisplayName(document.documentType);
  };

  // Render the document content based on type
  const renderDocumentContent = () => {
    if (!document) return null;

    // For PDF documents
    if (document.documentType === 'terms_of_service' || document.documentType === 'privacy_policy') {
      return (
        <LegalPdfViewer documentType={document.documentType} version={document.version} />
      );
    }
    
    // For text-based documents
    return (
      <LegalTextViewer documentType={document.documentType} version={document.version} />
    );
  };

  return (
    <Dialog 
      open={open}
      fullWidth
      maxWidth="md"
      disableEscapeKeyDown
      // Prevent closing by clicking outside
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
          setOpen(false);
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h5">
          Important: Please Review and Accept
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        ) : (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Our {getDocumentName()} has been updated (version {document?.version}). 
              Please review and accept to continue using iREVA's services.
            </Typography>
            
            <Box sx={{ my: 2, height: '50vh', overflowY: 'auto', border: '1px solid #ddd', p: 2 }}>
              {renderDocumentContent()}
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              By clicking "I Accept" below, you confirm that you have read, understood, and agree to
              the {getDocumentName()} as presented above.
            </Typography>
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          disabled={loading || agreeing}
          variant="contained" 
          color="primary" 
          onClick={handleAccept} 
          fullWidth
        >
          {agreeing ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'I Accept'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}