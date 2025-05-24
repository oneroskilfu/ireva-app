import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Footer from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Search } from "lucide-react";
import FeaturedPropertyCard from "@/components/explore/FeaturedPropertyCard";
import { Button } from "@/components/ui/button";

export default function ExplorePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: properties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });
  
  if (!properties || properties.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <DashboardHeader />
        
        <main className="flex-grow py-6">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4">Explore Properties</h2>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <h3 className="text-lg font-medium mb-2">No properties available</h3>
              <p className="text-gray-500">
                Check back later for new investment opportunities.
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  // Filter properties by search term
  const filteredProperties = searchTerm
    ? properties.filter(property => 
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : properties;
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <DashboardHeader />
      
      <main className="flex-grow py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
            <h2 className="text-2xl font-bold mb-4 md:mb-0">Explore Properties</h2>
            
            {/* Search input */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Featured property */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Featured Property</h3>
            <FeaturedPropertyCard property={properties[0]} />
          </div>
          
          {/* Property grid */}
          <div>
            <h3 className="text-lg font-medium mb-4">All Properties</h3>
            {filteredProperties.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <p className="text-gray-500">No properties match your search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProperties.map(property => (
                  <div key={property.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="h-40 bg-slate-100">
                      <img 
                        src={property.imageUrl} 
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium mb-1">{property.name}</h4>
                      <p className="text-sm text-gray-500 mb-4">{property.location}</p>
                      
                      <div className="flex justify-between text-sm mb-4">
                        <div>
                          <p className="text-gray-500">Return</p>
                          <p className="font-medium text-emerald-600">{property.targetReturn}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500">Min. Investment</p>
                          <p className="font-medium">₦{property.minimumInvestment.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <Button size="sm" className="w-full">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}