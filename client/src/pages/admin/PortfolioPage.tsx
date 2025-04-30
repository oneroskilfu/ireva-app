import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { PortfolioOverview } from '@/components/Portfolio/PortfolioOverview';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { TrendingUp, TrendingDown, Briefcase, CheckCircle } from 'lucide-react';

const PortfolioPage: React.FC = () => {
  // Fetch summary statistics
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['/api/admin/portfolio/summary'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/portfolio/summary');
      return response.json();
    }
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Investment Portfolio Management
      </Typography>

      {/* Summary Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Briefcase size={24} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Active Investments
                </Typography>
              </Box>
              <Typography variant="h3">
                {isLoading ? '-' : summaryData?.activeInvestments || 0}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                Total value: ${isLoading 
                  ? '-' 
                  : (summaryData?.activeInvestmentsTotal || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle size={24} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Completed Investments
                </Typography>
              </Box>
              <Typography variant="h3">
                {isLoading ? '-' : summaryData?.completedInvestments || 0}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                Portfolio maturity progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp size={24} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Average ROI
                </Typography>
              </Box>
              <Typography variant="h3">
                {isLoading ? '-' : `${(summaryData?.averageActualROI || 0).toFixed(2)}%`}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                Based on completed investments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingDown size={24} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Performance Index
                </Typography>
              </Box>
              <Typography variant="h3">
                {isLoading || !summaryData ? '-' : 
                  summaryData.averageActualROI > 15 ? 'A+' :
                  summaryData.averageActualROI > 12 ? 'A' :
                  summaryData.averageActualROI > 10 ? 'B+' :
                  summaryData.averageActualROI > 8 ? 'B' :
                  summaryData.averageActualROI > 6 ? 'C' : 'D'
                }
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                Portfolio performance grade
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Portfolio Overview Component */}
      <PortfolioOverview />
    </Box>
  );
};

export default PortfolioPage;