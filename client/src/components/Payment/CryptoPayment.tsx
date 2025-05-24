import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  CircularProgress, 
  Divider,
  Alert,
  AlertTitle,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton
} from '@mui/material';
import { 
  Wallet,
  ContentCopy,
  QrCode,
  CheckCircle,
  DoNotDisturb,
  AccessTime,
  Link as LinkIcon,
  Refresh,
  Info
} from '@mui/icons-material';
import { FaEthereum, FaBitcoin } from 'react-icons/fa';
import { SiBitcoin, SiEthereum, SiTether } from 'react-icons/si';
import QRCode from 'qrcode.react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import ConnectWalletButton, { WalletState, ConnectionStatus } from '../Wallet/ConnectWalletButton';

// Available stablecoins
enum StableCoin {
  USDT = 'USDT',
  USDC = 'USDC',
  DAI = 'DAI'
}

// Available networks
enum Network {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  BINANCE = 'binance'
}

// Payment status
enum PaymentStatus {
  CREATED = 'created',
  PENDING = 'pending',
  PROCESSING = 'processing',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
  REFUNDED = 'refunded'
}

// Payment data
interface CryptoPaymentData {
  id: string;
  userId: number;
  propertyId: number;
  amount: number;
  amountInCrypto: string;
  walletAddress: string;
  network: string;
  currency: string;
  status: PaymentStatus;
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  paymentUrl?: string;
  paymentAddress?: string;
}

// Exchange rates
interface ExchangeRates {
  USDT: number;
  USDC: number;
  DAI: number;
  ETH: number;
  BTC: number;
}

// Component Props
interface CryptoPaymentProps {
  propertyId: number;
  amount: number;
  onPaymentComplete?: (paymentData: CryptoPaymentData) => void;
  onCancel?: () => void;
}

