import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Property } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getQueryFn } from "@/lib/queryClient";
import { 
  Loader2, 
  Search, 
  MapPin, 
  Home, 
  Building2, 
  Factory, 
  Warehouse, 
  Compass, 
  ChevronRight 
} from "lucide-react";

const ITEMS_PER_PAGE = 9;

const propertyTypeIcons = {
  residential: <Home className="h-4 w-4" />,
  commercial: <Building2 className="h-4 w-4" />,
  industrial: <Factory className="h-4 w-4" />,
  land: <Compass className="h-4 w-4" />,
  mixed_use: <Warehouse className="h-4 w-4" />,
};

export default function PropertyList() {
  const [, navigate] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string | undefined>(undefined);
  const [locationFilter, setLocationFilter] = useState<string | undefined>(undefined);

  // Fetch all properties
  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !properties) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-semibold mb-2">Failed to load properties</h3>
        <p className="text-gray-500 mb-4">There was an error fetching property data.</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  // Extract unique locations for filter
  const uniqueLocations = Array.from(new Set(properties.map(p => p.location)));
  
  // Apply filters and search
  const filteredProperties = properties.filter(property => {
    // Apply search term filter
    const matchesSearch = !searchTerm || 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply property type filter
    const matchesType = !propertyTypeFilter || property.type === propertyTypeFilter;
    
    // Apply location filter
    const matchesLocation = !locationFilter || property.location === locationFilter;
    
    return matchesSearch && matchesType && matchesLocation;
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Investment Properties</h1>
        <p className="text-muted-foreground">
          Browse our curated selection of high-quality real estate investment opportunities.
        </p>
      </div>
      
      {/* Filters and Search */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search properties..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={undefined}>All Types</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="mixed_use">Mixed Use</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={undefined}>All Locations</SelectItem>
              {uniqueLocations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Property Cards */}
      {paginatedProperties.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No properties found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters or search terms.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm("");
              setPropertyTypeFilter(undefined);
              setLocationFilter(undefined);
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={property.imageUrl}
                  alt={property.name}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {propertyTypeIcons[property.type as keyof typeof propertyTypeIcons]}
                    {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                  </Badge>
                </div>
                {property.accreditedOnly && (
                  <Badge className="absolute top-3 right-3 bg-amber-500">
                    Accredited
                  </Badge>
                )}
              </div>
              
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl font-bold">{property.name}</CardTitle>
                  <Badge variant="outline" className="text-green-600">
                    {property.targetReturn}% ROI
                  </Badge>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {property.location}
                </div>
              </CardHeader>
              
              <CardContent className="p-4 pt-2">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {property.description}
                </p>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-gray-500">Minimum</p>
                    <p className="font-semibold">₦{property.minimumInvestment.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Term</p>
                    <p className="font-semibold">{property.term} months</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Funding</p>
                    <p className="font-semibold">
                      {Math.round((property.currentFunding / property.totalFunding) * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Days Left</p>
                    <p className="font-semibold">{property.daysLeft}</p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full" 
                  onClick={() => navigate(`/properties/${property.id}`)}
                >
                  View Details
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="my-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}