// client/src/pages/admin/WalletManagement.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Breadcrumbs,
  Link,
  Grid,
  Paper,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Alert,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Refresh, 
  ArrowCircleUp, 
  ArrowCircleDown,
  AccountBalanceWallet
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import WalletControlPanel from '../../components/admin/WalletControlPanel';

export default function WalletManagement() {
  const [tabValue, setTabValue] = React.useState(0);
  const [amount, setAmount] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFundWallet = (type) => {
    // In a real app, this would call an API endpoint
    console.log(`${type} wallet with ${amount}`);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setAmount('');
  };

  return (
    <AdminLayout title="Wallet Management">
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link color="inherit" href="/admin/dashboard">
          Admin Dashboard
        </Link>
        <Typography color="text.primary">Wallet Management</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AccountBalanceWallet sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Platform Wallet Management
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage platform wallets, monitor transactions, and handle fund transfers between system accounts.
      </Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Wallet operation completed successfully!
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Wallet Operations
            </Typography>
            
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              sx={{ mb: 2 }}
            >
              <Tab label="Fund" />
              <Tab label="Withdraw" />
              <Tab label="Transfer" />
            </Tabs>
            
            <Box sx={{ mt: 2 }}>
              {tabValue === 0 && (
                <>
                  <TextField
                    label="Amount (₦)"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => handleFundWallet('main')}
                      startIcon={<ArrowCircleDown />}
                    >
                      Fund Main
                    </Button>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      onClick={() => handleFundWallet('escrow')}
                      startIcon={<ArrowCircleDown />}
                    >
                      Fund Escrow
                    </Button>
                  </Box>
                </>
              )}
              
              {tabValue === 1 && (
                <>
                  <TextField
                    label="Amount (₦)"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => handleFundWallet('withdraw-main')}
                      startIcon={<ArrowCircleUp />}
                    >
                      From Main
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      onClick={() => handleFundWallet('withdraw-escrow')}
                      startIcon={<ArrowCircleUp />}
                    >
                      From Escrow
                    </Button>
                  </Box>
                </>
              )}
              
              {tabValue === 2 && (
                <>
                  <TextField
                    label="Amount (₦)"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      variant="contained" 
                      color="info"
                      onClick={() => handleFundWallet('transfer-to-escrow')}
                    >
                      Main → Escrow
                    </Button>
                    <Button 
                      variant="contained" 
                      color="info"
                      onClick={() => handleFundWallet('transfer-to-main')}
                    >
                      Escrow → Main
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<Refresh />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Refresh Balances
            </Button>
            <Button 
              variant="outlined" 
              color="secondary"
              fullWidth
              sx={{ mb: 2 }}
            >
              Export Transaction Log
            </Button>
            <Button 
              variant="outlined" 
              color="warning"
              fullWidth
            >
              Reconcile Accounts
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <WalletControlPanel />
        </Grid>
      </Grid>
    </AdminLayout>
  );
}