const CryptoPayment: React.FC<CryptoPaymentProps> = ({
  propertyId,
  amount,
  onPaymentComplete,
  onCancel
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState(StableCoin.USDT);
  const [selectedNetwork, setSelectedNetwork] = useState(Network.ETHEREUM);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [walletState, setWalletState] = useState<WalletState | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    USDT: 1, // 1:1 with USD
    USDC: 1, // 1:1 with USD
    DAI: 1.01, // Slight variance
    ETH: 3000, // 1 ETH = $3000 (example)
    BTC: 60000 // 1 BTC = $60000 (example)
  });
  const [showTxDialog, setShowTxDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get payment data from API
  const { data: payment, isLoading: isPaymentLoading, error: paymentError, refetch: refetchPayment } = 
    useQuery({
      queryKey: ['/api/crypto/payments', paymentId],
      queryFn: getQueryFn,
      enabled: !!paymentId
    });

  // Custom query function
  async function getQueryFn() {
    if (!paymentId) return null;
    const res = await apiRequest('GET', `/api/crypto/payments/${paymentId}`);
    return res.json();
  }

  // Create a payment
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/crypto/payments', {
        propertyId,
        amount,
        currency: selectedCurrency,
        network: selectedNetwork,
        walletAddress: walletState?.address || null
      });
      return res.json();
    },
    onSuccess: (data: CryptoPaymentData) => {
      setPaymentId(data.id);
      toast({
        title: 'Payment initiated',
        description: 'Crypto payment has been created. Please complete the transaction.',
        variant: 'default'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Payment creation failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Check payment status periodically
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (paymentId && payment?.status === PaymentStatus.PENDING) {
      intervalId = setInterval(() => {
        refetchPayment();
      }, 15000); // Check every 15 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [paymentId, payment?.status, refetchPayment]);
  
  // Handle payment completion
  useEffect(() => {
    if (payment && 
      (payment.status === PaymentStatus.CONFIRMED || 
       payment.status === PaymentStatus.COMPLETED)) {
      onPaymentComplete?.(payment);
      
      toast({
        title: 'Payment confirmed',
        description: 'Your crypto payment has been confirmed!',
        variant: 'default'
      });
    }
  }, [payment, onPaymentComplete, toast]);
  
  // Get current exchange rates for display
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        // In a real app, we'd fetch from an API like CoinGecko
        // const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,usd-coin,dai&vs_currencies=usd');
        // const data = await response.json();
        
        // For demo purposes, updating with simulated changing rates
        setExchangeRates({
          USDT: 1,
          USDC: 1,
          DAI: 1 + (Math.random() * 0.02 - 0.01), // Small variance around 1
          ETH: 3000 + (Math.random() * 100 - 50), // Variance of ±$50
          BTC: 60000 + (Math.random() * 1000 - 500) // Variance of ±$500
        });
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      }
    };
    
    fetchExchangeRates();
    const interval = setInterval(fetchExchangeRates, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle wallet connection
  const handleWalletConnected = (walletState: WalletState) => {
    setWalletState(walletState);
    toast({
      title: 'Wallet connected',
      description: `Connected to ${walletState.address?.substring(0, 8)}...`,
      variant: 'default'
    });
  };
  
  // Calculate crypto amount based on fiat amount
  const calculateCryptoAmount = (fiatAmount: number, currency: string): string => {
    switch (currency) {
      case StableCoin.USDT:
      case StableCoin.USDC:
        return fiatAmount.toFixed(2); // 1:1 with USD
      case StableCoin.DAI:
        return (fiatAmount / exchangeRates.DAI).toFixed(2);
      default:
        return fiatAmount.toFixed(2);
    }
  };
  
  // Get currency icon
  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case StableCoin.USDT:
      case StableCoin.USDC:
        return <SiTether />;
      case StableCoin.DAI:
        return <SiEthereum />;
      default:
        return <SiTether />;
    }
  };
  
  // Get status chip color
  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.CONFIRMED:
      case PaymentStatus.COMPLETED:
        return 'success';
      case PaymentStatus.PENDING:
      case PaymentStatus.PROCESSING:
        return 'warning';
      case PaymentStatus.FAILED:
      case PaymentStatus.EXPIRED:
      case PaymentStatus.REFUNDED:
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.CONFIRMED:
      case PaymentStatus.COMPLETED:
        return <CheckCircle />;
      case PaymentStatus.PENDING:
      case PaymentStatus.PROCESSING:
        return <AccessTime />;
      case PaymentStatus.FAILED:
      case PaymentStatus.EXPIRED:
      case PaymentStatus.REFUNDED:
        return <DoNotDisturb />;
      default:
        return <Info />;
    }
  };
  
  // Initiate payment
  const initiatePayment = () => {
    createPaymentMutation.mutate();
  };
  
  // Cancel payment
  const cancelPayment = () => {
    onCancel?.();
  };
  
  // Copy address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Address has been copied to clipboard',
      variant: 'default'
    });
  };
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };
  
  // Format time remaining
  const formatTimeRemaining = (expiryDate: Date) => {
    const now = new Date();
    const expiryTime = new Date(expiryDate);
    const diffMs = expiryTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (diffHours > 0) {
      return `${diffHours}h ${mins}m`;
    } else {
      return `${mins} minutes`;
    }
  };
  
  // Render transaction details dialog
  const renderTransactionDialog = () => {
    if (!payment) return null;
    
    return (
      <Dialog open={showTxDialog} onClose={() => setShowTxDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Transaction Details
        </DialogTitle>
        <DialogContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell><strong>Transaction ID</strong></TableCell>
                <TableCell>{payment.id}</TableCell>
              </TableRow>
              {payment.txHash && (
                <TableRow>
                  <TableCell><strong>Blockchain Transaction Hash</strong></TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {payment.txHash}
                      <IconButton 
                        size="small" 
                        onClick={() => copyToClipboard(payment.txHash as string)}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                      {payment.network === Network.ETHEREUM && (
                        <IconButton 
                          size="small" 
                          component="a" 
                          href={`https://etherscan.io/tx/${payment.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell>${amount.toFixed(2)} USD ({payment.amountInCrypto} {payment.currency})</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell>
                  <Chip 
                    icon={getStatusIcon(payment.status)}
                    label={payment.status.toUpperCase()}
                    color={getStatusColor(payment.status) as any}
                    size="small"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Payment Address</strong></TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {payment.paymentAddress}
                    <IconButton 
                      size="small" 
                      onClick={() => copyToClipboard(payment.paymentAddress || '')}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Network</strong></TableCell>
                <TableCell>{payment.network}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Created At</strong></TableCell>
                <TableCell>{new Date(payment.createdAt).toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Expires At</strong></TableCell>
                <TableCell>{new Date(payment.expiresAt).toLocaleString()} ({formatTimeRemaining(payment.expiresAt)})</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    );
  };

  // If we're done, show the result
  if (payment && (payment.status === PaymentStatus.CONFIRMED || payment.status === PaymentStatus.COMPLETED)) {
    return (
      <Box>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
              <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>Payment Confirmed!</Typography>
              <Typography variant="body1" gutterBottom>
                Your payment of ${amount.toFixed(2)} ({payment.amountInCrypto} {payment.currency}) has been confirmed.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setShowTxDialog(true)}
                startIcon={<Info />}
                sx={{ mt: 2 }}
              >
                View Transaction Details
              </Button>
            </Box>
          </CardContent>
        </Card>
        {renderTransactionDialog()}
      </Box>
    );
  }

  // If we're in the payment process
  if (paymentId && payment) {
    return (
      <Box>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Payment Details</Typography>
              <Chip 
                icon={getStatusIcon(payment.status)}
                label={payment.status.toUpperCase()}
                color={getStatusColor(payment.status) as any}
                size="small"
              />
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Typography variant="body1" gutterBottom>Please send</Typography>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {payment.amountInCrypto} {payment.currency}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ≈ ${amount.toFixed(2)} USD
              </Typography>
              
              <Box mt={2} mb={3}>
                <QRCode value={`${payment.paymentAddress}`} size={180} />
              </Box>
              
              <Box display="flex" alignItems="center" bgcolor="grey.100" p={1.5} borderRadius={1} width="100%" mb={2}>
                <Typography variant="body2" sx={{ mr: 1, fontFamily: 'monospace', flexGrow: 1, overflowX: 'auto' }}>
                  {payment.paymentAddress}
                </Typography>
                <IconButton size="small" onClick={() => copyToClipboard(payment.paymentAddress || '')}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
              
              <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
                <AlertTitle>Payment window</AlertTitle>
                This payment request will expire in {formatTimeRemaining(payment.expiresAt)}
              </Alert>
              
              {payment.status === PaymentStatus.PENDING && (
                <Button
                  variant="outlined"
                  onClick={() => refetchPayment()}
                  startIcon={<Refresh />}
                >
                  Check Payment Status
                </Button>
              )}
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" flexDirection="column">
              <Typography variant="subtitle2" gutterBottom>Instructions:</Typography>
              <Typography variant="body2" gutterBottom>
                1. Send exactly {payment.amountInCrypto} {payment.currency} to the address above.
              </Typography>
              <Typography variant="body2" gutterBottom>
                2. Only send from a wallet that you own and control.
              </Typography>
              <Typography variant="body2" gutterBottom>
                3. Only send using the {payment.network} network.
              </Typography>
              <Typography variant="body2" color="error">
                Sending a different amount or using a different network may result in permanent loss of funds.
              </Typography>
            </Box>
          </CardContent>
        </Card>
        
        <Box display="flex" justifyContent="space-between">
          <Button onClick={cancelPayment} disabled={payment.status !== PaymentStatus.CREATED && payment.status !== PaymentStatus.PENDING}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={() => setShowTxDialog(true)}
            startIcon={<Info />}
          >
            Transaction Details
          </Button>
        </Box>
        
        {renderTransactionDialog()}
      </Box>
    );
  }

  // Initial selection view
  return (
    <Box>
      <Tabs value={tabIndex} onChange={handleTabChange} centered sx={{ mb: 3 }}>
        <Tab label="Stablecoins" />
        <Tab label="Wallet Connect" />
      </Tabs>
      
      {tabIndex === 0 ? (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pay with Stablecoins
              </Typography>
              
              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>Currency</Typography>
                <RadioGroup
                  row
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value as StableCoin)}
                >
                  <FormControlLabel 
                    value={StableCoin.USDT} 
                    control={<Radio />} 
                    label={
                      <Box display="flex" alignItems="center">
                        <SiTether style={{ marginRight: 8 }} /> USDT
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value={StableCoin.USDC} 
                    control={<Radio />} 
                    label={
                      <Box display="flex" alignItems="center">
                        <SiTether style={{ marginRight: 8 }} /> USDC
                      </Box>
                    }
                  />
                  <FormControlLabel 
                    value={StableCoin.DAI} 
                    control={<Radio />} 
                    label={
                      <Box display="flex" alignItems="center">
                        <SiEthereum style={{ marginRight: 8 }} /> DAI
                      </Box>
                    }
                  />
                </RadioGroup>
              </Box>
              
              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>Network</Typography>
                <RadioGroup
                  row
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value as Network)}
                >
                  <FormControlLabel 
                    value={Network.ETHEREUM} 
                    control={<Radio />} 
                    label={
                      <Box display="flex" alignItems="center">
                        <SiEthereum style={{ marginRight: 8 }} /> Ethereum
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value={Network.POLYGON} 
                    control={<Radio />} 
                    label={
                      <Box display="flex" alignItems="center">
                        <SiEthereum style={{ marginRight: 8 }} /> Polygon
                      </Box>
                    }
                  />
                </RadioGroup>
              </Box>
              
              <Box mt={3} bgcolor="grey.100" p={2} borderRadius={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">You pay:</Typography>
                  <Typography variant="h6">
                    {calculateCryptoAmount(amount, selectedCurrency)} {selectedCurrency}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" align="right">
                  ≈ ${amount.toFixed(2)} USD
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Box display="flex" justifyContent="space-between">
            <Button onClick={cancelPayment}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={initiatePayment}
              disabled={createPaymentMutation.isPending}
            >
              {createPaymentMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Continue to Payment'
              )}
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Connect Your Crypto Wallet
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Direct Web3 Payment</AlertTitle>
                Connect your crypto wallet for a seamless Web3 experience. This will allow you to pay directly from your wallet without copying addresses.
              </Alert>
              
              <Box display="flex" justifyContent="center" my={3}>
                <ConnectWalletButton 
                  onWalletConnected={handleWalletConnected}
                  buttonText="Connect Wallet"
                  variant="contained"
                  size="large"
                />
              </Box>
              
              {walletState && walletState.status === ConnectionStatus.CONNECTED && (
                <Box mt={3} bgcolor="grey.100" p={2} borderRadius={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">Connected Wallet:</Typography>
                    <Typography variant="body2" fontFamily="monospace">
                      {walletState.address?.substring(0, 8)}...{walletState.address?.substring(36)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Typography variant="body1">Network:</Typography>
                    <Typography variant="body2">
                      {walletState.network || 'Unknown'}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Typography variant="body1">Balance:</Typography>
                    <Typography variant="body2">
                      {walletState.balance} {walletState.network === 'ethereum' ? 'ETH' : 'MATIC'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
          
          <Box display="flex" justifyContent="space-between">
            <Button onClick={cancelPayment}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={initiatePayment}
              disabled={createPaymentMutation.isPending || !walletState || walletState.status !== ConnectionStatus.CONNECTED}
            >
              {createPaymentMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Continue to Payment'
              )}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CryptoPayment;