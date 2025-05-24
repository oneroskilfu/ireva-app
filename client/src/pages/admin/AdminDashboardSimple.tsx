import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AdminDashboardSimple: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          This is a simplified admin dashboard for testing purposes.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminDashboardSimple;