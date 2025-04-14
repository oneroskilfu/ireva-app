import { useContext } from 'react';
import { MilestoneContext, MilestoneType } from '@/contexts/milestone-context';

/**
 * A hook that safely accesses the milestone context and provides fallback values
 * when the context is not available. This prevents errors when components using
 * this hook render before the MilestoneProvider is fully initialized.
 */
export function useSafeMilestones() {
  // Try to access the milestone context
  const context = useContext(MilestoneContext);
  
  // If context is not available, provide fallback functions
  if (!context) {
    // Create a dummy implementation with empty functions
    return {
      completedMilestones: new Set<MilestoneType>(),
      triggerMilestone: (milestone: MilestoneType) => {
        console.log(`Safe milestone trigger attempted: ${milestone}`);
        // No-op - silently succeed
      },
      checkMilestone: (milestone: MilestoneType) => {
        console.log(`Safe milestone check attempted: ${milestone}`);
        return false; 
      },
      resetMilestones: () => {
        console.log('Safe milestone reset attempted');
        // No-op
      }
    };
  }

  // If context is available, return it
  return context;
}