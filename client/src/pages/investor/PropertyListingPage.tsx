import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import InvestorLayout from '@/components/layouts/InvestorLayout-new';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Building, LocateIcon, MapPin, Search, SlidersHorizontal, Users } from 'lucide-react';
import { Property } from '@/shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48">
        <img 
          src={property.imageUrl} 
          alt={property.name} 
          className="h-full w-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge 
            variant={property.tier === 'premium' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {property.tier}
          </Badge>
          {property.accreditedOnly && (
            <Badge variant="destructive">Accredited Only</Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="mb-3">
          <h3 className="text-lg font-semibold">{property.name}</h3>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="text-sm">{property.location}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
          <div>
            <p className="text-muted-foreground text-xs">Min. Investment</p>
            <p className="font-medium">₦{property.minimumInvestment.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Target Return</p>
            <p className="font-medium">{property.targetReturn}%</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Term</p>
            <p className="font-medium">{property.term} months</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Type</p>
            <p className="font-medium capitalize">{property.type}</p>
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Funding Progress</span>
              <span>{Math.round(property.currentFunding / property.totalFunding * 100)}%</span>
            </div>
            <Progress value={property.currentFunding / property.totalFunding * 100} className="h-1" />
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center text-xs text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              <span>{property.numberOfInvestors} investors</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {property.daysLeft} days left
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/investor/properties/${property.id}`}>View</Link>
            </Button>
            <Button size="sm" className="flex-1">Invest</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PropertySkeletonCard = () => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="mb-3">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
          <div>
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div>
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div>
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div>
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        
        <div className="mt-auto">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-3" />
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PropertyListingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    location: 'all',
    tier: 'all',
    minReturn: '',
    maxTerm: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.type !== 'all') queryParams.append('type', filters.type);
      if (filters.location !== 'all') queryParams.append('location', filters.location);
      if (searchQuery) queryParams.append('search', searchQuery);
      
      const url = `/api/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await apiRequest('GET', url);
      return await res.json();
    }
  });
  
  // Filter properties by search query
  const filteredProperties = properties?.filter(property => {
    // Apply tier filter
    if (filters.tier !== 'all' && property.tier !== filters.tier) return false;
    
    // Apply minimum return filter
    if (filters.minReturn && parseFloat(property.targetReturn) < parseFloat(filters.minReturn)) return false;
    
    // Apply maximum term filter
    if (filters.maxTerm && property.term > parseInt(filters.maxTerm)) return false;
    
    return true;
  });
  
  // Get unique locations for filter
  const locations = properties ? 
    ['all', ...new Set(properties.map(p => p.location))] : 
    ['all'];
  
  // Get unique property types for filter
  const propertyTypes = properties ? 
    ['all', ...new Set(properties.map(p => p.type))] : 
    ['all'];
  
  return (
    <InvestorLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Investment Opportunities</h1>
            <p className="text-muted-foreground">Discover curated real estate investments with high returns</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button>
              <LocateIcon className="h-4 w-4 mr-2" />
              View Map
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search properties by name, location, or developer..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Property Type</label>
                <Select 
                  value={filters.type} 
                  onValueChange={(value) => setFilters({...filters, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <Select 
                  value={filters.location} 
                  onValueChange={(value) => setFilters({...filters, location: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location === 'all' ? 'All Locations' : location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Investment Tier</label>
                <Select 
                  value={filters.tier} 
                  onValueChange={(value) => setFilters({...filters, tier: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Min Return (%)</label>
                <Input 
                  type="number" 
                  placeholder="e.g., 10" 
                  value={filters.minReturn}
                  onChange={(e) => setFilters({...filters, minReturn: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Max Term (months)</label>
                <Input 
                  type="number" 
                  placeholder="e.g., 36" 
                  value={filters.maxTerm}
                  onChange={(e) => setFilters({...filters, maxTerm: e.target.value})}
                />
              </div>
            </div>
          )}
        </div>
        
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Properties</TabsTrigger>
            <TabsTrigger value="residential">Residential</TabsTrigger>
            <TabsTrigger value="commercial">Commercial</TabsTrigger>
            <TabsTrigger value="mixed-use">Mixed-Use</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <PropertySkeletonCard key={i} />
                ))}
              </div>
            ) : filteredProperties && filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <div className="flex justify-center mb-4">
                  <AlertTriangle className="h-12 w-12 text-amber-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-6">
                  No properties match your search criteria. Try adjusting your filters.
                </p>
                <Button onClick={() => {
                  setFilters({
                    type: 'all',
                    location: 'all',
                    tier: 'all',
                    minReturn: '',
                    maxTerm: '',
                  });
                  setSearchQuery('');
                }}>
                  Reset Filters
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="residential" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <PropertySkeletonCard key={i} />
                ))}
              </div>
            ) : filteredProperties && filteredProperties.filter(p => p.type === 'residential').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.filter(p => p.type === 'residential').map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No residential properties</h3>
                <p className="text-muted-foreground">
                  There are currently no residential properties that match your criteria.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="commercial" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <PropertySkeletonCard key={i} />
                ))}
              </div>
            ) : filteredProperties && filteredProperties.filter(p => p.type === 'commercial').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.filter(p => p.type === 'commercial').map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No commercial properties</h3>
                <p className="text-muted-foreground">
                  There are currently no commercial properties that match your criteria.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="mixed-use" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <PropertySkeletonCard key={i} />
                ))}
              </div>
            ) : filteredProperties && filteredProperties.filter(p => p.type === 'mixed-use').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.filter(p => p.type === 'mixed-use').map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No mixed-use properties</h3>
                <p className="text-muted-foreground">
                  There are currently no mixed-use properties that match your criteria.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </InvestorLayout>
  );
};

export default PropertyListingPage;