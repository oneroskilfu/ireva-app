import { motion } from 'framer-motion';

export default function TrustedBy() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Trusted by Industry Leaders
          </h3>
          
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-6">
            {['Prime Bank', 'FCMB', 'Flutterwave', 'Paystack', 'ZenithBank', 'GTBank'].map((name, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="h-12 px-6 bg-gray-100 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center"
              >
                <span className="text-base font-semibold text-gray-800 dark:text-white">{name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}