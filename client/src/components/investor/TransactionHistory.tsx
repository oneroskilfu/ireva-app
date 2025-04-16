import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  CreditCard,
  Download,
  Filter,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  description: string;
  reference: string;
  metadata: any;
  status: string;
  propertyId?: number;
  investmentId?: number;
  walletId?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  createdAt: string;
}

interface FilterOptions {
  type: string;
  period: string;
  startDate: string;
  endDate: string;
}

// Helper to format currency in Naira
const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Transaction type badge color
const getTransactionTypeColor = (type: string): string => {
  const typeColors: Record<string, string> = {
    deposit: 'bg-green-100 text-green-800',
    withdrawal: 'bg-red-100 text-red-800',
    investment: 'bg-blue-100 text-blue-800',
    divestment: 'bg-orange-100 text-orange-800',
    return: 'bg-purple-100 text-purple-800',
    fee: 'bg-gray-100 text-gray-800',
    transfer: 'bg-indigo-100 text-indigo-800',
    referral_bonus: 'bg-pink-100 text-pink-800',
  };
  
  return typeColors[type] || 'bg-gray-100 text-gray-800';
};

// Transaction type icon
const getTransactionTypeIcon = (type: string) => {
  switch (type) {
    case 'deposit':
      return <ArrowDown className="h-4 w-4 text-green-500" />;
    case 'withdrawal':
      return <ArrowUp className="h-4 w-4 text-red-500" />;
    case 'investment':
      return <CreditCard className="h-4 w-4 text-blue-500" />;
    case 'return':
      return <ArrowDown className="h-4 w-4 text-purple-500" />;
    default:
      return <Wallet className="h-4 w-4 text-gray-500" />;
  }
};

