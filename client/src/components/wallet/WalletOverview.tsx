import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  BarChart, 
  CreditCard, 
  ExternalLink, 
  Wallet, 
  DollarSign,
  Bitcoin,
  CircleDollarSign,
  Link as LinkIcon,
  RefreshCw
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CryptoPayment from './CryptoPayment';

interface Transaction {
  id: number;
  type: 'deposit' | 'withdrawal' | 'investment' | 'return';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
  // Fields for crypto transactions
  isCrypto?: boolean;
  currency?: string;
  txHash?: string;
  network?: string;
}

interface WalletData {
  balance: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  availableBalance: number;
  totalInvested: number;
  totalReturns: number;
  cryptoBalance?: {
    total: number;
    byAsset: Array<{
      currency: string;
      amount: number;
      amountInFiat: number;
    }>;
  };
  recentTransactions: Transaction[];
}

const WalletOverview: React.FC = () => {
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);
  
  const { data: walletData, isLoading } = useQuery<WalletData>({
    queryKey: ['/api/wallet'],
  });

  // Mock wallet data while loading or if API returns null
  const wallet = walletData || {
    balance: 5000,
    pendingDeposits: 250,
    pendingWithdrawals: 0,
    availableBalance: 4750,
    totalInvested: 15000,
    totalReturns: 1200,
    cryptoBalance: {
      total: 1750,
      byAsset: [
        { currency: 'BTC', amount: 0.021, amountInFiat: 850 },
        { currency: 'ETH', amount: 0.45, amountInFiat: 650 },
        { currency: 'USDT', amount: 250, amountInFiat: 250 },
      ]
    },
    recentTransactions: [
      {
        id: 1,
        type: 'deposit',
        amount: 2000,
        status: 'completed',
        description: 'Bank transfer deposit',
        createdAt: '2025-04-20T12:00:00Z'
      },
      {
        id: 2,
        type: 'deposit',
        amount: 850,
        status: 'completed',
        description: 'Bitcoin deposit',
        createdAt: '2025-04-21T14:30:00Z',
        isCrypto: true,
        currency: 'BTC',
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        network: 'Bitcoin'
      },
      {
        id: 3,
        type: 'investment',
        amount: 1500,
        status: 'completed',
        description: 'Investment in Lagos Heights',
        createdAt: '2025-04-22T09:15:00Z'
      },
      {
        id: 4,
        type: 'deposit',
        amount: 650,
        status: 'completed',
        description: 'Ethereum deposit',
        createdAt: '2025-04-23T16:45:00Z',
        isCrypto: true,
        currency: 'ETH',
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        network: 'Ethereum'
      },
      {
        id: 5,
        type: 'return',
        amount: 120,
        status: 'completed',
        description: 'ROI from Westfield Retail Center',
        createdAt: '2025-04-24T10:30:00Z'
      },
      {
        id: 6,
        type: 'deposit',
        amount: 250,
        status: 'pending',
        description: 'USDT deposit',
        createdAt: '2025-04-25T08:00:00Z',
        isCrypto: true,
        currency: 'USDT',
        network: 'Ethereum'
      }
    ]
  };

  const handleOpenDepositDialog = () => {
    setShowDepositDialog(true);
  };

  const handleOpenCryptoPayment = () => {
    setShowCryptoPayment(true);
  };

  const handleCryptoPaymentSuccess = (paymentId: string) => {
    console.log(`Crypto payment successful: ${paymentId}`);
    // Refetch wallet data
    // queryClient.invalidateQueries(['/api/wallet']);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wallet Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(wallet.balance)}</div>
            <p className="text-xs text-muted-foreground">
              Available: {formatCurrency(wallet.availableBalance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Crypto Balance
            </CardTitle>
            <Bitcoin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wallet.cryptoBalance 
                ? formatCurrency(wallet.cryptoBalance.total) 
                : formatCurrency(0)}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              {wallet.cryptoBalance?.byAsset && wallet.cryptoBalance.byAsset.length > 0 ? (
                wallet.cryptoBalance.byAsset.map((asset, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{asset.currency}:</span>
                    <span>{asset.amount} ({formatCurrency(asset.amountInFiat)})</span>
                  </div>
                ))
              ) : (
                <p>No crypto assets</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invested
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(wallet.totalInvested)}</div>
            <p className="text-xs text-muted-foreground">
              Returns: {formatCurrency(wallet.totalReturns)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Transactions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(wallet.pendingDeposits + wallet.pendingWithdrawals)}</div>
            <p className="text-xs text-muted-foreground">
              Deposits: {formatCurrency(wallet.pendingDeposits)} • Withdrawals: {formatCurrency(wallet.pendingWithdrawals)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Fund Your Wallet</CardTitle>
            <CardDescription>
              Add funds to your wallet to start investing in properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="fiat" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fiat">Fiat Currency</TabsTrigger>
                <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
              </TabsList>
              <TabsContent value="fiat" className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button onClick={handleOpenDepositDialog} className="w-full">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Bank Transfer / Card
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Payment Instructions
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="crypto" className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button onClick={handleOpenCryptoPayment} className="w-full">
                    <Bitcoin className="mr-2 h-4 w-4" />
                    Pay with Crypto
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Crypto Guide
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your recent wallet activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallet.recentTransactions.length > 0 ? (
                  wallet.recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className={transaction.isCrypto ? "bg-muted/30" : ""}>
                      <TableCell className="font-medium capitalize">
                        <div className="flex items-center">
                          {transaction.isCrypto ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex items-center">
                                    <Bitcoin className="h-3 w-3 mr-1 text-muted-foreground" />
                                    {transaction.type}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Crypto Transaction</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            transaction.type
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>
                            {transaction.type === 'deposit' || transaction.type === 'return' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </span>
                          {transaction.isCrypto && transaction.currency && (
                            <span className="text-xs text-muted-foreground">
                              {transaction.currency}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.status === 'completed' ? 'default' :
                          transaction.status === 'pending' ? 'outline' : 'destructive'
                        }>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{transaction.description}</span>
                          {transaction.isCrypto && transaction.txHash && (
                            <a 
                              href={`https://etherscan.io/tx/${transaction.txHash}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs flex items-center text-primary hover:underline"
                            >
                              <LinkIcon className="h-3 w-3 mr-1" />
                              View on {transaction.network || 'blockchain'}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No transactions yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Transactions
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Crypto Payment Dialog */}
      <CryptoPayment 
        isOpen={showCryptoPayment}
        onClose={() => setShowCryptoPayment(false)}
        onSuccess={handleCryptoPaymentSuccess}
      />
    </>
  );
};

export default WalletOverview;