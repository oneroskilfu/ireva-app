import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import LaunchIcon from '@mui/icons-material/Launch';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QRCode from 'qrcode.react';

const walletData = [
  {
    id: 'btc-wallet',
    name: 'Bitcoin Wallet (BTC)',
    balance: '2.3459',
    value: '₦93,836,000',
    address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
    network: 'Bitcoin Network',
    status: 'active',
    hotWallet: true
  },
  {
    id: 'eth-wallet',
    name: 'Ethereum Wallet (ETH)',
    balance: '18.7214',
    value: '₦56,164,200',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    network: 'Ethereum Mainnet',
    status: 'active',
    hotWallet: true
  },
  {
    id: 'usdt-wallet',
    name: 'Tether (USDT)',
    balance: '95,340.00',
    value: '₦76,272,000',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    network: 'Ethereum Mainnet (ERC-20)',
    status: 'active',
    hotWallet: false
  },
  {
    id: 'usdc-wallet',
    name: 'USD Coin (USDC)',
    balance: '120,250.00',
    value: '₦96,200,000',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    network: 'Ethereum Mainnet (ERC-20)',
    status: 'active',
    hotWallet: false
  },
  {
    id: 'matic-wallet',
    name: 'Polygon (MATIC)',
    balance: '32,500',
    value: '₦13,650,000',
    address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    network: 'Polygon Mainnet',
    status: 'active',
    hotWallet: true
  }
];

const recentTransactions = [
  {
    id: 'tx-15890',
    type: 'withdrawal',
    amount: '0.25 BTC',
    value: '₦10,000,000',
    status: 'completed',
    timestamp: '2023-05-15T14:23:15Z',
    address: '3HzP9iYGHcnzDFUoHMWjm6yRhU7UjMfZfN',
    txHash: '3a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u'
  },
  {
    id: 'tx-15889',
    type: 'deposit',
    amount: '5.5 ETH',
    value: '₦16,500,000',
    status: 'completed',
    timestamp: '2023-05-14T11:46:32Z',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    txHash: '0x4a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0'
  },
  {
    id: 'tx-15888',
    type: 'withdrawal',
    amount: '12,500 USDT',
    value: '₦10,000,000',
    status: 'processing',
    timestamp: '2023-05-14T09:12:45Z',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    txHash: '0x5a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0'
  },
  {
    id: 'tx-15887',
    type: 'deposit',
    amount: '0.75 BTC',
    value: '₦30,000,000',
    status: 'completed',
    timestamp: '2023-05-13T16:34:21Z',
    address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
    txHash: '4a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u'
  },
  {
    id: 'tx-15886',
    type: 'withdrawal',
    amount: '8,500 USDC',
    value: '₦6,800,000',
    status: 'failed',
    timestamp: '2023-05-13T12:01:18Z',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    txHash: '0x6a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0'
  }
];

