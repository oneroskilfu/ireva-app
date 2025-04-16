import { useQuery } from "@tanstack/react-query";
import { BarChart3, ArrowUpRight, Users, DollarSign } from "lucide-react";
import { Property, Investment } from "@shared/schema";

interface InvestmentWithProperty extends Investment {
  property: Property;
}

export default function DashboardStats() {
  const { data: investments } = useQuery<InvestmentWithProperty[]>({
    queryKey: ["/api/investments"],
  });
  
  if (!investments) {
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
  
  // Get total number of investments (properties)
  const totalProperties = investments.length;
  
  return (
    <div className="mb-8">
      <div className="flex items-start mb-6">
        <div className="flex-1">
          <h5 className="text-slate-500 font-medium mb-1">INVESTMENTS</h5>
          <h2 className="text-5xl font-bold text-slate-900">
            ₦{totalInvested.toLocaleString()}<span className="text-slate-400 text-2xl">.00</span>
          </h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-slate-500 font-medium mb-1">PROFIT</h5>
              <h3 className="text-2xl font-bold">₦{(totalCurrentValue - totalInvested).toLocaleString()}.00</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-slate-500 font-medium mb-1">MONTHLY YIELD</h5>
              <h3 className="text-2xl font-bold">₦{Math.round(monthlyIncome).toLocaleString()}.00</h3>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <ArrowUpRight className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-slate-500 font-medium mb-1">TOTAL PROPERTIES</h5>
              <h3 className="text-2xl font-bold">{totalProperties} <span className="text-sm font-normal text-slate-500">properties</span></h3>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}