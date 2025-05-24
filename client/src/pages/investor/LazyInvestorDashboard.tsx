import React from 'react';
import { Box, Typography } from '@mui/material';
import LazyComponentWrapper from '../../components/layouts/LazyComponentWrapper';
import MobileNavDrawer from '../../components/navigation/MobileNavDrawer';

// Lazy-loaded dashboard components
const LazyDashboard = () => (
  <LazyComponentWrapper 
    importFunc={() => import('./Dashboard')}
    loadingLabel="Loading dashboard..." 
  />
);

const LazyInvestmentList = () => (
  <LazyComponentWrapper 
    importFunc={() => import('../../components/investor/ResponsiveInvestmentList')}
    loadingLabel="Loading investments..." 
  />
);

const LazyInvestorDashboard: React.FC = () => {
  return (
    <>
      {/* Mobile Navigation Drawer (accessible on all screen sizes) */}
      <MobileNavDrawer />
      
      <Box 
        component="main" 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 8, sm: 8, md: 8 }, // Extra padding at the top for the floating menu button
          maxWidth: '1400px',
          mx: 'auto'
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 4,
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #673ab7, #3f51b5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}
        >
          Investor Dashboard
        </Typography>
        
        {/* Main dashboard content */}
        <Box sx={{ mb: 5 }}>
          <LazyDashboard />
        </Box>
        
        {/* Investments section */}
        <Box sx={{ mb: 4 }}>
          <LazyInvestmentList />
        </Box>
        
        {/* Bottom message */}
        <Box 
          sx={{ 
            textAlign: 'center',
            p: 3,
            mt: 5,
            borderRadius: 2,
            bgcolor: (theme) => theme.palette.primary.light,
            color: (theme) => theme.palette.primary.contrastText
          }}
        >
          <Typography variant="h6" fontWeight="medium" gutterBottom>
            Ready to grow your portfolio?
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Explore new investment opportunities and track your existing investments all in one place.
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default LazyInvestorDashboard;