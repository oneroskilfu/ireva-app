import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import InvestorWalletOverview from './InvestorWalletOverview';
import CryptoWalletOverview from './CryptoWalletOverview';

const WalletDemo = () => {
  // Sample props for testing
  const wallet = {
    balance: '0.5821',
    currency: 'BTC',
    fiatValue: '₦8,300,000'
  };

  const fiatWallet = {
    balance: '250,000.00',
    currency: 'NGN',
    fiatValue: '₦250,000.00'
  };

  const cryptoWallets = [
    {
      balance: '0.5821',
      currency: 'BTC',
      fiatValue: '₦8,300,000',
      network: 'bitcoin',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    },
    {
      balance: '3.25',
      currency: 'ETH',
      fiatValue: '₦2,450,000',
      network: 'ethereum',
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Wallet Components Demo
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>Standard Wallet Component</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Displaying the standard wallet component with Bitcoin balance.
            </Typography>
            <InvestorWalletOverview wallet={wallet} />
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>Fiat Wallet View</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Displaying the standard wallet component with Nigerian Naira balance.
            </Typography>
            <InvestorWalletOverview wallet={fiatWallet} />
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>Enhanced Crypto Wallet Component</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Displaying the enhanced crypto wallet component with tabbed interface.
            </Typography>
            <CryptoWalletOverview wallet={fiatWallet} cryptoWallets={cryptoWallets} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default WalletDemo;