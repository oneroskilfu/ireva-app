import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Copy, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import QRCode from 'react-qr-code';
import { Steps, Step, StepIndicator, StepSeparator, StepTitle, StepDescription } from "@/components/ui/steps";

interface CryptoPaymentProps {
  paymentData: {
    id: string;
    walletAddress: string;
    amount: number;
    amountInCrypto: string;
    network: string;
    currency: string;
    status: string;
    expiresAt: string;
  };
  property: {
    id: number;
    name: string;
  };
  amount: number;
  onSuccess: () => void;
}

const CryptoPayment: React.FC<CryptoPaymentProps> = ({ paymentData, property, amount, onSuccess }) => {
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState(paymentData.status || 'pending');
  const [isPolling, setIsPolling] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(paymentData.network);
  const [countdown, setCountdown] = useState('');
  
  // Format the wallet address for display (first 6 chars + ... + last 4 chars)
  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Copy wallet address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };
  
  // Start polling for payment status updates
  useEffect(() => {
    if (paymentStatus === 'pending' && paymentData.id && !isPolling) {
      setIsPolling(true);
      const intervalId = setInterval(async () => {
        try {
          const response = await apiRequest('GET', `/api/crypto-payments/${paymentData.id}/status`);
          const data = await response.json();
          
          setPaymentStatus(data.status);
          
          if (data.status === 'completed') {
            clearInterval(intervalId);
            setActiveStep(3);
            toast({
              title: "Payment Confirmed",
              description: "Your cryptocurrency payment has been confirmed!",
            });
            setTimeout(() => {
              onSuccess();
            }, 2000);
          } else if (data.status === 'failed') {
            clearInterval(intervalId);
            toast({
              title: "Payment Failed",
              description: "Your cryptocurrency payment has failed. Please try again.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 10000); // Poll every 10 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [paymentData.id, paymentStatus, isPolling, onSuccess, toast]);
  
  // Calculate and update countdown timer
  useEffect(() => {
    if (!paymentData.expiresAt) return;
    
    const updateCountdown = () => {
      const now = new Date();
      const expiryTime = new Date(paymentData.expiresAt);
      const diff = expiryTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown('Expired');
        setPaymentStatus('expired');
        return;
      }
      
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${minutes}m ${seconds}s`);
    };
    
    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(intervalId);
  }, [paymentData.expiresAt]);
  
  // When the user selects a different network, update the wallet address
  const handleNetworkChange = (network: string) => {
    setSelectedNetwork(network);
    // In a real implementation, you might need to fetch a new wallet address for the selected network
    // For now, we'll just simulate the change
    toast({
      title: "Network Changed",
      description: `Switched to ${network.toUpperCase()} network`,
    });
  };
  
  // Get explorer URL based on network and transaction hash
  const getExplorerUrl = (network: string, txHash: string) => {
    if (!txHash) return '#';
    
    switch (network.toLowerCase()) {
      case 'ethereum':
        return `https://etherscan.io/tx/${txHash}`;
      case 'polygon':
        return `https://polygonscan.com/tx/${txHash}`;
      case 'binance':
        return `https://bscscan.com/tx/${txHash}`;
      case 'solana':
        return `https://solscan.io/tx/${txHash}`;
      case 'avalanche':
        return `https://snowtrace.io/tx/${txHash}`;
      default:
        return '#';
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Pay with Cryptocurrency</CardTitle>
          <CardDescription>
            Invest in {property.name} using cryptocurrency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Steps activeStep={activeStep} className="mb-8">
            <Step title="Create Payment" description="Payment request generated" />
            <Step title="Send Funds" description="Transfer cryptocurrency to the provided address" />
            <Step title="Confirm Payment" description="Wait for blockchain confirmation" />
            <Step title="Complete Investment" description="Investment will be recorded once confirmed" />
          </Steps>
          
          {paymentStatus === 'pending' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Payment Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">${amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Crypto Amount:</span>
                      <span className="font-medium">{paymentData.amountInCrypto} {paymentData.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network:</span>
                      <span className="font-medium">{selectedNetwork}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time Remaining:</span>
                      <span className="font-medium">{countdown}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Select Network</h3>
                  <Tabs defaultValue={selectedNetwork} onValueChange={handleNetworkChange}>
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
                      <TabsTrigger value="polygon">Polygon</TabsTrigger>
                      <TabsTrigger value="binance">Binance</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Send {paymentData.currency} to this address:</h3>
                  <div className="flex items-center justify-between bg-secondary/30 p-3 rounded-lg">
                    <code className="text-sm font-mono">{paymentData.walletAddress}</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard(paymentData.walletAddress)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-amber-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Only send {paymentData.currency} on the {selectedNetwork} network!
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCode
                    value={paymentData.walletAddress}
                    size={200}
                    level="M"
                    fgColor="#000000"
                    bgColor="#FFFFFF"
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Scan this QR code with your wallet app to make the payment
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setIsPolling(false); // Reset polling so it starts again
                    toast({
                      title: "Checking payment status",
                      description: "Please wait while we check for your transaction...",
                    });
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Payment Status
                </Button>
              </div>
            </div>
          )}
          
          {paymentStatus === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-medium mb-2">Processing Your Payment</h3>
              <p className="text-muted-foreground mb-4">
                We've detected your transaction and are waiting for blockchain confirmation.
                This typically takes 1-2 minutes.
              </p>
              <div className="flex justify-center">
                <Button variant="outline" className="mr-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Status
                </Button>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Explorer
                </Button>
              </div>
            </div>
          )}
          
          {paymentStatus === 'completed' && (
            <div className="text-center py-8">
              <div className="bg-green-100 dark:bg-green-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground mb-4">
                Your investment of ${amount.toFixed(2)} in {property.name} has been confirmed.
              </p>
              <Button onClick={onSuccess}>View My Investments</Button>
            </div>
          )}
          
          {paymentStatus === 'expired' && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
              <h3 className="text-xl font-medium mb-2">Payment Time Expired</h3>
              <p className="text-muted-foreground mb-4">
                The payment window has expired. Please start a new payment request.
              </p>
              <Button variant="default">
                Try Again
              </Button>
            </div>
          )}
          
          {paymentStatus === 'failed' && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-xl font-medium mb-2">Payment Failed</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't process your payment. This might be due to network congestion or insufficient funds.
              </p>
              <Button variant="default">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="w-full border-t pt-4 text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Important:</strong> Only send {paymentData.currency} on the {selectedNetwork} network to this address.
            </p>
            <p>
              Sending any other token or using a different network may result in permanent loss of funds.
            </p>
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">FAQ - Cryptocurrency Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">How long does it take to confirm my payment?</h4>
            <p className="text-sm text-muted-foreground">
              Confirmation times vary by network. Ethereum typically takes 1-5 minutes, Polygon 30-60 seconds, and Binance Smart Chain 15-60 seconds.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">What happens if I send the wrong amount?</h4>
            <p className="text-sm text-muted-foreground">
              If you send less than the required amount, your payment will not be processed. If you send more, the excess will be used to increase your investment amount.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Is there a transaction fee?</h4>
            <p className="text-sm text-muted-foreground">
              The platform does not charge additional fees for crypto payments, but you'll need to pay network gas fees when sending your transaction.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">I sent my payment but it's not showing up. What should I do?</h4>
            <p className="text-sm text-muted-foreground">
              Blockchain transactions can sometimes take longer during periods of network congestion. Click "Check Payment Status" to refresh. If your payment doesn't appear after 30 minutes, please contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CryptoPayment;