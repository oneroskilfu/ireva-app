import React from 'react';
import { Paper, Grid, Typography, Box } from '@mui/material';

const ROIOverview = () => {
  return (
    <Grid container spacing={3} style={{ marginBottom: '2rem' }}>
      <Grid item xs={12} md={3}>
        <Paper style={{ padding: '1rem', textAlign: 'center' }}>
          <Typography variant="h6" color="primary">
            Total ROI Distributed
          </Typography>
          <Typography variant="h4">₦23.5M</Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Across all projects
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Paper style={{ padding: '1rem', textAlign: 'center' }}>
          <Typography variant="h6" color="primary">
            Average ROI
          </Typography>
          <Typography variant="h4">12.8%</Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Annual return
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Paper style={{ padding: '1rem', textAlign: 'center' }}>
          <Typography variant="h6" color="primary">
            Active Investors
          </Typography>
          <Typography variant="h4">324</Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Receiving returns
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Paper style={{ padding: '1rem', textAlign: 'center' }}>
          <Typography variant="h6" color="primary">
            Next Distribution
          </Typography>
          <Typography variant="h4">14 days</Typography>
          <Typography variant="subtitle2" color="textSecondary">
            May 2, 2025
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ROIOverview;