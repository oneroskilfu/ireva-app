import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Divider, Grid, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { AccountBalanceWallet, Add } from '@mui/icons-material';
import TouchOptimizedButton from '../ui/TouchOptimizedButton';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface WalletBalance {
  totalBalance: number;
  fiatBalance: number;
  cryptoBalance: {
    usdcBalance: number;
    usdtBalance: number;
  };
  monthlyChange: number;
}

const WalletBalanceCard: React.FC = () => {
  const [fundDialogOpen, setFundDialogOpen] = useState(false);

  const { data: wallet, isLoading, error } = useQuery<WalletBalance>({
    queryKey: ['/api/wallet/balance'],
    queryFn: async () => {
      const response = await axios.get('/api/wallet/balance');
      return response.data;
    },
    staleTime: 60000 // 1 minute
  });

  // Format currency with Naira symbol
  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString()}`;
  };

  const handleFundWallet = () => {
    setFundDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setFundDialogOpen(false);
  };

  if (error) {
    console.error('Error fetching wallet balance:', error);
  }

  return (
    <>
      <Card sx={{ 
        height: '100%', 
        borderRadius: 2,
        boxShadow: (theme) => theme.shadows[3]
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" component="h2" fontWeight="bold">
              Wallet Balance
            </Typography>
            <AccountBalanceWallet color="primary" />
          </Box>
          
          {isLoading ? (
            // Skeleton loading state
            <>
              <Box mb={3}>
                <Skeleton width={120} />
                <Skeleton width={180} height={60} />
                <Skeleton width={140} />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <Skeleton width={80} />
                  <Skeleton width={70} height={32} />
                </Grid>
                <Grid item xs={6}>
                  <Skeleton width={100} />
                  <Skeleton width={80} height={32} />
                </Grid>
              </Grid>
            </>
          ) : (
            <>
              <Box mb={3}>
                <Typography variant="body2" color="text.secondary">
                  Available Funds
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ my: 0.5 }}>
                  {wallet ? formatCurrency(wallet.totalBalance) : '₦0'}
                </Typography>
                <Typography 
                  variant="body2" 
                  color={wallet && wallet.monthlyChange >= 0 ? 'success.main' : 'error.main'}
                >
                  {wallet ? `${wallet.monthlyChange >= 0 ? '+' : ''}${formatCurrency(wallet.monthlyChange)} last month` : '₦0 last month'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TouchOptimizedButton 
                    startIcon={<Add />}
                    fullWidth
                    onClick={handleFundWallet}
                  >
                    Fund Wallet
                  </TouchOptimizedButton>
                </Grid>

                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Fiat Balance
                    </Typography>
                    <Typography variant="h6" fontWeight="medium">
                      {wallet ? formatCurrency(wallet.fiatBalance) : '₦0'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Crypto Balance
                    </Typography>
                    <Typography variant="h6" fontWeight="medium">
                      {wallet ? `$${wallet.cryptoBalance.usdcBalance.toLocaleString()} USDC` : '$0 USDC'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </CardContent>
      </Card>

      {/* Fund Wallet Dialog */}
      <Dialog open={fundDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Fund Your Wallet</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Choose a payment method to add funds to your wallet:
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Button 
                variant="outlined" 
                fullWidth 
                size="large"
                onClick={() => {
                  handleCloseDialog();
                  // Navigate to bank transfer page
                  window.location.href = '/payment/bank-transfer';
                }}
              >
                Bank Transfer
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button 
                variant="outlined" 
                fullWidth 
                size="large"
                onClick={() => {
                  handleCloseDialog();
                  // Navigate to card payment page
                  window.location.href = '/payment/card';
                }}
              >
                Card Payment
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                size="large"
                onClick={() => {
                  handleCloseDialog();
                  // Navigate to crypto payment page
                  window.location.href = '/payment/crypto';
                }}
              >
                Cryptocurrency
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WalletBalanceCard;