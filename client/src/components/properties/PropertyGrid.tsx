import { useQuery } from "@tanstack/react-query";
import { PropertyCard } from "./PropertyCard";
import { Property } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PropertyGridProps {
  type?: string;
  location?: string;
  search?: string;
}

export default function PropertyGrid({ type, location, search }: PropertyGridProps) {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  
  const queryParams = new URLSearchParams();
  if (type && type !== "all") queryParams.append("type", type);
  if (location && location !== "all") queryParams.append("location", location);
  if (search) queryParams.append("search", search);
  
  const queryString = queryParams.toString();
  const endpoint = `/api/properties${queryString ? `?${queryString}` : ''}`;
  
  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: [endpoint],
  });
  
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
        <h3 className="text-lg font-semibold text-gray-900">Error loading properties</h3>
        <p className="mt-2 text-gray-500">Please try again later</p>
      </div>
    );
  }
  
  if (properties.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-semibold text-gray-900">No properties found</h3>
        <p className="mt-2 text-gray-500">Try adjusting your filters</p>
      </div>
    );
  }
  
  // Pagination logic
  const totalPages = Math.ceil(properties.length / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const currentPageProperties = properties.slice(start, end);
  
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPageProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        
        {totalPages > 1 && (
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
