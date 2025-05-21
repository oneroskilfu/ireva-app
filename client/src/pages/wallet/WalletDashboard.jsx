import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Select,
  Label,
  Badge,
  Separator,
  Alert,
  AlertTitle,
  AlertDescription,
} from '../../components/ui/DesignSystem';
import { useApiRequest } from '../../hooks/useApiRequest';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import {
  WalletIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import WalletTransactions from './WalletTransactions';

// Format currency utility
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount));
};

// Format date utility
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Transaction status badge component
const TransactionStatusBadge = ({ status }) => {
  const variant = 
    status === 'completed' ? 'success' :
    status === 'pending' ? 'warning' :
    status === 'failed' ? 'destructive' :
    'secondary';
  
  return (
    <Badge variant={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Transaction type badge component
const TransactionTypeBadge = ({ type }) => {
  let variant, icon;
  
  switch (type) {
    case 'deposit':
      variant = 'success';
      icon = <ArrowUpCircleIcon className="w-3 h-3 mr-1" />;
      break;
    case 'withdrawal':
      variant = 'destructive';
      icon = <ArrowDownCircleIcon className="w-3 h-3 mr-1" />;
      break;
    case 'dividend':
      variant = 'info';
      icon = <BanknotesIcon className="w-3 h-3 mr-1" />;
      break;
    case 'investment':
      variant = 'primary';
      icon = <BuildingLibraryIcon className="w-3 h-3 mr-1" />;
      break;
    default:
      variant = 'secondary';
      icon = <DocumentTextIcon className="w-3 h-3 mr-1" />;
  }
  
  return (
    <Badge variant={variant} className="flex items-center">
      {icon}
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  );
};

// Main wallet dashboard component
const WalletDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const api = useApiRequest();
  const { toast } = useToast();
  
  // State for tabs and modals
  const [activeTab, setActiveTab] = useState('overview');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [accountDetails, setAccountDetails] = useState('');
  const [depositMethod, setDepositMethod] = useState('creditCard');
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  
  // Fetch wallet data
  const { 
    data: walletData, 
    isLoading: isLoadingWallet, 
    error: walletError,
    refetch: refetchWallet
  } = useQuery({
    queryKey: ['/api/wallet'],
    queryFn: async () => {
      const response = await api.get('wallet');
      return response.data.data.wallet;
    },
    refetchOnWindowFocus: false,
  });
  
  // Fetch wallet summary with investments
  const { 
    data: walletSummary, 
    isLoading: isLoadingSummary,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ['/api/wallet/summary'],
    queryFn: async () => {
      const response = await api.get('wallet/summary');
      return response.data.data.summary;
    },
    refetchOnWindowFocus: false,
  });
  
  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('wallet/deposit', data);
      return response.data;
    },
    onSuccess: () => {
      // Close dialog and reset form
      setIsDepositDialogOpen(false);
      setDepositAmount('');
      setDepositMethod('creditCard');
      
      // Refetch wallet data
      queryClient.invalidateQuery(['/api/wallet']);
      queryClient.invalidateQuery(['/api/wallet/summary']);
      queryClient.invalidateQuery(['/api/wallet/transactions']);
      
      // Show success toast
      toast({
        title: 'Deposit successful',
        description: 'Funds have been added to your wallet.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Deposit failed',
        description: error.response?.data?.message || 'An error occurred while processing your deposit.',
        variant: 'destructive',
      });
    },
  });
  
  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('wallet/withdraw', data);
      return response.data;
    },
    onSuccess: () => {
      // Close dialog and reset form
      setIsWithdrawDialogOpen(false);
      setWithdrawAmount('');
      setWithdrawMethod('bank');
      setAccountDetails('');
      
      // Refetch wallet data
      queryClient.invalidateQuery(['/api/wallet']);
      queryClient.invalidateQuery(['/api/wallet/summary']);
      queryClient.invalidateQuery(['/api/wallet/transactions']);
      
      // Show success toast
      toast({
        title: 'Withdrawal request submitted',
        description: 'Your withdrawal request has been submitted and is being processed.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Withdrawal failed',
        description: error.response?.data?.message || 'An error occurred while processing your withdrawal.',
        variant: 'destructive',
      });
    },
  });
  
  // Handle deposit submission
  const handleDepositSubmit = (e) => {
    e.preventDefault();
    
    // Validate amount
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid deposit amount.',
        variant: 'destructive',
      });
      return;
    }
    
    // Submit deposit
    depositMutation.mutate({
      amount: parseFloat(depositAmount),
      paymentMethod: depositMethod,
      reference: `deposit-${Date.now()}`,
    });
  };
  
  // Handle withdrawal submission
  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    
    // Validate amount
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid withdrawal amount.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate account details
    if (!accountDetails) {
      toast({
        title: 'Missing details',
        description: 'Please enter the required account details.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate available balance
    if (walletData && parseFloat(withdrawAmount) > Number(walletData.balance)) {
      toast({
        title: 'Insufficient funds',
        description: 'You do not have enough funds in your wallet for this withdrawal.',
        variant: 'destructive',
      });
      return;
    }
    
    // Submit withdrawal
    withdrawMutation.mutate({
      amount: parseFloat(withdrawAmount),
      withdrawalMethod: withdrawMethod,
      accountDetails,
    });
  };
  
  // Refresh wallet data
  const refreshWalletData = () => {
    refetchWallet();
    refetchSummary();
    queryClient.invalidateQuery(['/api/wallet/transactions']);
    
    toast({
      title: 'Refreshed',
      description: 'Wallet data has been updated.',
    });
  };
  
  // Error state
  if (walletError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <XCircleIcon className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Wallet</h2>
            <p className="text-gray-500 mb-4">
              {walletError.response?.data?.message || 'There was an error loading your wallet information.'}
            </p>
            <Button onClick={refreshWalletData}>
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <WalletIcon className="h-7 w-7 mr-2" />
            My Wallet
          </h1>
          <p className="text-gray-500">
            Manage your funds, deposits, and withdrawals
          </p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshWalletData}
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          
          <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <ArrowUpCircleIcon className="h-4 w-4 mr-1" />
                Deposit
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Deposit Funds</DialogTitle>
                <DialogDescription>
                  Add funds to your iREVA wallet to start investing in properties.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleDepositSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount
                    </Label>
                    <div className="col-span-3 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-8"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="depositMethod" className="text-right">
                      Payment Method
                    </Label>
                    <Select
                      id="depositMethod"
                      value={depositMethod}
                      onChange={(e) => setDepositMethod(e.target.value)}
                      className="col-span-3"
                    >
                      <option value="creditCard">Credit Card</option>
                      <option value="bankTransfer">Bank Transfer</option>
                      <option value="paypal">PayPal</option>
                      <option value="crypto">Cryptocurrency</option>
                    </Select>
                  </div>
                </div>
                
                <Alert className="mb-4">
                  <AlertTitle className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Secure Transaction
                  </AlertTitle>
                  <AlertDescription>
                    All deposits are processed securely. Funds will be available immediately after successful payment.
                  </AlertDescription>
                </Alert>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDepositDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={depositMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {depositMutation.isPending ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowUpCircleIcon className="h-4 w-4 mr-2" />
                        Deposit Funds
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="border-orange-400 text-orange-600 hover:bg-orange-50">
                <ArrowDownCircleIcon className="h-4 w-4 mr-1" />
                Withdraw
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>
                  Withdraw funds from your iREVA wallet to your preferred account.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleWithdrawSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="withdraw-amount" className="text-right">
                      Amount
                    </Label>
                    <div className="col-span-3 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-8"
                        step="0.01"
                        min="0"
                        max={walletData?.balance || 0}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="withdraw-method" className="text-right">
                      Method
                    </Label>
                    <Select
                      id="withdraw-method"
                      value={withdrawMethod}
                      onChange={(e) => setWithdrawMethod(e.target.value)}
                      className="col-span-3"
                    >
                      <option value="bank">Bank Account</option>
                      <option value="paypal">PayPal</option>
                      <option value="check">Check by Mail</option>
                      <option value="crypto">Cryptocurrency</option>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="account-details" className="text-right">
                      Account Details
                    </Label>
                    <Input
                      id="account-details"
                      value={accountDetails}
                      onChange={(e) => setAccountDetails(e.target.value)}
                      placeholder={withdrawMethod === 'bank' ? "Account number / Routing number" : 
                                   withdrawMethod === 'paypal' ? "PayPal email" :
                                   withdrawMethod === 'check' ? "Mailing address" :
                                   "Wallet address"}
                      className="col-span-3"
                      required
                    />
                  </div>
                </div>
                
                <Alert className="mb-4">
                  <AlertTitle className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Processing Time
                  </AlertTitle>
                  <AlertDescription>
                    Withdrawals typically take 1-3 business days to process, depending on your selected method.
                  </AlertDescription>
                </Alert>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsWithdrawDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={withdrawMutation.isPending || !walletData || Number(walletData.balance) <= 0}
                    className="border-orange-400 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {withdrawMutation.isPending ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowDownCircleIcon className="h-4 w-4 mr-2" />
                        Withdraw Funds
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Wallet Balance Card */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Available Balance</h2>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">
                  {isLoadingWallet ? (
                    <div className="h-10 w-40 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    formatCurrency(walletData?.balance || 0, walletData?.currency || 'USD')
                  )}
                </span>
                <span className="text-gray-500 ml-2">
                  {walletData?.currency || 'USD'}
                </span>
              </div>
              {walletData && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {formatDate(walletData.lastUpdated)}
                </p>
              )}
            </div>
            
            {isLoadingSummary ? (
              <div className="mt-4 lg:mt-0 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : walletSummary && (
              <div className="mt-4 lg:mt-0 grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-gray-500">Total Investments</p>
                  <p className="font-semibold">
                    {walletSummary.totalInvestments || 0} Properties
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Capital Invested</p>
                  <p className="font-semibold">
                    {formatCurrency(walletSummary.totalInvested || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total ROI Earned</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(walletSummary.roiTotal || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lifetime Deposits</p>
                  <p className="font-semibold">
                    {formatCurrency(walletSummary.depositTotal || 0)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="investments">Investment Breakdown</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Recent Transactions */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <Button variant="link" onClick={() => setActiveTab('transactions')}>
                  View All
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              {isLoadingSummary ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center animate-pulse">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                        <div>
                          <div className="h-4 w-40 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 w-24 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="h-5 w-20 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : walletSummary?.recentTransactions?.length > 0 ? (
                <div className="space-y-4">
                  {walletSummary.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          {transaction.type === 'deposit' && <ArrowUpCircleIcon className="h-6 w-6 text-green-500" />}
                          {transaction.type === 'withdrawal' && <ArrowDownCircleIcon className="h-6 w-6 text-red-500" />}
                          {transaction.type === 'dividend' && <BanknotesIcon className="h-6 w-6 text-blue-500" />}
                          {transaction.type === 'investment' && <BuildingLibraryIcon className="h-6 w-6 text-purple-500" />}
                          {!['deposit', 'withdrawal', 'dividend', 'investment'].includes(transaction.type) && 
                            <CreditCardIcon className="h-6 w-6 text-gray-500" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description || transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</p>
                          <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`font-semibold ${
                          transaction.type === 'deposit' || transaction.type === 'dividend' 
                            ? 'text-green-600' 
                            : transaction.type === 'withdrawal' || transaction.type === 'investment'
                            ? 'text-red-500'
                            : ''
                        }`}>
                          {(transaction.type === 'deposit' || transaction.type === 'dividend') && '+'}
                          {(transaction.type === 'withdrawal' || transaction.type === 'investment') && '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                        <TransactionStatusBadge status={transaction.status} className="ml-3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No transactions yet</p>
                  <p className="text-sm text-gray-400">
                    Deposit funds to start investing in properties
                  </p>
                </div>
              )}
            </div>
          </Card>
          
          {/* Additional Overview Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start" onClick={() => setIsDepositDialogOpen(true)}>
                    <ArrowUpCircleIcon className="h-5 w-5 mr-2" />
                    Deposit Funds
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setIsWithdrawDialogOpen(true)}
                    disabled={!walletData || Number(walletData.balance) <= 0}
                  >
                    <ArrowDownCircleIcon className="h-5 w-5 mr-2" />
                    Withdraw Funds
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/properties'}
                  >
                    <BuildingLibraryIcon className="h-5 w-5 mr-2" />
                    Browse Properties
                  </Button>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Wallet Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Account Holder</p>
                    <p className="font-medium">{user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account ID</p>
                    <p className="font-medium">W-{walletData?.id?.toString().padStart(6, '0') || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Currency</p>
                    <p className="font-medium">{walletData?.currency || 'USD'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={walletData?.isActive ? 'success' : 'destructive'}>
                      {walletData?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions">
          <WalletTransactions />
        </TabsContent>
        
        <TabsContent value="investments">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Investment Portfolio</h3>
            
            {/* This would typically fetch and display a breakdown of investments */}
            <p className="text-gray-500">
              This section will display a detailed breakdown of your property investments, showing allocation, performance, and historical ROI.
            </p>
            
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.href = '/investments'}
            >
              View My Investments
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletDashboard;