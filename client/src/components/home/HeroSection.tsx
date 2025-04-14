import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Building2, Landmark, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-dark via-primary to-primary-light py-20 md:py-28">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Geometric patterns */}
        <div className="absolute inset-0 bg-grid-slate-100/[0.02] bg-[length:30px_30px]"></div>
        
        {/* Light beams effect */}
        <div className="absolute -left-10 -top-24 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute -right-20 top-1/4 w-60 h-60 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
        
        {/* Accent lines */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <svg className="absolute bottom-0 left-1/2 -translate-x-1/2" width="200" height="80" viewBox="0 0 200 80" fill="none">
          <path d="M100 0V80" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <path d="M0 40H200" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        </svg>
      </div>
      
      {/* Left side city skyline silhouette */}
      <div className="absolute bottom-0 left-0 w-1/3 h-40 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 300 120" fill="none">
          <path d="M0,120 L0,70 L15,70 L15,40 L25,40 L25,55 L35,55 L35,30 L45,30 L45,55 L55,55 L55,45 L65,45 L65,70 L75,70 L75,50 L85,50 L85,80 L95,80 L95,60 L105,60 L105,40 L115,40 L115,90 L125,90 L125,70 L135,70 L135,50 L145,50 L145,75 L155,75 L155,85 L165,85 L165,95 L175,95 L175,70 L185,70 L185,60 L195,60 L195,80 L205,80 L205,70 L215,70 L215,50 L225,50 L225,40 L235,40 L235,55 L245,55 L245,65 L255,65 L255,75 L265,75 L265,65 L275,65 L275,90 L285,90 L285,80 L295,80 L295,60 L300,60 L300,120 Z" fill="white"/>
        </svg>
      </div>
      
      {/* Right side city skyline silhouette */}
      <div className="absolute bottom-0 right-0 w-1/3 h-40 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 300 120" fill="none">
          <path d="M300,120 L300,50 L285,50 L285,75 L275,75 L275,60 L265,60 L265,40 L255,40 L255,55 L245,55 L245,65 L235,65 L235,40 L225,40 L225,80 L215,80 L215,60 L205,60 L205,50 L195,50 L195,80 L185,80 L185,65 L175,65 L175,55 L165,55 L165,75 L155,75 L155,45 L145,45 L145,55 L135,55 L135,70 L125,70 L125,50 L115,50 L115,40 L105,40 L105,60 L95,60 L95,75 L85,75 L85,55 L75,55 L75,40 L65,40 L65,60 L55,60 L55,80 L45,80 L45,70 L35,70 L35,45 L25,45 L25,65 L15,65 L15,85 L5,85 L5,75 L0,75 L0,120 Z" fill="white"/>
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Badge pill */}
          <motion.div 
            className="inline-flex items-center mb-6 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-white backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="flex items-center mr-2">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400/70"></span>
            </span>
            Nigeria's Premier Real Estate Investment Platform
          </motion.div>
          
          {/* Headline */}
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="block text-white drop-shadow-sm">Build Wealth Through</span>
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Real Estate Investment</span>
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p 
            className="mt-6 max-w-2xl mx-auto text-xl text-white/80 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Access premium Nigeria-based real estate opportunities with as little as ₦100,000. 
            Join thousands of investors building long-term wealth together.
          </motion.p>
          
          {/* CTA buttons */}
          <motion.div 
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-white to-white/80 rounded-lg blur opacity-70 group-hover:opacity-100 transition duration-200"></div>
              <Link href="#properties">
                <Button size="lg" className="relative w-full sm:w-auto bg-white text-primary hover:text-primary-dark hover:bg-white font-bold px-8 py-6 h-auto">
                  Browse Properties
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            
            <Link href="/how-it-works">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-medium px-8 py-6 h-auto"
              >
                Learn How It Works
              </Button>
            </Link>
          </motion.div>
          
          {/* Stats Section */}
          <motion.div 
            className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white">15+</div>
              <div className="text-sm text-white/70">Properties</div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white">5,000+</div>
              <div className="text-sm text-white/70">Investors</div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white">₦250M+</div>
              <div className="text-sm text-white/70">Funded</div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white">12.5%</div>
              <div className="text-sm text-white/70">Avg. Returns</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
