import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  Wallet, 
  TrendingUp, 
  PieChart, 
  Clock, 
  Building, 
  CreditCard, 
  Loader2, 
  ChevronRight 
} from 'lucide-react';

/**
 * Investor Dashboard Page
 */
export default function InvestorDashboard() {
  const { user } = useAuth();
  
  // Fetch investor's portfolio data
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['/api/investor/portfolio'],
    // If the endpoint isn't created yet, this will give an error
    // We'll handle that gracefully
    retry: false,
    staleTime: 60 * 1000, // 1 minute
  });

  console.log('Investor portfolio data:', portfolio);

  // Mock data until we have real data
  const dashboardData = {
    totalInvested: portfolio?.totalInvested || 0,
    totalEarnings: portfolio?.totalEarnings || 0,
    activeInvestments: portfolio?.activeInvestments || 0,
    nextPayout: portfolio?.nextPayout || '2023-12-30',
    portfolioGrowth: portfolio?.portfolioGrowth || '12.5%',
  };

  // Cards for dashboard stats
  const statCards = [
    {
      title: 'Total Invested',
      value: `₦${dashboardData.totalInvested.toLocaleString()}`,
      description: 'Your total investment amount',
      icon: Wallet,
      color: 'bg-blue-500',
      link: '/investor/investments',
    },
    {
      title: 'Total Earnings',
      value: `₦${dashboardData.totalEarnings.toLocaleString()}`,
      description: 'Your total ROI to date',
      icon: TrendingUp,
      color: 'bg-green-500',
      link: '/investor/portfolio',
    },
    {
      title: 'Portfolio Growth',
      value: dashboardData.portfolioGrowth,
      description: 'Annualized ROI',
      icon: PieChart,
      color: 'bg-purple-500',
      link: '/investor/portfolio',
    },
    {
      title: 'Next Payout',
      value: new Date(dashboardData.nextPayout).toLocaleDateString(),
      description: 'Upcoming dividend payment',
      icon: Clock,
      color: 'bg-orange-500',
      link: '/investor/earnings',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.username || 'Investor'}
        </h1>
        <Button asChild>
          <Link href="/investor/properties">
            Invest Now
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {card.title}
                    </CardTitle>
                    <div className={`${card.color} p-2 rounded-full text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Investments</CardTitle>
                <CardDescription>
                  Your current investment portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.activeInvestments > 0 ? (
                  <p>
                    You have {dashboardData.activeInvestments} active investments
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <Building className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      You don't have any active investments yet
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

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Your recent investment activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <CreditCard className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Transaction history will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">Recommended Properties</h2>
              <Button variant="ghost" asChild size="sm">
                <Link href="/investor/properties" className="flex items-center">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-0">
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <Building className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Recommended properties will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}