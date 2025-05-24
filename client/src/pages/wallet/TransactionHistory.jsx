import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useApiRequest } from '../../hooks/useApiRequest';
import { useToast } from '../../hooks/use-toast';
import { format, parseISO } from 'date-fns';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
  DialogTrigger,
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../components/ui/DesignSystem';

import {
  ArrowPathIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  EyeIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  XCircleIcon,
  CreditCardIcon,
  BanknotesIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const TransactionHistory = () => {
  const { user } = useAuth();
  const api = useApiRequest();
  const { toast } = useToast();
  
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [transactionType, setTransactionType] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  
  // Get user transactions
  const {
    data: transactionsData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['/api/ledger/user-transactions', user?.id, currentPage, limit, transactionType, status, startDate, endDate],
    queryFn: async () => {
      if (!user) return null;
      
      let url = `ledger/user-transactions/${user.id}?page=${currentPage}&limit=${limit}`;
      
      if (transactionType) {
        url += `&transactionType=${transactionType}`;
      }
      
      if (status) {
        url += `&status=${status}`;
      }
      
      if (startDate) {
        url += `&startDate=${startDate}`;
      }
      
      if (endDate) {
        url += `&endDate=${endDate}`;
      }
      
      const response = await api.get(url);
      return response.data.data;
    },
    enabled: !!user
  });
  
  // Get transaction details
  const {
    data: transactionDetails,
    isLoading: isLoadingDetails
  } = useQuery({
    queryKey: ['/api/ledger/transaction', selectedTransactionId],
    queryFn: async () => {
      if (!selectedTransactionId) return null;
      
      const response = await api.get(`ledger/transaction/${selectedTransactionId}`);
      return response.data.data.transaction;
    },
    enabled: !!selectedTransactionId
  });
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  // Handle apply filters
  const handleApplyFilters = () => {
    setCurrentPage(1);
    refetch();
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    setTransactionType('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    refetch();
  };
  
  // Handle view transaction details
  const handleViewDetails = (transactionId) => {
    setSelectedTransactionId(transactionId);
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy HH:mm:ss');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Format amount with direction
  const formatAmount = (amount, direction) => {
    return direction === 'credit' 
      ? `+${parseFloat(amount).toFixed(2)}` 
      : `-${parseFloat(amount).toFixed(2)}`;
  };
  
  // Get transaction type badge
  const getTransactionTypeBadge = (type) => {
    switch (type) {
      case 'deposit':
        return <Badge className="bg-green-100 text-green-800">Deposit</Badge>;
      case 'withdrawal':
        return <Badge className="bg-orange-100 text-orange-800">Withdrawal</Badge>;
      case 'investment':
        return <Badge className="bg-blue-100 text-blue-800">Investment</Badge>;
      case 'roi_distribution':
        return <Badge className="bg-purple-100 text-purple-800">ROI Payment</Badge>;
      case 'fee':
        return <Badge className="bg-gray-100 text-gray-800">Fee</Badge>;
      case 'refund':
        return <Badge className="bg-teal-100 text-teal-800">Refund</Badge>;
      case 'adjustment':
        return <Badge className="bg-yellow-100 text-yellow-800">Adjustment</Badge>;
      case 'transfer':
        return <Badge className="bg-indigo-100 text-indigo-800">Transfer</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
  };
  
  // Get transaction status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      case 'disputed':
        return <Badge className="bg-purple-100 text-purple-800">Disputed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };
  
  // Get transaction icon
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <BanknotesIcon className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <CreditCardIcon className="h-4 w-4 text-orange-600" />;
      case 'investment':
        return <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />;
      case 'roi_distribution':
        return <CurrencyDollarIcon className="h-4 w-4 text-purple-600" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-600" />;
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-gray-600">View and manage all your financial transactions</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px] p-4">
            <h3 className="text-lg font-medium mb-3">Filter Transactions</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="transaction-type">Transaction Type</Label>
                <Select 
                  value={transactionType} 
                  onValueChange={setTransactionType}
                >
                  <SelectTrigger id="transaction-type">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="roi_distribution">ROI Payment</SelectItem>
                    <SelectItem value="fee">Fee</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={status} 
                  onValueChange={setStatus}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="start-date">From Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="end-date">To Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
              
              <div className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="flex items-center gap-1"
                >
                  <XCircleIcon className="h-4 w-4" />
                  Clear
                </Button>
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Transactions</CardTitle>
          <CardDescription>
            Complete history of all your financial activities on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : transactionsData?.transactions?.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsData.transactions.map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.referenceNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.transactionType)}
                            {getTransactionTypeBadge(transaction.transactionType)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-gray-500" />
                            <span>{formatDate(transaction.transactionDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell className={transaction.direction === 'credit' ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                          <div className="flex items-center gap-1">
                            {transaction.direction === 'credit' ? (
                              <ArrowUpIcon className="h-4 w-4" />
                            ) : (
                              <ArrowDownIcon className="h-4 w-4" />
                            )}
                            {formatAmount(transaction.amount, transaction.direction)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {transaction.userDescription || transaction.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(transaction.id)}
                            className="flex items-center gap-1"
                          >
                            <EyeIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {transactionsData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {transactionsData.pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= transactionsData.pagination.totalPages}
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
              <p className="mt-2 text-gray-500">
                {(transactionType || status || startDate || endDate)
                  ? "No transactions match your filter criteria. Try changing your filters."
                  : "You don't have any transactions yet. Try making a deposit or investment."}
              </p>
              {(transactionType || status || startDate || endDate) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Transaction Details Dialog */}
      {selectedTransactionId && (
        <Dialog open={!!selectedTransactionId} onOpenChange={(open) => !open && setSelectedTransactionId(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Complete information about this financial transaction
              </DialogDescription>
            </DialogHeader>
            
            {isLoadingDetails ? (
              <div className="flex justify-center py-12">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : transactionDetails ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Transaction Information</h3>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Reference:</div>
                        <div className="text-sm">{transactionDetails.transaction.referenceNumber}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Type:</div>
                        <div className="text-sm">{getTransactionTypeBadge(transactionDetails.transaction.transactionType)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Amount:</div>
                        <div className="text-sm font-medium">${parseFloat(transactionDetails.transaction.amount).toFixed(2)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Status:</div>
                        <div className="text-sm">{getStatusBadge(transactionDetails.transaction.status)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Timeline Information</h3>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Transaction Date:</div>
                        <div className="text-sm">{formatDate(transactionDetails.transaction.transactionDate)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Created At:</div>
                        <div className="text-sm">{formatDate(transactionDetails.transaction.createdAt)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">Updated At:</div>
                        <div className="text-sm">{formatDate(transactionDetails.transaction.updatedAt)}</div>
                      </div>
                      {transactionDetails.initiator && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Initiated By:</div>
                          <div className="text-sm">{transactionDetails.initiator.name}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                    {transactionDetails.transaction.description || 'No description available'}
                  </div>
                </div>
                
                {transactionDetails.transaction.errorMessage && (
                  <div>
                    <h3 className="text-sm font-medium text-red-500">Error Information</h3>
                    <div className="mt-2 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                      {transactionDetails.transaction.errorMessage}
                    </div>
                  </div>
                )}
                
                {transactionDetails.transaction.metadata && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Additional Information</h3>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(transactionDetails.transaction.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Journal Entries</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Balance After</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactionDetails.entries.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{entry.accountName}</TableCell>
                          <TableCell>{entry.description || '-'}</TableCell>
                          <TableCell className={parseFloat(entry.amount) >= 0 ? 'text-green-600 text-right' : 'text-orange-600 text-right'}>
                            {parseFloat(entry.amount) >= 0 ? '+' : ''}{parseFloat(entry.amount).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">{parseFloat(entry.runningBalance).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedTransactionId(null)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Transaction Not Found</h3>
                <p className="mt-2 text-gray-500">
                  The requested transaction details could not be loaded.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TransactionHistory;