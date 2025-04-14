import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { useAdminCheck } from '../hooks/use-admin-check';

interface AdminOnlyComponentProps {
  title?: string;
  children: React.ReactNode;
}

/**
 * A wrapper component that only renders its children if the user is an admin
 * Otherwise redirects to the unauthorized page
 */
const AdminOnlyComponent: React.FC<AdminOnlyComponentProps> = ({ 
  title = "Admin Only Section", 
  children 
}) => {
  // This hook will automatically redirect non-admin users
  const isAdmin = useAdminCheck();

  // If not admin, the hook will redirect, but return null here as a fallback
  if (!isAdmin) {
    return null;
  }

  // Only admin users will see this content
  return (
    <Paper elevation={3} sx={{ p: 3, my: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom color="primary">
        {title}
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This content is only visible to administrators.
      </Alert>
      
      <Box>
        {children}
      </Box>
    </Paper>
  );
};

export default AdminOnlyComponent;