import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Grid } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import axios from 'axios';

const InvestmentSummaryCard = () => {
  const [investmentData, setInvestmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvestmentSummary = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/investor/investments/summary');
        setInvestmentData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching investment summary:', err);
        setError('Failed to load investment data');
        setLoading(false);
      }
    };

    fetchInvestmentSummary();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Use placeholder data if the API call doesn't return valid data
  const data = investmentData || {
    totalInvested: 0,
    totalReturns: 0,
    activeInvestments: 0,
    portfolioGrowth: 0
  };

  const isPositiveGrowth = data.portfolioGrowth >= 0;

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
        Investment Summary
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Total Invested
          </Typography>
          <Typography variant="h5" component="p" sx={{ fontWeight: 'bold' }}>
            ${data.totalInvested.toLocaleString()}
          </Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Total Returns
          </Typography>
          <Typography variant="h5" component="p" sx={{ fontWeight: 'bold' }}>
            ${data.totalReturns.toLocaleString()}
          </Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Active Investments
          </Typography>
          <Typography variant="h5" component="p" sx={{ fontWeight: 'bold' }}>
            {data.activeInvestments}
          </Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Portfolio Growth
            </Typography>
            {isPositiveGrowth ? (
              <TrendingUp fontSize="small" color="success" />
            ) : (
              <TrendingDown fontSize="small" color="error" />
            )}
          </Box>
          <Typography 
            variant="h5" 
            component="p" 
            sx={{ 
              fontWeight: 'bold',
              color: isPositiveGrowth ? 'success.main' : 'error.main'
            }}
          >
            {isPositiveGrowth ? '+' : ''}{data.portfolioGrowth}%
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InvestmentSummaryCard;