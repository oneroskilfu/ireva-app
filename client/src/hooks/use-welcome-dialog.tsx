import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth-context';

/**
 * Hook to manage welcome dialog state
 * Shows the welcome dialog on first login or when explicitly requested
 */
export function useWelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  // Check if welcome should be shown on auth state change
  useEffect(() => {
    // Check if user has been welcomed before
    const hasSeenWelcome = localStorage.getItem('welcomeCompleted');
    
    // Show welcome dialog if:
    // 1. User is authenticated
    // 2. Has not seen welcome screen before
    if (isAuthenticated && user && !hasSeenWelcome) {
      setIsOpen(true);
    }
  }, [user, isAuthenticated]);
  
  // Open dialog
  const openWelcomeDialog = () => {
    setIsOpen(true);
  };
  
  // Close dialog
  const closeWelcomeDialog = () => {
    setIsOpen(false);
  };
  
  // Reset welcome status (for testing)
  const resetWelcomeStatus = () => {
    localStorage.removeItem('welcomeCompleted');
  };
  
  return {
    isWelcomeOpen: isOpen,
    openWelcomeDialog,
    closeWelcomeDialog,
    resetWelcomeStatus
  };
}