import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Property, Investment } from "@shared/schema";

interface InvestmentWithProperty extends Investment {
  property: Property;
}

export default function InvestmentPortfolio() {
  const { data: investments, isLoading, error } = useQuery<InvestmentWithProperty[]>({
    queryKey: ["/api/investments"],
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !investments) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-center text-gray-500">Failed to load your investments. Please try again later.</p>
      </div>
    );
  }
  
  if (investments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <h4 className="font-semibold text-lg mb-2">No Investments Yet</h4>
        <p className="text-gray-500 mb-4">Start your real estate investing journey today.</p>
        <Link href="/">
          <Button>Browse Properties</Button>
        </Link>
      </div>
    );
  }
  
  // Calculate return rates and values
  const enrichedInvestments = investments.map(investment => {
    const percentGain = ((investment.currentValue - investment.amount) / investment.amount) * 100;
    const monthlyIncome = (investment.amount * (investment.property.targetReturn / 100)) / 12;
    
    return {
      ...investment,
      percentGain,
      monthlyIncome
    };
  });
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invested</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {enrichedInvestments.map((investment) => (
            <tr key={investment.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <img 
                      className="h-10 w-10 rounded-md object-cover" 
                      src={investment.property.imageUrl} 
                      alt={investment.property.name}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{investment.property.name}</div>
                    <div className="text-xs text-gray-500">{investment.property.location}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">${investment.amount.toLocaleString()}</div>
                <div className="text-xs text-gray-500">
                  {new Date(investment.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">${investment.currentValue.toLocaleString()}</div>
                <div className="text-xs text-gray-500">
                  {investment.percentGain >= 0 ? '+' : ''}{investment.percentGain.toFixed(1)}%
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-emerald-700">
                  ${investment.monthlyIncome.toFixed(0)}/mo
                </div>
                <div className="text-xs text-gray-500">
                  {investment.property.targetReturn}% APR
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {investment.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link href={`/properties/${investment.property.id}`}>
                  <a className="text-primary hover:text-primary-dark">Details</a>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
