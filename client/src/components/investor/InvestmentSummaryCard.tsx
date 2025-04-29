import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Grid, Skeleton } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface InvestmentSummary {
  totalInvested: number;
  propertyCount: number;
  averageReturn: number;
  roiReceived: number;
  nextPayoutDate: string;
  investmentProgress: number;
}

const InvestmentSummaryCard: React.FC = () => {
  const { data: summary, isLoading, error } = useQuery<InvestmentSummary>({
    queryKey: ['/api/investor/investments/summary'],
    queryFn: async () => {
      const response = await axios.get('/api/investor/investments/summary');
      return response.data;
    },
    staleTime: 60000, // 1 minute
  });

  // Format currency with Naira symbol
  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString()}`;
  };

  // Format date to readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  };

  if (error) {
    console.error('Error fetching investment summary:', error);
  }

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
        
        {isLoading ? (
          // Skeleton loading state
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Skeleton width={100} />
                  <Skeleton width={80} />
                </Box>
                <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4 }} />
              </Box>
            </Grid>
            {[...Array(4)].map((_, index) => (
              <Grid item xs={6} key={index}>
                <Box>
                  <Skeleton width={80} />
                  <Skeleton width={50} height={32} />
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Total Invested
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {summary ? formatCurrency(summary.totalInvested) : '₦0'}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={summary ? summary.investmentProgress : 0} 
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
                  {summary ? summary.propertyCount : 0}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Avg. Return
                </Typography>
                <Typography variant="h6" fontWeight="medium" color="success.main">
                  {summary ? `${summary.averageReturn.toFixed(1)}%` : '0%'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ROI Received
                </Typography>
                <Typography variant="h6" fontWeight="medium">
                  {summary ? formatCurrency(summary.roiReceived) : '₦0'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Next Payout
                </Typography>
                <Typography variant="h6" fontWeight="medium">
                  {summary && summary.nextPayoutDate ? formatDate(summary.nextPayoutDate) : 'N/A'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default InvestmentSummaryCard;