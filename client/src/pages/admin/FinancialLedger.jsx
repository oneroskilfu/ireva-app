import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../hooks/useApiRequest';
import { useToast } from '../../hooks/use-toast';
import { format, parseISO, subMonths } from 'date-fns';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
  Label,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Textarea,
  Alert,
  AlertTitle,
  AlertDescription,
} from '../../components/ui/DesignSystem';

import {
  ArrowPathIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  XCircleIcon,
  CreditCardIcon,
  BanknotesIcon,
  BriefcaseIcon,
  BuildingLibraryIcon,
  CalculatorIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const FinancialLedger = () => {
  const api = useApiRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState('accounts');
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [expectedBalance, setExpectedBalance] = useState('');
  const [reconciliationNotes, setReconciliationNotes] = useState('');
  const [showReconcileDialog, setShowReconcileDialog] = useState(false);
  const [statementType, setStatementType] = useState('balance');
  const [statementDate, setStatementDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [statementStartDate, setStatementStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [statementEndDate, setStatementEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Get all accounts
  const { 
    data: accountsData,
    isLoading: isLoadingAccounts,
    refetch: refetchAccounts
  } = useQuery({
    queryKey: ['/api/ledger/accounts'],
    queryFn: async () => {
      const response = await api.get('ledger/accounts?includeBalances=true');
      return response.data.data.accounts;
    }
  });
  
  // Get financial statement
  const {
    data: statementData,
    isLoading: isLoadingStatement,
    refetch: refetchStatement
  } = useQuery({
    queryKey: ['/api/ledger/financial-statement', statementType, statementDate, statementStartDate, statementEndDate],
    queryFn: async () => {
      let url = `ledger/financial-statement/${statementType}?`;
      
      if (statementType === 'balance') {
        url += `asOfDate=${statementDate}`;
      } else {
        url += `startDate=${statementStartDate}&endDate=${statementEndDate}`;
      }
      
      const response = await api.get(url);
      return response.data.data.statement;
    }
  });
  
  // Reconcile account mutation
  const reconcileAccountMutation = useMutation({
    mutationFn: async ({ accountId, expectedBalance, notes }) => {
      const response = await api.post(`ledger/reconcile/${accountId}`, {
        expectedBalance,
        notes
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQuery(['/api/ledger/accounts']);
      
      setShowReconcileDialog(false);
      setExpectedBalance('');
      setReconciliationNotes('');
      
      toast({
        title: data.status === 'matched' ? 'Account Balanced' : 'Discrepancy Detected',
        description: data.status === 'matched' 
          ? 'Account successfully reconciled with no discrepancies.'
          : `Reconciliation completed with a discrepancy of ${data.discrepancy.toFixed(2)}`,
        variant: data.status === 'matched' ? 'success' : 'destructive',
      });
    },
    onError: (error) => {
      toast({
        title: 'Reconciliation Failed',
        description: error.response?.data?.message || 'Failed to reconcile account',
        variant: 'destructive',
      });
    }
  });
  
  // Initialize ledger system mutation
  const initializeLedgerMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('ledger/initialize');
      return response.data.data;
    },
    onSuccess: (data) => {
      refetchAccounts();
      
      toast({
        title: 'Ledger System Initialized',
        description: data.message,
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Initialization Failed',
        description: error.response?.data?.message || 'Failed to initialize ledger system',
        variant: 'destructive',
      });
    }
  });
  
  // Handle reconcile account
  const handleReconcileAccount = (accountId) => {
    setSelectedAccountId(accountId);
    
    // Find the current account to pre-fill the expected balance
    const account = accountsData.find(a => a.id === accountId);
    if (account) {
      setExpectedBalance(account.currentBalance.toString());
    }
    
    setShowReconcileDialog(true);
  };
  
  // Handle confirm reconciliation
  const handleConfirmReconciliation = () => {
    if (!expectedBalance.trim() || isNaN(parseFloat(expectedBalance))) {
      toast({
        title: 'Invalid Balance',
        description: 'Please enter a valid expected balance',
        variant: 'destructive',
      });
      return;
    }
    
    reconcileAccountMutation.mutate({
      accountId: selectedAccountId,
      expectedBalance: parseFloat(expectedBalance),
      notes: reconciliationNotes
    });
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Get account type badge
  const getAccountTypeBadge = (type) => {
    switch (type) {
      case 'user_wallet':
        return <Badge className="bg-blue-100 text-blue-800">User Wallet</Badge>;
      case 'platform_revenue':
        return <Badge className="bg-green-100 text-green-800">Platform Revenue</Badge>;
      case 'property_funding':
        return <Badge className="bg-purple-100 text-purple-800">Property Funding</Badge>;
      case 'escrow':
        return <Badge className="bg-yellow-100 text-yellow-800">Escrow</Badge>;
      case 'fee_collection':
        return <Badge className="bg-indigo-100 text-indigo-800">Fee Collection</Badge>;
      case 'investment_pool':
        return <Badge className="bg-teal-100 text-teal-800">Investment Pool</Badge>;
      case 'roi_reserve':
        return <Badge className="bg-orange-100 text-orange-800">ROI Reserve</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
  };
  
  // Get account icon
  const getAccountIcon = (type) => {
    switch (type) {
      case 'user_wallet':
        return <CreditCardIcon className="h-4 w-4 text-blue-600" />;
      case 'platform_revenue':
        return <BriefcaseIcon className="h-4 w-4 text-green-600" />;
      case 'property_funding':
        return <BuildingLibraryIcon className="h-4 w-4 text-purple-600" />;
      case 'escrow':
        return <BanknotesIcon className="h-4 w-4 text-yellow-600" />;
      case 'fee_collection':
        return <CalculatorIcon className="h-4 w-4 text-indigo-600" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-600" />;
    }
  };
  
  // Helper to group accounts by type
  const groupAccountsByType = (accounts) => {
    if (!accounts) return {};
    
    return accounts.reduce((acc, account) => {
      const type = account.accountType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(account);
      return acc;
    }, {});
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Financial Ledger</h1>
          <p className="text-gray-600">Manage and monitor the platform's financial system</p>
        </div>
        <Button 
          onClick={() => initializeLedgerMutation.mutate()}
          disabled={initializeLedgerMutation.isPending}
          className="flex items-center gap-2"
        >
          {initializeLedgerMutation.isPending ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
          ) : (
            <ScaleIcon className="h-4 w-4" />
          )}
          Initialize Ledger System
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <BuildingLibraryIcon className="h-4 w-4" />
            Account Management
          </TabsTrigger>
          <TabsTrigger value="statements" className="flex items-center gap-2">
            <DocumentTextIcon className="h-4 w-4" />
            Financial Statements
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Chart of Accounts</CardTitle>
              <CardDescription>
                Monitor and reconcile all financial accounts in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAccounts ? (
                <div className="flex justify-center py-12">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : accountsData && accountsData.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Account Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Credits</TableHead>
                        <TableHead className="text-right">Debits</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accountsData.map(account => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getAccountIcon(account.accountType)}
                              {getAccountTypeBadge(account.accountType)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{account.name}</span>
                              {account.userId && <span className="text-xs text-gray-500">User ID: {account.userId}</span>}
                              {account.propertyId && <span className="text-xs text-gray-500">Property ID: {account.propertyId}</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {parseFloat(account.totalCredits).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-orange-600">
                            {parseFloat(account.totalDebits).toFixed(2)}
                          </TableCell>
                          <TableCell className={
                            `text-right font-medium ${parseFloat(account.currentBalance) >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'}`
                          }>
                            {parseFloat(account.currentBalance).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {account.isActive ? (
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReconcileAccount(account.id)}
                              className="flex items-center gap-1"
                            >
                              <CalculatorIcon className="h-4 w-4" />
                              <span className="hidden sm:inline">Reconcile</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BuildingLibraryIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No accounts found</h3>
                  <p className="mt-2 text-gray-500">
                    The ledger system may not be initialized yet.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => initializeLedgerMutation.mutate()}
                    disabled={initializeLedgerMutation.isPending}
                  >
                    {initializeLedgerMutation.isPending ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      'Initialize Ledger System'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statements">
          <Card>
            <CardHeader>
              <CardTitle>Financial Statements</CardTitle>
              <CardDescription>
                Generate and view financial reports for the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label htmlFor="statement-type">Statement Type</Label>
                  <Select 
                    value={statementType} 
                    onValueChange={setStatementType}
                  >
                    <SelectTrigger id="statement-type">
                      <SelectValue placeholder="Select statement type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balance">Balance Sheet</SelectItem>
                      <SelectItem value="income">Income Statement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {statementType === 'balance' ? (
                  <div>
                    <Label htmlFor="statement-date">As of Date</Label>
                    <Input
                      id="statement-date"
                      type="date"
                      value={statementDate}
                      onChange={e => setStatementDate(e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="statement-start-date">Start Date</Label>
                      <Input
                        id="statement-start-date"
                        type="date"
                        value={statementStartDate}
                        onChange={e => setStatementStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="statement-end-date">End Date</Label>
                      <Input
                        id="statement-end-date"
                        type="date"
                        value={statementEndDate}
                        onChange={e => setStatementEndDate(e.target.value)}
                      />
                    </div>
                  </>
                )}
                
                <div className="flex items-end">
                  <Button 
                    onClick={() => refetchStatement()}
                    className="flex items-center gap-2"
                  >
                    <DocumentTextIcon className="h-4 w-4" />
                    Generate Statement
                  </Button>
                </div>
              </div>
              
              {isLoadingStatement ? (
                <div className="flex justify-center py-12">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : statementData ? (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">
                      {statementType === 'balance' ? 'Balance Sheet' : 'Income Statement'}
                    </h2>
                    <p className="text-gray-600">
                      {statementType === 'balance' 
                        ? `As of ${formatDate(statementData.asOfDate)}`
                        : `${formatDate(statementData.startDate)} - ${formatDate(statementData.endDate)}`
                      }
                    </p>
                  </div>
                  
                  {statementType === 'balance' ? (
                    <>
                      {/* Balance Sheet */}
                      <div className="space-y-8">
                        {/* Assets */}
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Assets</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Account Type</TableHead>
                                <TableHead>Account Name</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {['user_wallet', 'property_funding', 'escrow'].flatMap(type => 
                                statementData.accounts[type]?.map(account => (
                                  <TableRow key={account.id}>
                                    <TableCell>{getAccountTypeBadge(account.accountType)}</TableCell>
                                    <TableCell>{account.name}</TableCell>
                                    <TableCell className="text-right">
                                      ${parseFloat(account.currentBalance).toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                )) || []
                              )}
                              <TableRow>
                                <TableCell colSpan={2} className="font-bold">Total Assets</TableCell>
                                <TableCell className="text-right font-bold">
                                  ${parseFloat(statementData.summary.assets).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                        
                        {/* Liabilities */}
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Liabilities</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Account Type</TableHead>
                                <TableHead>Account Name</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {['platform_revenue', 'fee_collection', 'roi_reserve'].flatMap(type => 
                                statementData.accounts[type]?.map(account => (
                                  <TableRow key={account.id}>
                                    <TableCell>{getAccountTypeBadge(account.accountType)}</TableCell>
                                    <TableCell>{account.name}</TableCell>
                                    <TableCell className="text-right">
                                      ${parseFloat(account.currentBalance).toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                )) || []
                              )}
                              <TableRow>
                                <TableCell colSpan={2} className="font-bold">Total Liabilities</TableCell>
                                <TableCell className="text-right font-bold">
                                  ${parseFloat(statementData.summary.liabilities).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                        
                        {/* Equity */}
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Equity</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-bold">Total Equity</TableCell>
                                <TableCell className="text-right font-bold">
                                  ${parseFloat(statementData.summary.equity).toFixed(2)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-bold">Liabilities + Equity</TableCell>
                                <TableCell className="text-right font-bold">
                                  ${parseFloat(statementData.summary.liabilities + statementData.summary.equity).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Income Statement */}
                      <div className="space-y-8">
                        {/* Revenue */}
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Revenue</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell>Platform Fees</TableCell>
                                <TableCell className="text-right">
                                  ${parseFloat(statementData.summary.totalRevenue).toFixed(2)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-bold">Total Revenue</TableCell>
                                <TableCell className="text-right font-bold">
                                  ${parseFloat(statementData.summary.totalRevenue).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                        
                        {/* Transaction Summary */}
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Transaction Summary</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Transaction Type</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                                <TableHead className="text-right">Count</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(statementData.totalsByType || {}).map(([type, total]) => (
                                <TableRow key={type}>
                                  <TableCell>{getAccountTypeBadge(type)}</TableCell>
                                  <TableCell className="text-right">
                                    ${parseFloat(total).toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {statementData.transactions[type]?.length || 0}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        
                        {/* Net Income */}
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Net Income</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-bold">Total Revenue</TableCell>
                                <TableCell className="text-right font-bold">
                                  ${parseFloat(statementData.summary.totalRevenue).toFixed(2)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-bold">Net Income</TableCell>
                                <TableCell className="text-right font-bold">
                                  ${parseFloat(statementData.summary.netIncome).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Statement Generated</h3>
                  <p className="mt-2 text-gray-500">
                    Select statement parameters and click 'Generate Statement'
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Reconciliation Dialog */}
      <Dialog open={showReconcileDialog} onOpenChange={setShowReconcileDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reconcile Account</DialogTitle>
            <DialogDescription>
              Compare the expected balance with the system's balance to verify financial accuracy
            </DialogDescription>
          </DialogHeader>
          
          {accountsData && selectedAccountId && (
            <div className="py-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Account Information</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p><span className="font-medium">Account:</span> {accountsData.find(a => a.id === selectedAccountId)?.name}</p>
                  <p><span className="font-medium">Type:</span> {accountsData.find(a => a.id === selectedAccountId)?.accountType}</p>
                  <p><span className="font-medium">Current Balance:</span> ${parseFloat(accountsData.find(a => a.id === selectedAccountId)?.currentBalance || 0).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="expected-balance" className="mb-1 block">
                    Expected Balance <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <Input
                      id="expected-balance"
                      type="number"
                      step="0.01"
                      className="pl-7"
                      value={expectedBalance}
                      onChange={(e) => setExpectedBalance(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the balance you expect this account to have based on external records
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="reconciliation-notes" className="mb-1 block">
                    Notes
                  </Label>
                  <Textarea
                    id="reconciliation-notes"
                    value={reconciliationNotes}
                    onChange={(e) => setReconciliationNotes(e.target.value)}
                    placeholder="Additional notes about this reconciliation"
                    className="resize-none"
                    rows={3}
                  />
                </div>
                
                <Alert>
                  <QuestionMarkCircleIcon className="h-4 w-4" />
                  <AlertTitle>What is reconciliation?</AlertTitle>
                  <AlertDescription>
                    Reconciliation verifies that the system's financial records match external records.
                    Any discrepancies will be logged for investigation.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowReconcileDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmReconciliation}
              disabled={reconcileAccountMutation.isPending}
            >
              {reconcileAccountMutation.isPending ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Reconcile Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialLedger;