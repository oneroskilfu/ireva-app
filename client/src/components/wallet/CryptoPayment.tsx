import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, CopyIcon, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { QRCodeSVG } from 'qrcode.react';

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
  const [amount, setAmount] = useState<number>(100);
  const [currency, setCurrency] = useState<string>("USDT");
  const [supportedCurrencies, setSupportedCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState<CryptoPaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch supported currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await apiRequest('GET', '/api/crypto/supported-currencies');
        const data = await response.json();
        if (data.currencies && Array.isArray(data.currencies)) {
          setSupportedCurrencies(data.currencies);
        }
      } catch (error) {
        console.error('Error fetching supported currencies:', error);
      }
    };

    if (isOpen) {
      fetchCurrencies();
    }
  }, [isOpen]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // Handle dialog close
  const handleClose = () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }
    setPaymentData(null);
    setPaymentStatus("");
    onClose();
  };

  // Create a crypto payment
  const handleCreatePayment = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/crypto/create-crypto-payment', {
        amount,
        currency
      });
      const data = await response.json();
      
      if (data.success && data.payment) {
        setPaymentData(data.payment);
        setPaymentStatus(data.payment.status);
        
        // Start checking status
        const interval = setInterval(async () => {
          checkPaymentStatus(data.payment.id);
        }, 10000); // Check every 10 seconds
        
        setStatusCheckInterval(interval);
      } else {
        toast({
          title: "Payment Creation Failed",
          description: data.message || "Failed to create payment.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Payment Error",
        description: "An error occurred while creating the payment.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Check payment status
  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const response = await apiRequest('GET', `/api/crypto/payment-status/${paymentId}`);
      const data = await response.json();
      
      setPaymentStatus(data.status);
      
      // If payment is completed/confirmed/paid
      if (['paid', 'confirmed', 'complete'].includes(data.status)) {
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
        }
        
        toast({
          title: "Payment Successful",
          description: "Your crypto payment has been confirmed!",
          variant: "default"
        });
        
        if (onSuccess) {
          onSuccess(paymentId);
        }
        
        // Close the dialog after a short delay
        setTimeout(() => {
          handleClose();
        }, 3000);
      }
      
      // If payment is expired/invalid/canceled
      if (['expired', 'invalid', 'canceled'].includes(data.status)) {
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
        }
        
        toast({
          title: "Payment Failed",
          description: `Payment ${data.status}. Please try again.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  // Handle copy to clipboard
  const handleCopyAddress = () => {
    if (paymentData?.payment_address) {
      navigator.clipboard.writeText(paymentData.payment_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Address Copied",
        description: "Payment address copied to clipboard",
      });
    }
  };

  // Render payment status badge
  const renderStatusBadge = () => {
    let color = 'bg-gray-200 text-gray-800';
    
    if (['paid', 'confirmed', 'complete'].includes(paymentStatus)) {
      color = 'bg-green-100 text-green-800';
    } else if (['expired', 'invalid', 'canceled'].includes(paymentStatus)) {
      color = 'bg-red-100 text-red-800';
    } else if (['pending', 'new'].includes(paymentStatus)) {
      color = 'bg-yellow-100 text-yellow-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {paymentStatus}
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay with Cryptocurrency</DialogTitle>
          <DialogDescription>
            {!paymentData ? 
              "Enter the amount and select your preferred cryptocurrency." : 
              "Complete the payment by sending the exact amount to the provided address."
            }
          </DialogDescription>
        </DialogHeader>
        
        {!paymentData ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3">
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  min={10}
                  step={1}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">
                Currency
              </Label>
              <div className="col-span-3">
                <Select 
                  value={currency} 
                  onValueChange={setCurrency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedCurrencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            <div className="flex justify-center">
              {paymentData.payment_address && (
                <div className="flex flex-col items-center">
                  <div className="mb-4">
                    <QRCodeSVG 
                      value={paymentData.payment_address}
                      size={180}
                      level="H"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Scan QR code to pay
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Status</Label>
                {renderStatusBadge()}
              </div>
              
              <div className="flex justify-between items-center">
                <Label>Amount</Label>
                <span className="text-sm font-medium">
                  {paymentData.price_amount} {paymentData.price_currency}
                </span>
              </div>
              
              {paymentData.payment_address && (
                <div className="space-y-1">
                  <Label>Payment Address</Label>
                  <div className="flex items-center">
                    <div className="bg-muted p-2 rounded-l text-xs font-mono truncate flex-1">
                      {paymentData.payment_address}
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      className="rounded-l-none"
                      onClick={handleCopyAddress}
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <Label>Expires At</Label>
                <div className="text-sm font-medium">
                  {paymentData.expires_at ? 
                    new Date(paymentData.expires_at).toLocaleString() : 
                    "Not specified"
                  }
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <a 
                href={paymentData.payment_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
              >
                Open payment page <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}
        
        <DialogFooter>
          {!paymentData ? (
            <Button 
              onClick={handleCreatePayment} 
              disabled={loading || amount <= 0 || !currency}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue to Payment"
              )}
            </Button>
          ) : (
            <div className="w-full text-center text-sm text-muted-foreground">
              You can close this window. We'll notify you once payment is confirmed.
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CryptoPayment;