import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CryptoPayment } from '@/components/CryptoPayment';
import { useToast } from '@/hooks/use-toast';
import { Bitcoin, CreditCard } from 'lucide-react';

interface CryptoPaymentModalProps {
  propertyId: number;
  amount: string;
  units: number;
  onPaymentSuccess?: () => void;
  buttonText?: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function CryptoPaymentModal({
  propertyId,
  amount,
  units,
  onPaymentSuccess,
  buttonText = 'Pay with Cryptocurrency',
  buttonVariant = 'outline',
  buttonSize = 'default'
}: CryptoPaymentModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handlePaymentSuccess = () => {
    setOpen(false);
    toast({
      title: 'Payment successful',
      description: 'Your investment has been recorded',
    });
    
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>
          <Bitcoin className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cryptocurrency Payment</DialogTitle>
          <DialogDescription>
            Pay for your investment using cryptocurrency
          </DialogDescription>
        </DialogHeader>
        <CryptoPayment
          propertyId={propertyId}
          amount={amount}
          units={units}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}