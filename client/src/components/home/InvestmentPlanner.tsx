import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { PieChart, BarChart3, Award, Settings, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InvestmentPlanner() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Parallax effect values for different elements
  const phoneY = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const contentY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  
  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Decorative gradient blobs */}
      <div className="absolute -top-64 -left-64 w-[500px] h-[500px] bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-96 -right-64 w-[500px] h-[500px] bg-indigo-200 dark:bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white"
          >
            Plan Your Financial Future
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Our intelligent platform helps you set goals and create a personalized investment roadmap to achieve financial freedom.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Phone Mockup */}
          <motion.div 
            style={{ y: phoneY, opacity }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative mx-auto w-full max-w-sm">
              {/* Phone frame */}
              <div className="relative z-10 bg-gray-900 dark:bg-black rounded-[40px] p-2 shadow-xl border-[5px] border-gray-800 dark:border-gray-900">
                {/* Screen content */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 overflow-hidden rounded-[32px] aspect-[9/19.5] relative">
                  {/* App header */}
                  <div className="px-5 py-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <PieChart className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">Investment Planner</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">12:45 PM</div>
                  </div>
                  
                  {/* App content */}
                  <div className="p-4">
                    {/* Investment Goal Card */}
                    <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Your Investment Goals</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Primary Goal: Retirement</div>
                            <div className="text-xs font-medium text-gray-900 dark:text-white">₦48M</div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: '35%' }}
                              transition={{ duration: 1.5, delay: 0.5 }}
                              viewport={{ once: true }}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                            ></motion.div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400">₦16.8M (35%)</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Target: 15 yrs</div>
                          </div>
                        </div>
                        
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                          viewport={{ once: true }}
                        >
                          <div className="flex justify-between mb-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Secondary: Property</div>
                            <div className="text-xs font-medium text-gray-900 dark:text-white">₦25M</div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: '52%' }}
                              transition={{ duration: 1.5, delay: 1 }}
                              viewport={{ once: true }}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                            ></motion.div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400">₦13M (52%)</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Target: 5 yrs</div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Investment Strategy */}
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Your Investment Strategy</h3>
                    
                    <div className="space-y-3">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                        viewport={{ once: true }}
                        className="flex justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">Monthly Investment</div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">₦250,000</div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 1.4 }}
                        viewport={{ once: true }}
                        className="flex justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-3">
                            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">Expected Returns</div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">13.5% p.a.</div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 1.6 }}
                        viewport={{ once: true }}
                        className="flex justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                            <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">Risk Profile</div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">Balanced</div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.8 }}
                viewport={{ once: true }}
                className="absolute -top-10 -right-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-20 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Projected ROI</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">+243% in 10 yrs</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Content */}
          <motion.div 
            style={{ y: contentY, opacity }}
            className="order-1 lg:order-2"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Smart algorithms plan your path to financial freedom
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Our AI-powered platform analyzes thousands of data points to create a customized investment strategy aligned with your unique goals and risk tolerance.
            </p>
            
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="flex"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <Settings className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Personalized Strategy</h4>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Our platform crafts a bespoke investment plan based on your financial goals, timeline, and risk appetite.
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Analytics</h4>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Track your progress with real-time analytics and visualizations that make complex data easy to understand.
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <PieChart className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Optimization</h4>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Maximize returns while minimizing risk through intelligent asset allocation across diverse property types.
                  </p>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-10"
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Create Your Plan
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}