import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ChevronDown,
  Filter,
  Search,
  Download,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface Transaction {
  id: number;
  type: 'deposit' | 'withdrawal' | 'investment' | 'return';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
  reference: string;
  updatedAt?: string;
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const TransactionHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch transaction history
  const {
    data: transactions,
    isLoading,
    isError,
  } = useQuery<Transaction[]>({
    queryKey: ['/api/wallet/history', typeFilter, statusFilter, dateRange, currentPage, itemsPerPage],
  });

  // Get transaction type details (icon, color, label)
  const getTransactionTypeDetails = (type: string) => {
    switch (type) {
      case 'deposit':
        return {
          icon: <ArrowDownCircle className="h-4 w-4" />,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          label: 'Deposit',
        };
      case 'withdrawal':
        return {
          icon: <ArrowUpCircle className="h-4 w-4" />,
          color: 'text-orange-500',
          bgColor: 'bg-orange-100',
          label: 'Withdrawal',
        };
      case 'investment':
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          label: 'Investment',
        };
      case 'return':
        return {
          icon: <CreditCard className="h-4 w-4" />,
          color: 'text-purple-500',
          bgColor: 'bg-purple-100',
          label: 'Return',
        };
      default:
        return {
          icon: <CreditCard className="h-4 w-4" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: 'Unknown',
        };
    }
  };

  // Get transaction status details (icon, color)
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          label: 'Completed',
        };
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4" />,
          color: 'text-amber-500',
          bgColor: 'bg-amber-100',
          label: 'Pending',
        };
      case 'failed':
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          label: 'Failed',
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: 'Unknown',
        };
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  // Filter transactions based on search term and filters
  const filteredTransactions = transactions
    ? transactions.filter((transaction) => {
        const matchesSearch =
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;

        // Date range filtering logic
        let matchesDateRange = true;
        if (dateRange !== 'all') {
          const today = new Date();
          const txDate = new Date(transaction.createdAt);
          
          switch(dateRange) {
            case 'today':
              matchesDateRange = txDate.toDateString() === today.toDateString();
              break;
            case 'week':
              const weekAgo = new Date(today);
              weekAgo.setDate(today.getDate() - 7);
              matchesDateRange = txDate >= weekAgo;
              break;
            case 'month':
              const monthAgo = new Date(today);
              monthAgo.setMonth(today.getMonth() - 1);
              matchesDateRange = txDate >= monthAgo;
              break;
            case 'year':
              const yearAgo = new Date(today);
              yearAgo.setFullYear(today.getFullYear() - 1);
              matchesDateRange = txDate >= yearAgo;
              break;
          }
        }

        return matchesSearch && matchesType && matchesStatus && matchesDateRange;
      })
    : [];

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Pagination component
  const renderPagination = () => {
    const pages = [];
    
    // Always show first page
    pages.push(
      <PaginationItem key="first">
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (currentPage > 3) {
      pages.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last as they're always shown
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      pages.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(
        <PaginationItem key="last">
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <PaginationContent>
        <PaginationPrevious 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        />
        {pages}
        <PaginationNext 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages || totalPages === 0}
        />
      </PaginationContent>
    );
  };

  // Handle download CSV
  const handleDownloadCSV = () => {
    // This would typically call an API endpoint to generate a CSV
    console.log('Downloading transactions as CSV');
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View and filter your transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View and filter your transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load transactions</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading your transaction history. Please try again.
            </p>
            <Button>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View and filter your transaction history</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="investment">Investments</SelectItem>
                <SelectItem value="return">Returns</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {currentTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No transactions found</h3>
            <p className="text-muted-foreground">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || dateRange !== 'all'
                ? 'Try adjusting your filters or search term'
                : 'Your transaction history is empty'}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Description / Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTransactions.map((transaction) => {
                    const typeDetails = getTransactionTypeDetails(transaction.type);
                    const statusDetails = getStatusDetails(transaction.status);
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              Ref: {transaction.reference}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${typeDetails.bgColor} ${typeDetails.color}`}
                          >
                            <span className="flex items-center gap-1">
                              {typeDetails.icon}
                              {typeDetails.label}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${statusDetails.bgColor} ${statusDetails.color}`}
                          >
                            <span className="flex items-center gap-1">
                              {statusDetails.icon}
                              {statusDetails.label}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={transaction.type === 'deposit' || transaction.type === 'return' ? 'text-green-600' : ''}>
                            {(transaction.type === 'deposit' || transaction.type === 'return') && '+'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  {renderPagination()}
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;