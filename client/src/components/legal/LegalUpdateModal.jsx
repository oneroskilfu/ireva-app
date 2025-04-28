import { useState, useEffect } from 'react';
import {
  Modal, Box, Typography, Button, CircularProgress,
  Tabs, Tab, Divider, Paper
} from '@mui/material';
import axios from 'axios';
import LegalPdfViewer from './LegalPdfViewer';
import LegalTextViewer from './LegalTextViewer';

export default function LegalUpdateModal({ currentUser }) {
  const [open, setOpen] = useState(false);
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewMode, setViewMode] = useState('text'); // 'text' or 'pdf'
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false); // Track if user has scrolled to end
  
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
      
      // Reload the page after acceptance to update the session compliance status
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error accepting document:', error);
      setLoading(false);
    }
  };

  const handleViewDocument = () => {
    setViewerOpen(true);
  };
  
  const handleScroll = (e) => {
    const element = e.target;
    const scrollBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    if (scrollBottom < 20) { // Within 20px of the bottom
      setHasScrolledToEnd(true);
    }
  };

  if (!doc) return null;
  
  // Format the document title based on document_type
  const documentTitle = doc.title || (
    doc.document_type === 'terms_of_service' ? 'Terms of Service' : 
    doc.document_type === 'privacy_policy' ? 'Privacy Policy' :
    doc.document_type === 'investor_risk_disclosure' ? 'Investor Risk Disclosure' : 
    doc.document_type === 'crypto_risk_disclosure' ? 'Cryptocurrency Risk Disclosure' : 
    doc.document_type.replace(/_/g, ' ')
  );
  
  // Determine text content URL or use document-specific logic
  const textContentUrl = doc.textContentUrl || `/api/legal/content/${doc.document_type}`;

  return (
    <>
      <Modal 
        open={open}
        onClose={(event, reason) => {
          // Prevent all attempts to close the modal except through the Accept button
          return false;
        }}
        disableEscapeKeyDown
        hideBackdrop={false}
      >
        <Box
          sx={{
            width: { xs: '95%', sm: '80%', md: '700px' }, 
            maxWidth: '800px',
            bgcolor: 'background.paper', 
            p: { xs: 2, sm: 3 }, 
            mx: 'auto', 
            mt: '10vh',
            borderRadius: 2, 
            boxShadow: 24,
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography variant="h5" mb={1} fontWeight="bold" color="primary">
            Important Legal Update
          </Typography>
          
          <Typography variant="subtitle1" mb={2} fontWeight="medium">
            We've updated our {documentTitle}
          </Typography>
          
          <Tabs 
            value={viewMode} 
            onChange={(e, newValue) => setViewMode(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="Text View" value="text" />
            <Tab label="PDF View" value="pdf" />
          </Tabs>
          
          <Divider sx={{ mb: 2 }} />
          
          <Box 
            sx={{ 
              flex: 1, 
              overflowY: 'auto',
              minHeight: '300px',
              mb: 2
            }}
            onScroll={handleScroll}
          >
            {viewMode === 'text' ? (
              <LegalTextViewer 
                documentType={doc.document_type} 
                documentUrl={textContentUrl}
                variant="embedded"
              />
            ) : (
              <Paper
                elevation={0}
                sx={{
                  height: '400px',
                  p: 0
                }}
              >
                <iframe
                  src={doc.pdfUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title={documentTitle}
                />
              </Paper>
            )}
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Box>
            <Typography variant="body2" mb={2}>
              By clicking "Accept and Continue," you acknowledge that you have read and understood 
              this document and agree to be bound by its terms.
            </Typography>
            
            <Box display="flex" flexDirection="column" gap={2}>              
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
        </Box>
      </Modal>
      
      {/* Optional - full-screen PDF viewer if needed */}
      {viewerOpen && doc && (
        <LegalPdfViewer
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          pdfUrl={doc.pdfUrl}
          title={documentTitle}
          version={doc.version}
          lastUpdated={doc.lastUpdated}
          documentType={doc.document_type}
        />
      )}
    </>
  );
}