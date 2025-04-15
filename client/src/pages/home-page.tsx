import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import { FilterBar, type PropertyFilters } from "@/components/properties/FilterBar";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { TestimonialSection } from "@/components/testimonials/TestimonialSection";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  // Define default filter values
  const defaultFilters: PropertyFilters = {
    search: "",
    location: "all",
    type: "all",
    minInvestment: [0, 10000000],
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
    if (filters.minInvestment[0] > 0 || filters.minInvestment[1] < 10000000) count++;
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
    if (filters.minInvestment[0] > 0 || filters.minInvestment[1] < 10000000) {
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
        
        {/* How It Works Section - World-class design */}
        <section id="how-it-works" className="py-24 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-900 opacity-80"></div>
          <div className="absolute inset-0 bg-grid-slate-100/[0.03] bg-[length:20px_20px] dark:bg-grid-slate-700/[0.05]"></div>
          <div className="absolute left-1/2 top-0 w-[1000px] h-[1000px] -translate-x-1/2 -translate-y-[65%] rounded-full bg-gradient-to-br from-primary/5 to-primary/20 blur-3xl opacity-30"></div>
          
          {/* Accent decorations */}
          <div className="absolute -left-20 top-40 w-60 h-60 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute right-0 bottom-1/3 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl"></div>
          <div className="absolute left-1/4 bottom-0 w-px h-20 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent"></div>
          <div className="absolute right-1/3 top-1/4 w-px h-40 bg-gradient-to-b from-transparent via-primary/10 to-transparent"></div>
  
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center mb-3 px-3 py-1 border border-primary/20 rounded-full bg-primary/5 text-sm text-primary font-medium">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mr-2" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6V12L16 14" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Simple 3-step process
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-gray-900 to-primary bg-clip-text text-transparent dark:from-white dark:to-primary">
                How iREVA Works
              </h2>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                iREVA makes real estate investing accessible, transparent, and simple for everyone in Nigeria.
              </p>
              <div className="flex justify-center mb-8">
                <Button variant="outline" size="lg" className="gap-2 rounded-full shadow-sm border-primary/20 hover:bg-primary/5" asChild>
                  <Link href="/how-it-works">
                    Learn More
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 z-0">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              </div>
  
              {/* Step 1 */}
              <div className="relative z-10 group">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-primary/5 border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                  {/* Step indicator */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                        <span className="text-white font-bold text-lg">1</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card accent top border */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-primary-light via-primary to-primary-dark"></div>
                  
                  <div className="px-8 pt-10 pb-8">
                    {/* Illustration/Icon */}
                    <div className="mb-6 rounded-2xl bg-primary/5 p-4 w-16 h-16 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-primary" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 9.00002V15C22 17.5 20.5 19.5 17.5 19.5H6.5C3.5 19.5 2 17.5 2 15V9.00002C2 6.50002 3.5 4.50002 6.5 4.50002H17.5C20.5 4.50002 22 6.50002 22 9.00002Z" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 9.5V14.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5.5 9.5V14.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary transition-colors">Browse Properties</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Explore our curated selection of high-quality commercial and residential real estate investments across Nigeria's fastest-growing cities.
                    </p>
                    
                    {/* Features */}
                    <ul className="mt-6 space-y-2">
                      <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Detailed property information
                      </li>
                      <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Advanced filtering options
                      </li>
                      <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Transparent risk assessment
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="relative z-10 group">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-primary/5 border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                  {/* Step indicator */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                        <span className="text-white font-bold text-lg">2</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card accent top border */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-primary-light via-primary to-primary-dark"></div>
                  
                  <div className="px-8 pt-10 pb-8">
                    {/* Illustration/Icon */}
                    <div className="mb-6 rounded-2xl bg-primary/5 p-4 w-16 h-16 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-primary" stroke="currentColor" strokeWidth="1.5">
                        <path d="M8.67188 14.3298C8.67188 15.6198 9.66188 16.6598 10.8919 16.6598H13.4019C14.4719 16.6598 15.3419 15.7498 15.3419 14.6298C15.3419 13.4098 14.8119 12.9798 14.0219 12.6998L9.99187 11.2998C9.20187 11.0198 8.67188 10.5898 8.67188 9.36984C8.67188 8.24984 9.54187 7.33984 10.6119 7.33984H13.1219C14.3519 7.33984 15.3419 8.37984 15.3419 9.66984" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 6V18" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary transition-colors">Invest Online</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Choose your investment amount, starting from as little as ₦100,000, and complete your investment in minutes through our secure platform.
                    </p>
                    
                    {/* Features */}
                    <ul className="mt-6 space-y-2">
                      <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Secure payment processing
                      </li>
                      <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Instant digital contracts
                      </li>
                      <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Low minimum investment
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="relative z-10 group">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-primary/5 border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                  {/* Step indicator */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                        <span className="text-white font-bold text-lg">3</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card accent top border */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-primary-light via-primary to-primary-dark"></div>
                  
                  <div className="px-8 pt-10 pb-8">
                    {/* Illustration/Icon */}
                    <div className="mb-6 rounded-2xl bg-primary/5 p-4 w-16 h-16 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-primary" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15.71 15.18L12.61 13.33C12.07 13.01 11.63 12.24 11.63 11.61V7.51001" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 8.5H10M7 11.5H9" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 14.5H14" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary transition-colors">Track Performance</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Monitor your investments, receive distributions directly to your wallet, and watch your real estate portfolio grow over time.
                    </p>
                    
                    {/* Features */}
                    <ul className="mt-6 space-y-2">
                      <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Real-time performance metrics
                      </li>
                      <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Automated dividend payments
                      </li>
                      <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Detailed investment analytics
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA Section */}
            <div className="mt-16 text-center">
              <div className="inline-block relative z-10 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary-dark rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
                <Link href="/auth" className="relative bg-white dark:bg-slate-900 px-8 py-4 rounded-lg flex items-center justify-center shadow-md">
                  <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Start Investing Today</span>
                  <svg className="w-5 h-5 ml-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12H19" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* About Section - World-class design */}
        <section id="about" className="py-24 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-950/50"></div>
          <div className="absolute inset-0 bg-grid-slate-100/[0.05] bg-[length:20px_20px] dark:bg-grid-slate-700/[0.05]"></div>
          
          {/* Decorative accent elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-60 h-60 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute left-1/2 top-1/4 transform -translate-x-1/2 w-1/2 h-1/2 bg-gradient-to-b from-primary/[0.03] to-transparent rounded-full blur-3xl"></div>
          
          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                {/* Section heading */}
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-sm text-primary font-medium mb-6">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16V12" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8H12.01" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  About Us
                </div>
                
                <h2 className="text-4xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Transforming Real Estate Investing in Nigeria
                </h2>
                
                <div className="space-y-6">
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    We're on a mission to democratize real estate investing by making institutional-quality investments accessible to everyone in Nigeria, regardless of their income level or investment experience.
                  </p>
                  
                  <div className="relative pl-6 border-l-2 border-primary/30">
                    <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed italic">
                      Our team has decades of combined experience in real estate, finance, and technology, allowing us to identify and secure the best opportunities for our investors.
                    </p>
                  </div>
                  
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    By pooling capital from multiple investors, we can access higher-quality real estate deals that would otherwise be out of reach for individual investors, while providing complete transparency throughout the investment process.
                  </p>
                </div>
                
                {/* Features grid */}
                <div className="mt-10 grid grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mr-4">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white">Nigerian Focus</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Exclusive focus on Nigerian property markets</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mr-4">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white">Low Minimums</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Start with just ₦100,000</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mr-4">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white">Transparency</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Full disclosure on all investments</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mr-4">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white">AI-Powered</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Smart property recommendations</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats cards with premium design */}
              <div className="relative">
                {/* Abstract decorative element */}
                <div className="absolute -top-10 -right-10 -bottom-10 -left-10 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl blur-3xl z-0 pointer-events-none"></div>
                
                {/* Grid of stat cards */}
                <div className="grid grid-cols-2 gap-6 relative z-10">
                  <div className="group bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg shadow-gray-200/50 dark:shadow-slate-900/30 border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary" strokeWidth="1.5" stroke="currentColor">
                        <path d="M8 6.5H16M8 11.5H13M21 10V8C21 5 19.5 3 16 3H8C4.5 3 3 5 3 8V16C3 19 4.5 21 8 21H11" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19.9999 17H16.9999M16.9999 17V14M16.9999 17L19.9999 14" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-dark to-primary mb-1">₦250M+</h3>
                    <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Total investment volume</p>
                  </div>
                  
                  <div className="group bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg shadow-gray-200/50 dark:shadow-slate-900/30 border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary" strokeWidth="1.5" stroke="currentColor">
                        <path d="M8.99982 14.1999L14.9998 8.19995M8.99982 8.19995L14.9998 14.1999" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-dark to-primary mb-1">12.5%</h3>
                    <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Average annual returns</p>
                  </div>
                  
                  <div className="group bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg shadow-gray-200/50 dark:shadow-slate-900/30 border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary" strokeWidth="1.5" stroke="currentColor">
                        <path d="M9.15957 10.87C9.05957 10.86 8.93957 10.86 8.82957 10.87C6.44957 10.79 4.55957 8.84 4.55957 6.44C4.55957 3.99 6.53957 2 8.99957 2C11.4496 2 13.4396 3.99 13.4396 6.44C13.4296 8.84 11.5396 10.79 9.15957 10.87Z" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16.4103 4C18.3503 4 19.9103 5.57 19.9103 7.5C19.9103 9.39 18.4103 10.93 16.5403 11C16.4603 10.99 16.3703 10.99 16.2803 11" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4.15973 14.56C1.73973 16.18 1.73973 18.82 4.15973 20.43C6.90973 22.27 11.4197 22.27 14.1697 20.43C16.5897 18.81 16.5897 16.17 14.1697 14.56C11.4297 12.73 6.91973 12.73 4.15973 14.56Z" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.3398 20C19.0598 19.85 19.7398 19.56 20.2998 19.13C21.8598 17.96 21.8598 16.03 20.2998 14.86C19.7498 14.44 19.0798 14.16 18.3698 14" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-dark to-primary mb-1">15K+</h3>
                    <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Active investors</p>
                  </div>
                  
                  <div className="group bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg shadow-gray-200/50 dark:shadow-slate-900/30 border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary" strokeWidth="1.5" stroke="currentColor">
                        <path d="M22 11V17C22 21 21 22 17 22H7C3 22 2 21 2 17V7C2 3 3 2 7 2H8.5C10 2 10.33 2.44 10.9 3.2L12.4 5.2C12.78 5.7 13 6 14 6H17C21 6 22 7 22 11Z" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8.32031 15.2695L10.8103 17.1495C11.1903 17.4295 11.7803 17.2395 11.9303 16.7695L14.0003 10.0195" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-dark to-primary mb-1">98%</h3>
                    <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Investment success rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <TestimonialSection />
      </main>
      <Footer />
    </div>
  );
}
