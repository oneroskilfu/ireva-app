import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Award, 
  TrendingUp, 
  Home, 
  Target, 
  Star,
  Search,
  DollarSign,
  Share2,
  Clock,
  Lock,
  ChevronRight,
  Medal,
  Users,
  Building,
  Building2 as BuildingSkyscraper
} from "lucide-react";

// Define badge categories
const badgeCategories = [
  { id: "investor", name: "Investor" },
  { id: "properties", name: "Properties" },
  { id: "social", name: "Social" },
  { id: "special", name: "Special" }
];

// Define badges with their unlock conditions
const badges = [
  {
    id: "rookie-investor",
    name: "Rookie Investor",
    description: "Make your first investment",
    category: "investor",
    icon: <DollarSign />,
    level: 1,
    levelMax: 1,
    progress: 100,
    unlocked: true,
    unlockedDate: "2025-03-05"
  },
  {
    id: "serial-investor",
    name: "Serial Investor",
    description: "Make at least 5 investments",
    category: "investor",
    icon: <TrendingUp />,
    level: 2,
    levelMax: 3,
    progress: 60,
    unlocked: true,
    unlockedDate: "2025-03-15"
  },
  {
    id: "diversified-portfolio",
    name: "Diversified Portfolio",
    description: "Invest in 3 different property types",
    category: "investor",
    icon: <Award />,
    level: 1,
    levelMax: 3,
    progress: 33,
    unlocked: true,
    unlockedDate: "2025-03-20"
  },
  {
    id: "big-spender",
    name: "Big Spender",
    description: "Invest over $10,000 in a single property",
    category: "investor",
    icon: <Trophy />,
    level: 0,
    levelMax: 1,
    progress: 65,
    unlocked: false
  },
  {
    id: "long-term-vision",
    name: "Long-Term Vision",
    description: "Make an investment with a 5+ year term",
    category: "investor",
    icon: <Target />,
    level: 0,
    levelMax: 1,
    progress: 0,
    unlocked: false
  },
  {
    id: "property-hunter",
    name: "Property Hunter",
    description: "Browse at least 20 properties",
    category: "properties",
    icon: <Search />,
    level: 1,
    levelMax: 1,
    progress: 100,
    unlocked: true,
    unlockedDate: "2025-03-02"
  },
  {
    id: "residential-expert",
    name: "Residential Expert",
    description: "Invest in 3 residential properties",
    category: "properties",
    icon: <Home />,
    level: 1,
    levelMax: 3,
    progress: 33,
    unlocked: true,
    unlockedDate: "2025-03-10"
  },
  {
    id: "commercial-enthusiast",
    name: "Commercial Enthusiast",
    description: "Invest in a commercial property",
    category: "properties",
    icon: <Building />,
    level: 0,
    levelMax: 3,
    progress: 0,
    unlocked: false
  },
  {
    id: "skyscraper-dreamer",
    name: "Skyscraper Dreamer",
    description: "Invest in a high-rise building project",
    category: "properties",
    icon: <BuildingSkyscraper />,
    level: 0,
    levelMax: 1,
    progress: 0,
    unlocked: false
  },
  {
    id: "community-evangelist",
    name: "Community Evangelist",
    description: "Refer 3 friends who sign up",
    category: "social",
    icon: <Share2 />,
    level: 1,
    levelMax: 3,
    progress: 33,
    unlocked: true,
    unlockedDate: "2025-03-18"
  },
  {
    id: "networking-pro",
    name: "Networking Pro",
    description: "Refer a friend who makes an investment",
    category: "social",
    icon: <Users />,
    level: 1,
    levelMax: 3,
    progress: 33,
    unlocked: true,
    unlockedDate: "2025-03-25"
  },
  {
    id: "early-adopter",
    name: "Early Adopter",
    description: "Join during the platform's first year",
    category: "special",
    icon: <Star />,
    level: 1,
    levelMax: 1,
    progress: 100,
    unlocked: true,
    unlockedDate: "2025-01-10"
  },
  {
    id: "loyal-investor",
    name: "Loyal Investor",
    description: "Maintain active investments for 6 months",
    category: "special",
    icon: <Clock />,
    level: 1,
    levelMax: 3,
    progress: 33,
    unlocked: true, 
    unlockedDate: "2025-04-01"
  }
];

