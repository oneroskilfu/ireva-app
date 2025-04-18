import React from 'react';
import { Paper, Grid, Typography, Box } from '@mui/material';

const ROIOverview = () => {
  return (
    <Grid container spacing={3} style={{ marginBottom: '2rem' }}>
      <Grid item xs={12} md={3}>
        <Paper 
          sx={{ 
            padding: '1.5rem', 
            textAlign: 'center',
            borderTop: '4px solid #4B3B2A',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B3B2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </Box>
          <Typography variant="h6" sx={{ color: '#4B3B2A', fontWeight: 600, mb: 1 }}>
            Total ROI Distributed
          </Typography>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            background: 'linear-gradient(45deg, #4B3B2A 30%, #6A5140 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>₦23.5M</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Across all projects
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Paper 
          sx={{ 
            padding: '1.5rem', 
            textAlign: 'center',
            borderTop: '4px solid #4B3B2A',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B3B2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20V10"></path>
              <path d="M18 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
          </Box>
          <Typography variant="h6" sx={{ color: '#4B3B2A', fontWeight: 600, mb: 1 }}>
            Average ROI
          </Typography>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            background: 'linear-gradient(45deg, #4B3B2A 30%, #6A5140 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>12.8%</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Annual return
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Paper 
          sx={{ 
            padding: '1.5rem', 
            textAlign: 'center',
            borderTop: '4px solid #4B3B2A',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B3B2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </Box>
          <Typography variant="h6" sx={{ color: '#4B3B2A', fontWeight: 600, mb: 1 }}>
            Active Investors
          </Typography>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            background: 'linear-gradient(45deg, #4B3B2A 30%, #6A5140 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>324</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Receiving returns
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Paper 
          sx={{ 
            padding: '1.5rem', 
            textAlign: 'center',
            borderTop: '4px solid #4B3B2A',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B3B2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </Box>
          <Typography variant="h6" sx={{ color: '#4B3B2A', fontWeight: 600, mb: 1 }}>
            Next Distribution
          </Typography>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            background: 'linear-gradient(45deg, #4B3B2A 30%, #6A5140 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>14 days</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            May 2, 2025
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ROIOverview;