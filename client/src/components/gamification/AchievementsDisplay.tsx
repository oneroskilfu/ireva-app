import { useState } from "react";
import { AchievementBadge, BadgeType } from "./AchievementBadge";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Medal, ChevronRight } from "lucide-react";

// Interface for achievement data storage
interface UserAchievements {
  unlockedBadges: BadgeType[];
  progress: Record<string, number>;
  lastUnlocked?: BadgeType;
  totalPointsEarned: number;
}

// Points awarded by badge rarity
const BADGE_POINTS = {
  common: 10,
  uncommon: 25,
  rare: 50,
  epic: 100,
  legendary: 200
};

interface AchievementsDisplayProps {
  userId?: number; // Optional: If we have a logged-in user
  compact?: boolean; // Whether to show a compact display or full modal
  className?: string;
}

export function AchievementsDisplay({
  userId,
  compact = false,
  className
}: AchievementsDisplayProps) {
  // Default achievement data - in a real app this would come from API
  const defaultAchievements: UserAchievements = {
    unlockedBadges: ['property_viewed', 'tutorial_completed'],
    progress: {},
    totalPointsEarned: 20 // 10 points each for common badges
  };
  
  const [achievementsVisible, setAchievementsVisible] = useState(false);
  const [userAchievements, setUserAchievements] = useLocalStorage<UserAchievements>(
    `reva_achievements_${userId || 'guest'}`,
    defaultAchievements
  );
  
  // All available badges
  const allBadges: BadgeType[] = [
    'property_viewed',
    'first_investment',
    'investment_streak',
    'diversified_portfolio',
    'knowledge_master',
    'top_investor',
    'early_adopter',
    'community_contributor',
    'tutorial_completed'
  ];
  
  // Function to unlock a new badge
  const unlockBadge = (badgeType: BadgeType) => {
    if (!userAchievements.unlockedBadges.includes(badgeType)) {
      setUserAchievements({
        ...userAchievements,
        unlockedBadges: [...userAchievements.unlockedBadges, badgeType],
        lastUnlocked: badgeType,
        totalPointsEarned: userAchievements.totalPointsEarned + 10 // Simplified points calculation
      });
    }
  };
  
  // Add progress towards an achievement
  const addProgress = (achievementKey: string, amount: number = 1) => {
    const currentProgress = userAchievements.progress[achievementKey] || 0;
    setUserAchievements({
      ...userAchievements,
      progress: {
        ...userAchievements.progress,
        [achievementKey]: currentProgress + amount
      }
    });
  };
  
  if (compact) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1.5"
          >
            <Medal className="h-4 w-4" />
            <span className="mr-1">{userAchievements.unlockedBadges.length}</span>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Achievements</DialogTitle>
            <DialogDescription>
              You've earned {userAchievements.totalPointsEarned} points from {userAchievements.unlockedBadges.length} achievements.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Unlocked Achievements</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {userAchievements.unlockedBadges.map(badge => (
                    <div key={badge} className="flex flex-col items-center">
                      <AchievementBadge type={badge} unlocked={true} />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">Locked Achievements</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {allBadges
                    .filter(badge => !userAchievements.unlockedBadges.includes(badge))
                    .map(badge => (
                      <div key={badge} className="flex flex-col items-center">
                        <AchievementBadge type={badge} unlocked={false} />
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-4">Achievements</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {allBadges.map(badge => (
          <div key={badge} className="flex flex-col items-center">
            <AchievementBadge 
              type={badge} 
              unlocked={userAchievements.unlockedBadges.includes(badge)} 
              size="md"
            />
            <span className="text-xs mt-2">{badge.replace(/_/g, ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}