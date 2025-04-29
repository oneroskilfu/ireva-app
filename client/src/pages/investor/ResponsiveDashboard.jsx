import React, { lazy, Suspense } from 'react';
import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import LazyComponentWrapper from '../../components/layouts/LazyComponentWrapper';

// Lazy loaded components - using dynamic imports for code splitting
const InvestmentSummaryCard = lazy(() => import('../../components/investor/InvestmentSummaryCard'));
const WalletBalanceCard = lazy(() => import('../../components/investor/WalletBalanceCard'));
const RecentTransactions = lazy(() => import('../../components/investor/RecentTransactions'));
const CryptoStatus = lazy(() => import('../../components/investor/CryptoStatus'));
const PropertyHighlights = lazy(() => import('../../components/investor/PropertyHighlights'));
const RoiChart = lazy(() => import('../../components/investor/RoiChart'));
const NotificationsList = lazy(() => import('../../components/investor/NotificationsList'));
const ReferralWidget = lazy(() => import('../../components/referral/ReferralWidget'));

export default function ResponsiveDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        Investor Dashboard
      </Typography>
      
      <Grid container spacing={2}>
        {/* Top cards */}
        <Grid item xs={12} md={6}>
          <LazyComponentWrapper height={180}>
            <InvestmentSummaryCard />
          </LazyComponentWrapper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <LazyComponentWrapper height={180}>
            <WalletBalanceCard />
          </LazyComponentWrapper>
        </Grid>
        
        {/* Middle section */}
        <Grid item xs={12} md={8}>
          <LazyComponentWrapper height={300}>
            <RoiChart />
          </LazyComponentWrapper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <LazyComponentWrapper height={300}>
            <NotificationsList />
          </LazyComponentWrapper>
        </Grid>
        
        {/* Bottom section */}
        <Grid item xs={12} md={6}>
          <LazyComponentWrapper height={350}>
            <RecentTransactions />
          </LazyComponentWrapper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <LazyComponentWrapper height={350}>
            <CryptoStatus />
          </LazyComponentWrapper>
        </Grid>
        
        {/* Property highlights */}
        <Grid item xs={12}>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Featured Properties
            </Typography>
          </Box>
          <LazyComponentWrapper height={isMobile ? 500 : 300}>
            <PropertyHighlights />
          </LazyComponentWrapper>
        </Grid>
        
        {/* Referral widget */}
        <Grid item xs={12}>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Earn with Referrals
            </Typography>
          </Box>
          <LazyComponentWrapper height={180}>
            <ReferralWidget />
          </LazyComponentWrapper>
        </Grid>
      </Grid>
    </Box>
  );
}