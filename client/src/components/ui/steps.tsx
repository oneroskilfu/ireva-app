import React, { createContext, useContext } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepsContextValue {
  activeStep: number;
  totalSteps: number;
}

const StepsContext = createContext<StepsContextValue | null>(null);

export interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep: number;
  children: React.ReactNode;
}

export interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  stepNumber?: number;
}

// Additional components needed for the verification page
export interface StepIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  children?: React.ReactNode;
}

export interface StepTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export interface StepDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function Steps({ activeStep, children, className, ...props }: StepsProps) {
  return (
    <StepsContext.Provider value={{ activeStep, totalSteps: React.Children.count(children) }}>
      <div className={cn("space-y-6", className)} {...props}>
        <div className="flex items-center w-full">
          {children}
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

// Additional components needed for the verification page
export function StepIndicator({ step, children, className, ...props }: StepIndicatorProps) {
  const context = useContext(StepsContext);
  const isActive = context && step === context.activeStep;
  const isCompleted = context && step < context.activeStep;

  return (
    <div
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-full relative",
        isCompleted ? "bg-primary text-primary-foreground" : 
        isActive ? "border-2 border-primary text-primary" :
        "border-2 border-muted-foreground text-muted-foreground",
        className
      )}
      {...props}
    >
      {isCompleted ? (
        <Check className="h-5 w-5" />
      ) : (
        children
      )}
    </div>
  );
}

export function StepTitle({ children, className, ...props }: StepTitleProps) {
  return (
    <p className={cn("text-sm font-medium", className)} {...props}>
      {children}
    </p>
  );
}

export function StepDescription({ children, className, ...props }: StepDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function StepSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("flex-1 h-[2px] bg-muted mx-2", className)} 
      {...props}
    />
  );
}