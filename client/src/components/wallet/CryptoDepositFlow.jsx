import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Typography, 
  TextField, 
  MenuItem, 
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Alert,
  Grid,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import QRCode from 'qrcode.react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import io from 'socket.io-client';

const StyledQRCode = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#ffffff',
  borderRadius: theme.shape.borderRadius,
  display: 'inline-flex',
  marginBottom: theme.spacing(2)
}));

const WalletAddress = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
  wordBreak: 'break-all',
  fontSize: '0.875rem'
}));

const CopyButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  minWidth: 'auto'
}));

const StatusCard = styled(Card)(({ theme, status }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: status === 'completed' 
    ? theme.palette.success.light
    : status === 'pending' 
      ? theme.palette.warning.light
      : theme.palette.grey[100],
  transition: 'background-color 0.3s ease'
}));

const steps = ['Select Cryptocurrency', 'Enter Amount', 'Payment Details', 'Confirmation'];

// Available cryptocurrencies for deposit
const cryptoOptions = [
  { value: 'BTC', label: 'Bitcoin (BTC)' },
  { value: 'ETH', label: 'Ethereum (ETH)' },
  { value: 'USDT', label: 'Tether (USDT)' },
  { value: 'USDC', label: 'USD Coin (USDC)' },
  { value: 'MATIC', label: 'Polygon (MATIC)' },
  { value: 'BNB', label: 'Binance Coin (BNB)' }
];

