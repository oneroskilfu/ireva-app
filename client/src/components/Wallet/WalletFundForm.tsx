import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const fundWalletSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .refine(val => !isNaN(parseInt(val)), "Amount must be a number")
    .refine(val => parseInt(val) >= 1000, "Minimum amount is ₦1,000"),
  paymentMethod: z.enum(["credit_card", "bank_transfer", "paystack", "flutterwave", "crypto"]),
});

type FundWalletFormValues = z.infer<typeof fundWalletSchema>;

interface WalletFundFormProps {
  onSuccess?: () => void;
}

export default function WalletFundForm({ onSuccess }: WalletFundFormProps) {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string>("credit_card");
  
  const form = useForm<FundWalletFormValues>({
    resolver: zodResolver(fundWalletSchema),
    defaultValues: {
      amount: '',
      paymentMethod: 'credit_card',
    },
  });

  const fundMutation = useMutation({
    mutationFn: async (data: FundWalletFormValues) => {
      const res = await apiRequest('POST', '/api/wallet/fund', {
        amount: parseInt(data.amount),
        paymentMethod: data.paymentMethod,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      if (onSuccess) onSuccess();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to fund wallet',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  function onSubmit(data: FundWalletFormValues) {
    fundMutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (₦)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. 50000"
                  {...field}
                  type="number"
                  min="1000"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedMethod(value);
                    }}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="credit_card"
                        id="credit_card"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="credit_card"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-sm font-medium">Credit Card</span>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem
                        value="bank_transfer"
                        id="bank_transfer"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="bank_transfer"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-sm font-medium">Bank Transfer</span>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem
                        value="paystack"
                        id="paystack"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="paystack"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-sm font-medium">Paystack</span>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem
                        value="flutterwave"
                        id="flutterwave"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="flutterwave"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-sm font-medium">Flutterwave</span>
                      </Label>
                    </div>
                    
                    <div>
                      <RadioGroupItem
                        value="crypto"
                        id="crypto"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="crypto"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="text-sm font-medium">Cryptocurrency</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Show the payment form based on selected method */}
        {selectedMethod === 'credit_card' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Credit Card Details</CardTitle>
              <CardDescription>
                Enter your card information to fund your wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name on Card</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedMethod === 'bank_transfer' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Bank Transfer Details</CardTitle>
              <CardDescription>
                Transfer to the following bank account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-md bg-muted">
                <p><strong>Bank Name:</strong> Access Bank</p>
                <p><strong>Account Name:</strong> IREVA Investments Ltd</p>
                <p><strong>Account Number:</strong> 0123456789</p>
                <p><strong>Reference:</strong> {`IREVA-${Date.now().toString().substring(0, 10)}`}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                After making the transfer, please click the button below.
              </p>
            </CardContent>
          </Card>
        )}
        
        {selectedMethod === 'crypto' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Cryptocurrency Payment</CardTitle>
              <CardDescription>
                For cryptocurrency transactions, please use our crypto wallet interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-md bg-muted flex flex-col items-center">
                <svg className="h-12 w-12 mb-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002z" />
                </svg>
                <p className="font-medium text-center">Our crypto wallet supports USDC and USDT</p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Click the button below to continue to our crypto wallet interface.
                </p>
              </div>
              
              <div className="flex justify-center mt-2">
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => window.location.href = '/wallet/crypto'}
                >
                  Continue to Crypto Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={fundMutation.isPending}
        >
          {fundMutation.isPending ? 'Processing...' : 'Fund Wallet'}
        </Button>
      </form>
    </Form>
  );
}