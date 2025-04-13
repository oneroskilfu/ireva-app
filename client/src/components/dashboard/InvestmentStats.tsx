import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { Property, Investment } from "@shared/schema";

interface InvestmentWithProperty extends Investment {
  property: Property;
}

export default function InvestmentStats() {
  const { data: investments } = useQuery<InvestmentWithProperty[]>({
    queryKey: ["/api/investments"],
  });
  
  if (!investments || investments.length === 0) {
    return null;
  }
  
  // Calculate total investment stats
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalGrowth = ((totalCurrentValue - totalInvested) / totalInvested) * 100;
  
  // Calculate monthly income
  const monthlyIncome = investments.reduce((sum, inv) => {
    const monthlyReturn = (inv.amount * (inv.property.targetReturn / 100)) / 12;
    return sum + monthlyReturn;
  }, 0);
  
  // Get active properties count and unique locations
  const activeInvestments = investments.length;
  const uniqueLocations = new Set(investments.map(inv => inv.property.location)).size;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-500">Total Invested</p>
        <p className="text-2xl font-bold">${totalInvested.toLocaleString()}</p>
        <div className="flex items-center mt-1">
          <span className="text-xs text-emerald-700 font-medium">
            <ArrowUpRight className="inline h-3 w-3 mr-1" />
            {totalGrowth.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 ml-2">total growth</span>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-500">Current Value</p>
        <p className="text-2xl font-bold">${totalCurrentValue.toLocaleString()}</p>
        <div className="flex items-center mt-1">
          <span className="text-xs text-emerald-700 font-medium">
            <ArrowUpRight className="inline h-3 w-3 mr-1" />
            ${(totalCurrentValue - totalInvested).toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 ml-2">total return</span>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-500">Monthly Income</p>
        <p className="text-2xl font-bold">${monthlyIncome.toFixed(0)}</p>
        <div className="flex items-center mt-1">
          <span className="text-xs text-emerald-700 font-medium">
            <ArrowUpRight className="inline h-3 w-3 mr-1" />
            {((monthlyIncome * 12) / totalInvested * 100).toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 ml-2">yield</span>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-500">Active Investments</p>
        <p className="text-2xl font-bold">{activeInvestments}</p>
        <div className="flex items-center mt-1">
          <span className="text-xs text-gray-500">across {uniqueLocations} location{uniqueLocations !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
