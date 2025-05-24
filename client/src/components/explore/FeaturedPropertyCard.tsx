import { Property } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Map } from "lucide-react";
import { Link } from "wouter";

interface FeaturedPropertyCardProps {
  property: Property;
}

export default function FeaturedPropertyCard({ property }: FeaturedPropertyCardProps) {
  // Mock data to match the mockup
  const investmentGoal = 55000;
  const minimumInvestment = 53000;
  const returnRate = 7.3;
  const yearsEstimate = 3;
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Property Image */}
      <div className="relative h-48">
        <img 
          src={property.imageUrl} 
          alt={property.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Property Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{property.name}</h3>
        <p className="text-sm text-gray-500 mb-4">{property.location}</p>
        
        {/* Stats Grid */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Investment Goal</span>
              <span>₦{investmentGoal.toLocaleString()}</span>
            </div>
            <Progress value={0} className="h-1.5 mb-1" />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Minimum investment</span>
              <span>₦{minimumInvestment.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Estimated Return</p>
              <p className="font-medium text-emerald-600">{returnRate}%</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Timeline</p>
              <p className="font-medium">{yearsEstimate} years</p>
            </div>
          </div>
        </div>
        
        {/* Map Button */}
        <div className="mt-4 w-full h-24 bg-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden">
          <Map className="h-6 w-6 text-blue-700 absolute" />
          <img 
            src="/map-preview.png" 
            alt="Map preview"
            className="w-full h-full object-cover opacity-70"
          />
        </div>
      </div>
    </div>
  );
}