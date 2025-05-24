import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button, 
  Box,
  Tabs,
  Tab,
  Chip,
  Divider
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMadeIcon from '@mui/icons-material/CallMade';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';

const CryptoWalletOverview = ({ wallet, cryptoWallets = [] }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Get the currently active wallet based on tab
  const getActiveWallet = () => {
    if (activeTab === 0) {
      return wallet; // Fiat wallet
    } else {
      // Return first crypto wallet or empty object if none exists
      return cryptoWallets[0] || { balance: '0.00', currency: 'USDT', fiatValue: '₦0.00' };
    }
  };

  const activeWallet = getActiveWallet();

  return (
    <Card sx={{ borderRadius: 2, p: 2, backgroundColor: '#f9fafb' }}>
      <CardContent>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          sx={{ mb: 3 }}
          centered
        >
          <Tab label="Fiat Wallet" icon={<AccountBalanceWalletIcon />} iconPosition="start" />
          <Tab label="Crypto Wallet" icon={<CurrencyBitcoinIcon />} iconPosition="start" />
        </Tabs>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center">
              {activeTab === 0 ? 
                <AccountBalanceWalletIcon fontSize="large" color="primary" /> : 
                <CurrencyBitcoinIcon fontSize="large" color="warning" />
              }
              <Box ml={2}>
                <Typography variant="h6">
                  {activeTab === 0 ? 'Wallet Balance' : 'Crypto Balance'}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {activeWallet?.balance || '0.00'} {activeWallet?.currency || 'USDT'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ≈ {activeWallet?.fiatValue || '₦0.00'} (NGN)
                </Typography>
                
                {activeTab === 1 && (
                  <Chip 
                    label="Crypto payments accepted" 
                    size="small" 
                    color="success" 
                    sx={{ mt: 1 }} 
                    variant="outlined" 
                  />
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CallReceivedIcon />}
                  color="success"
                >
                  {activeTab === 0 ? 'Deposit' : 'Receive Crypto'}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CallMadeIcon />}
                  color="warning"
                >
                  {activeTab === 0 ? 'Withdraw' : 'Send Crypto'}
                </Button>
              </Grid>
              <Grid item xs={12}>
                {activeTab === 0 ? (
                  <Button
                    fullWidth
                    variant="text"
                    startIcon={<SwapHorizIcon />}
                  >
                    View History
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="text"
                    startIcon={<CurrencyExchangeIcon />}
                  >
                    View Transactions
                  </Button>
                )}
              </Grid>
            </Grid>
          </Grid>
          
          {activeTab === 1 && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Supported Cryptocurrencies
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                <Chip label="BTC" size="small" />
                <Chip label="ETH" size="small" />
                <Chip label="USDT" size="small" />
                <Chip label="USDC" size="small" />
                <Chip label="MATIC" size="small" />
                <Chip label="BNB" size="small" />
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CryptoWalletOverview;