import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

/**
 * Component for displaying text-based legal documents
 */
export default function LegalTextViewer({ documentType, version }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        // Request the text document from backend
        const response = await axios.get(`/api/legal-content/${documentType}/${version}/text`);
        
        setContent(response.data.content);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching text content:', err);
        setError('Could not load document. Please try again later.');
        setLoading(false);
      }
    };

    fetchContent();
  }, [documentType, version]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box width="100%" height="100%" overflow="auto" p={1}>
      {content ? (
        <div 
          dangerouslySetInnerHTML={{ __html: content }} 
          style={{ 
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.6'
          }}
        />
      ) : (
        <Typography>No document content available</Typography>
      )}
    </Box>
  );
}