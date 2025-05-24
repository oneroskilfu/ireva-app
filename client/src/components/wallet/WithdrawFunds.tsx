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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Bank, Banknote, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define form schema for validation
const withdrawFormSchema = z.object({
  amount: z
    .number({ required_error: 'Amount is required' })
    .min(1000, { message: 'Minimum withdrawal amount is ₦1,000' })
    .max(10000000, { message: 'Maximum withdrawal amount is ₦10,000,000' }),
  bankName: z.string().min(2, { message: 'Bank name is required' }),
  accountNumber: z
    .string()
    .min(10, { message: 'Account number must be 10 digits' })
    .max(10, { message: 'Account number must be 10 digits' }),
  accountName: z.string().min(2, { message: 'Account name is required' }),
  description: z.string().optional(),
});

interface WithdrawFundsProps {
  availableBalance: number;
  onSuccess?: () => void;
}

const WithdrawFunds = ({ availableBalance, onSuccess }: WithdrawFundsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isComplete, setIsComplete] = useState(false);
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof withdrawFormSchema>>({
    resolver: zodResolver(withdrawFormSchema),
    defaultValues: {
      amount: 0,
      bankName: '',
      accountNumber: '',
      accountName: '',
      description: '',
    },
  });

  // Watch amount to validate against available balance
  const watchedAmount = form.watch('amount');
  const exceedsBalance = watchedAmount > availableBalance;

  // Withdraw funds mutation
  const withdrawFundsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof withdrawFormSchema>) => {
      const response = await apiRequest('POST', '/api/wallet/withdraw', data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to withdraw funds');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Withdrawal request submitted',
        description: 'Your withdrawal request has been successfully submitted.',
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
        title: 'Failed to withdraw funds',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: z.infer<typeof withdrawFormSchema>) => {
    if (data.amount > availableBalance) {
      form.setError('amount', {
        type: 'manual',
        message: 'Amount exceeds available balance',
      });
      return;
    }
    withdrawFundsMutation.mutate(data);
  };

  const resetForm = () => {
    form.reset();
    setIsComplete(false);
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // If transaction is complete, show success state
  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-medium mb-2">Withdrawal Request Submitted</h3>
        <p className="text-muted-foreground mb-6 max-w-xs">
          Your withdrawal request for {formatCurrency(form.getValues('amount') || 0)} has been submitted and is being processed.
        </p>
        <Button onClick={resetForm} variant="outline">
          Make Another Withdrawal
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Withdraw Funds</CardTitle>
          <CardDescription>
            Withdraw funds from your wallet to your bank account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Available Balance</div>
              <div className="text-2xl font-semibold">{formatCurrency(availableBalance)}</div>
            </div>
          </div>

          {exceedsBalance && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Insufficient funds</AlertTitle>
              <AlertDescription>
                The withdrawal amount exceeds your available balance.
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              id="withdraw-form"
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
                          className={`pl-10 ${exceedsBalance ? 'border-destructive' : ''}`}
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

              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your bank" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="access">Access Bank</SelectItem>
                        <SelectItem value="gtbank">GTBank</SelectItem>
                        <SelectItem value="firstbank">First Bank</SelectItem>
                        <SelectItem value="zenith">Zenith Bank</SelectItem>
                        <SelectItem value="uba">UBA</SelectItem>
                        <SelectItem value="stanbic">Stanbic IBTC</SelectItem>
                        <SelectItem value="fcmb">FCMB</SelectItem>
                        <SelectItem value="fidelity">Fidelity Bank</SelectItem>
                        <SelectItem value="ecobank">Ecobank</SelectItem>
                        <SelectItem value="union">Union Bank</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0123456789"
                          {...field}
                          onChange={(e) => {
                            // Only allow numbers
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Withdrawal reason or note" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            form="withdraw-form"
            disabled={
              !form.formState.isValid ||
              withdrawFundsMutation.isPending ||
              exceedsBalance ||
              form.getValues('amount') <= 0
            }
          >
            {withdrawFundsMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Withdraw Funds'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WithdrawFunds;