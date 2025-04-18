import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, ArrowUpRight, Download, Plus, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';

interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  type: 'investment' | 'deposit' | 'withdrawal' | 'divestment' | 'return' | 'fee' | 'transfer' | 'referral_bonus';
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  projectId?: any;
  description: string;
  receipt?: string;
  createdAt: string;
}

interface Wallet {
  _id: string;
  userId: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalInvested: number;
  totalReturns: number;
  status: 'active' | 'suspended' | 'locked';
  currency: string;
  lastUpdated: string;
}

const WalletOverview: React.FC = () => {
  const { toast } = useToast();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    bankName: '',
    accountName: ''
  });

  // Fetch wallet data and transactions
  const { data: walletData, isLoading: isWalletLoading, error: walletError } = useQuery({
    queryKey: ['/api/transactions/wallet'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/transactions/wallet');
      return res.json();
    }
  });

  // Fetch all user transactions
  const { data: transactionsData, isLoading: isTransactionsLoading, error: transactionsError } = useQuery({
    queryKey: ['/api/transactions/my'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/transactions/my');
      return res.json();
    }
  });

  const handleDeposit = async () => {
    try {
      if (!depositAmount || parseFloat(depositAmount) <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount",
          variant: "destructive"
        });
        return;
      }

      const res = await apiRequest('POST', '/api/transactions/deposit', {
        amount: parseFloat(depositAmount),
        paymentMethod
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Deposit successful",
          description: `₦${parseFloat(depositAmount).toLocaleString()} has been added to your wallet`,
        });
        setDepositAmount('');
        setDepositDialogOpen(false);
      } else {
        throw new Error('Failed to process deposit');
      }
    } catch (error) {
      toast({
        title: "Deposit failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  };

  const handleWithdraw = async () => {
    try {
      if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount",
          variant: "destructive"
        });
        return;
      }

      if (!bankDetails.accountNumber || !bankDetails.bankName || !bankDetails.accountName) {
        toast({
          title: "Incomplete bank details",
          description: "Please fill in all bank details",
          variant: "destructive"
        });
        return;
      }

      const res = await apiRequest('POST', '/api/transactions/withdraw', {
        amount: parseFloat(withdrawAmount),
        bankDetails
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Withdrawal request submitted",
          description: "Your withdrawal request is being processed",
        });
        setWithdrawAmount('');
        setBankDetails({
          accountNumber: '',
          bankName: '',
          accountName: ''
        });
        setWithdrawDialogOpen(false);
      } else {
        throw new Error('Failed to process withdrawal');
      }
    } catch (error) {
      toast({
        title: "Withdrawal failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'investment':
        return <ArrowUpRight className="w-4 h-4 text-blue-500" />;
      case 'deposit':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'withdrawal':
        return <Download className="w-4 h-4 text-red-500" />;
      case 'return':
        return <Plus className="w-4 h-4 text-purple-500" />;
      default:
        return <Wallet className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  if (isWalletLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (walletError) {
    return (
      <div className="p-6 text-center rounded-lg border border-red-200 bg-red-50">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-800">Error Loading Wallet</h3>
        <p className="mt-2 text-red-600">
          {walletError instanceof Error ? walletError.message : "Failed to load wallet information"}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const wallet: Wallet = walletData?.data?.wallet;
  const transactions: Transaction[] = transactionsData?.data || [];
  const stats = walletData?.data?.stats;

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl flex items-center">
            <Wallet className="w-6 h-6 mr-2 text-primary" /> My Wallet
          </CardTitle>
          <CardDescription>
            Manage your funds and track your financial activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-primary/5 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <h3 className="text-2xl font-bold text-primary">{formatCurrency(wallet?.balance || 0)}</h3>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Invested</p>
              <h3 className="text-2xl font-bold text-blue-600">{formatCurrency(wallet?.totalInvested || 0)}</h3>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Returns</p>
              <h3 className="text-2xl font-bold text-green-600">{formatCurrency(wallet?.totalReturns || 0)}</h3>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Deposited</p>
              <h3 className="text-2xl font-bold text-purple-600">{formatCurrency(wallet?.totalDeposited || 0)}</h3>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {wallet?.lastUpdated ? formatDate(wallet.lastUpdated) : 'Never'}
          </div>
          <div className="flex space-x-2">
            <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                  <Plus className="w-4 h-4 mr-2" /> Deposit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deposit Funds</DialogTitle>
                  <DialogDescription>
                    Add funds to your iREVA wallet to invest in properties.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="ussd">USSD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleDeposit}>
                    Deposit Funds
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
                  <Download className="w-4 h-4 mr-2" /> Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription>
                    Withdraw funds from your iREVA wallet to your bank account.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="withdraw-amount">Amount</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bank-name">Bank Name</Label>
                    <Input
                      id="bank-name"
                      placeholder="Enter bank name"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input
                      id="account-number"
                      placeholder="Enter account number"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="account-name">Account Name</Label>
                    <Input
                      id="account-name"
                      placeholder="Enter account name"
                      value={bankDetails.accountName}
                      onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleWithdraw}>
                    Withdraw Funds
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardFooter>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View all your deposits, withdrawals, investments, and returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              <TabsTrigger value="investments">Investments</TabsTrigger>
              <TabsTrigger value="returns">Returns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {renderTransactionTable(transactions)}
            </TabsContent>
            
            <TabsContent value="deposits">
              {renderTransactionTable(transactions.filter(tx => tx.type === 'deposit'))}
            </TabsContent>
            
            <TabsContent value="withdrawals">
              {renderTransactionTable(transactions.filter(tx => tx.type === 'withdrawal'))}
            </TabsContent>
            
            <TabsContent value="investments">
              {renderTransactionTable(transactions.filter(tx => tx.type === 'investment'))}
            </TabsContent>
            
            <TabsContent value="returns">
              {renderTransactionTable(transactions.filter(tx => tx.type === 'return'))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  function renderTransactionTable(transactions: Transaction[]) {
    if (isTransactionsLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    if (transactionsError) {
      return (
        <div className="text-center py-6">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Failed to load transactions</p>
        </div>
      );
    }

    if (!transactions || transactions.length === 0) {
      return (
        <div className="text-center py-10 border rounded-lg">
          <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
          <p className="text-gray-500 mt-1">
            When you make deposits, investments or receive returns, they will appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="border rounded-md">
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
            {transactions.map((tx) => (
              <TableRow key={tx._id}>
                <TableCell className="font-medium">
                  {formatDate(tx.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getTransactionTypeIcon(tx.type)}
                    <span className="capitalize">{tx.type}</span>
                  </div>
                </TableCell>
                <TableCell>{tx.description}</TableCell>
                <TableCell className={tx.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}>
                  {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                </TableCell>
                <TableCell>{getStatusBadge(tx.status)}</TableCell>
                <TableCell className="font-mono text-xs">{tx.reference}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
};

export default WalletOverview;