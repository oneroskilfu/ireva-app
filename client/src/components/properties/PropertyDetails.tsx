import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  BarChart4, 
  Building2, 
  CheckCircle2, 
  FileText, 
  HelpCircle,
  Info, 
  Loader2, 
  Mail, 
  MessageSquare, 
  Phone, 
  Shield, 
  Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface PropertyDetailsProps {
  property: Property;
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [investmentAmount, setInvestmentAmount] = useState(property.minimumInvestment.toString());
  const [selectedImage, setSelectedImage] = useState(property.imageUrl);
  
  const fundingPercentage = Math.round((property.currentFunding / property.totalFunding) * 100);
  
  // Additional mock images for the property
  const additionalImages = [
    "https://images.unsplash.com/photo-1587064712555-6e206484699b?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1524549207884-e7d1130ae2f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
  ];
  
  // Parse and format investment amount
  const parseAmount = (value: string): number => {
    return parseInt(value.replace(/,/g, "")) || property.minimumInvestment;
  };
  
  const formatAmount = (value: number): string => {
    return value.toLocaleString();
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    if (rawValue) {
      const numValue = parseInt(rawValue);
      setInvestmentAmount(formatAmount(numValue));
    } else {
      setInvestmentAmount("");
    }
  };
  
  const setMinAmount = () => {
    setInvestmentAmount(formatAmount(property.minimumInvestment));
  };
  
  const setMaxAmount = () => {
    // Set a realistic max amount (e.g., 10% of remaining funding or $100k, whichever is smaller)
    const remainingFunding = property.totalFunding - property.currentFunding;
    const maxAmount = Math.min(remainingFunding * 0.1, 100000);
    setInvestmentAmount(formatAmount(Math.max(property.minimumInvestment, Math.floor(maxAmount))));
  };
  
  // Calculate returns based on investment amount
  const amount = parseAmount(investmentAmount);
  const targetReturnRate = parseFloat(property.targetReturn.toString()) / 100;
  const monthlyReturn = ((amount * targetReturnRate) / 12).toFixed(0);
  const annualReturn = (amount * targetReturnRate).toFixed(0);
  const totalReturnRate = 1 + (targetReturnRate * (property.term / 12));
  const totalReturn = (amount * totalReturnRate).toFixed(0);
  
  // Investment mutation
  const investMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to invest");
      }
      
      const res = await apiRequest("POST", "/api/investments", {
        propertyId: property.id,
        amount: parseAmount(investmentAmount),
        currentValue: parseAmount(investmentAmount)
      });
      
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Investment successful!",
        description: `You have successfully invested ₦${formatAmount(parseAmount(investmentAmount))} in ${property.name}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${property.id}`] });
      
      // Navigate to dashboard
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Investment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleInvest = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in or create an account to invest.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (parseAmount(investmentAmount) < property.minimumInvestment) {
      toast({
        title: "Invalid amount",
        description: `Minimum investment is ₦${formatAmount(property.minimumInvestment)}.`,
        variant: "destructive",
      });
      return;
    }
    
    investMutation.mutate();
  };
  
  // Determine risk level with appropriate color and icon
  const getRiskLevelInfo = () => {
    const riskLevel = property.riskLevel || "medium";
    
    switch(riskLevel.toLowerCase()) {
      case "low":
        return { 
          color: "text-green-600 bg-green-50", 
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          description: "Conservative investment with stable returns and minimal volatility. Suitable for risk-averse investors seeking capital preservation."
        };
      case "high":
        return { 
          color: "text-red-600 bg-red-50", 
          icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
          description: "Aggressive investment with potential for higher returns but significant volatility. Only suitable for investors with high risk tolerance."
        };
      default: // medium
        return { 
          color: "text-amber-600 bg-amber-50", 
          icon: <Info className="h-5 w-5 text-amber-600" />,
          description: "Balanced investment with moderate return potential and some volatility. Suitable for investors with moderate risk tolerance."
        };
    }
  };
  
  const riskInfo = getRiskLevelInfo();
  
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Top Section: Property Images and Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="relative aspect-w-16 aspect-h-9 mb-4">
            <img 
              className="rounded-md object-cover w-full h-64" 
              src={selectedImage} 
              alt={property.name}
            />
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[property.imageUrl, ...additionalImages].map((image, index) => (
              <img 
                key={index}
                className="h-20 w-full object-cover rounded cursor-pointer border-2 transition-all"
                style={{ borderColor: selectedImage === image ? 'hsl(222, 80%, 40%)' : 'transparent' }}
                src={image} 
                alt={`${property.name} view ${index + 1}`}
                onClick={() => setSelectedImage(image)}
              />
            ))}
          </div>
          
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Property Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium capitalize">{property.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{property.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Size</p>
                <p className="font-medium">{property.size}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Built</p>
                <p className="font-medium">{property.builtYear}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Occupancy</p>
                <p className="font-medium">{property.occupancy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cash Flow</p>
                <p className="font-medium">{property.cashFlow}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-lg mb-3">Investment Opportunity</h4>
          <p className="text-gray-700 mb-4">{property.description}</p>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{fundingPercentage}% Funded</span>
              <span className="text-gray-500">
                ₦{(property.currentFunding / 1000000).toFixed(1)}M / ₦{(property.totalFunding / 1000000).toFixed(1)}M
              </span>
            </div>
            <Progress value={fundingPercentage} className="h-2" />
            <div className="flex justify-between text-xs mt-1">
              <span>{property.numberOfInvestors} investors</span>
              <span>{property.daysLeft} days left</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="bg-gray-50">
              <CardContent className="p-3">
                <p className="text-sm text-gray-500">Target Return</p>
                <p className="text-xl font-medium text-amber-600">{property.targetReturn}%</p>
                <p className="text-xs text-gray-500">Annual projected yield</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50">
              <CardContent className="p-3">
                <p className="text-sm text-gray-500">Investment Term</p>
                <p className="text-xl font-medium">{property.term} months</p>
                <p className="text-xs text-gray-500">Expected hold period</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Investor Risk Level Assessment */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-md">Investor Level Assessment</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-64 text-xs">
                      This indicates the recommended investor experience level for this property.
                      Low risk is suitable for beginners, medium for intermediate investors, and
                      high for experienced investors.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Card className={`border-l-4 ${riskInfo.color.split(' ')[0].replace('text', 'border')}`}>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className={`rounded-full p-2 mr-3 ${riskInfo.color}`}>
                    {riskInfo.icon}
                  </div>
                  <div>
                    <h5 className="font-semibold mb-1 flex items-center">
                      {property.riskLevel || "Medium"} Risk
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        ({property.accreditedOnly ? "Accredited investors only" : "All investors"})
                      </span>
                    </h5>
                    <p className="text-sm text-gray-600">{riskInfo.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Investment Simulation */}
      <div className="mb-6">
        <h4 className="font-semibold text-lg mb-3">Investment Simulation</h4>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <span className="text-sm font-medium mr-2">Investment Amount:</span>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₦</span>
                </div>
                <Input
                  type="text"
                  value={investmentAmount}
                  onChange={handleAmountChange}
                  className="pl-7 pr-20"
                  placeholder={property.minimumInvestment.toString()}
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-6 px-1 mr-1"
                    onClick={setMinAmount}
                  >
                    Min
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-6 px-1 mr-2"
                    onClick={setMaxAmount}
                  >
                    Max
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-500">Monthly Return</p>
                <p className="text-lg font-medium text-primary">₦{monthlyReturn}</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-500">Annual Return</p>
                <p className="text-lg font-medium text-primary">₦{annualReturn}</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-500">Total Return</p>
                <p className="text-lg font-medium text-primary">₦{totalReturn}</p>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleInvest}
              disabled={investMutation.isPending}
            >
              {investMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : "Invest Now"}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for Additional Information */}
      <div className="mb-6">
        <Tabs defaultValue="guide" className="w-full">
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger value="guide" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Investment Guide
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Risk Assessment
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Support
            </TabsTrigger>
          </TabsList>
          
          {/* Investment Guide Tab */}
          <TabsContent value="guide" className="border rounded-md p-4">
            <h4 className="font-semibold text-lg mb-3 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Investment Guide for {property.name}
            </h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-md mb-2">How Your Investment Works</h5>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start">
                    <div className="bg-primary/10 rounded-full p-1 mr-3 text-primary">
                      <span className="font-semibold text-xs">1</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Initial Investment:</span> Minimum investment of ₦{formatAmount(property.minimumInvestment)}. Your capital is pooled with other investors to fund the property.
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary/10 rounded-full p-1 mr-3 text-primary">
                      <span className="font-semibold text-xs">2</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Income Distribution:</span> You'll receive quarterly distributions based on your ownership percentage. These payments represent your share of the property's rental income.
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary/10 rounded-full p-1 mr-3 text-primary">
                      <span className="font-semibold text-xs">3</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Exit Strategy:</span> At the end of the {property.term} month term, the property will be sold and proceeds distributed to investors proportionally, or you may have an option to continue holding your investment.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-md mb-2">Key Documents</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="outline" className="text-sm justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Private Placement Memorandum
                  </Button>
                  <Button variant="outline" className="text-sm justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Operating Agreement
                  </Button>
                  <Button variant="outline" className="text-sm justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Due Diligence Report
                  </Button>
                  <Button variant="outline" className="text-sm justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Financial Projections
                  </Button>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-md mb-2">Developer Information</h5>
                <Card className="bg-gray-50">
                  <CardContent className="p-3">
                    <div className="flex items-center mb-2">
                      <Building2 className="h-5 w-5 mr-2 text-gray-700" />
                      <h6 className="font-medium">{property.developer || "Aspire Development Group"}</h6>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {property.developerProfile || "Established real estate developer with over 10 years of experience in commercial and residential projects across Nigeria. Successfully completed 15+ projects with consistent returns for investors."}
                    </p>
                    <div className="text-sm">
                      <div className="flex items-center text-gray-600">
                        <BarChart4 className="h-4 w-4 mr-1" />
                        <span>12 previous projects</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>500+ investors</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Risk Assessment Tab */}
          <TabsContent value="risk" className="border rounded-md p-4">
            <h4 className="font-semibold text-lg mb-3 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Risk Assessment
            </h4>
            
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-3">
                Every investment involves risk. The assessment below provides a detailed breakdown of various risk factors specific to this property.
              </p>
              
              <div className="space-y-3">
                <div className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-1">
                    <h6 className="font-medium text-sm">Market Risk</h6>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                      <span className="text-xs font-medium">Medium</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    Possibility of property value fluctuation due to changes in the local real estate market, economic conditions, or demand for similar properties.
                  </p>
                </div>
                
                <div className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-1">
                    <h6 className="font-medium text-sm">Liquidity Risk</h6>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div className="bg-red-500 h-2.5 rounded-full" style={{ width: "80%" }}></div>
                      </div>
                      <span className="text-xs font-medium">High</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    Real estate investments are generally illiquid. Limited opportunities to sell your investment before the end of the investment term.
                  </p>
                </div>
                
                <div className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-1">
                    <h6 className="font-medium text-sm">Developer Risk</h6>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "35%" }}></div>
                      </div>
                      <span className="text-xs font-medium">Low</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    Risk associated with the developer's ability to complete the project on time and within budget. This developer has a strong track record.
                  </p>
                </div>
                
                <div className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-1">
                    <h6 className="font-medium text-sm">Regulatory Risk</h6>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: "50%" }}></div>
                      </div>
                      <span className="text-xs font-medium">Medium</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    Changes in laws, regulations, zoning, or tax policies that may affect the property's value or projected returns.
                  </p>
                </div>
              </div>
            </div>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h6 className="font-medium text-sm text-blue-800">Diversification Recommendation</h6>
                    <p className="text-xs text-blue-700">
                      We recommend investing no more than 10-15% of your total investment portfolio in any single property investment. Diversify across multiple properties with different risk profiles for optimal portfolio balance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Customer Support Tab */}
          <TabsContent value="support" className="border rounded-md p-4">
            <h4 className="font-semibold text-lg mb-3 flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Customer Support
            </h4>
            
            <p className="text-sm text-gray-700 mb-4">
              Have questions about this investment opportunity? Our support team is ready to assist you through multiple channels:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="border-t-4 border-t-blue-500">
                <CardContent className="p-4 text-center">
                  <Phone className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h5 className="font-medium text-sm mb-1">Phone Support</h5>
                  <p className="text-xs text-gray-600 mb-2">Available 8AM - 6PM WAT</p>
                  <Button variant="outline" size="sm" className="w-full">
                    +234 (0) 123-4567
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-green-500">
                <CardContent className="p-4 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h5 className="font-medium text-sm mb-1">Live Chat</h5>
                  <p className="text-xs text-gray-600 mb-2">Instant assistance</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-purple-500">
                <CardContent className="p-4 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h5 className="font-medium text-sm mb-1">Email</h5>
                  <p className="text-xs text-gray-600 mb-2">Response within 24 hours</p>
                  <Button variant="outline" size="sm" className="w-full">
                    support@ireva.com
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="rounded-lg bg-gray-50 p-4">
              <h5 className="font-medium text-sm mb-2">Schedule a Consultation</h5>
              <p className="text-xs text-gray-600 mb-3">
                For personal investment advice related to this property, schedule a one-on-one consultation with our investment specialists.
              </p>
              <Button className="w-full sm:w-auto">Book Consultation</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
