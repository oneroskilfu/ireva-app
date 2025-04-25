import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute, useRouter } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import CryptoPayment from '@/components/Payment/CryptoPayment';
import { 
  ArrowLeft, 
  CreditCard, 
  Landmark, 
  Wallet, 
  Bitcoin,
  Loader2,
  Building, 
  Info,
  BadgeCheck,
  Eye,
  AlertCircle
} from 'lucide-react';

enum InvestmentStep {
  AMOUNT = 'amount',
  PAYMENT_METHOD = 'payment_method',
  PAYMENT_PROCESSING = 'payment_processing',
  CONFIRMATION = 'confirmation'
}

const PropertyInvestment = () => {
  const [, params] = useRoute('/properties/:id/invest');
  const [, navigate] = useRouter();
  const propertyId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<InvestmentStep>(InvestmentStep.AMOUNT);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'wallet' | 'crypto'>('wallet');
  
  // Fetch property details
  const { data: property, isLoading: isLoadingProperty, error: propertyError } = useQuery({
    queryKey: [`/api/properties/${propertyId}`],
    queryFn: async () => {
      if (!propertyId) return null;
      const res = await apiRequest('GET', `/api/properties/${propertyId}`);
      return res.json();
    },
    enabled: !!propertyId,
  });

  // Fetch user wallet balance
  const { data: wallet, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['/api/wallet/balance'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/wallet/balance');
      return res.json();
    },
  });

  // Handle investment submission
  const investMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/investments', {
        propertyId,
        amount: investmentAmount,
        paymentMethod,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process investment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      
      toast({
        title: 'Investment Successful',
        description: 'Your investment has been processed successfully.',
      });
      
      setCurrentStep(InvestmentStep.CONFIRMATION);
    },
    onError: (error: Error) => {
      toast({
        title: 'Investment Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle investment amount validation
  const validateAmount = (): boolean => {
    if (!property) return false;
    
    if (investmentAmount < property.minimumInvestment) {
      toast({
        title: 'Invalid Amount',
        description: `Minimum investment amount is ₦${property.minimumInvestment.toLocaleString()}`,
        variant: 'destructive',
      });
      return false;
    }
    
    if (paymentMethod === 'wallet' && wallet && investmentAmount > wallet.balance) {
      toast({
        title: 'Insufficient Balance',
        description: 'Your wallet balance is lower than the investment amount',
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStep === InvestmentStep.PAYMENT_METHOD) {
      setCurrentStep(InvestmentStep.AMOUNT);
    } else if (currentStep === InvestmentStep.PAYMENT_PROCESSING) {
      setCurrentStep(InvestmentStep.PAYMENT_METHOD);
    }
  };

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep === InvestmentStep.AMOUNT) {
      if (validateAmount()) {
        setCurrentStep(InvestmentStep.PAYMENT_METHOD);
      }
    } else if (currentStep === InvestmentStep.PAYMENT_METHOD) {
      if (paymentMethod === 'crypto') {
        setCurrentStep(InvestmentStep.PAYMENT_PROCESSING);
      } else {
        // For non-crypto payment methods, proceed with investment
        investMutation.mutate();
      }
    }
  };

  // Calculate funding percentage
  const calculateFundingPercentage = () => {
    if (!property) return 0;
    return Math.min(100, Math.round((property.currentFunding / property.totalFunding) * 100));
  };

  // Handle crypto payment completion
  const handleCryptoPaymentSuccess = () => {
    setCurrentStep(InvestmentStep.CONFIRMATION);
    queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
  };

  // Format number as currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to invest in properties',
        variant: 'destructive',
      });
      navigate('/auth');
    }
  }, [user]);

  // Check if property is available for investment
  useEffect(() => {
    if (property && (property.currentFunding >= property.totalFunding || property.daysLeft <= 0)) {
      toast({
        title: 'Investment Not Available',
        description: 'This property is no longer available for investment',
        variant: 'destructive',
      });
      navigate(`/properties/${propertyId}`);
    }
  }, [property]);

  // Loading state
  if (isLoadingProperty || isLoadingWallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Loading investment details...</p>
      </div>
    );
  }

  // Error state
  if (propertyError || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium">Error loading property</p>
        <p className="text-sm text-muted-foreground mb-4">
          Unable to load the property details. Please try again.
        </p>
        <Button onClick={() => navigate('/properties')}>
          Browse Properties
        </Button>
      </div>
    );
  }

  // Render content based on current step
  const renderContent = () => {
    switch (currentStep) {
      case InvestmentStep.AMOUNT:
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Amount</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (₦)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={investmentAmount || ''}
                        onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                        placeholder="Enter investment amount"
                        min={property.minimumInvestment}
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum investment: {formatCurrency(property.minimumInvestment)}
                      </p>
                    </div>

                    <div className="pt-4">
                      <p className="text-sm font-medium mb-2">Your wallet balance:</p>
                      <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                        <span className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-muted-foreground" />
                          <span>Available balance</span>
                        </span>
                        <span className="font-medium">
                          {wallet ? formatCurrency(wallet.balance) : 'Loading...'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button 
                    onClick={goToNextStep} 
                    disabled={investmentAmount < property.minimumInvestment}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>

              <div className="w-full md:w-1/2">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      {property.imageUrl && (
                        <div className="w-24 h-24 relative rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={property.imageUrl}
                            alt={property.name}
                            className="absolute object-cover inset-0 w-full h-full"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">{property.name}</h3>
                        <p className="text-sm text-muted-foreground">{property.location}</p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">{property.targetReturn}%</span>{" "}
                          <span className="text-muted-foreground">Expected ROI</span>
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <span className="text-sm font-medium capitalize">
                          {property.type.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Term:</span>
                        <span className="text-sm font-medium">
                          {property.term} months
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Risk Level:</span>
                        <span className="text-sm font-medium capitalize">
                          {property.riskLevel}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Days Left:</span>
                        <span className="text-sm font-medium">
                          {property.daysLeft}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Funding Progress</span>
                        <span className="text-sm font-medium">
                          {calculateFundingPercentage()}%
                        </span>
                      </div>
                      <Progress value={calculateFundingPercentage()} className="h-2" />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(property.currentFunding)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(property.totalFunding)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case InvestmentStep.PAYMENT_METHOD:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Select Payment Method</h2>
            
            <Tabs 
              defaultValue="wallet" 
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as any)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 h-auto">
                <TabsTrigger 
                  value="wallet"
                  className="flex flex-col py-3 h-auto"
                >
                  <Wallet className="h-5 w-5 mb-1" />
                  <span>Wallet</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="card"
                  className="flex flex-col py-3 h-auto"
                >
                  <CreditCard className="h-5 w-5 mb-1" />
                  <span>Card</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="bank"
                  className="flex flex-col py-3 h-auto"
                >
                  <Landmark className="h-5 w-5 mb-1" />
                  <span>Bank</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="crypto"
                  className="flex flex-col py-3 h-auto"
                >
                  <Bitcoin className="h-5 w-5 mb-1" />
                  <span>Crypto</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-6 p-6 border rounded-lg">
                <TabsContent value="wallet" className="mt-0 space-y-4">
                  <div className="flex gap-3 items-center">
                    <Wallet className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-medium">Pay with Wallet Balance</h3>
                      <p className="text-sm text-muted-foreground">
                        Use your available wallet balance for this investment
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm">Your wallet balance:</span>
                      <span className="font-medium">
                        {wallet ? formatCurrency(wallet.balance) : 'Loading...'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm">Investment amount:</span>
                      <span className="font-medium">
                        {formatCurrency(investmentAmount)}
                      </span>
                    </div>
                    
                    {wallet && wallet.balance < investmentAmount && (
                      <div className="flex items-start gap-2 p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            Insufficient wallet balance
                          </p>
                          <p className="text-xs text-yellow-700">
                            Please fund your wallet or choose another payment method.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="card" className="mt-0 space-y-4">
                  <div className="flex gap-3 items-center">
                    <CreditCard className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-medium">Pay with Card</h3>
                      <p className="text-sm text-muted-foreground">
                        Use your debit or credit card for this investment
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm">Payment amount:</span>
                      <span className="font-medium">
                        {formatCurrency(investmentAmount)}
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2 p-3 border border-blue-200 bg-blue-50 rounded-lg">
                      <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Secure Payment
                        </p>
                        <p className="text-xs text-blue-700">
                          Your card details are encrypted and processed securely.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="bank" className="mt-0 space-y-4">
                  <div className="flex gap-3 items-center">
                    <Landmark className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-medium">Pay with Bank Transfer</h3>
                      <p className="text-sm text-muted-foreground">
                        Make a bank transfer to complete your investment
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm">Transfer amount:</span>
                      <span className="font-medium">
                        {formatCurrency(investmentAmount)}
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2 p-3 border border-blue-200 bg-blue-50 rounded-lg">
                      <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Bank Transfer Details
                        </p>
                        <p className="text-xs text-blue-700">
                          You will receive the bank details after confirming your investment.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="crypto" className="mt-0 space-y-4">
                  <div className="flex gap-3 items-center">
                    <Bitcoin className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-medium">Pay with Cryptocurrency</h3>
                      <p className="text-sm text-muted-foreground">
                        Use USDC, USDT, or ETH for this investment
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm">Investment amount:</span>
                      <span className="font-medium">
                        {formatCurrency(investmentAmount)}
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2 p-3 border border-green-200 bg-green-50 rounded-lg">
                      <Info className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Cryptocurrency Payment
                        </p>
                        <p className="text-xs text-green-700">
                          After clicking "Continue", you'll be able to send crypto to complete your investment.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={goToPreviousStep}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button 
                onClick={goToNextStep} 
                disabled={paymentMethod === 'wallet' && wallet && wallet.balance < investmentAmount}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case InvestmentStep.PAYMENT_PROCESSING:
        return (
          <div className="space-y-6">
            <div className="flex justify-start">
              <Button variant="outline" onClick={goToPreviousStep}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Payment Methods
              </Button>
            </div>
            
            <CryptoPayment
              propertyId={propertyId || 0}
              investmentAmount={investmentAmount}
              onSuccess={handleCryptoPaymentSuccess}
              onCancel={() => setCurrentStep(InvestmentStep.PAYMENT_METHOD)}
            />
          </div>
        );

      case InvestmentStep.CONFIRMATION:
        return (
          <div className="flex flex-col items-center justify-center py-10 space-y-6">
            <div className="bg-green-100 p-4 rounded-full">
              <BadgeCheck className="h-12 w-12 text-green-600" />
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Investment Successful!</h2>
              <p className="text-muted-foreground">
                Your investment of {formatCurrency(investmentAmount)} in {property.name} has been processed successfully.
              </p>
            </div>
            
            <div className="border rounded-lg p-6 w-full max-w-md space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Property:</span>
                <span className="font-medium">{property.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="font-medium">{formatCurrency(investmentAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Expected ROI:</span>
                <span className="font-medium">{property.targetReturn}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Term:</span>
                <span className="font-medium">{property.term} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Method:</span>
                <span className="font-medium capitalize">{paymentMethod}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/properties/${propertyId}`)}
              >
                <Building className="h-4 w-4 mr-1" />
                View Property
              </Button>
              <Button 
                onClick={() => navigate('/dashboard/investments')}
              >
                <Eye className="h-4 w-4 mr-1" />
                View My Investments
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/properties/${propertyId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Property
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold mb-8">Invest in {property.name}</h1>
      
      {renderContent()}
    </div>
  );
};

export default PropertyInvestment;