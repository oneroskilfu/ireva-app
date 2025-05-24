import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Property, Investment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Check, AlertTriangle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

interface InvestmentWithProperty extends Investment {
  property: Property;
}

export default function ActiveProjects() {
  const { data: investments, isLoading, error } = useQuery<InvestmentWithProperty[]>({
    queryKey: ["/api/investments"],
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !investments) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Failed to load your investments. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }
  
  const activeInvestments = investments.filter(inv => inv.status === "active");
  
  if (activeInvestments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">You don't have any active investments.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Group by property
  const groupedInvestments = activeInvestments.reduce((acc, investment) => {
    const propertyId = investment.propertyId;
    if (!acc[propertyId]) {
      acc[propertyId] = {
        property: investment.property,
        investments: []
      };
    }
    acc[propertyId].investments.push(investment);
    return acc;
  }, {} as Record<number, { property: Property; investments: Investment[] }>);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.values(groupedInvestments).map(({ property, investments }) => {
        const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
        const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
        const percentGain = ((totalCurrentValue - totalInvested) / totalInvested) * 100;
        
        // Calculate time remaining
        const investmentDate = investments[0].date ? new Date(investments[0].date) : new Date();
        const termEndDate = new Date(investmentDate);
        termEndDate.setMonth(termEndDate.getMonth() + property.term);
        const today = new Date();
        const monthsRemaining = Math.round((termEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
        
        // Project status indicator
        let statusIndicator;
        const fundingPercentage = Math.round((property.currentFunding / property.totalFunding) * 100);
        
        if (fundingPercentage >= 100) {
          statusIndicator = <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"><Check className="h-3 w-3 mr-1" />Fully Funded</Badge>;
        } else if (property.daysLeft && property.daysLeft <= 7) {
          statusIndicator = <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100"><AlertTriangle className="h-3 w-3 mr-1" />Closing Soon</Badge>;
        } else {
          statusIndicator = <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
        }
        
        return (
          <Card key={property.id} className="overflow-hidden">
            <div className="relative">
              <img 
                src={property.imageUrl} 
                alt={property.name} 
                className="h-40 w-full object-cover"
              />
              <div className="absolute top-2 right-2">
                {statusIndicator}
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{property.name}</CardTitle>
              <CardDescription>{property.location}</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Invested</p>
                  <p className="text-sm font-medium">${totalInvested.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Value</p>
                  <p className="text-sm font-medium">${totalCurrentValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Return</p>
                  <p className="text-sm font-medium text-emerald-600">
                    {percentGain >= 0 ? '+' : ''}{percentGain.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Time Remaining</p>
                  <p className="text-sm font-medium">{monthsRemaining} months</p>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{fundingPercentage}% Funded</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded">
                  <div 
                    className="h-full bg-emerald-400 rounded" 
                    style={{ width: `${fundingPercentage}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-3 pb-3">
              <Link href={`/properties/${property.id}`} className="w-full">
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}