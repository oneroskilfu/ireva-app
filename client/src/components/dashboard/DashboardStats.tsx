import { useQuery } from "@tanstack/react-query";
import { BarChart3, ArrowUpRight, DollarSign, TrendingUp, Wallet } from "lucide-react";
import { Property, Investment } from "@shared/schema";
import { Progress } from "@/components/ui/progress";

interface InvestmentWithProperty extends Investment {
  property: Property;
}

export default function DashboardStats() {
  const { data: investments } = useQuery<InvestmentWithProperty[]>({
    queryKey: ["/api/investments"],
  });
  
  // Sample goal amount for demonstration
  const investmentGoal = 10000000; // ₦10 million goal
  
  if (!investments || investments.length === 0) {
    return (
      <div className="mb-6">
        {/* Mobile view stats card */}
        <div className="md:hidden bg-white rounded-xl shadow-sm mb-4">
          <div className="p-4">
            <h3 className="font-medium mb-2">Investment Goal</h3>
            <Progress value={0} className="h-2 mb-1" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Funded: 0%</span>
              <span>Goal: ₦{investmentGoal.toLocaleString()}</span>
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Min. Investment</span>
                <span className="font-medium">₦100,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Invested</span>
                <span className="font-medium">₦0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Monthly Yield</span>
                <span className="font-medium">₦0</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop view stats grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-slate-500 font-medium mb-1">TOTAL INVESTED</h5>
                <h3 className="text-2xl font-bold">₦0.00</h3>
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
                <h3 className="text-2xl font-bold">₦0.00</h3>
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
                <h3 className="text-2xl font-bold">0 <span className="text-sm font-normal text-slate-500">properties</span></h3>
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
  
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalGrowth = ((totalCurrentValue - totalInvested) / totalInvested) * 100;
  const percentToGoal = Math.min(100, Math.round((totalInvested / investmentGoal) * 100));
  
  // Calculate monthly income
  const monthlyIncome = investments.reduce((sum, inv) => {
    // Convert targetReturn to a number if it's a string
    const targetReturnRate = typeof inv.property.targetReturn === 'string'
      ? parseFloat(inv.property.targetReturn)
      : inv.property.targetReturn;
    
    const monthlyReturn = (inv.amount * (targetReturnRate / 100)) / 12;
    return sum + monthlyReturn;
  }, 0);
  
  // Get total number of investments (properties)
  const totalProperties = investments.length;
  
  return (
    <div className="mb-6">
      {/* Mobile view stats card */}
      <div className="md:hidden bg-white rounded-xl shadow-sm mb-4">
        <div className="p-4">
          <h3 className="font-medium mb-2">Investment Goal</h3>
          <Progress value={percentToGoal} className="h-2 mb-1" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Funded: {percentToGoal}%</span>
            <span>Goal: ₦{investmentGoal.toLocaleString()}</span>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Min. Investment</span>
              <span className="font-medium">₦100,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Invested</span>
              <span className="font-medium">₦{totalInvested.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Monthly Yield</span>
              <span className="font-medium">₦{Math.round(monthlyIncome).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Properties</span>
              <span className="font-medium">{totalProperties}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop view stats */}
      <div className="hidden md:block mb-6">
        <div className="flex items-start mb-4">
          <div className="flex-1">
            <div className="flex justify-between items-end">
              <div>
                <h5 className="text-slate-500 font-medium mb-1">TOTAL INVESTMENT</h5>
                <h2 className="text-5xl font-bold text-slate-900">
                  ₦{totalInvested.toLocaleString()}<span className="text-slate-400 text-2xl">.00</span>
                </h2>
              </div>
              <div>
                <h5 className="text-slate-500 font-medium mb-1">INVESTMENT GOAL</h5>
                <h3 className="text-2xl font-bold text-emerald-700">₦{investmentGoal.toLocaleString()}</h3>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={percentToGoal} className="h-2 mb-1" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Funded: {percentToGoal}%</span>
                <span>Min. Investment: ₦100,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop view stats grid */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-xs text-slate-500 font-medium mb-1">TOTAL PORTFOLIO</h5>
              <h3 className="text-xl font-bold">₦{totalCurrentValue.toLocaleString()}</h3>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-xs text-slate-500 font-medium mb-1">PROFIT</h5>
              <h3 className="text-xl font-bold">₦{(totalCurrentValue - totalInvested).toLocaleString()}</h3>
            </div>
            <div className="bg-green-50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-xs text-slate-500 font-medium mb-1">MONTHLY YIELD</h5>
              <h3 className="text-xl font-bold">₦{Math.round(monthlyIncome).toLocaleString()}</h3>
            </div>
            <div className="bg-amber-50 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-xs text-slate-500 font-medium mb-1">PROPERTIES</h5>
              <h3 className="text-xl font-bold">{totalProperties}</h3>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}