import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useOnboarding, OnboardingFlow } from '@/contexts/onboarding-context';

interface StartOnboardingButtonProps {
  flow: OnboardingFlow;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  showIcon?: boolean;
  children?: React.ReactNode;
}

export default function StartOnboardingButton({
  flow,
  className = '',
  variant = 'outline',
  size = 'sm',
  showIcon = true,
  children
}: StartOnboardingButtonProps) {
  const { startOnboarding } = useOnboarding();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => startOnboarding(flow)}
    >
      {showIcon && <HelpCircle className="w-4 h-4 mr-2" />}
      {children || 'Start Tour'}
    </Button>
  );
}