import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PaystackCheckout } from "@/components/payments/PaystackCheckout";
import { 
  Building2, 
  Calendar, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Home, 
  Info, 
  LineChart, 
  Loader2, 
  MapPin, 
  Percent, 
  ShieldCheck, 
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePageTransition } from "@/contexts/page-transition-context";

// Investment amount schema
const investmentFormSchema = z.object({
  amount: z.string()
    .min(1, { message: "Investment amount is required" })
    .refine(val => !isNaN(Number(val)), { message: "Amount must be a number" })
    .refine(val => Number(val) > 0, { message: "Amount must be greater than 0" })
});

type InvestmentFormValues = z.infer<typeof investmentFormSchema>;

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { startLoading, stopLoading } = usePageTransition();
  const [investDialogOpen, setInvestDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isInvesting, setIsInvesting] = useState(false);
  
  // Fetch property details
  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
  });

  // Setup form for investment amount
  const investmentForm = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: {
      amount: property?.minimumInvestment?.toString() || ""
    }
  });

  // Handle investment form submission
  const onInvestSubmit = (values: InvestmentFormValues) => {
    if (!property) return;
    
    const amount = Number(values.amount);
    if (amount < property.minimumInvestment) {
      toast({
        title: "Invalid amount",
        description: `Minimum investment is $${property.minimumInvestment}`,
        variant: "destructive"
      });
      return;
    }
    
    setIsInvesting(true);
  };

  // Handle successful payment
  const handlePaymentSuccess = (data: any) => {
    setIsInvesting(false);
    setInvestDialogOpen(false);
    toast({
      title: "Investment successful!",
      description: "Your investment has been processed successfully.",
    });
    // Redirect to dashboard
    startLoading();
    setTimeout(() => {
      setLocation("/dashboard");
      stopLoading();
    }, 1000);
  };

  // Handle payment error
  const handlePaymentError = (error: Error) => {
    setIsInvesting(false);
    toast({
      title: "Payment failed",
      description: error.message,
      variant: "destructive",
    });
  };

  // Function to format percentages
  const formatPercent = (num: number | string) => {
    if (typeof num === 'string') num = parseFloat(num);
    return `${num}%`;
  };

  // Calculate funding progress percentage
  const fundingProgress = property ? (property.currentFunding / property.totalFunding) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find the property you're looking for.</p>
        <Button onClick={() => setLocation("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-7xl">
      {/* Back button */}
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => setLocation("/")}
      >
        ← Back to Properties
      </Button>

      {/* Property Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Property Image */}
        <div className="md:w-1/2">
          <div className="rounded-lg overflow-hidden bg-gray-100 aspect-video">
            <img 
              src={property.imageUrl} 
              alt={property.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Property Summary */}
        <div className="md:w-1/2 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
              {property.location}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
          <p className="text-muted-foreground mb-4">{property.description}</p>
          
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Target Return</span>
              <span className="text-xl font-bold flex items-center">
                <Percent className="h-4 w-4 text-primary mr-1" />
                {formatPercent(property.targetReturn)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Minimum</span>
              <span className="text-xl font-bold flex items-center">
                <DollarSign className="h-4 w-4 text-primary mr-1" />
                ${property.minimumInvestment.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Term</span>
              <span className="text-xl font-bold flex items-center">
                <Calendar className="h-4 w-4 text-primary mr-1" />
                {property.term} months
              </span>
            </div>
          </div>
          
          {/* Funding Progress */}
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">${property.currentFunding.toLocaleString()} raised</span>
              <span className="text-sm text-muted-foreground">${property.totalFunding.toLocaleString()} target</span>
            </div>
            <Progress value={fundingProgress} className="h-2" />
            <div className="flex justify-between mt-2">
              <span className="text-sm text-muted-foreground flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {property.numberOfInvestors} investors
              </span>
              <span className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {property.daysLeft} days left
              </span>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="mt-auto">
            {user ? (
              <Dialog open={investDialogOpen} onOpenChange={setInvestDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg">
                    Invest Now
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invest in {property.name}</DialogTitle>
                    <DialogDescription>
                      Enter the amount you would like to invest. Minimum investment is ${property.minimumInvestment}.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...investmentForm}>
                    <form onSubmit={investmentForm.handleSubmit(onInvestSubmit)} className="space-y-6">
                      <FormField
                        control={investmentForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Investment Amount ($)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter amount" 
                                {...field} 
                                type="number"
                                min={property.minimumInvestment}
                              />
                            </FormControl>
                            <FormDescription>
                              Minimum investment: ${property.minimumInvestment}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        {isInvesting ? (
                          <PaystackCheckout 
                            property={property}
                            amount={Number(investmentForm.getValues().amount)}
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                          />
                        ) : (
                          <Button type="submit">
                            Continue to Payment
                          </Button>
                        )}
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            ) : (
              <Button className="w-full" size="lg" onClick={() => setLocation("/auth")}>
                Sign in to Invest
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="financials" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>Financials</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Property Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <PropertyDetailItem 
                    icon={<Building2 className="h-4 w-4 text-primary" />}
                    label="Property Type"
                    value={property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                  />
                  <PropertyDetailItem 
                    icon={<MapPin className="h-4 w-4 text-primary" />}
                    label="Location"
                    value={property.location}
                  />
                  <PropertyDetailItem 
                    icon={<Home className="h-4 w-4 text-primary" />}
                    label="Size"
                    value={property.size || "N/A"}
                  />
                  <PropertyDetailItem 
                    icon={<Calendar className="h-4 w-4 text-primary" />}
                    label="Built Year"
                    value={property.builtYear || "N/A"}
                  />
                  <PropertyDetailItem 
                    icon={<Users className="h-4 w-4 text-primary" />}
                    label="Occupancy"
                    value={property.occupancy || "N/A"}
                  />
                  <PropertyDetailItem 
                    icon={<DollarSign className="h-4 w-4 text-primary" />}
                    label="Cash Flow"
                    value={property.cashFlow || "N/A"}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Investment Overview</h3>
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-muted-foreground">Target Return</span>
                        <span className="font-semibold">{formatPercent(property.targetReturn)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-muted-foreground">Investment Term</span>
                        <span className="font-semibold">{property.term} months</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-muted-foreground">Minimum Investment</span>
                        <span className="font-semibold">${property.minimumInvestment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-muted-foreground">Total Funding Target</span>
                        <span className="font-semibold">${property.totalFunding.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-muted-foreground">Current Funding</span>
                        <span className="font-semibold">${property.currentFunding.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Number of Investors</span>
                        <span className="font-semibold">{property.numberOfInvestors}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Financials Tab */}
        <TabsContent value="financials" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Financial Projections</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Projected Return: {formatPercent(property.targetReturn)}</span>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Year 1 Return Projection</h4>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${Math.min(Number(property.targetReturn) * 0.8, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatPercent(Number(property.targetReturn) * 0.8)}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Year 3 Return Projection</h4>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${Math.min(Number(property.targetReturn) * 0.9, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatPercent(Number(property.targetReturn) * 0.9)}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Year 5 Return Projection</h4>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${Math.min(Number(property.targetReturn), 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatPercent(property.targetReturn)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Risk Assessment</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <RiskItem 
                      title="Market Risk" 
                      level="Low" 
                      description="Property is located in a stable market with consistent growth."
                    />
                    <RiskItem 
                      title="Liquidity Risk" 
                      level="Medium" 
                      description="Investment term is 5 years with limited options for early exit."
                    />
                    <RiskItem 
                      title="Operational Risk" 
                      level="Low" 
                      description="Experienced property management team with proven track record."
                    />
                    <RiskItem 
                      title="Regulatory Risk" 
                      level="Low" 
                      description="All necessary permits and approvals have been obtained."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="pt-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Security Information</h3>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium">Secure Investment Structure</h4>
                      <p className="text-sm text-muted-foreground">
                        Your investment is protected through a legal entity structure that provides security and transparency.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SecurityItem 
                      title="Legal Structure" 
                      description="Investment is made through a Special Purpose Vehicle (SPV) that owns the property."
                    />
                    <SecurityItem 
                      title="Documentation" 
                      description="Full legal documentation provided including operating agreement and subscription documents."
                    />
                    <SecurityItem 
                      title="Investor Rights" 
                      description="Clearly defined investor rights including profit distributions and voting rights on major decisions."
                    />
                    <SecurityItem 
                      title="Reporting" 
                      description="Regular financial reporting and updates on property performance and market conditions."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <h3 className="text-xl font-semibold mb-4">Compliance Information</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground mb-4">
                    All investments are made in compliance with relevant securities regulations. Investment opportunities 
                    are available to accredited and non-accredited investors as permitted by applicable exemptions.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ComplianceItem 
                      title="KYC/AML Procedures" 
                      description="We implement comprehensive Know Your Customer and Anti-Money Laundering procedures."
                    />
                    <ComplianceItem 
                      title="Tax Documentation" 
                      description="Annual tax documents provided for all investors for easy tax reporting."
                    />
                    <ComplianceItem 
                      title="Regulatory Compliance" 
                      description="Platform operates in compliance with relevant securities regulations and exemptions."
                    />
                    <ComplianceItem 
                      title="Data Security" 
                      description="Bank-level encryption and security measures to protect your personal and financial information."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Property Detail Item Component
interface PropertyDetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function PropertyDetailItem({ icon, label, value }: PropertyDetailItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

// Risk Item Component
interface RiskItemProps {
  title: string;
  level: "Low" | "Medium" | "High";
  description: string;
}

function RiskItem({ title, level, description }: RiskItemProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Low":
        return "text-green-500 bg-green-50";
      case "Medium":
        return "text-yellow-500 bg-yellow-50";
      case "High":
        return "text-red-500 bg-red-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };
  
  return (
    <div className="pb-4 border-b last:border-0 last:pb-0">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{title}</h4>
        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getLevelColor(level))}>
          {level}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// Security Item Component
interface SecurityItemProps {
  title: string;
  description: string;
}

function SecurityItem({ title, description }: SecurityItemProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// Compliance Item Component
interface ComplianceItemProps {
  title: string;
  description: string;
}

function ComplianceItem({ title, description }: ComplianceItemProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}