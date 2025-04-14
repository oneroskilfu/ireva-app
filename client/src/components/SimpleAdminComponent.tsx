import React from 'react';
import { Box, Typography, Paper, Alert, Button } from '@mui/material';
import { useAuth } from '../contexts/auth-context';
import { useLocation } from 'wouter';

interface SimpleAdminComponentProps {
  title?: string;
  children: React.ReactNode;
}

/**
 * A simpler implementation of an admin-only component using the direct pattern:
 * const { role } = useAuth(); if (role !== 'admin') return <Navigate to="/unauthorized" />;
 */
const SimpleAdminComponent: React.FC<SimpleAdminComponentProps> = ({ 
  title = "Admin Section", 
  children 
}) => {
  const { role } = useAuth();
  const [, setLocation] = useLocation();

  // If not admin, redirect to unauthorized page
  if (role !== 'admin') {
    // Using immediate redirect instead of useEffect
    setLocation('/unauthorized');
    return null;
  }

  // Only admin users will see this content
  return (
    <Paper elevation={3} sx={{ p: 3, my: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom color="primary">
        {title}
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This simple implementation uses the pattern: <br/>
        <code>const {"{"} role {"}"} = useAuth(); if (role !== 'admin') redirect;</code>
      </Alert>
      
      <Box>
        {children}
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => setLocation('/admin')}
        >
          Back to Admin Dashboard
        </Button>
      </Box>
    </Paper>
  );
};

export default SimpleAdminComponent;