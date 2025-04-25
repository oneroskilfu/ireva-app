import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Tabs, 
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import CryptoWalletOverview from '../../components/wallet/CryptoWalletOverview';
import InvestorWalletOverview from '../../components/wallet/InvestorWalletOverview';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import PaymentIcon from '@mui/icons-material/Payment';
import axios from 'axios';

const WalletPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [cryptoWallets, setCryptoWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('activity');
  const [walletType, setWalletType] = useState('standard');

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch wallet data
        const walletResponse = await axios.get('/api/wallet');
        setWalletData(walletResponse.data);
        
        // Fetch crypto wallets if any
        try {
          const cryptoResponse = await axios.get('/api/crypto/wallets');
          setCryptoWallets(cryptoResponse.data);
        } catch (cryptoErr) {
          console.log('No crypto wallets found or not enabled:', cryptoErr);
          // Non-critical error, continue with fiat wallet only
        }
        
        // Fetch recent transactions
        const transactionsResponse = await axios.get('/api/transactions/recent');
        setTransactions(transactionsResponse.data);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError('Unable to load wallet data. Please try again later.');
        setIsLoading(false);
        
        // For development, use sample data
        setWalletData({
          id: 'sample-wallet-id',
          balance: '15,000.00',
          currency: 'NGN',
          fiatValue: '₦15,000.00',
          status: 'active'
        });
        
        setCryptoWallets([
          {
            id: 'crypto-wallet-1',
            balance: '0.025',
            currency: 'ETH',
            fiatValue: '₦70,000.00',
            network: 'ethereum',
            address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
          }
        ]);
        
        setTransactions([
          {
            id: 'txn-1001',
            type: 'deposit',
            amount: '5,000.00',
            currency: 'NGN',
            status: 'completed',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'txn-1002',
            type: 'investment',
            amount: '3,500.00',
            currency: 'NGN',
            status: 'completed',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          }
        ]);
      }
    };
    
    fetchWalletData();
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleWalletTypeChange = (event, newValue) => {
    setWalletType(newValue);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Investor Wallet
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={walletType} 
          onChange={handleWalletTypeChange} 
          aria-label="wallet type tabs"
          sx={{ mb: 2 }}
        >
          <Tab value="standard" label="Standard Wallet" />
          <Tab value="crypto" label="Crypto Wallet" />
        </Tabs>
        
        {walletType === 'standard' ? (
          <InvestorWalletOverview wallet={walletData} />
        ) : (
          <CryptoWalletOverview wallet={walletData} cryptoWallets={cryptoWallets} />
        )}
      </Box>
      
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="wallet tabs"
          sx={{ px: 2, pt: 2 }}
        >
          <Tab value="activity" label="Recent Activity" />
          <Tab value="payments" label="Payment Methods" />
        </Tabs>
        
        <Divider />
        
        <Box p={3}>
          {activeTab === 'activity' ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Transaction History
              </Typography>
              
              {transactions.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No transactions found.
                </Typography>
              ) : (
                <List>
                  {transactions.map((transaction) => (
                    <React.Fragment key={transaction.id}>
                      <ListItem>
                        <ListItemIcon>
                          <SwapVertIcon color={transaction.type === 'deposit' ? 'success' : 'primary'} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`${transaction.type === 'deposit' ? 'Deposit' : 'Investment'} - ${transaction.amount} ${transaction.currency}`}
                          secondary={new Date(transaction.date).toLocaleString()}
                        />
                        <Typography variant="caption" sx={{ 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1, 
                          bgcolor: transaction.status === 'completed' ? 'success.100' : 'warning.100',
                          color: transaction.status === 'completed' ? 'success.800' : 'warning.800'
                        }}>
                          {transaction.status}
                        </Typography>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Payment Methods
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <PaymentIcon sx={{ mr: 2 }} color="primary" />
                        <Typography variant="h6">Bank Transfer</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Fund your wallet via bank transfer for instant access to investment opportunities.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <CryptoWalletIcon sx={{ mr: 2 }} color="warning" />
                        <Typography variant="h6">Cryptocurrency</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Make deposits using various cryptocurrencies like BTC, ETH, USDT, and others.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

// Custom icon for crypto wallet
const CryptoWalletIcon = (props) => {
  return (
    <Box component="svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12,1L3,5v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12V5L12,1z M14.5,12.59l0.9,3.88L12,14.42l-3.4,2.05l0.9-3.87 l-3-2.59l3.96-0.34L12,6.02l1.54,3.64L17.5,10L14.5,12.59z" />
    </Box>
  );
};

export default WalletPage;