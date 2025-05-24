import { useEffect, useState, ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
  InputAdornment,
  Autocomplete,
  Card,
  CardHeader,
  CardContent,
  Divider,
  TablePagination,
  Snackbar,
  LinearProgress,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  AccountBalance as AccountBalanceIcon, 
  Paid as PaidIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Add as AddIcon,
  SwapHoriz as SwapHorizIcon,
  Search as SearchIcon,
  FilterAlt as FilterAltIcon,
  ClearAll as ClearAllIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CompareArrows as CompareArrowsIcon,
  CalendarMonth as CalendarMonthIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  UploadFile as UploadFileIcon,
  SaveAlt as SaveAltIcon,
  Balance as BalanceIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import { saveAs } from 'file-saver';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { AdminLayout } from './AdminLayout';

// Define the wallet interface
interface Wallet {
  id: string;
  type: 'main' | 'escrow' | 'rewards';
  balance: number;
  currency: string;
  description?: string;
  lastUpdated: string;
}

// Define the transaction interface
interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  walletId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  description?: string;
  initiatedBy?: string;
  reference?: string;
}

// Define pagination interface
interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Define wallet statistics interface
interface WalletStats {
  totalBalance: number;
  walletCount: number;
  transactionStats: {
    pending: number;
    completed: number;
    total: number;
  };
  volumes: {
    deposits: number;
    withdrawals: number;
    net: number;
  };
  recentActivity: {
    count: number;
    volume: number;
  };
  currency: string;
}

// Define wallet balance history interface
interface WalletBalanceHistory {
  date: string;
  main: number;
  escrow: number;
  rewards: number;
}

