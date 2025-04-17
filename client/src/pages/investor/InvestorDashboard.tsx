import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  WalletIcon, 
  TrendingUp, 
  Building, 
  Calendar, 
  ArrowRight, 
  Loader2,
  LineChart,
  BarChart,
  PieChart,
  BellRing,
  Award // Replaced Certificate with Award icon
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function InvestorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch dashboard stats
  const { data = {}, isLoading, error } = useQuery({
    queryKey: ['/api/investor/dashboard'],
    // The path will be registered in server routes
  });
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your investment dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Extract data (with defaults to prevent errors)
  const {
    totalInvested = 0,
    totalEarnings = 0,
    activeInvestments = 0,
    nextPayout = 0,
    portfolioGrowth = 0
  } = data;
  
  return (
    <div className="space-y-6">
      {/* Dashboard header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome, {user?.firstName || 'Investor'}</h2>
        <p className="text-muted-foreground">
          Here's an overview of your investment portfolio and performance.
        </p>
      </div>
      
      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Invested */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalInvested.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Your total capital investment
            </p>
          </CardContent>
        </Card>
        
        {/* Total Earnings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Returns from all investments
            </p>
          </CardContent>
        </Card>
        
        {/* Active Investments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInvestments}</div>
            <p className="text-xs text-muted-foreground">
              Current participating projects
            </p>
          </CardContent>
        </Card>
        
        {/* Next Payout */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{nextPayout.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Expected within 30 days
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="updates">Property Updates</TabsTrigger>
          <TabsTrigger value="opportunities">New Opportunities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Portfolio summary card */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Overview</CardTitle>
              <CardDescription>Summary of your investments and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium">Portfolio Growth</p>
                <p className="text-sm font-medium text-green-600">+{portfolioGrowth}%</p>
              </div>
              
              <div className="h-52 flex items-center justify-center border rounded-md bg-muted/20">
                <div className="flex flex-col items-center text-muted-foreground">
                  <LineChart className="h-8 w-8 mb-2" />
                  <p className="text-sm">Portfolio growth chart will be displayed here</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium mb-1">Asset Allocation</p>
                  <div className="h-32 flex items-center justify-center border rounded-md bg-muted/20">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <PieChart className="h-6 w-6 mb-1" />
                      <p className="text-xs">Allocation chart</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Monthly Returns</p>
                  <div className="h-32 flex items-center justify-center border rounded-md bg-muted/20">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <BarChart className="h-6 w-6 mb-1" />
                      <p className="text-xs">Returns chart</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" asChild className="ml-auto">
                <Link href="/investor/portfolio">
                  View Full Portfolio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Active investments */}
          <Card>
            <CardHeader>
              <CardTitle>Your Active Investments</CardTitle>
              <CardDescription>Properties you're currently invested in</CardDescription>
            </CardHeader>
            <CardContent>
              {activeInvestments > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Your active investments will be displayed here.
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-1">No active investments</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore properties and start your investment journey today.
                  </p>
                  <Button asChild>
                    <Link href="/investor/properties">
                      Browse Properties
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investment Performance</CardTitle>
              <CardDescription>Track the performance of your investments over time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Performance tracking charts and metrics will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="updates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Property Updates</CardTitle>
                <CardDescription>Latest news and updates about your investments</CardDescription>
              </div>
              <BellRing className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Property updates and notifications will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Investment Opportunities</CardTitle>
                <CardDescription>New properties that match your investment profile</CardDescription>
              </div>
              <Certificate className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                New investment opportunities will be displayed here.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" asChild className="ml-auto">
                <Link href="/investor/properties">
                  View All Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}