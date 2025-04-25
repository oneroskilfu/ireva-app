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
  Bitcoin
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import CryptoPayment from './CryptoPayment';

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

const WalletOverview: React.FC = () => {
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);
  
  const { data: walletData, isLoading } = useQuery<WalletData>({
    queryKey: ['/api/wallet'],
  });

  // Mock wallet data while loading or if API returns null
  const wallet = walletData || {
    balance: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    availableBalance: 0,
    totalInvested: 0,
    totalReturns: 0,
    recentTransactions: []
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium capitalize">{transaction.type}</TableCell>
                      <TableCell>
                        {transaction.type === 'deposit' || transaction.type === 'return' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.status === 'completed' ? 'default' :
                          transaction.status === 'pending' ? 'outline' : 'destructive'
                        }>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
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