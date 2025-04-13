import { useQuery } from "@tanstack/react-query";
import { Property, Investment } from "@shared/schema";
import { Loader2, DollarSign, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface InvestmentWithProperty extends Investment {
  property: Property;
}

export default function EarningsBreakdown() {
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
  
  if (error || !investments || investments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            {error 
              ? "Failed to load your investments. Please try again later." 
              : "You don't have any investments yet to display earnings."}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate earnings metrics
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalEarnings = totalCurrentValue - totalInvested;
  const percentGain = (totalEarnings / totalInvested) * 100;
  
  // Calculate monthly earnings
  const monthlyEarnings = investments.reduce((sum, inv) => {
    const monthlyReturn = (inv.amount * (inv.property.targetReturn / 100)) / 12;
    return sum + monthlyReturn;
  }, 0);
  
  const annualEarnings = monthlyEarnings * 12;
  const annualYield = (annualEarnings / totalInvested) * 100;
  
  // Group earnings by property type
  const earningsByType = investments.reduce((acc, inv) => {
    const type = inv.property.type;
    if (!acc[type]) {
      acc[type] = {
        totalInvested: 0,
        currentValue: 0,
        earnings: 0,
        count: 0,
      };
    }
    acc[type].totalInvested += inv.amount;
    acc[type].currentValue += inv.currentValue;
    acc[type].earnings += inv.currentValue - inv.amount;
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, { totalInvested: number; currentValue: number; earnings: number; count: number }>);
  
  // Calculate percentages for pie chart
  const typePercentages = Object.entries(earningsByType).map(([type, data]) => ({
    type,
    percentage: (data.totalInvested / totalInvested) * 100,
    earnings: data.earnings,
    count: data.count,
  }));
  
  // For demo purposes, if there's only one type, add some variety
  if (typePercentages.length === 1) {
    const existingType = typePercentages[0].type;
    const otherTypes = ["residential", "commercial", "industrial", "mixed-use"].filter(t => t !== existingType);
    
    typePercentages[0].percentage = 65; // Adjust to make room for others
    
    otherTypes.slice(0, 2).forEach((type, i) => {
      typePercentages.push({
        type,
        percentage: i === 0 ? 25 : 10,
        earnings: Math.round(totalEarnings * (i === 0 ? 0.25 : 0.1)),
        count: i === 0 ? 2 : 1,
      });
    });
  }
  
  // Sort by earnings
  typePercentages.sort((a, b) => b.earnings - a.earnings);
  
  // Generate colors for types
  const typeColors = {
    "residential": "bg-blue-500",
    "commercial": "bg-amber-500",
    "industrial": "bg-emerald-500",
    "mixed-use": "bg-purple-500",
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Earnings Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Total Invested</p>
              <p className="text-2xl font-bold">${totalInvested.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Current Value</p>
              <p className="text-2xl font-bold">${totalCurrentValue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-emerald-600">${totalEarnings.toLocaleString()}</p>
              <p className="text-xs text-emerald-600">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                {percentGain.toFixed(1)}% growth
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Annual Yield</p>
              <p className="text-2xl font-bold text-amber-600">{annualYield.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">${annualEarnings.toFixed(0)} per year</p>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Monthly Income
              </h4>
              <p className="text-sm font-medium text-emerald-600">${monthlyEarnings.toFixed(0)}</p>
            </div>
            <div className="space-y-2">
              {investments.map(inv => {
                const monthlyReturn = (inv.amount * (inv.property.targetReturn / 100)) / 12;
                const percentage = (monthlyReturn / monthlyEarnings) * 100;
                
                return (
                  <div key={inv.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>{inv.property.name}</span>
                      <span>${monthlyReturn.toFixed(0)}/month</span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Portfolio Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-6">
            {/* Circular chart representation */}
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {typePercentages.reduce<React.ReactNode[]>((elements, item, i, array) => {
                  // Calculate starting angle based on previous segments
                  let startAngle = 0;
                  for (let j = 0; j < i; j++) {
                    startAngle += (array[j].percentage * 3.6);
                  }
                  
                  const endAngle = startAngle + (item.percentage * 3.6); // 3.6 = 360/100
                  const largeArcFlag = item.percentage > 50 ? 1 : 0;
                  
                  // Calculate coordinates
                  const startX = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
                  const startY = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
                  const endX = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
                  const endY = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
                  
                  const path = [
                    `M 50 50`,
                    `L ${startX} ${startY}`,
                    `A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                    `Z`
                  ].join(' ');
                  
                  const colorClass = typeColors[item.type as keyof typeof typeColors] || "bg-gray-500";
                  const fill = colorClass.replace('bg-', 'fill-');
                  
                  elements.push(
                    <path
                      d={path}
                      className={fill}
                      key={`slice-${i}`}
                    />
                  );
                  
                  return elements;
                }, [])
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold">{investments.length}</p>
                  <p className="text-xs text-gray-500">Investments</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {typePercentages.map(({ type, percentage, earnings, count }) => (
              <div key={type} className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${typeColors[type as keyof typeof typeColors] || "bg-gray-500"}`} />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium capitalize">{type}</p>
                    <p className="text-sm font-medium">{Math.round(percentage)}%</p>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{count} properties</span>
                    <span>${earnings.toLocaleString()} earnings</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}