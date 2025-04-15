import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { 
  Building, 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  Star, 
  CheckCircle2, 
  Phone, 
  PieChart, 
  Settings, 
  BarChart3, 
  Award, 
  ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import PropertyGrid from "@/components/properties/PropertyGrid";

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
        {/* Hero Section with cleaner design */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  The most-trusted finance partner for investing
                </h1>
                <p className="mt-6 text-lg text-gray-600 max-w-md">
                  We help everyday Nigerians build wealth through real estate investments with as little as ₦100,000. Access premium properties with impressive returns.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Register Now
                  </Button>
                  <Button variant="outline" size="lg" className="border-gray-300">
                    Learn More
                  </Button>
                </div>
                
                {/* Statistics */}
                <div className="mt-16 grid grid-cols-3 gap-8">
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900">5.7</span>
                      <span className="text-xl font-medium text-gray-500 ml-1">k</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Properties available</p>
                  </div>
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900">13.5</span>
                      <span className="text-xl font-medium text-gray-500 ml-1">%</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Average returns</p>
                  </div>
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900">11</span>
                      <span className="text-xl font-medium text-gray-500 ml-1">+</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Years of experience</p>
                  </div>
                </div>
              </div>
              
              {/* Hero image - multiple platform mockups */}
              <div className="relative">
                <div className="relative mx-auto w-full max-w-md">
                  <img 
                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                    alt="Investment Dashboard" 
                    className="rounded-lg shadow-xl"
                  />
                  <div className="absolute -bottom-6 -right-6 w-56 bg-white rounded-lg shadow-lg p-3">
                    <div className="bg-blue-50 rounded-md p-2 mb-2">
                      <div className="h-2 w-16 bg-blue-200 rounded-full mb-1"></div>
                      <div className="h-2 w-24 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-gray-500">Total Value</div>
                        <div className="text-sm font-semibold">₦12,450,000</div>
                      </div>
                      <div className="text-sm font-medium text-green-500">+12.6%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Partners/Trusted by */}
            <div className="mt-24 text-center">
              <p className="text-sm text-gray-500 mb-6">Trusted by Industry Leaders</p>
              <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
                <div className="h-8 w-24 bg-gray-200/50 rounded flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">Prime Bank</span>
                </div>
                <div className="h-8 w-24 bg-gray-200/50 rounded flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">FCMB</span>
                </div>
                <div className="h-8 w-24 bg-gray-200/50 rounded flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">Flutterwave</span>
                </div>
                <div className="h-8 w-24 bg-gray-200/50 rounded flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">Paystack</span>
                </div>
                <div className="h-8 w-24 bg-gray-200/50 rounded flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">ZenithBank</span>
                </div>
                <div className="h-8 w-24 bg-gray-200/50 rounded flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">GTBank</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Save and invest from one place section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Save and invest from one easy app
                </h2>
                <p className="mt-4 text-lg text-gray-600 max-w-md">
                  iREVA provides the easiest way to grow your wealth through real estate investments with premium returns.
                </p>
                
                <div className="mt-12 space-y-8">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary">
                        <Building className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Premium Properties</h3>
                      <p className="mt-2 text-base text-gray-600">Access high-quality properties vetted by real estate experts.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary">
                        <Shield className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Secure Platform</h3>
                      <p className="mt-2 text-base text-gray-600">Your investments are fully protected with proper documentation and insurance.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Higher Returns</h3>
                      <p className="mt-2 text-base text-gray-600">Earn up to 15% annual returns, outperforming traditional investments.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* App screenshot */}
              <div className="relative mx-auto w-full max-w-sm">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
                  <div className="bg-gray-100 py-3 px-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-900">iREVA Wallet</div>
                      <div className="text-xs text-gray-500">12:42 PM</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="bg-primary/5 rounded-lg p-4 mb-4">
                      <div className="text-xs text-gray-500 mb-1">Total Balance</div>
                      <div className="text-2xl font-bold mb-1">₦2,458,620</div>
                      <div className="text-sm font-medium text-green-600">+₦145,800 this month</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Building className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Skyline Apartments</div>
                            <div className="text-xs text-gray-500">Lagos, Nigeria</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">+₦25,400</div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <Building className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Ocean View Villas</div>
                            <div className="text-xs text-gray-500">Abuja, Nigeria</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">+₦32,200</div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <Building className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Tech Hub Offices</div>
                            <div className="text-xs text-gray-500">Port Harcourt, Nigeria</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">+₦18,600</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Plan your investment section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* App screenshot */}
              <div className="relative mx-auto w-full max-w-sm order-2 lg:order-1">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
                  <div className="bg-gray-100 py-3 px-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-900">Investment Planner</div>
                      <div className="text-xs text-gray-500">12:45 PM</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Your Investment Goals</div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between mb-1">
                          <div className="text-xs text-gray-500">Target Amount</div>
                          <div className="text-xs font-medium">₦25,000,000</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <div className="flex justify-between">
                          <div className="text-xs text-gray-500">Current: ₦11,250,000</div>
                          <div className="text-xs text-gray-500">45% Complete</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <PieChart className="h-4 w-4 text-primary" />
                          </div>
                          <div className="text-sm font-medium">Monthly Investment</div>
                        </div>
                        <div className="text-sm font-medium">₦250,000</div>
                      </div>
                      
                      <div className="flex justify-between p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <BarChart3 className="h-4 w-4 text-primary" />
                          </div>
                          <div className="text-sm font-medium">Expected Returns</div>
                        </div>
                        <div className="text-sm font-medium">13.5% p.a.</div>
                      </div>
                      
                      <div className="flex justify-between p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <Award className="h-4 w-4 text-primary" />
                          </div>
                          <div className="text-sm font-medium">Goal Completion</div>
                        </div>
                        <div className="text-sm font-medium">4.8 years</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  Plan your investment according to your goals
                </h2>
                <p className="mt-4 text-lg text-gray-600 max-w-md">
                  Our platform helps you set financial goals and create a personalized investment strategy to achieve them.
                </p>
                
                <div className="mt-12 space-y-8">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Set Clear Goals</h3>
                      <p className="mt-2 text-base text-gray-600">Define your investment objectives and timeline for success.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary">
                        <Settings className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Customize Strategy</h3>
                      <p className="mt-2 text-base text-gray-600">Tailor your investments based on risk tolerance and timeframe.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary">
                        <PieChart className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Track Progress</h3>
                      <p className="mt-2 text-base text-gray-600">Monitor your investment journey with real-time analytics.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials section */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white text-center mb-16">
              What others have said about iREVA
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-300 mb-6">
                  "iREVA's platform made investing in real estate incredibly simple. The returns I've received have exceeded my expectations, and their team is always responsive to questions."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-full mr-4"></div>
                  <div>
                    <div className="font-medium text-white">Chioma Okafor</div>
                    <div className="text-sm text-gray-400">Business Owner, Lagos</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-300 mb-6">
                  "As a first-time investor, I was looking for a safe way to grow my money. iREVA's transparent approach and educational resources helped me build a profitable investment portfolio."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-full mr-4"></div>
                  <div>
                    <div className="font-medium text-white">Ahmed Ibrahim</div>
                    <div className="text-sm text-gray-400">Software Engineer, Abuja</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Expert advice section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Want to know the advice of expert advisors
                </h2>
                <p className="mt-4 text-lg text-gray-600 max-w-md">
                  Our team of experienced real estate and finance professionals can help guide your investment decisions.
                </p>
                
                <div className="mt-12 bg-blue-50 rounded-lg p-6">
                  <div className="flex mb-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600">
                        <Phone className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Schedule a Consultation</h3>
                      <p className="mt-1 text-sm text-gray-600">Talk to our investment advisors to create a personalized plan.</p>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Book a Call
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Investment Performance</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div>
                      <div className="flex justify-between mb-1">
                        <div className="text-sm font-medium">Residential</div>
                        <div className="text-sm font-medium">65%</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <div className="text-sm font-medium">Commercial</div>
                        <div className="text-sm font-medium">48%</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '48%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <div className="text-sm font-medium">Industrial</div>
                        <div className="text-sm font-medium">72%</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '72%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="relative h-48">
                      {/* Placeholder for a chart */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-40 h-40 rounded-full border-8 border-primary/20 flex items-center justify-center">
                          <div className="text-2xl font-bold text-primary">13.5%</div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 w-40 h-40 rounded-full border-8 border-transparent border-t-blue-500 border-r-blue-500"></div>
                      </div>
                    </div>
                    <div className="text-center text-sm text-gray-500">Average Annual Returns</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Don't hesitate to ask, we are here for you
                </h2>
                <p className="mt-4 text-lg text-gray-600 max-w-md">
                  Find answers to commonly asked questions about our platform and real estate investing in Nigeria.
                </p>
                
                <div className="mt-8">
                  <img 
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                    alt="Customer Support" 
                    className="rounded-lg shadow-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <button className="flex justify-between w-full text-left">
                    <span className="text-lg font-medium text-gray-900">What is the minimum investment amount?</span>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </button>
                  <div className="mt-2 pr-12">
                    <p className="text-base text-gray-600">The minimum investment amount starts at ₦100,000, allowing most Nigerians to participate in real estate investing.</p>
                  </div>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <button className="flex justify-between w-full text-left">
                    <span className="text-lg font-medium text-gray-900">How are properties selected?</span>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <button className="flex justify-between w-full text-left">
                    <span className="text-lg font-medium text-gray-900">What returns can I expect?</span>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <button className="flex justify-between w-full text-left">
                    <span className="text-lg font-medium text-gray-900">Is my investment secure?</span>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Register 100% Online.<br />No Minimum Investment.
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              Start building wealth through real estate today with iREVA's easy-to-use platform.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-white text-primary hover:bg-gray-100">
                Download iOS App
              </Button>
              <Button className="bg-white text-primary hover:bg-gray-100">
                Download Android App
              </Button>
            </div>
          </div>
        </section>
        
        {/* Featured Properties Section */}
        <section id="properties" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Featured Properties</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Explore some of our premium investment opportunities
              </p>
            </div>
            
            {/* Featured Properties */}
            <PropertyGrid 
              search={filters.search}
              location={filters.location}
              type={filters.type}
              limit={3}
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
      </main>
      <Footer />
    </div>
  );
}