// Define admin activity log interface
interface AdminActivityLog {
  id: string;
  adminId: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

// Define wallet reconciliation interface
interface WalletReconciliation {
  walletId: string;
  actualBalance: number;
  expectedBalance: number;
  discrepancy: number;
  transactionCount: number;
  timestamp: string;
  status: 'balanced' | 'discrepancy_found';
}

// Define available transaction types
const transactionTypes = ['deposit', 'withdrawal', 'transfer'];

// Define available transaction statuses
const transactionStatuses = ['pending', 'completed', 'failed'];

const WalletControlPanel = () => {
  // State for wallets and transactions
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [stats, setStats] = useState<WalletStats | null>(null);
  
  // State for new features
  const [balanceHistory, setBalanceHistory] = useState<WalletBalanceHistory[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [reconciliationReport, setReconciliationReport] = useState<WalletReconciliation | null>(null);
  
  // State for pagination
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  
  // State for filtering and search
  const [filters, setFilters] = useState({
    walletId: '',
    type: '',
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    sortDir: 'desc'
  });
  
  // State for loading and error handling
  const [walletsLoading, setWalletsLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [transactionsLoading, setTransactionsLoading] = useState<boolean>(true);
  const [balanceHistoryLoading, setBalanceHistoryLoading] = useState<boolean>(false);
  const [activityLogsLoading, setActivityLogsLoading] = useState<boolean>(false);
  const [reconciliationLoading, setReconciliationLoading] = useState<boolean>(false);
  const [processingAction, setProcessingAction] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for dialogs
  const [addFundsDialog, setAddFundsDialog] = useState<boolean>(false);
  const [transferFundsDialog, setTransferFundsDialog] = useState<boolean>(false);
  const [transactionDetailsDialog, setTransactionDetailsDialog] = useState<boolean>(false);
  const [reconciliationDialog, setReconciliationDialog] = useState<boolean>(false);
  const [importTransactionsDialog, setImportTransactionsDialog] = useState<boolean>(false);
  const [activityLogsDialog, setActivityLogsDialog] = useState<boolean>(false);
  const [balanceHistoryDialog, setBalanceHistoryDialog] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filtersVisible, setFiltersVisible] = useState<boolean>(false);
  
  // State for form data
  const [addFundsForm, setAddFundsForm] = useState({
    walletId: '',
    amount: '',
    description: '',
    reference: ''
  });
  
  const [transferFundsForm, setTransferFundsForm] = useState({
    sourceWalletId: '',
    destinationWalletId: '',
    amount: '',
    description: ''
  });
  
  const [importTransactionsForm, setImportTransactionsForm] = useState({
    file: null as File | null,
    fileFormat: 'json' as 'json' | 'csv'
  });
  
  // State for tab selection
  const [tabValue, setTabValue] = useState(0);
  const [advancedTabValue, setAdvancedTabValue] = useState(0);
  
  // State for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Function to fetch wallet data
  const fetchWallets = async () => {
    setWalletsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/admin/wallets');
      setWallets(response.data);
    } catch (err) {
      setError('Failed to load wallet data. Please try again later.');
      console.error('Error fetching wallets:', err);
    } finally {
      setWalletsLoading(false);
    }
  };

  // Function to fetch wallet statistics
  const fetchStats = async () => {
    setStatsLoading(true);
    
    try {
      const response = await axios.get('/api/admin/wallets/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching wallet stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Function to fetch transaction data with pagination and filters
  const fetchTransactions = async (page = 1, appliedFilters = filters) => {
    setTransactionsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());
      params.append('sortBy', appliedFilters.sortBy);
      params.append('sortDir', appliedFilters.sortDir);
      
      if (appliedFilters.walletId) params.append('walletId', appliedFilters.walletId);
      if (appliedFilters.type) params.append('type', appliedFilters.type);
      if (appliedFilters.status) params.append('status', appliedFilters.status);
      if (appliedFilters.search) params.append('search', appliedFilters.search);
      if (appliedFilters.startDate) params.append('startDate', appliedFilters.startDate);
      if (appliedFilters.endDate) params.append('endDate', appliedFilters.endDate);
      
      const response = await axios.get(`/api/admin/wallets/transactions?${params.toString()}`);
      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to load transaction data. Please try again later.');
      console.error('Error fetching transactions:', err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Function to fetch a specific wallet by ID
  const fetchWalletById = async (id: string) => {
    try {
      const response = await axios.get(`/api/admin/wallets/${id}`);
      setSelectedWallet(response.data);
    } catch (err) {
      console.error('Error fetching wallet:', err);
    }
  };

  // Function to fetch transactions for a specific wallet
  const fetchWalletTransactions = async (id: string) => {
    setTransactionsLoading(true);
    
    try {
      const response = await axios.get(`/api/admin/wallets/${id}/transactions`);
      setTransactions(response.data);
    } catch (err) {
      console.error('Error fetching wallet transactions:', err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Function to approve a transaction
  const approveTransaction = async (id: string) => {
    setProcessingAction(true);
    
    try {
      const response = await axios.post(`/api/admin/wallets/transactions/${id}/approve`);
      
      // Update the transaction status in the UI
      setTransactions(prevTransactions => 
        prevTransactions.map(transaction => 
          transaction.id === id 
            ? { ...transaction, status: 'completed' } 
            : transaction
        )
      );
      
      // Update the wallet data
      const updatedWallet = response.data.wallet;
      setWallets(prevWallets => 
        prevWallets.map(wallet => 
          wallet.id === updatedWallet.id 
            ? updatedWallet 
            : wallet
        )
      );
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Transaction approved successfully',
        severity: 'success'
      });
      
      // Refresh stats
      fetchStats();
    } catch (err) {
      setError('Failed to approve transaction. Please try again.');
      console.error('Error approving transaction:', err);
      
      setSnackbar({
        open: true,
        message: 'Failed to approve transaction',
        severity: 'error'
      });
    } finally {
      setProcessingAction(false);
    }
  };

  // Function to add funds to a wallet
  const handleAddFunds = async () => {
    setProcessingAction(true);
    
    try {
      const response = await axios.post('/api/admin/wallets/add-funds', addFundsForm);
      
      // Update wallets data
      const updatedWallet = response.data.wallet;
      setWallets(prevWallets => 
        prevWallets.map(wallet => 
          wallet.id === updatedWallet.id 
            ? updatedWallet 
            : wallet
        )
      );
      
      // Add new transaction to the list if it matches current filters
      const newTransaction = response.data.transaction;
      if (
        (!filters.walletId || filters.walletId === newTransaction.walletId) &&
        (!filters.type || filters.type === newTransaction.type) &&
        (!filters.status || filters.status === newTransaction.status)
      ) {
        setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
      }
      
      // Close dialog and reset form
      setAddFundsDialog(false);
      setAddFundsForm({
        walletId: '',
        amount: '',
        description: '',
        reference: ''
      });
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Funds added successfully',
        severity: 'success'
      });
      
      // Refresh stats
      fetchStats();
    } catch (err) {
      console.error('Error adding funds:', err);
      
      setSnackbar({
        open: true,
        message: 'Failed to add funds',
        severity: 'error'
      });
    } finally {
      setProcessingAction(false);
    }
  };

  // Function to transfer funds between wallets
  const handleTransferFunds = async () => {
    setProcessingAction(true);
    
    try {
      const response = await axios.post('/api/admin/wallets/transfer', transferFundsForm);
      
      // Update wallets data
      const sourceWallet = response.data.sourceWallet;
      const destWallet = response.data.destinationWallet;
      setWallets(prevWallets => 
        prevWallets.map(wallet => {
          if (wallet.id === sourceWallet.id) return sourceWallet;
          if (wallet.id === destWallet.id) return destWallet;
          return wallet;
        })
      );
      
      // Add new transaction to the list if it matches current filters
      const newTransaction = response.data.transaction;
      if (
        (!filters.walletId || filters.walletId === newTransaction.walletId) &&
        (!filters.type || filters.type === newTransaction.type) &&
        (!filters.status || filters.status === newTransaction.status)
      ) {
        setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
      }
      
      // Close dialog and reset form
      setTransferFundsDialog(false);
      setTransferFundsForm({
        sourceWalletId: '',
        destinationWalletId: '',
        amount: '',
        description: ''
      });
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Funds transferred successfully',
        severity: 'success'
      });
      
      // Refresh stats
      fetchStats();
    } catch (err) {
      console.error('Error transferring funds:', err);
      
      setSnackbar({
        open: true,
        message: 'Failed to transfer funds',
        severity: 'error'
      });
    } finally {
      setProcessingAction(false);
    }
  };

  // Function to handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Function to handle page change
  const handlePageChange = (_event: unknown, newPage: number) => {
    fetchTransactions(newPage + 1);
  };

  // Function to handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    setPagination({
      ...pagination,
      limit: newLimit,
      page: 1
    });
    
