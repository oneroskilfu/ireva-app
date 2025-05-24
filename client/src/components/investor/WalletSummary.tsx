import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Banknote, 
  Clock, 
  Check, 
  AlertCircle, 
  Loader2
} from 'lucide-react';

interface WalletBalance {
  balance: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  availableBalance: number;
}

interface WalletTransaction {
  id: number;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'investment' | 'return';
  description: string;
  reference: string;
  balanceBefore: number;
  balanceAfter: number;
  status: 'pending' | 'completed' | 'failed';
  propertyId?: number;
  investmentId?: number;
  createdAt: string;
}

const WalletSummary: React.FC = () => {
  // Fetch wallet balance
  const { data: wallet, isLoading: isLoadingWallet } = useQuery<WalletBalance>({
    queryKey: ['/api/investor/wallet'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/investor/wallet');
      return await res.json();
    },
  });
  
  // Fetch wallet transactions
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<WalletTransaction[]>({
    queryKey: ['/api/investor/wallet/transactions'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/investor/wallet/transactions');
      return await res.json();
    },
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get transaction icon based on type
  const getTransactionIcon = (type: 'deposit' | 'withdrawal' | 'investment' | 'return') => {
    switch(type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'investment':
        return <Banknote className="h-4 w-4 text-blue-500" />;
      case 'return':
        return <Banknote className="h-4 w-4 text-purple-500" />;
      default:
        return <Banknote className="h-4 w-4" />;
    }
  };

  // Get transaction status badge
  const getStatusBadge = (status: 'pending' | 'completed' | 'failed') => {
    switch(status) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <Check className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Filter transactions by type for tabs
  const recentTransactions = transactions?.slice(0, 5) || [];
  const deposits = transactions?.filter(tx => tx.type === 'deposit') || [];
  const withdrawals = transactions?.filter(tx => tx.type === 'withdrawal') || [];
  const investmentTx = transactions?.filter(tx => tx.type === 'investment' || tx.type === 'return') || [];

  if (isLoadingWallet || isLoadingTransactions) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Wallet Summary</CardTitle>
          <CardDescription>Manage your wallet and transactions</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Wallet Balance</CardTitle>
          <CardDescription>Your current wallet balance and summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Available Balance</span>
              </div>
              <div className="text-3xl font-bold mt-2">
                {formatCurrency(wallet?.availableBalance || 0)}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Total Balance: {formatCurrency(wallet?.balance || 0)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border bg-card p-3">
                <div className="text-sm font-medium text-muted-foreground mb-1">Pending Deposits</div>
                <div className="font-semibold">{formatCurrency(wallet?.pendingDeposits || 0)}</div>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <div className="text-sm font-medium text-muted-foreground mb-1">Pending Withdrawals</div>
                <div className="font-semibold">{formatCurrency(wallet?.pendingWithdrawals || 0)}</div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="gap-2 border-t px-6 py-4">
          <Button className="bg-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            Fund Wallet
          </Button>
          <Button variant="outline">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Withdraw
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View all your wallet transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              <TabsTrigger value="investments">Investments</TabsTrigger>
            </TabsList>
            
            {[
              { id: 'recent', data: recentTransactions, title: 'Recent Transactions' },
              { id: 'deposits', data: deposits, title: 'Deposit Transactions' },
              { id: 'withdrawals', data: withdrawals, title: 'Withdrawal Transactions' },
              { id: 'investments', data: investmentTx, title: 'Investment Transactions' },
            ].map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                {tab.data.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    No {tab.title.toLowerCase()} found.
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tab.data.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTransactionIcon(transaction.type)}
                                <div>
                                  <div className="font-medium capitalize">
                                    {transaction.type}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {transaction.description}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div 
                                className={`font-medium ${
                                  transaction.type === 'deposit' || transaction.type === 'return'
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                                }`}
                              >
                                {transaction.type === 'deposit' || transaction.type === 'return' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDate(transaction.createdAt)}
                            </TableCell>
                            <TableCell>
                              <div className="font-mono text-sm">
                                {transaction.reference}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(transaction.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                {tab.data.length > 0 && (
                  <div className="flex justify-center">
                    <Button variant="outline">View All {tab.title}</Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletSummary;