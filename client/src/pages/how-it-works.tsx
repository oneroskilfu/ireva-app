import { motion } from "framer-motion";
import { ArrowRight, Banknote, CheckCircle2, FileText, Home, SearchCheck, ThumbsUp, Users } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import Footer from "@/components/layout/Footer";

// Animation variants for the sections
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

// Animation variants for the process steps
const stepVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: (custom: number) => ({
    scale: 1,
    opacity: 1,
    transition: { 
      delay: custom * 0.3,
      type: "spring",
      stiffness: 100 
    }
  })
};

// Animation for the connecting lines
const lineVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { 
      delay: 0.5,
      duration: 1.5,
      ease: "easeInOut"
    }
  }
};

export default function HowItWorksPage() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              How REVA Works
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              Discover how easy it is to invest in premium Nigerian real estate through our innovative platform, building wealth with as little as ₦100,000.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="rounded-full px-8 py-6 text-base shadow-lg shadow-primary/20 font-medium">
                  Start Investing Today
                </Button>
              </Link>
              <Link href="/#properties">
                <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base font-medium">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animated Process Steps */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
            variants={itemVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Three Simple Steps</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Investing in real estate has never been easier. Follow these simple steps to begin your investment journey with REVA.
            </p>
          </motion.div>

          <div className="relative">
            {/* SVG Path connecting the steps */}
            <svg 
              className="absolute top-1/2 left-0 right-0 w-full -translate-y-1/2 hidden lg:block" 
              height="150" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path 
                d="M100,75 C300,0 500,150 700,75 C900,0 1100,150 1300,75" 
                stroke="url(#gradient)" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeDasharray="10,10"
                variants={lineVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
              {/* Step 1 */}
              <motion.div
                custom={0}
                variants={stepVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-50"></div>
                  <SearchCheck className="w-10 h-10 text-primary" />
                  <div className="absolute -right-2 -top-2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold">1</div>
                </div>
                <h3 className="text-xl font-bold mb-4">Browse Properties</h3>
                <p className="text-center text-gray-600 leading-relaxed">
                  Explore a variety of investment opportunities across different property types in Nigeria's most promising locations.
                </p>
                <motion.div 
                  className="mt-6 bg-gradient-to-r from-gray-100 to-white p-4 rounded-lg shadow-sm"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Research property details</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Review investment data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Filter by location and type</span>
                    </li>
                  </ul>
                </motion.div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                custom={1}
                variants={stepVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="flex flex-col items-center lg:mt-16"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-50 animation-delay-500"></div>
                  <Banknote className="w-10 h-10 text-primary" />
                  <div className="absolute -right-2 -top-2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold">2</div>
                </div>
                <h3 className="text-xl font-bold mb-4">Make Your Investment</h3>
                <p className="text-center text-gray-600 leading-relaxed">
                  Choose your investment amount, starting from as little as ₦100,000, and complete your secure transaction.
                </p>
                <motion.div 
                  className="mt-6 bg-gradient-to-r from-gray-100 to-white p-4 rounded-lg shadow-sm"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Select investment amount</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Secure Paystack payment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Receive confirmation</span>
                    </li>
                  </ul>
                </motion.div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                custom={2}
                variants={stepVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-50 animation-delay-1000"></div>
                  <ThumbsUp className="w-10 h-10 text-primary" />
                  <div className="absolute -right-2 -top-2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold">3</div>
                </div>
                <h3 className="text-xl font-bold mb-4">Track & Grow</h3>
                <p className="text-center text-gray-600 leading-relaxed">
                  Monitor your investment performance in real-time and watch your returns grow over time.
                </p>
                <motion.div 
                  className="mt-6 bg-gradient-to-r from-gray-100 to-white p-4 rounded-lg shadow-sm"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm">View your dashboard</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Receive quarterly updates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Collect your returns</span>
                    </li>
                  </ul>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-16">
              <motion.h2 
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold mb-6">
                Key Benefits of Investing with REVA
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="text-lg text-gray-600">
                Our platform offers unique advantages that make real estate investment accessible to everyone.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Banknote className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Low Minimum Investment</h3>
                <p className="text-gray-600">
                  Start with as little as ₦100,000 and gradually build your real estate portfolio with incremental investments.
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Home className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Premium Properties</h3>
                <p className="text-gray-600">
                  Access high-quality real estate investments in prime locations that would otherwise be out of reach for individual investors.
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Full Transparency</h3>
                <p className="text-gray-600">
                  Every property comes with comprehensive documentation, regular updates, and clear information about risks and returns.
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Community Insights</h3>
                <p className="text-gray-600">
                  Gain knowledge from our investor community through forums, Q&A sections, and exclusive market insights.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Overview */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Common Questions</h2>
              <p className="text-lg text-gray-600">
                Here are answers to some frequently asked questions about investing with REVA.
              </p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
              className="space-y-6"
            >
              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <h3 className="text-lg font-bold mb-3">How secure is my investment with REVA?</h3>
                <p className="text-gray-600">
                  All properties on REVA are thoroughly vetted, with legal documentation verified by our team of experts. We ensure clean titles, proper permits, and insurance coverage for every investment opportunity on our platform.
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <h3 className="text-lg font-bold mb-3">When will I receive returns on my investment?</h3>
                <p className="text-gray-600">
                  Returns vary by property type. Rental income properties typically provide quarterly distributions, while development projects usually deliver returns upon project completion or property sale, generally within 3-5 years.
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <h3 className="text-lg font-bold mb-3">Can I sell my investment before the term ends?</h3>
                <p className="text-gray-600">
                  While real estate is traditionally a long-term investment, REVA is developing a secondary market to allow investors to sell their shares to other investors, subject to certain conditions and availability of buyers.
                </p>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <Link href="/support">
                <Button variant="outline" size="lg" className="gap-2">
                  View All FAQs <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary/10 to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Ready to Start Your Investment Journey?
              </h2>
              <p className="text-lg text-gray-700 mb-12">
                Join thousands of investors building wealth through Nigerian real estate. Create your account today and start investing in minutes.
              </p>
              
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/auth">
                      <Button size="lg" className="rounded-full px-8 py-6 text-base shadow-lg shadow-primary/20 w-full sm:w-auto">
                        Create Account
                      </Button>
                    </Link>
                    <Link href="/#properties">
                      <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base w-full sm:w-auto">
                        Explore Properties
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}