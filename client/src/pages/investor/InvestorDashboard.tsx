import { useState, useTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Award,
  Eye,
  ChevronRight,
  Smartphone,
  AreaChart,
  Layers,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getQueryFn } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

// Dashboard stats interface
interface InvestorDashboardStats {
  totalInvested: number;
  totalEarnings: number;
  activeInvestments: number;
  nextPayout: number;
  portfolioGrowth: number;
}

export default function InvestorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isPending, startTransition] = useTransition();
  
  // Fetch dashboard stats
  const { data, isLoading, error } = useQuery<InvestorDashboardStats>({
    queryKey: ['/api/investor/dashboard'],
    queryFn: getQueryFn({ on401: "throw" }),
    retry: 1, // Only retry once
    refetchOnWindowFocus: false
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
  } = data || {};
  
  return (
    <div className="space-y-6">
      <Helmet>
        <title>Investor Dashboard | iREVA</title>
      </Helmet>
      
      {/* Dashboard header with user greeting and welcome card */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent p-6 rounded-lg border border-border/40 shadow-sm">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Welcome back, <span className="text-primary">{user?.firstName || 'Investor'}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mb-4">
              Here's your investment portfolio summary and latest updates. Your portfolio is {portfolioGrowth > 0 ? 'growing' : 'currently stable'}.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <Button asChild>
                <Link href="/investor/properties">
                  <Eye className="mr-2 h-4 w-4" />
                  Explore New Properties
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/investor/wallet">
                  <WalletIcon className="mr-2 h-4 w-4" />
                  Add Funds
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="hidden md:block">
          <Card className="border-primary/20 h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">Investor Status</CardTitle>
                <Badge variant={user?.kycStatus === 'verified' ? 'default' : 'outline'} className="font-normal">
                  {user?.accreditationLevel?.replace('_', ' ') || 'Standard'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={user?.profileImage || ""} alt={user?.firstName || user?.username} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0] || user?.username?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={
                      user?.kycStatus === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                      user?.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }>
                      {user?.kycStatus === 'verified' ? 'Verified' : user?.kycStatus === 'pending' ? 'Pending' : 'Unverified'}
                    </Badge>
                    {user?.rewardsPoints > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {user.rewardsPoints} pts
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {user?.kycStatus !== 'verified' && (
                <div className="mb-4 bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Complete your verification</p>
                      <p className="text-xs text-muted-foreground">Unlock premium investment opportunities</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button size="sm" variant="secondary" asChild className="w-full">
                      <Link href="/investor/kyc">
                        Verify Now
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Invested */}
        <Card className="overflow-hidden border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <div className="rounded-full bg-primary/10 p-1 text-primary">
              <WalletIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">₦{totalInvested.toLocaleString()}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                Your total capital investment
              </p>
              {totalInvested > 0 && (
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  Active
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Total Earnings */}
        <Card className="overflow-hidden border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-1 text-green-600 dark:text-green-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ₦{totalEarnings.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                Returns from all investments
              </p>
              {portfolioGrowth > 0 && (
                <Badge variant="outline" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                  +{portfolioGrowth}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Active Investments */}
        <Card className="overflow-hidden border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-1 text-blue-600 dark:text-blue-400">
              <Building className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{activeInvestments}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                Current participating projects
              </p>
              {activeInvestments > 0 && (
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                  <Layers className="h-3 w-3 mr-1" />
                  Projects
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Next Payout */}
        <Card className="overflow-hidden border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-1 text-amber-600 dark:text-amber-400">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">₦{nextPayout.toLocaleString()}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                Expected within 30 days
              </p>
              {nextPayout > 0 && (
                <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Upcoming
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content */}
      <Tabs 
        defaultValue="overview" 
        value={activeTab} 
        onValueChange={(value) => startTransition(() => setActiveTab(value))}
        className="mt-6"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-2">
          <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="updates">Property Updates</TabsTrigger>
          <TabsTrigger value="opportunities">New Opportunities</TabsTrigger>
        </TabsList>
        
        <div className="my-4">
          {isPending && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Loading...</span>
            </div>
          )}
        </div>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Portfolio summary card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle>Portfolio Overview</CardTitle>
                  <CardDescription>Summary of your investments and their performance</CardDescription>
                </div>
                <Badge className="w-fit flex items-center gap-1 px-3 py-1">
                  <AreaChart className="h-3.5 w-3.5 mr-1" />
                  {portfolioGrowth > 0 ? `+${portfolioGrowth}% Growth` : 'Stable'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-52 flex items-center justify-center border rounded-md bg-muted/20">
                <div className="flex flex-col items-center text-muted-foreground">
                  <LineChart className="h-8 w-8 mb-2" />
                  <p className="text-sm">Portfolio growth chart will be displayed here</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center">
                    <PieChart className="h-4 w-4 mr-2 text-primary" /> Asset Allocation
                  </h4>
                  <div className="h-32 flex items-center justify-center border rounded-md bg-muted/20">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <p className="text-xs">Allocation chart</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-primary" /> Monthly Returns
                  </h4>
                  <div className="h-32 flex items-center justify-center border rounded-md bg-muted/20">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <p className="text-xs">Returns chart</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Portfolio created: <span className="font-medium text-foreground">{new Date().toLocaleDateString()}</span>
              </div>
              <Button variant="outline" size="sm" asChild className="gap-1">
                <Link href="/investor/portfolio">
                  View Full Portfolio
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Active investments */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Your Active Investments</CardTitle>
              <CardDescription>Properties you're currently invested in</CardDescription>
            </CardHeader>
            <CardContent>
              {activeInvestments > 0 ? (
                <div className="space-y-4">
                  {/* Sample investment card */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 h-32 sm:h-auto bg-muted flex items-center justify-center">
                        <Building className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="p-4 sm:w-2/3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">Sample Property Investment</h3>
                          <Badge>Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Lagos, Nigeria
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Investment</span>
                            <span className="font-medium">₦1,000,000</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Current Value</span>
                            <span className="font-medium text-green-600">₦1,150,000</span>
                          </div>
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">ROI</span>
                              <span className="text-green-600">+15%</span>
                            </div>
                            <Progress value={45} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>3 years remaining</span>
                              <span>5 year term</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/investor/portfolio">
                      View All Investments
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 px-4 bg-muted/20 rounded-lg border border-dashed">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-1">No active investments</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                    Explore our curated properties and start your investment journey today with as little as ₦100,000.
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
        
        <TabsContent value="performance" className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <CardTitle>Investment Performance</CardTitle>
                  <CardDescription>Track the performance of your investments over time</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-muted/50">Last 30 days</Badge>
                  <Badge variant="outline" className="bg-muted/50">Last 90 days</Badge>
                  <Badge variant="outline" className="bg-primary/10 text-primary">All time</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="h-64 flex items-center justify-center border rounded-md bg-muted/20">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <AreaChart className="h-8 w-8 mb-2" />
                    <p className="text-sm">Performance tracking chart will be displayed here</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-border/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Overall ROI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{portfolioGrowth}%</div>
                      <p className="text-xs text-muted-foreground">Since you started investing</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-border/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Annual Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12.5%</div>
                      <p className="text-xs text-muted-foreground">Average annual return</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-border/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Monthly Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₦{(totalEarnings / 12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                      <p className="text-xs text-muted-foreground">Average monthly earnings</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="updates" className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Property Updates</CardTitle>
                <CardDescription>Latest news and updates about your investments</CardDescription>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <Badge variant="outline" className="flex items-center gap-1">
                  <BellRing className="h-3 w-3" /> 
                  New Updates
                </Badge>
                <Smartphone className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-lg border bg-muted/10">
                  <div className="min-w-8 pt-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium text-sm">Construction Update</h4>
                      <Badge variant="outline" className="text-xs">New</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      The foundation work for Skyline Apartments has been completed ahead of schedule. Construction is progressing well.
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">April 15, 2025</span>
                      <Button variant="ghost" size="sm" className="h-7 px-2">View Details</Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 rounded-lg border">
                  <div className="min-w-8 pt-1">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium text-sm">Dividend Payment</h4>
                      <span className="text-xs text-muted-foreground">1 week ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      A quarterly dividend of ₦25,000 has been paid to your wallet. The property is performing above expectations.
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-green-600 dark:text-green-400 font-medium">+₦25,000 Added to Wallet</span>
                      <Button variant="ghost" size="sm" className="h-7 px-2">View Details</Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 rounded-lg border">
                  <div className="min-w-8 pt-1">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium text-sm">Property Milestone</h4>
                      <span className="text-xs text-muted-foreground">2 weeks ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Harmony Heights has reached 80% completion. Rental agreements are already being prepared for future tenants.
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Estimated completion: June 2025</span>
                      <Button variant="ghost" size="sm" className="h-7 px-2">View Details</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t">
              <Button variant="link" size="sm" asChild>
                <Link href="/investor/notifications">
                  View All Updates
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="opportunities" className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Investment Opportunities</CardTitle>
                <CardDescription>New properties that match your investment profile</CardDescription>
              </div>
              <Badge variant="secondary" className="w-fit mt-2 sm:mt-0">
                <Award className="h-4 w-4 mr-1" /> Recommended for you
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Opportunity 1 */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-40 bg-muted flex items-center justify-center">
                    <Building className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">Parkview Residences</h3>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Premium</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Luxury apartments in Lekki, Lagos
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Min. Investment</span>
                        <span className="font-medium">₦500,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Target Return</span>
                        <span className="font-medium text-green-600">18% per annum</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Funding</span>
                          <span className="text-primary">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4" size="sm" asChild>
                      <Link href="/investor/properties/1">
                        View Property
                      </Link>
                    </Button>
                  </div>
                </div>
                
                {/* Opportunity 2 */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-40 bg-muted flex items-center justify-center">
                    <Building className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">Green Valley Estate</h3>
                      <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Eco-friendly</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Sustainable housing in Abuja
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Min. Investment</span>
                        <span className="font-medium">₦350,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Target Return</span>
                        <span className="font-medium text-green-600">15% per annum</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Funding</span>
                          <span className="text-primary">42%</span>
                        </div>
                        <Progress value={42} className="h-2" />
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4" size="sm" asChild>
                      <Link href="/investor/properties/2">
                        View Property
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t">
              <Button variant="outline" size="sm" asChild className="w-full mt-2">
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