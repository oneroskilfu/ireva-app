import React from 'react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  PlusCircle, 
  ArrowUpRight, 
  RefreshCcw 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import WalletFundForm from './WalletFundForm';
import WalletWithdrawForm from './WalletWithdrawForm';

interface WalletCardProps {
  className?: string;
}

export default function WalletCard({ className }: WalletCardProps) {
  const { toast } = useToast();
  const [refreshing, setRefreshing] = React.useState(false);
  const [showFundDialog, setShowFundDialog] = React.useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = React.useState(false);

  const { data: wallet, isLoading, refetch } = useQuery({
    queryKey: ['/api/wallet'],
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    
    toast({
      title: "Wallet Refreshed",
      description: "Your wallet balance has been updated.",
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Wallet Balance</CardTitle>
            <CardDescription>Manage your account balance</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">₦</span>
              <span className="text-4xl font-extrabold tracking-tighter">
                {wallet?.balance?.toLocaleString() || '0'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Available balance
            </p>
          </div>
        )}
      </CardContent>
      <Separator />
      <CardFooter className="pt-4 flex flex-col gap-3">
        <div className="flex w-full gap-2">
          <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
            <DialogTrigger asChild>
              <Button className="flex-1 gap-1">
                <PlusCircle className="h-4 w-4" />
                Fund Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Fund Your Wallet</DialogTitle>
                <DialogDescription>
                  Add funds to your wallet to start investing in properties.
                </DialogDescription>
              </DialogHeader>
              <WalletFundForm 
                onSuccess={() => {
                  setShowFundDialog(false);
                  refetch();
                  toast({
                    title: "Wallet Funded",
                    description: "Your wallet has been funded successfully.",
                  });
                }}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 gap-1">
                <ArrowUpRight className="h-4 w-4" />
                Withdraw
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription>
                Withdraw funds from your wallet to your bank account.
              </DialogDescription>
            </DialogHeader>
            <WalletWithdrawForm 
              onSuccess={() => {
                setShowWithdrawDialog(false);
                refetch();
                toast({
                  title: "Withdrawal Requested",
                  description: "Your withdrawal request has been submitted and is being processed.",
                });
              }}
              currentBalance={wallet?.balance || 0}
            />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}