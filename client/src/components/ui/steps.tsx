import React, { createContext, useContext } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepsContextValue {
  activeStep: number;
  totalSteps: number;
}

const StepsContext = createContext<StepsContextValue | null>(null);

export interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number;
  children: React.ReactNode;
}

export interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  stepNumber?: number;
}

export function Steps({ currentStep, children, className, ...props }: StepsProps) {
  const childrenArray = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Step
  ) as React.ReactElement[];

  const totalSteps = childrenArray.length;

  return (
    <StepsContext.Provider value={{ activeStep: currentStep, totalSteps }}>
      <div className={cn("space-y-6", className)} {...props}>
        <div className="relative">
          <div className="relative flex items-center justify-between">
            {childrenArray.map((child, index) => {
              return React.cloneElement(child, {
                ...child.props,
                stepNumber: index + 1,
                key: index,
              });
            })}
          </div>
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
            <div
              className="absolute top-0 left-0 h-0.5 bg-primary transition-all duration-500 ease-in-out"
              style={{
                width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </StepsContext.Provider>
  );
}

export function Step({ title, description, stepNumber, className, ...props }: StepProps) {
  const context = useContext(StepsContext);

  if (!context) {
    throw new Error('Step must be used within a Steps component');
  }

  const { activeStep } = context;
  
  // Calculate status based on active step 
  const status = 
    stepNumber && activeStep > stepNumber 
      ? "complete" 
      : stepNumber === activeStep 
        ? "active" 
        : "inactive";

  return (
    <div
      className={cn("z-10 flex-1 text-center flex flex-col items-center", className)}
      {...props}
    >
      <div 
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-full relative",
          status === "complete" ? "bg-primary text-primary-foreground" : 
          status === "active" ? "bg-primary text-primary-foreground" :
          "bg-muted text-muted-foreground"
        )}
      >
        {status === "complete" ? (
          <Check className="h-5 w-5" />
        ) : (
          <span>{stepNumber}</span>
        )}
      </div>
      <div className="mt-2 space-y-1">
        <div 
          className={cn(
            "text-sm font-medium",
            status === "inactive" ? "text-muted-foreground" : ""
          )}
        >
          {title}
        </div>
        {description && (
          <div 
            className={cn(
              "text-xs",
              status === "inactive" ? "text-muted-foreground/70" : "text-muted-foreground"
            )}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
}