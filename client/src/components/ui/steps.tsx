import { createContext, useContext, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StepsContextValue {
  activeStep: number;
  orientation: "vertical" | "horizontal";
}

const StepsContext = createContext<StepsContextValue>({
  activeStep: 0,
  orientation: "horizontal",
});

export function Steps({
  activeStep = 0,
  orientation = "horizontal",
  children,
  className,
  ...props
}: {
  activeStep?: number;
  orientation?: "vertical" | "horizontal";
  children: ReactNode;
  className?: string;
}) {
  return (
    <StepsContext.Provider value={{ activeStep, orientation }}>
      <div
        className={cn(
          "flex",
          orientation === "vertical" ? "flex-col space-y-4" : "space-x-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </StepsContext.Provider>
  );
}

export function StepIndicator({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { orientation } = useContext(StepsContext);
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full w-8 h-8 bg-primary/20 border border-primary/30",
        orientation === "vertical" ? "z-10" : "",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StepSeparator({
  className,
  ...props
}: {
  className?: string;
}) {
  const { orientation } = useContext(StepsContext);
  return (
    <div
      className={cn(
        "flex-1 bg-muted",
        orientation === "vertical"
          ? "w-px h-8 ml-4 -my-3"
          : "h-px w-full",
        className
      )}
      {...props}
    />
  );
}

export function StepStatus({
  complete,
  incomplete,
  active,
}: {
  complete: ReactNode;
  incomplete: ReactNode;
  active: ReactNode;
}) {
  const { activeStep } = useContext(StepsContext);
  const stepIndex = Array.from(
    document.querySelectorAll("[data-step]")
  ).indexOf(document.activeElement as HTMLElement);

  if (stepIndex !== -1 && stepIndex < activeStep) {
    return <>{complete}</>;
  }

  if (stepIndex === activeStep) {
    return <>{active}</>;
  }

  return <>{incomplete}</>;
}

export function StepTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-base font-medium", className)}>
      {children}
    </p>
  );
}

export function StepDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}

export function StepNumber() {
  const stepIndex = Array.from(
    document.querySelectorAll("[data-step]")
  ).indexOf(document.activeElement as HTMLElement);
  return <span>{stepIndex + 1}</span>;
}