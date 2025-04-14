import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Info, 
  Sparkles, 
  Banknote, 
  Building2, 
  LineChart, 
  Calculator, 
  Shield,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  highlights?: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to REVA",
    description: "REVA makes real estate investing accessible to everyone in Nigeria. Learn how to get started with your first property investment.",
    icon: <Sparkles className="h-5 w-5" />,
    highlights: [
      "Invest with as little as ₦100,000",
      "Browse verified properties across Nigeria",
      "Track your investments in real-time",
      "Earn passive income through property returns"
    ]
  },
  {
    id: 2,
    title: "Understanding Property Listings",
    description: "Each property on REVA has key information to help you make informed investment decisions.",
    icon: <Building2 className="h-5 w-5" />,
    highlights: [
      "Property type and location details",
      "Target return percentage",
      "Investment term length",
      "Minimum investment amount",
      "Current funding progress"
    ]
  },
  {
    id: 3,
    title: "Analyzing Returns",
    description: "Learn how to analyze the potential returns from your property investment.",
    icon: <LineChart className="h-5 w-5" />,
    highlights: [
      "Target return: annual percentage return on your investment",
      "Projected cash flow: expected monthly income",
      "Capital appreciation: potential increase in property value",
      "Total ROI: overall return including all income sources"
    ]
  },
  {
    id: 4,
    title: "Making Your Investment",
    description: "Steps to complete your property investment on REVA.",
    icon: <Banknote className="h-5 w-5" />,
    highlights: [
      "Select a property and click 'Invest Now'",
      "Enter your investment amount (min. ₦100,000)",
      "Review investment details",
      "Complete payment through Paystack",
      "Receive confirmation of your investment"
    ]
  },
  {
    id: 5,
    title: "Understanding Risk Assessment",
    description: "Every property on REVA has a risk rating to help you make investment decisions aligned with your risk tolerance.",
    icon: <Shield className="h-5 w-5" />,
    highlights: [
      "Low risk: Conservative investments with steady returns",
      "Medium risk: Balanced investments with moderate growth potential",
      "High risk: Growth-focused investments with higher potential returns",
      "Risk factors include location, property condition, market trends, and tenant demand"
    ]
  },
  {
    id: 6,
    title: "Managing Your Investments",
    description: "Track and manage your property investments through your personalized dashboard.",
    icon: <Calculator className="h-5 w-5" />,
    highlights: [
      "View all active investments and their current values",
      "Track earnings and distributions",
      "Monitor property performance metrics",
      "Access important property documents",
      "Set up reinvestment options"
    ]
  },
  {
    id: 7,
    title: "Investment Timeline",
    description: "Understanding the typical timeline for your property investment.",
    icon: <Clock className="h-5 w-5" />,
    highlights: [
      "Investment term: usually 3-5 years for most properties",
      "Earning distributions: typically quarterly payments",
      "Property updates: monthly progress reports",
      "Exit options: hold until maturity or sell on secondary market",
      "Reinvestment opportunities at term completion"
    ]
  }
];

interface InvestmentTutorialWizardProps {
  autoOpen?: boolean;
  onComplete?: () => void;
}

export function InvestmentTutorialWizard({ 
  autoOpen = false,
  onComplete
}: InvestmentTutorialWizardProps) {
  const [open, setOpen] = useState(autoOpen);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useLocalStorage("reva-tutorial-completed", false);
  
  useEffect(() => {
    // If user hasn't completed tutorial and autoOpen is true, open the wizard
    if (!hasCompletedTutorial && autoOpen) {
      setOpen(true);
    }
  }, [hasCompletedTutorial, autoOpen]);
  
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const completeTutorial = () => {
    setHasCompletedTutorial(true);
    setOpen(false);
    if (onComplete) {
      onComplete();
    }
  };
  
  const skipTutorial = () => {
    setHasCompletedTutorial(true);
    setOpen(false);
  };
  
  const resetTutorial = () => {
    setHasCompletedTutorial(false);
    setCurrentStep(0);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              setCurrentStep(0);
              setOpen(true);
            }}
          >
            <Info className="h-4 w-4" />
            <span>Investment Tutorial</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {tutorialSteps[currentStep].icon}
              <DialogTitle>{tutorialSteps[currentStep].title}</DialogTitle>
            </div>
            <DialogDescription>
              {tutorialSteps[currentStep].description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {tutorialSteps[currentStep].image && (
              <div className="relative w-full h-40 sm:h-52 mb-4 rounded-md overflow-hidden">
                <img 
                  src={tutorialSteps[currentStep].image} 
                  alt={tutorialSteps[currentStep].title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {tutorialSteps[currentStep].highlights && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Key Points:</h4>
                <ul className="space-y-1.5">
                  {tutorialSteps[currentStep].highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      </div>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-1">
              {tutorialSteps.map((_, index) => (
                <div 
                  key={index}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === currentStep 
                      ? "w-6 bg-primary" 
                      : "w-1.5 bg-muted"
                  )}
                />
              ))}
            </div>
            
            <span className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
          </div>
          
          <DialogFooter className="flex sm:justify-between gap-2">
            <div className="flex gap-2 flex-1 justify-start">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={skipTutorial}
                >
                  Skip Tutorial
                </Button>
              )}
            </div>
            
            <Button
              type="button"
              size="sm"
              onClick={nextStep}
              className="gap-1"
            >
              {currentStep < tutorialSteps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                "Complete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reset tutorial button - for testing purposes only */}
      {process.env.NODE_ENV === "development" && hasCompletedTutorial && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetTutorial}
          className="mt-4 opacity-50 hover:opacity-100"
        >
          Reset Tutorial (Dev Only)
        </Button>
      )}
    </>
  );
}