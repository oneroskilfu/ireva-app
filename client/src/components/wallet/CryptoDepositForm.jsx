import React, { useState } from 'react';
import { Box, Button, TextField, MenuItem, Typography, Alert } from '@mui/material';

const cryptoOptions = [
  { label: 'Bitcoin (BTC)', value: 'BTC' },
  { label: 'Ethereum (ETH)', value: 'ETH' },
  { label: 'USDT (ERC20)', value: 'USDT' },
];

const CryptoDepositForm = ({ onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('BTC');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit({ amount, currency });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, maxWidth: 400 }}>
      <Typography variant="h6" mb={2}>Deposit Crypto</Typography>
      <TextField
        fullWidth
        label="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        margin="normal"
      />
      <TextField
        select
        fullWidth
        label="Currency"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        margin="normal"
      >
        {cryptoOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ))}
      </TextField>
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Generate Wallet</Button>
      {status === 'success' && <Alert severity="success" sx={{ mt: 2 }}>Wallet generated successfully!</Alert>}
      {status === 'error' && <Alert severity="error" sx={{ mt: 2 }}>Something went wrong.</Alert>}
    </Box>
  );
};

export default CryptoDepositForm;