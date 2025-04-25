import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Check, ExternalLink, LayoutTemplate, QrCode } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import QRCode from 'react-qr-code';

interface SupportedCurrency {
  code: string;
  name: string;
  network: string;
}

interface Payment {
  paymentId: string;
  userId: string;
  propertyId: number;
  walletAddress: string;
  amount: string;
  amountInCrypto: string;
  currency: string;
  units: number;
  status: string;
  expiresAt: string;
  createdAt: string;
  hostedUrl?: string; // URL for CoinGate hosted payment page
}

interface PaymentStatus {
  paymentId: string;
  status: string;
  confirmations: number;
  txHash: string;
}

interface CryptoPaymentProps {
  propertyId: number;
  amount: string; // Amount in USD
  units: number;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export default function CryptoPayment({ 
  propertyId, 
  amount, 
  units, 
  onPaymentSuccess, 
  onCancel 
}: CryptoPaymentProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [payment, setPayment] = useState<Payment | null>(null);
  const [txHash, setTxHash] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch supported cryptocurrencies
  const { data: currencies, isLoading: isLoadingCurrencies } = useQuery({
    queryKey: ['/api/crypto-payments/supported-currencies'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/crypto-payments/supported-currencies');
      return res.json() as Promise<SupportedCurrency[]>;
    }
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/crypto-payments', {
        propertyId,
        amount,
        currency: selectedCurrency,
        units
      });
      return res.json() as Promise<Payment>;
    },
    onSuccess: (data) => {
      setPayment(data);
      setIsPolling(true);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating payment',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/crypto-payments/${payment?.paymentId}/process`, {
        txHash
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Payment processed successfully',
        description: 'Your investment has been recorded',
      });
      onPaymentSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error processing payment',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Poll payment status
  const { data: paymentStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/crypto-payments', payment?.paymentId],
    queryFn: async () => {
      if (!payment) return null;
      const res = await apiRequest('GET', `/api/crypto-payments/${payment.paymentId}`);
      return res.json() as Promise<PaymentStatus>;
    },
    enabled: !!payment && isPolling,
    refetchInterval: isPolling ? 10000 : false, // Poll every 10 seconds
  });

  // Check if payment is complete and stop polling
  useEffect(() => {
    if (paymentStatus && (paymentStatus.status === 'completed' || paymentStatus.status === 'confirmed')) {
      setIsPolling(false);
      onPaymentSuccess();
    } else if (paymentStatus && paymentStatus.status === 'failed') {
      setIsPolling(false);
      toast({
        title: 'Payment failed',
        description: 'Please try again or use a different payment method',
        variant: 'destructive',
      });
    }
  }, [paymentStatus, onPaymentSuccess, toast]);

  // Handler for currency selection
  const handleCurrencySelect = (value: string) => {
    setSelectedCurrency(value);
  };

  // Handler for creating payment
  const handleCreatePayment = () => {
    if (!selectedCurrency) {
      toast({
        title: 'Please select a cryptocurrency',
        variant: 'destructive',
      });
      return;
    }
    createPaymentMutation.mutate();
  };

  // Handler for processing payment
  const handleProcessPayment = () => {
    if (!txHash) {
      toast({
        title: 'Please enter a transaction hash',
        variant: 'destructive',
      });
      return;
    }
    processPaymentMutation.mutate();
  };

  // Handler for copying wallet address
  const handleCopyAddress = () => {
    if (payment) {
      navigator.clipboard.writeText(payment.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate time left for payment
  const getTimeLeft = () => {
    if (!payment) return '24:00:00';
    
    const now = new Date();
    const expiresAt = new Date(payment.expiresAt);
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return '00:00:00';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // If no payment is created yet, show currency selection
  if (!payment) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Pay with Cryptocurrency</CardTitle>
          <CardDescription>
            Select a cryptocurrency to make your investment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                value={`$${amount}`}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Select Cryptocurrency</Label>
              {isLoadingCurrencies ? (
                <div className="flex items-center justify-center h-10">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <Select
                  value={selectedCurrency}
                  onValueChange={handleCurrencySelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies?.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.name} ({currency.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreatePayment}
            disabled={!selectedCurrency || createPaymentMutation.isPending}
          >
            {createPaymentMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Proceed
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // If payment is created, show payment details
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Payment</CardTitle>
        <CardDescription>
          Send {payment.currency} to the address below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={payment.hostedUrl ? "hosted" : "qr"}>
          <TabsList className="grid w-full grid-cols-3">
            {payment.hostedUrl && (
              <TabsTrigger value="hosted">
                <LayoutTemplate className="h-4 w-4 mr-2" /> 
                Hosted Page
              </TabsTrigger>
            )}
            <TabsTrigger value="qr">
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Copy className="h-4 w-4 mr-2" />
              Manual
            </TabsTrigger>
          </TabsList>
          
          {payment.hostedUrl && (
            <TabsContent value="hosted" className="space-y-4">
              <div className="flex justify-center py-4 border rounded-md overflow-hidden" style={{ height: "400px" }}>
                <iframe 
                  src={payment.hostedUrl} 
                  title="Crypto Payment" 
                  width="100%" 
                  height="100%" 
                  style={{ border: "none" }}
                />
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Complete your payment on the secure payment page above
                </AlertDescription>
              </Alert>
            </TabsContent>
          )}
          
          <TabsContent value="qr" className="space-y-4">
            <div className="flex justify-center py-4">
              <div className="p-4 bg-white rounded-lg">
                <QRCode
                  value={payment.walletAddress}
                  size={200}
                  level="H"
                />
              </div>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Scan this QR code with your wallet app to send {payment.amountInCrypto} {payment.currency}
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Wallet Address</Label>
              <div className="flex gap-2">
                <Input
                  id="address"
                  value={payment.walletAddress}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyAddress}
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Send</Label>
              <Input
                id="amount"
                value={`${payment.amountInCrypto} ${payment.currency}`}
                readOnly
                className="font-mono"
              />
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Send exactly {payment.amountInCrypto} {payment.currency} to the address above
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-center">
          <p className="text-muted-foreground">Time remaining: {getTimeLeft()}</p>
          <p className="text-sm mt-1">
            ${amount} = {payment.amountInCrypto} {payment.currency}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="txHash">
              Transaction Hash
              <span className="text-xs text-muted-foreground ml-1">
                (after sending payment)
              </span>
            </Label>
            <Input
              id="txHash"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x..."
              className="font-mono"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleProcessPayment}
          disabled={!txHash || processPaymentMutation.isPending}
        >
          {processPaymentMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Verify Payment
        </Button>
      </CardFooter>
    </Card>
  );
}