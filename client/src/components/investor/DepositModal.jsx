import React, { useState } from 'react';
import { 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { createCoinGateInvoice } from '../../services/cryptoService';
import { waitForTransaction } from '../../utils/web3Listeners';
import CustomSnackbar from '../CustomSnackbar';

/**
 * Modal for cryptocurrency deposit to escrow
 */
export default function DepositModal({ 
  open, 
  handleClose, 
  projectId, 
  projectName,
  userWalletAddress,
  onSuccess 
}) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cryptoCurrency, setCryptoCurrency] = useState('USDT');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setAmount('');
      setCryptoCurrency('USDT');
    }
  }, [open]);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid amount',
        severity: 'error'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Create CoinGate invoice
      const response = await createCoinGateInvoice({
        amount: parseFloat(amount),
        currency: cryptoCurrency,
        projectId,
        walletAddress: userWalletAddress,
        description: `Investment in ${projectName || 'Real Estate Project'}`
      });
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Payment portal generated. You will be redirected to complete your payment.',
        severity: 'success'
      });
      
      // Open CoinGate payment page in new tab
      window.open(response.payment_url, '_blank');
      
      // Close modal after a short delay to allow user to see the success message
      setTimeout(() => {
        handleClose();
        
        // Callback to parent component
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Deposit failed:', error);
      setSnackbar({
        open: true,
        message: `Payment failed: ${error.message || 'Please try again'}`,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const cryptoOptions = [
    { value: 'USDT', label: 'Tether (USDT)' },
    { value: 'USDC', label: 'USD Coin (USDC)' },
    { value: 'BTC', label: 'Bitcoin (BTC)' },
    { value: 'ETH', label: 'Ethereum (ETH)' }
  ];

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography variant="h6">Invest with Cryptocurrency</Typography>
          <Typography variant="body2" color="text.secondary">
            Secure your investment in {projectName || 'this project'} using crypto
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Investment Details
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={7}>
                <TextField
                  autoFocus
                  fullWidth
                  label="Amount"
                  type="number"
                  variant="outlined"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputProps={{
                    min: 1,
                    step: 0.01
                  }}
                  disabled={isLoading}
                />
              </Grid>
              
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth>
                  <InputLabel id="crypto-currency-label">Currency</InputLabel>
                  <Select
                    labelId="crypto-currency-label"
                    value={cryptoCurrency}
                    label="Currency"
                    onChange={(e) => setCryptoCurrency(e.target.value)}
                    disabled={isLoading}
                  >
                    {cryptoOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="body2" color="text.secondary">
              <strong>Important:</strong> After clicking "Proceed to Pay", you will be redirected to our secure payment provider
              where you can complete your transaction. Once payment is confirmed, funds will be automatically deposited into
              the project escrow.
            </Typography>
            
            {!userWalletAddress && (
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                You need to connect your wallet before making an investment.
              </Typography>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleClose} 
            color="inherit"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeposit} 
            variant="contained"
            disabled={isLoading || !userWalletAddress || !amount || parseFloat(amount) <= 0}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Processing...' : 'Proceed to Pay'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <CustomSnackbar
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        severity={snackbar.severity}
        message={snackbar.message}
      />
    </>
  );
}