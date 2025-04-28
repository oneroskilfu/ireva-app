import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

/**
 * Component to display legal document text content
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the legal document
 * @param {string} props.content - The content of the legal document
 * @returns {JSX.Element}
 */
const LegalTextViewer = ({ title, content }) => {
  if (!content) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          Document content not available
        </Typography>
      </Box>
    );
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        maxHeight: '60vh', 
        overflowY: 'auto',
        border: '1px solid #e0e0e0',
        borderRadius: 2
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        {content.split('\n\n').map((paragraph, index) => (
          <Typography 
            key={index} 
            paragraph 
            sx={{ 
              fontSize: '0.9rem',
              color: 'text.secondary',
              mb: 2
            }}
          >
            {paragraph}
          </Typography>
        ))}
      </Box>
    </Paper>
  );
};

export default LegalTextViewer;