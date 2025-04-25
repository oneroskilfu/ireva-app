import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bitcoin, 
  CheckCircle, 
  Link as LinkIcon, 
  MoreHorizontal, 
  RefreshCw, 
  Search, 
  X
} from "lucide-react";

interface CryptoTransaction {
  id: string;
  userId: number;
  username?: string;
  txHash?: string;
  network: string;
  amount: string;
  amountInFiat: number;
  currency: string;
  type: string;
  status: string;
  propertyId?: number;
  propertyName?: string;
  createdAt: string;
  confirmedAt?: string;
}

const CryptoTransactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<CryptoTransaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch crypto transactions
  const { data: transactions, isLoading, isError } = useQuery<CryptoTransaction[]>({
    queryKey: ['/api/admin/crypto-transactions'],
  });

  // Update transaction status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/crypto-transactions/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Transaction status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/crypto-transactions'] });
      setIsDetailsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update transaction status",
        variant: "destructive",
      });
    },
  });

  // Filter transactions based on search term
  const filteredTransactions = transactions?.filter(transaction => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      transaction.id.toLowerCase().includes(searchTermLower) ||
      transaction.txHash?.toLowerCase().includes(searchTermLower) ||
      transaction.username?.toLowerCase().includes(searchTermLower) ||
      transaction.currency.toLowerCase().includes(searchTermLower) ||
      transaction.type.toLowerCase().includes(searchTermLower) ||
      transaction.status.toLowerCase().includes(searchTermLower) ||
      transaction.propertyName?.toLowerCase().includes(searchTermLower)
    );
  });

  const handleShowDetails = (transaction: CryptoTransaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsOpen(true);
  };

  const handleStatusUpdate = (status: string) => {
    if (selectedTransaction) {
      updateStatusMutation.mutate({ id: selectedTransaction.id, status });
    }
  };

  const getBlockExplorerUrl = (txHash: string, network: string) => {
    // Simple mapping of networks to block explorers
    const explorers: Record<string, string> = {
      'ethereum': 'https://etherscan.io/tx/',
      'polygon': 'https://polygonscan.com/tx/',
      'binance': 'https://bscscan.com/tx/',
      'bitcoin': 'https://blockstream.info/tx/',
      'solana': 'https://explorer.solana.com/tx/',
    };
    
    const baseUrl = explorers[network.toLowerCase()] || 'https://etherscan.io/tx/';
    return `${baseUrl}${txHash}`;
  };

  // Format date with time
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
      case 'paid':
        variant = "default";
        break;
      case 'failed':
      case 'expired':
      case 'invalid':
      case 'canceled':
        variant = "destructive";
        break;
      default:
        variant = "outline";
    }
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-64">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>Failed to load crypto transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/crypto-transactions'] })}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Crypto Transactions</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Manage and monitor all cryptocurrency transactions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions && filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Bitcoin className="h-4 w-4 mr-2 text-primary" />
                        <span className="truncate max-w-[140px]">{transaction.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.username || transaction.userId}
                    </TableCell>
                    <TableCell>{transaction.currency}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{transaction.amount} {transaction.currency}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(transaction.amountInFiat)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{transaction.type}</TableCell>
                    <TableCell>{renderStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      {transaction.propertyName || 
                        (transaction.propertyId ? `Property #${transaction.propertyId}` : 'N/A')}
                    </TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleShowDetails(transaction)}>
                            View Details
                          </DropdownMenuItem>
                          {transaction.txHash && (
                            <DropdownMenuItem
                              onClick={() => window.open(getBlockExplorerUrl(transaction.txHash!, transaction.network), '_blank')}
                            >
                              View on Blockchain
                            </DropdownMenuItem>
                          )}
                          {transaction.status !== 'completed' && transaction.status !== 'confirmed' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  handleStatusUpdate('completed');
                                }}
                              >
                                Mark as Completed
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                    {searchTerm ? 'No transactions found matching your search' : 'No crypto transactions available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Detailed information about this cryptocurrency transaction
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Transaction ID</h3>
                  <p className="text-sm break-all">{selectedTransaction.id}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Status</h3>
                  <div>{renderStatusBadge(selectedTransaction.status)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Amount</h3>
                  <p className="text-sm">
                    {selectedTransaction.amount} {selectedTransaction.currency} 
                    <span className="text-muted-foreground ml-1">
                      ({formatCurrency(selectedTransaction.amountInFiat)})
                    </span>
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Type</h3>
                  <p className="text-sm capitalize">{selectedTransaction.type}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">User</h3>
                  <p className="text-sm">
                    {selectedTransaction.username ? `${selectedTransaction.username} (ID: ${selectedTransaction.userId})` : `User ID: ${selectedTransaction.userId}`}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Property</h3>
                  <p className="text-sm">
                    {selectedTransaction.propertyName || 
                      (selectedTransaction.propertyId ? `Property #${selectedTransaction.propertyId}` : 'N/A')}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Created At</h3>
                  <p className="text-sm">{formatDate(selectedTransaction.createdAt)}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Confirmed At</h3>
                  <p className="text-sm">
                    {selectedTransaction.confirmedAt ? formatDate(selectedTransaction.confirmedAt) : 'Not confirmed yet'}
                  </p>
                </div>
              </div>
              
              {selectedTransaction.txHash && (
                <div>
                  <h3 className="font-medium mb-1">Transaction Hash</h3>
                  <div className="flex items-center">
                    <p className="text-sm font-mono break-all mr-2 text-muted-foreground">
                      {selectedTransaction.txHash}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(getBlockExplorerUrl(selectedTransaction.txHash!, selectedTransaction.network), '_blank')}
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      View on {selectedTransaction.network}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex items-center justify-between">
              <div className="flex space-x-2">
                {selectedTransaction.status !== 'completed' && selectedTransaction.status !== 'confirmed' && (
                  <Button 
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </Button>
                )}
                {selectedTransaction.status !== 'failed' && selectedTransaction.status !== 'canceled' && (
                  <Button 
                    variant="destructive" 
                    onClick={() => handleStatusUpdate('failed')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Mark as Failed
                  </Button>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsDetailsOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CryptoTransactions;