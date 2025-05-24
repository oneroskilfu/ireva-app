import { useQuery } from "@tanstack/react-query";
import { Property, Investment } from "@shared/schema";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvestmentWithProperty extends Investment {
  property: Property;
}

// Group investments by property type and calculate totals
function getInvestmentsByPropertyType(investments: InvestmentWithProperty[]) {
  const types: Record<string, { amount: number, count: number, percentageAmount: number }> = {};
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  
  // Initialize with property types from schema to ensure all types appear
  ["residential", "commercial", "industrial", "mixed-use"].forEach(type => {
    types[type] = { amount: 0, count: 0, percentageAmount: 0 };
  });
  
  // Tally investments by property type
  investments.forEach(inv => {
    const type = inv.property.type;
    types[type].amount += inv.amount;
    types[type].count += 1;
  });
  
  // Calculate percentages
  Object.keys(types).forEach(type => {
    types[type].percentageAmount = (types[type].amount / totalInvested) * 100;
  });
  
  return { types, totalInvested };
}

// Get color for property type
function getPropertyTypeColor(type: string) {
  const colors: Record<string, { bg: string, text: string, bar: string }> = {
    'residential': { bg: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-500' },
    'commercial': { bg: 'bg-yellow-100', text: 'text-yellow-600', bar: 'bg-yellow-500' },
    'industrial': { bg: 'bg-purple-100', text: 'text-purple-600', bar: 'bg-purple-500' },
    'mixed-use': { bg: 'bg-green-100', text: 'text-green-600', bar: 'bg-green-500' }
  };
  
  return colors[type] || { bg: 'bg-gray-100', text: 'text-gray-600', bar: 'bg-gray-500' };
}

// Format property type for display
function formatPropertyType(type: string) {
  return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export default function InvestmentBreakdown() {
  const { data: investments, isLoading } = useQuery<InvestmentWithProperty[]>({
    queryKey: ["/api/investments"],
  });
  
  if (!investments || investments.length === 0) {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold">Investment Breakdown</h4>
          <Button size="sm" variant="ghost" className="text-sm gap-1">
            View all <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="py-8 text-center text-slate-500">
          No investment data available yet.
        </div>
      </div>
    );
  }
  
  const { types, totalInvested } = getInvestmentsByPropertyType(investments);
  
  // Sort property types by investment amount (descending)
  const sortedTypes = Object.entries(types)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .filter(([, data]) => data.amount > 0);
  
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-semibold">Investment By Property Type</h4>
        <Button size="sm" variant="ghost" className="text-sm gap-1">
          View all <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-6">
        {sortedTypes.map(([type, data]) => (
          <div key={type}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${getPropertyTypeColor(type).bar} mr-2`}></div>
                <span className="font-medium">{formatPropertyType(type)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">₦{data.amount.toLocaleString()}</span>
                <span className="text-xs text-slate-500">({data.percentageAmount.toFixed(1)}%)</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className={`${getPropertyTypeColor(type).bar} h-2 rounded-full`} 
                style={{ width: `${data.percentageAmount}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}