const CryptoDepositFlow = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [cryptoType, setCryptoType] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [depositData, setDepositData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [txStatus, setTxStatus] = useState('new');
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    // Get the current protocol and host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    // Create socket connection
    const socketIo = io(`${protocol}//${host}`, {
      path: '/socket.io'
    });
    
    socketIo.on('connect', () => {
      console.log('Socket connected:', socketIo.id);
    });
    
    socketIo.on('cryptoDepositUpdate', (data) => {
      console.log('Crypto deposit update received:', data);
      if (depositData && data.txnId === depositData.txnId) {
        setTxStatus(data.status);
        
        // If status is completed, move to the final step
        if (data.status === 'completed') {
          setActiveStep(3);
        }
      }
    });
    
    socketIo.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    setSocket(socketIo);
    
    // Clean up on unmount
    return () => {
      socketIo.disconnect();
    };
  }, [depositData]);

  const handleNext = () => {
    if (activeStep === 1) {
      handleSubmitDeposit();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setCryptoType('BTC');
    setAmount('');
    setDepositData(null);
    setTxStatus('new');
    setError('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  const handleSubmitDeposit = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mocking API call since we don't have the actual endpoint yet
      // In a real implementation, you would replace this with an actual API call
      // const response = await axios.post('/api/crypto/deposit', {
      //   amount: parseFloat(amount),
      //   cryptoType
      // });
      
      // Mock response data - this will be replaced with actual API response
      setTimeout(() => {
        const mockWalletAddress = cryptoType === 'BTC' 
          ? '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5' 
          : cryptoType === 'ETH'
          ? '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
          : cryptoType === 'USDT' || cryptoType === 'USDC'
          ? '0xdAC17F958D2ee523a2206206994597C13D831ec7'
          : cryptoType === 'MATIC'
          ? '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'
          : '0xB8c77482e45F1F44dE1745F52C74426C631bDD52'; // BNB
          
        const mockResponse = {
          txnId: `txn-${Date.now()}`,
          currency: cryptoType,
          amount: parseFloat(amount),
          status: 'pending',
          walletAddress: mockWalletAddress,
          paymentUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${mockWalletAddress}`,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour expiry
        };
        
        setDepositData(mockResponse);
        setTxStatus('pending');
        setActiveStep(2);
        setLoading(false);
        
        // Simulate transaction confirmation
        setTimeout(() => {
          setTxStatus('completed');
          setActiveStep(3);
        }, 15000); // 15 seconds
      }, 1500);
    } catch (err) {
      console.error('Error initiating deposit:', err);
      setError(err.response?.data?.error || 'Failed to initiate deposit. Please try again.');
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Cryptocurrency
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Choose the cryptocurrency you want to deposit into your iREVA wallet.
            </Typography>
            <TextField
              select
              fullWidth
              label="Cryptocurrency"
              value={cryptoType}
              onChange={(e) => setCryptoType(e.target.value)}
              variant="outlined"
              margin="normal"
            >
              {cryptoOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Enter Amount
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Specify the amount of {cryptoType} you want to deposit.
            </Typography>
            <TextField
              fullWidth
              label={`Amount (${cryptoType})`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              variant="outlined"
              margin="normal"
              type="number"
              InputProps={{
                inputProps: { min: 0, step: "0.00000001" }
              }}
              error={!!error}
              helperText={error}
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Details
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Send exactly {amount} {cryptoType} to the address below. The deposit will be credited to your account after blockchain confirmation.
            </Typography>
            
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, mb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="subtitle2" gutterBottom align="center">
                    Scan QR Code
                  </Typography>
                  <StyledQRCode>
                    <QRCode 
                      value={depositData?.walletAddress || ''}
                      size={150}
                      level="H"
                      includeMargin={true}
                    />
                  </StyledQRCode>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Wallet Address
                  </Typography>
                  <WalletAddress>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {depositData?.walletAddress}
                    </Typography>
                    <CopyButton 
                      size="small" 
                      onClick={() => copyToClipboard(depositData?.walletAddress)}
                      variant="outlined"
                    >
                      {copied ? <CheckCircleIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                    </CopyButton>
                  </WalletAddress>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Amount to Send
                  </Typography>
                  <Box sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {amount} {cryptoType}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Transaction Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {txStatus === 'pending' ? (
                      <PendingIcon sx={{ mr: 1, color: 'warning.main' }} />
                    ) : txStatus === 'completed' ? (
                      <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                    ) : (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    )}
                    <Typography>
                      {txStatus === 'pending' ? 'Pending Confirmation' : 
                       txStatus === 'completed' ? 'Confirmed' : 'Waiting for Payment'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Please note that it may take some time for your transaction to be confirmed on the blockchain.
              </Alert>
            </Paper>
            
            <StatusCard status={txStatus}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {txStatus === 'completed' ? 'Transaction Confirmed!' : 
                   txStatus === 'pending' ? 'Transaction Pending' : 
                   'Waiting for Payment'}
                </Typography>
                <Typography variant="body2">
                  {txStatus === 'completed' ? 
                    'Your deposit has been confirmed and credited to your account.' : 
                    txStatus === 'pending' ? 
                    'Your transaction has been detected and is awaiting blockchain confirmation.' : 
                    'Please send the exact amount to complete your deposit.'}
                </Typography>
              </CardContent>
            </StatusCard>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Deposit Successful
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              Your deposit of {amount} {cryptoType} has been confirmed and credited to your account!
            </Alert>
            
            <Paper sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Transaction Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Transaction ID
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {depositData?.txnId}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Amount
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {amount} {cryptoType}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ mr: 0.5, color: 'success.main', fontSize: 'small' }} />
                    <Typography variant="body2">
                      Completed
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Date
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    {new Date().toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                variant="contained" 
                onClick={handleReset}
                sx={{ mt: 2 }}
              >
                Make Another Deposit
              </Button>
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Box sx={{ mt: 2, p: 2 }}>
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || loading || activeStep === 3}
            onClick={handleBack}
          >
            Back
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button 
                variant="contained" 
                onClick={handleReset}
              >
                Start Over
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading || (activeStep === 1 && (!amount || parseFloat(amount) <= 0))}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : activeStep === steps.length - 2 ? (
                  'Confirm'
                ) : (
                  'Next'
                )}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CryptoDepositFlow;