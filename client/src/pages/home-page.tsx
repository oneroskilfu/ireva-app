import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import PropertyGrid from "@/components/properties/PropertyGrid";
import ModernHero from "@/components/home/ModernHero";
import AnimatedFeatures from "@/components/home/AnimatedFeatures";
import InvestmentPlanner from "@/components/home/InvestmentPlanner";
import { motion } from "framer-motion";

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
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <ModernHero />
        
        {/* Features Section */}
        <AnimatedFeatures />
        
        {/* Investment Planner Section */}
        <InvestmentPlanner />
        
        {/* Testimonials Section */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-center mb-16"
            >
              What <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Visionary Investors</span> Say
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative p-8 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500 opacity-20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-8 -ml-4 w-32 h-32 bg-indigo-600 opacity-20 rounded-full blur-2xl"></div>
                
                <div className="relative">
                  <svg className="w-12 h-12 text-blue-400 mb-4 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  
                  <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                    "iREVA's platform made investing in real estate incredibly accessible. The returns have exceeded my expectations, and their team is always responsive. It's transformed how I view property investing."
                  </p>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold">CO</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">Chioma Okafor</div>
                      <div className="text-sm text-blue-300">Business Owner, Lagos</div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative p-8 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-xl overflow-hidden"
              >
                <div className="absolute top-0 left-0 -mt-4 -ml-4 w-28 h-28 bg-purple-600 opacity-20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 right-0 -mb-8 -mr-4 w-32 h-32 bg-indigo-600 opacity-20 rounded-full blur-2xl"></div>
                
                <div className="relative">
                  <svg className="w-12 h-12 text-purple-400 mb-4 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  
                  <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                    "As a first-time investor, I was looking for a safe way to grow my money. iREVA's transparent approach and educational resources helped me build a profitable investment portfolio I'm proud of."
                  </p>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold">AI</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">Ahmed Ibrahim</div>
                      <div className="text-sm text-purple-300">Software Engineer, Abuja</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Featured Properties Section */}
        <section id="properties" className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                <span className="relative inline-block">
                  <span className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 -z-10 transform -skew-x-12"></span>
                  <span>Featured Properties</span>
                </span>
              </h2>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Explore our curated selection of premium real estate investments with exceptional growth potential
              </p>
            </motion.div>
            
            {/* Featured Properties */}
            <PropertyGrid 
              search={filters.search}
              location={filters.location}
              type={filters.type}
              limit={3}
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
              <Link href="/properties">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white group"
                >
                  View All Properties
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="py-16 relative overflow-hidden bg-gray-900 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-indigo-900/70 z-0"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-32 left-32 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Begin Your Investment Journey<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">Today</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
                Join thousands of investors building wealth through real estate with iREVA's easy-to-use platform. Your future self will thank you.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg"
                  className="bg-black text-white hover:bg-black/90 border-0 h-12 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-xs">Download on the</span>
                    <span className="text-sm font-semibold">App Store</span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-black text-white hover:bg-black/90 border-0 h-12 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.61 15.15C16.15 15.15 15.77 14.78 15.77 14.32V10.22C15.77 9.76 16.15 9.39 16.61 9.39C17.07 9.39 17.45 9.76 17.45 10.22V14.32C17.45 14.78 17.07 15.15 16.61 15.15M7.41 15.15C6.95 15.15 6.57 14.78 6.57 14.32V10.22C6.57 9.76 6.95 9.39 7.41 9.39C7.87 9.39 8.24 9.76 8.24 10.22V14.32C8.24 14.78 7.87 15.15 7.41 15.15M12 17.67C9.3 17.67 7.06 17.16 7.06 16.5V18.67H16.94V16.5C16.94 17.16 14.7 17.67 12 17.67M12 6.67C8.45 6.67 5.54 9.58 5.54 13.13C5.54 13.91 5.71 14.66 6 15.33V16.5C6 16.28 6.22 16.04 6.57 15.84C7.46 15.31 9.6 14.93 12 14.93C14.4 14.93 16.54 15.31 17.43 15.84C17.78 16.04 18 16.28 18 16.5V15.33C18.3 14.66 18.46 13.91 18.46 13.13C18.46 9.58 15.55 6.67 12 6.67M12 8.14C14.67 8.14 16.8 10.27 16.8 12.94C16.8 15.61 14.67 17.74 12 17.74C9.33 17.74 7.2 15.61 7.2 12.94C7.2 10.27 9.33 8.14 12 8.14Z" />
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-xs">GET IT ON</span>
                    <span className="text-sm font-semibold">Google Play</span>
                  </div>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
