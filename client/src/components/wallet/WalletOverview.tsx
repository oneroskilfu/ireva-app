import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  AlertCircle,
  Clock,
  ChevronDown,
  RefreshCw,
  Download,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import AddFunds from './AddFunds';
import WithdrawFunds from './WithdrawFunds';
import TransactionHistory from './TransactionHistory';

interface WalletData {
  balance: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  availableBalance: number;
  totalInvested: number;
  totalReturns: number;
  recentTransactions: {
    id: number;
    type: 'deposit' | 'withdrawal' | 'investment' | 'return';
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    description: string;
    createdAt: string;
  }[];
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

const WalletOverview = () => {
  const { toast } = useToast();
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const {
    data: walletData,
    isLoading,
    isError,
    refetch,
  } = useQuery<WalletData>({
    queryKey: ['/api/wallet/balance'],
    retry: 1,
  });

  const handleRefreshBalance = () => {
    refetch();
    toast({
      title: 'Wallet refreshed',
      description: 'Your wallet balance has been updated.',
    });
  };

  const handleDownloadStatement = () => {
    toast({
      title: 'Statement download initiated',
      description: 'Your wallet statement will be downloaded shortly.',
    });
    // In a real application, this would trigger an API call to generate and download a statement
  };

  // Loading state
  if (isLoading) {
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

  // Error state
  if (isError || !walletData) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Wallet</h1>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load wallet data</h2>
          <p className="text-muted-foreground mb-4">
            There was an error loading your wallet information. Please try again.
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Helmet>
        <title>My Wallet | iREVA</title>
      </Helmet>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Wallet</h1>
          <p className="text-muted-foreground">
            Manage your funds, deposits, and withdrawals
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
              <AddFunds onSuccess={() => { setShowAddFunds(false); refetch(); }} />
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
              <WithdrawFunds 
                availableBalance={walletData.availableBalance}
                onSuccess={() => { setShowWithdraw(false); refetch(); }} 
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Available Balance</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              {formatCurrency(walletData.availableBalance)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center">
              <Wallet className="h-3 w-3 mr-1" /> 
              Total balance: {formatCurrency(walletData.balance)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Transactions</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              {formatCurrency(walletData.pendingDeposits + walletData.pendingWithdrawals)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center">
                <ArrowDownCircle className="h-3 w-3 mr-1 text-green-500" />
                Deposits: {formatCurrency(walletData.pendingDeposits)}
              </span>
              <span className="flex items-center">
                <ArrowUpCircle className="h-3 w-3 mr-1 text-orange-500" />
                Withdrawals: {formatCurrency(walletData.pendingWithdrawals)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Investment Overview</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              {formatCurrency(walletData.totalInvested)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Total Invested</span>
              <span className="flex items-center font-medium text-green-600">
                +{formatCurrency(walletData.totalReturns)} Returns
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="flex-1">
        <TabsList>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="flex-1">
          <TransactionHistory />
        </TabsContent>
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
    </div>
  );
};

export default WalletOverview;