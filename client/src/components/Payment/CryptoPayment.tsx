import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Loader2, 
  Check, 
  AlertCircle, 
  Clock, 
  Info, 
  ExternalLink, 
  Copy,
  RefreshCw, 
  QrCode,
  Wallet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

enum PaymentStatus {
  CREATING = 'creating',
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

interface CryptoPaymentProps {
  propertyId: number;
  investmentAmount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const CryptoPayment: React.FC<CryptoPaymentProps> = ({ 
  propertyId, 
  investmentAmount, 
  onSuccess, 
  onCancel 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.CREATING);
  const [activeTab, setActiveTab] = useState<string>('usdc');
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes in seconds
  const [transactionId, setTransactionId] = useState<string | null>(null);
  
  // Create a payment
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/crypto-payments/create', {
        propertyId,
        amount: investmentAmount,
        currency: activeTab.toUpperCase(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setTransactionId(data.id);
      setPaymentStatus(PaymentStatus.PENDING);
      toast({
        title: "Payment created",
        description: "Please complete the payment by sending crypto to the provided address",
      });
    },
    onError: (error: Error) => {
      setPaymentStatus(PaymentStatus.FAILED);
      toast({
        title: "Failed to create payment",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Fetch payment details
  const { data: paymentDetails, refetch: refetchPayment } = useQuery({
    queryKey: ['/api/crypto-payments', transactionId],
    queryFn: async () => {
      if (!transactionId) return null;
      
      const response = await apiRequest('GET', `/api/crypto-payments/${transactionId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch payment details');
      }
      
      return response.json();
    },
    enabled: !!transactionId,
    refetchInterval: paymentStatus !== PaymentStatus.CONFIRMED && paymentStatus !== PaymentStatus.FAILED ? 5000 : false,
  });

  // Create the payment when the component mounts
  useEffect(() => {
    if (paymentStatus === PaymentStatus.CREATING) {
      createPaymentMutation.mutate();
    }
  }, []);

  // Update payment status based on the payment details
  useEffect(() => {
    if (paymentDetails) {
      if (paymentDetails.status === 'confirmed' || paymentDetails.status === 'completed') {
        setPaymentStatus(PaymentStatus.CONFIRMED);
        // Create the investment
        createInvestmentFromPayment();
      } else if (paymentDetails.status === 'pending' || paymentDetails.status === 'waiting') {
        setPaymentStatus(PaymentStatus.PENDING);
      } else if (paymentDetails.status === 'expired') {
        setPaymentStatus(PaymentStatus.EXPIRED);
      } else if (paymentDetails.status === 'failed') {
        setPaymentStatus(PaymentStatus.FAILED);
      }
    }
  }, [paymentDetails]);

  // Set up a countdown timer
  useEffect(() => {
    if (paymentStatus === PaymentStatus.PENDING && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && paymentStatus === PaymentStatus.PENDING) {
      setPaymentStatus(PaymentStatus.EXPIRED);
    }
  }, [timeLeft, paymentStatus]);

  // Create investment after successful payment
  const createInvestmentFromPayment = async () => {
    try {
      if (!transactionId) return;
      
      const response = await apiRequest('POST', '/api/investments/crypto', {
        paymentId: transactionId,
        propertyId,
        amount: investmentAmount
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create investment');
      }
      
      // Invalidate investments query to refresh the user's investments
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
      
      toast({
        title: "Investment successful",
        description: "Your investment has been processed successfully!",
      });
      
      // Call the onSuccess callback
      onSuccess();
    } catch (error) {
      toast({
        title: "Failed to process investment",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  // Format the time left for display
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description: "Address copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Failed to copy",
        description: "Please copy the address manually",
        variant: "destructive",
      });
    });
  };

  // Render appropriate UI based on payment status
  const renderPaymentUI = () => {
    if (paymentStatus === PaymentStatus.CREATING || !paymentDetails) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Creating payment...</p>
          <p className="text-sm text-muted-foreground">Please wait while we set up your payment</p>
        </div>
      );
    }

    if (paymentStatus === PaymentStatus.CONFIRMED) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="bg-green-100 p-3 rounded-full mb-4">
            <Check className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Payment Confirmed!</h3>
          <p className="text-center text-muted-foreground mb-6">
            Your payment has been confirmed and your investment is being processed.
          </p>
          <Button onClick={onSuccess}>
            View My Investments
          </Button>
        </div>
      );
    }

    if (paymentStatus === PaymentStatus.FAILED) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Payment Failed</h3>
          <p className="text-center text-muted-foreground mb-6">
            There was an issue processing your payment. Please try again or contact support.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => {
              setPaymentStatus(PaymentStatus.CREATING);
              createPaymentMutation.mutate();
            }}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    if (paymentStatus === PaymentStatus.EXPIRED) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="bg-amber-100 p-3 rounded-full mb-4">
            <Clock className="h-12 w-12 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Payment Time Expired</h3>
          <p className="text-center text-muted-foreground mb-6">
            The payment time has expired. Please try again with a new payment.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => {
              setTimeLeft(900);
              setPaymentStatus(PaymentStatus.CREATING);
              createPaymentMutation.mutate();
            }}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    // Pending payment UI
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center">
          <div className="mb-4 border border-yellow-300 bg-yellow-50 p-3 rounded-lg w-full">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Time remaining: {formatTimeLeft()}</p>
                <p className="text-xs text-yellow-700">
                  Please complete the payment before the timer expires.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium">Send {activeTab.toUpperCase()}</h3>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-medium">{paymentDetails.cryptoAmount} {activeTab.toUpperCase()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Network:</span>
                  <span className="font-medium">{paymentDetails.network || "Ethereum"}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Rate:</span>
                  <span className="font-medium">1 {activeTab.toUpperCase()} = ₦{paymentDetails.rate}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Address:</label>
                <div className="flex items-center gap-2">
                  <div className="bg-muted px-3 py-2 rounded-lg text-sm font-mono flex-1 truncate">
                    {paymentDetails.address}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(paymentDetails.address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {paymentDetails.explorerUrl && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => window.open(paymentDetails.explorerUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Blockchain Explorer
                </Button>
              )}
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              {paymentDetails.qrCode ? (
                <img 
                  src={paymentDetails.qrCode} 
                  alt="Payment QR Code" 
                  className="w-48 h-48 object-contain"
                />
              ) : (
                <div className="w-48 h-48 bg-muted flex items-center justify-center">
                  <QrCode className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Scan with your wallet app to make payment
            </p>
          </div>
        </div>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Payment Instructions</AlertTitle>
          <AlertDescription>
            <ol className="mt-2 space-y-1 text-sm list-decimal list-inside">
              <li>Send exactly {paymentDetails.cryptoAmount} {activeTab.toUpperCase()} to the address above</li>
              <li>Make sure to use the {paymentDetails.network || "Ethereum"} network</li>
              <li>Wait for the blockchain to confirm your transaction</li>
              <li>Do not close this page until payment is complete</li>
            </ol>
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col xs:flex-row gap-4 justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => refetchPayment()}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Payment Status
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Pay with Cryptocurrency</CardTitle>
        <CardDescription>
          Complete your investment using cryptocurrency
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {paymentStatus === PaymentStatus.CREATING || paymentStatus === PaymentStatus.CONFIRMED || 
         paymentStatus === PaymentStatus.FAILED || paymentStatus === PaymentStatus.EXPIRED ? (
          renderPaymentUI()
        ) : (
          <div className="space-y-6">
            <Tabs 
              defaultValue="usdc" 
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value);
                setPaymentStatus(PaymentStatus.CREATING);
                setTimeout(() => createPaymentMutation.mutate(), 100);
              }}
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="usdc">USDC</TabsTrigger>
                <TabsTrigger value="usdt">USDT</TabsTrigger>
                <TabsTrigger value="eth">ETH</TabsTrigger>
              </TabsList>
              
              <TabsContent value="usdc" className="pt-4">
                {renderPaymentUI()}
              </TabsContent>
              
              <TabsContent value="usdt" className="pt-4">
                {renderPaymentUI()}
              </TabsContent>
              
              <TabsContent value="eth" className="pt-4">
                {renderPaymentUI()}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      
      {paymentStatus !== PaymentStatus.CONFIRMED && (
        <CardFooter className="flex-col space-y-2 items-start">
          <div className="flex items-center text-xs text-muted-foreground">
            <Wallet className="w-3 h-3 mr-1" />
            <span>Secured by iREVA Crypto Payment Processor</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default CryptoPayment;