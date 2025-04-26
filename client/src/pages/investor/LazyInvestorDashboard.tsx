import React, { lazy, Suspense } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

// Lazy loaded components
const WalletSummary = lazy(() => import('../../components/investor/WalletSummary'));
const InvestmentMetrics = lazy(() => import('../../components/investor/InvestmentMetrics'));
const PropertyList = lazy(() => import('../../components/investor/PropertyList'));
const InvestmentPerformance = lazy(() => import('../../components/investor/InvestmentPerformance'));
const RoiTracker = lazy(() => import('../../components/investor/RoiTracker'));
const NotificationCenter = lazy(() => import('../../components/investor/NotificationCenter'));

// Define a loading fallback component
const LoadingFallback = ({ height = 200, message = 'Loading...' }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      height: height,
      width: '100%',
      bgcolor: 'background.paper',
      borderRadius: 1,
      boxShadow: 1,
      p: 2
    }}
  >
    <CircularProgress size={40} color="primary" sx={{ mb: 2 }} />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

export default function LazyInvestorDashboard() {
  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Investor Dashboard
      </Typography>
      
      {/* Wallet Summary */}
      <Suspense fallback={<LoadingFallback height={150} message="Loading wallet information..." />}>
        <WalletSummary />
      </Suspense>
      
      {/* Investment Metrics */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Investment Overview
        </Typography>
        <Suspense fallback={<LoadingFallback height={180} message="Loading investment metrics..." />}>
          <InvestmentMetrics />
        </Suspense>
      </Box>
      
      {/* Properties List */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Featured Properties
        </Typography>
        <Suspense fallback={<LoadingFallback height={300} message="Loading properties..." />}>
          <PropertyList />
        </Suspense>
      </Box>
      
      {/* Investment Performance */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Performance Analytics
        </Typography>
        <Suspense fallback={<LoadingFallback height={350} message="Loading performance data..." />}>
          <InvestmentPerformance />
        </Suspense>
      </Box>
      
      {/* ROI Tracker */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Return on Investment
        </Typography>
        <Suspense fallback={<LoadingFallback height={250} message="Loading ROI data..." />}>
          <RoiTracker />
        </Suspense>
      </Box>
      
      {/* Notification Center */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Recent Notifications
        </Typography>
        <Suspense fallback={<LoadingFallback height={200} message="Loading notifications..." />}>
          <NotificationCenter />
        </Suspense>
      </Box>
    </Box>
  );
}