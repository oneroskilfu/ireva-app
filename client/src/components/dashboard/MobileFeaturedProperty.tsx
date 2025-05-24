import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";

export default function MobileFeaturedProperty() {
  const { data: properties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });
  
  if (!properties || properties.length === 0) {
    return (
      <div className="p-4 bg-white rounded-xl shadow-sm text-center">
        <p className="text-gray-500 text-sm">No featured property available</p>
      </div>
    );
  }
  
  // Use the first property as featured
  const featuredProperty = properties[0];
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Property image */}
      <div className="h-40 relative">
        <img 
          src={featuredProperty.imageUrl} 
          alt={featuredProperty.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Property details */}
      <div className="p-4">
        <h3 className="font-medium text-lg">Featured Property</h3>
        <div className="mt-2">
          <h4 className="font-medium">{featuredProperty.name}</h4>
          <p className="text-sm text-gray-500 mb-3">{featuredProperty.location}</p>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Investment Goal</span>
                <span>₦55,000</span>
              </div>
              <Progress value={0} className="h-1.5 mb-1" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Minimum investment</span>
                <span>₦3,000</span>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-gray-500 text-xs">Estimated Return</p>
                <p className="font-medium text-emerald-600">73%</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Timeline</p>
                <p className="font-medium">3 years</p>
              </div>
            </div>
          </div>
          
          <Link href={`/properties/${featuredProperty.id}`} className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg mt-4 font-medium">
            Invest Now
          </Link>
        </div>
      </div>
    </div>
  );
}