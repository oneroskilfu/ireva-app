import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Property } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface PaystackCheckoutProps {
  property: Property;
  amount: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function PaystackCheckout({ property, amount, onSuccess, onError }: PaystackCheckoutProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!user) {
      setError('You must be logged in to make an investment');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest('POST', '/api/payment/initialize', { 
        propertyId: property.id, 
        amount 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initialize payment');
      }

      const data = await response.json();
      
      if (data.status && data.data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error('Invalid payment response');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment initialization failed');
      if (onError) {
        onError(err);
      }
      toast({
        title: 'Payment Error',
        description: err.message || 'There was a problem initializing your payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Investment</CardTitle>
        <CardDescription>
          You're investing in {property.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b">
            <span>Property:</span>
            <span className="font-medium">{property.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span>Location:</span>
            <span>{property.location}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span>Investment Amount:</span>
            <span className="font-bold">${amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span>Expected Return:</span>
            <span className="text-emerald-600 font-medium">{property.returnRate}% annually</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Investment Period:</span>
            <span>5 years</span>
          </div>

          {error && (
            <div className="bg-red-50 p-3 rounded-md flex items-start mt-4">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 p-3 rounded-md flex items-start mt-4">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-green-700 text-sm">
                Payment successful! Your investment has been processed.
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handlePayment} 
          disabled={loading || success} 
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : success ? (
            'Payment Complete'
          ) : (
            'Pay with Paystack'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PaystackCheckout;