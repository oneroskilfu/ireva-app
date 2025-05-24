import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, MenuItem, FormControl, InputLabel, Select, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '@/hooks/use-auth';

const WithdrawalRequestForm = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [currency, setCurrency] = useState('USDT');
  const [network, setNetwork] = useState('ethereum');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const networkOptions = [
    { value: 'ethereum', label: 'Ethereum (ERC-20)' },
    { value: 'binance', label: 'Binance Smart Chain (BEP-20)' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'solana', label: 'Solana' },
    { value: 'avalanche', label: 'Avalanche' }
  ];
  
  const currencies = [
    { value: 'USDT', label: 'Tether (USDT)' },
    { value: 'USDC', label: 'USD Coin (USDC)' },
    { value: 'ETH', label: 'Ethereum (ETH)' },
    { value: 'BTC', label: 'Bitcoin (BTC)' }
  ];

  useEffect(() => {
    // Reset the form when network changes
    if (network === 'solana') {
      // If Solana is selected, only USDC and USDT are available
      if (currency !== 'USDT' && currency !== 'USDC') {
        setCurrency('USDC');
      }
    }
  }, [network, currency]);

  const validateForm = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    if (!walletAddress) {
      setError('Please enter a wallet address');
      return false;
    }

    // Validate wallet address format based on the network
    // This is a simplified validation, you should use more comprehensive validation in production
    let isValidWallet = true;
    let addressMinLength = 30; // Default minimum length
    
    if (network === 'ethereum' || network === 'binance' || network === 'polygon' || network === 'avalanche') {
      isValidWallet = walletAddress.startsWith('0x') && walletAddress.length >= 42;
    } else if (network === 'solana') {
      isValidWallet = walletAddress.length >= 32;
      addressMinLength = 32;
    }
    
    if (!isValidWallet) {
      setError(`Invalid wallet address format for ${network}. Address should be at least ${addressMinLength} characters long.`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setMessage('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await axios.post('/api/withdrawals/request', {
        amount: parseFloat(amount),
        walletAddress,
        currency,
        network
      });
      
      setMessage('Withdrawal request submitted successfully!');
      // Reset form
      setAmount('');
      setWalletAddress('');
      setCurrency('USDT');
      setNetwork('ethereum');
    } catch (err) {
      console.error('Withdrawal request error:', err);
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: 3, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper' }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>Request Withdrawal</Typography>
      
      {message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="currency-label">Currency</InputLabel>
        <Select
          labelId="currency-label"
          value={currency}
          label="Currency"
          onChange={(e) => setCurrency(e.target.value)}
        >
          {currencies
            .filter(c => !(network === 'solana' && c.value !== 'USDT' && c.value !== 'USDC'))
            .map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))
          }
        </Select>
      </FormControl>
      
      <TextField
        fullWidth
        label="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        margin="normal"
        InputProps={{
          inputProps: { min: 0, step: 0.01 }
        }}
      />
      
      <FormControl fullWidth sx={{ my: 2 }}>
        <InputLabel id="network-label">Network</InputLabel>
        <Select
          labelId="network-label"
          value={network}
          label="Network"
          onChange={(e) => setNetwork(e.target.value)}
        >
          {networkOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <TextField
        fullWidth
        label="Wallet Address"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        margin="normal"
        placeholder={network === 'ethereum' ? '0x...' : network === 'solana' ? 'Solana Address' : 'Wallet Address'}
        helperText={`Enter your ${network} wallet address. Double-check to avoid loss of funds.`}
      />
      
      <Typography variant="caption" display="block" color="text.secondary" mb={2}>
        Note: Withdrawal processing may take 1-3 business days. Minimum withdrawal amount is $10.
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        fullWidth
        size="large"
        disabled={isLoading}
        sx={{ mt: 2, py: 1.5 }}
      >
        {isLoading ? 'Processing...' : 'Submit Withdrawal Request'}
      </Button>
    </Box>
  );
};

export default WithdrawalRequestForm;