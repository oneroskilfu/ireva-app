import { useState, useEffect } from 'react';
import { Property } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface PaystackCheckoutProps {
  property: Property;
  amount: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function PaystackCheckout({ property, amount, onSuccess, onError }: PaystackCheckoutProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load the Paystack script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
      setIsLoading(false);
    };
    script.onerror = () => {
      console.error('Failed to load Paystack script');
      setIsLoading(false);
      if (onError) onError(new Error('Failed to load payment processor. Please try again.'));
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [onError]);

  const handlePayment = async () => {
    if (!scriptLoaded || !user) {
      onError && onError(new Error('Payment system not ready. Please try again.'));
      return;
    }

    try {
      setIsLoading(true);
      
      // Generate a reference from backend
      const paymentData = {
        amount,
        propertyId: property.id,
        email: user.email || ''
      };

      const response = await apiRequest('POST', '/api/payments/initialize', paymentData);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initialize payment');
      }

      // Open Paystack payment modal
      const paystack = new window.PaystackPop();
      paystack.newTransaction({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: amount * 100, // Paystack expects amount in kobo (smallest currency unit)
        currency: 'NGN',
        ref: data.reference,
        onClose: () => {
          setIsLoading(false);
        },
        callback: (response: any) => {
          // Verify the transaction on the server
          verifyPayment(response.reference);
        }
      });
    } catch (error) {
      setIsLoading(false);
      onError && onError(error instanceof Error ? error : new Error('Payment failed'));
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const response = await apiRequest('POST', '/api/payments/verify', { reference });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify payment');
      }

      setIsLoading(false);
      onSuccess && onSuccess(data);
    } catch (error) {
      setIsLoading(false);
      onError && onError(error instanceof Error ? error : new Error('Payment verification failed'));
    }
  };

  return (
    <Button 
      type="button"
      onClick={handlePayment} 
      disabled={isLoading || !scriptLoaded}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Pay with Paystack'
      )}
    </Button>
  );
}