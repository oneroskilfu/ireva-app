import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TourButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  tooltipText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const TourButton: React.FC<TourButtonProps> = ({
  onClick,
  label = "Help",
  className = "",
  tooltipText = "Start guided tour",
  variant = "outline"
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={onClick} 
            variant={variant}
            size="sm"
            className={`flex items-center gap-1 ${className}`}
          >
            <HelpCircle className="h-4 w-4" />
            {label}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export { TourButton };