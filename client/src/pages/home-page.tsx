import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import PropertyGrid from "@/components/properties/PropertyGrid";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Building, ArrowRight, TrendingUp, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HomePage() {
  const [filters, setFilters] = useState({
    search: "",
    location: "all",
    type: "all"
  });
  
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        {/* Hero Section with gradient background and mobile app showcase */}
        <HeroSection />
        
        {/* Investment Opportunities Section */}
        <section id="properties" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Premium Investment Opportunities</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Access exclusive real estate investments with impressive returns and minimal entry barriers.
              </p>
            </div>
            
            {/* Featured Properties */}
            <PropertyGrid 
              search={filters.search}
              location={filters.location}
              type={filters.type}
              limit={6}
            />
            
            <div className="mt-12 text-center">
              <Link href="/properties">
                <Button size="lg" className="group">
                  View All Properties
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* How It Works Section - Redesigned with modern aesthetic */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How iREVA Works</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Start your real estate investment journey in just a few simple steps.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Browse Properties</h3>
                <p className="text-gray-600">
                  Explore our curated selection of premium Nigerian real estate investments, with detailed analytics and projections.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Invest Securely</h3>
                <p className="text-gray-600">
                  Choose your investment amount, starting from as little as ₦100,000, and complete your investment using secure local payment options.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Track Performance</h3>
                <p className="text-gray-600">
                  Monitor your investments through a personalized dashboard, view detailed reports, and watch your returns grow.
                </p>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <Link href="/auth">
                <Button size="lg" className="group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Why Choose iREVA</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform offers unique advantages for all types of investors
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Secure Investments</h3>
                <p className="text-gray-600">
                  All properties are thoroughly vetted with complete legal documentation and insurance.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Premium Properties</h3>
                <p className="text-gray-600">
                  Access to exclusive real estate opportunities normally reserved for institutional investors.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Higher Returns</h3>
                <p className="text-gray-600">
                  Our properties consistently outperform traditional investment options with average returns of 12-15%.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Dedicated Support</h3>
                <p className="text-gray-600">
                  Our team of experts is always available to answer questions and provide guidance.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Statistics Section */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold">₦24B+</div>
                <div className="text-gray-400 mt-2">Total investment volume</div>
              </div>
              <div>
                <div className="text-4xl font-bold">13.5%</div>
                <div className="text-gray-400 mt-2">Average annual returns</div>
              </div>
              <div>
                <div className="text-4xl font-bold">5,700+</div>
                <div className="text-gray-400 mt-2">Active investors</div>
              </div>
              <div>
                <div className="text-4xl font-bold">98.2%</div>
                <div className="text-gray-400 mt-2">Investment success rate</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
