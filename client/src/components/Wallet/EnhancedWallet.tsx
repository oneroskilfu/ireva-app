import React, { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';

// Material UI imports
import {
  Box,
  Button as MuiButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Card as MuiCard,
  CardContent as MuiCardContent,
  Tabs as MuiTabs,
  Tab as MuiTab,
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

// Material UI Icons
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

// Shadcn UI imports
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// Lucide icons
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  ChevronDown,
  Download,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// Tour components
import { Step } from 'react-joyride';
import { OnboardingTour, TourButton } from '@/components/OnboardingTour';

// Interfaces
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

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const EnhancedWallet: React.FC = () => {
  // State variables
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
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [shadcnTabValue, setShadcnTabValue] = useState('transactions');
  
  // Refs for tour elements
  const walletCardRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const transactionsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Tour steps
  const tourSteps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to your enhanced iREVA Wallet! This modern interface provides all the features you need to manage your investments.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.enhanced-wallet-card',
      content: 'Here\'s your wallet overview showing your current balance and financial summary.',
      placement: 'bottom',
    },
    {
      target: '.enhanced-wallet-tabs',
      content: 'These tabs let you switch between different wallet views: Transactions, Payment Methods, and Settings.',
      placement: 'top',
    },
    {
      target: '.enhanced-transaction-table',
      content: 'This table shows your transaction history with details like date, amount, and status.',
      placement: 'top',
    },
    {
      target: '.enhanced-wallet-actions',
      content: 'Use these buttons to perform quick actions like depositing or withdrawing funds.',
      placement: 'left',
    },
    {
      target: 'body',
      content: 'That\'s it! You can now easily manage your investments with this enhanced wallet interface.',
      placement: 'center',
    }
  ];
  
  // Function to start the tour manually
  const startTour = () => {
    // Reset tour and start again
    const existingTours = localStorage.getItem('iREVA-completed-tours');
    if (existingTours) {
      const tours = JSON.parse(existingTours);
      const filteredTours = tours.filter((tour: string) => tour !== 'enhanced-wallet-tour');
      localStorage.setItem('iREVA-completed-tours', JSON.stringify(filteredTours));
    }
    // Refresh page to trigger tour
    window.location.reload();
  };

  // Fetch wallet data using React Query
  const { 
    data: wallet = { 
      balance: 0,
      pendingDeposits: 0,
      pendingWithdrawals: 0,
      availableBalance: 0,
      totalInvested: 0,
      totalReturns: 0
    }, 
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
      setShowAddFunds(false);
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
      setShowWithdraw(false);
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

  const handleMuiTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleShadcnTabChange = (value: string) => {
    setShadcnTabValue(value);
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

  const handleRefreshBalance = () => {
    refetchWallet();
    refetchTransactions();
    toast({
      title: 'Wallet refreshed',
      description: 'Your wallet balance has been updated.',
    });
  };

  const handleDownloadStatement = () => {
    setOpenExportDialog(true);
  };

  // Loading state
  if (walletLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Wallet</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/3 mb-1"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse mb-6">
          <CardHeader>
            <div className="h-4 bg-muted rounded w-1/3 mb-1"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-24 bg-muted rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-muted rounded w-1/3 mb-1"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Helmet>
        <title>My Wallet | iREVA</title>
      </Helmet>

      {/* Onboarding Tour */}
      <OnboardingTour
        steps={tourSteps}
        tourId="enhanced-wallet-tour"
      />

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Wallet</h1>
          <p className="text-muted-foreground">
            Manage your funds, deposits, withdrawals, and investments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TourButton 
            onClick={startTour}
            label="Tour Wallet"
            tooltipText="Take a guided tour of your wallet"
          />
        </div>
      </div>

      {/* Main Wallet Card - Material UI Style with ShadCN elements */}
      <MuiCard 
        elevation={3} 
        sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }} 
        className="enhanced-wallet-card"
        ref={walletCardRef}
      >
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
          
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }} className="enhanced-wallet-actions" ref={actionsRef}>
            <MuiButton 
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
            </MuiButton>
            <MuiButton 
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
            </MuiButton>
            <MuiButton 
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
            </MuiButton>
          </Box>
        </Box>
        <MuiCardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} component="div">
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Pending Transactions
                </Typography>
                <Typography variant="h6" fontWeight="medium">
                  ₦{((wallet.pendingDeposits || 0) + (wallet.pendingWithdrawals || 0)).toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
                  <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ArrowDownwardIcon fontSize="inherit" /> ₦{wallet.pendingDeposits?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="caption" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ArrowUpwardIcon fontSize="inherit" /> ₦{wallet.pendingWithdrawals?.toLocaleString() || '0'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} component="div">
              <Box sx={{ p: 1, textAlign: 'center', borderLeft: { xs: 0, md: 1 }, borderRight: { xs: 0, md: 1 }, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Invested
                </Typography>
                <Typography variant="h6" fontWeight="medium">
                  ₦{wallet.totalInvested?.toLocaleString() || '0'}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    size="small" 
                    color="success" 
                    label={`Returns: ₦${wallet.totalReturns?.toLocaleString() || '0'}`} 
                    variant="outlined" 
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} component="div">
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Active Investments
                </Typography>
                <Typography variant="h6" fontWeight="medium">
                  {investments.filter(inv => inv.status === 'active').length}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <MuiButton 
                    size="small" 
                    variant="text" 
                    endIcon={<ArrowUpwardIcon fontSize="small" />}
                    onClick={() => navigate('/investor/portfolio')}
                  >
                    View Portfolio
                  </MuiButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </MuiCardContent>
      </MuiCard>

      {/* Alternate wallet cards using Shadcn UI - Mobile-friendly grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Available Balance</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              {formatCurrency(wallet.availableBalance || wallet.balance)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center">
              <WalletIcon className="h-3 w-3 mr-1" /> 
              Total balance: {formatCurrency(wallet.balance)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Transactions</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency((wallet.pendingDeposits || 0) + (wallet.pendingWithdrawals || 0))}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center">
                <ArrowDownCircle className="h-3 w-3 mr-1 text-green-500" />
                Deposits: {formatCurrency(wallet.pendingDeposits || 0)}
              </span>
              <span className="flex items-center">
                <ArrowUpCircle className="h-3 w-3 mr-1 text-orange-500" />
                Withdrawals: {formatCurrency(wallet.pendingWithdrawals || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Investment Overview</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(wallet.totalInvested || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Total Invested</span>
              <span className="flex items-center font-medium text-green-600">
                +{formatCurrency(wallet.totalReturns || 0)} Returns
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet action buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshBalance}
          className="h-9"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadStatement}
          className="h-9"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Statement
        </Button>
        <Sheet open={showAddFunds} onOpenChange={setShowAddFunds}>
          <SheetTrigger asChild>
            <Button size="sm" className="h-9">
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add Funds to Wallet</SheetTitle>
              <SheetDescription>
                Add funds to your wallet to invest in properties
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">Amount (₦)</label>
                <TextField
                  id="fundAmount"
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                  }}
                  placeholder="Enter amount"
                  variant="outlined"
                  size="small"
                />
              </div>
              <div className="pt-4">
                <MuiButton
                  variant="contained"
                  color="primary"
                  onClick={handleAddFunds}
                  fullWidth
                  disabled={addFundsMutation.isPending}
                >
                  {addFundsMutation.isPending ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Add Funds"
                  )}
                </MuiButton>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Sheet open={showWithdraw} onOpenChange={setShowWithdraw}>
          <SheetTrigger asChild>
            <Button variant="secondary" size="sm" className="h-9">
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Withdraw Funds</SheetTitle>
              <SheetDescription>
                Withdraw funds from your wallet to your bank account
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="withdrawAmount" className="text-sm font-medium">Amount (₦)</label>
                <TextField
                  id="withdrawAmount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                  }}
                  placeholder="Enter amount"
                  variant="outlined"
                  size="small"
                />
                <p className="text-sm text-muted-foreground">
                  Available balance: {formatCurrency(wallet.availableBalance || wallet.balance)}
                </p>
              </div>
              <div className="pt-4">
                <MuiButton
                  variant="contained"
                  color="secondary"
                  onClick={handleWithdrawFunds}
                  fullWidth
                  disabled={withdrawFundsMutation.isPending}
                >
                  {withdrawFundsMutation.isPending ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Withdraw Funds"
                  )}
                </MuiButton>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-9"
          onClick={() => setOpenInvestDialog(true)}
        >
          <BusinessIcon className="h-4 w-4 mr-2" />
          Invest Now
        </Button>
      </div>

      {/* Tabs Section - Using ShadCn UI Tabs */}
      <Tabs 
        defaultValue={shadcnTabValue} 
        onValueChange={handleShadcnTabChange}
        className="enhanced-wallet-tabs"
        ref={tabsRef}
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Transactions Tab Content */}
        <TabsContent value="transactions" className="enhanced-transaction-table" ref={transactionsRef}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    View your recent transactions and their status
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <TextField
                    placeholder="Filter transactions..."
                    size="small"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FilterIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                    sx={{ width: { xs: '100%', sm: '200px' } }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex justify-center py-8">
                  <CircularProgress />
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No transactions found
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    {filter ? 'Try changing your filter' : 'Your transaction history will appear here'}
                  </Typography>
                </div>
              ) : (
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow 
                        key={transaction.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {formatDate(transaction.createdAt || transaction.date)}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={transactionTypes[transaction.type as keyof typeof transactionTypes]?.label || transaction.type}
                            color={transactionTypes[transaction.type as keyof typeof transactionTypes]?.color as any || "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{transaction.description || '-'}</TableCell>
                        <TableCell align="right" sx={{ 
                          color: transaction.type === 'deposit' || transaction.type === 'return' || transaction.type === 'referral_bonus' 
                            ? 'success.main' 
                            : transaction.type === 'withdrawal' || transaction.type === 'fee' 
                              ? 'error.main' 
                              : 'text.primary'
                        }}>
                          {transaction.type === 'deposit' || transaction.type === 'return' || transaction.type === 'referral_bonus' ? '+' : ''}
                          {transaction.type === 'withdrawal' || transaction.type === 'fee' ? '-' : ''}
                          ₦{transaction.amount.toLocaleString()}
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            color={getStatusChipColor(transaction.status) as any}
                            size="small"
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
        </TabsContent>
        
        {/* Payment Methods Tab Content */}
        <TabsContent value="payment-methods">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods for deposits and withdrawals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <CreditCard className="h-6 w-6 mr-2 text-primary" />
                      <div>
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-sm text-muted-foreground">
                          VISA •••• 4242
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Default</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 border-dashed flex justify-center items-center py-8">
                  <Button variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add New Payment Method
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab Content */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Settings</CardTitle>
              <CardDescription>
                Configure your wallet preferences and notification settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded">
                  <div>
                    <p className="font-medium">Transaction Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for all wallet transactions
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enabled
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded">
                  <div>
                    <p className="font-medium">Auto Top-up</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically add funds when balance is low
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Disabled
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-muted/50 rounded">
                  <div>
                    <p className="font-medium">Default Currency</p>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred currency for wallet operations
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Nigerian Naira (₦)
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs - Using Material UI for consistency */}
      {/* Add Funds Dialog */}
      <Dialog open={openFundDialog} onClose={() => setOpenFundDialog(false)}>
        <DialogTitle>Add Funds to Wallet</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the amount you want to add to your wallet.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="fundAmount"
            label="Amount (₦)"
            type="number"
            fullWidth
            variant="outlined"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">₦</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setOpenFundDialog(false)}>Cancel</MuiButton>
          <MuiButton 
            onClick={handleAddFunds} 
            variant="contained" 
            color="primary"
            disabled={addFundsMutation.isPending}
          >
            {addFundsMutation.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Add Funds"
            )}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={openWithdrawDialog} onClose={() => setOpenWithdrawDialog(false)}>
        <DialogTitle>Withdraw Funds</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the amount you want to withdraw from your wallet.
            <br />
            Available balance: ₦{wallet.balance.toLocaleString()}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="withdrawAmount"
            label="Amount (₦)"
            type="number"
            fullWidth
            variant="outlined"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">₦</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setOpenWithdrawDialog(false)}>Cancel</MuiButton>
          <MuiButton 
            onClick={handleWithdrawFunds} 
            variant="contained" 
            color="primary"
            disabled={withdrawFundsMutation.isPending}
          >
            {withdrawFundsMutation.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Withdraw"
            )}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)}>
        <DialogTitle>Export Transactions</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select format and filters for your transaction export.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="export-format-label">Export Format</InputLabel>
                <Select
                  labelId="export-format-label"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  label="Export Format"
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
                <Select
                  labelId="transaction-type-label"
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  label="Transaction Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="deposit">Deposits</MenuItem>
                  <MenuItem value="withdrawal">Withdrawals</MenuItem>
                  <MenuItem value="investment">Investments</MenuItem>
                  <MenuItem value="return">Returns</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="startDate"
                label="Start Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                value={dateRange.start || ''}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="endDate"
                label="End Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                value={dateRange.end || ''}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setOpenExportDialog(false)}>Cancel</MuiButton>
          <MuiButton 
            onClick={handleExportTransactions} 
            variant="contained" 
            color="primary"
            disabled={exportTransactionsMutation.isPending}
            startIcon={<FileDownloadIcon />}
          >
            {exportTransactionsMutation.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Export"
            )}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Invest Dialog */}
      <Dialog
        open={openInvestDialog}
        onClose={() => setOpenInvestDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Invest from Wallet</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select a property and enter the amount you want to invest.
            <br />
            Available balance: ₦{wallet.balance.toLocaleString()}
          </DialogContentText>
          
          {propertiesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel id="property-select-label">Select Property</InputLabel>
                <Select
                  labelId="property-select-label"
                  value={selectedProperty ? selectedProperty.id : ''}
                  onChange={(e) => {
                    const propertyId = Number(e.target.value);
                    const selected = properties.find(p => p.id === propertyId) || null;
                    setSelectedProperty(selected);
                    if (selected) {
                      setInvestAmount(selected.minimumInvestment.toString());
                    }
                  }}
                  label="Select Property"
                >
                  <MenuItem value="" disabled>Select a property</MenuItem>
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name} - {property.location} ({property.tier})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedProperty && (
                <Box sx={{ mt: 2 }}>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Box sx={{ width: 100, height: 100, overflow: 'hidden', borderRadius: 1, mr: 2 }}>
                        <img 
                          src={selectedProperty.imageUrl} 
                          alt={selectedProperty.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{selectedProperty.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{selectedProperty.location}</Typography>
                        <Chip 
                          label={selectedProperty.tier.toUpperCase()} 
                          size="small" 
                          color={
                            selectedProperty.tier === 'premium' ? 'primary' :
                            selectedProperty.tier === 'standard' ? 'info' :
                            'default'
                          }
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Target Return:</Typography>
                        <Typography variant="body1">{selectedProperty.targetReturn}%</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Minimum Investment:</Typography>
                        <Typography variant="body1">₦{selectedProperty.minimumInvestment.toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Term:</Typography>
                        <Typography variant="body1">{selectedProperty.term} months</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Available Funding:</Typography>
                        <Typography variant="body1">₦{(selectedProperty.totalFunding - selectedProperty.currentFunding).toLocaleString()}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                  
                  <TextField
                    margin="dense"
                    id="investAmount"
                    label="Investment Amount (₦)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                    }}
                  />
                  
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info">
                      Minimum investment for this property is ₦{selectedProperty.minimumInvestment.toLocaleString()}.
                    </Alert>
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setOpenInvestDialog(false)}>Cancel</MuiButton>
          <MuiButton 
            onClick={handleInvestNow} 
            variant="contained" 
            color="primary"
            disabled={investMutation.isPending || !selectedProperty}
          >
            {investMutation.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Invest Now"
            )}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EnhancedWallet;