import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, 
  CardContent,
  CardHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  ArrowDown, 
  ArrowUp, 
  DollarSign, 
  Download, 
  Filter, 
  Info, 
  RefreshCw, 
  Search,
  ChevronRight,
  Calendar,
  CreditCard,
  Wallet,
  ArrowRightLeft,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { PageTitle } from '@/components/ui/PageTitle';

// Types for transactions
interface Transaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'fee' | 'investment' | 'return' | 'crypto_deposit' | 'crypto_withdrawal';
  status: 'completed' | 'pending' | 'failed' | 'processing';
  amount: number;
  currency: string;
  description: string;
  method?: string;
  reference?: string;
  wallet_type?: 'fiat' | 'crypto';
  crypto_details?: {
    asset: string;
    network: string;
    tx_hash: string;
    confirmations: number;
  };
}

const TransactionsPage: React.FC = () => {
  const [transactionType, setTransactionType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [walletType, setWalletType] = useState<'all' | 'fiat' | 'crypto'>('all');
  
  const itemsPerPage = 10;

  // Fetch transactions
  const { data: transactions, isLoading, error, refetch } = useQuery<Transaction[]>({
    queryKey: ['/api/wallet/transactions', transactionType, walletType],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/wallet/transactions');
        return await response.json();
      } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
    },
  });

  // Filter transactions based on search query
  const filteredTransactions = transactions?.filter(transaction => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      transaction.description.toLowerCase().includes(query) ||
      transaction.id.toLowerCase().includes(query) ||
      (transaction.reference?.toLowerCase().includes(query) || false) ||
      (transaction.crypto_details?.tx_hash.toLowerCase().includes(query) || false)
    );
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Function to get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Function to get transaction type icon
  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'investment':
        return <ArrowUp className="h-4 w-4 text-blue-500" />;
      case 'return':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case 'fee':
        return <DollarSign className="h-4 w-4 text-yellow-500" />;
      case 'crypto_deposit':
        return <ArrowDown className="h-4 w-4 text-purple-500" />;
      case 'crypto_withdrawal':
        return <ArrowUp className="h-4 w-4 text-purple-500" />;
      default:
        return <ArrowRightLeft className="h-4 w-4" />;
    }
  };

  // Function to format amount
  const formatAmount = (amount: number, type: string) => {
    const isNegative = type === 'withdrawal' || type === 'investment' || type === 'fee' || type === 'crypto_withdrawal';
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
    
    return (
      <span className={isNegative ? 'text-red-600' : 'text-green-600'}>
        {isNegative ? '- ' : '+ '}{formattedAmount}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <PageTitle title="Transaction History" description="View and manage your transaction history" />
      
      {/* Transaction Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setTransactionType}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposit">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
              <TabsTrigger value="investment">Investments</TabsTrigger>
              <TabsTrigger value="return">Returns</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="ml-1"
            >
              <Filter className="h-4 w-4 mr-1" />
              {showAdvancedFilters ? 'Hide' : 'Show'} Filters
            </Button>
            
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="ml-1">
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-8 w-full md:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Advanced filters */}
      {showAdvancedFilters && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="wallet-type" className="block mb-2">Wallet Type</Label>
                <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setWalletType(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="fiat">Fiat</TabsTrigger>
                    <TabsTrigger value="crypto">Crypto</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div>
                <Label htmlFor="date-range" className="block mb-2">Date Range</Label>
                <div className="flex items-center space-x-2">
                  <Input type="date" id="date-from" className="w-full" />
                  <span>to</span>
                  <Input type="date" id="date-to" className="w-full" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status" className="block mb-2">Status</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      All Statuses
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>All</DropdownMenuItem>
                    <DropdownMenuItem>Completed</DropdownMenuItem>
                    <DropdownMenuItem>Pending</DropdownMenuItem>
                    <DropdownMenuItem>Processing</DropdownMenuItem>
                    <DropdownMenuItem>Failed</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" className="mr-2">Reset</Button>
              <Button>Apply Filters</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Transaction History</h3>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="m-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load transactions. Please try again later.</AlertDescription>
            </Alert>
          ) : paginatedTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No transactions found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery 
                  ? "No transactions match your search criteria. Try adjusting your filters."
                  : "You don't have any transactions yet. Deposits, withdrawals and investments will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {format(new Date(transaction.date), 'MMM d, yyyy')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), 'h:mm a')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {transaction.description}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {transaction.wallet_type === 'crypto' && transaction.crypto_details ? (
                              <span title={transaction.crypto_details.tx_hash}>
                                {transaction.crypto_details.asset} • {transaction.crypto_details.network} • 
                                {transaction.crypto_details.tx_hash.substring(0, 10)}...
                              </span>
                            ) : (
                              <span>{transaction.method || 'N/A'} • {transaction.reference || 'N/A'}</span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTransactionTypeIcon(transaction.type)}
                          <span className="capitalize">
                            {transaction.type.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatAmount(transaction.amount, transaction.type)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Info className="h-4 w-4" />
                              <span className="sr-only">Details</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Transaction Details</DialogTitle>
                              <DialogDescription>
                                Detailed information about this transaction
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Transaction ID</span>
                                <span className="font-medium">{transaction.id}</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Date & Time</span>
                                <span className="font-medium">
                                  {format(new Date(transaction.date), 'PPPp')}
                                </span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Type</span>
                                <div className="flex items-center gap-1">
                                  {getTransactionTypeIcon(transaction.type)}
                                  <span className="font-medium capitalize">
                                    {transaction.type.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <span>{getStatusBadge(transaction.status)}</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-medium">
                                  {formatAmount(transaction.amount, transaction.type)}
                                </span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Description</span>
                                <span className="font-medium">{transaction.description}</span>
                              </div>
                              
                              {transaction.wallet_type === 'crypto' && transaction.crypto_details && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Asset</span>
                                    <span className="font-medium">{transaction.crypto_details.asset}</span>
                                  </div>
                                  
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Network</span>
                                    <span className="font-medium">{transaction.crypto_details.network}</span>
                                  </div>
                                  
                                  <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground">Transaction Hash</span>
                                    <span className="font-medium break-all">
                                      {transaction.crypto_details.tx_hash}
                                    </span>
                                  </div>
                                  
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Confirmations</span>
                                    <span className="font-medium">{transaction.crypto_details.confirmations}</span>
                                  </div>
                                </>
                              )}
                              
                              {transaction.wallet_type === 'fiat' && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Method</span>
                                    <span className="font-medium">{transaction.method || 'N/A'}</span>
                                  </div>
                                  
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Reference</span>
                                    <span className="font-medium">{transaction.reference || 'N/A'}</span>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            <DialogFooter>
                              <Button variant="outline" className="w-full">
                                <Download className="h-4 w-4 mr-2" />
                                Download Receipt
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && !error && filteredTransactions.length > 0 && (
            <div className="flex justify-between items-center p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTransactions.length)} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
              </div>
              
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Helpful Tip */}
      <Alert className="mt-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Need help with a transaction?</AlertTitle>
        <AlertDescription>
          If you have questions about any transaction, please contact our support team or visit the <a href="/faq" className="text-primary underline">FAQ page</a>.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TransactionsPage;