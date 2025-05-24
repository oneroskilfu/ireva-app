import { useQuery } from "@tanstack/react-query";
import { Property, Investment } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";

interface InvestmentWithProperty extends Investment {
  property: Property;
}

export default function MobileActiveProperties() {
  const { data: investments } = useQuery<InvestmentWithProperty[]>({
    queryKey: ["/api/investments"],
  });
  
  if (!investments || investments.length === 0) {
    return (
      <div className="p-4 bg-white rounded-xl shadow-sm text-center">
        <p className="text-gray-500 text-sm">No active investments yet</p>
      </div>
    );
  }
  
  const activeInvestments = investments.filter(inv => inv.status === "active");
  
  return (
    <div className="space-y-4">
      {activeInvestments.map(investment => {
        // Calculate percentage funded (using 65% as example from mockup)
        const percentFunded = 65;
        
        return (
          <div key={investment.id} className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium">{investment.property.name}</h4>
                <p className="text-xs text-gray-500">{investment.property.location}</p>
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Active
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Invested</span>
                <span>₦{investment.amount.toLocaleString()}</span>
              </div>
              <Progress value={percentFunded} className="h-2" />
              <div className="flex justify-end text-xs text-gray-500 mt-1">
                <span>Funded {percentFunded}%</span>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-gray-500 text-xs">ROI</p>
                <p className="font-medium text-emerald-600">7.2%</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Duration</p>
                <p className="font-medium">3 years</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}