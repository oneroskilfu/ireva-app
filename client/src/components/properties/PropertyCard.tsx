import { Property } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const fundingPercentage = Math.round((property.currentFunding / property.totalFunding) * 100);
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative">
        <img 
          src={property.imageUrl} 
          alt={property.name} 
          className="h-48 w-full object-cover"
        />
        <div className="absolute top-0 right-0 m-2">
          <Badge className="bg-white text-primary hover:bg-white">{property.type}</Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold truncate">{property.name}</h3>
          <span className="ml-1 text-sm text-gray-500">{property.location}</span>
        </div>
        
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {property.description}
        </p>
        
        <div className="mt-4 flex justify-between">
          <div>
            <p className="text-xs text-gray-500">Target Return</p>
            <p className="text-lg font-medium text-amber-600">
              {property.targetReturn}% <span className="text-xs">/ year</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Minimum</p>
            <p className="text-lg font-medium">₦{property.minimumInvestment.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Term</p>
            <p className="text-lg font-medium">{property.term} mo</p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">{fundingPercentage}% Funded</span>
            <span className="text-gray-500">
              ₦{(property.currentFunding / 1000000).toFixed(1)}M / ₦{(property.totalFunding / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded">
            <div 
              className="h-full bg-emerald-400 rounded" 
              style={{ width: `${fundingPercentage}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link href={`/property/${property.id}`} className="w-full">
          <Button variant="default" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
