import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Paper,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { 
  Add as AddIcon, 
  Remove as RemoveIcon, 
  AccountBalanceWallet as WalletIcon,
  FilterList as FilterIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  Payments as PaymentsIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';

interface Transaction {
  id: number;
  amount: number;
  type: string;
  status: string;
  date: string;
  description: string | null;
  reference: string | null;
}

interface WalletData {
  id: number;
  userId: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

// Define transaction types with colors
const transactionTypes = {
  deposit: { label: 'Deposit', color: 'success' },
  withdrawal: { label: 'Withdrawal', color: 'error' },
  investment: { label: 'Investment', color: 'primary' },
  divestment: { label: 'Divestment', color: 'secondary' },
  return: { label: 'Return', color: 'success' },
  fee: { label: 'Fee', color: 'warning' },
  transfer: { label: 'Transfer', color: 'info' },
  referral_bonus: { label: 'Referral Bonus', color: 'success' }
};

const WalletMUI = () => {
  const [tabValue, setTabValue] = useState(0);
  const [filter, setFilter] = useState('');
  const [fundAmount, setFundAmount] = useState('1000');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [openFundDialog, setOpenFundDialog] = useState(false);
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch wallet data using React Query
  const { 
    data: wallet = { balance: 0 }, 
    isLoading: walletLoading,
    refetch: refetchWallet
  } = useQuery<WalletData>({
    queryKey: ['/api/wallet'],
  });

  // Fetch transactions using React Query
  const { 
    data: transactions = [],
    isLoading: transactionsLoading,
  } = useQuery<Transaction[]>({
    queryKey: ['/api/wallet/transactions'],
  });

  // Add funds mutation
  const addFundsMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest('POST', '/api/wallet/add', { amount });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Funds Added",
        description: `₦${fundAmount} has been added to your wallet`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      setOpenFundDialog(false);
      setFundAmount('1000');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Funds",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Withdraw funds mutation
  const withdrawFundsMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest('POST', '/api/wallet/withdraw', { amount });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Initiated",
        description: `₦${withdrawAmount} has been withdrawn from your wallet`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      setOpenWithdrawDialog(false);
      setWithdrawAmount('');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Withdraw Funds",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddFunds = () => {
    const amount = parseInt(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }
    addFundsMutation.mutate(amount);
  };

  const handleWithdrawFunds = () => {
    const amount = parseInt(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }
    if (amount > wallet.balance) {
      toast({
        title: "Insufficient Funds",
        description: "Withdrawal amount exceeds your wallet balance",
        variant: "destructive",
      });
      return;
    }
    withdrawFundsMutation.mutate(amount);
  };

  const filteredTransactions = transactions.filter(tx =>
    tx.type.toLowerCase().includes(filter.toLowerCase())
  );

  const getStatusChipColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Main Wallet Card */}
      <Card elevation={3} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }} className="mui-wallet-card">
        <Box 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            py: 3,
            px: 4,
            position: 'relative'
          }}
        >
          <WalletIcon sx={{ position: 'absolute', right: 30, top: 30, fontSize: 60, opacity: 0.2 }} />
          <Typography variant="h6" gutterBottom>Available Balance</Typography>
          
          {walletLoading ? (
            <CircularProgress color="inherit" size={20} sx={{ my: 1 }} />
          ) : (
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              ₦{wallet.balance.toLocaleString()}
            </Typography>
          )}
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }} className="mui-wallet-actions">
            <Button 
              variant="contained" 
              color="success" 
              startIcon={<AddIcon />}
              onClick={() => setOpenFundDialog(true)}
              sx={{ 
                bgcolor: 'success.main', 
                color: 'white',
                '&:hover': { bgcolor: 'success.dark' } 
              }}
            >
              Add Funds
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<RemoveIcon />}
              onClick={() => setOpenWithdrawDialog(true)}
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } 
              }}
            >
              Withdraw
            </Button>
          </Box>
        </Box>
        
        <CardContent>
          {/* Transaction Summary */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Transaction Summary
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Paper sx={{ p: 2, flex: 1, bgcolor: 'success.light', color: 'success.contrastText' }}>
                <Typography variant="body2" color="inherit">Deposits</Typography>
                <Typography variant="h6" fontWeight="bold">
                  +₦{transactions
                    .filter(tx => tx.type === 'deposit')
                    .reduce((sum, tx) => sum + tx.amount, 0)
                    .toLocaleString()}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1, bgcolor: 'error.light', color: 'error.contrastText' }}>
                <Typography variant="body2" color="inherit">Withdrawals</Typography>
                <Typography variant="h6" fontWeight="bold">
                  -₦{transactions
                    .filter(tx => tx.type === 'withdrawal')
                    .reduce((sum, tx) => sum + tx.amount, 0)
                    .toLocaleString()}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="body2" color="inherit">Investments</Typography>
                <Typography variant="h6" fontWeight="bold">
                  ₦{transactions
                    .filter(tx => tx.type === 'investment')
                    .reduce((sum, tx) => sum + tx.amount, 0)
                    .toLocaleString()}
                </Typography>
              </Paper>
            </Stack>
          </Box>
          
          {/* Recent Activity */}
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Recent Activity
          </Typography>
          
          {transactionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredTransactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'grey.50', borderRadius: 1 }}>
              <HistoryIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
              <Typography color="textSecondary">No transactions found</Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Filter by type"
                  variant="outlined"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 200 }}
                />
                <Tooltip title="Refresh">
                  <IconButton onClick={() => refetchWallet()}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Table className="mui-transaction-table">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.slice(0, 5).map(tx => (
                    <TableRow key={tx.id} hover>
                      <TableCell>
                        <Typography variant="body2">{formatDate(tx.date)}</Typography>
                        {tx.reference && (
                          <Typography variant="caption" color="textSecondary">
                            Ref: {tx.reference}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={transactionTypes[tx.type as keyof typeof transactionTypes]?.label || tx.type}
                          size="small"
                          color={transactionTypes[tx.type as keyof typeof transactionTypes]?.color as any || 'default'}
                          variant="filled"
                        />
                        {tx.description && (
                          <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5 }}>
                            {tx.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          color={tx.type === 'deposit' || tx.type === 'return' || tx.type === 'referral_bonus' ? 'success.main' : 
                                 tx.type === 'withdrawal' || tx.type === 'fee' ? 'error.main' : 
                                 'inherit'}
                          fontWeight="medium"
                        >
                          {tx.type === 'deposit' || tx.type === 'return' || tx.type === 'referral_bonus' ? '+' : 
                           tx.type === 'withdrawal' || tx.type === 'fee' ? '-' : ''}
                          ₦{tx.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={tx.status}
                          size="small"
                          color={getStatusChipColor(tx.status) as any}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredTransactions.length > 5 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button 
                    variant="text" 
                    onClick={() => setTabValue(1)}
                    endIcon={<ArrowDownwardIcon />}
                  >
                    View All Transactions
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Fund Wallet Dialog */}
      <Dialog 
        open={openFundDialog} 
        onClose={() => setOpenFundDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Funds to Wallet</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Enter the amount you wish to add to your wallet balance:
          </DialogContentText>
          <TextField
            autoFocus
            label="Amount (₦)"
            type="number"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">₦</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFundDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddFunds}
            variant="contained"
            disabled={addFundsMutation.isPending}
          >
            {addFundsMutation.isPending ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Processing...
              </>
            ) : (
              'Add Funds'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Withdraw Funds Dialog */}
      <Dialog 
        open={openWithdrawDialog} 
        onClose={() => setOpenWithdrawDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Withdraw Funds</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the amount you wish to withdraw from your wallet:
          </DialogContentText>
          <Box sx={{ bgcolor: 'primary.light', p: 2, borderRadius: 1, mb: 3 }}>
            <Typography variant="body2" color="primary.contrastText">Available Balance</Typography>
            <Typography variant="h6" color="primary.contrastText">₦{wallet.balance.toLocaleString()}</Typography>
          </Box>
          <TextField
            autoFocus
            label="Amount (₦)"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            fullWidth
            error={parseInt(withdrawAmount) > wallet.balance}
            helperText={parseInt(withdrawAmount) > wallet.balance ? "Amount exceeds available balance" : ""}
            InputProps={{
              startAdornment: <InputAdornment position="start">₦</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWithdrawDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleWithdrawFunds}
            variant="contained"
            color="primary"
            disabled={withdrawFundsMutation.isPending || parseInt(withdrawAmount) > wallet.balance || !withdrawAmount}
          >
            {withdrawFundsMutation.isPending ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Processing...
              </>
            ) : (
              'Withdraw'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WalletMUI;