    fetchTransactions(1, filters);
  };

  // Function to apply filters
  const applyFilters = () => {
    fetchTransactions(1, filters);
  };

  // Function to clear filters
  const clearFilters = () => {
    const clearedFilters = {
      walletId: '',
      type: '',
      status: '',
      search: '',
      startDate: '',
      endDate: '',
      sortBy: 'date',
      sortDir: 'desc'
    };
    
    setFilters(clearedFilters);
    fetchTransactions(1, clearedFilters);
  };

  // Function to view transaction details
  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTransactionDetailsDialog(true);
  };

  // Function to close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Function to fetch wallet balance history
  const fetchBalanceHistory = async () => {
    setBalanceHistoryLoading(true);
    
    try {
      const response = await axios.get('/api/admin/wallets/balance-history');
      setBalanceHistory(response.data);
    } catch (err) {
      console.error('Error fetching balance history:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load balance history data',
        severity: 'error'
      });
    } finally {
      setBalanceHistoryLoading(false);
    }
  };

  // Function to fetch admin activity logs
  const fetchActivityLogs = async () => {
    setActivityLogsLoading(true);
    
    try {
      const response = await axios.get('/api/admin/wallets/activity-logs');
      setActivityLogs(response.data);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load activity logs',
        severity: 'error'
      });
    } finally {
      setActivityLogsLoading(false);
    }
  };

  // Function to perform wallet reconciliation
  const reconcileWallet = async (walletId: string) => {
    setReconciliationLoading(true);
    
    try {
      const response = await axios.post(`/api/admin/wallets/${walletId}/reconcile`);
      setReconciliationReport(response.data.reconciliation);
      
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: response.data.reconciliation.status === 'balanced' ? 'success' : 'warning'
      });
    } catch (err) {
      console.error('Error reconciling wallet:', err);
      setSnackbar({
        open: true,
        message: 'Failed to reconcile wallet',
        severity: 'error'
      });
    } finally {
      setReconciliationLoading(false);
    }
  };

  // Function to export transactions
  const exportTransactions = async (format: 'json' | 'csv' = 'csv') => {
    try {
      // Build query parameters for filtering
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters.walletId) params.append('walletId', filters.walletId);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      // If format is JSON, fetch and download JSON file
      if (format === 'json') {
        const response = await axios.get(`/api/admin/wallets/transactions/export?${params.toString()}`);
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        saveAs(blob, `transactions-export-${new Date().toISOString().split('T')[0]}.json`);
      } else {
        // For CSV, use direct download as server sends appropriate headers
        const response = await axios.get(`/api/admin/wallets/transactions/export?${params.toString()}`, {
          responseType: 'blob'
        });
        
        saveAs(response.data, `transactions-export-${new Date().toISOString().split('T')[0]}.csv`);
      }
      
      setSnackbar({
        open: true,
        message: `Transactions exported successfully as ${format.toUpperCase()}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error exporting transactions:', err);
      setSnackbar({
        open: true,
        message: 'Failed to export transactions',
        severity: 'error'
      });
    }
  };

  // Function to handle file import
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImportTransactionsForm({
        ...importTransactionsForm,
        file: event.target.files[0]
      });
    }
  };

  // Function to import transactions
  const importTransactions = async () => {
    if (!importTransactionsForm.file) {
      setSnackbar({
        open: true,
        message: 'Please select a file to import',
        severity: 'warning'
      });
      return;
    }
    
    setProcessingAction(true);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          if (!e.target || typeof e.target.result !== 'string') {
            throw new Error('Failed to read file');
          }
          
          let transactions;
          
          if (importTransactionsForm.fileFormat === 'json') {
            transactions = JSON.parse(e.target.result);
          } else {
            // For CSV, we would need proper CSV parsing (not implemented here)
            throw new Error('CSV import not yet implemented');
          }
          
          const response = await axios.post('/api/admin/wallets/transactions/import', {
            transactions: Array.isArray(transactions) ? transactions : [transactions]
          });
          
          setSnackbar({
            open: true,
            message: response.data.message,
            severity: 'success'
          });
          
          setImportTransactionsDialog(false);
          setImportTransactionsForm({
            file: null,
            fileFormat: 'json'
          });
          
          // Refresh transactions
          fetchTransactions();
        } catch (err) {
          console.error('Error processing file:', err);
          setSnackbar({
            open: true,
            message: 'Failed to process import file',
            severity: 'error'
          });
        } finally {
          setProcessingAction(false);
        }
      };
      
      reader.readAsText(importTransactionsForm.file);
    } catch (err) {
      console.error('Error importing transactions:', err);
      setSnackbar({
        open: true,
        message: 'Failed to import transactions',
        severity: 'error'
      });
      setProcessingAction(false);
    }
  };

  // Function to handle advanced tab change
  const handleAdvancedTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setAdvancedTabValue(newValue);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchWallets();
    fetchTransactions();
    fetchStats();
  }, []);

  // Format currency for display
  const formatCurrency = (amount: number, currency: string) => {
    return `${currency}${amount.toLocaleString('en-NG')}`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get appropriate color for wallet type
  const getWalletTypeColor = (type: string) => {
    switch(type) {
      case 'main': return '#4CAF50';
      case 'escrow': return '#2196F3';
      case 'rewards': return '#FF9800';
      default: return '#757575';
    }
  };

  // Get appropriate icon for transaction type
  const getTransactionTypeIcon = (type: string) => {
    switch(type) {
      case 'deposit': return <TrendingUpIcon sx={{ color: 'success.main' }} />;
      case 'withdrawal': return <TrendingDownIcon sx={{ color: 'info.main' }} />;
      case 'transfer': return <CompareArrowsIcon sx={{ color: 'secondary.main' }} />;
      default: return <PaidIcon />;
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Platform Wallet Control Panel
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Wallet Statistics Section */}
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: '500', mb: 2 }}>
              Dashboard Overview
              <Button 
                startIcon={<RefreshIcon />} 
                size="small" 
                sx={{ ml: 2 }}
                onClick={fetchStats}
                disabled={statsLoading}
              >
                Refresh
              </Button>
            </Typography>

            {statsLoading ? (
              <LinearProgress sx={{ my: 2 }} />
            ) : stats ? (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={2} sx={{ bgcolor: '#f8f9fa', height: '100%' }}>
                    <CardContent>
                      <Typography color="textSecondary" variant="subtitle2">
                        Total Balance
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                        {formatCurrency(stats.totalBalance, stats.currency)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Across {stats.walletCount} wallets
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={2} sx={{ bgcolor: '#f8f9fa', height: '100%' }}>
                    <CardContent>
                      <Typography color="textSecondary" variant="subtitle2">
                        Pending Transactions
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                        {stats.transactionStats.pending}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Out of {stats.transactionStats.total} total
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={2} sx={{ bgcolor: '#f8f9fa', height: '100%' }}>
                    <CardContent>
                      <Typography color="textSecondary" variant="subtitle2">
                        Net Transaction Volume
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                        {formatCurrency(stats.volumes.net, stats.currency)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Deposits: {formatCurrency(stats.volumes.deposits, stats.currency)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={2} sx={{ bgcolor: '#f8f9fa', height: '100%' }}>
                    <CardContent>
                      <Typography color="textSecondary" variant="subtitle2">
                        Recent Activity (7 days)
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                        {stats.recentActivity.count} Transactions
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Volume: {formatCurrency(stats.recentActivity.volume, stats.currency)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Typography>No statistics available</Typography>
            )}
          </Paper>
        </Box>

        {/* Tabs for Wallet and Transactions */}
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
                sx={{ mb: 2, flex: 1 }}
              >
                <Tab label="Wallet Management" />
                <Tab label="Transaction Management" />
              </Tabs>
              <Box sx={{ pr: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AdminPanelSettingsIcon />}
                  onClick={() => {
                    // Initialize data when opening the advanced tools modal
                    fetchBalanceHistory();
                    fetchActivityLogs();
                    setAdvancedTabValue(0);
                    setBalanceHistoryDialog(true);
                  }}
                  sx={{ mr: 1 }}
                >
                  Advanced Tools
                </Button>
              </Box>
            </Box>

            {/* Wallet Management Tab */}
            {tabValue === 0 && (
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: '500' }}>
                    Platform Wallets
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => setAddFundsDialog(true)}
                    >
                      Add Funds
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      startIcon={<SwapHorizIcon />}
                      onClick={() => setTransferFundsDialog(true)}
                    >
                      Transfer Funds
                    </Button>
                    <Button 
                      startIcon={<RefreshIcon />} 
                      variant="outlined"
                      onClick={fetchWallets}
                      disabled={walletsLoading}
                    >
                      Refresh
                    </Button>
                  </Stack>
                </Box>

                {walletsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {wallets.map((wallet) => (
                      <Grid item xs={12} sm={6} md={4} key={wallet.id}>
                        <Paper 
                          elevation={3} 
                          sx={{ 
                            p: 3, 
                            height: '100%',
                            borderTop: `4px solid ${getWalletTypeColor(wallet.type)}`,
                            borderRadius: '8px',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 6
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box 
                              sx={{ 
                                bgcolor: getWalletTypeColor(wallet.type), 
                                p: 1, 
                                borderRadius: '50%', 
                                mr: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <AccountBalanceIcon sx={{ color: 'white' }} />
                            </Box>
                            <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                              {wallet.type} Wallet
                            </Typography>
                          </Box>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                            {formatCurrency(wallet.balance, wallet.currency)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {wallet.description || `Platform ${wallet.type} wallet`}
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Last updated: {formatDate(wallet.lastUpdated)}
                            </Typography>
                            <Box>
                              <Tooltip title="View Transactions">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFilters({...filters, walletId: wallet.id});
                                    setTabValue(1);
                                    fetchTransactions(1, {...filters, walletId: wallet.id});
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Add Funds">
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAddFundsForm({...addFundsForm, walletId: wallet.id});
                                    setAddFundsDialog(true);
                                  }}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reconcile Wallet">
                                <IconButton 
                                  size="small" 
                                  color="info"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    reconcileWallet(wallet.id);
                                    setReconciliationDialog(true);
                                  }}
                                >
                                  <BalanceIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* Transaction Management Tab */}
            {tabValue === 1 && (
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: '500' }}>
                    Transaction Management
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Export Transactions">
                      <Button
                        variant="outlined"
                        color="success"
                        startIcon={<SaveAltIcon />}
                        onClick={() => exportTransactions('csv')}
                      >
                        Export
                      </Button>
                    </Tooltip>
                    <Tooltip title="Import Transactions">
                      <Button
                        variant="outlined"
                        color="info"
                        startIcon={<UploadFileIcon />}
                        onClick={() => setImportTransactionsDialog(true)}
                      >
                        Import
                      </Button>
                    </Tooltip>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      startIcon={<FilterAltIcon />}
                      onClick={() => setFiltersVisible(!filtersVisible)}
                    >
                      {filtersVisible ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                    <Button 
                      startIcon={<RefreshIcon />} 
                      variant="outlined"
                      onClick={() => fetchTransactions(pagination.page)}
                      disabled={transactionsLoading}
                    >
                      Refresh
                    </Button>
                  </Stack>
                </Box>

                {/* Filters Panel */}
                {filtersVisible && (
                  <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Wallet</InputLabel>
                          <Select
                            value={filters.walletId}
                            label="Wallet"
                            onChange={(e) => setFilters({...filters, walletId: e.target.value})}
                          >
                            <MenuItem value="">All Wallets</MenuItem>
                            {wallets.map(wallet => (
                              <MenuItem key={wallet.id} value={wallet.id}>
                                {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)} Wallet
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={filters.type}
                            label="Type"
                            onChange={(e) => setFilters({...filters, type: e.target.value})}
                          >
                            <MenuItem value="">All Types</MenuItem>
                            {transactionTypes.map(type => (
                              <MenuItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={filters.status}
                            label="Status"
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                          >
                            <MenuItem value="">All Statuses</MenuItem>
                            {transactionStatuses.map(status => (
                              <MenuItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Search"
                          size="small"
                          value={filters.search}
                          onChange={(e) => setFilters({...filters, search: e.target.value})}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                          placeholder="ID, Description, Reference..."
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Start Date"
                          type="date"
                          size="small"
                          value={filters.startDate}
                          onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="End Date"
                          type="date"
                          size="small"
                          value={filters.endDate}
                          onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Sort By</InputLabel>
                          <Select
                            value={filters.sortBy}
                            label="Sort By"
                            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                          >
                            <MenuItem value="date">Date</MenuItem>
                            <MenuItem value="amount">Amount</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Sort Direction</InputLabel>
                          <Select
                            value={filters.sortDir}
                            label="Sort Direction"
                            onChange={(e) => setFilters({...filters, sortDir: e.target.value})}
                          >
                            <MenuItem value="desc">Newest First</MenuItem>
                            <MenuItem value="asc">Oldest First</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={applyFilters}
                          sx={{ mr: 1 }}
                        >
                          Apply
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<ClearAllIcon />}
                          onClick={clearFilters}
                        >
                          Clear
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {/* Transactions Table */}
                {transactionsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 3, borderRadius: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell>Transaction ID</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell width="150px">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {transactions.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} align="center">
                                <Typography sx={{ py: 2 }}>No transactions found</Typography>
                              </TableCell>
                            </TableRow>
                          )}
                          {transactions.map((transaction) => (
                            <TableRow key={transaction.id} 
                              sx={{ 
                                '&:hover': { bgcolor: '#f9f9f9' },
                                cursor: 'pointer'
                              }}
                              onClick={() => viewTransactionDetails(transaction)}
                            >
                              <TableCell>{transaction.id}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {getTransactionTypeIcon(transaction.type)}
                                  <Typography sx={{ ml: 1, textTransform: 'capitalize' }}>
                                    {transaction.type}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ maxWidth: 200 }}>
                                <Tooltip title={transaction.description || ''}>
                                  <Typography noWrap>{transaction.description || 'N/A'}</Typography>
                                </Tooltip>
                              </TableCell>
                              <TableCell sx={{ fontWeight: 500 }}>
                                ₦{transaction.amount.toLocaleString('en-NG')}
                              </TableCell>
                              <TableCell>{formatDate(transaction.date)}</TableCell>
                              <TableCell>
                                <Chip
                                  label={transaction.status}
                                  color={
                                    transaction.status === 'completed' ? 'success' : 
                                    transaction.status === 'pending' ? 'warning' : 'error'
                                  }
                                  size="small"
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                {transaction.status === 'pending' ? (
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    startIcon={<CheckIcon />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      approveTransaction(transaction.id);
                                    }}
                                    disabled={processingAction}
                                  >
                                    Approve
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    disabled
                                  >
                                    {transaction.status === 'completed' ? 'Completed' : 'Failed'}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    {/* Pagination */}
                    <TablePagination
                      component="div"
                      count={pagination.total}
                      page={pagination.page - 1}
                      onPageChange={handlePageChange}
                      rowsPerPage={pagination.limit}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      sx={{ mt: 2 }}
                    />
                  </>
                )}
              </Box>
            )}
          </Paper>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Production Implementation Notes
          </Typography>
          <Paper sx={{ p: 2, bgcolor: '#f5f7ff' }}>
            <Typography variant="body2">
              <strong>For Production Environment:</strong>
              <ul>
                <li>Implement proper role-based access control for wallet management</li>
                <li>Add multi-factor authentication for transaction approvals (especially for high-value transactions)</li>
                <li>Implement comprehensive transaction logging for audit purposes with immutable records</li>
                <li>Add withdrawal limits and approval thresholds based on amount</li>
                <li>Set up real-time notifications for high-value transactions with SMS/email alerts</li>
                <li>Implement reconciliation tools for platform wallets with external payment providers</li>
                <li>Add detailed reporting with export capabilities (CSV/Excel/PDF)</li>
                <li>Set up periodic wallet balance checks and automated account reconciliation</li>
                <li>Implement dual control for critical transactions (requiring two administrators)</li>
                <li>Add comprehensive activity logs for compliance and regulatory requirements</li>
              </ul>
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Add Funds Dialog */}
      <Dialog 
        open={addFundsDialog} 
        onClose={() => setAddFundsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Funds to Wallet</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Wallet</InputLabel>
              <Select
                value={addFundsForm.walletId}
                onChange={(e) => setAddFundsForm({...addFundsForm, walletId: e.target.value})}
                label="Select Wallet"
              >
                {wallets.map(wallet => (
                  <MenuItem key={wallet.id} value={wallet.id}>
                    {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)} Wallet - {formatCurrency(wallet.balance, wallet.currency)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Amount"
              type="number"
              sx={{ mb: 2 }}
              value={addFundsForm.amount}
              onChange={(e) => setAddFundsForm({...addFundsForm, amount: e.target.value})}
              InputProps={{
                startAdornment: <InputAdornment position="start">₦</InputAdornment>,
              }}
            />
            
            <TextField
              fullWidth
              label="Description"
              sx={{ mb: 2 }}
              value={addFundsForm.description}
              onChange={(e) => setAddFundsForm({...addFundsForm, description: e.target.value})}
              placeholder="E.g., Bank deposit, Platform funding"
            />
            
            <TextField
              fullWidth
              label="Reference (Optional)"
              sx={{ mb: 2 }}
              value={addFundsForm.reference}
              onChange={(e) => setAddFundsForm({...addFundsForm, reference: e.target.value})}
              placeholder="E.g., Bank reference, Transaction ID"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFundsDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAddFunds}
            disabled={!addFundsForm.walletId || !addFundsForm.amount || processingAction}
          >
            {processingAction ? <CircularProgress size={24} /> : 'Add Funds'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Funds Dialog */}
      <Dialog 
        open={transferFundsDialog} 
        onClose={() => setTransferFundsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Transfer Funds Between Wallets</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Source Wallet</InputLabel>
              <Select
                value={transferFundsForm.sourceWalletId}
                onChange={(e) => setTransferFundsForm({...transferFundsForm, sourceWalletId: e.target.value})}
                label="Source Wallet"
              >
                {wallets.map(wallet => (
                  <MenuItem key={wallet.id} value={wallet.id}>
                    {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)} Wallet - {formatCurrency(wallet.balance, wallet.currency)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Destination Wallet</InputLabel>
              <Select
                value={transferFundsForm.destinationWalletId}
                onChange={(e) => setTransferFundsForm({...transferFundsForm, destinationWalletId: e.target.value})}
                label="Destination Wallet"
                disabled={!transferFundsForm.sourceWalletId}
              >
                {wallets
                  .filter(wallet => wallet.id !== transferFundsForm.sourceWalletId)
                  .map(wallet => (
                    <MenuItem key={wallet.id} value={wallet.id}>
                      {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)} Wallet - {formatCurrency(wallet.balance, wallet.currency)}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Amount"
              type="number"
              sx={{ mb: 2 }}
              value={transferFundsForm.amount}
              onChange={(e) => setTransferFundsForm({...transferFundsForm, amount: e.target.value})}
              InputProps={{
                startAdornment: <InputAdornment position="start">₦</InputAdornment>,
              }}
            />
            
            <TextField
              fullWidth
              label="Description"
              sx={{ mb: 2 }}
              value={transferFundsForm.description}
              onChange={(e) => setTransferFundsForm({...transferFundsForm, description: e.target.value})}
              placeholder="E.g., Transfer for operational expenses"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferFundsDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleTransferFunds}
            disabled={
              !transferFundsForm.sourceWalletId || 
              !transferFundsForm.destinationWalletId || 
              !transferFundsForm.amount || 
              transferFundsForm.sourceWalletId === transferFundsForm.destinationWalletId ||
              processingAction
            }
          >
            {processingAction ? <CircularProgress size={24} /> : 'Transfer Funds'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Details Dialog */}
      <Dialog 
        open={transactionDetailsDialog} 
        onClose={() => setTransactionDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Transaction ID</Typography>
                  <Typography variant="body1">{selectedTransaction.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Type</Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center' }}>
                    {getTransactionTypeIcon(selectedTransaction.type)}
                    <span style={{ marginLeft: '8px' }}>{selectedTransaction.type}</span>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Amount</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    ₦{selectedTransaction.amount.toLocaleString('en-NG')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Chip
                    label={selectedTransaction.status}
                    color={
                      selectedTransaction.status === 'completed' ? 'success' : 
                      selectedTransaction.status === 'pending' ? 'warning' : 'error'
                    }
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Date</Typography>
                  <Typography variant="body1">{formatDate(selectedTransaction.date)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                  <Typography variant="body1">{selectedTransaction.description || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Reference</Typography>
                  <Typography variant="body1">{selectedTransaction.reference || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Initiated By</Typography>
                  <Typography variant="body1">{selectedTransaction.initiatedBy || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Wallet</Typography>
                  <Typography variant="body1">
                    {wallets.find(w => w.id === selectedTransaction.walletId)?.type.charAt(0).toUpperCase() + 
                      wallets.find(w => w.id === selectedTransaction.walletId)?.type.slice(1) || 'Unknown'} Wallet
                  </Typography>
                </Grid>
              </Grid>
              
              {selectedTransaction.status === 'pending' && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CheckIcon />}
                    onClick={() => {
                      approveTransaction(selectedTransaction.id);
                      setTransactionDetailsDialog(false);
                    }}
                    disabled={processingAction}
                  >
                    Approve Transaction
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransactionDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Balance History Dialog */}
      <Dialog
        open={balanceHistoryDialog}
        onClose={() => setBalanceHistoryDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Advanced Wallet Tools</Typography>
            <IconButton edge="end" color="inherit" onClick={() => setBalanceHistoryDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Tabs
            value={advancedTabValue}
            onChange={handleAdvancedTabChange}
            aria-label="advanced tools tabs"
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Wallet Balance History" icon={<HistoryIcon />} iconPosition="start" />
            <Tab label="Admin Activity Logs" icon={<AdminPanelSettingsIcon />} iconPosition="start" />
            <Tab label="Recent Reconciliations" icon={<BalanceIcon />} iconPosition="start" />
          </Tabs>

          {/* Wallet Balance History Tab */}
          {advancedTabValue === 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Historical Balance Trends
              </Typography>
              
              {balanceHistoryLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Paper elevation={1} sx={{ p: 2, my: 2 }}>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={balanceHistory}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => [
                            `₦${value.toLocaleString()}`, 
                            name.charAt(0).toUpperCase() + name.slice(1)
                          ]}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="main" stackId="1" stroke="#4CAF50" fill="#4CAF50" name="Main Wallet" />
                        <Area type="monotone" dataKey="escrow" stackId="1" stroke="#2196F3" fill="#2196F3" name="Escrow Wallet" />
                        <Area type="monotone" dataKey="rewards" stackId="1" stroke="#FF9800" fill="#FF9800" name="Rewards Wallet" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                    Chart shows the balance history of all platform wallets over time
                  </Typography>
                </Paper>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />} 
                  onClick={fetchBalanceHistory}
                  disabled={balanceHistoryLoading}
                >
                  Refresh Data
                </Button>
              </Box>
            </Box>
          )}

          {/* Admin Activity Logs Tab */}
          {advancedTabValue === 1 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Admin Activity Logs for Wallet Operations
              </Typography>
              
              {activityLogsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Paper elevation={1} sx={{ p: 2, my: 2 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell>Admin ID</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Target</TableCell>
                          <TableCell>Details</TableCell>
                          <TableCell>Timestamp</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activityLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{log.adminId}</TableCell>
                            <TableCell>
                              <Chip 
                                label={log.action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} 
                                size="small"
                                color={
                                  log.action.includes('approve') ? 'success' :
                                  log.action.includes('transfer') ? 'info' :
                                  log.action.includes('reconcile') ? 'warning' : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>{log.target}</TableCell>
                            <TableCell>{log.details}</TableCell>
                            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />} 
                  onClick={fetchActivityLogs}
                  disabled={activityLogsLoading}
                >
                  Refresh Logs
                </Button>
              </Box>
            </Box>
          )}

          {/* Wallet Reconciliation Tab */}
          {advancedTabValue === 2 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Wallet Reconciliation
              </Typography>
              
              {reconciliationReport ? (
                <Paper elevation={1} sx={{ p: 3, my: 2, border: `1px solid ${reconciliationReport.status === 'balanced' ? 'green' : 'orange'}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: '50%', 
                      bgcolor: reconciliationReport.status === 'balanced' ? 'success.light' : 'warning.light',
                      mr: 2
                    }}>
                      {reconciliationReport.status === 'balanced' ? 
                        <CheckIcon sx={{ color: 'white' }} /> : 
                        <WarningIcon sx={{ color: 'white' }} />
                      }
                    </Box>
                    <Typography variant="h6">
                      {reconciliationReport.status === 'balanced' 
                        ? 'Wallet is Balanced' 
                        : 'Wallet Discrepancy Found'}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">Wallet ID</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{reconciliationReport.walletId}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">Actual Balance</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>₦{reconciliationReport.actualBalance.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">Expected Balance</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>₦{reconciliationReport.expectedBalance.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">Discrepancy</Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 'medium',
                          color: Math.abs(reconciliationReport.discrepancy) > 0 ? 'error.main' : 'inherit'
                        }}
                      >
                        ₦{reconciliationReport.discrepancy.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">Transactions Analyzed</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{reconciliationReport.transactionCount}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">Timestamp</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{new Date(reconciliationReport.timestamp).toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ) : (
                <Alert severity="info" sx={{ my: 2 }}>
                  No recent reconciliation data. Use the reconcile button on any wallet to perform a reconciliation check.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Transactions Dialog */}
      <Dialog
        open={importTransactionsDialog}
        onClose={() => setImportTransactionsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import Transactions</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload a JSON file containing transaction data to import. Each transaction must have at minimum: type, walletId, and amount fields.
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Format</InputLabel>
              <Select
                value={importTransactionsForm.fileFormat}
                label="Format"
                onChange={(e) => setImportTransactionsForm({
                  ...importTransactionsForm, 
                  fileFormat: e.target.value as 'json' | 'csv'
                })}
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv" disabled>CSV (Coming Soon)</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<UploadFileIcon />}
              sx={{ mb: 2, py: 1 }}
            >
              Select File
              <input 
                type="file" 
                hidden 
                accept={importTransactionsForm.fileFormat === 'json' ? '.json' : '.csv'} 
                onChange={handleFileChange} 
              />
            </Button>
            
            {importTransactionsForm.file && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Selected file: {importTransactionsForm.file.name} ({Math.round(importTransactionsForm.file.size / 1024)} KB)
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportTransactionsDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={importTransactions}
            disabled={!importTransactionsForm.file || processingAction}
          >
            {processingAction ? <CircularProgress size={24} /> : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reconciliation Dialog */}
      <Dialog
        open={reconciliationDialog}
        onClose={() => setReconciliationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Wallet Reconciliation Results</DialogTitle>
        <DialogContent>
          {reconciliationLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : reconciliationReport ? (
            <Box sx={{ mt: 2 }}>
              <Alert 
                severity={reconciliationReport.status === 'balanced' ? 'success' : 'warning'} 
                sx={{ mb: 3 }}
              >
                {reconciliationReport.status === 'balanced' 
                  ? 'Wallet balances successfully reconciled' 
                  : `Discrepancy of ₦${reconciliationReport.discrepancy.toLocaleString()} found`}
              </Alert>
              
              <Typography variant="subtitle2" sx={{ mt: 2 }}>Reconciliation Details:</Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Actual Balance:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    ₦{reconciliationReport.actualBalance.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Expected Balance:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    ₦{reconciliationReport.expectedBalance.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Transactions Analyzed:</Typography>
                  <Typography variant="body1">{reconciliationReport.transactionCount}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Reconciliation Time:</Typography>
                  <Typography variant="body1">{new Date(reconciliationReport.timestamp).toLocaleString()}</Typography>
                </Grid>
              </Grid>
              
              {reconciliationReport.status !== 'balanced' && (
                <Box sx={{ mt: 3, bgcolor: '#fff4e5', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="warning.dark">Action Required</Typography>
                  <Typography variant="body2">
                    Please review recent transactions for this wallet and reconcile the discrepancy manually.
                    Common causes include:
                    <ul>
                      <li>Transactions processed outside the platform</li>
                      <li>Manual balance adjustments</li>
                      <li>Failed transaction rollbacks</li>
                    </ul>
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Typography sx={{ mt: 2 }}>No reconciliation data available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReconciliationDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default WalletControlPanel;