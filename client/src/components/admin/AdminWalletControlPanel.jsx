import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningIcon from '@mui/icons-material/Warning';
import axios from 'axios';

// This component would ideally fetch real wallet data from the API
const AdminWalletControlPanel = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setLoading(true);
        // Replace with actual API endpoint when available
        const response = await axios.get('/api/admin/crypto-wallets');
        setWallets(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError('Failed to load wallet information');
        setLoading(false);
        
        // For development, use sample data
        const mockWallets = [
          { currency: 'BTC', balance: 1.243, address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5' },
          { currency: 'ETH', balance: 10.5, address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
          { currency: 'USDT', balance: 5000, address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
        ];
        setWallets(mockWallets);
      }
    };
    
    fetchWallets();
  }, []);

  const handleOpenWithdraw = (wallet) => {
    setSelectedWallet(wallet);
    setWithdrawAmount('');
    setWithdrawAddress('');
    setWithdrawError(null);
    setWithdrawSuccess(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedWallet(null);
  };

  const handleWithdraw = async () => {
    if (!selectedWallet) return;
    
    // Input validation
    if (!withdrawAmount || isNaN(parseFloat(withdrawAmount)) || parseFloat(withdrawAmount) <= 0) {
      setWithdrawError('Please enter a valid amount');
      return;
    }
    
    if (!withdrawAddress || withdrawAddress.trim() === '') {
      setWithdrawError('Please enter a valid destination address');
      return;
    }
    
    // Check if withdrawal amount exceeds balance
    if (parseFloat(withdrawAmount) > selectedWallet.balance) {
      setWithdrawError(`Withdrawal amount exceeds available ${selectedWallet.currency} balance`);
      return;
    }
    
    try {
      setWithdrawLoading(true);
      setWithdrawError(null);
      
      // Replace with actual API call when available
      // await axios.post('/api/admin/crypto-withdraw', {
      //   currency: selectedWallet.currency,
      //   amount: withdrawAmount,
      //   address: withdrawAddress
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setWithdrawSuccess(true);
      setWithdrawLoading(false);
      
      // Reset form after success
      setWithdrawAmount('');
      setWithdrawAddress('');
    } catch (err) {
      console.error('Withdrawal error:', err);
      setWithdrawError('Failed to process withdrawal. Please try again.');
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SecurityIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
        <Typography variant="h5">Admin Wallet Control Panel</Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          This panel allows administrators to manage and monitor the platform's crypto wallets.
          Always exercise caution when performing withdrawals.
        </Typography>
      </Alert>
      
      <Grid container spacing={2}>
        {wallets.map((wallet) => (
          <Grid item xs={12} sm={6} md={4} key={wallet.currency}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceWalletIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{wallet.currency} Wallet</Typography>
              </Box>
              
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Balance: {wallet.balance} {wallet.currency}
              </Typography>
              
              {wallet.address && (
                <Typography variant="body2" color="text.secondary" sx={{ 
                  mb: 2,
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  Address: {wallet.address}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => handleOpenWithdraw(wallet)}
                  color="primary"
                >
                  Withdraw
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  color="secondary"
                >
                  View Transactions
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {/* Withdrawal Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            Withdraw {selectedWallet?.currency}
          </Box>
        </DialogTitle>
        <DialogContent>
          {withdrawSuccess ? (
            <Alert severity="success" sx={{ my: 2 }}>
              Withdrawal request has been submitted successfully.
            </Alert>
          ) : (
            <>
              <Alert severity="warning" sx={{ mb: 3, mt: 1 }}>
                <Typography variant="body2">
                  You are about to withdraw funds from the platform wallet.
                  This action cannot be reversed. Please double-check all details before confirming.
                </Typography>
              </Alert>
              
              {withdrawError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {withdrawError}
                </Alert>
              )}
              
              <TextField
                label="Withdrawal Amount"
                type="number"
                fullWidth
                margin="normal"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                InputProps={{
                  endAdornment: <Typography variant="body2">{selectedWallet?.currency}</Typography>,
                }}
                disabled={withdrawLoading}
              />
              
              <TextField
                label="Destination Address"
                fullWidth
                margin="normal"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder={`Enter ${selectedWallet?.currency} address`}
                disabled={withdrawLoading}
              />
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Available balance: {selectedWallet?.balance} {selectedWallet?.currency}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {withdrawSuccess ? 'Close' : 'Cancel'}
          </Button>
          {!withdrawSuccess && (
            <Button 
              onClick={handleWithdraw} 
              variant="contained" 
              color="warning"
              disabled={withdrawLoading}
            >
              {withdrawLoading ? <CircularProgress size={24} /> : 'Confirm Withdrawal'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminWalletControlPanel;