import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Grid } from '@mui/material';
import { AccountBalanceWallet, Add } from '@mui/icons-material';
import axios from 'axios';
import { useLocation } from 'wouter';

const WalletBalanceCard = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [_, navigate] = useLocation();

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/wallet/balance');
        setWalletData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching wallet balance:', err);
        setError('Failed to load wallet data');
        setLoading(false);
      }
    };

    fetchWalletBalance();
  }, []);

  const handleAddFunds = () => {
    navigate('/investor/wallet/deposit');
  };

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
  const data = walletData || {
    balance: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    cryptoBalance: 0
  };

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <AccountBalanceWallet sx={{ mr: 1 }} /> Wallet Balance
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ textAlign: 'right' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            startIcon={<Add />}
            onClick={handleAddFunds}
            sx={{ borderRadius: '20px' }}
          >
            Add Funds
          </Button>
        </Grid>
      </Grid>
      
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Available Balance
          </Typography>
          <Typography variant="h4" component="p" sx={{ fontWeight: 'bold' }}>
            ${data.balance.toLocaleString()}
          </Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Crypto Balance
          </Typography>
          <Typography variant="h6" component="p">
            ${data.cryptoBalance.toLocaleString()}
          </Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Pending Deposits
          </Typography>
          <Typography variant="body1" component="p">
            ${data.pendingDeposits.toLocaleString()}
          </Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Pending Withdrawals
          </Typography>
          <Typography variant="body1" component="p">
            ${data.pendingWithdrawals.toLocaleString()}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WalletBalanceCard;