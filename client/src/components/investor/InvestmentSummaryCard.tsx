import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Grid } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const InvestmentSummaryCard: React.FC = () => {
  return (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 2,
      boxShadow: (theme) => theme.shadows[3]
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2" fontWeight="bold">
            Investment Summary
          </Typography>
          <TrendingUp color="primary" />
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Total Invested
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  ₦12,500,000
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={65} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Properties
              </Typography>
              <Typography variant="h6" fontWeight="medium">
                4
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Avg. Return
              </Typography>
              <Typography variant="h6" fontWeight="medium" color="success.main">
                14.2%
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                ROI Received
              </Typography>
              <Typography variant="h6" fontWeight="medium">
                ₦650,000
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Next Payout
              </Typography>
              <Typography variant="h6" fontWeight="medium">
                May 15
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default InvestmentSummaryCard;