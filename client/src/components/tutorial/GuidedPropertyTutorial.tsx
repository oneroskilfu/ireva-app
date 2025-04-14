import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  HelpCircle,
  LightbulbIcon
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

interface TutorialStep {
  id: number;
  targetSelector: string;
  title: string;
  description: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

// Tutorial steps for property details page
const propertyTutorialSteps: TutorialStep[] = [
  {
    id: 1,
    targetSelector: '.property-image', // Target the property image
    title: "Property Overview",
    description: "This is the main image of the property. You can click on it to see more detailed photos in the gallery below.",
    position: 'bottom'
  },
  {
    id: 2,
    targetSelector: '.property-stats', // Target the property stats section
    title: "Key Investment Metrics",
    description: "Here you can see important investment details like projected returns, minimum investment amount, and term length.",
    position: 'bottom'
  },
  {
    id: 3,
    targetSelector: '.property-funding-progress', // Target the funding progress bar
    title: "Funding Progress",
    description: "This progress bar shows how much of the target funding has been raised so far and how many days are left in the funding period.",
    position: 'top'
  },
  {
    id: 4,
    targetSelector: '.property-invest-button', // Target the invest button
    title: "Take Action",
    description: "Click this button to invest in this property. You'll be able to specify your investment amount on the next screen.",
    position: 'left'
  },
  {
    id: 5,
    targetSelector: '.property-share-buttons', // Target the share buttons
    title: "Share This Opportunity",
    description: "Share this investment opportunity with friends and family using these social sharing buttons.",
    position: 'top'
  },
  {
    id: 6,
    targetSelector: '.property-tabs', // Target the tabs section
    title: "Detailed Information",
    description: "Explore these tabs to find more detailed information about the property, including financials, location details, and important documents.",
    position: 'top'
  }
];

interface GuidedPropertyTutorialProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

export function GuidedPropertyTutorial({ 
  onComplete,
  autoStart = false
}: GuidedPropertyTutorialProps) {
  const [isActive, setIsActive] = useState(autoStart);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useLocalStorage("reva-guided-tutorial-completed", false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipSize, setTooltipSize] = useState({ width: 250, height: 150 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Position the tooltip relative to the target element
  const positionTooltip = () => {
    if (!isActive || currentStep >= propertyTutorialSteps.length) return;
    
    const step = propertyTutorialSteps[currentStep];
    const targetElement = document.querySelector(step.targetSelector);
    
    if (!targetElement || !tooltipRef.current) return;
    
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipWidth = tooltipRef.current.offsetWidth;
    const tooltipHeight = tooltipRef.current.offsetHeight;
    
    // Calculate position based on specified position
    let top = 0;
    let left = 0;
    
    switch (step.position) {
      case 'top':
        top = targetRect.top - tooltipHeight - 10 + window.scrollY;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2) + window.scrollX;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2) + window.scrollY;
        left = targetRect.right + 10 + window.scrollX;
        break;
      case 'bottom':
        top = targetRect.bottom + 10 + window.scrollY;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2) + window.scrollX;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2) + window.scrollY;
        left = targetRect.left - tooltipWidth - 10 + window.scrollX;
        break;
    }
    
    // Keep tooltip within viewport bounds
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 10)
      left = window.innerWidth - tooltipWidth - 10;
    if (top < 10) top = 10;
    if (top + tooltipHeight > window.innerHeight - 10)
      top = window.innerHeight - tooltipHeight - 10;
    
    setTooltipPosition({ top, left });
  };
  
  // Highlight the target element
  const highlightTarget = () => {
    if (!isActive || currentStep >= propertyTutorialSteps.length) return;
    
    // Remove any existing highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
    
    const step = propertyTutorialSteps[currentStep];
    const targetElement = document.querySelector(step.targetSelector);
    
    if (targetElement) {
      targetElement.classList.add('tutorial-highlight');
    }
  };
  
  // Move to next step or complete tutorial
  const nextStep = () => {
    if (currentStep < propertyTutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };
  
  // Move to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Complete the tutorial
  const completeTutorial = () => {
    setIsActive(false);
    setHasCompletedTutorial(true);
    
    // Remove any existing highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
    
    if (onComplete) {
      onComplete();
    }
  };
  
  // Skip the tutorial
  const skipTutorial = () => {
    setIsActive(false);
    setHasCompletedTutorial(true);
    
    // Remove any existing highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
  };
  
  // Start the tutorial
  const startTutorial = () => {
    setCurrentStep(0);
    setIsActive(true);
  };
  
  // Reset the tutorial for testing
  const resetTutorial = () => {
    setHasCompletedTutorial(false);
    setCurrentStep(0);
  };
  
  // Update tooltip position when step changes or window resizes
  useEffect(() => {
    if (isActive) {
      highlightTarget();
      positionTooltip();
      
      // Add resize event listener
      window.addEventListener('resize', positionTooltip);
      window.addEventListener('scroll', positionTooltip);
      
      // Update tooltip size after rendering
      if (tooltipRef.current) {
        setTooltipSize({
          width: tooltipRef.current.offsetWidth,
          height: tooltipRef.current.offsetHeight
        });
      }
      
      return () => {
        window.removeEventListener('resize', positionTooltip);
        window.removeEventListener('scroll', positionTooltip);
      };
    }
  }, [isActive, currentStep]);
  
  // Check if tutorial should autostart
  useEffect(() => {
    if (autoStart && !hasCompletedTutorial) {
      // Delay start to ensure the page has fully loaded
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [autoStart, hasCompletedTutorial]);
  
  if (!isActive) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1.5"
        onClick={startTutorial}
      >
        <HelpCircle className="h-4 w-4" />
        <span>Property Tour</span>
      </Button>
    );
  }
  
  return (
    <>
      {/* Add global style for highlighted elements */}
      <style>
        {`
        .tutorial-highlight {
          position: relative;
          z-index: 50;
          box-shadow: 0 0 0 4px rgba(var(--primary), 0.5), 0 0 0 2000px rgba(0, 0, 0, 0.5);
          border-radius: 4px;
        }
        `}
      </style>
      
      {/* Tooltip */}
      {isActive && currentStep < propertyTutorialSteps.length && (
        <div
          ref={tooltipRef}
          className="fixed z-50 w-64 rounded-lg shadow-lg bg-card border"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <Card className="shadow-none border-0">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <LightbulbIcon className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-medium">
                    {propertyTutorialSteps[currentStep].title}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={skipTutorial}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              <CardDescription className="text-xs mt-0">
                Step {currentStep + 1} of {propertyTutorialSteps.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-2 text-sm">
              {propertyTutorialSteps[currentStep].description}
            </CardContent>
            <CardFooter className="px-4 py-3 flex justify-between">
              {currentStep > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={prevStep}
                >
                  <ChevronLeft className="h-3 w-3 mr-1" />
                  Back
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={skipTutorial}
                >
                  Skip
                </Button>
              )}
              
              <Button
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={nextStep}
              >
                {currentStep < propertyTutorialSteps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </>
                ) : (
                  "Got it!"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Reset tutorial button - only visible in development mode */}
      {process.env.NODE_ENV === 'development' && hasCompletedTutorial && (
        <Button
          variant="ghost"
          size="sm"
          className="opacity-40 hover:opacity-100"
          onClick={resetTutorial}
        >
          Reset Guided Tour (Dev Only)
        </Button>
      )}
    </>
  );
}