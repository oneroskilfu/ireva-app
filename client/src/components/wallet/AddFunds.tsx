import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  CreditCard,
  Building,
  PiggyBank,
  Banknote,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

// Define form schema for validation
const paymentFormSchema = z.object({
  amount: z
    .number({ required_error: 'Amount is required' })
    .min(1000, { message: 'Minimum deposit amount is ₦1,000' })
    .max(10000000, { message: 'Maximum deposit amount is ₦10,000,000' }),
  cardNumber: z
    .string()
    .min(16, { message: 'Card number must be 16 digits' })
    .max(19, { message: 'Card number must not exceed 19 digits' })
    .optional()
    .or(z.literal('')),
  cardExpiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, {
      message: 'Expiry date must be in format MM/YY',
    })
    .optional()
    .or(z.literal('')),
  cardCvc: z
    .string()
    .min(3, { message: 'CVC must be 3 or 4 digits' })
    .max(4, { message: 'CVC must be 3 or 4 digits' })
    .optional()
    .or(z.literal('')),
  accountNumber: z
    .string()
    .min(10, { message: 'Account number must be 10 digits' })
    .max(10, { message: 'Account number must be 10 digits' })
    .optional()
    .or(z.literal('')),
  bankName: z
    .string()
    .min(2, { message: 'Bank name is required' })
    .optional()
    .or(z.literal('')),
});

interface AddFundsProps {
  onSuccess?: () => void;
}

const AddFunds = ({ onSuccess }: AddFundsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isComplete, setIsComplete] = useState(false);
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: 0,
      cardNumber: '',
      cardExpiryDate: '',
      cardCvc: '',
      accountNumber: '',
      bankName: '',
    },
  });

  // Add funds mutation
  const fundWalletMutation = useMutation({
    mutationFn: async (data: z.infer<typeof paymentFormSchema>) => {
      const response = await apiRequest('POST', '/api/wallet/fund', data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add funds');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Funds added',
        description: 'Your wallet has been successfully funded.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      setIsComplete(true);
      
      // Auto-hide the complete state after 3 seconds
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 3000);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add funds',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: z.infer<typeof paymentFormSchema>) => {
    // Add payment method data based on selected method
    const payloadData = {
      ...data,
      paymentMethod,
    };
    fundWalletMutation.mutate(payloadData);
  };

  const resetForm = () => {
    form.reset();
    setIsComplete(false);
  };

  // Function to format card number input with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // If transaction is complete, show success state
  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-medium mb-2">Transaction Complete</h3>
        <p className="text-muted-foreground mb-6 max-w-xs">
          Your wallet has been successfully funded with{' '}
          {new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
          }).format(form.getValues('amount') || 0)}
        </p>
        <Button onClick={resetForm} variant="outline">
          Add More Funds
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Tabs defaultValue="card" onValueChange={setPaymentMethod}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="card" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Card</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center">
            <Building className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Bank</span>
          </TabsTrigger>
          <TabsTrigger value="ussd" className="flex items-center">
            <PiggyBank className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">USSD</span>
          </TabsTrigger>
          <TabsTrigger value="crypto" className="flex items-center">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002z" />
            </svg>
            <span className="hidden sm:inline">Crypto</span>
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>Add Funds to Your Wallet</CardTitle>
            <CardDescription>
              Enter the amount you want to add to your wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                id="add-funds-form"
              >
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₦)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input
                            type="number"
                            placeholder="10,000"
                            className="pl-10"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? 0
                                  : parseFloat(e.target.value)
                              )
                            }
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter an amount between ₦1,000 and ₦10,000,000
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <TabsContent value="card" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="4242 4242 4242 4242"
                            {...field}
                            onChange={(e) => {
                              const formatted = formatCardNumber(e.target.value);
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cardExpiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input placeholder="MM/YY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cardCvc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVC</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="bank" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Select your bank" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="0123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="ussd" className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">USSD Instructions</h4>
                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                      <li>Complete the form and click on "Generate USSD Code"</li>
                      <li>Dial the generated USSD code from your registered phone</li>
                      <li>Follow the prompts to complete your transaction</li>
                      <li>Your wallet will be credited once payment is confirmed</li>
                    </ol>
                  </div>
                </TabsContent>
                
                <TabsContent value="crypto" className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Cryptocurrency Payment</h4>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.location.href = '/wallet/crypto'}
                        className="text-xs"
                      >
                        Advanced Settings
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center justify-center p-2 border rounded-lg hover:bg-accent cursor-pointer">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                          <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002z" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium">Bitcoin</span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center p-2 border rounded-lg hover:bg-accent cursor-pointer">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                          <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium">Ethereum</span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center p-2 border rounded-lg hover:bg-accent cursor-pointer">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                          <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"/>
                            <path fill="white" d="M9.171 9.479L6.586 12l2.585 2.521.731-.731L8.02 12l1.882-1.79-.731-.731zm5.658 0l-.731.731L15.98 12l-1.882 1.79.731.731L17.414 12l-2.585-2.521zM10.9 16.012h1.239l1.961-8.024H12.86L10.9 16.012z"/>
                          </svg>
                        </div>
                        <span className="text-xs font-medium">USDC</span>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p className="font-medium mb-2">Note:</p>
                      <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                        <li>Cryptocurrency payments are processed separately from fiat transactions</li>
                        <li>For more options and wallet configuration, visit the crypto wallet page</li>
                        <li>Your wallet will be credited once the blockchain transaction is confirmed</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (onSuccess) onSuccess();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-funds-form"
              disabled={
                !form.formState.isValid ||
                fundWalletMutation.isPending ||
                form.getValues('amount') <= 0
              }
            >
              {fundWalletMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Add Funds'
              )}
            </Button>
          </CardFooter>
        </Card>
      </Tabs>
    </div>
  );
};

export default AddFunds;