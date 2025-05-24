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
  DialogContentText,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Menu,
  ListItemIcon,
  ListItemText,
  LinearProgress
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
  ArrowDownward as ArrowDownwardIcon,
  CreditCard,
  FileDownload as FileDownloadIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Inventory as InventoryIcon,
  Business as BusinessIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  SaveAlt as SaveAltIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Delete as DeleteIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';

interface Transaction {
  id: number;
  amount: number;
  type: string;
  status: string;
  date: string;
  description: string | null;
  reference: string | null;
  createdAt?: string;
}

interface WalletData {
  id: number;
  userId: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
  pendingDeposits?: number;
  pendingWithdrawals?: number;
  availableBalance?: number;
  totalInvested?: number;
  totalReturns?: number;
  recentTransactions?: Transaction[];
}

interface Property {
  id: number;
  name: string;
  location: string;
  description: string;
  type: string;
  imageUrl: string;
  tier: string;
  targetReturn: string;
  minimumInvestment: number;
  term: number;
  totalFunding: number;
  currentFunding: number;
  numberOfInvestors: number;
  daysLeft: number;
}

interface Investment {
  id: number;
  userId: number;
  propertyId: number;
  amount: number;
  currentValue: number;
  status: string;
  earnings: number;
  projectedEarnings: number;
  projectedROI: number;
  property?: Property;
  createdAt: string;
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

const WalletMUI: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [filter, setFilter] = useState('');
  const [fundAmount, setFundAmount] = useState('1000');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [openFundDialog, setOpenFundDialog] = useState(false);
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [openInvestDialog, setOpenInvestDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [dateRange, setDateRange] = useState<{start?: string, end?: string}>({});
  const [exportFormat, setExportFormat] = useState('csv');
  const [transactionType, setTransactionType] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
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
    refetch: refetchTransactions
  } = useQuery<Transaction[]>({
    queryKey: ['/api/wallet/transactions'],
  });
  
