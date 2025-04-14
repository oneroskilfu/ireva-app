import React, { useEffect } from 'react';
import { useOnboarding } from '@/contexts/onboarding-context';
import Tooltip from './Tooltip';

export default function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { 
    isOnboardingActive, 
    getCurrentStep, 
    nextStep, 
    previousStep, 
    skipOnboarding,
    currentStepIndex,
    currentFlow
  } = useOnboarding();

  const currentStep = getCurrentStep();
  const steps = currentFlow === 'complete' ? [] : require('@/contexts/onboarding-context').ONBOARDING_STEPS[currentFlow];
  const totalSteps = steps ? steps.length : 0;

  useEffect(() => {
    // Check if the target element exists for the current step
    if (isOnboardingActive && currentStep) {
      const checkTargetExists = () => {
        const targetElement = document.getElementById(currentStep.targetId);
        if (!targetElement) {
          // If the target doesn't exist after a reasonable timeout, move to the next step
          console.log(`Target element #${currentStep.targetId} not found. Skipping to next step.`);
          nextStep();
        }
      };

      // Wait a bit for the DOM to be fully rendered
      const timeoutId = setTimeout(checkTargetExists, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isOnboardingActive, currentStep, nextStep]);

  // If we have a condition function, check if it passes
  useEffect(() => {
    if (isOnboardingActive && currentStep && currentStep.condition) {
      if (!currentStep.condition()) {
        // If condition doesn't pass, skip to next step
        nextStep();
      }
    }
  }, [isOnboardingActive, currentStep, nextStep]);

  return (
    <>
      {children}
      
      {/* Render the tooltip if onboarding is active and we have a current step */}
      {isOnboardingActive && currentStep && (
        <>
          <Tooltip
            targetId={currentStep.targetId}
            position={currentStep.position}
            title={`${currentStep.title} (${currentStepIndex + 1}/${totalSteps})`}
            content={currentStep.content}
            isOpen={true}
            onClose={skipOnboarding}
            onNext={nextStep}
            onPrevious={currentStepIndex > 0 ? previousStep : undefined}
            showPrevious={currentStepIndex > 0}
            showNext={true}
          />
          
          {/* Semi-transparent overlay to focus attention on the onboarding */}
          <div 
            className="fixed inset-0 bg-black/10 pointer-events-none z-30"
            style={{ pointerEvents: 'none' }} 
          />
        </>
      )}
    </>
  );
}