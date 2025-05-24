import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function RecommendedProperties() {
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!properties || properties.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-center text-gray-500">No recommended properties at this time.</p>
      </div>
    );
  }
  
  // Get top 3 properties with lowest funding percentage
  const recommendedProperties = [...properties]
    .sort((a, b) => (a.currentFunding / a.totalFunding) - (b.currentFunding / b.totalFunding))
    .slice(0, 3);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {recommendedProperties.map(property => {
        const fundingPercentage = Math.round((property.currentFunding / property.totalFunding) * 100);
        
        return (
          <div 
            key={property.id} 
            className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative">
              <img 
                className="h-36 w-full object-cover" 
                src={property.imageUrl} 
                alt={property.name}
              />
              <div className="absolute top-0 right-0 m-2">
                <Badge className="bg-white text-primary hover:bg-white capitalize">
                  {property.type}
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-md font-bold truncate">{property.name}</h3>
              <p className="text-xs text-gray-500">{property.location}</p>
              
              <div className="mt-2 flex justify-between">
                <div>
                  <p className="text-xs text-gray-500">Return</p>
                  <p className="text-sm font-medium text-amber-600">{property.targetReturn}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Min</p>
                  <p className="text-sm font-medium">${property.minimumInvestment.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{fundingPercentage}% Funded</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded">
                  <div 
                    className="h-full bg-emerald-400 rounded" 
                    style={{ width: `${fundingPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <Link href={`/properties/${property.id}`} className="inline-block w-full mt-3">
                <Button variant="default" size="sm" className="w-full">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
