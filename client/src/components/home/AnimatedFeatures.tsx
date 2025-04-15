import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Building, Shield, TrendingUp, Globe, PieChart, Zap } from 'lucide-react';

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
    title: "Premium Properties",
    description: "Access high-yield real estate opportunities previously available only to elite investors. Our properties are carefully vetted by industry experts."
  },
  {
    icon: Shield,
    color: "purple",
    title: "Bank-Level Security",
    description: "Your investments are protected with enterprise-grade encryption, legal documentation, and comprehensive property insurance."
  },
  {
    icon: TrendingUp,
    color: "green",
    title: "Higher Returns",
    description: "Achieve up to 15% annual returns—significantly outperforming traditional savings options and the volatile crypto market."
  },
  {
    icon: PieChart,
    color: "amber",
    title: "Smart Portfolio",
    description: "AI-powered analytics help optimize your investment allocation across property types, locations, and risk profiles."
  },
  {
    icon: Globe,
    color: "pink",
    title: "Nationwide Access",
    description: "Diversify your investments across Nigeria's most promising real estate markets from Lagos to Abuja and Port Harcourt."
  },
  {
    icon: Zap,
    color: "indigo",
    title: "Instant Liquidity",
    description: "Unlike traditional real estate, access your invested capital with our proprietary secondary market technology."
  }
];

const getGradient = (color: string) => {
  const gradients = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    amber: "from-amber-500 to-amber-600",
    pink: "from-pink-500 to-pink-600",
    indigo: "from-indigo-500 to-indigo-600"
  };
  return gradients[color as keyof typeof gradients];
};

const getLighterGradient = (color: string) => {
  const gradients = {
    blue: "from-blue-500/10 to-blue-600/10",
    purple: "from-purple-500/10 to-purple-600/10",
    green: "from-green-500/10 to-green-600/10",
    amber: "from-amber-500/10 to-amber-600/10",
    pink: "from-pink-500/10 to-pink-600/10",
    indigo: "from-indigo-500/10 to-indigo-600/10"
  };
  return gradients[color as keyof typeof gradients];
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {featureItems.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl -z-10"
                   style={{ backgroundImage: `linear-gradient(to right, var(--color-${feature.color}-500), var(--color-${feature.color}-600))` }}></div>
                   
              <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r rounded-t-xl"
                     style={{ backgroundImage: `linear-gradient(to right, var(--color-${feature.color}-500), var(--color-${feature.color}-600))` }}></div>
                
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center bg-gradient-to-r ${getGradient(feature.color)}`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
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