  // Fetch available properties for investment
  const { 
    data: properties = [], 
    isLoading: propertiesLoading 
  } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });
  
  // Fetch user investments
  const { 
    data: investments = [], 
    isLoading: investmentsLoading,
    refetch: refetchInvestments
  } = useQuery<Investment[]>({
    queryKey: ['/api/investments'],
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
  
  // Make investment mutation
  const investMutation = useMutation({
    mutationFn: async (data: { propertyId: number; amount: number; paymentMethod: string }) => {
      const res = await apiRequest('POST', '/api/investments', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Investment Successful",
        description: `₦${investAmount} has been invested from your wallet`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
      setOpenInvestDialog(false);
      setInvestAmount('');
      setSelectedProperty(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Investment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Export transactions mutation
  const exportTransactionsMutation = useMutation({
    mutationFn: async (data: { format: string; startDate?: string; endDate?: string; type?: string }) => {
      const params = new URLSearchParams();
      if (data.startDate) params.append('startDate', data.startDate);
      if (data.endDate) params.append('endDate', data.endDate);
      if (data.type && data.type !== 'all') params.append('type', data.type);
      params.append('format', data.format);
      
      const res = await apiRequest('GET', `/api/wallet/export?${params.toString()}`);
      return await res.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Successful",
        description: `Your transactions have been exported as ${exportFormat.toUpperCase()}`,
        variant: "default",
      });
      setOpenExportDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
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
  
  const handleExportTransactions = () => {
    if (exportFormat !== 'csv' && exportFormat !== 'pdf') {
      toast({
        title: "Invalid Format",
        description: "Please select a valid export format",
        variant: "destructive",
      });
      return;
    }
    
    exportTransactionsMutation.mutate({
      format: exportFormat,
      startDate: dateRange.start,
      endDate: dateRange.end,
      type: transactionType
    });
  };
  
  const handleInvestNow = () => {
    if (!selectedProperty) {
      toast({
        title: "No Property Selected",
        description: "Please select a property to invest in",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseInt(investAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (amount < selectedProperty.minimumInvestment) {
      toast({
        title: "Below Minimum Investment",
        description: `Minimum investment is ₦${selectedProperty.minimumInvestment.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }
    
    if (amount > wallet.balance) {
      toast({
        title: "Insufficient Funds",
        description: "Investment amount exceeds your wallet balance",
        variant: "destructive",
      });
      return;
    }
    
    // Available funding
    const availableFunding = selectedProperty.totalFunding - selectedProperty.currentFunding;
    if (amount > availableFunding) {
      toast({
        title: "Exceeds Available Funding",
        description: `Only ₦${availableFunding.toLocaleString()} funding is available`,
        variant: "destructive",
      });
      return;
    }
    
    investMutation.mutate({
      propertyId: selectedProperty.id,
      amount,
      paymentMethod: 'wallet'
    });
  };
  
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleOpenExportMenu = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportAnchorEl(null);
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
      {/* Tabs Navigation */}
      <Box className="mui-wallet-tabs" sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="wallet tabs"
        >
          <Tab label="Overview" icon={<WalletIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="Transactions" icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="Analytics" icon={<BarChartIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="Payment Methods" icon={<CreditCard sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* Main Wallet Content */}
      {tabValue === 0 && (
        <>
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
          
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }} className="mui-wallet-actions">
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
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<BusinessIcon />}
              onClick={() => setOpenInvestDialog(true)}
              sx={{ 
                bgcolor: 'secondary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'secondary.dark' } 
              }}
            >
              Invest Now
            </Button>
            <Button 
              aria-controls="action-menu"
              aria-haspopup="true"
              onClick={handleOpenMenu}
              variant="outlined" 
              startIcon={<SettingsIcon />}
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } 
              }}
            >
              More Options
            </Button>
            <Menu
              id="action-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={() => {
                handleCloseMenu();
                navigate('/investor/dashboard');
              }}>
                <ListItemIcon>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Financial Analytics" />
              </MenuItem>
              <MenuItem onClick={() => {
                handleCloseMenu();
                setOpenExportDialog(true);
              }}>
                <ListItemIcon>
                  <FileDownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Export Transactions" />
              </MenuItem>
              <MenuItem onClick={() => {
                handleCloseMenu();
                navigate('/investor/investments');
              }}>
                <ListItemIcon>
                  <InventoryIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="My Investments" />
              </MenuItem>
            </Menu>
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
        </>
      )}
      
      {/* Analytics Tab */}
      {tabValue === 2 && (
        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="medium" gutterBottom>Financial Analytics</Typography>
            
            {investmentsLoading || transactionsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Investment Summary */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>Investment Summary</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 3, height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="body2" gutterBottom>Total Invested</Typography>
                            <Typography variant="h4" fontWeight="bold">
                              ₦{investments.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
                            </Typography>
                          </Box>
                          <BusinessIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                        </Box>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 3, height: '100%', bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="body2" gutterBottom>Total Earnings</Typography>
                            <Typography variant="h4" fontWeight="bold">
                              ₦{investments.reduce((sum, inv) => sum + inv.earnings, 0).toLocaleString()}
                            </Typography>
                          </Box>
                          <PaymentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                        </Box>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 3, height: '100%', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="body2" gutterBottom>Projected ROI</Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {investments.length > 0 
                                ? (investments.reduce((sum, inv) => sum + inv.projectedROI, 0) / investments.length).toFixed(2)
                                : 0}%
                            </Typography>
                          </Box>
                          <BarChartIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
                
                {/* Transaction Analysis */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>Transaction Analysis</Typography>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Deposits vs Withdrawals */}
                      <Box>
                        <Typography variant="body2" gutterBottom>Deposits vs Withdrawals</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="caption">Deposits</Typography>
                              <Typography variant="caption">
                                ₦{transactions
                                  .filter(tx => tx.type === 'deposit')
                                  .reduce((sum, tx) => sum + tx.amount, 0)
                                  .toLocaleString()}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={100} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 4, 
                                bgcolor: 'success.light',
                                '.MuiLinearProgress-bar': {
                                  bgcolor: 'success.main',
                                }
                              }}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="caption">Withdrawals</Typography>
                              <Typography variant="caption">
                                ₦{transactions
                                  .filter(tx => tx.type === 'withdrawal')
                                  .reduce((sum, tx) => sum + tx.amount, 0)
                                  .toLocaleString()}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={100} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 4, 
                                bgcolor: 'error.light',
                                '.MuiLinearProgress-bar': {
                                  bgcolor: 'error.main',
                                }
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                      
                      {/* Investment Distribution */}
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" gutterBottom>Investment Distribution</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                          {investments.map(inv => (
                            <Chip 
                              key={inv.id}
                              label={inv.property?.name || `Property #${inv.propertyId}`}
                              variant="outlined"
                              color="primary"
                              sx={{ 
                                fontSize: '0.75rem',
                                height: 28,
                                '& .MuiChip-label': {
                                  px: 1
                                }
                              }}
                            />
                          ))}
                          {investments.length === 0 && (
                            <Typography variant="caption" color="text.secondary">
                              No investments yet
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
                
                {/* Monthly Activity */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Monthly Activity</Typography>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {transactions.length > 0 ? (
                        <Typography>Monthly activity chart will appear here</Typography>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <HistoryIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
                          <Typography color="textSecondary">No transaction history available</Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Payment Methods Tab */}
      {tabValue === 3 && (
        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
          <CardContent>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="medium">Payment Methods</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                size="small"
              >
                Add New Card
              </Button>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>Saved Cards</Typography>
              
              {/* Sample saved cards */}
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CreditCard sx={{ fontSize: 36, mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="subtitle2">•••• •••• •••• 4242</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Expires 08/2024
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Chip size="small" label="Default" color="primary" sx={{ mr: 1 }} />
                      <IconButton size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
                
                <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CreditCard sx={{ fontSize: 36, mr: 2, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="subtitle2">•••• •••• •••• 5555</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Expires 12/2025
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Button size="small" variant="outlined" sx={{ mr: 1 }}>
                        Set Default
                      </Button>
                      <IconButton size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              </Stack>
            </Box>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>Bank Accounts</Typography>
              
              <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 1 }}>
                <AccountBalanceIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
                <Typography color="textSecondary" gutterBottom>No bank accounts added yet</Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Add Bank Account
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Transactions Tab */}
      {tabValue === 1 && (
        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <CardContent>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="medium">Transaction History</Typography>
              <TextField
                size="small"
                placeholder="Filter transactions"
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
            </Box>
            
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
              <Table className="mui-transaction-table">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.map(tx => (
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
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {tx.description || 'No description'}
                        </Typography>
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
            )}
          </CardContent>
        </Card>
      )}
      

      
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
      
      {/* Invest Now Dialog */}
      <Dialog
        open={openInvestDialog}
        onClose={() => setOpenInvestDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Invest from Your Wallet
          <IconButton
            aria-label="close"
            onClick={() => setOpenInvestDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <ArrowUpwardIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Directly invest in a property using your wallet balance.
          </DialogContentText>
          
          <Box sx={{ bgcolor: 'primary.light', p: 2, borderRadius: 1, mb: 3 }}>
            <Typography variant="body2" color="primary.contrastText">Available Balance</Typography>
            <Typography variant="h6" color="primary.contrastText">₦{wallet.balance.toLocaleString()}</Typography>
          </Box>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="property-select-label">Select Property</InputLabel>
            <Select
              labelId="property-select-label"
              value={selectedProperty ? selectedProperty.id.toString() : ''}
              label="Select Property"
              onChange={(e) => {
                const propertyId = parseInt(e.target.value);
                const property = properties.find(p => p.id === propertyId);
                setSelectedProperty(property || null);
                if (property) {
                  // Set default investment amount to minimum
                  setInvestAmount(property.minimumInvestment.toString());
                }
              }}
            >
              <MenuItem value="" disabled>
                <em>Select a property</em>
              </MenuItem>
              {properties.map(property => (
                <MenuItem key={property.id} value={property.id.toString()}>
                  {property.name} - {property.location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {selectedProperty && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Property Details</Typography>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Box sx={{ width: 80, height: 80, mr: 2, borderRadius: 1, overflow: 'hidden' }}>
                  <img 
                    src={selectedProperty.imageUrl} 
                    alt={selectedProperty.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{selectedProperty.name}</Typography>
                  <Typography variant="body2" gutterBottom>{selectedProperty.location}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip 
                      label={`${selectedProperty.targetReturn}% ROI`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={`${selectedProperty.term} Months`} 
                      size="small" 
                      color="secondary" 
                      variant="outlined" 
                    />
                  </Stack>
                </Box>
              </Box>
              
              <Typography variant="caption" gutterBottom display="block">
                Minimum Investment: ₦{selectedProperty.minimumInvestment.toLocaleString()}
              </Typography>
              
              <LinearProgress 
                variant="determinate" 
                value={(selectedProperty.currentFunding / selectedProperty.totalFunding) * 100}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              
              <Typography variant="caption" display="block" gutterBottom>
                ₦{selectedProperty.currentFunding.toLocaleString()} of ₦{selectedProperty.totalFunding.toLocaleString()} funded
                ({Math.round((selectedProperty.currentFunding / selectedProperty.totalFunding) * 100)}%)
              </Typography>
            </Box>
          )}
          
          <TextField
            label="Investment Amount (₦)"
            type="number"
            value={investAmount}
            onChange={(e) => setInvestAmount(e.target.value)}
            fullWidth
            error={selectedProperty && (parseInt(investAmount) < selectedProperty.minimumInvestment || parseInt(investAmount) > wallet.balance)}
            helperText={
              selectedProperty && parseInt(investAmount) < selectedProperty.minimumInvestment
                ? `Minimum investment is ₦${selectedProperty.minimumInvestment.toLocaleString()}`
                : parseInt(investAmount) > wallet.balance
                ? "Amount exceeds available balance"
                : ""
            }
            InputProps={{
              startAdornment: <InputAdornment position="start">₦</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInvestDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleInvestNow}
            variant="contained"
            color="primary"
            disabled={
              investMutation.isPending || 
              !selectedProperty || 
              !investAmount || 
              parseInt(investAmount) < (selectedProperty?.minimumInvestment || 0) || 
              parseInt(investAmount) > wallet.balance
            }
          >
            {investMutation.isPending ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Processing...
              </>
            ) : (
              'Invest Now'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Export Transactions Dialog */}
      <Dialog
        open={openExportDialog}
        onClose={() => setOpenExportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Export Transactions
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Select the format and filters for your transaction export.
          </DialogContentText>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="export-format-label">Export Format</InputLabel>
            <Select
              labelId="export-format-label"
              value={exportFormat}
              label="Export Format"
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <MenuItem value="csv">
                <ListItemIcon>
                  <FileDownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="CSV (Excel)" />
              </MenuItem>
              <MenuItem value="pdf">
                <ListItemIcon>
                  <PdfIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="PDF Document" />
              </MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
            <Select
              labelId="transaction-type-label"
              value={transactionType}
              label="Transaction Type"
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <MenuItem value="all">All Transactions</MenuItem>
              <MenuItem value="deposit">Deposits Only</MenuItem>
              <MenuItem value="withdrawal">Withdrawals Only</MenuItem>
              <MenuItem value="investment">Investments Only</MenuItem>
              <MenuItem value="return">Returns Only</MenuItem>
            </Select>
          </FormControl>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={dateRange.start || ''}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="End Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={dateRange.end || ''}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExportDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleExportTransactions}
            variant="contained"
            color="primary"
            disabled={exportTransactionsMutation.isPending}
            startIcon={<SaveAltIcon />}
          >
            {exportTransactionsMutation.isPending ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Exporting...
              </>
            ) : (
              'Export'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WalletMUI;