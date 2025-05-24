import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Divider,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Alert
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Payments as PaymentsIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Money as MoneyIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';

// Define interfaces for our data types
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface Wallet {
  id: number;
  userId: number;
  balance: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalInvested: number;
  totalReturns: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

interface Transaction {
  id: number;
  userId: number;
  walletId: number;
  amount: number;
  type: string;
  status: string;
  description: string;
  reference: string;
  date: string;
  createdAt: string;
  user?: User;
}

interface AdminWalletStats {
  totalWallets: number;
  totalBalance: number;
  totalPendingDeposits: number;
  totalPendingWithdrawals: number;
  totalInvested: number;
  totalReturns: number;
  transactionsToday: number;
  transactionsThisWeek: number;
  transactionsThisMonth: number;
}

const statusColorMap: Record<string, string> = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
  processing: 'info',
  cancelled: 'default'
};

const typeColorMap: Record<string, string> = {
  deposit: 'success',
  withdrawal: 'error',
  investment: 'primary',
  divestment: 'secondary',
  return: 'success',
  fee: 'warning',
  transfer: 'info',
  referral_bonus: 'success'
};

const WalletManagementPage: React.FC = () => {
  // State variables
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [manualAmount, setManualAmount] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualAction, setManualAction] = useState('add');
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionAction, setTransactionAction] = useState('');
  const { toast } = useToast();

  // Fetch wallet data
  const {
    data: wallets = [],
    isLoading: walletsLoading,
    refetch: refetchWallets
  } = useQuery<Wallet[]>({
    queryKey: ['/api/admin/wallets'],
    // This is just a fallback in case the API doesn't exist yet
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/admin/wallets');
        return await res.json();
      } catch (error) {
        console.error('Error fetching wallets:', error);
        // Return mock data for testing
        return [];
      }
    }
  });

  // Fetch transaction data
  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    refetch: refetchTransactions
  } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions', filterStatus, filterType],
    // This is just a fallback in case the API doesn't exist yet
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filterStatus !== 'all') queryParams.append('status', filterStatus);
        if (filterType !== 'all') queryParams.append('type', filterType);
        
        const res = await apiRequest('GET', `/api/admin/transactions?${queryParams.toString()}`);
        return await res.json();
      } catch (error) {
        console.error('Error fetching transactions:', error);
        // Return mock data for testing
        return [];
      }
    }
  });

  // Fetch wallet stats
  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery<AdminWalletStats>({
    queryKey: ['/api/admin/wallet-stats'],
    // This is just a fallback in case the API doesn't exist yet
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/admin/wallet-stats');
        return await res.json();
      } catch (error) {
        console.error('Error fetching wallet stats:', error);
        // Return mock data for testing
        return {
          totalWallets: wallets.length,
          totalBalance: wallets.reduce((sum, wallet) => sum + wallet.balance, 0),
          totalPendingDeposits: wallets.reduce((sum, wallet) => sum + (wallet.pendingDeposits || 0), 0),
          totalPendingWithdrawals: wallets.reduce((sum, wallet) => sum + (wallet.pendingWithdrawals || 0), 0),
          totalInvested: wallets.reduce((sum, wallet) => sum + (wallet.totalInvested || 0), 0),
          totalReturns: wallets.reduce((sum, wallet) => sum + (wallet.totalReturns || 0), 0),
          transactionsToday: transactions.filter(t => 
            new Date(t.createdAt).toDateString() === new Date().toDateString()
          ).length,
          transactionsThisWeek: transactions.filter(t => {
            const txDate = new Date(t.createdAt);
            const today = new Date();
            const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return txDate >= oneWeekAgo && txDate <= today;
          }).length,
          transactionsThisMonth: transactions.filter(t => {
            const txDate = new Date(t.createdAt);
            return txDate.getMonth() === new Date().getMonth() && 
                  txDate.getFullYear() === new Date().getFullYear();
          }).length
        };
      }
    }
  });

  // Manual transaction mutation
  const manualTransactionMutation = useMutation({
    mutationFn: async (data: { userId: number; amount: number; action: string; description: string }) => {
      const res = await apiRequest('POST', '/api/admin/wallets/manual-transaction', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Transaction Successful",
        description: `${manualAction === 'add' ? 'Added to' : 'Removed from'} wallet successfully`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wallets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wallet-stats'] });
      setOpenDialog(false);
      resetDialogFields();
    },
    onError: (error: Error) => {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update transaction status mutation
  const updateTransactionMutation = useMutation({
    mutationFn: async (data: { transactionId: number; status: string }) => {
      const res = await apiRequest('PATCH', `/api/admin/transactions/${data.transactionId}/status`, { status: data.status });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Transaction status updated successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wallet-stats'] });
      setOpenTransactionDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Reset dialog fields
  const resetDialogFields = () => {
    setSelectedWallet(null);
    setManualAmount('');
    setManualDescription('');
    setManualAction('add');
  };

  // Handle manual transaction
  const handleManualTransaction = () => {
    if (!selectedWallet) return;
    
    const amount = parseFloat(manualAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    manualTransactionMutation.mutate({
      userId: selectedWallet.userId,
      amount,
      action: manualAction,
      description: manualDescription || `Manual ${manualAction} by admin`
    });
  };

  // Handle transaction status update
  const handleTransactionUpdate = () => {
    if (!selectedTransaction || !transactionAction) return;
    
    updateTransactionMutation.mutate({
      transactionId: selectedTransaction.id,
      status: transactionAction
    });
  };

  // Filter wallets based on search term
  const filteredWallets = wallets.filter(wallet => {
    const userFullName = `${wallet.user?.firstName || ''} ${wallet.user?.lastName || ''}`.toLowerCase();
    const username = wallet.user?.username.toLowerCase() || '';
    const email = wallet.user?.email.toLowerCase() || '';
    
    return username.includes(searchTerm.toLowerCase()) || 
           email.includes(searchTerm.toLowerCase()) ||
           userFullName.includes(searchTerm.toLowerCase());
  });

  // Filter transactions based on search term and filters
  const filteredTransactions = transactions.filter(transaction => {
    const username = transaction.user?.username.toLowerCase() || '';
    const reference = transaction.reference?.toLowerCase() || '';
    
    const matchesSearch = username.includes(searchTerm.toLowerCase()) || 
                          reference.includes(searchTerm.toLowerCase()) ||
                          transaction.id.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <>
      <Helmet>
        <title>Wallet Management | iREVA Admin</title>
      </Helmet>
      
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          <AccountBalanceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Wallet Management
        </Typography>
        
        {/* Stats Cards */}
        {!statsLoading && stats ? (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>Total Wallets</Typography>
                  <Typography variant="h4">{stats.totalWallets}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>Total Balance</Typography>
                  <Typography variant="h4">₦{stats.totalBalance?.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>Pending Deposits</Typography>
                  <Typography variant="h4">₦{stats.totalPendingDeposits?.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>Pending Withdrawals</Typography>
                  <Typography variant="h4">₦{stats.totalPendingWithdrawals?.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        <Paper sx={{ mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="User Wallets" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Transactions" icon={<HistoryIcon />} iconPosition="start" />
            <Tab label="Analytics" icon={<BarChartIcon />} iconPosition="start" />
          </Tabs>
          
          {/* User Wallets Tab */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', mb: 3, alignItems: 'center' }}>
                <TextField
                  placeholder="Search by username, email, or name"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ mr: 2, flexGrow: 1 }}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  onClick={() => refetchWallets()}
                >
                  Refresh
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Balance</TableCell>
                      <TableCell>Pending Deposits</TableCell>
                      <TableCell>Pending Withdrawals</TableCell>
                      <TableCell>Total Invested</TableCell>
                      <TableCell>Total Returns</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {walletsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <CircularProgress size={30} />
                        </TableCell>
                      </TableRow>
                    ) : filteredWallets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body1" sx={{ py: 3 }}>
                            No wallets found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredWallets.map((wallet) => (
                        <TableRow key={wallet.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                              <Box>
                                <Typography variant="body1">
                                  {wallet.user?.firstName} {wallet.user?.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {wallet.user?.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>₦{wallet.balance.toLocaleString()}</TableCell>
                          <TableCell>₦{(wallet.pendingDeposits || 0).toLocaleString()}</TableCell>
                          <TableCell>₦{(wallet.pendingWithdrawals || 0).toLocaleString()}</TableCell>
                          <TableCell>₦{(wallet.totalInvested || 0).toLocaleString()}</TableCell>
                          <TableCell>₦{(wallet.totalReturns || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <Tooltip title="Manual Transaction">
                              <IconButton 
                                color="primary"
                                onClick={() => {
                                  setSelectedWallet(wallet);
                                  setOpenDialog(true);
                                }}
                              >
                                <MoneyIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View History">
                              <IconButton color="info">
                                <HistoryIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {/* Transactions Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', mb: 3, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <TextField
                  placeholder="Search by username or reference"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ flexGrow: 1, minWidth: '200px' }}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                
                <FormControl size="small" sx={{ minWidth: '150px' }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: '150px' }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="deposit">Deposit</MenuItem>
                    <MenuItem value="withdrawal">Withdrawal</MenuItem>
                    <MenuItem value="investment">Investment</MenuItem>
                    <MenuItem value="divestment">Divestment</MenuItem>
                    <MenuItem value="return">Return</MenuItem>
                    <MenuItem value="fee">Fee</MenuItem>
                    <MenuItem value="transfer">Transfer</MenuItem>
                    <MenuItem value="referral_bonus">Referral Bonus</MenuItem>
                  </Select>
                </FormControl>
                
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  onClick={() => refetchTransactions()}
                >
                  Refresh
                </Button>
                
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />}
                  color="success"
                >
                  Export
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Reference</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          <CircularProgress size={30} />
                        </TableCell>
                      </TableRow>
                    ) : filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          <Typography variant="body1" sx={{ py: 3 }}>
                            No transactions found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.id}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                              {transaction.user?.username || '-'}
                            </Box>
                          </TableCell>
                          <TableCell>₦{transaction.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip 
                              label={transaction.type} 
                              color={typeColorMap[transaction.type] as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={transaction.status} 
                              color={statusColorMap[transaction.status] as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{transaction.description || '-'}</TableCell>
                          <TableCell>{transaction.reference || '-'}</TableCell>
                          <TableCell>{new Date(transaction.date).toLocaleString()}</TableCell>
                          <TableCell>
                            <Tooltip title="Update Status">
                              <IconButton 
                                color="primary"
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setTransactionAction(transaction.status);
                                  setOpenTransactionDialog(true);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {/* Analytics Tab */}
          {tabValue === 2 && (
            <Box sx={{ p: 3 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                This section provides detailed analytics on wallet activities and financial operations.
              </Alert>
              
              {!statsLoading && stats ? (
                <>
                  <Typography variant="h6" sx={{ mb: 2 }}>Transaction Statistics</Typography>
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" color="text.secondary">Transactions Today</Typography>
                          <Typography variant="h4">{stats.transactionsToday}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" color="text.secondary">Transactions This Week</Typography>
                          <Typography variant="h4">{stats.transactionsThisWeek}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" color="text.secondary">Transactions This Month</Typography>
                          <Typography variant="h4">{stats.transactionsThisMonth}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="h6" sx={{ mb: 2 }}>Investment Statistics</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" color="text.secondary">Total Invested</Typography>
                          <Typography variant="h4">₦{stats.totalInvested?.toLocaleString()}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" color="text.secondary">Total Returns Generated</Typography>
                          <Typography variant="h4">₦{stats.totalReturns?.toLocaleString()}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Manual Transaction Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Manual Wallet Transaction
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Adjust wallet balance for user: {selectedWallet?.user?.firstName} {selectedWallet?.user?.lastName} ({selectedWallet?.user?.email})
          </DialogContentText>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  value={manualAction}
                  onChange={(e) => setManualAction(e.target.value)}
                  label="Action"
                >
                  <MenuItem value="add">Add Funds</MenuItem>
                  <MenuItem value="remove">Remove Funds</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Amount (₦)"
                fullWidth
                type="number"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₦</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description (Optional)"
                fullWidth
                multiline
                rows={2}
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder="Enter a description for this transaction"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleManualTransaction} 
            color="primary" 
            variant="contained"
            disabled={manualTransactionMutation.isPending}
            startIcon={manualAction === 'add' ? <AddCircleIcon /> : <RemoveCircleIcon />}
          >
            {manualTransactionMutation.isPending ? 'Processing...' : 
              manualAction === 'add' ? 'Add Funds' : 'Remove Funds'
            }
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Update Transaction Status Dialog */}
      <Dialog open={openTransactionDialog} onClose={() => setOpenTransactionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Transaction Status
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Transaction ID: {selectedTransaction?.id}
            <br />
            Current Status: <Chip 
              label={selectedTransaction?.status} 
              color={statusColorMap[selectedTransaction?.status || ''] as any}
              size="small"
              sx={{ ml: 1 }}
            />
          </DialogContentText>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={transactionAction}
              onChange={(e) => setTransactionAction(e.target.value)}
              label="New Status"
            >
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransactionDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleTransactionUpdate} 
            color="primary" 
            variant="contained"
            disabled={updateTransactionMutation.isPending}
          >
            {updateTransactionMutation.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WalletManagementPage;