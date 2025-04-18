import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wallet, AlertCircle, RefreshCw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Property } from '@shared/schema';

const investmentSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .refine(val => !isNaN(parseInt(val)), "Amount must be a number")
    .refine(val => parseInt(val) > 0, "Amount must be greater than 0"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type InvestmentFormValues = z.infer<typeof investmentSchema>;

interface InvestmentFormProps {
  property: Property;
}

export default function InvestmentForm({ property }: InvestmentFormProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);

  // Get wallet balance
  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ['/api/wallet'],
  });

  // Set up form with validation
  const form = useForm<InvestmentFormValues>({
    resolver: zodResolver(
      investmentSchema.superRefine((data, ctx) => {
        const amount = parseInt(data.amount);
        // Check minimum investment amount
        if (amount < property.minimumInvestment) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Minimum investment is ₦${property.minimumInvestment.toLocaleString()}`,
            path: ["amount"],
          });
        }
        
        // Check if the property is fully funded
        if (property.currentFunding >= property.totalFunding) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "This property is fully funded",
            path: ["amount"],
          });
        }
        
        // Check available space in funding
        const availableFunding = property.totalFunding - property.currentFunding;
        if (amount > availableFunding) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Only ₦${availableFunding.toLocaleString()} funding is still available`,
            path: ["amount"],
          });
        }
        
        // Check wallet balance if available
        if (wallet && amount > wallet.balance) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Insufficient funds. Your wallet balance is ₦${wallet.balance.toLocaleString()}`,
            path: ["amount"],
          });
        }
      })
    ),
    defaultValues: {
      amount: property.minimumInvestment.toString(),
      termsAccepted: false,
    },
  });

  // Set initial amount when property changes
  useEffect(() => {
    form.setValue('amount', property.minimumInvestment.toString());
  }, [property, form]);

  // Investment mutation with React Query
  const investMutation = useMutation({
    mutationFn: async (data: InvestmentFormValues) => {
      // Show a loading toast notification
      toast({
        title: "Processing Investment",
        description: "Your investment is being processed...",
      });
      
      const res = await apiRequest('POST', '/api/investments', {
        propertyId: property.id,
        amount: parseInt(data.amount),
      });
      return await res.json();
    },
    onSuccess: (data) => {
      // Clear previous toasts and show success toast
      toast({
        title: 'Investment Successful!',
        description: `You have successfully invested ₦${parseInt(form.getValues().amount).toLocaleString()} in ${property.name}`,
        variant: 'default',
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
        queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/properties', property.id] });
        navigate('/investor/portfolio');
      }, 3000);
    },
    onError: (error: Error) => {
      toast({
        title: 'Investment Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  function onSubmit(data: InvestmentFormValues) {
    investMutation.mutate(data);
  }

  const progress = Math.min(
    Math.round((property.currentFunding / property.totalFunding) * 100),
    100
  );

  if (showSuccess) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Investment Successful!</CardTitle>
          <CardDescription>
            Your investment has been processed and added to your portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 p-4 rounded-lg mb-4 flex items-start">
            <div className="mr-3 text-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-green-700 font-medium">Investment of ₦{parseInt(form.getValues().amount).toLocaleString()} Confirmed</h3>
              <p className="text-green-600 text-sm mt-1">
                You have successfully invested in {property.name}. A confirmation has been sent to your email.
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            You will be redirected to your portfolio in a moment...
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate('/investor/portfolio')} className="w-full">
            View My Portfolio
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Invest in {property.name}</CardTitle>
        <CardDescription>
          Invest now to earn up to {property.targetReturn}% returns over {property.term} months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Project Funding</span>
            <span className="font-medium">{progress}% Funded</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₦{property.currentFunding.toLocaleString()}</span>
            <span>₦{property.totalFunding.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-muted p-3 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Your Wallet Balance</span>
            </div>
            {isWalletLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <span className="font-bold">₦{wallet?.balance?.toLocaleString() || 0}</span>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Amount (₦)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter amount"
                      {...field}
                      type="number"
                      min={property.minimumInvestment}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum investment: ₦{property.minimumInvestment.toLocaleString()}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Investment summary */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Investment Summary</h4>
              <div className="flex justify-between text-sm">
                <span>Property</span>
                <span className="font-medium">{property.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Location</span>
                <span className="font-medium">{property.location}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Term</span>
                <span className="font-medium">{property.term} months</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Target Return</span>
                <span className="font-medium">{property.targetReturn}%</span>
              </div>
              <div className="flex justify-between text-sm font-medium pt-2 border-t">
                <span>Investment Amount</span>
                <span>₦{parseInt(form.getValues().amount || "0").toLocaleString()}</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to the terms and conditions of this investment
                    </FormLabel>
                    <FormDescription>
                      I understand this investment has a maturity period of {property.term} months
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Warning about wallet balance */}
            {wallet && wallet.balance < property.minimumInvestment && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Insufficient Funds</AlertTitle>
                <AlertDescription>
                  Your wallet balance (₦{wallet.balance.toLocaleString()}) is less than the minimum investment. 
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/investor/wallet')}
                    className="p-0 h-auto font-normal text-inherit underline ml-1"
                  >
                    Add funds to your wallet
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full relative"
              disabled={
                investMutation.isPending || 
                (wallet && wallet.balance < property.minimumInvestment) ||
                property.currentFunding >= property.totalFunding
              }
            >
              {investMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing Investment...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Confirm Investment
                </>
              )}
            </Button>
            
            {/* Disabled reasons */}
            {!investMutation.isPending && wallet && wallet.balance < property.minimumInvestment && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                ⓘ You need to add funds to your wallet to continue
              </p>
            )}
            
            {!investMutation.isPending && property.currentFunding >= property.totalFunding && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                ⓘ This property is fully funded
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}