import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS, STATUS as JoyrideStatus } from 'react-joyride';
import { useAuth } from '@/hooks/use-auth';
import useLocalStorage from '@/hooks/use-local-storage';

interface OnboardingTourProps {
  steps: Step[];
  tourId: string; // Unique identifier for this specific tour
  autoStart?: boolean;
  spotlightClicks?: boolean;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  tourId,
  autoStart = true,
  spotlightClicks = false,
}) => {
  const [runTour, setRunTour] = useState(false);
  const { user } = useAuth();
  const [completedTours, setCompletedTours] = useLocalStorage<string[]>('iREVA-completed-tours', []);

  useEffect(() => {
    // Only start the tour if:
    // 1. The user is logged in
    // 2. The tour hasn't been completed before
    // 3. autoStart is true
    if (user && autoStart && !completedTours.includes(tourId)) {
      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, autoStart, completedTours, tourId]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    
    // When the tour is finished or skipped, mark it as completed
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      
      // Add this tour to the list of completed tours
      if (!completedTours.includes(tourId)) {
        setCompletedTours([...completedTours, tourId]);
      }
    }
    
    // For debugging
    console.log('Tour step:', type, data);
  };

  // Allow manual starting of the tour from outside
  const startTour = () => {
    setRunTour(true);
  };

  // Allow manual resetting of tour completion status
  const resetTourStatus = () => {
    setCompletedTours(completedTours.filter((tour: string) => tour !== tourId));
  };

  return (
    <>
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        spotlightClicks={spotlightClicks}
        styles={{
          options: {
            primaryColor: '#3B82F6', // Primary color (blue-500)
            textColor: '#1F2937', // Gray-800
            backgroundColor: '#FFFFFF',
            arrowColor: '#FFFFFF',
            overlayColor: 'rgba(0, 0, 0, 0.6)',
          },
          tooltip: {
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          buttonNext: {
            backgroundColor: '#3B82F6',
            color: '#FFFFFF',
            borderRadius: '6px',
            padding: '10px 16px',
          },
          buttonBack: {
            marginRight: '10px',
            color: '#6B7280',
            borderRadius: '6px',
            padding: '10px 16px',
          },
          buttonSkip: {
            color: '#6B7280',
          },
          spotlight: {
            borderRadius: '8px',
          },
        }}
        callback={handleJoyrideCallback}
      />
    </>
  );
};

export { OnboardingTour, type OnboardingTourProps };