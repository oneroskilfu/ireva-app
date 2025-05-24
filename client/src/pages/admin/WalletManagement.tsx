import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpDown, 
  MoreHorizontal, 
  Wallet, 
  Plus, 
  Minus, 
  Eye, 
  RefreshCw,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { useMutation } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const walletAdjustmentSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .refine(val => !isNaN(parseInt(val)), "Amount must be a number")
    .refine(val => parseInt(val) > 0, "Amount must be greater than 0"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  type: z.enum(["credit", "debit"])
});

type WalletAdjustmentValues = z.infer<typeof walletAdjustmentSchema>;

function WalletDetailDialog({ userId, username }: { userId: number, username: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const { data: walletDetails, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/wallets', userId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/wallets/${userId}`);
      return await res.json();
    },
    enabled: isOpen
  });
  
  const form = useForm<WalletAdjustmentValues>({
    resolver: zodResolver(walletAdjustmentSchema),
    defaultValues: {
      amount: '',
      reason: '',
      type: 'credit'
    }
  });

  const adjustMutation = useMutation({
    mutationFn: async (data: WalletAdjustmentValues) => {
      const res = await apiRequest('PATCH', `/api/admin/wallets/${userId}/adjust`, {
        amount: parseInt(data.amount),
        reason: data.reason,
        type: data.type
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Wallet adjusted successfully",
        description: `${data.adjustment.type === 'credit' ? 'Added' : 'Deducted'} ₦${parseInt(form.getValues().amount).toLocaleString()} from ${username}'s wallet.`,
      });
      form.reset();
      refetch();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wallets'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to adjust wallet",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  function onSubmit(data: WalletAdjustmentValues) {
    adjustMutation.mutate(data);
  }

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-yellow-500" />;
      case 'investment':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'return':
        return <ArrowDownRight className="h-4 w-4 text-emerald-500" />;
      default:
        return <ArrowDownRight className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" /> Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTransactionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
          <span className="sr-only">View wallet</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Wallet Details - {username}</DialogTitle>
          <DialogDescription>
            View and manage this user's wallet and transaction history
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : walletDetails ? (
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="adjust">Adjust Balance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₦{walletDetails.balance.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last updated: {format(new Date(walletDetails.lastUpdated), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">User Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Name:</span>
                      <span className="text-sm">{walletDetails.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Username:</span>
                      <span className="text-sm">{walletDetails.user.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm">{walletDetails.user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Role:</span>
                      <Badge variant="outline">{walletDetails.user.role}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    The 10 most recent transactions for this user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {walletDetails.transactions?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {walletDetails.transactions.map((transaction: any) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium whitespace-nowrap">
                              {format(new Date(transaction.createdAt), 'dd MMM yyyy')}
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(transaction.createdAt), 'hh:mm a')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTransactionTypeIcon(transaction.type)}
                                <span>{transaction.description}</span>
                              </div>
                            </TableCell>
                            <TableCell>{formatTransactionType(transaction.type)}</TableCell>
                            <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                            <TableCell className="text-right font-medium">
                              <span className={transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}>
                                {transaction.type === 'withdrawal' ? '-' : '+'}₦{transaction.amount.toLocaleString()}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No transactions found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="adjust">
              <Card>
                <CardHeader>
                  <CardTitle>Adjust Wallet Balance</CardTitle>
                  <CardDescription>
                    Credit or debit this user's wallet balance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adjustment Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select adjustment type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="credit">Credit (Add Funds)</SelectItem>
                                <SelectItem value="debit">Debit (Remove Funds)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₦)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. 50000"
                                {...field}
                                type="number"
                                min="1"
                              />
                            </FormControl>
                            <FormDescription>
                              Current balance: ₦{walletDetails.balance.toLocaleString()}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reason</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Explain the reason for this adjustment"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={adjustMutation.isPending}
                      >
                        {adjustMutation.isPending ? 'Processing...' : 'Submit Adjustment'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No wallet found for this user</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function WalletManagement() {
  const { toast } = useToast();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/wallets'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/wallets');
      return await res.json();
    }
  });

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const sortedWallets = data?.wallets ? [...data.wallets].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.balance - b.balance;
    } else {
      return b.balance - a.balance;
    }
  }) : [];

  return (
    <AdminLayout>
      <Helmet>
        <title>Wallet Management | iREVA Admin</title>
      </Helmet>
      
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Wallet Management</h1>
        </div>
        
        {/* Stats cards */}
        {data?.stats && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Wallets</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.totalWallets}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{data.stats.totalBalance?.toLocaleString()}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Balance</CardTitle>
                <Minus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{Math.round(data.stats.averageBalance)?.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Wallets table */}
        <Card>
          <CardHeader>
            <CardTitle>User Wallets</CardTitle>
            <CardDescription>
              Manage and monitor all user wallets across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sortedWallets.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>
                      <div className="flex items-center cursor-pointer" onClick={handleSort}>
                        Balance (₦)
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedWallets.map((wallet) => (
                    <TableRow key={wallet.id}>
                      <TableCell className="font-medium">{wallet.user.name}</TableCell>
                      <TableCell>{wallet.user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{wallet.user.role}</Badge>
                      </TableCell>
                      <TableCell>₦{wallet.balance.toLocaleString()}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(wallet.lastUpdated), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        {wallet.isActive ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <WalletDetailDialog userId={wallet.userId} username={wallet.user.name} />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No wallets found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}