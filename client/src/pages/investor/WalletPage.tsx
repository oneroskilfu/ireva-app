import React, { Suspense, lazy } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

// Lazy load the heavy wallet component
const Wallet = lazy(() => import('@/components/investor/Wallet'));
const WalletTransactionHistory = lazy(() => import('@/components/investor/WalletTransactionHistory'));
const CryptoWalletIntegration = lazy(() => import('@/components/investor/CryptoWalletIntegration'));

// Loading fallback component with better UX
const LoadingFallback = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      width: '100%', 
      minHeight: '300px',
      p: 4
    }}
  >
    <CircularProgress size={40} thickness={4} sx={{ mb: 2 }} />
    <Typography variant="body1" color="text.secondary">
      Loading wallet information...
    </Typography>
  </Box>
);

export default function WalletPage() {
  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        My Wallet
      </Typography>
      
      {/* Main wallet component with nicer loading fallback */}
      <Suspense fallback={<LoadingFallback />}>
        <Wallet />
      </Suspense>
      
      {/* Transaction history component */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
          Transaction History
        </Typography>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Suspense 
            fallback={
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={30} thickness={4} />
              </Box>
            }
          >
            <WalletTransactionHistory />
          </Suspense>
        </Paper>
      </Box>
      
      {/* Crypto wallet integration */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
          Crypto Wallet
        </Typography>
        <Paper sx={{ borderRadius: 2 }}>
          <Suspense 
            fallback={
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={30} thickness={4} />
              </Box>
            }
          >
            <CryptoWalletIntegration />
          </Suspense>
        </Paper>
      </Box>
    </Box>
  );
}