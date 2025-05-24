import React from 'react';
import { Card, CardContent, Typography, Grid, Button, Box } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMadeIcon from '@mui/icons-material/CallMade';

const InvestorWalletOverview = ({ wallet }) => {
  return (
    <Card sx={{ borderRadius: 2, p: 2, backgroundColor: '#f9fafb' }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center">
              <AccountBalanceWalletIcon fontSize="large" color="primary" />
              <Box ml={2}>
                <Typography variant="h6">Wallet Balance</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {wallet?.balance || '0.00'} {wallet?.currency || 'USDT'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ≈ {wallet?.fiatValue || '₦0.00'} (NGN)
                </Typography>
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
                  Deposit
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CallMadeIcon />}
                  color="warning"
                >
                  Withdraw
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="text"
                  startIcon={<SwapHorizIcon />}
                >
                  View History
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default InvestorWalletOverview;