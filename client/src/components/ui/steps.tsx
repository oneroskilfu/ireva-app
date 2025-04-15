import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface StepsContextValue {
  activeStep: number;
  orientation: "vertical" | "horizontal";
}

const StepsContext = createContext<StepsContextValue | null>(null);

export function Steps({
  activeStep,
  orientation = "horizontal",
  className,
  children,
}: {
  activeStep: number;
  orientation?: "vertical" | "horizontal";
  className?: string;
  children: ReactNode;
}) {
  return (
    <StepsContext.Provider value={{ activeStep, orientation }}>
      <div
        className={cn(
          "flex gap-4",
          orientation === "vertical" ? "flex-col" : "",
          className
        )}
      >
        {children}
      </div>
    </StepsContext.Provider>
  );
}

export function StepIndicator({
  step,
  className,
  children,
}: {
  step: number;
  className?: string;
  children?: ReactNode;
}) {
  const context = useContext(StepsContext);
  if (!context) {
    throw new Error("StepIndicator must be used within a Steps component");
  }

  const { activeStep } = context;
  const isCompleted = activeStep > step;
  const isActive = activeStep === step;

  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium",
        isCompleted
          ? "border-primary bg-primary text-primary-foreground"
          : isActive
          ? "border-primary text-primary"
          : "border-muted-foreground text-muted-foreground",
        className
      )}
    >
      {isCompleted ? (
        <CheckIcon className="h-4 w-4" />
      ) : children ? (
        children
      ) : (
        step + 1
      )}
    </div>
  );
}

export function StepSeparator({
  className,
}: {
  className?: string;
}) {
  const context = useContext(StepsContext);
  if (!context) {
    throw new Error("StepSeparator must be used within a Steps component");
  }

  const { orientation } = context;
  
  return (
    <div
      className={cn(
        "flex-1 bg-border",
        orientation === "vertical" ? "w-0.5 min-h-[1rem]" : "h-0.5 min-w-[1rem]",
        className
      )}
    ></div>
  );
}

export function StepStatus({
  step,
  complete,
  incomplete,
  active,
}: {
  step: number;
  complete: ReactNode;
  incomplete: ReactNode;
  active: ReactNode;
}) {
  const context = useContext(StepsContext);
  if (!context) {
    throw new Error("StepStatus must be used within a Steps component");
  }

  const { activeStep } = context;
  const isCompleted = activeStep > step;
  const isActive = activeStep === step;

  if (isCompleted) {
    return <>{complete}</>;
  }
  
  if (isActive) {
    return <>{active}</>;
  }
  
  return <>{incomplete}</>;
}

export function StepTitle({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("font-semibold", className)}>
      {children}
    </div>
  );
}

export function StepDescription({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </div>
  );
}

export function StepNumber() {
  const context = useContext(StepsContext);
  if (!context) {
    throw new Error("StepNumber must be used within a Steps component");
  }
  
  return context.activeStep + 1;
}

export function useSteps() {
  const context = useContext(StepsContext);
  if (!context) {
    throw new Error("useSteps must be used within a Steps component");
  }
  
  return context;
}