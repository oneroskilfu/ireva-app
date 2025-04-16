import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { AnimatedGradient } from './AnimatedGradient';
import { ChevronRight, ArrowRight } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  }
};

export default function ModernHero() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 pt-16">
      <AnimatedGradient />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative z-10">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center"
        >
          {/* Hero Text */}
          <motion.div variants={fadeIn} className="lg:col-span-6 text-white">
            <motion.div 
              variants={fadeIn}
              className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6"
            >
              Redefining Real Estate Investment
            </motion.div>
            
            <motion.h1 
              variants={fadeIn} 
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200"
            >
              Unlock Premium <br />Nigerian Real Estate
            </motion.h1>
            
            <motion.p 
              variants={fadeIn} 
              className="mt-6 text-lg text-gray-300 max-w-lg"
            >
              iREVA lets the next generation of investors build wealth through fractional ownership of high-yield properties — starting with just ₦100,000.
            </motion.p>
            
            <motion.div 
              variants={fadeIn}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 group"
              >
                Start Investing 
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                Explore Properties
              </Button>
            </motion.div>
            
            {/* Stats Row */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="mt-16 grid grid-cols-3 gap-8"
            >
              <motion.div variants={statVariants} className="text-center">
                <div className="flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">5.7</span>
                  <span className="text-xl font-medium text-blue-300 ml-1">k</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">Investors Onboard</p>
              </motion.div>
              
              <motion.div variants={statVariants} className="text-center">
                <div className="flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">13.5</span>
                  <span className="text-xl font-medium text-blue-300 ml-1">%</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">Average Returns</p>
              </motion.div>
              
              <motion.div variants={statVariants} className="text-center">
                <div className="flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">98</span>
                  <span className="text-xl font-medium text-blue-300 ml-1">%</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">Success Rate</p>
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Hero App Mockup */}
          <motion.div 
            variants={fadeIn} 
            className="lg:col-span-6 relative"
          >
            <motion.div 
              variants={floatingAnimation}
              initial="initial"
              animate="animate"
              className="relative mx-auto w-full max-w-md"
            >
              {/* Phone frame */}
              <div className="relative z-10 bg-black rounded-[40px] p-2 shadow-xl border-[5px] border-gray-800">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[40%] h-[25px] bg-black z-20 rounded-b-[16px]"></div>
                
                {/* Screen content */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden rounded-[32px] aspect-[9/19.5]">
                  {/* App header */}
                  <div className="px-5 py-6 flex justify-between items-center border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">iR</span>
                      </div>
                      <span className="font-semibold text-white">iREVA</span>
                    </div>
                    <div className="text-white text-xs">7:32 PM</div>
                  </div>
                  
                  {/* App content */}
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="text-white text-lg font-bold mb-1">Welcome back, Alex</h3>
                      <p className="text-gray-400 text-xs">Your portfolio is performing well today</p>
                    </div>
                    
                    {/* Portfolio value card with mini growth chart */}
                    <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-md rounded-xl border border-white/10 p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-gray-400">Portfolio Value</span>
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">+8.2%</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-2xl font-bold text-white mb-1">₦12,458,620</div>
                          <div className="text-sm text-green-400">+₦145,800 this month</div>
                        </div>
                        {/* Simplified Portfolio Growth Line */}
                        <div className="h-10 flex items-end space-x-[2px]">
                          {[30, 28, 35, 32, 40, 38, 45, 43, 50, 55].map((height, i) => (
                            <div 
                              key={i} 
                              className="w-1 bg-green-400"
                              style={{ height: `${height}%` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced ROI Chart */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 mb-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white font-medium">ROI Performance</span>
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">Last 6 months</span>
                      </div>
                      
                      {/* Enhanced data markers */}
                      <div className="flex justify-between mb-1">
                        <div className="text-[9px] text-gray-400">
                          <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                          Actual
                        </div>
                        <div className="text-[9px] text-gray-400">
                          <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                          Benchmark
                        </div>
                        <div className="text-[9px] text-gray-400">
                          <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
                          Projected
                        </div>
                      </div>
                      
                      {/* Colorful Chart with data overlays */}
                      <div className="h-32 flex items-end space-x-2 mb-2 relative">
                        {/* Reference lines */}
                        <div className="absolute left-0 right-0 h-[1px] bg-gray-600 opacity-30" style={{ bottom: '25%' }}></div>
                        <div className="absolute left-0 right-0 h-[1px] bg-gray-600 opacity-30" style={{ bottom: '50%' }}></div>
                        <div className="absolute left-0 right-0 h-[1px] bg-gray-600 opacity-30" style={{ bottom: '75%' }}></div>
                        
                        {/* Reference labels */}
                        <div className="absolute -left-1 text-[8px] text-gray-500" style={{ bottom: '25%', transform: 'translateY(50%)' }}>5%</div>
                        <div className="absolute -left-1 text-[8px] text-gray-500" style={{ bottom: '50%', transform: 'translateY(50%)' }}>10%</div>
                        <div className="absolute -left-1 text-[8px] text-gray-500" style={{ bottom: '75%', transform: 'translateY(50%)' }}>15%</div>
                        
                        {/* Bars with enhanced styling */}
                        {[
                          { month: 'Jan', actual: 15, benchmark: 10, projected: 15 },
                          { month: 'Feb', actual: 28, benchmark: 11, projected: 20 },
                          { month: 'Mar', actual: 20, benchmark: 12, projected: 25 },
                          { month: 'Apr', actual: 40, benchmark: 15, projected: 33 },
                          { month: 'May', actual: 30, benchmark: 17, projected: 40 },
                          { month: 'Jun', actual: 50, benchmark: 20, projected: 55 }
                        ].map((data, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            {/* Bars group */}
                            <div className="w-full flex justify-center">
                              {/* Benchmark bar in the back */}
                              <div className="w-[30%] mr-[2px] bg-blue-400/40 rounded-t-sm" 
                                   style={{ height: `${data.benchmark}%` }}></div>
                              
                              {/* Main bar - actual performance */}
                              <div className={`w-[40%] rounded-t-sm ${
                                i === 5 ? 'bg-gradient-to-t from-green-500 to-green-300' : 
                                         'bg-gradient-to-t from-green-500/80 to-green-300/80'
                              }`} style={{ height: `${data.actual}%` }}>
                                {data.actual > 25 && (
                                  <div className="text-[8px] text-white font-bold text-center leading-tight pt-[2px]">
                                    {data.actual/5}%
                                  </div>
                                )}
                              </div>
                              
                              {/* Projected bar */}
                              <div className="w-[30%] ml-[2px] bg-purple-400/40 rounded-t-sm" 
                                   style={{ height: `${data.projected}%` }}></div>
                            </div>
                            
                            {/* Month indicator */}
                            <div className="w-full h-[1px] bg-gray-700"></div>
                            <div className="text-gray-400 text-[10px] mt-1">
                              {data.month}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-400">
                        <div>Average: <span className="text-green-400">14.2%</span></div>
                        <div>YTD: <span className="text-green-500">+32.5%</span></div>
                        <div>Target: <span className="text-blue-400">16.8%</span></div>
                      </div>
                    </div>
                    
                    {/* Properties - Reduced to 2 to make space for chart */}
                    <div className="space-y-3">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-lg flex justify-between items-center">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 ${
                              i === 0 ? 'bg-blue-500/20' : 'bg-purple-500/20'
                            } rounded-full flex items-center justify-center mr-3`}>
                              <div className={`w-6 h-6 ${
                                i === 0 ? 'bg-blue-500' : 'bg-purple-500'
                              } rounded-full`}></div>
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium">
                                {i === 0 ? 'Skyline Towers' : 'Ocean View Villas'}
                              </div>
                              <div className="text-gray-400 text-xs">
                                {i === 0 ? 'Lagos, Nigeria' : 'Abuja, Nigeria'}
                              </div>
                            </div>
                          </div>
                          <div className="text-green-400 text-sm font-medium">
                            {i === 0 ? '+₦25,400' : '+₦32,200'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats card floating */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-6 -right-6 md:-right-20 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-3 backdrop-blur-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-2 mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Asset Growth</div>
                    <div className="text-xs text-green-500">+24%</div>
                  </div>
                  <div className="relative h-8">
                    <div className="absolute bottom-0 left-0 right-0 flex items-end space-x-[1px]">
                      {[20, 25, 22, 35, 30, 45, 40, 55, 50, 65, 60, 80].map((height, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 ${i % 2 === 0 ? 'bg-blue-400 dark:bg-blue-500' : 'bg-indigo-400 dark:bg-indigo-500'} rounded-t-sm`}
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Next Payout</div>
                    <div className="text-sm font-semibold dark:text-white">₦485,000</div>
                  </div>
                  <div className="text-sm font-medium text-green-500">Jun 15</div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-16 right-16 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </motion.div>
        </motion.div>
        
        {/* Trusted By */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-20 text-center"
        >
          <p className="text-sm text-gray-400 mb-6">Trusted by Industry Leaders</p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-6">
            {['Prime Bank', 'FCMB', 'Flutterwave', 'Paystack', 'ZenithBank', 'GTBank'].map((name, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + (i * 0.1) }}
                className="h-8 px-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center"
              >
                <span className="text-sm font-semibold text-white">{name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Down arrow */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            y: [0, 10, 10, 20]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 2,
            delay: 2
          }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
        >
          <ChevronRight className="w-6 h-6 rotate-90" />
        </motion.div>
      </div>
    </section>
  );
}