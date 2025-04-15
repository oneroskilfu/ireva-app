import React from 'react';
import MaterialUIExample from '../components/MaterialUIExample';
import { Container, Typography, Box, Paper } from '@mui/material';
import { toast } from '../utils/toastUtil';

const MaterialUIExamplePage: React.FC = () => {
  // Example of using toast notifications
  const showSuccessToast = () => {
    toast.success('This is a success message!');
  };

  const showErrorToast = () => {
    toast.error('This is an error message!');
  };

  const showInfoToast = () => {
    toast.info('This is an information message!');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Material UI Components Example
        </Typography>
        
        <Typography variant="body1" paragraph align="center">
          This page demonstrates the usage of Material UI components in the REVA application.
        </Typography>
        
        <Box sx={{ my: 4 }}>
          <MaterialUIExample />
        </Box>
        
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Toast Notification Examples
          </Typography>
          
          <Typography variant="body2" paragraph>
            Click the buttons below to see different types of toast notifications.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <button 
              onClick={showSuccessToast}
              className="action-btn primary"
            >
              Show Success Toast
            </button>
            
            <button 
              onClick={showErrorToast}
              className="action-btn secondary"
            >
              Show Error Toast
            </button>
            
            <button 
              onClick={showInfoToast}
              className="action-btn"
            >
              Show Info Toast
            </button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default MaterialUIExamplePage;