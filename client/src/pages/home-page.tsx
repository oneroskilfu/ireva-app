import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import { FilterBar, type PropertyFilters } from "@/components/properties/FilterBar";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function HomePage() {
  // Define default filter values
  const defaultFilters: PropertyFilters = {
    search: "",
    location: "all",
    type: "all",
    minInvestment: [0, 10000],
    minReturn: 0,
    riskLevel: "all",
    sort: "default"
  };
  
  const [filters, setFilters] = useState<PropertyFilters>(defaultFilters);
  
  // Fetch properties
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties", filters.type, filters.location],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.type !== 'all') queryParams.append('type', filters.type);
      if (filters.location !== 'all') queryParams.append('location', filters.location);
      if (filters.search) queryParams.append('search', filters.search);
      
      const url = `/api/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      return response.json();
    }
  });
  
  // Extract unique locations from properties
  const locations = useMemo(() => {
    const uniqueLocations = Array.from(new Set(properties.map(p => p.location)));
    return uniqueLocations;
  }, [properties]);
  
  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.location !== 'all') count++;
    if (filters.minInvestment[0] > 0 || filters.minInvestment[1] < 10000) count++;
    if (filters.minReturn > 0) count++;
    if (filters.riskLevel !== 'all') count++;
    if (filters.search) count++;
    if (filters.sort !== 'default') count++;
    return count;
  }, [filters]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };
  
  // Filter and sort properties client-side
  const filteredProperties = useMemo(() => {
    let result = [...properties];
    
    // Filter by minimum investment amount
    if (filters.minInvestment[0] > 0 || filters.minInvestment[1] < 10000) {
      result = result.filter(
        p => p.minimumInvestment >= filters.minInvestment[0] && 
             p.minimumInvestment <= filters.minInvestment[1]
      );
    }
    
    // Filter by minimum return rate
    if (filters.minReturn > 0) {
      result = result.filter(p => parseFloat(p.targetReturn) >= filters.minReturn);
    }
    
    // Filter by risk level
    if (filters.riskLevel !== 'all') {
      result = result.filter(p => {
        const returnRate = parseFloat(p.targetReturn);
        
        if (filters.riskLevel === 'low') {
          return returnRate < 10;
        } else if (filters.riskLevel === 'medium') {
          return returnRate >= 10 && returnRate < 13;
        } else if (filters.riskLevel === 'high') {
          return returnRate >= 13;
        }
        
        return true;
      });
    }
    
    // Filter by search term (already handled by server but adding client-side support too)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(searchLower) || 
             p.description.toLowerCase().includes(searchLower) ||
             p.location.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort properties
    if (filters.sort !== 'default') {
      result.sort((a, b) => {
        switch (filters.sort) {
          case 'return-high':
            return parseFloat(b.targetReturn) - parseFloat(a.targetReturn);
          case 'return-low':
            return parseFloat(a.targetReturn) - parseFloat(b.targetReturn);
          case 'investment-high':
            return b.minimumInvestment - a.minimumInvestment;
          case 'investment-low':
            return a.minimumInvestment - b.minimumInvestment;
          case 'funding-high':
            return b.currentFunding - a.currentFunding;
          case 'funding-low':
            return a.currentFunding - b.currentFunding;
          case 'deadline-close':
            if (a.daysLeft === null && b.daysLeft === null) return 0;
            if (a.daysLeft === null) return 1;
            if (b.daysLeft === null) return -1;
            return a.daysLeft - b.daysLeft;
          default:
            return 0;
        }
      });
    }
    
    return result;
  }, [properties, filters]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  className="pl-9"
                  placeholder="Search properties by name, location or description..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange({...filters, search: e.target.value})}
                />
              </div>
              {filters.search && (
                <Button variant="ghost" onClick={() => handleFilterChange({...filters, search: ''})}>
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          {/* Filter Bar */}
          <FilterBar 
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            locations={locations}
            activeFilterCount={activeFilterCount}
          />
          
          {/* Results Count */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Available
            </h2>
            {activeFilterCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} applied
              </p>
            )}
          </div>
          
          {/* Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
            
            {filteredProperties.length === 0 && !isLoading && (
              <div className="col-span-3 py-12 text-center">
                <h3 className="text-lg font-medium mb-2">No properties match your filters</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search criteria</p>
                <Button onClick={handleResetFilters}>Reset All Filters</Button>
              </div>
            )}
          </div>
        </div>
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                REVA makes real estate investing accessible, transparent, and simple.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Browse Properties</h3>
                <p className="text-gray-600">
                  Explore our curated selection of high-quality commercial and residential real estate investments.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Invest Online</h3>
                <p className="text-gray-600">
                  Choose your investment amount, starting from as little as ₦100,000, and complete your investment in minutes.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-primary font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Track Performance</h3>
                <p className="text-gray-600">
                  Monitor your investments, receive distributions, and watch your real estate portfolio grow over time.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* About Section */}
        <section id="about" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">About REVA</h2>
                <p className="text-lg text-gray-600 mb-4">
                  We're on a mission to democratize real estate investing by making institutional-quality investments accessible to everyone.
                </p>
                <p className="text-lg text-gray-600 mb-4">
                  Our team has decades of combined experience in real estate, finance, and technology, allowing us to identify and secure the best opportunities for our investors.
                </p>
                <p className="text-lg text-gray-600">
                  By pooling capital from multiple investors, we can access higher-quality real estate deals that would otherwise be out of reach for individual investors.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/5 p-6 rounded-lg">
                  <h3 className="text-4xl font-bold text-primary mb-2">$250M+</h3>
                  <p className="text-gray-600">Total investment volume</p>
                </div>
                <div className="bg-primary/5 p-6 rounded-lg">
                  <h3 className="text-4xl font-bold text-primary mb-2">12.5%</h3>
                  <p className="text-gray-600">Average annual returns</p>
                </div>
                <div className="bg-primary/5 p-6 rounded-lg">
                  <h3 className="text-4xl font-bold text-primary mb-2">15K+</h3>
                  <p className="text-gray-600">Active investors</p>
                </div>
                <div className="bg-primary/5 p-6 rounded-lg">
                  <h3 className="text-4xl font-bold text-primary mb-2">98%</h3>
                  <p className="text-gray-600">Investment success rate</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
