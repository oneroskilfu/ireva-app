import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, ArrowDown, ArrowUp, Wallet as WalletIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EmptyState } from '@/components/ui/empty-state';

interface WalletData {
  id: number;
  userId: number;
  balance: number;
  lastUpdated: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
}

interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  description: string;
  reference?: string;
  status: string;
  createdAt: string;
}

const fundSchema = z.object({
  amount: z.string().min(1, "Amount is required")
    .transform((val) => Number(val))
    .refine((val) => val > 0, { message: "Amount must be greater than 0" }),
  description: z.string().optional(),
});

type FundFormValues = z.infer<typeof fundSchema>;

const withdrawSchema = z.object({
  amount: z.string().min(1, "Amount is required")
    .transform((val) => Number(val))
    .refine((val) => val > 0, { message: "Amount must be greater than 0" }),
  description: z.string().optional(),
});

type WithdrawFormValues = z.infer<typeof withdrawSchema>;

export const Wallet: React.FC = () => {
  const { toast } = useToast();
  const [openFundDialog, setOpenFundDialog] = React.useState(false);
  const [openWithdrawDialog, setOpenWithdrawDialog] = React.useState(false);
  
  // Query wallet data
  const { 
    data: wallet, 
    isLoading: isLoadingWallet,
    error: walletError
  } = useQuery<WalletData>({
    queryKey: ['/api/wallet'],
  });
  
  // Query wallet transaction history
  const { 
    data: transactions, 
    isLoading: isLoadingTransactions,
    error: transactionsError
  } = useQuery<Transaction[]>({
    queryKey: ['/api/wallet/transactions'],
  });
  
  // Add funds mutation
  const fundMutation = useMutation({
    mutationFn: async (data: FundFormValues) => {
      const response = await apiRequest('POST', '/api/wallet/fund', data);
      return response.json();
    },
    onSuccess: () => {
      setOpenFundDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      toast({
        title: "Success",
        description: "Funds have been added to your wallet",
      });
      fundForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add funds to wallet",
        variant: "destructive",
      });
    }
  });
  
  // Withdraw funds mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: WithdrawFormValues) => {
      const response = await apiRequest('POST', '/api/wallet/withdraw', data);
      return response.json();
    },
    onSuccess: () => {
      setOpenWithdrawDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      toast({
        title: "Success",
        description: "Withdrawal request has been submitted",
      });
      withdrawForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    }
  });
  
  // Fund wallet form
  const fundForm = useForm<FundFormValues>({
    resolver: zodResolver(fundSchema),
    defaultValues: {
      amount: '',
      description: 'Wallet funding',
    },
  });
  
  // Withdraw form
  const withdrawForm = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: '',
      description: 'Wallet withdrawal',
    },
  });
  
  const onFundSubmit = (data: FundFormValues) => {
    fundMutation.mutate(data);
  };
  
  const onWithdrawSubmit = (data: WithdrawFormValues) => {
    // Check if withdrawal amount is greater than balance
    if (wallet && Number(data.amount) > wallet.balance) {
      toast({
        title: "Insufficient funds",
        description: "Withdrawal amount exceeds your wallet balance",
        variant: "destructive",
      });
      return;
    }
    
    withdrawMutation.mutate(data);
  };
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'investment':
        return <ArrowUp className="h-4 w-4 text-blue-500" />;
      case 'return':
        return <ArrowDown className="h-4 w-4 text-amber-500" />;
      default:
        return <WalletIcon className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  if (isLoadingWallet || isLoadingTransactions) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (walletError || transactionsError) {
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-500">
        Error loading wallet data. Please try again later.
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                {wallet ? formatCurrency(wallet.balance) : '₦0'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Last updated: {wallet ? new Date(wallet.lastUpdated).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
              <Dialog open={openFundDialog} onOpenChange={setOpenFundDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Funds
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Funds to Wallet</DialogTitle>
                  </DialogHeader>
                  <Form {...fundForm}>
                    <form onSubmit={fundForm.handleSubmit(onFundSubmit)} className="space-y-4">
                      <FormField
                        control={fundForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₦)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="0" 
                                placeholder="Enter amount" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={fundForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Purpose of funding"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={fundMutation.isPending}
                          className="w-full"
                        >
                          {fundMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Add Funds'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={openWithdrawDialog} onOpenChange={setOpenWithdrawDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                  </DialogHeader>
                  <Form {...withdrawForm}>
                    <form onSubmit={withdrawForm.handleSubmit(onWithdrawSubmit)} className="space-y-4">
                      <FormField
                        control={withdrawForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₦)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="0" 
                                max={wallet?.balance}
                                placeholder="Enter amount" 
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              Available balance: {wallet ? formatCurrency(wallet.balance) : '₦0'}
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={withdrawForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Purpose of withdrawal"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={withdrawMutation.isPending}
                          className="w-full"
                        >
                          {withdrawMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Withdraw Funds'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Transaction History</h3>
        
        {transactions && transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.description || `${transaction.type.charAt(0).toUpperCase()}${transaction.type.slice(1)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'deposit' || transaction.type === 'return' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'deposit' || transaction.type === 'return' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'outline'} className="mt-1">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Transactions"
            description="You haven't made any transactions yet. Add funds to get started."
            icon="wallet"
          />
        )}
      </div>
    </div>
  );
};

export default Wallet;