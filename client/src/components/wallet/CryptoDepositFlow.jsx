import React, { useState } from 'react';
import { 
  Box, 
  Container,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import CryptoDepositForm from './CryptoDepositForm';
import CryptoWalletAddressDisplay from './CryptoWalletAddressDisplay';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

const steps = ['Enter Amount', 'Generate Wallet Address', 'Make Payment'];

const CryptoDepositFlow = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [depositInfo, setDepositInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentReceived, setPaymentReceived] = useState(false);

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace with actual API call to generate a deposit address
      // const response = await axios.post('/api/crypto/deposit/new', formData);
      
      // For development, mock the API response
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockResponse = {
        depositId: 'dep_' + Math.random().toString(36).substring(2, 10),
        currency: formData.currency,
        amount: formData.amount,
        walletAddress: formData.currency === 'BTC' 
          ? '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5' 
          : formData.currency === 'ETH'
          ? '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
          : '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + 
          (formData.currency === 'BTC' 
            ? '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5' 
            : formData.currency === 'ETH'
            ? '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
            : '0xdAC17F958D2ee523a2206206994597C13D831ec7'),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
      };
      
      setDepositInfo(mockResponse);
      setLoading(false);
      setActiveStep(1);
    } catch (err) {
      console.error('Error generating deposit address:', err);
      setError('Failed to generate deposit address. Please try again.');
      setLoading(false);
    }
  };

  // Function to simulate checking payment status
  const checkPaymentStatus = async () => {
    if (!depositInfo) return;
    
    try {
      setLoading(true);
      // In a real implementation, we would call an API endpoint to check the status
      // await axios.get(`/api/crypto/deposit/${depositInfo.depositId}/status`);
      
      // For development, simulate an API call with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      const randomSuccess = Math.random() > 0.5;
      
      if (randomSuccess) {
        setPaymentReceived(true);
        setActiveStep(2);
      } else {
        setError('No payment detected yet. Please make the payment or wait for blockchain confirmation.');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error checking payment status:', err);
      setError('Failed to check payment status. Please try again.');
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    if (depositInfo?.walletAddress) {
      navigator.clipboard.writeText(depositInfo.walletAddress);
    }
  };

  const handleDownloadQR = () => {
    if (depositInfo?.qrCodeUrl) {
      // In a real implementation, we would provide a proper download mechanism
      window.open(depositInfo.qrCodeUrl, '_blank');
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setDepositInfo(null);
    setError(null);
    setPaymentReceived(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Crypto Deposit
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Follow the steps below to deposit cryptocurrency into your iREVA account.
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {activeStep === 0 && (
          <CryptoDepositForm onSubmit={handleFormSubmit} />
        )}
        
        {activeStep === 1 && depositInfo && (
          <Box>
            <CryptoWalletAddressDisplay 
              walletAddress={depositInfo.walletAddress}
              currency={depositInfo.currency}
              amount={depositInfo.amount}
              qrCodeUrl={depositInfo.qrCodeUrl}
              expiresAt={depositInfo.expiresAt}
              onCopyAddress={handleCopyAddress}
              onDownloadQR={handleDownloadQR}
              isLoading={loading}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                startIcon={<ArrowBackIcon />}
              >
                Start Over
              </Button>
              <Button
                variant="contained"
                onClick={checkPaymentStatus}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Check Payment Status'}
              </Button>
            </Box>
          </Box>
        )}
        
        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Payment Received!
              </Typography>
              <Typography variant="body2">
                Your deposit of {depositInfo?.amount} {depositInfo?.currency} has been received.
                It may take a few minutes for the funds to be credited to your account.
              </Typography>
            </Alert>
            
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                onClick={handleReset}
              >
                Make Another Deposit
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CryptoDepositFlow;