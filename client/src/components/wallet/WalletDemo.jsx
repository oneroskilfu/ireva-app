import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  Divider 
} from '@mui/material';
import InvestorWalletOverview from './InvestorWalletOverview';
import CryptoWalletOverview from './CryptoWalletOverview';
import CryptoDepositFlow from './CryptoDepositFlow';
import AdminWalletControlPanel from '../admin/AdminWalletControlPanel';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const WalletDemo = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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
      
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab icon={<AccountBalanceWalletIcon />} label="Wallet Components" />
          <Tab icon={<AddCircleOutlineIcon />} label="Deposit Flow" />
          <Tab icon={<AdminPanelSettingsIcon />} label="Admin Control Panel" />
        </Tabs>
      </Paper>
      
      {activeTab === 0 && (
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
      )}
      
      {activeTab === 1 && (
        <Box>
          <Paper sx={{ p: 2, mb: 4 }}>
            <Typography variant="h5" gutterBottom>Crypto Deposit Flow</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Complete user journey for crypto deposits with step-by-step process.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <CryptoDepositFlow />
          </Paper>
        </Box>
      )}
      
      {activeTab === 2 && (
        <Box>
          <Paper sx={{ p: 2, mb: 4 }}>
            <Typography variant="h5" gutterBottom>Admin Wallet Control Panel</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Interface for administrators to manage platform wallets and handle withdrawals.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <AdminWalletControlPanel />
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default WalletDemo;