export function AchievementBadges() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("investor");
  
  const filteredBadges = badges.filter(badge => badge.category === selectedCategory);
  const unlockedBadges = badges.filter(badge => badge.unlocked);
  const totalLevel = badges.reduce((sum, badge) => sum + badge.level, 0);
  const maxLevel = badges.reduce((sum, badge) => sum + badge.levelMax, 0);
  const progressPercentage = (totalLevel / maxLevel) * 100;
  
  // Calculate ranks based on total level
  let rank = "Novice";
  if (totalLevel >= 15) rank = "Master Investor";
  else if (totalLevel >= 10) rank = "Expert Investor";
  else if (totalLevel >= 7) rank = "Skilled Investor";
  else if (totalLevel >= 4) rank = "Intermediate Investor";
  else if (totalLevel >= 1) rank = "Beginner Investor";
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Your Achievements</CardTitle>
            <CardDescription>Track your investment journey and unlock badges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-6">
              <div className="mr-4 bg-primary/10 p-4 rounded-full">
                <Medal className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <div>
                    <span className="text-lg font-medium">{rank}</span>
                    <span className="text-sm text-gray-500 ml-2">Level {totalLevel}/{maxLevel}</span>
                  </div>
                  <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Recently Unlocked</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {unlockedBadges.slice(0, 4).map(badge => (
                  <div 
                    key={badge.id} 
                    className="flex flex-col items-center text-center p-3 bg-background border rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer"
                  >
                    <div className="p-3 bg-primary/10 rounded-full mb-2">
                      <div className="h-6 w-6 text-primary">{badge.icon}</div>
                    </div>
                    <h4 className="text-sm font-medium">{badge.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">Level {badge.level}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">All Badges</h3>
                <Tabs 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory} 
                  className="w-full max-w-md"
                >
                  <TabsList className="grid grid-cols-4">
                    {badgeCategories.map(category => (
                      <TabsTrigger key={category.id} value={category.id}>{category.name}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredBadges.map(badge => (
                  <div 
                    key={badge.id} 
                    className={`flex items-start p-4 border rounded-lg ${
                      badge.unlocked ? "bg-background" : "bg-gray-50/50"
                    }`}
                  >
                    <div className={`p-2 rounded-full mr-3 ${
                      badge.unlocked ? "bg-primary/10" : "bg-gray-100"
                    }`}>
                      <div className={`h-5 w-5 ${
                        badge.unlocked ? "text-primary" : "text-gray-400"
                      }`}>
                        {badge.unlocked ? badge.icon : <Lock />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className={`text-sm font-medium ${!badge.unlocked && "text-gray-500"}`}>
                          {badge.name}
                        </h4>
                        {badge.level > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-md">
                            Lvl {badge.level}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                      
                      {badge.unlocked ? (
                        <p className="text-xs text-gray-500 mt-2">
                          {badge.level < badge.levelMax ? (
                            <>
                              <span className="font-medium">Next level:</span> {Math.round(badge.progress)}% progress
                              <Progress value={badge.progress} className="h-1.5 mt-1" />
                            </>
                          ) : (
                            <>
                              <span className="font-medium">Unlocked:</span> {badge.unlockedDate ? new Date(badge.unlockedDate).toLocaleDateString() : 'Recently'}
                            </>
                          )}
                        </p>
                      ) : (
                        <>
                          <p className="text-xs text-gray-500 mt-2">
                            <span className="font-medium">Progress:</span> {Math.round(badge.progress)}%
                          </p>
                          <Progress value={badge.progress} className="h-1.5 mt-1" />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Top investors this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-primary/10 rounded-lg">
                <div className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full mr-3">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {user?.username || "You"} 
                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-primary/20 rounded text-primary">8 badges</span>
                  </p>
                  <p className="text-xs text-gray-500">Expert Investor</p>
                </div>
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              
              <div className="flex items-center p-3 border rounded-lg">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full mr-3">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    James Wilson
                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 rounded">7 badges</span>
                  </p>
                  <p className="text-xs text-gray-500">Skilled Investor</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 border rounded-lg">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full mr-3">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    Emma Davis
                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 rounded">6 badges</span>
                  </p>
                  <p className="text-xs text-gray-500">Skilled Investor</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 border rounded-lg">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full mr-3">
                  4
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    Michael Lee
                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 rounded">5 badges</span>
                  </p>
                  <p className="text-xs text-gray-500">Intermediate Investor</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 border rounded-lg">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full mr-3">
                  5
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    Sarah Chen
                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 rounded">4 badges</span>
                  </p>
                  <p className="text-xs text-gray-500">Intermediate Investor</p>
                </div>
              </div>
            </div>
            
            <Button variant="link" className="w-full mt-4">
              View Full Leaderboard
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}