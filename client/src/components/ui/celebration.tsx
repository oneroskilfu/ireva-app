import React, { useState, useEffect } from "react";
import { 
  Award, 
  CheckCircle, 
  Medal, 
  PartyPopper, 
  Star, 
  Trophy 
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const celebrationVariants = cva(
  "fixed inset-0 flex items-center justify-center z-50 bg-black/50 animate-in fade-in duration-300",
  {
    variants: {
      variant: {
        default: "",
        confetti: "bg-gradient-to-br from-blue-500/20 to-purple-600/20",
        award: "bg-gradient-to-br from-yellow-500/20 to-amber-600/20",
        trophy: "bg-gradient-to-br from-emerald-500/20 to-green-600/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const contentVariants = cva(
  "bg-white dark:bg-gray-900 rounded-lg p-8 shadow-xl max-w-md text-center transform scale-in-center animate-in zoom-in-95 duration-300",
  {
    variants: {
      variant: {
        default: "border-primary/20 border-2",
        confetti: "border-blue-500/50 border-2",
        award: "border-yellow-500/50 border-2",
        trophy: "border-emerald-500/50 border-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconVariants = cva(
  "mx-auto mb-4 rounded-full p-3 text-white w-16 h-16",
  {
    variants: {
      variant: {
        default: "bg-primary",
        confetti: "bg-blue-500",
        award: "bg-yellow-500",
        trophy: "bg-emerald-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface CelebrationProps extends VariantProps<typeof celebrationVariants> {
  title: string;
  description: string;
  icon?: "trophy" | "confetti" | "award" | "medal" | "star" | "check";
  onClose: () => void;
  autoCloseDelay?: number;
  className?: string;
}

export function Celebration({
  title,
  description,
  icon = "confetti",
  onClose,
  variant,
  autoCloseDelay = 5000,
  className,
}: CelebrationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation to complete
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [autoCloseDelay, onClose]);

  if (!isVisible) {
    return null;
  }

  const renderIcon = () => {
    switch (icon) {
      case "trophy":
        return <Trophy className="w-10 h-10" />;
      case "award":
        return <Award className="w-10 h-10" />;
      case "medal":
        return <Medal className="w-10 h-10" />;
      case "star":
        return <Star className="w-10 h-10" />;
      case "check":
        return <CheckCircle className="w-10 h-10" />;
      case "confetti":
      default:
        return <PartyPopper className="w-10 h-10" />;
    }
  };

  return (
    <div
      className={cn(
        celebrationVariants({ variant }),
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
      onClick={onClose}
    >
      <div 
        className={cn(contentVariants({ variant }))}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn(iconVariants({ variant }))}>
          {renderIcon()}
        </div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
        <button
          onClick={onClose}
          className="bg-primary hover:bg-primary/90 text-white py-2 px-6 rounded-full font-medium transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export function useConfetti() {
  const [confetti, setConfetti] = useState<{
    show: boolean;
    title: string;
    description: string;
    variant?: "default" | "confetti" | "award" | "trophy";
    icon?: "trophy" | "confetti" | "award" | "medal" | "star" | "check";
  }>({
    show: false,
    title: "",
    description: "",
  });

  const showConfetti = (
    title: string,
    description: string,
    options?: {
      variant?: "default" | "confetti" | "award" | "trophy";
      icon?: "trophy" | "confetti" | "award" | "medal" | "star" | "check";
      autoCloseDelay?: number;
    }
  ) => {
    setConfetti({
      show: true,
      title,
      description,
      variant: options?.variant,
      icon: options?.icon,
    });
  };

  const hideConfetti = () => {
    setConfetti((prev) => ({ ...prev, show: false }));
  };

  return {
    showConfetti,
    hideConfetti,
    Confetti: confetti.show ? (
      <Celebration
        title={confetti.title}
        description={confetti.description}
        onClose={hideConfetti}
        variant={confetti.variant}
        icon={confetti.icon}
      />
    ) : null,
  };
}