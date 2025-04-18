import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Download, Users, TrendingUp, DollarSign, Calendar, ChartBarIcon, BarChart4 } from 'lucide-react';

// Import from recharts for data visualization
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

interface UserEngagementDashboardProps {
  className?: string;
}

// Custom formatter for currency
const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
});

// Custom formatter for numbers
const numberFormatter = new Intl.NumberFormat('en-NG');

// PIECHART COLORS
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const UserEngagementDashboard: React.FC<UserEngagementDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  
  // State for date range filter
  const [dateRange, setDateRange] = React.useState<string>('30days');
  
  // Fetch engagement metrics from API
  const { data: metrics, isLoading, isError } = useQuery({
    queryKey: ['/api/metrics/engagement', dateRange],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/metrics/engagement?range=${dateRange}`);
      return response.json();
    },
  });
  
  // Mock data for demonstration (would normally come from API)
  const mockData = {
    summary: {
      totalUsers: 846,
      activeUsers: 582,
      avgDailyActive: 178,
      newUsersLastMonth: 42,
      totalInvestments: 1247,
      totalInvestmentAmount: 725000000, // In Naira
      avgInvestmentSize: 581395,
      roiRedemptionRate: 78.4, // Percentage
    },
    investmentTrend: [
      { month: 'Jan', amount: 48500000 },
      { month: 'Feb', amount: 52000000 },
      { month: 'Mar', amount: 61500000 },
      { month: 'Apr', amount: 58700000 },
      { month: 'May', amount: 65300000 },
      { month: 'Jun', amount: 72100000 },
      { month: 'Jul', amount: 68400000 },
      { month: 'Aug', amount: 75800000 },
      { month: 'Sep', amount: 78200000 },
      { month: 'Oct', amount: 82500000 },
      { month: 'Nov', amount: 79800000 },
      { month: 'Dec', amount: 88700000 },
    ],
    userActivityByDay: [
      { day: 'Mon', users: 156 },
      { day: 'Tue', users: 182 },
      { day: 'Wed', users: 204 },
      { day: 'Thu', users: 186 },
      { day: 'Fri', users: 172 },
      { day: 'Sat', users: 130 },
      { day: 'Sun', users: 112 },
    ],
    investmentsByCategory: [
      { name: 'Residential', value: 45 },
      { name: 'Commercial', value: 30 },
      { name: 'Mixed-use', value: 15 },
      { name: 'Land', value: 10 },
    ],
    userRetention: [
      { month: 'Jan', retention: 92 },
      { month: 'Feb', retention: 89 },
      { month: 'Mar', retention: 93 },
      { month: 'Apr', retention: 87 },
      { month: 'May', retention: 85 },
      { month: 'Jun', retention: 91 },
      { month: 'Jul', retention: 94 },
      { month: 'Aug', retention: 92 },
      { month: 'Sep', retention: 90 },
      { month: 'Oct', retention: 88 },
      { month: 'Nov', retention: 91 },
      { month: 'Dec', retention: 93 },
    ],
  };
  
  // Use mock data for now (would be replaced by actual API data)
  const data = metrics || mockData;
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>User Engagement Metrics</CardTitle>
          <CardDescription>
            Loading metrics data...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>User Engagement Metrics</CardTitle>
          <CardDescription>
            Error loading metrics data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium">Failed to load metrics</h3>
            <p className="text-muted-foreground mt-2">
              There was a problem fetching engagement metrics. Please try again later.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>User Engagement Metrics</CardTitle>
            <CardDescription>
              Track investor activity, investment volume, and ROI redemption rates
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select
              value={dateRange}
              onValueChange={setDateRange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="1year">Last 12 months</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Metrics summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="text-muted-foreground text-sm flex items-center mb-1">
                <Users className="mr-1 h-4 w-4" />
                Total Users
              </div>
              <div className="text-2xl font-bold">{numberFormatter.format(data.summary.totalUsers)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {data.summary.activeUsers} active users
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="text-muted-foreground text-sm flex items-center mb-1">
                <TrendingUp className="mr-1 h-4 w-4" />
                Total Investments
              </div>
              <div className="text-2xl font-bold">{numberFormatter.format(data.summary.totalInvestments)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Avg: {currencyFormatter.format(data.summary.avgInvestmentSize)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="text-muted-foreground text-sm flex items-center mb-1">
                <DollarSign className="mr-1 h-4 w-4" />
                Total Invested
              </div>
              <div className="text-2xl font-bold">{currencyFormatter.format(data.summary.totalInvestmentAmount)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Across all properties
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="text-muted-foreground text-sm flex items-center mb-1">
                <Calendar className="mr-1 h-4 w-4" />
                ROI Redemption Rate
              </div>
              <div className="text-2xl font-bold">{data.summary.roiRedemptionRate}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                Last 30 days
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="investment" className="w-full space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
            <TabsTrigger value="investment">Investment Trends</TabsTrigger>
            <TabsTrigger value="users">User Activity</TabsTrigger>
            <TabsTrigger value="categories">Investment Categories</TabsTrigger>
            <TabsTrigger value="retention">User Retention</TabsTrigger>
          </TabsList>
          
          <TabsContent value="investment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Investment Volume</CardTitle>
                <CardDescription>
                  Total investment amount tracked over the past 12 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.investmentTrend}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis 
                        tickFormatter={(value) => {
                          if (value >= 1000000) {
                            return `₦${value / 1000000}M`;
                          }
                          return `₦${value / 1000}K`;
                        }}
                      />
                      <Tooltip 
                        formatter={(value: number) => [
                          currencyFormatter.format(value), 
                          "Investment Amount"
                        ]}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        name="Investment Amount" 
                        stroke="#4B3B2A" 
                        fill="#8A7967" 
                        fillOpacity={0.6}
                        activeDot={{ r: 8 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily User Activity</CardTitle>
                <CardDescription>
                  Number of active users by day of the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.userActivityByDay}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [
                          numberFormatter.format(value), 
                          "Active Users"
                        ]}
                      />
                      <Legend />
                      <Bar 
                        dataKey="users" 
                        name="Active Users" 
                        fill="#4B3B2A" 
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investment by Property Type</CardTitle>
                <CardDescription>
                  Distribution of investments across different property categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.investmentsByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={130}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.investmentsByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value}%`, 
                          name
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="retention" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly User Retention</CardTitle>
                <CardDescription>
                  Percentage of users who remain active month over month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.userRetention}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[80, 100]} />
                      <Tooltip 
                        formatter={(value: number) => [
                          `${value}%`, 
                          "Retention Rate"
                        ]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="retention" 
                        name="Retention Rate" 
                        stroke="#4B3B2A" 
                        strokeWidth={2}
                        dot={{ r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserEngagementDashboard;