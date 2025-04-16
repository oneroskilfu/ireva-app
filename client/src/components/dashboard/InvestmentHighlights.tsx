import { useQuery } from "@tanstack/react-query";
import { Property, Investment } from "@shared/schema";
import { ChevronRight, ExternalLink, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvestmentWithProperty extends Investment {
  property: Property;
}

export default function InvestmentHighlights() {
  const { data: investments, isLoading } = useQuery<InvestmentWithProperty[]>({
    queryKey: ["/api/investments"],
  });
  
  if (!investments || investments.length === 0) {
    return (
      <div className="bg-slate-800 text-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold">Top Performing Investments</h4>
          <Button size="sm" variant="ghost" className="text-sm text-white gap-1">
            View all <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="py-8 text-center text-slate-300">
          No investment data available yet.
        </div>
      </div>
    );
  }
  
  // Calculate return rates for each investment
  const enrichedInvestments = investments.map(investment => {
    const percentGain = ((investment.currentValue - investment.amount) / investment.amount) * 100;
    return {
      ...investment,
      percentGain
    };
  });
  
  // Sort by highest percentage gain and take top 3
  const topPerformers = [...enrichedInvestments]
    .sort((a, b) => b.percentGain - a.percentGain)
    .slice(0, 3);
  
  // Get total invested amount
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  
  // Calculate daily average (hypothetical value for visualization)
  const dailyAverage = totalInvested * 0.0007; // Approximately 0.07% daily return
  
  return (
    <div className="bg-slate-800 text-white rounded-xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold">Top Performing Investments</h4>
        <div className="flex items-center">
          <button className="h-8 w-8 flex items-center justify-center rounded-full text-slate-300 hover:bg-slate-700">
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="bg-slate-700/50 rounded-lg p-4 mb-4 flex items-center">
        <div className="flex-1">
          <h3 className="text-2xl font-bold">₦{Math.round(dailyAverage).toLocaleString()}<span className="text-sm text-slate-400">/day</span></h3>
          <p className="text-slate-400 text-sm">Average daily earnings</p>
        </div>
        <div className="bg-slate-600 h-16 w-16 rounded-full flex items-center justify-center">
          <TrendingUp className="h-8 w-8 text-green-400" />
        </div>
      </div>
      
      <div className="space-y-3">
        {topPerformers.map((investment) => (
          <div key={investment.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg overflow-hidden mr-3">
                <img 
                  src={investment.property.imageUrl} 
                  alt={investment.property.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h5 className="font-medium leading-tight">{investment.property.name}</h5>
                <p className="text-xs text-slate-400">{investment.property.location}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-medium">+{investment.percentGain.toFixed(1)}%</div>
              <div className="text-xs text-slate-400">₦{investment.currentValue.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}