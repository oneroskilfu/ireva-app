import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { queryClient, apiRequest } from '@/lib/queryClient';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  MapPin, 
  TrendingUp, 
  Calendar, 
  Users, 
  AlertCircle, 
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Wallet
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define interfaces
interface Project {
  id: number;
  title: string;
  description: string;
  type: string;
  location: string;
  totalFunding: number;
  fundingRaised: number;
  roi: number;
  maturityPeriod: number;
  imageUrl: string;
  availableUnits: number;
  totalUnits: number;
  unitPrice: number;
  status: 'active' | 'fully_funded' | 'completed' | 'coming_soon';
  startDate: string;
  endDate: string;
  investorCount: number;
  minimumInvestment: number;
  featured: boolean;
  developer: {
    name: string;
    logo: string;
    description: string;
  };
  features: string[];
}

interface WalletInfo {
  balance: number;
}

const InvestNow: React.FC = () => {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [units, setUnits] = useState<string>('1');
  const [step, setStep] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  
  // Fetch project details
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
  });

  // Fetch wallet balance
  const { data: wallet, isLoading: walletLoading } = useQuery<WalletInfo>({
    queryKey: ['/api/wallet'],
  });

  // Investment mutation
  const investMutation = useMutation({
    mutationFn: async (investmentData: { projectId: string, amount: number, units: number }) => {
      const res = await apiRequest('POST', '/api/investments', investmentData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Investment Successful!",
        description: "Your investment has been processed successfully.",
        variant: "success",
      });
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
      
      // Navigate back to investor dashboard
      setLocation('/investor/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: "Investment Failed",
        description: error.message || "There was an error processing your investment. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (projectLoading || walletLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-6 ml-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-48 w-full rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full rounded-md" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-10 w-10 text-red-500" />}
        title="Error loading project"
        description="We couldn't load the project details. Please try again later."
        action={
          <Button onClick={() => setLocation('/investor/projects')}>
            Back to Projects
          </Button>
        }
      />
    );
  }

  // Calculate investment details
  const unitPrice = project.unitPrice || (project.totalFunding / project.totalUnits);
  const numberOfUnits = parseInt(units);
  const totalAmount = numberOfUnits * unitPrice;
  const sufficientFunds = wallet?.balance >= totalAmount;
  const fundingPercentage = Math.round((project.fundingRaised / project.totalFunding) * 100);

  const handleInvest = () => {
    if (!id) return;
    
    investMutation.mutate({ 
      projectId: id, 
      amount: totalAmount, 
      units: numberOfUnits
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <Alert>
        <AlertTitle className="flex items-center">
          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
          Investment Opportunity
        </AlertTitle>
        <AlertDescription>
          You're about to invest in {project.title}. This project has an expected annual ROI of {project.roi}% with a maturity period of {project.maturityPeriod} years.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="relative h-48 overflow-hidden rounded-md">
            <img 
              src={project.imageUrl} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-1">Investment Progress</h3>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Total Raised</span>
              <span className="font-medium">₦{project.fundingRaised.toLocaleString()} / ₦{project.totalFunding.toLocaleString()}</span>
            </div>
            <Progress 
              value={fundingPercentage} 
              className="h-2 mb-4"
            />
            
            <div className="text-sm text-muted-foreground">
              <div className="flex justify-between py-2 border-b">
                <span>Available Units</span>
                <span className="font-medium">{project.availableUnits} / {project.totalUnits}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Investors</span>
                <span className="font-medium">{project.investorCount}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Unit Price</span>
                <span className="font-medium">₦{unitPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Minimum Investment</span>
                <span className="font-medium">₦{project.minimumInvestment.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Investment Details</h3>
            <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
            
            <div className="grid grid-cols-2 gap-3 text-sm mb-6">
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="text-xs text-muted-foreground">ROI (Annual)</div>
                <div className="font-semibold flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  {project.roi}%
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="text-xs text-muted-foreground">Maturity</div>
                <div className="font-semibold flex items-center">
                  <Calendar className="h-3 w-3 mr-1 text-blue-600" />
                  {project.maturityPeriod} years
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="text-xs text-muted-foreground">Location</div>
                <div className="font-semibold flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-red-600" />
                  {project.location}
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="text-xs text-muted-foreground">Type</div>
                <div className="font-semibold flex items-center">
                  <Building className="h-3 w-3 mr-1 text-primary" />
                  {project.type}
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="units">Units to Purchase</Label>
                <div className="flex items-center mt-1.5">
                  <Input
                    id="units"
                    type="number"
                    min="1"
                    max={project.availableUnits.toString()}
                    value={units}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value) || value < 1) {
                        setUnits('1');
                      } else if (value > project.availableUnits) {
                        setUnits(project.availableUnits.toString());
                      } else {
                        setUnits(e.target.value);
                      }
                    }}
                    className="text-right"
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-muted-foreground">Total investment amount:</span>
                  <span className="font-bold text-lg">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>
              
              {wallet && (
                <Alert variant={sufficientFunds ? "default" : "destructive"} className="mb-4">
                  <Wallet className="h-4 w-4 mr-2" />
                  <AlertTitle>Wallet Balance: ₦{wallet.balance.toLocaleString()}</AlertTitle>
                  <AlertDescription>
                    {sufficientFunds 
                      ? 'You have sufficient funds to make this investment.' 
                      : 'Insufficient funds. Please fund your wallet before proceeding.'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Alert variant="default">
        <AlertTitle>Confirm Your Investment</AlertTitle>
        <AlertDescription>
          Please review your investment details before proceeding.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Investment Summary</CardTitle>
          <CardDescription>Project: {project.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">Number of Units</div>
              <div className="font-semibold">{numberOfUnits}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Unit Price</div>
              <div className="font-semibold">₦{unitPrice.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Total Investment Amount</div>
              <div className="font-semibold text-lg">₦{totalAmount.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Payment Method</div>
              <div className="font-semibold">Wallet</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Expected Annual ROI</div>
              <div className="font-semibold text-green-600">{project.roi}%</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Maturity Period</div>
              <div className="font-semibold">{project.maturityPeriod} years</div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">By proceeding, you agree to the investment terms and conditions.</div>
            <div className="text-sm text-muted-foreground">The estimated completion date of this project is {new Date(project.endDate).toLocaleDateString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => setLocation('/investor/projects')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Invest in {project.title}</CardTitle>
          <CardDescription className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" /> 
            {project.location}
            <Badge variant="outline" className="ml-3">
              {project.type}
            </Badge>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="1" value={step.toString()} onValueChange={(value) => setStep(parseInt(value))}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="1">Investment Details</TabsTrigger>
              <TabsTrigger value="2" disabled={step < 2}>Confirmation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="1" className="pt-4">
              {renderStep1()}
            </TabsContent>
            
            <TabsContent value="2" className="pt-4">
              {renderStep2()}
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {step === 1 ? (
            <div className="w-full flex justify-end">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!sufficientFunds || numberOfUnits < 1}
                className="gap-1"
              >
                Continue to Confirmation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleInvest} 
                disabled={investMutation.isPending}
                className="gap-1"
              >
                {investMutation.isPending ? 'Processing...' : 'Confirm Investment'}
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default InvestNow;