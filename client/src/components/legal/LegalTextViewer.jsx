import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Paper, 
  CircularProgress, 
  Alert
} from '@mui/material';
import axios from 'axios';

/**
 * Component to display the text content of a legal document directly in a container
 */
const LegalTextViewer = ({ documentType, documentUrl, variant = "embedded" }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState('');
  
  useEffect(() => {
    const fetchDocumentContent = async () => {
      try {
        setLoading(true);
        // If documentUrl is provided, fetch the content
        if (documentUrl) {
          const response = await axios.get(documentUrl);
          setContent(response.data);
        } else {
          // For demo purposes, provide fallback content
          setContent('Document content unavailable. Please check the document URL or try viewing the PDF version.');
          setError('Document content could not be loaded.');
        }
      } catch (err) {
        console.error('Error fetching document content:', err);
        setError('Failed to load document content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocumentContent();
  }, [documentUrl]);
  
  // Style variations based on where the component is used
  const containerStyles = variant === 'embedded' 
    ? { maxHeight: '400px', overflowY: 'auto' } 
    : { maxHeight: '70vh', overflowY: 'auto' };
    
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        ...containerStyles,
        p: 3,
        bgcolor: 'background.paper',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 1
      }}
    >
      {content ? (
        <Typography 
          component="div" 
          variant="body2" 
          sx={{ 
            '& p': { mb: 2 },
            '& h1, & h2, & h3, & h4, & h5, & h6': { 
              mt: 3, 
              mb: 1.5,
              fontWeight: 'bold' 
            },
            '& h1': { fontSize: '1.5rem' },
            '& h2': { fontSize: '1.3rem' },
            '& h3': { fontSize: '1.1rem' },
            '& ul, & ol': { 
              pl: 3,
              mb: 2
            },
            '& li': {
              mb: 0.5
            },
            lineHeight: 1.6
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </Typography>
      ) : (
        <Typography color="text.secondary" align="center" py={4}>
          No content available for this document.
        </Typography>
      )}
    </Paper>
  );
};

export default LegalTextViewer;