const AdminWalletControlPanel = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [copied, setCopied] = useState(false);
  const [withdrawalCurrency, setWithdrawalCurrency] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleWalletSelect = (wallet) => {
    setSelectedWallet(wallet);
    setWithdrawalCurrency(wallet.name.split(' ')[0]);
    setAddressDialogOpen(true);
  };

  const handleAddressDialogClose = () => {
    setAddressDialogOpen(false);
  };

  const handleWithdrawalAmountChange = (e) => {
    setWithdrawalAmount(e.target.value);
  };

  const handleWithdrawalAddressChange = (e) => {
    setWithdrawalAddress(e.target.value);
  };

  const handleConfirmWithdrawal = () => {
    setAddressDialogOpen(false);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
  };

  const processWithdrawal = () => {
    setLoading(true);
    setConfirmDialogOpen(false);
    
    // Simulate API call for withdrawal
    setTimeout(() => {
      setMessage({ 
        type: 'success', 
        text: `Successfully initiated withdrawal of ${withdrawalAmount} ${selectedWallet.name.split(' ')[0]} to ${withdrawalAddress}` 
      });
      setLoading(false);
      setWithdrawalAmount('');
      setWithdrawalAddress('');
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    }, 2000);
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

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTransactionStatusChipColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getExplorerUrl = (wallet, txHash) => {
    if (wallet.includes('BTC')) {
      return `https://www.blockchain.com/btc/tx/${txHash}`;
    } else if (wallet.includes('ETH') || wallet.includes('USDT') || wallet.includes('USDC')) {
      return `https://etherscan.io/tx/${txHash}`;
    } else if (wallet.includes('MATIC')) {
      return `https://polygonscan.com/tx/${txHash}`;
    }
    return '#';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Admin Wallet Control Panel
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage cryptocurrency wallets, view balances, and process withdrawals from a central dashboard.
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="wallet management tabs"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Platform Wallets" />
          <Tab label="Recent Transactions" />
          <Tab label="Security Settings" />
        </Tabs>
      </Box>
      
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Platform Wallet Balances
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              size="small"
            >
              Refresh Balances
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {walletData.map((wallet) => (
              <Grid item xs={12} md={6} lg={4} key={wallet.id}>
                <Card 
                  sx={{ 
                    position: 'relative',
                    '&:hover': {
                      boxShadow: theme.shadows[4]
                    }
                  }}
                >
                  <CardHeader
                    title={wallet.name}
                    subheader={wallet.network}
                    action={
                      <Chip 
                        label={wallet.status.charAt(0).toUpperCase() + wallet.status.slice(1)} 
                        color={getStatusChipColor(wallet.status)}
                        size="small"
                      />
                    }
                  />
                  <CardContent>
                    <Typography variant="h4" component="div" gutterBottom>
                      {wallet.balance}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Value: {wallet.value}
                    </Typography>
                    
                    <Box 
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mt: 1,
                        mb: 2,
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                        backgroundColor: theme.palette.background.default,
                        borderRadius: 1,
                        p: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {wallet.address}
                      <IconButton 
                        size="small" 
                        sx={{ ml: 1 }}
                        onClick={() => copyToClipboard(wallet.address)}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button
                        size="small"
                        startIcon={<InfoIcon />}
                        onClick={() => console.log('View details for', wallet.name)}
                      >
                        Details
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<SendIcon />}
                        onClick={() => handleWalletSelect(wallet)}
                      >
                        Withdraw
                      </Button>
                    </Box>
                    
                    {wallet.hotWallet && (
                      <Chip 
                        label="Hot Wallet" 
                        color="primary" 
                        size="small" 
                        sx={{ position: 'absolute', top: 12, right: 12 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Recent Transactions
            </Typography>
            <Box>
              <Button 
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                size="small"
                sx={{ mr: 1 }}
              >
                Export
              </Button>
              <Button 
                variant="outlined"
                startIcon={<RefreshIcon />}
                size="small"
              >
                Refresh
              </Button>
            </Box>
          </Box>
          
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Value (NGN)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTransactions.map((tx) => (
                  <TableRow key={tx.id} hover>
                    <TableCell>{tx.id}</TableCell>
                    <TableCell>
                      <Chip 
                        label={tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} 
                        color={tx.type === 'deposit' ? 'success' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{tx.amount}</TableCell>
                    <TableCell>{tx.value}</TableCell>
                    <TableCell>
                      <Chip 
                        label={tx.status.charAt(0).toUpperCase() + tx.status.slice(1)} 
                        color={getTransactionStatusChipColor(tx.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small"
                        href={getExplorerUrl(tx.amount, tx.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on blockchain explorer"
                      >
                        <LaunchIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      
      {tabValue === 2 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Wallet Security Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Configure security settings for platform cryptocurrency wallets.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Withdrawal Confirmation Threshold"
                  defaultValue="0.5 BTC"
                  helperText="Withdrawals above this amount require multi-signature approval"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Daily Withdrawal Limit"
                  defaultValue="2.0 BTC"
                  helperText="Maximum amount that can be withdrawn in a 24-hour period"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Hot Wallet Threshold"
                  defaultValue="5"
                  helperText="Percentage of funds to keep in hot wallets"
                  margin="normal"
                >
                  {[5, 10, 15, 20, 25].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}%
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Required Confirmations"
                  defaultValue="6"
                  helperText="Number of confirmations required before deposits are credited"
                  margin="normal"
                >
                  {[1, 2, 3, 6, 12, 24].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option} confirmation{option !== 1 ? 's' : ''}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary"
                sx={{ mr: 2 }}
              >
                Save Settings
              </Button>
              <Button variant="outlined">
                Reset to Defaults
              </Button>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Multi-Signature Approvals
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Configure administrators required for high-value transaction approval.
            </Typography>
            
            <TextField
              select
              fullWidth
              label="Required Approvers"
              defaultValue="2"
              helperText="Number of administrators required to approve high-value withdrawals"
              margin="normal"
            >
              {[1, 2, 3, 4, 5].map((option) => (
                <MenuItem key={option} value={option}>
                  {option} approver{option !== 1 ? 's' : ''}
                </MenuItem>
              ))}
            </TextField>
            
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" color="primary">
                Update Approval Settings
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
      
      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onClose={handleAddressDialogClose}>
        <DialogTitle>Withdraw from {selectedWallet?.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the withdrawal details below. Please double-check the receiving address to avoid loss of funds.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={withdrawalAmount}
            onChange={handleWithdrawalAmountChange}
            InputProps={{
              endAdornment: selectedWallet?.name.split(' ')[0]
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Available: {selectedWallet?.balance} {selectedWallet?.name.split(' ')[0]}
          </Typography>
          
          <TextField
            margin="dense"
            label="Destination Address"
            type="text"
            fullWidth
            variant="outlined"
            value={withdrawalAddress}
            onChange={handleWithdrawalAddressChange}
            sx={{ mt: 2 }}
          />
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            Withdrawals are irreversible. Please ensure all details are correct.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddressDialogClose}>Cancel</Button>
          <Button 
            onClick={handleConfirmWithdrawal}
            variant="contained"
            disabled={!withdrawalAmount || !withdrawalAddress}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={handleConfirmDialogClose}>
        <DialogTitle>Confirm Withdrawal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please review the withdrawal details below:
          </DialogContentText>
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  From Wallet:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">
                  {selectedWallet?.name}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Amount:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">
                  {withdrawalAmount} {selectedWallet?.name.split(' ')[0]}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Destination:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold" sx={{ wordBreak: 'break-all' }}>
                  {withdrawalAddress}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Network Fee:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">
                  0.0005 {selectedWallet?.name.split(' ')[0]}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Alert severity="error" sx={{ mt: 2 }}>
            This action cannot be undone. Please verify all details are correct.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose}>Cancel</Button>
          <Button 
            onClick={processWithdrawal}
            variant="contained"
            color="primary"
          >
            Confirm Withdrawal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminWalletControlPanel;