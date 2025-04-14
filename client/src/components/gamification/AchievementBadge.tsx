import React from 'react';
import { BadgeCheck, Trophy, Award, Star, Zap, TrendingUp } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

// Types of badges that can be awarded
export type BadgeType = 
  | 'property_viewed'
  | 'first_investment'
  | 'investment_streak'
  | 'diversified_portfolio'
  | 'knowledge_master'
  | 'top_investor'
  | 'early_adopter'
  | 'community_contributor'
  | 'tutorial_completed';

// Badge metadata
const BADGE_CONFIG: Record<BadgeType, {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}> = {
  property_viewed: {
    name: 'Property Explorer',
    description: 'Viewed your first property details',
    icon: <BadgeCheck />,
    color: 'bg-blue-500',
    rarity: 'common'
  },
  first_investment: {
    name: 'First Timer',
    description: 'Made your first property investment',
    icon: <Star />,
    color: 'bg-green-500',
    rarity: 'common'
  },
  investment_streak: {
    name: 'Consistent Investor',
    description: 'Invested in properties for 3 consecutive months',
    icon: <TrendingUp />,
    color: 'bg-purple-500',
    rarity: 'uncommon'
  },
  diversified_portfolio: {
    name: 'Diversification Pro',
    description: 'Invested in 3+ different property types',
    icon: <Award />,
    color: 'bg-indigo-500',
    rarity: 'rare'
  },
  knowledge_master: {
    name: 'Knowledge Master',
    description: 'Completed all investment tutorials',
    icon: <BadgeCheck />,
    color: 'bg-amber-500',
    rarity: 'uncommon'
  },
  top_investor: {
    name: 'Top Investor',
    description: 'Among the top 10% of investors by portfolio value',
    icon: <Trophy />,
    color: 'bg-yellow-500',
    rarity: 'epic'
  },
  early_adopter: {
    name: 'Early Adopter',
    description: 'Joined REVA in its first 90 days',
    icon: <Zap />,
    color: 'bg-teal-500',
    rarity: 'rare'
  },
  community_contributor: {
    name: 'Community Leader',
    description: 'Made 10+ posts or comments in the community',
    icon: <Award />,
    color: 'bg-pink-500',
    rarity: 'uncommon'
  },
  tutorial_completed: {
    name: 'Educated Investor',
    description: 'Completed the investment tutorial wizard',
    icon: <BadgeCheck />,
    color: 'bg-sky-500',
    rarity: 'common'
  }
};

// Rarity colors for the badge border
const RARITY_COLORS = {
  common: 'border-gray-300',
  uncommon: 'border-emerald-400',
  rare: 'border-violet-500',
  epic: 'border-amber-500',
  legendary: 'border-red-500'
};

interface AchievementBadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  unlocked?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function AchievementBadge({
  type,
  size = 'md',
  unlocked = true,
  showTooltip = true,
  className
}: AchievementBadgeProps) {
  const badge = BADGE_CONFIG[type];
  const rarityBorder = RARITY_COLORS[badge.rarity];
  
  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  // Icon size
  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  const badgeContent = (
    <div 
      className={cn(
        'rounded-full flex items-center justify-center border-2',
        sizeClasses[size],
        unlocked ? badge.color : 'bg-gray-200',
        unlocked ? rarityBorder : 'border-gray-300',
        unlocked ? 'text-white' : 'text-gray-400',
        className
      )}
    >
      <div className={iconSize[size]}>
        {badge.icon}
      </div>
    </div>
  );
  
  if (!showTooltip) {
    return badgeContent;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <div className="text-center">
            <p className="font-semibold">{badge.name}</p>
            <p className="text-xs text-muted-foreground">{badge.description}</p>
            <p className="text-xs mt-1 capitalize">
              <span className={`
                ${badge.rarity === 'common' ? 'text-gray-500' : ''}
                ${badge.rarity === 'uncommon' ? 'text-emerald-500' : ''}
                ${badge.rarity === 'rare' ? 'text-violet-500' : ''}
                ${badge.rarity === 'epic' ? 'text-amber-500' : ''}
                ${badge.rarity === 'legendary' ? 'text-red-500' : ''}
              `}>
                {badge.rarity}
              </span>
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}