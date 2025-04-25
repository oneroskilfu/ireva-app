import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, QrCode, Copy, ExternalLink, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface CryptoPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (paymentId: string) => void;
}

interface CryptoPaymentData {
  id: string;
  status: string;
  price_amount: number;
  price_currency: string;
  receive_amount: number;
  receive_currency: string;
  payment_url: string;
  payment_address?: string;
  created_at: string;
  expires_at?: string;
  order_id: string;
}

const CryptoPayment = ({ isOpen, onClose, onSuccess }: CryptoPaymentProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USDT');
  const [propertyId, setPropertyId] = useState<string>('');
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'waiting' | 'completed' | 'failed'>('form');
  const [paymentData, setPaymentData] = useState<CryptoPaymentData | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  
  // Fetch supported cryptocurrencies
  const { data: currencies } = useQuery<{ currencies: string[] }>({
    queryKey: ['/api/crypto/supported-currencies'],
    enabled: isOpen,
  });

  // Fetch payment status if we have paymentData
  const { data: paymentStatus, refetch: refetchStatus } = useQuery<{ status: string }>({
    queryKey: ['/api/crypto/payment-status', paymentData?.id],
    enabled: !!paymentData?.id && paymentStep === 'waiting',
    refetchInterval: 10000, // Check every 10 seconds
  });

  // Set up countdown timer when waiting for payment
  useEffect(() => {
    if (paymentStep === 'waiting' && paymentData?.expires_at) {
      const expiryTime = new Date(paymentData.expires_at).getTime();
      const updateCountdown = () => {
        const now = new Date().getTime();
        const timeLeft = Math.max(0, Math.floor((expiryTime - now) / 1000));
        setCountdown(timeLeft);
        
        if (timeLeft <= 0) {
          clearInterval(timer);
          setPaymentStep('failed');
          toast({
            title: 'Payment Expired',
            description: 'The payment time has expired. Please try again.',
            variant: 'destructive',
          });
        }
      };
      
      updateCountdown();
      const timer = setInterval(updateCountdown, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentStep, paymentData, toast]);

  // Check payment status changes
  useEffect(() => {
    if (paymentStatus) {
      if (paymentStatus.status === 'completed') {
        setPaymentStep('completed');
        if (onSuccess && paymentData) {
          onSuccess(paymentData.id);
        }
        toast({
          title: 'Payment Successful',
          description: 'Your crypto payment has been completed successfully.',
        });
      } else if (['failed', 'expired', 'canceled'].includes(paymentStatus.status)) {
        setPaymentStep('failed');
        toast({
          title: 'Payment Failed',
          description: `Your payment was ${paymentStatus.status}. Please try again.`,
          variant: 'destructive',
        });
      }
    }
  }, [paymentStatus, onSuccess, paymentData, toast]);

  // Create a new crypto payment
  const handleCreatePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setPaymentStep('processing');
      
      const response = await apiRequest('POST', '/api/crypto/create-crypto-payment', {
        amount: parseFloat(amount),
        currency,
        propertyId: parseInt(propertyId) || 1, // Default to property ID 1 if not specified
      });
      
      const data = await response.json();
      
      if (data.success && data.payment) {
        setPaymentData(data.payment);
        setPaymentStep('waiting');
      } else {
        throw new Error(data.message || 'Failed to create payment');
      }
    } catch (error: any) {
      console.error('Create crypto payment error:', error);
      setPaymentStep('failed');
      toast({
        title: 'Payment Creation Failed',
        description: error.message || 'There was an error creating your crypto payment.',
        variant: 'destructive',
      });
    }
  };

  // Format countdown time
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'The address has been copied to your clipboard.',
    });
  };

  // Reset the form
  const resetForm = () => {
    setAmount('');
    setCurrency('USDT');
    setPropertyId('');
    setPaymentStep('form');
    setPaymentData(null);
  };

  // Handle dialog close
  const handleClose = () => {
    if (paymentStep === 'completed') {
      // Invalidate crypto payments query
      queryClient.invalidateQueries({ queryKey: ['/api/crypto/payments'] });
      
      // Also invalidate wallet balance query
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
    }
    
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Pay with Cryptocurrency</DialogTitle>
          <DialogDescription>
            {paymentStep === 'form' && "Complete your payment using cryptocurrency."}
            {paymentStep === 'processing' && "Creating your payment..."}
            {paymentStep === 'waiting' && "Please send the exact amount to complete your payment."}
            {paymentStep === 'completed' && "Your payment has been successfully processed."}
            {paymentStep === 'failed' && "There was a problem with your payment."}
          </DialogDescription>
        </DialogHeader>

        {paymentStep === 'form' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                placeholder="Enter amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Select Cryptocurrency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies?.currencies.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  )) || (
                    <>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the cryptocurrency you want to use for this payment.
              </p>
            </div>
            
            <DialogFooter>
              <Button onClick={handleCreatePayment}>Continue with Payment</Button>
            </DialogFooter>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-center">Creating your payment...</p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              This may take a few moments.
            </p>
          </div>
        )}

        {paymentStep === 'waiting' && paymentData && (
          <div className="py-4">
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Send Payment</CardTitle>
                <CardDescription>
                  Time remaining: <span className="font-mono">{formatCountdown(countdown)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center mb-4">
                  {paymentData.payment_address ? (
                    <>
                      <div className="bg-white p-3 rounded">
                        <QrCode size={180} />
                      </div>
                      <p className="text-sm text-center mt-2">
                        Scan this QR code with your wallet app
                      </p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="mb-2"
                        onClick={() => window.open(paymentData.payment_url, '_blank')}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Payment Page
                      </Button>
                      <p className="text-sm text-center">
                        You'll be redirected to CoinGate to complete your payment
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">
                        {paymentData.price_amount} {paymentData.price_currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Receive:</span>
                      <span className="font-medium">
                        {paymentData.receive_amount} {paymentData.receive_currency}
                      </span>
                    </div>
                    
                    {paymentData.payment_address && (
                      <div className="pt-2">
                        <Label className="text-xs">Payment Address</Label>
                        <div className="flex mt-1">
                          <Input
                            readOnly
                            value={paymentData.payment_address}
                            className="text-xs font-mono"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => copyToClipboard(paymentData.payment_address || '')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => refetchStatus()}>
                  <Clock className="mr-2 h-4 w-4" />
                  Check Status
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => window.open(paymentData.payment_url, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on CoinGate
                </Button>
              </CardFooter>
            </Card>
            
            <div className="text-sm space-y-2 text-muted-foreground">
              <p className="flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                Send the exact amount shown. Sending incorrect amounts may result in lost funds.
              </p>
              <p className="flex items-start">
                <Clock className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                Payment must be completed before the timer expires.
              </p>
            </div>
          </div>
        )}

        {paymentStep === 'completed' && (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Payment Successful!</h3>
            <p className="text-center text-muted-foreground mb-6">
              Your payment has been confirmed and processed successfully.
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        )}

        {paymentStep === 'failed' && (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Payment Failed</h3>
            <p className="text-center text-muted-foreground mb-6">
              There was a problem with your payment. Please try again.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetForm}>Try Again</Button>
              <Button variant="destructive" onClick={handleClose}>Cancel</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CryptoPayment;