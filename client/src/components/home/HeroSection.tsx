import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Building } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-24 lg:py-32">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-900/90 to-pink-500/70 -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column with text content */}
          <div className="text-white">
            <div className="mb-8 flex items-center">
              <Building className="h-8 w-8 text-white mr-2" />
              <span className="text-2xl font-bold">iREVA</span>
            </div>
            
            {/* Building Wealth Together heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Building Wealth<br />Together
            </h1>
            
            <p className="mt-6 text-lg text-gray-200 max-w-md">
              Investing in premium Nigerian real estate has never been easier. 
              Access exclusive opportunities with as little as ₦100,000.
            </p>
            
            {/* Action buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="#properties">
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100">
                  Join Now
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 bg-white/5 text-white hover:bg-white/10">
                  Demo
                </Button>
              </Link>
            </div>
            
            {/* Stats section */}
            <div className="mt-16 grid grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold">5.7<span className="text-2xl">k</span></div>
                <div className="text-sm text-gray-300 mt-1">Real-estate assets</div>
              </div>
              <div>
                <div className="text-4xl font-bold">+24<span className="text-2xl">M</span></div>
                <div className="text-sm text-gray-300 mt-1">Monthly trading volume</div>
              </div>
              <div>
                <div className="text-4xl font-bold">11<span className="text-2xl">+</span></div>
                <div className="text-sm text-gray-300 mt-1">Years in real-estate finance</div>
              </div>
            </div>
          </div>
          
          {/* Right column with phone mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-[280px] md:w-[320px] h-[560px] md:h-[640px]">
              {/* Phone frame */}
              <div className="absolute inset-0 bg-black rounded-[40px] border-8 border-gray-800">
                {/* Phone screen with app UI */}
                <div className="absolute inset-0 overflow-hidden rounded-[32px] bg-white">
                  {/* App UI */}
                  <div className="relative h-full w-full">
                    {/* Status bar */}
                    <div className="h-6 bg-gray-100 flex justify-between items-center px-4">
                      <div className="text-xs">10:42</div>
                      <div className="w-16 h-4 bg-black rounded-full mx-auto"></div>
                      <div className="text-xs">80%</div>
                    </div>
                    
                    {/* App content */}
                    <div className="p-4">
                      {/* Map view */}
                      <div className="h-48 bg-blue-50 rounded-xl relative mb-4">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                              40
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Investment details */}
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-1">Size of investment</div>
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-bold">₦50,048,620 spent</div>
                          <div className="text-sm text-gray-500">Remaining: ₦26,803,430</div>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-2 bg-gray-200 rounded-full mb-4">
                        <div className="h-2 bg-primary rounded-full w-2/3"></div>
                      </div>
                      
                      {/* Investment button */}
                      <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium mb-3">
                        Invest Now
                      </button>
                      
                      <div className="text-xs text-center text-gray-500">
                        0% taxes per transaction
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Reflection effect */}
              <div className="absolute inset-0 rounded-[40px] shadow-xl bg-white/10 backdrop-blur-sm -z-10 translate-y-4 scale-[0.95] opacity-40"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
