import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface BlockchainTransactionExampleProps {
  propertyId: number;
  investmentId: string;
  transactionHash: string;
}

export function BlockchainTransactionExample({
  propertyId,
  investmentId,
  transactionHash
}: BlockchainTransactionExampleProps) {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);

  // Query blockchain transaction status
  const { data: txStatus, isLoading, refetch } = useQuery({
    queryKey: ['/api/blockchain/transaction', transactionHash],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/blockchain/transaction/${transactionHash}`);
      return res.json();
    },
    enabled: !!transactionHash,
    refetchInterval: 15000 // Poll every 15 seconds
  });

  // Verify investment on blockchain
  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/blockchain/verify-investment`, {
        propertyId,
        investmentId,
        transactionHash
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Investment verified on blockchain',
        description: `Transaction confirmed with ${data.confirmations} confirmations`,
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Verification failed',
        description: error.message || 'Failed to verify investment on blockchain',
        variant: 'destructive',
      });
    }
  });

  // Get transaction status
  const getStatusIndicator = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    
    if (!txStatus) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    
    switch (txStatus.status) {
      case 'confirmed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  // Format blockchain data for display
  const formatBlockchainData = () => {
    if (!txStatus) return "No blockchain data available";
    
    return (
      <div className="space-y-2 font-mono text-xs">
        <div><span className="font-bold">Transaction:</span> {transactionHash.substring(0, 8)}...{transactionHash.substring(transactionHash.length - 8)}</div>
        <div><span className="font-bold">Status:</span> {txStatus.status}</div>
        <div><span className="font-bold">Confirmations:</span> {txStatus.confirmations || 0}</div>
        <div><span className="font-bold">Block:</span> {txStatus.blockNumber || 'Pending'}</div>
        {txStatus.tokenAmount && (
          <div><span className="font-bold">Tokens:</span> {txStatus.tokenAmount} PROP</div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Blockchain Status</CardTitle>
            <CardDescription>Smart contract transaction details</CardDescription>
          </div>
          {getStatusIndicator()}
        </div>
      </CardHeader>
      <CardContent>
        {showDetails ? (
          formatBlockchainData()
        ) : (
          <div className="text-sm">
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Checking blockchain status...
              </div>
            ) : txStatus?.status === 'confirmed' ? (
              <div className="text-green-600 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Investment verified on blockchain
              </div>
            ) : (
              <div className="text-yellow-600">
                Transaction pending confirmation on blockchain
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={() => verifyMutation.mutate()}
          disabled={verifyMutation.isPending || txStatus?.status === 'confirmed'}
        >
          {verifyMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Verify on Blockchain
        </Button>
      </CardFooter>
    </Card>
  );
}