import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

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
  const monthlyReturn = ((amount * (property.targetReturn / 100)) / 12).toFixed(0);
  const annualReturn = (amount * (property.targetReturn / 100)).toFixed(0);
  const totalReturnRate = 1 + ((property.targetReturn / 100) * (property.term / 12));
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
        description: `You have successfully invested $${formatAmount(parseAmount(investmentAmount))} in ${property.name}.`,
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
        description: `Minimum investment is $${formatAmount(property.minimumInvestment)}.`,
        variant: "destructive",
      });
      return;
    }
    
    investMutation.mutate();
  };
  
  return (
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
              ${(property.currentFunding / 1000000).toFixed(1)}M / ${(property.totalFunding / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded">
            <div 
              className="h-full bg-emerald-400 rounded" 
              style={{ width: `${fundingPercentage}%` }}
            ></div>
          </div>
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
        
        <div className="mb-6">
          <h4 className="font-semibold text-md mb-2">Investment Simulation</h4>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <span className="text-sm font-medium mr-2">Investment Amount:</span>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
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
                  <p className="text-lg font-medium text-primary">${monthlyReturn}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Annual Return</p>
                  <p className="text-lg font-medium text-primary">${annualReturn}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Total Return</p>
                  <p className="text-lg font-medium text-primary">${totalReturn}</p>
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
      </div>
    </div>
  );
}
