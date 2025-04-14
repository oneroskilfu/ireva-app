import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export type OnboardingStep = {
  id: string;
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  route?: string;
  condition?: () => boolean;
};

// Define different onboarding flows
export type OnboardingFlow = 'dashboard' | 'property' | 'investment' | 'complete';

// Define onboarding steps for each flow
export const ONBOARDING_STEPS: Record<OnboardingFlow, OnboardingStep[]> = {
  dashboard: [
    {
      id: 'welcome',
      targetId: 'dashboard-welcome',
      title: 'Welcome to REVA',
      content: 'This is your personal dashboard where you can manage all your investment activities.',
      position: 'bottom',
    },
    {
      id: 'portfolio',
      targetId: 'portfolio-section',
      title: 'Your Portfolio',
      content: 'Here you can see all your current investments and their performance at a glance.',
      position: 'right',
    },
    {
      id: 'recommendations',
      targetId: 'ai-recommendations',
      title: 'Personalized Recommendations',
      content: 'Our AI analyzes your preferences to suggest properties that match your investment goals.',
      position: 'bottom',
    },
    {
      id: 'activity',
      targetId: 'recent-activity',
      title: 'Recent Activity',
      content: 'Keep track of all your recent transactions and important updates here.',
      position: 'left',
    },
  ],
  property: [
    {
      id: 'property-overview',
      targetId: 'property-overview',
      title: 'Property Details',
      content: 'Here you can view all the essential information about this property.',
      position: 'bottom',
    },
    {
      id: 'financial-details',
      targetId: 'financial-details',
      title: 'Financial Overview',
      content: 'Review the expected returns, funding progress, and other key financial metrics.',
      position: 'right',
    },
    {
      id: 'investment-options',
      targetId: 'investment-options',
      title: 'Investment Options',
      content: 'Choose your investment amount and review the projected returns.',
      position: 'top',
    },
  ],
  investment: [
    {
      id: 'investment-amount',
      targetId: 'investment-amount',
      title: 'Investment Amount',
      content: 'Select how much you want to invest. You can start with as little as ₦100,000.',
      position: 'bottom',
    },
    {
      id: 'payment-options',
      targetId: 'payment-options',
      title: 'Payment Methods',
      content: 'Choose your preferred payment method. All transactions are secure and encrypted.',
      position: 'right',
    },
    {
      id: 'confirm-investment',
      targetId: 'confirm-investment',
      title: 'Confirm Your Investment',
      content: 'Review your investment details before finalizing your transaction.',
      position: 'top',
    },
  ],
  complete: [],
};

type OnboardingContextType = {
  currentFlow: OnboardingFlow;
  currentStepIndex: number;
  isOnboardingActive: boolean;
  startOnboarding: (flow: OnboardingFlow) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  isStepActive: (stepId: string) => boolean;
  getCurrentStep: () => OnboardingStep | null;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentFlow, setCurrentFlow] = useState<OnboardingFlow>('complete');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isOnboardingActive, setIsOnboardingActive] = useState<boolean>(false);
  const [completedFlows, setCompletedFlows] = useState<OnboardingFlow[]>([]);
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Load onboarding state from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const savedCompletedFlows = localStorage.getItem(`reva-onboarding-completed-${user.id}`);
      if (savedCompletedFlows) {
        setCompletedFlows(JSON.parse(savedCompletedFlows));
      }
    }
  }, [user]);

  // Save completed flows to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && user && completedFlows.length > 0) {
      localStorage.setItem(`reva-onboarding-completed-${user.id}`, JSON.stringify(completedFlows));
    }
  }, [completedFlows, user]);

  // Handle automatic starting of onboarding based on route
  useEffect(() => {
    if (user && !isOnboardingActive) {
      // Check if we should start any onboarding flows based on the current route
      if (location === '/dashboard' && !completedFlows.includes('dashboard')) {
        startOnboarding('dashboard');
      } else if (location.startsWith('/property/') && !completedFlows.includes('property')) {
        startOnboarding('property');
      } else if (location.includes('invest') && !completedFlows.includes('investment')) {
        startOnboarding('investment');
      }
    }
  }, [location, user, isOnboardingActive, completedFlows]);

  // Function to get the current step
  const getCurrentStep = (): OnboardingStep | null => {
    const steps = ONBOARDING_STEPS[currentFlow];
    if (!steps || currentStepIndex >= steps.length) return null;
    return steps[currentStepIndex];
  };

  // Function to start onboarding flow
  const startOnboarding = (flow: OnboardingFlow) => {
    if (completedFlows.includes(flow)) return;
    
    setCurrentFlow(flow);
    setCurrentStepIndex(0);
    setIsOnboardingActive(true);
    
    // Navigate to the route if specified and we're not already there
    const firstStep = ONBOARDING_STEPS[flow][0];
    if (firstStep?.route && location !== firstStep.route) {
      navigate(firstStep.route);
    }
  };

  // Function to go to next step
  const nextStep = () => {
    const currentStep = getCurrentStep();
    const steps = ONBOARDING_STEPS[currentFlow];
    
    if (!currentStep || currentStepIndex >= steps.length - 1) {
      completeOnboarding();
      return;
    }
    
    setCurrentStepIndex(currentStepIndex + 1);
    
    // Navigate to the route if specified
    const nextStep = steps[currentStepIndex + 1];
    if (nextStep.route && location !== nextStep.route) {
      navigate(nextStep.route);
    }
  };

  // Function to go to previous step
  const previousStep = () => {
    if (currentStepIndex <= 0) return;
    
    setCurrentStepIndex(currentStepIndex - 1);
    
    // Navigate to the route if specified
    const prevStep = ONBOARDING_STEPS[currentFlow][currentStepIndex - 1];
    if (prevStep.route && location !== prevStep.route) {
      navigate(prevStep.route);
    }
  };

  // Function to skip all onboarding
  const skipOnboarding = () => {
    setIsOnboardingActive(false);
    setCurrentFlow('complete');
    setCurrentStepIndex(0);
    toast({
      title: "Onboarding skipped",
      description: "You can restart the tour anytime from your profile settings.",
      variant: "default",
    });
  };

  // Function to complete current onboarding flow
  const completeOnboarding = () => {
    setIsOnboardingActive(false);
    setCurrentFlow('complete');
    setCurrentStepIndex(0);
    
    // Add to completed flows
    if (!completedFlows.includes(currentFlow)) {
      setCompletedFlows([...completedFlows, currentFlow]);
    }
    
    toast({
      title: "Onboarding completed!",
      description: "You're all set to explore REVA and start investing.",
      variant: "default",
    });
  };

  // Function to check if a specific step is active
  const isStepActive = (stepId: string): boolean => {
    const currentStep = getCurrentStep();
    return isOnboardingActive && currentStep?.id === stepId;
  };

  const contextValue: OnboardingContextType = {
    currentFlow,
    currentStepIndex,
    isOnboardingActive,
    startOnboarding,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    isStepActive,
    getCurrentStep,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}