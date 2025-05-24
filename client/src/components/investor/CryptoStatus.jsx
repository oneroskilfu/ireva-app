import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Card, 
  CardContent, 
  Grid,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Button
} from '@mui/material';
import { Check, ArrowForward } from '@mui/icons-material';
import axios from 'axios';
import { useLocation } from 'wouter';

const CryptoStatus = () => {
  const [cryptoData, setCryptoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [_, navigate] = useLocation();

  useEffect(() => {
    const fetchCryptoStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/crypto/status');
        setCryptoData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching crypto status:', err);
        setError('Failed to load crypto data');
        setLoading(false);
      }
    };

    fetchCryptoStatus();
  }, []);

  const handleManageCrypto = () => {
    navigate('/investor/crypto');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Example crypto data structure
  const data = cryptoData || {
    cryptoEnabled: true,
    kycVerified: true,
    supportedCoins: [
      { id: 'btc', name: 'Bitcoin', symbol: 'BTC', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=013' },
      { id: 'eth', name: 'Ethereum', symbol: 'ETH', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=013' },
      { id: 'usdc', name: 'USD Coin', symbol: 'USDC', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=013' },
      { id: 'usdt', name: 'Tether', symbol: 'USDT', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=013' }
    ],
    recentTransactions: []
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
          Crypto Status
        </Typography>
        <Button 
          variant="outlined" 
          color="primary"
          endIcon={<ArrowForward />}
          onClick={handleManageCrypto}
          size="small"
        >
          Manage
        </Button>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Crypto Payments
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    {data.cryptoEnabled ? (
                      <>
                        <Check color="success" fontSize="small" sx={{ mr: 0.5 }} />
                        Enabled
                      </>
                    ) : (
                      'Disabled'
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    KYC Verification
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    {data.kycVerified ? (
                      <>
                        <Check color="success" fontSize="small" sx={{ mr: 0.5 }} />
                        Verified
                      </>
                    ) : (
                      <Chip label="Required" color="warning" size="small" />
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
        Supported Cryptocurrencies
      </Typography>
      
      <Grid container spacing={1}>
        {data.supportedCoins.map((coin) => (
          <Grid item xs={6} sm={3} key={coin.id}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={coin.logo} 
                  alt={coin.name}
                  sx={{ width: 24, height: 24, mr: 1 }}
                />
                <Typography variant="body2">
                  {coin.symbol}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Recent Crypto Transactions
      </Typography>
      
      {data.recentTransactions.length > 0 ? (
        <List sx={{ p: 0 }}>
          {data.recentTransactions.map((transaction) => (
            <ListItem key={transaction.id} sx={{ px: 0, py: 0.5 }}>
              <ListItemAvatar sx={{ minWidth: 40 }}>
                <Avatar 
                  src={transaction.coinLogo} 
                  alt={transaction.coinSymbol}
                  sx={{ width: 24, height: 24 }}
                />
              </ListItemAvatar>
              <ListItemText 
                primary={`${transaction.amount} ${transaction.coinSymbol}`}
                secondary={new Date(transaction.date).toLocaleDateString()}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              <Chip 
                label={transaction.status} 
                color={transaction.status === 'completed' ? 'success' : 'warning'} 
                size="small"
                variant="outlined"
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No recent crypto transactions
        </Typography>
      )}
    </Box>
  );
};

export default CryptoStatus;