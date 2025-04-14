import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  ArrowUpRight,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

// Types for leaderboard data
interface LeaderboardEntry {
  userId: number;
  username: string;
  avatarUrl?: string;
  rank: number;
  score: number;
  change?: number; // Position change from last period (positive = improved)
  achievements?: number;
  investmentCount?: number;
  totalInvested?: number;
}

interface LeaderboardData {
  weekly: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
  userRank?: LeaderboardEntry; // Current user's ranking
}

interface InvestorLeaderboardProps {
  className?: string;
  limit?: number;
}

export function InvestorLeaderboard({ 
  className,
  limit = 10
}: InvestorLeaderboardProps) {
  const { user } = useAuth();
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"weekly" | "monthly" | "allTime">("weekly");
  
  // Sample leaderboard data - in a production app, this would come from an API
  const sampleLeaderboardData: LeaderboardData = {
    weekly: [
      { userId: 1, username: "JohnDoe", rank: 1, score: 12500, change: 2, achievements: 8, investmentCount: 5, totalInvested: 2500000 },
      { userId: 2, username: "AliceInvestor", rank: 2, score: 10800, change: 0, achievements: 12, investmentCount: 8, totalInvested: 1750000 },
      { userId: 3, username: "PropMaster", rank: 3, score: 9500, change: -1, achievements: 10, investmentCount: 4, totalInvested: 3000000 },
      { userId: 4, username: "RealEstateGuru", rank: 4, score: 8200, change: 3, achievements: 6, investmentCount: 6, totalInvested: 1200000 },
      { userId: 5, username: "InvestorPro", rank: 5, score: 7800, change: -3, achievements: 9, investmentCount: 3, totalInvested: 900000 }
    ],
    monthly: [
      { userId: 2, username: "AliceInvestor", rank: 1, score: 45800, change: 2, achievements: 12, investmentCount: 8, totalInvested: 1750000 },
      { userId: 1, username: "JohnDoe", rank: 2, score: 42500, change: -1, achievements: 8, investmentCount: 5, totalInvested: 2500000 },
      { userId: 3, username: "PropMaster", rank: 3, score: 38500, change: 0, achievements: 10, investmentCount: 4, totalInvested: 3000000 },
      { userId: 7, username: "PropertyMogul", rank: 4, score: 35200, change: 5, achievements: 11, investmentCount: 7, totalInvested: 2200000 },
      { userId: 4, username: "RealEstateGuru", rank: 5, score: 32200, change: -2, achievements: 6, investmentCount: 6, totalInvested: 1200000 }
    ],
    allTime: [
      { userId: 3, username: "PropMaster", rank: 1, score: 128500, change: 0, achievements: 10, investmentCount: 4, totalInvested: 3000000 },
      { userId: 1, username: "JohnDoe", rank: 2, score: 125200, change: 0, achievements: 8, investmentCount: 5, totalInvested: 2500000 },
      { userId: 7, username: "PropertyMogul", rank: 3, score: 120800, change: 1, achievements: 11, investmentCount: 7, totalInvested: 2200000 },
      { userId: 2, username: "AliceInvestor", rank: 4, score: 115400, change: -1, achievements: 12, investmentCount: 8, totalInvested: 1750000 },
      { userId: 4, username: "RealEstateGuru", rank: 5, score: 98700, change: 0, achievements: 6, investmentCount: 6, totalInvested: 1200000 }
    ],
    userRank: user ? { 
      userId: user.id, 
      username: user.username, 
      rank: 42, 
      score: 3200,
      change: 5,
      achievements: 3,
      investmentCount: 1,
      totalInvested: 250000
    } : undefined
  };
  
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>(sampleLeaderboardData);
  
  // In a real app, we would fetch leaderboard data here
  useEffect(() => {
    // This would be an API call in production
    // fetchLeaderboardData(leaderboardPeriod).then(data => setLeaderboardData(data));
  }, [leaderboardPeriod]);
  
  const currentLeaderboard = leaderboardData[leaderboardPeriod].slice(0, limit);
  
  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return `₦${(amount / 1000).toFixed(0)}K`;
  };
  
  // Get rank display with appropriate suffix
  const getRankDisplay = (rank: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const remainder = rank % 100;
    return rank + (suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0]);
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Investor Leaderboard</span>
            </CardTitle>
            <CardDescription>
              Top investors ranked by portfolio performance
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" onValueChange={(value) => setLeaderboardPeriod(value as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="weekly" className="text-xs">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Monthly
            </TabsTrigger>
            <TabsTrigger value="allTime" className="text-xs">
              <Trophy className="h-3.5 w-3.5 mr-1.5" />
              All Time
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Investor</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentLeaderboard.map((entry) => (
                  <TableRow key={entry.userId} className={entry.userId === user?.id ? "bg-primary/5" : ""}>
                    <TableCell className="font-medium">
                      {entry.rank <= 3 ? (
                        <span className={`
                          ${entry.rank === 1 ? "text-yellow-500" : ""}
                          ${entry.rank === 2 ? "text-gray-400" : ""}
                          ${entry.rank === 3 ? "text-amber-700" : ""}
                          font-bold
                        `}>
                          #{entry.rank}
                        </span>
                      ) : (
                        `#${entry.rank}`
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={entry.avatarUrl} />
                          <AvatarFallback>{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{entry.username}</span>
                        {entry.change && entry.change > 0 && (
                          <Badge variant="outline" className="text-xs py-0 h-4 text-green-600">
                            <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />
                            {entry.change}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {entry.score.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {leaderboardData.userRank && user && (
              <div className="border-t pt-3 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                      {leaderboardData.userRank.rank}
                    </Badge>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">You</span>
                    {leaderboardData.userRank.change && leaderboardData.userRank.change > 0 && (
                      <Badge variant="outline" className="text-xs py-0 h-4 text-green-600">
                        <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />
                        {leaderboardData.userRank.change}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right font-semibold">
                    {leaderboardData.userRank.score.toLocaleString()}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  You're in the top {Math.floor((leaderboardData.userRank.rank / 100) * 100)}% of investors this week
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="monthly">
            {/* Similar table structure as weekly */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Investor</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.monthly.slice(0, limit).map((entry) => (
                  <TableRow key={entry.userId} className={entry.userId === user?.id ? "bg-primary/5" : ""}>
                    <TableCell className="font-medium">
                      {entry.rank <= 3 ? (
                        <span className={`
                          ${entry.rank === 1 ? "text-yellow-500" : ""}
                          ${entry.rank === 2 ? "text-gray-400" : ""}
                          ${entry.rank === 3 ? "text-amber-700" : ""}
                          font-bold
                        `}>
                          #{entry.rank}
                        </span>
                      ) : (
                        `#${entry.rank}`
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={entry.avatarUrl} />
                          <AvatarFallback>{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{entry.username}</span>
                        {entry.change && entry.change > 0 && (
                          <Badge variant="outline" className="text-xs py-0 h-4 text-green-600">
                            <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />
                            {entry.change}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {entry.score.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* User's rank for monthly */}
            {leaderboardData.userRank && user && (
              <div className="border-t pt-3 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                      {leaderboardData.userRank.rank}
                    </Badge>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">You</span>
                    {leaderboardData.userRank.change && leaderboardData.userRank.change > 0 && (
                      <Badge variant="outline" className="text-xs py-0 h-4 text-green-600">
                        <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />
                        {leaderboardData.userRank.change}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right font-semibold">
                    {leaderboardData.userRank.score.toLocaleString()}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  You're in the top {Math.floor((leaderboardData.userRank.rank / 100) * 100)}% of investors this month
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="allTime">
            {/* Similar table structure as weekly */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Investor</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.allTime.slice(0, limit).map((entry) => (
                  <TableRow key={entry.userId} className={entry.userId === user?.id ? "bg-primary/5" : ""}>
                    <TableCell className="font-medium">
                      {entry.rank <= 3 ? (
                        <span className={`
                          ${entry.rank === 1 ? "text-yellow-500" : ""}
                          ${entry.rank === 2 ? "text-gray-400" : ""}
                          ${entry.rank === 3 ? "text-amber-700" : ""}
                          font-bold
                        `}>
                          #{entry.rank}
                        </span>
                      ) : (
                        `#${entry.rank}`
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={entry.avatarUrl} />
                          <AvatarFallback>{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{entry.username}</span>
                        {entry.change && entry.change > 0 && (
                          <Badge variant="outline" className="text-xs py-0 h-4 text-green-600">
                            <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />
                            {entry.change}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {entry.score.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* User's rank for all time */}
            {leaderboardData.userRank && user && (
              <div className="border-t pt-3 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                      {leaderboardData.userRank.rank}
                    </Badge>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">You</span>
                    {leaderboardData.userRank.change && leaderboardData.userRank.change > 0 && (
                      <Badge variant="outline" className="text-xs py-0 h-4 text-green-600">
                        <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />
                        {leaderboardData.userRank.change}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right font-semibold">
                    {leaderboardData.userRank.score.toLocaleString()}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  You're in the top {Math.floor((leaderboardData.userRank.rank / 100) * 100)}% of all-time investors
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}