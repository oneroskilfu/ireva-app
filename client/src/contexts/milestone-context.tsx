import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useConfetti } from '@/components/ui/celebration';
import { useToast } from '@/hooks/use-toast';

// Define milestone types
export type MilestoneType = 
  // Account creation milestones
  | 'account_created'
  | 'profile_completed'
  | 'first_login'
  // KYC milestones
  | 'kyc_started'
  | 'kyc_submitted'
  | 'kyc_approved'
  // Investment milestones
  | 'first_property_viewed'
  | 'first_investment'
  | 'investment_threshold_1000'
  | 'investment_threshold_5000'
  | 'investment_threshold_10000'
  // Wallet milestones
  | 'wallet_first_funding'
  | 'wallet_threshold_1000'
  | 'wallet_threshold_5000'
  // Portfolio milestones  
  | 'portfolio_diversified' // When user invests in 3+ properties
  | 'first_return_received';

// Milestone celebration configurations
const MILESTONE_CONFIGS: Record<MilestoneType, {
  title: string;
  description: string;
  variant?: 'default' | 'confetti' | 'award' | 'trophy';
  icon?: 'trophy' | 'confetti' | 'award' | 'medal' | 'star' | 'check';
  toast?: boolean; // Whether to show a toast instead of full-screen celebration
}> = {
  // Account milestones
  account_created: {
    title: 'Welcome to REVA!',
    description: 'Your account has been successfully created. Start your investment journey today!',
    variant: 'confetti',
    icon: 'confetti'
  },
  profile_completed: {
    title: 'Profile Completed',
    description: 'Your profile is now complete. This helps us tailor investment opportunities to your preferences.',
    icon: 'check',
    toast: true
  },
  first_login: {
    title: 'Welcome Back!',
    description: 'Great to see you again. Your investment journey continues!',
    icon: 'confetti',
    toast: true
  },
  
  // KYC milestones
  kyc_started: {
    title: 'KYC Process Started',
    description: 'You\'ve begun the identity verification process. This is a key step in your investment journey.',
    icon: 'check',
    toast: true
  },
  kyc_submitted: {
    title: 'KYC Submitted',
    description: 'Your identity documents have been submitted for verification. We\'ll review them shortly.',
    icon: 'check',
    variant: 'default',
    toast: true
  },
  kyc_approved: {
    title: 'KYC Approved!',
    description: 'Congratulations! Your identity has been verified. You now have full access to all investment features.',
    variant: 'trophy',
    icon: 'trophy'
  },
  
  // Investment milestones
  first_property_viewed: {
    title: 'First Property Explored',
    description: 'You\'ve taken the first step by exploring property details. Find the perfect investment for your portfolio.',
    icon: 'star',
    toast: true
  },
  first_investment: {
    title: 'First Investment Made!',
    description: 'Congratulations on your first property investment! You\'ve officially started your real estate portfolio.',
    variant: 'trophy',
    icon: 'trophy'
  },
  investment_threshold_1000: {
    title: '$1,000 Invested',
    description: 'You\'ve reached your first investment milestone. Keep building your portfolio!',
    variant: 'award',
    icon: 'award'
  },
  investment_threshold_5000: {
    title: '$5,000 Invested',
    description: 'You\'re becoming a serious investor! Your portfolio is growing nicely.',
    variant: 'award',
    icon: 'medal'
  },
  investment_threshold_10000: {
    title: '$10,000 Milestone!',
    description: 'Impressive! You\'ve joined our top tier of investors with over $10,000 invested.',
    variant: 'trophy',
    icon: 'trophy'
  },
  
  // Wallet milestones
  wallet_first_funding: {
    title: 'Wallet Funded',
    description: 'You\'ve successfully added funds to your wallet. Now you\'re ready to invest!',
    icon: 'check',
    toast: true
  },
  wallet_threshold_1000: {
    title: '$1,000 in Wallet',
    description: 'Your wallet now has over $1,000. Ready to make some investments?',
    icon: 'star',
    toast: true
  },
  wallet_threshold_5000: {
    title: '$5,000 in Wallet',
    description: 'With $5,000 in your wallet, you have access to a wide range of investment opportunities.',
    variant: 'award',
    icon: 'medal'
  },
  
  // Portfolio milestones
  portfolio_diversified: {
    title: 'Portfolio Diversified',
    description: 'Smart move! By investing in multiple properties, you\'ve diversified your portfolio and reduced risk.',
    variant: 'trophy',
    icon: 'trophy'
  },
  first_return_received: {
    title: 'First Return Received',
    description: 'You\'ve received your first investment return. This is what real estate investing is all about!',
    variant: 'confetti',
    icon: 'confetti'
  }
};

type MilestoneContextType = {
  completedMilestones: Set<MilestoneType>;
  triggerMilestone: (milestone: MilestoneType) => void;
  checkMilestone: (milestone: MilestoneType) => boolean;
  resetMilestones: () => void;
};

export const MilestoneContext = createContext<MilestoneContextType | undefined>(undefined);

export function MilestoneProvider({ children }: { children: ReactNode }) {
  const [completedMilestones, setCompletedMilestones] = useState<Set<MilestoneType>>(new Set());
  const { showConfetti, Confetti } = useConfetti();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Load completed milestones from localStorage
  useEffect(() => {
    if (user) {
      try {
        const savedMilestones = localStorage.getItem(`reva_milestones_${user.id}`);
        if (savedMilestones) {
          setCompletedMilestones(new Set(JSON.parse(savedMilestones)));
        }
      } catch (error) {
        console.error('Error loading milestones:', error);
      }
    }
  }, [user]);
  
  // Save completed milestones to localStorage when they change
  useEffect(() => {
    if (user && completedMilestones.size > 0) {
      localStorage.setItem(
        `reva_milestones_${user.id}`, 
        JSON.stringify(Array.from(completedMilestones))
      );
    }
  }, [completedMilestones, user]);
  
  const triggerMilestone = (milestone: MilestoneType) => {
    // Only trigger if the milestone hasn't been completed
    if (!completedMilestones.has(milestone)) {
      const config = MILESTONE_CONFIGS[milestone];
      
      // Mark the milestone as completed
      setCompletedMilestones(prev => {
        const updated = new Set(prev);
        updated.add(milestone);
        return updated;
      });
      
      // Show celebration
      if (config.toast) {
        toast({
          title: config.title,
          description: config.description,
          variant: "default"
        });
      } else {
        showConfetti(
          config.title,
          config.description,
          {
            variant: config.variant,
            icon: config.icon
          }
        );
      }
    }
  };
  
  const checkMilestone = (milestone: MilestoneType): boolean => {
    return completedMilestones.has(milestone);
  };
  
  const resetMilestones = () => {
    if (user) {
      localStorage.removeItem(`reva_milestones_${user.id}`);
      setCompletedMilestones(new Set());
    }
  };
  
  return (
    <MilestoneContext.Provider value={{
      completedMilestones,
      triggerMilestone,
      checkMilestone,
      resetMilestones
    }}>
      {children}
      {Confetti}
    </MilestoneContext.Provider>
  );
}

export function useMilestones() {
  const context = useContext(MilestoneContext);
  if (context === undefined) {
    throw new Error('useMilestones must be used within a MilestoneProvider');
  }
  return context;
}