const TransactionHistory: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterOptions>({
    type: 'all',
    period: 'all',
    startDate: '',
    endDate: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch transaction data
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['/api/transactions/me'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filter.type !== 'all') queryParams.append('type', filter.type);
      if (filter.startDate) queryParams.append('startDate', filter.startDate);
      if (filter.endDate) queryParams.append('endDate', filter.endDate);
      if (searchQuery) queryParams.append('search', searchQuery);
      
      const endpoint = `/api/transactions/me${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await apiRequest('GET', endpoint);
      return await res.json();
    },
    enabled: !!user?.id,
  });

  // Update filter
  const updateFilter = (key: keyof FilterOptions, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  // Handle period filter changes
  const handlePeriodChange = (period: string) => {
    const today = new Date();
    let startDate = '';
    const endDate = format(today, 'yyyy-MM-dd');

    switch (period) {
      case 'this-week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        startDate = format(weekStart, 'yyyy-MM-dd');
        break;
      case 'this-month':
        startDate = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd');
        break;
      case 'last-3-months':
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        startDate = format(threeMonthsAgo, 'yyyy-MM-dd');
        break;
      case 'last-6-months':
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        startDate = format(sixMonthsAgo, 'yyyy-MM-dd');
        break;
      case 'last-year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);
        startDate = format(yearAgo, 'yyyy-MM-dd');
        break;
      default:
        // 'all' or any other value
        startDate = '';
        break;
    }

    setFilter(prev => ({ 
      ...prev, 
      period, 
      startDate, 
      endDate: period === 'all' ? '' : endDate 
    }));
  };

  // Handle search
  const handleSearch = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/transactions/me'] });
  };

  // Calculate summary
  const transactionSummary = React.useMemo(() => {
    if (!data || !data.length) {
      return {
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalInvestments: 0,
        totalReturns: 0,
        netBalance: 0
      };
    }

    return data.reduce((acc: any, tx: Transaction) => {
      const amount = tx.amount;
      
      switch (tx.type) {
        case 'deposit':
          acc.totalDeposits += amount;
          acc.netBalance += amount;
          break;
        case 'withdrawal':
          acc.totalWithdrawals += amount;
          acc.netBalance -= amount;
          break;
        case 'investment':
          acc.totalInvestments += amount;
          acc.netBalance -= amount;
          break;
        case 'return':
          acc.totalReturns += amount;
          acc.netBalance += amount;
          break;
      }
      
      return acc;
    }, {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalInvestments: 0,
      totalReturns: 0,
      netBalance: 0
    });
  }, [data]);

  // Export transactions as CSV
  const exportTransactions = () => {
    if (!data || !data.length) return;

    const headers = ['Date', 'Reference', 'Type', 'Description', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.map((tx: Transaction) => [
        format(new Date(tx.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        tx.reference || '-',
        tx.type,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount,
        tx.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          Track and monitor all your financial activities on the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <Tabs defaultValue="all" className="w-full" value={filter.type} onValueChange={(value) => updateFilter('type', value)}>
            <TabsList className="grid grid-cols-4 md:grid-cols-7 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposit">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
              <TabsTrigger value="investment">Investments</TabsTrigger>
              <TabsTrigger value="return">Returns</TabsTrigger>
              <TabsTrigger value="fee">Fees</TabsTrigger>
              <TabsTrigger value="referral_bonus">Bonuses</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by description or reference..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={filter.period}
                onValueChange={handlePeriodChange}
              >
                <SelectTrigger className="w-[160px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                    <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => refetch()} 
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={exportTransactions}
                disabled={!data || !data.length}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {filter.startDate && filter.endDate && (
            <div className="text-sm text-muted-foreground">
              Showing transactions from{" "}
              <span className="font-medium">
                {format(new Date(filter.startDate), 'PP')}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {format(new Date(filter.endDate), 'PP')}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ArrowDown className="h-4 w-4 mr-2 text-green-500" />
                  Total Deposits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{formatNaira(transactionSummary.totalDeposits)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ArrowUp className="h-4 w-4 mr-2 text-red-500" />
                  Total Withdrawals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{formatNaira(transactionSummary.totalWithdrawals)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                  Total Investments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{formatNaira(transactionSummary.totalInvestments)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Wallet className="h-4 w-4 mr-2 text-purple-500" />
                  Total Returns
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{formatNaira(transactionSummary.totalReturns)}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[120px]" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">Error loading transactions</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No transactions found for the selected filters.</p>
            {filter.type !== 'all' || filter.period !== 'all' || searchQuery ? (
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilter({ type: 'all', period: 'all', startDate: '', endDate: '' });
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            ) : null}
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((tx: Transaction) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{format(new Date(tx.createdAt), 'MMM d, yyyy')}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(tx.createdAt), 'h:mm a')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          {getTransactionTypeIcon(tx.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <Badge className={getTransactionTypeColor(tx.type)} variant="outline">
                              {tx.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Ref: {tx.reference || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate" title={tx.description}>
                      {tx.description}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={`
                        ${tx.type === 'deposit' || tx.type === 'return' || tx.type === 'referral_bonus' 
                          ? 'text-green-600' 
                          : 'text-red-600'}
                      `}>
                        {tx.type === 'deposit' || tx.type === 'return' || tx.type === 'referral_bonus' ? '+' : '-'}
                        {formatNaira(tx.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={tx.status === 'completed' ? 'default' : 'outline'}
                        className={`
                          ${tx.status === 'completed' ? 'bg-green-500' : 
                            tx.status === 'pending' ? 'text-yellow-600 border-yellow-600' : 
                            tx.status === 'failed' ? 'text-red-600 border-red-600' : ''}
                        `}
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className="justify-between text-xs text-muted-foreground border-t pt-4">
        <div>
          {!isLoading && !isError && data && (
            <p>Showing {data.length} transaction{data.length !== 1 ? 's' : ''}</p>
          )}
        </div>
        <div>
          <p>Last updated: {format(new Date(), 'PPp')}</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TransactionHistory;