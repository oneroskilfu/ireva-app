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
                How REVA Works
              </h2>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                REVA makes real estate investing accessible, transparent, and simple for everyone in Nigeria.
              </p>
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
                <a href="/auth" className="relative bg-white dark:bg-slate-900 px-8 py-4 rounded-lg flex items-center justify-center shadow-md">
                  <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Start Investing Today</span>
                  <svg className="w-5 h-5 ml-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12H19" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
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
                  <h3 className="text-4xl font-bold text-primary mb-2">₦250M+</h3>
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
        
        {/* Testimonials Section */}
        <TestimonialSection />
      </main>
      <Footer />
    </div>
  );
}
