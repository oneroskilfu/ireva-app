import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingIndicator } from "./loading-indicator";
import { usePageTransition } from "@/contexts/page-transition-context";

export function PageLoading() {
  const [location] = useLocation();
  const { isLoading } = usePageTransition();
  const [prevLocation, setPrevLocation] = useState(location);
  const [show, setShow] = useState(false);
  
  // Update previous location when it changes
  useEffect(() => {
    if (prevLocation !== location) {
      setPrevLocation(location);
    }
  }, [location, prevLocation]);

  // Show loading indicator when isLoading changes
  useEffect(() => {
    if (isLoading) {
      // Small delay before showing loading to avoid flashes during quick loads
      const timer = setTimeout(() => {
        setShow(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <LoadingIndicator size="lg" />
            <p className="mt-4 text-sm text-gray-500 animate-pulse">Loading...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}