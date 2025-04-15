import React, { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

interface StepsContextValue {
  activeStep: number;
}

const StepsContext = createContext<StepsContextValue | undefined>(undefined);

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep: number;
  children: React.ReactNode;
}

export function Steps({ activeStep, children, className, ...props }: StepsProps) {
  return (
    <StepsContext.Provider value={{ activeStep }}>
      <div className={cn("space-y-4", className)} {...props}>
        {children}
      </div>
    </StepsContext.Provider>
  );
}

function useStepsContext() {
  const context = useContext(StepsContext);
  if (!context) {
    throw new Error("Steps components must be used within a Steps component");
  }
  return context;
}

interface StepIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  children: React.ReactNode;
}

export function StepIndicator({ step, children, className, ...props }: StepIndicatorProps) {
  const { activeStep } = useStepsContext();
  const isActive = step === activeStep;
  const isCompleted = step < activeStep;

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border-2",
        isActive 
          ? "border-primary bg-primary/10 text-primary font-semibold" 
          : isCompleted 
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function StepSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("h-0.5 w-full bg-muted-foreground/30 my-3", className)}
      {...props}
    />
  );
}

interface StepTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function StepTitle({ children, className, ...props }: StepTitleProps) {
  return (
    <h3
      className={cn("text-sm font-medium", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

interface StepDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function StepDescription({ children, className, ...props }: StepDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}