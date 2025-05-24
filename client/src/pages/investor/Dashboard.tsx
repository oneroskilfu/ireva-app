import React, { useEffect } from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { lazy, Suspense } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '@/hooks/use-auth';
import LegalUpdateModal from '@/components/legal/LegalUpdateModal';

// Lazy load components for performance optimization
const InvestmentSummaryCard = lazy(() => import('../../components/investor/InvestmentSummaryCard'));
const WalletBalanceCard = lazy(() => import('../../components/investor/WalletBalanceCard'));
const RecentTransactions = lazy(() => import('../../components/investor/RecentTransactions'));
const CryptoStatus = lazy(() => import('../../components/investor/CryptoStatus'));

// Loading fallback component
const LoadingCard = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: 200, 
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 1
  }}>
    <CircularProgress />
  </Box>
);

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Legal document update modal that appears when user needs to accept latest terms */}
      {user && <LegalUpdateModal currentUser={user} />}

      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Dashboard
      </Typography>
      
      {/* Responsive Grid layout - stacks vertically on mobile, 2-column on desktop */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Suspense fallback={<LoadingCard />}>
            <InvestmentSummaryCard />
          </Suspense>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Suspense fallback={<LoadingCard />}>
            <WalletBalanceCard />
          </Suspense>
        </Grid>

        <Grid item xs={12} md={6}>
          <Suspense fallback={<LoadingCard />}>
            <RecentTransactions />
          </Suspense>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Suspense fallback={<LoadingCard />}>
            <CryptoStatus />
          </Suspense>
        </Grid>
      </Grid>
    </Box>
  );
}