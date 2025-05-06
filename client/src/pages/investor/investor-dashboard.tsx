import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building, 
  LineChart, 
  PieChart, 
  DollarSign, 
  ArrowUpRight, 
  Wallet, 
  Home, 
  Calendar 
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function InvestorDashboardPage() {
  const { user } = useAuth();
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/investor/dashboard'],
    retry: false
  });

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Investor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username || "Investor"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1">
            <Link href="/investor/properties">
              <Building className="h-4 w-4" />
              Browse Properties
            </Link>
          </Button>
          <Button asChild variant="default" size="sm" className="gap-1">
            <Link href="/investor/wallet">
              <Wallet className="h-4 w-4" />
              My Wallet
            </Link>
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">$45,750</div>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Properties Owned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">3</div>
              <Home className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across 2 different markets
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">$4,320</div>
              <LineChart className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+8.2% annualized</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Diversity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">A+</div>
              <PieChart className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Well-diversified across property types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Properties */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Properties</CardTitle>
            <CardDescription>
              Your current real estate holdings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Property 1 */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                  <Building className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Waterfront Apartments</h4>
                    <p className="text-sm text-muted-foreground">
                      25% ownership
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    East Riverside, 12 units, $25,000 invested
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      +9.4% ROI
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Rental Income
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Property 2 */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                  <Building className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Downtown Commercial</h4>
                    <p className="text-sm text-muted-foreground">
                      10% ownership
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    City Center, Office Space, $15,000 invested
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      +7.2% ROI
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      Commercial
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Property 3 */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                  <Building className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Suburban Homes</h4>
                    <p className="text-sm text-muted-foreground">
                      15% ownership
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Green Valley, 4 homes, $5,750 invested
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      +11.2% ROI
                    </span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                      Appreciation
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/investor/properties">
                View All Properties
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
            <CardDescription>Important dates and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-muted text-center p-1 w-10 h-10 rounded">
                  <div className="text-xs font-medium">MAY</div>
                  <div className="text-sm font-bold">15</div>
                </div>
                <div>
                  <p className="font-medium text-sm">Quarterly Distribution</p>
                  <p className="text-xs text-muted-foreground">Waterfront Apartments</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-muted text-center p-1 w-10 h-10 rounded">
                  <div className="text-xs font-medium">MAY</div>
                  <div className="text-sm font-bold">22</div>
                </div>
                <div>
                  <p className="font-medium text-sm">Property Investor Call</p>
                  <p className="text-xs text-muted-foreground">Q2 Update and Analysis</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-muted text-center p-1 w-10 h-10 rounded">
                  <div className="text-xs font-medium">JUN</div>
                  <div className="text-sm font-bold">01</div>
                </div>
                <div>
                  <p className="font-medium text-sm">Monthly Rental Income</p>
                  <p className="text-xs text-muted-foreground">All properties</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-muted text-center p-1 w-10 h-10 rounded">
                  <div className="text-xs font-medium">JUN</div>
                  <div className="text-sm font-bold">15</div>
                </div>
                <div>
                  <p className="font-medium text-sm">New Property Opportunity</p>
                  <p className="text-xs text-muted-foreground">Exclusive pre-sale access</p>
                </div>
              </div>
            </div>
            
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/investor/calendar">
                <Calendar className="h-4 w-4 mr-2" />
                View Full Calendar
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}