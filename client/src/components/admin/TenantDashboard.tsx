import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  Users,
  Building,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Wallet,
  FileClock,
  CalendarClock,
  Activity
} from 'lucide-react';

interface TenantMetrics {
  totalUsers: number;
  activeUsers: number;
  totalInvestments: number;
  totalInvestmentAmount: number;
  totalProperties: number;
  activeProperties: number;
  totalROIPaid: number;
  averageROI: number;
  pendingKYC: number;
  approvedKYC: number;
  rejectedKYC: number;
  kycCompletionRate: number;
  activeInvitations: number;
  monthlyActiveUsers: {
    month: string;
    count: number;
  }[];
  monthlyInvestments: {
    month: string;
    amount: number;
  }[];
  propertiesByStatus: {
    status: string;
    count: number;
  }[];
  investmentsByType: {
    type: string;
    amount: number;
  }[];
}

interface TenantDashboardProps {
  tenantId: string;
  tenantName: string;
}

const TenantDashboard: React.FC<TenantDashboardProps> = ({ tenantId, tenantName }) => {
  // Fetch tenant metrics
  const { data: metrics, isLoading, error } = useQuery<TenantMetrics>({
    queryKey: [`/api/admin/tenants/${tenantId}/metrics`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/tenants/${tenantId}/metrics`);
      if (!res.ok) {
        throw new Error('Failed to fetch tenant metrics');
      }
      return res.json();
    },
    enabled: !!tenantId,
    // In production, we would add a refresh interval to keep data up to date
    // refetchInterval: 60000, // Refresh every minute
  });

  // For demo purposes, hardcode some metrics while the API endpoint is built
  const demoMetrics: TenantMetrics = {
    totalUsers: 128,
    activeUsers: 85,
    totalInvestments: 312,
    totalInvestmentAmount: 8450000,
    totalProperties: 24,
    activeProperties: 18,
    totalROIPaid: 425000,
    averageROI: 8.2,
    pendingKYC: 15,
    approvedKYC: 102,
    rejectedKYC: 11,
    kycCompletionRate: 88.7,
    activeInvitations: 23,
    monthlyActiveUsers: [
      { month: 'Jan', count: 65 },
      { month: 'Feb', count: 70 },
      { month: 'Mar', count: 75 },
      { month: 'Apr', count: 80 },
      { month: 'May', count: 85 }
    ],
    monthlyInvestments: [
      { month: 'Jan', amount: 1200000 },
      { month: 'Feb', amount: 1500000 },
      { month: 'Mar', amount: 1800000 },
      { month: 'Apr', amount: 1950000 },
      { month: 'May', amount: 2000000 }
    ],
    propertiesByStatus: [
      { status: 'Active', count: 18 },
      { status: 'Pending', count: 3 },
      { status: 'Sold', count: 2 },
      { status: 'Under Maintenance', count: 1 }
    ],
    investmentsByType: [
      { type: 'Residential', amount: 4250000 },
      { type: 'Commercial', amount: 3100000 },
      { type: 'Mixed-Use', amount: 950000 },
      { type: 'Industrial', amount: 150000 }
    ]
  };

  // Format numbers for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  // Use actual metrics data when available, otherwise use demo data
  const data = metrics || demoMetrics;

  // Calculate user activity percentage
  const userActivityRate = data ? (data.activeUsers / data.totalUsers) * 100 : 0;

  // Calculate investment trend (comparing latest month to previous)
  const latestInvestment = data?.monthlyInvestments[data.monthlyInvestments.length - 1]?.amount || 0;
  const previousInvestment = data?.monthlyInvestments[data.monthlyInvestments.length - 2]?.amount || 0;
  const investmentTrend = previousInvestment > 0 
    ? ((latestInvestment - previousInvestment) / previousInvestment) * 100 
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-16 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <Card key={`card-${index}`} className="h-[300px]">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error Loading Dashboard
          </CardTitle>
          <CardDescription>
            There was a problem fetching the tenant metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            {(error as Error).message || 'An unexpected error occurred'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto">
        <TabsTrigger value="overview" className="flex items-center space-x-2">
          <BarChart3 className="h-4 w-4" />
          <span>Overview</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>Users & KYC</span>
        </TabsTrigger>
        <TabsTrigger value="investments" className="flex items-center space-x-2">
          <Building className="h-4 w-4" />
          <span>Properties & Investments</span>
        </TabsTrigger>
      </TabsList>
      
      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="text-2xl font-bold">{formatNumber(data.totalUsers)}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={data.activeUsers > data.totalUsers * 0.6 ? "text-green-500" : "text-yellow-500"}>
                  {formatPercentage(userActivityRate)} active
                </span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Investment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="text-2xl font-bold">{formatCurrency(data.totalInvestmentAmount)}</div>
              </div>
              <p className="text-xs flex items-center mt-1">
                {investmentTrend > 0 ? (
                  <span className="text-green-500 flex items-center">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {formatPercentage(investmentTrend)} increase
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <TrendingDown className="mr-1 h-3 w-3" />
                    {formatPercentage(Math.abs(investmentTrend))} decrease
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                ROI Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Wallet className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="text-2xl font-bold">{formatCurrency(data.totalROIPaid)}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg. ROI: <span className="font-medium">{formatPercentage(data.averageROI)}</span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                KYC Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="text-2xl font-bold">{formatPercentage(data.kycCompletionRate)}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-yellow-500">{data.pendingKYC} pending</span> • 
                <span className="text-red-500 ml-1">{data.rejectedKYC} rejected</span>
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Active Users</CardTitle>
              <CardDescription>
                User activity over the last 5 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-end">
                {data.monthlyActiveUsers.map((item, index) => (
                  <div 
                    key={item.month} 
                    className="flex-1 flex flex-col items-center justify-end mr-1 last:mr-0"
                  >
                    <div 
                      className="w-full bg-primary/80 rounded-t-sm hover:bg-primary transition-colors"
                      style={{ 
                        height: `${(item.count / Math.max(...data.monthlyActiveUsers.map(m => m.count))) * 200}px` 
                      }}
                    />
                    <div className="text-xs mt-2">{item.month}</div>
                    <div className="text-xs font-medium">{item.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly Investments</CardTitle>
              <CardDescription>
                Investment volume over the last 5 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-end">
                {data.monthlyInvestments.map((item, index) => (
                  <div 
                    key={item.month} 
                    className="flex-1 flex flex-col items-center justify-end mr-1 last:mr-0"
                  >
                    <div 
                      className="w-full bg-blue-500/80 rounded-t-sm hover:bg-blue-500 transition-colors"
                      style={{ 
                        height: `${(item.amount / Math.max(...data.monthlyInvestments.map(m => m.amount))) * 200}px` 
                      }}
                    />
                    <div className="text-xs mt-2">{item.month}</div>
                    <div className="text-xs font-medium">{formatCurrency(item.amount)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Properties by Status</CardTitle>
              <CardDescription>
                Distribution of properties by current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.propertiesByStatus.map((item) => (
                  <div key={item.status} className="flex items-center">
                    <div className="w-full mr-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.status}</span>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2" 
                          style={{ width: `${(item.count / data.totalProperties) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Investments by Type</CardTitle>
              <CardDescription>
                Distribution of investments by property type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.investmentsByType.map((item) => (
                  <div key={item.type} className="flex items-center">
                    <div className="w-full mr-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.type}</span>
                        <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 rounded-full h-2" 
                          style={{ width: `${(item.amount / data.totalInvestmentAmount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      {/* Users & KYC Tab */}
      <TabsContent value="users" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.totalUsers)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.activeUsers)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatPercentage(userActivityRate)} of total users
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Invitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.activeInvitations)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pending user registrations
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Session Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28m 45s</div>
              <p className="text-xs text-muted-foreground mt-1">
                Average user engagement time
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved KYC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                <div className="text-2xl font-bold">{formatNumber(data.approvedKYC)}</div>
              </div>
              <p className="text-xs text-green-500 mt-1">
                {formatPercentage((data.approvedKYC / data.totalUsers) * 100)} of users verified
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending KYC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-yellow-500" />
                <div className="text-2xl font-bold">{formatNumber(data.pendingKYC)}</div>
              </div>
              <p className="text-xs text-yellow-500 mt-1">
                Awaiting review or additional information
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejected KYC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                <div className="text-2xl font-bold">{formatNumber(data.rejectedKYC)}</div>
              </div>
              <p className="text-xs text-red-500 mt-1">
                Failed verification requirements
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>KYC Verification Status</CardTitle>
            <CardDescription>
              Overall verification completion rate for the organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Overall Completion</span>
                  <span className="text-sm font-medium">{formatPercentage(data.kycCompletionRate)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-primary rounded-full h-2.5" 
                    style={{ width: `${data.kycCompletionRate}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col items-center p-3 border rounded-md">
                  <div className="text-sm text-muted-foreground mb-1">Approved</div>
                  <div className="text-xl font-bold">{formatNumber(data.approvedKYC)}</div>
                  <Badge className="mt-2 bg-green-500">
                    {formatPercentage((data.approvedKYC / data.totalUsers) * 100)}
                  </Badge>
                </div>
                
                <div className="flex flex-col items-center p-3 border rounded-md">
                  <div className="text-sm text-muted-foreground mb-1">Pending</div>
                  <div className="text-xl font-bold">{formatNumber(data.pendingKYC)}</div>
                  <Badge className="mt-2 bg-yellow-500">
                    {formatPercentage((data.pendingKYC / data.totalUsers) * 100)}
                  </Badge>
                </div>
                
                <div className="flex flex-col items-center p-3 border rounded-md">
                  <div className="text-sm text-muted-foreground mb-1">Rejected</div>
                  <div className="text-xl font-bold">{formatNumber(data.rejectedKYC)}</div>
                  <Badge className="mt-2 bg-red-500">
                    {formatPercentage((data.rejectedKYC / data.totalUsers) * 100)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Investments Tab */}
      <TabsContent value="investments" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Building className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="text-2xl font-bold">{formatNumber(data.totalProperties)}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={data.activeProperties > data.totalProperties * 0.7 ? "text-green-500" : "text-yellow-500"}>
                  {formatPercentage((data.activeProperties / data.totalProperties) * 100)} active
                </span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Investments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="text-2xl font-bold">{formatNumber(data.totalInvestments)}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatNumber(data.totalInvestments / data.totalUsers)} per user average
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Investment Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="text-2xl font-bold">{formatCurrency(data.totalInvestmentAmount)}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(data.totalInvestmentAmount / data.totalInvestments)} avg. per investment
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total ROI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Wallet className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="text-2xl font-bold">{formatCurrency(data.totalROIPaid)}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average ROI {formatPercentage(data.averageROI)}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Properties by Status</CardTitle>
              <CardDescription>
                Distribution of properties by current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.propertiesByStatus.map((item) => (
                  <div key={item.status} className="flex items-center">
                    <div className="w-full mr-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.status}</span>
                        <span className="text-sm font-medium">{item.count} properties</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2" 
                          style={{ width: `${(item.count / data.totalProperties) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Investment Distribution</CardTitle>
              <CardDescription>
                Distribution of investments by property type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.investmentsByType.map((item) => (
                  <div key={item.type} className="flex items-center">
                    <div className="w-full mr-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.type}</span>
                        <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 rounded-full h-2" 
                          style={{ width: `${(item.amount / data.totalInvestmentAmount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Investment Trend</CardTitle>
            <CardDescription>
              Investment volume over the last 5 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end">
              {data.monthlyInvestments.map((item, index) => {
                const prevMonth = index > 0 ? data.monthlyInvestments[index - 1].amount : 0;
                const isIncrease = item.amount > prevMonth;
                const percentChange = prevMonth ? ((item.amount - prevMonth) / prevMonth) * 100 : 0;
                
                return (
                  <div 
                    key={item.month} 
                    className="flex-1 flex flex-col items-center justify-end mr-2 last:mr-0"
                  >
                    <div 
                      className={`w-full ${isIncrease ? 'bg-green-500/80' : 'bg-red-500/80'} rounded-t-sm transition-colors`}
                      style={{ 
                        height: `${(item.amount / Math.max(...data.monthlyInvestments.map(m => m.amount))) * 250}px` 
                      }}
                    />
                    <div className="text-xs mt-2">{item.month}</div>
                    <div className="text-xs font-medium">{formatCurrency(item.amount)}</div>
                    {index > 0 && (
                      <div 
                        className={`text-xs mt-1 flex items-center ${isIncrease ? 'text-green-500' : 'text-red-500'}`}
                      >
                        {isIncrease ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(percentChange).toFixed(1)}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default TenantDashboard;