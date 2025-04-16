import { useQuery } from "@tanstack/react-query";
import { Property, Investment } from "@shared/schema";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvestmentWithProperty extends Investment {
  property: Property;
}

export default function LocationInsights() {
  const { data: investments } = useQuery<InvestmentWithProperty[]>({
    queryKey: ["/api/investments"],
  });
  
  if (!investments || investments.length === 0) {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold">Investment By Location</h4>
          <div className="flex items-center">
            <Button size="sm" variant="outline" className="text-sm gap-1">
              View <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="py-8 text-center text-slate-500">
          No location data available yet.
        </div>
      </div>
    );
  }
  
  // Calculate investment by location
  const locationData: Record<string, { amount: number, count: number, percentChange: number }> = {};
  
  investments.forEach(inv => {
    const location = inv.property.location;
    if (!locationData[location]) {
      locationData[location] = {
        amount: 0,
        count: 0,
        percentChange: Math.random() * 20 - 5 // Random value between -5% and +15% for demo
      };
    }
    locationData[location].amount += inv.currentValue;
    locationData[location].count += 1;
  });
  
  // Sort locations by investment amount
  const sortedLocations = Object.entries(locationData)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 3); // Show top 3 locations
  
  // Generate color classes for location bars
  const locationColors = [
    'bg-purple-500',
    'bg-amber-500',
    'bg-blue-500'
  ];
  
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold">Investment By Location</h4>
        <div className="flex items-center">
          <Button size="sm" variant="outline" className="text-sm gap-1">
            View all <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-3">
        {sortedLocations.map(([location, data], index) => (
          <div key={location} className="text-center">
            <div className={`h-20 md:h-28 w-full rounded-lg ${locationColors[index % locationColors.length]} flex flex-col items-center justify-center text-white`}>
              <h3 className="text-lg md:text-xl font-bold">₦{Math.round(data.amount / 1000000)}M</h3>
            </div>
            <h5 className="font-medium mt-2">{location}</h5>
            <div className={`text-xs ${data.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.percentChange >= 0 ? '+' : ''}{data.percentChange.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}