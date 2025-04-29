import React from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  LinearProgress, 
  Divider 
} from '@mui/material';
import { 
  TrendingUp, 
  People, 
  Business, 
  AccountBalance,
  VerifiedUser
} from '@mui/icons-material';

const AdminAnalyticsOverview: React.FC = () => {
  // Sample data for admin dashboard
  const stats = {
    totalInvestors: 1245,
    newInvestorsThisMonth: 138,
    kycPending: 27,
    totalProperties: 42,
    activeInvestments: 384,
    totalInvested: 350000000, // in Naira
    monthlyROI: 3500000 // in Naira
  };

  // Format currency in Nigerian Naira
  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        Platform Overview
      </Typography>
      
      <Grid container spacing={3}>
        {/* Total Investors Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            boxShadow: 2,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    borderRadius: '50%', 
                    bgcolor: 'primary.light', 
                    p: 1, 
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <People sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h6" color="text.secondary">Total Investors</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.totalInvestors}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp sx={{ color: 'success.main', fontSize: '1rem', mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +{stats.newInvestorsThisMonth} new this month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* KYC Status Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            boxShadow: 2,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    borderRadius: '50%', 
                    bgcolor: 'warning.light', 
                    p: 1, 
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <VerifiedUser sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h6" color="text.secondary">KYC Pending</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.kycPending}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {Math.round((1 - stats.kycPending / stats.totalInvestors) * 100)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(1 - stats.kycPending / stats.totalInvestors) * 100} 
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Properties Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            boxShadow: 2,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    borderRadius: '50%', 
                    bgcolor: 'info.light', 
                    p: 1, 
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Business sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h6" color="text.secondary">Properties</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.totalProperties}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">Active Investments</Typography>
                <Typography variant="body2" color="text.primary" fontWeight="bold">
                  {stats.activeInvestments}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Investment Stats Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            boxShadow: 2,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    borderRadius: '50%', 
                    bgcolor: 'success.light', 
                    p: 1, 
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AccountBalance sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h6" color="text.secondary">Total Investment</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(stats.totalInvested)}
              </Typography>
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Monthly ROI</Typography>
                <Typography variant="body2" color="success.main" fontWeight="bold">
                  {formatCurrency(stats.monthlyROI)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminAnalyticsOverview;