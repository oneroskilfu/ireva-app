import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Building, Gem, LineChart, Clock, Bitcoin, Shield } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const featureItems = [
  {
    icon: Building,
    color: "blue",
    title: "Redefining Real Estate Investment",
    description: "Access premium Nigerian real estate with fractional ownership, revolutionizing how the next generation builds wealth through high-yield properties."
  },
  {
    icon: Bitcoin,
    color: "orange",
    title: "Crypto Payments Integration",
    description: "Easily invest using cryptocurrency with our secure blockchain integration. Purchase property shares with Bitcoin, Ethereum, and other major cryptocurrencies."
  },
  {
    icon: Gem,
    color: "purple",
    title: "Unlock Premium Opportunities",
    description: "Gain access to a diverse range of investment options suitable for both accredited and non-accredited investors, starting with just ₦100,000."
  },
  {
    icon: Shield,
    color: "indigo",
    title: "Blockchain-Secured Investments",
    description: "Smart contracts provide transparent, tamper-proof records of your investments, with instant verification and property tokenization for enhanced security."
  },
  {
    icon: LineChart,
    color: "green",
    title: "Superior Returns",
    description: "Our carefully vetted properties deliver exceptional ROI—with comprehensive tracking tools to monitor your portfolio's performance in real-time."
  },
  {
    icon: Clock,
    color: "amber",
    title: "5-Year Maturity Model",
    description: "Our structured investment approach provides stability and predictable returns with a clear timeline to help you plan your financial future."
  }
];

const getGradient = (color: string) => {
  const gradients = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    amber: "from-amber-500 to-amber-600",
    orange: "from-orange-500 to-orange-600",
    indigo: "from-indigo-500 to-indigo-600"
  };
  return gradients[color as keyof typeof gradients] || "from-gray-500 to-gray-600";
};

const getLighterGradient = (color: string) => {
  const gradients = {
    blue: "from-blue-500/10 to-blue-600/10",
    purple: "from-purple-500/10 to-purple-600/10",
    green: "from-green-500/10 to-green-600/10",
    amber: "from-amber-500/10 to-amber-600/10",
    orange: "from-orange-500/10 to-orange-600/10",
    indigo: "from-indigo-500/10 to-indigo-600/10"
  };
  return gradients[color as keyof typeof gradients] || "from-gray-500/10 to-gray-600/10";
};

export default function AnimatedFeatures() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Why Next-Gen Investors Choose iREVA
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Revolutionary technology meets premium real estate, creating an unparalleled investment experience.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {featureItems.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl -z-10"
                   style={{ backgroundImage: `linear-gradient(to right, var(--color-${feature.color}-500), var(--color-${feature.color}-600))` }}></div>
                   
              <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700 h-full">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r rounded-t-xl"
                     style={{ backgroundImage: `linear-gradient(to right, var(--color-${feature.color}-500), var(--color-${feature.color}-600))` }}></div>
                
                <div className="p-6 flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center bg-gradient-to-r ${getGradient(feature.color)}`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 flex-grow">{feature.description}</p>
                </div>
                
                {/* Animated hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-700"
                     style={{ backgroundImage: `linear-gradient(to right, var(--color-${feature.color}-500), var(--color-${feature.color}-600))` }}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}