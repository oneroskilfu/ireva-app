import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
  Select,
  Input,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '../../components/ui/DesignSystem';
import { useApiRequest } from '../../hooks/useApiRequest';
import {
  ArrowPathIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  FunnelIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';

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

// Transaction type icon component
const TransactionTypeIcon = ({ type }) => {
  switch (type) {
    case 'deposit':
      return <ArrowUpCircleIcon className="h-5 w-5 text-green-500" />;
    case 'withdrawal':
      return <ArrowDownCircleIcon className="h-5 w-5 text-red-500" />;
    case 'dividend':
      return <BanknotesIcon className="h-5 w-5 text-blue-500" />;
    case 'investment':
      return <BuildingLibraryIcon className="h-5 w-5 text-purple-500" />;
    case 'admin_credit':
      return <ArrowUpCircleIcon className="h-5 w-5 text-indigo-500" />;
    case 'admin_debit':
      return <ArrowDownCircleIcon className="h-5 w-5 text-pink-500" />;
    default:
      return <CreditCardIcon className="h-5 w-5 text-gray-500" />;
  }
};

// Transaction type user-friendly names
const getTransactionTypeName = (type) => {
  const typeNames = {
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    dividend: 'ROI Payment',
    investment: 'Investment',
    admin_credit: 'Admin Credit',
    admin_debit: 'Admin Deduction',
  };
  
  return typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

// Main Wallet Transactions component
const WalletTransactions = () => {
  const api = useApiRequest();
  
  // State for pagination and filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [transactionType, setTransactionType] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Prepare query parameters
  const queryParams = new URLSearchParams({
    page,
    limit,
    sort: sortOrder,
  });
  
  if (transactionType) {
    queryParams.append('type', transactionType);
  }
  
  if (searchTerm) {
    queryParams.append('search', searchTerm);
  }
  
  // Fetch transaction data
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: [`/api/wallet/transactions?${queryParams.toString()}`],
    queryFn: async () => {
      const response = await api.get(`wallet/transactions?${queryParams.toString()}`);
      return response.data.data;
    },
    refetchOnWindowFocus: false,
  });
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [transactionType, sortOrder, searchTerm]);
  
  // Handle clear filters
  const handleClearFilters = () => {
    setTransactionType('');
    setSortOrder('desc');
    setSearchTerm('');
    setPage(1);
  };
  
  // Handle search input
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already applied via the state update and useEffect
  };
  
  return (
    <Card>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h3 className="text-lg font-semibold">Transaction History</h3>
          
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <FunnelIcon className="h-4 w-4 mr-1" />
              Filters
              {(transactionType || sortOrder !== 'desc' || searchTerm) && (
                <span className="ml-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                  {(transactionType ? 1 : 0) + (sortOrder !== 'desc' ? 1 : 0) + (searchTerm ? 1 : 0)}
                </span>
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={refetch}
              title="Refresh"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search and Filter Panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 items-start">
              <div className="w-full md:w-1/3">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    placeholder="Search description or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <XMarkIcon className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </form>
              </div>
              
              <div className="w-full md:w-1/4">
                <Select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full"
                >
                  <option value="">All Transaction Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="dividend">ROI Payments</option>
                  <option value="investment">Investments</option>
                </Select>
              </div>
              
              <div className="w-full md:w-1/4">
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </Select>
              </div>
              
              <div className="w-full md:w-auto">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleClearFilters}
                  disabled={!transactionType && sortOrder === 'desc' && !searchTerm}
                  className="flex items-center"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, index) => (
                  <TableRow key={index}>
                    {Array(6).fill(0).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-red-500">
                    Error loading transactions. Please try again.
                  </TableCell>
                </TableRow>
              ) : !data?.transactions || data.transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No transactions found. {transactionType || searchTerm ? 'Try adjusting your filters.' : ''}
                  </TableCell>
                </TableRow>
              ) : (
                data.transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <TransactionTypeIcon type={transaction.type} />
                        <span className="ml-2">{getTransactionTypeName(transaction.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.description || '-'}
                    </TableCell>
                    <TableCell className={`font-medium ${
                      transaction.type === 'deposit' || transaction.type === 'dividend' || transaction.type === 'admin_credit'
                        ? 'text-green-600' 
                        : transaction.type === 'withdrawal' || transaction.type === 'investment' || transaction.type === 'admin_debit'
                        ? 'text-red-500'
                        : ''
                    }`}>
                      {transaction.type === 'deposit' || transaction.type === 'dividend' || transaction.type === 'admin_credit' ? '+' : ''}
                      {transaction.type === 'withdrawal' || transaction.type === 'investment' || transaction.type === 'admin_debit' ? '-' : ''}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <TransactionStatusBadge status={transaction.status} />
                    </TableCell>
                    <TableCell className="truncate max-w-[150px]">
                      {transaction.reference || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, data.pagination.totalItems)} of {data.pagination.totalItems} transactions
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNumber;
                  if (data.pagination.totalPages <= 5) {
                    // If 5 or fewer pages, show all
                    pageNumber = i + 1;
                  } else if (page <= 3) {
                    // If near the start
                    pageNumber = i + 1;
                  } else if (page >= data.pagination.totalPages - 2) {
                    // If near the end
                    pageNumber = data.pagination.totalPages - 4 + i;
                  } else {
                    // Show current page in the middle
                    pageNumber = page - 2 + i;
                  }
                  
                  // Don't render if out of range
                  if (pageNumber < 1 || pageNumber > data.pagination.totalPages) {
                    return null;
                  }
                  
                  return (
                    <PaginationItem key={pageNumber}>
                      <Button
                        variant={page === pageNumber ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Rows per page:</span>
              <Select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-16"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </Select>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WalletTransactions;