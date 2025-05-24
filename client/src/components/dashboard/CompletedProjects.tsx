import { useQuery } from "@tanstack/react-query";
import { Property, Investment } from "@shared/schema";
import { Loader2, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InvestmentWithProperty extends Investment {
  property: Property;
}

export default function CompletedProjects() {
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
  
  const completedInvestments = investments.filter(inv => inv.status === "completed");
  
  if (completedInvestments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">You don't have any completed investments yet.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Group by property
  const groupedInvestments = completedInvestments.reduce((acc, investment) => {
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
  
  // For demo, if no completed investments, we'll create a mock completed property
  // This would be removed in production with real data
  if (Object.keys(groupedInvestments).length === 0) {
    // Create a sample completed investment for the first property
    const demoProperty = investments[0]?.property;
    if (demoProperty) {
      const demoInvestment = investments[0];
      const initialAmount = demoInvestment.amount;
      
      groupedInvestments[demoProperty.id] = {
        property: demoProperty,
        investments: [{
          ...demoInvestment,
          status: "completed" as any,
          currentValue: initialAmount * 1.25, // 25% return
          completedDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
          earnings: Math.round(initialAmount * 0.25)
        }]
      };
    }
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.values(groupedInvestments).map(({ property, investments }) => {
        const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
        const totalEarnings = investments.reduce((sum, inv) => sum + (inv.earnings || 0), 0);
        const totalReturned = totalInvested + totalEarnings;
        const roi = (totalEarnings / totalInvested) * 100;
        
        // Get completion date
        const startDate = investments[0].date ? new Date(investments[0].date) : new Date();
        
        // Create a copy of startDate for calculation to avoid modifying the original
        const endDate = new Date(startDate.getTime());
        
        const completionDate = investments[0].completedDate 
          ? new Date(investments[0].completedDate) 
          : new Date(endDate.setMonth(
              endDate.getMonth() + property.term
            ));
        
        return (
          <Card key={property.id} className="overflow-hidden">
            <div className="h-2 bg-emerald-500 w-full"></div>
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <img 
                src={property.imageUrl} 
                alt={property.name} 
                className="h-14 w-14 rounded-md object-cover"
              />
              <div>
                <CardTitle className="text-lg">{property.name}</CardTitle>
                <p className="text-sm text-gray-500">{property.location}</p>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">Investment Period</p>
                  <p className="text-sm font-medium">
                    {startDate.toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })} - {completionDate.toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                  <Award className="h-3.5 w-3.5 mr-1" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-500">Initial Investment</p>
                  <p className="text-lg font-medium">${totalInvested.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-500">Total Returned</p>
                  <p className="text-lg font-medium">${totalReturned.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-500">Earnings</p>
                  <p className="text-lg font-medium text-emerald-600">${totalEarnings.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-500">ROI</p>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-emerald-600" />
                    <p className="text-lg font-medium text-emerald-600">{roi.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}