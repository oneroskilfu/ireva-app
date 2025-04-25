import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import CryptoPayment from "@/components/Payment/CryptoPayment";
import { apiRequest } from "@/lib/queryClient";

interface PropertyInvestmentProps {}

interface Property {
  id: number;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  minimumInvestment: number;
  targetReturn: string;
  totalFunding: number;
  currentFunding: number;
  term: number;
  type: string;
}

const PropertyInvestment: React.FC<PropertyInvestmentProps> = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('wallet');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [cryptoPaymentData, setCryptoPaymentData] = useState<any>(null);

  // Fetch property data
  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id,
  });

  useEffect(() => {
    if (property) {
      setInvestmentAmount(property.minimumInvestment);
    }
  }, [property]);

  const handleInvestmentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setInvestmentAmount(isNaN(value) ? 0 : value);
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
  };

  const handleInvestment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with your investment.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!property) return;

    if (investmentAmount < property.minimumInvestment) {
      toast({
        title: "Investment amount too low",
        description: `The minimum investment for this property is ${property.minimumInvestment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
        variant: "destructive",
      });
      return;
    }

    // If crypto payment method is selected, initialize crypto payment
    if (paymentMethod === 'crypto') {
      try {
        setPaymentStatus('processing');
        const response = await apiRequest('POST', '/api/crypto-payments/create', {
          propertyId: property.id,
          amount: investmentAmount,
          userId: user.id
        });

        if (!response.ok) {
          throw new Error('Failed to create crypto payment');
        }

        const paymentData = await response.json();
        setCryptoPaymentData(paymentData);
        setPaymentStatus('success');
      } catch (error) {
        console.error('Error creating crypto payment:', error);
        setPaymentStatus('failed');
        toast({
          title: "Payment Failed",
          description: "There was an error processing your crypto payment. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Handle traditional payment methods
      try {
        setPaymentStatus('processing');
        const response = await apiRequest('POST', '/api/investments', {
          propertyId: property.id,
          amount: investmentAmount,
          paymentMethod,
        });

        if (!response.ok) {
          throw new Error('Failed to create investment');
        }

        const investment = await response.json();
        setPaymentStatus('success');
        toast({
          title: "Investment Successful",
          description: "Your investment has been processed successfully.",
        });
        
        // Redirect to dashboard after successful investment
        setTimeout(() => {
          navigate("/investor");
        }, 2000);
      } catch (error) {
        console.error('Error creating investment:', error);
        setPaymentStatus('failed');
        toast({
          title: "Investment Failed",
          description: "There was an error processing your investment. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Property Not Found</h1>
        <p className="text-muted-foreground mb-4">The property you're looking for doesn't exist or there was an error.</p>
        <Button onClick={() => navigate("/properties")}>Browse Properties</Button>
      </div>
    );
  }

  // If crypto payment data is available, show the crypto payment component
  if (paymentMethod === 'crypto' && cryptoPaymentData) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <Button 
          variant="outline" 
          onClick={() => {
            setCryptoPaymentData(null);
            setPaymentStatus('idle');
          }}
          className="mb-6"
        >
          ← Back to Investment Options
        </Button>
        
        <CryptoPayment 
          paymentData={cryptoPaymentData} 
          property={property} 
          amount={investmentAmount}
          onSuccess={() => {
            toast({
              title: "Investment Successful",
              description: "Your crypto payment has been processed successfully.",
            });
            setTimeout(() => navigate("/investor"), 2000);
          }}
        />
      </div>
    );
  }

  const fundingPercentage = (property.currentFunding / property.totalFunding) * 100;

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <Button 
        variant="outline" 
        onClick={() => navigate(`/property/${property.id}`)}
        className="mb-6"
      >
        ← Back to Property Details
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Invest in {property.name}</CardTitle>
              <CardDescription>{property.location} | {property.type}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium">Funding Progress</span>
                <Progress value={fundingPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(fundingPercentage)}% Funded</span>
                  <span>{property.currentFunding.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} of {property.totalFunding.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Target Return</p>
                  <p className="text-xl font-semibold">{property.targetReturn}%</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Term Length</p>
                  <p className="text-xl font-semibold">{property.term} months</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Minimum Investment</p>
                  <p className="text-xl font-semibold">{property.minimumInvestment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label htmlFor="investment-amount" className="text-sm font-medium">
                    Investment Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <Input
                      id="investment-amount"
                      type="number"
                      value={investmentAmount}
                      onChange={handleInvestmentAmountChange}
                      className="pl-7"
                      min={property.minimumInvestment}
                    />
                  </div>
                  {investmentAmount < property.minimumInvestment && (
                    <p className="text-sm text-destructive">
                      Minimum investment is {property.minimumInvestment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Select how you'd like to invest</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="wallet" onValueChange={handlePaymentMethodChange}>
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="wallet">Wallet</TabsTrigger>
                  <TabsTrigger value="crypto">Crypto</TabsTrigger>
                </TabsList>
                
                <TabsContent value="wallet" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Pay using your platform wallet balance. Make sure you have sufficient funds before proceeding.
                  </p>
                </TabsContent>
                
                <TabsContent value="crypto" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Pay using cryptocurrency. We accept USDC and USDT on multiple networks.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="w-full pt-4 border-t">
                <p className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Investment</span>
                  <span>{investmentAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </p>
                <p className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span>{(investmentAmount * 0.01).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </p>
                <p className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{(investmentAmount * 1.01).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </p>
              </div>
              
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleInvestment}
                disabled={
                  paymentStatus === 'processing' || 
                  investmentAmount < property.minimumInvestment
                }
              >
                {paymentStatus === 'processing' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : paymentStatus === 'success' ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Success!
                  </>
                ) : (
                  `Invest ${(investmentAmount * 1.01).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
                )}
              </Button>
              
              {!user && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  You'll need to log in before completing your investment.
                </p>
              )}
            </CardFooter>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Investment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">
                <strong>Expected Return:</strong> {property.targetReturn}% annually
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Investment Term:</strong> {property.term} months
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Estimated Total Return:</strong> {((parseFloat(property.targetReturn) / 100) * (property.term / 12) * investmentAmount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyInvestment;