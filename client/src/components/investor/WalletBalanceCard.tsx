import React from 'react';
import { Card, CardContent, Typography, Box, Button, Divider, Grid } from '@mui/material';
import { AccountBalanceWallet, Add } from '@mui/icons-material';
import TouchOptimizedButton from '../ui/TouchOptimizedButton';

const WalletBalanceCard: React.FC = () => {
  return (
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
        
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary">
            Available Funds
          </Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ my: 0.5 }}>
            ₦1,250,000
          </Typography>
          <Typography variant="body2" color="success.main">
            +₦250,000 last month
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TouchOptimizedButton 
              startIcon={<Add />}
              fullWidth
              onClick={() => console.log('Fund wallet')}
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
                ₦950,000
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Crypto Balance
              </Typography>
              <Typography variant="h6" fontWeight="medium">
                $880 USDC
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default WalletBalanceCard;