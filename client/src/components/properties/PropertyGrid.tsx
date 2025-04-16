import { useQuery } from "@tanstack/react-query";
import PropertyCard from "./PropertyCard";
import { Property } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PropertyGridProps {
  type?: string;
  location?: string;
  search?: string;
  limit?: number; // Added limit parameter to limit the number of properties shown
}

export default function PropertyGrid({ type, location, search, limit }: PropertyGridProps) {
  console.log("PropertyGrid rendered with params:", { type, location, search, limit });
  const [page, setPage] = useState(1);
  const pageSize = 6;
  
  const queryParams = new URLSearchParams();
  if (type && type !== "all") queryParams.append("type", type);
  if (location && location !== "all") queryParams.append("location", location);
  if (search) queryParams.append("search", search);
  
  console.log("Query params:", queryParams.toString());
  
  console.log('Before query execution');
  
  const { data: properties = [], isLoading, error } = useQuery<Property[]>({
    queryKey: ['/api/properties', queryParams.toString()],
    queryFn: async () => {
      const endpoint = `/api/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Properties loaded. Count:', data.length, 'Data:', data);
    },
    onError: (err) => {
      console.error('Error loading properties:', err);
    }
  });
  
  console.log('After query execution - isLoading:', isLoading, 'error:', error, 'properties:', properties);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !properties) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Error loading properties</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Please try again later or refresh the page</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>
    );
  }
  
  if (properties.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No properties found</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Try adjusting your filters or check back later</p>
      </div>
    );
  }
  
  // Apply limit if specified
  const filteredProperties = limit ? properties.slice(0, limit) : properties;
  
  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const currentPageProperties = filteredProperties.slice(start, end);
  
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPageProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        
        {!limit && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-l-md"
              >
                &laquo;
              </Button>
              
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(i + 1)}
                  className="rounded-none"
                >
                  {i + 1}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-r-md"
              >
                &raquo;
              </Button>
            </nav>
          </div>
        )}
      </div>
    </section>
  );
}
