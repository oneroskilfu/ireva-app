import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

interface LegalPdfViewerProps {
  documentType: string;
  version: number;
}

export default function LegalPdfViewer({ documentType, version }: LegalPdfViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        setLoading(true);
        // Request the PDF document from backend
        const response = await axios.get(`/api/legal-content/${documentType}/${version}`, {
          responseType: 'blob'
        });
        
        // Create a blob URL from the PDF data
        const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        setPdfUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching PDF:', err);
        setError('Could not load document. Please try again later.');
        setLoading(false);
      }
    };

    fetchPdf();
    
    // Clean up blob URL on unmount
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
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
    <Box width="100%" height="100%">
      {pdfUrl ? (
        <iframe 
          src={`${pdfUrl}#toolbar=0&navpanes=0`} 
          width="100%" 
          height="100%" 
          style={{ border: 'none' }}
          title={`${documentType} document`}
        />
      ) : (
        <Typography>No document available</Typography>
      )}
    </Box>
  );
}