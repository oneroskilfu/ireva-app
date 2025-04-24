import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { CryptoPaymentModal } from '@/components/CryptoPaymentModal';
import { useAuth } from '@/hooks/use-auth';
import { 
  CreditCard, 
  Wallet, 
  Building2, 
  ArrowRight,
  Loader2
} from 'lucide-react';

interface Property {
  id: number;
  name: string;
  minimumInvestment: number;
  targetReturn: string;
  [key: string]: any;
}

interface PropertyPaymentOptionsProps {
  property: Property;
  onInvestmentSuccess?: () => void;
}

export function PropertyPaymentOptions({ 
  property, 
  onInvestmentSuccess 
}: PropertyPaymentOptionsProps) {
  const [amount, setAmount] = useState<string>(property.minimumInvestment.toString());
  const [units, setUnits] = useState<number>(1);
  const { toast } = useToast();
  const { user } = useAuth();

  // Calculate units based on amount
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    
    // Calculate units based on minimum investment
    if (newAmount && !isNaN(Number(newAmount)) && property.minimumInvestment) {
      const calculatedUnits = Math.floor(Number(newAmount) / property.minimumInvestment);
      setUnits(calculatedUnits > 0 ? calculatedUnits : 1);
    } else {
      setUnits(1);
    }
  };

  // Investment mutation for traditional payment methods
  const investMutation = useMutation({
    mutationFn: async (paymentMethod: string) => {
      return await apiRequest('POST', '/api/investments', {
        propertyId: property.id,
        amount: Number(amount),
        paymentMethod,
        units
      });
    },
    onSuccess: () => {
      toast({
        title: 'Investment successful',
        description: `You have successfully invested ₦${amount} in ${property.name}`,
      });
      
      // Invalidate investments query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
      
      if (onInvestmentSuccess) {
        onInvestmentSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Investment failed',
        description: error.message || 'There was an error processing your investment',
        variant: 'destructive',
      });
    }
  });

  // Handlers for traditional payment methods
  const handleCardPayment = () => {
    investMutation.mutate('card');
  };

  const handleWalletPayment = () => {
    investMutation.mutate('wallet');
  };

  const handleBankTransfer = () => {
    investMutation.mutate('bank_transfer');
  };

  // Handler for investment success via crypto
  const handleCryptoSuccess = () => {
    // Invalidate investments query to refresh data
    queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
    
    if (onInvestmentSuccess) {
      onInvestmentSuccess();
    }
  };

  // Check if user is authenticated
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Options</CardTitle>
          <CardDescription>Sign in to invest in this property</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">
            Sign In to Invest <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Invest in {property.name}</CardTitle>
        <CardDescription>
          Choose your investment amount and payment method
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="investment-amount">Investment Amount (₦)</Label>
            <Input
              id="investment-amount"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              min={property.minimumInvestment}
              step={property.minimumInvestment}
            />
            <p className="text-sm text-muted-foreground">
              Minimum investment: ₦{property.minimumInvestment.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Investment Units</Label>
            <div className="text-2xl font-bold">{units} unit{units !== 1 ? 's' : ''}</div>
            <p className="text-sm text-muted-foreground">
              Expected annual return: {property.targetReturn}%
            </p>
          </div>

          <Tabs defaultValue="card" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="card">
                <CreditCard className="h-4 w-4 mr-2" /> Card
              </TabsTrigger>
              <TabsTrigger value="wallet">
                <Wallet className="h-4 w-4 mr-2" /> Wallet
              </TabsTrigger>
              <TabsTrigger value="bank">
                <Building2 className="h-4 w-4 mr-2" /> Bank
              </TabsTrigger>
              <TabsTrigger value="crypto">
                Crypto
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="card" className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm">
                  Pay with your debit or credit card securely.
                </p>
              </div>
              <Button 
                onClick={handleCardPayment} 
                className="w-full"
                disabled={investMutation.isPending}
              >
                {investMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Proceed with Card Payment
              </Button>
            </TabsContent>
            
            <TabsContent value="wallet" className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm">
                  Pay using your iREVA wallet balance.
                </p>
              </div>
              <Button 
                onClick={handleWalletPayment} 
                className="w-full"
                disabled={investMutation.isPending}
              >
                {investMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Pay from Wallet
              </Button>
            </TabsContent>
            
            <TabsContent value="bank" className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm">
                  Make a direct bank transfer to our account.
                </p>
              </div>
              <Button 
                onClick={handleBankTransfer} 
                className="w-full"
                disabled={investMutation.isPending}
              >
                {investMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Proceed with Bank Transfer
              </Button>
            </TabsContent>
            
            <TabsContent value="crypto" className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm">
                  Pay with Bitcoin, Ethereum, or other cryptocurrencies.
                </p>
              </div>
              <CryptoPaymentModal
                propertyId={property.id}
                amount={amount}
                units={units}
                onPaymentSuccess={handleCryptoSuccess}
                buttonText="Pay with Cryptocurrency"
                buttonVariant="default"
                buttonSize="default"
              />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}