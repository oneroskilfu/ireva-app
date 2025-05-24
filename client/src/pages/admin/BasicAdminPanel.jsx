import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

const BasicAdminPanel = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Basic Admin Panel
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5">KYC Management</Typography>
            <Typography variant="body1">
              Pending approvals: 12
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5">Investment Overview</Typography>
            <Typography variant="body1">
              Total investments: ₦43.5M
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BasicAdminPanel;