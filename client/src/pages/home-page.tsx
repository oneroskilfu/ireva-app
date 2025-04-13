import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FilterBar from "@/components/properties/FilterBar";
import PropertyGrid from "@/components/properties/PropertyGrid";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";

export default function HomePage() {
  const [filters, setFilters] = useState({
    search: "",
    location: "all",
    type: "all"
  });
  
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });
  
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FilterBar 
          propertyCount={properties.length} 
          onFilterChange={handleFilterChange} 
        />
        <PropertyGrid 
          search={filters.search}
          location={filters.location}
          type={filters.type}
        />
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                InvestProperty makes real estate investing accessible, transparent, and simple.
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
                  Choose your investment amount, starting from as little as $1,000, and complete your investment in minutes.
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">About InvestProperty</h2>
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
