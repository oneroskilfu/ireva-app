import { useState } from "react";
import { InvestorLeaderboard } from "@/components/gamification/InvestorLeaderboard";
import { AchievementsDisplay } from "@/components/gamification/AchievementsDisplay";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy, Award, Medal } from "lucide-react";

export function AchievementsSection() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"achievements" | "leaderboard">("achievements");
  
  return (
    <Card className="col-span-1 lg:col-span-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex gap-2 items-center">
              <Trophy className="h-5 w-5 text-primary" />
              <span>Achievements & Rankings</span>
            </CardTitle>
            <CardDescription>
              Track your achievements and see how you rank compared to other investors.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <Tabs defaultValue="achievements" onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="achievements" className="text-xs">
              <Award className="h-3.5 w-3.5 mr-1.5" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-xs">
              <Medal className="h-3.5 w-3.5 mr-1.5" />
              Leaderboard
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="achievements">
            <AchievementsDisplay userId={user?.id} />
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <InvestorLeaderboard limit={5} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}