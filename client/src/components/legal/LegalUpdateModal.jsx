import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  CircularProgress,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
import axios from 'axios';
import LegalTextViewer from './LegalTextViewer';

/**
 * Document type display names
 */
const DOCUMENT_TYPES = {
  'terms_of_service': 'Terms of Service',
  'privacy_policy': 'Privacy Policy',
  'investor_risk_disclosure': 'Investor Risk Disclosure',
  'crypto_risk_disclosure': 'Cryptocurrency Risk Disclosure',
  'aml_statement': 'Anti-Money Laundering Statement',
  'gdpr_commitment': 'GDPR Commitment',
  'cookies_policy': 'Cookies Policy'
};

/**
 * Modal component that checks if user needs to accept updated legal documents
 * and prevents app usage until acceptance is recorded
 * 
 * @param {Object} props
 * @param {Object} props.currentUser - The currently logged in user
 * @returns {JSX.Element}
 */
const LegalUpdateModal = ({ currentUser }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  const [document, setDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Check if user needs to accept any legal updates
  useEffect(() => {
    const checkLegalCompliance = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/compliance/check-latest?userId=${currentUser.id}`);
        
        if (response.data.needsAcceptance) {
          setDocument(response.data.document);
          setOpen(true);
          
          // Fetch the document content from the legal content API
          const contentResponse = await axios.get(`/api/legal/content/${response.data.document.documentType}`);
          setDocumentContent(contentResponse.data.content);
        }
      } catch (err) {
        console.error('Error checking legal compliance:', err);
        setError('Unable to verify legal compliance. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    checkLegalCompliance();
  }, [currentUser]);

  const handleAccept = async () => {
    if (!document || !currentUser) return;
    
    try {
      setAccepting(true);
      setError(null);
      
      await axios.post('/api/compliance/accept-latest', {
        documentType: document.documentType,
        version: document.version
      });
      
      // Force page reload to ensure session is compliant
      window.location.reload();
    } catch (err) {
      console.error('Error accepting legal document:', err);
      setError('Failed to record your acceptance. Please try again.');
      setAccepting(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // This modal cannot be closed except by accepting terms
  // No close handler is provided

  const documentTitle = document ? DOCUMENT_TYPES[document.documentType] || 'Legal Document' : '';

  return (
    <Dialog 
      open={open} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown
      // No onClose prop - user must accept
    >
      <DialogTitle>
        <Typography variant="h5" component="h2">
          Important Update: {documentTitle}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : document ? (
          <>
            <Typography 
              sx={{ mb: 2 }} 
              color="text.secondary"
            >
              Our {documentTitle} has been updated. Please review and accept the latest version to continue using the platform.
            </Typography>
            
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab label="Text Version" />
              <Tab label="PDF Version" />
            </Tabs>
            
            {tabValue === 0 && (
              <LegalTextViewer 
                title={documentTitle} 
                content={documentContent} 
              />
            )}
            
            {tabValue === 1 && (
              <Box sx={{ 
                height: '60vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid #e0e0e0', 
                borderRadius: 2
              }}>
                <Typography color="text.secondary">
                  PDF viewer would be embedded here
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Typography>No document updates required.</Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAccept}
          disabled={loading || accepting || !document}
          fullWidth
          size="large"
        >
          {accepting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            `I Accept the Updated ${documentTitle}`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LegalUpdateModal;