import React from 'react';
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
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const withdrawSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .refine(val => !isNaN(parseInt(val)), "Amount must be a number")
    .refine(val => parseInt(val) >= 1000, "Minimum withdrawal is ₦1,000"),
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string().min(10, "Account number should be at least 10 digits"),
  accountName: z.string().min(3, "Account name is required"),
});

type WithdrawFormValues = z.infer<typeof withdrawSchema>;

interface WalletWithdrawFormProps {
  onSuccess?: () => void;
  currentBalance: number;
}

export default function WalletWithdrawForm({ onSuccess, currentBalance }: WalletWithdrawFormProps) {
  const { toast } = useToast();
  
  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema.refine(
      data => parseInt(data.amount) <= currentBalance,
      {
        message: `Insufficient funds. Your current balance is ₦${currentBalance.toLocaleString()}`,
        path: ["amount"],
      }
    )),
    defaultValues: {
      amount: '',
      bankName: '',
      accountNumber: '',
      accountName: '',
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: WithdrawFormValues) => {
      const res = await apiRequest('POST', '/api/wallet/withdraw', {
        amount: parseInt(data.amount),
        bankAccount: {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          accountName: data.accountName,
        },
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      if (onSuccess) onSuccess();
      form.reset();
      
      toast({
        title: 'Withdrawal Request Submitted',
        description: `Your withdrawal of ₦${parseInt(form.getValues().amount).toLocaleString()} has been submitted and is being processed.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to process withdrawal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  function onSubmit(data: WithdrawFormValues) {
    withdrawMutation.mutate(data);
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
                  max={currentBalance}
                />
              </FormControl>
              <FormDescription>
                Available balance: ₦{currentBalance.toLocaleString()}
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
              <FormLabel>Bank Name</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="access">Access Bank</SelectItem>
                  <SelectItem value="gtb">GTBank</SelectItem>
                  <SelectItem value="first">First Bank</SelectItem>
                  <SelectItem value="zenith">Zenith Bank</SelectItem>
                  <SelectItem value="uba">UBA</SelectItem>
                  <SelectItem value="fcmb">FCMB</SelectItem>
                  <SelectItem value="sterling">Sterling Bank</SelectItem>
                  <SelectItem value="wema">Wema Bank</SelectItem>
                  <SelectItem value="providus">Providus Bank</SelectItem>
                </SelectContent>
              </Select>
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
                <Input placeholder="Enter your account number" {...field} />
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
                <Input placeholder="Enter account holder's name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={withdrawMutation.isPending}
        >
          {withdrawMutation.isPending ? 'Processing...' : 'Withdraw Funds'}
        </Button>
      </form>
    </Form>
  );
}