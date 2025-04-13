import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Investment, Property } from "@shared/schema";
import { Loader2, TrendingUp, PieChart, Calendar, DollarSign, LineChart, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Types for analytics data
interface InvestmentWithProperty extends Investment {
  property: Property;
}

interface AnalyticsData {
  totalInvested: number;
  totalProjectedReturns: number;
  portfolioAllocation: {
    name: string;
    value: number;
    type: string;
    color: string;
  }[];
  monthlyReturns: {
    month: string;
    returns: number;
  }[];
  performanceByType: {
    type: string;
    returns: number;
    invested: number;
  }[];
  topPerformingInvestments: InvestmentWithProperty[];
  riskAssessment: {
    low: number;
    medium: number;
    high: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend,
  color = "text-primary"
}: { 
  title: string; 
  value: string; 
  description?: string; 
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className={cn("text-2xl font-bold mt-1", color)}>{value}</h3>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            {trend && (
              <div className="flex items-center mt-2">
                {trend.value >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={
                  cn("text-xs font-medium", 
                     trend.value >= 0 ? "text-emerald-500" : "text-red-500"
                  )
                }>
                  {Math.abs(trend.value)}% {trend.label}
                </span>
              </div>
            )}
          </div>
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", color.replace("text", "bg") + "/10")}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Fetch user investments with property details
  const { data: investments, isLoading: investmentsLoading, error: investmentsError } = useQuery<InvestmentWithProperty[]>({
    queryKey: ["/api/investments/user", "with-details"],
    retry: 1,
  });

  // Analytics data calculation
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (investments) {
      // Calculate analytics data
      const totalInvested = investments.reduce((total, inv) => total + inv.amount, 0);
      
      // Group by property type
      const byType = investments.reduce((acc, inv) => {
        const type = inv.property.type;
        if (!acc[type]) {
          acc[type] = {
            invested: 0,
            returns: 0,
            count: 0
          };
        }
        acc[type].invested += inv.amount;
        // Calculate projected returns based on target return percentage
        const projectedReturn = inv.amount * (parseFloat(inv.property.targetReturn) / 100);
        acc[type].returns += projectedReturn;
        acc[type].count += 1;
        return acc;
      }, {} as Record<string, { invested: number, returns: number, count: number }>);
      
      // Portfolio allocation
      const portfolioAllocation = Object.entries(byType).map(([type, data], index) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: data.invested,
        type,
        color: COLORS[index % COLORS.length]
      }));
      
      // Mock monthly returns data (in a real app, this would come from the API)
      const monthlyReturns = [
        { month: 'Jan', returns: 1200 },
        { month: 'Feb', returns: 1800 },
        { month: 'Mar', returns: 1600 },
        { month: 'Apr', returns: 2100 },
        { month: 'May', returns: 1900 },
        { month: 'Jun', returns: 2400 }
      ];
      
      // Performance by type
      const performanceByType = Object.entries(byType).map(([type, data]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        returns: parseFloat((data.returns / data.invested * 100).toFixed(1)),
        invested: data.invested
      }));
      
      // Top performing investments
      const topPerformingInvestments = [...investments]
        .sort((a, b) => 
          parseFloat(b.property.targetReturn) - parseFloat(a.property.targetReturn)
        )
        .slice(0, 3);
      
      // Risk assessment
      const riskAssessment = {
        low: 0,
        medium: 0,
        high: 0
      };
      
      investments.forEach(inv => {
        const returnRate = parseFloat(inv.property.targetReturn);
        if (returnRate < 10) {
          riskAssessment.low += inv.amount;
        } else if (returnRate < 13) {
          riskAssessment.medium += inv.amount;
        } else {
          riskAssessment.high += inv.amount;
        }
      });
      
      const totalProjectedReturns = investments.reduce((total, inv) => {
        return total + (inv.amount * parseFloat(inv.property.targetReturn) / 100);
      }, 0);
      
      setAnalyticsData({
        totalInvested,
        totalProjectedReturns,
        portfolioAllocation,
        monthlyReturns,
        performanceByType,
        topPerformingInvestments,
        riskAssessment
      });
    }
  }, [investments]);

  if (investmentsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading analytics data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (investmentsError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Error Loading Analytics</CardTitle>
              <CardDescription>
                There was a problem loading your investment analytics data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please try again later or contact support if the problem persists.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!analyticsData || !investments || investments.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>No Investment Data</CardTitle>
              <CardDescription>
                You don't have any investments yet to analyze.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Start investing in properties to see detailed analytics and performance metrics.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-6 lg:p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Investment Analytics</h1>
            <p className="text-gray-500 mt-2">
              Comprehensive insights and performance metrics for your real estate portfolio
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Invested" 
              value={formatCurrency(analyticsData.totalInvested)}
              icon={<DollarSign className="h-5 w-5 text-primary" />}
              trend={{ value: 12.5, label: "from last month" }}
            />
            <StatCard 
              title="Projected Returns" 
              value={formatCurrency(analyticsData.totalProjectedReturns)}
              description="Annual projected income"
              icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
              color="text-emerald-500"
              trend={{ value: 8.3, label: "growth rate" }}
            />
            <StatCard 
              title="Avg. Return Rate" 
              value={`${(analyticsData.totalProjectedReturns / analyticsData.totalInvested * 100).toFixed(1)}%`}
              icon={<Activity className="h-5 w-5 text-blue-500" />}
              color="text-blue-500"
              trend={{ value: 2.1, label: "from previous quarter" }}
            />
            <StatCard 
              title="Active Investments" 
              value={investments.length.toString()}
              description="Across multiple properties"
              icon={<Calendar className="h-5 w-5 text-purple-500" />}
              color="text-purple-500"
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="allocation">Allocation</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LineChart className="h-5 w-5 mr-2" />
                      Returns Over Time
                    </CardTitle>
                    <CardDescription>Monthly returns from your investments</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReLineChart
                        data={analyticsData.monthlyReturns}
                        margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          tickFormatter={(value) => `$${value}`} 
                          domain={[0, 'dataMax + 500']}
                        />
                        <Tooltip formatter={(value) => [`$${value}`, 'Returns']} />
                        <Line 
                          type="monotone" 
                          dataKey="returns" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                      </ReLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="h-5 w-5 mr-2" />
                      Portfolio Distribution
                    </CardTitle>
                    <CardDescription>Allocation across property types</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={analyticsData.portfolioAllocation}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analyticsData.portfolioAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                      </RePieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Risk Assessment</CardTitle>
                    <CardDescription>Portfolio risk allocation based on target returns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Low Risk (less than 10% returns)</span>
                          <span className="font-medium">{formatCurrency(analyticsData.riskAssessment.low)}</span>
                        </div>
                        <Progress 
                          value={analyticsData.riskAssessment.low / analyticsData.totalInvested * 100} 
                          className="h-2 bg-gray-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Medium Risk (10-13% returns)</span>
                          <span className="font-medium">{formatCurrency(analyticsData.riskAssessment.medium)}</span>
                        </div>
                        <Progress 
                          value={analyticsData.riskAssessment.medium / analyticsData.totalInvested * 100} 
                          className="h-2 bg-gray-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>High Risk (more than 13% returns)</span>
                          <span className="font-medium">{formatCurrency(analyticsData.riskAssessment.high)}</span>
                        </div>
                        <Progress 
                          value={analyticsData.riskAssessment.high / analyticsData.totalInvested * 100} 
                          className="h-2 bg-gray-200"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="allocation" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Investment Allocation by Property Type</CardTitle>
                    <CardDescription>How your investment is distributed across different property types</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.portfolioAllocation}
                        margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value/1000}K`} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Bar dataKey="value" name="Amount Invested" fill="#8884d8">
                          {analyticsData.portfolioAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Investments</CardTitle>
                    <CardDescription>Investments with highest projected returns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.topPerformingInvestments.map((investment, index) => (
                        <div key={investment.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{investment.property.name}</h4>
                              <p className="text-sm text-muted-foreground">{investment.property.location}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(investment.amount)}</p>
                              <p className="text-sm text-emerald-600">
                                {investment.property.targetReturn}% return
                              </p>
                            </div>
                          </div>
                          <Progress 
                            value={parseFloat(investment.property.targetReturn)} 
                            max={20}
                            className="h-2 bg-gray-200"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Diversification Analysis</CardTitle>
                    <CardDescription>Portfolio diversification across property types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {analyticsData.portfolioAllocation.map((item, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <h4 className="font-medium">{item.name}</h4>
                            </div>
                            <p className="text-2xl font-bold">
                              {Math.round(item.value / analyticsData.totalInvested * 100)}%
                            </p>
                            <p className="text-sm text-muted-foreground">{formatCurrency(item.value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Performance by Property Type</CardTitle>
                    <CardDescription>Return rates compared across property types</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.performanceByType}
                        margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis 
                          yAxisId="left"
                          tickFormatter={(value) => `${value}%`}
                          orientation="left"
                          stroke="#8884d8"
                        />
                        <YAxis 
                          yAxisId="right"
                          tickFormatter={(value) => `$${value/1000}K`}
                          orientation="right"
                          stroke="#82ca9d"
                        />
                        <Tooltip formatter={(value, name) => {
                          if (name === "returns") return [`${value}%`, "Return Rate"];
                          return [formatCurrency(Number(value)), "Amount Invested"];
                        }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="returns" name="Return Rate %" fill="#8884d8" />
                        <Bar yAxisId="right" dataKey="invested" name="Amount Invested" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Projected Annual Returns</CardTitle>
                    <CardDescription>Expected earnings from your investments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-6">
                      <p className="text-5xl font-bold text-primary">
                        {formatCurrency(analyticsData.totalProjectedReturns)}
                      </p>
                      <p className="text-muted-foreground mt-2">Expected annual returns</p>
                      
                      <div className="mt-8 flex justify-between text-sm">
                        <div>
                          <p className="font-medium text-lg">{formatCurrency(analyticsData.totalInvested)}</p>
                          <p className="text-muted-foreground">Principal</p>
                        </div>
                        <div>
                          <p className="font-medium text-lg text-emerald-600">
                            {(analyticsData.totalProjectedReturns / analyticsData.totalInvested * 100).toFixed(1)}%
                          </p>
                          <p className="text-muted-foreground">Average Return</p>
                        </div>
                        <div>
                          <p className="font-medium text-lg">{investments.length}</p>
                          <p className="text-muted-foreground">Properties</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Growth Projection</CardTitle>
                    <CardDescription>Projected 5-year investment growth</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReLineChart
                        data={[
                          { year: 'Year 1', value: analyticsData.totalInvested },
                          { year: 'Year 2', value: analyticsData.totalInvested * 1.11 },
                          { year: 'Year 3', value: analyticsData.totalInvested * 1.24 },
                          { year: 'Year 4', value: analyticsData.totalInvested * 1.38 },
                          { year: 'Year 5', value: analyticsData.totalInvested * 1.54 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `$${value/1000}K`} />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Portfolio Value']} />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#82ca9d" 
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </ReLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function AnalyticsDashboardProtected() {
  return (
    <ProtectedRoute path="/analytics" component={AnalyticsDashboard} />
  );
}