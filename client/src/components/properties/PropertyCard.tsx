import { Property } from '@shared/schema';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLocation } from 'wouter';
import { usePageTransition } from '@/contexts/page-transition-context';
import { Building2, Calendar, Clock, MapPin, Percent, Users } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [, navigate] = useLocation();
  const { startLoading, stopLoading } = usePageTransition();
  
  // Calculate funding progress as percentage
  const fundingProgress = (property.currentFunding / property.totalFunding) * 100;
  
  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  // Determine risk level based on property characteristics
  const getRiskLevel = (): { level: 'low' | 'medium' | 'high', color: string } => {
    const returnRate = parseFloat(property.targetReturn);
    
    if (returnRate < 10) {
      return { level: 'low', color: 'bg-green-100 text-green-800' };
    } else if (returnRate < 13) {
      return { level: 'medium', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { level: 'high', color: 'bg-red-100 text-red-800' };
    }
  };
  
  const risk = getRiskLevel();
  
  const handleViewDetails = () => {
    startLoading();
    navigate(`/properties/${property.id}`);
    // In a real scenario, we'd stop loading when the page is loaded
    // Here we'll just set a timeout for demo purposes
    setTimeout(() => {
      stopLoading();
    }, 500);
  };
  
  return (
    <Card className="overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md">
      {/* Property Image */}
      <div className="relative">
        <div className="absolute top-2 left-2 z-10 flex gap-1 flex-wrap">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
            {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
          </Badge>
          <Badge variant="secondary" className={risk.color}>
            {risk.level.charAt(0).toUpperCase() + risk.level.slice(1)} Risk
          </Badge>
        </div>
        <div className="relative aspect-video bg-muted overflow-hidden">
          <img 
            src={property.imageUrl} 
            alt={property.name} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>
      
      {/* Property Details */}
      <CardContent className="flex-1 flex flex-col p-4">
        <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{property.location}</span>
        </div>
        
        <h3 className="text-lg font-semibold mb-1 line-clamp-1">{property.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{property.description}</p>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
          <div className="flex items-center gap-1">
            <Percent className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{property.targetReturn}% Return</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-primary font-semibold h-4 w-4 flex items-center justify-center">₦</span>
            <span className="text-sm font-medium">Min ₦100,000</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{property.term} months</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{property.numberOfInvestors} investors</span>
          </div>
        </div>
        
        {/* Funding Progress */}
        <div className="mt-auto">
          <div className="flex justify-between mb-1 text-sm">
            <span className="font-medium">₦{formatNumber(property.currentFunding)} raised</span>
            <span className="text-muted-foreground">₦{formatNumber(property.totalFunding)} target</span>
          </div>
          <Progress className="h-2 mb-1" value={fundingProgress} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(fundingProgress)}% funded</span>
            {property.daysLeft !== null && (
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {property.daysLeft} days left
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={handleViewDetails}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}