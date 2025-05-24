import React from "react"
import { cn } from "@/lib/utils"

interface StepsProps {
  activeStep: number
  children: React.ReactNode
  className?: string
}

interface StepProps {
  title: string
  description?: string
}

export const Steps = ({ activeStep, children, className }: StepsProps) => {
  // Convert children to array to enable mapping
  const stepsArray = React.Children.toArray(children)
  const totalSteps = stepsArray.length

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center">
        {stepsArray.map((step, index) => {
          const isActive = index + 1 <= activeStep
          const isLast = index === totalSteps - 1

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center relative">
                <StepIndicator isActive={isActive} stepNumber={index + 1} />
                <div className="mt-2 text-center">
                  <StepTitle isActive={isActive}>{(step as React.ReactElement<StepProps>).props.title}</StepTitle>
                  {(step as React.ReactElement<StepProps>).props.description && (
                    <StepDescription>{(step as React.ReactElement<StepProps>).props.description}</StepDescription>
                  )}
                </div>
              </div>
              {!isLast && (
                <StepSeparator isActive={index + 1 < activeStep} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export const StepIndicator = ({ 
  isActive, 
  stepNumber 
}: { 
  isActive: boolean 
  stepNumber: number 
}) => {
  return (
    <div 
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-muted-foreground"
      )}
    >
      {stepNumber}
    </div>
  )
}

export const StepSeparator = ({ isActive }: { isActive: boolean }) => {
  return (
    <div 
      className={cn(
        "flex-1 h-[2px] mx-2 transition-colors min-w-[3rem]",
        isActive ? "bg-primary" : "bg-muted"
      )}
    />
  )
}

export const StepTitle = ({ 
  children, 
  isActive 
}: { 
  children: React.ReactNode
  isActive: boolean
}) => {
  return (
    <p 
      className={cn(
        "text-sm font-medium",
        isActive ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {children}
    </p>
  )
}

export const StepDescription = ({ children }: { children: React.ReactNode }) => {
  return (
    <p className="text-xs text-muted-foreground max-w-[8rem]">
      {children}
    </p>
  )
}

export const Step = ({ title, description }: StepProps) => {
  return null // This component is just for typing, its children are rendered by the Steps component
}