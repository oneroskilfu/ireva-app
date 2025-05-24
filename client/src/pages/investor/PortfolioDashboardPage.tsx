import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Calendar,
  Download,
  Filter,
  Loader2,
  AlertCircle,
  ChevronsUpDown,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

// Interfaces for investments and portfolio data
interface InvestmentSummary {
  id: number;
  propertyId: number;
  propertyName: string;
  propertyType: string;
  propertyLocation: string;
  propertyImage: string;
  investmentAmount: number;
  currentValue: number;
  roi: number;
  status: 'active' | 'pending' | 'completed';
  investmentDate: string;
  maturityDate: string | null;
  completedDate: string | null;
  returns: number;
  lastPayoutDate: string | null;
}

interface PortfolioStats {
  totalInvested: number;
  currentValue: number;
  totalReturns: number;
  totalProperties: number;
  averageROI: number;
  portfolioGrowth: number;
  activeInvestments: number;
  completedInvestments: number;
  pendingInvestments: number;
  portfolioHealthScore: number;
  projectedAnnualReturns: number;
}

interface ReturnHistory {
  date: string;
  amount: number;
  type: 'dividend' | 'interest' | 'capital_gain';
  propertyId: number;
  propertyName: string;
}

interface PortfolioAllocation {
  type: string;
  value: number;
  percentage: number;
  color: string;
}

interface MonthlyPerformance {
  month: string;
  returns: number;
  benchmark: number;
}

interface InvestmentAlert {
  id: number;
  type: 'opportunity' | 'maturity' | 'payment' | 'risk';
  message: string;
  date: string;
  propertyId?: number;
  propertyName?: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
}

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border rounded-md shadow-sm">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? new Intl.NumberFormat('en-NG', {
              style: 'currency',
              currency: 'NGN',
              minimumFractionDigits: 0,
            }).format(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

// Format currency helper
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(value);
};

// Format percentage helper
const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// Format date helper
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const PortfolioDashboardPage = () => {
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('1y');
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([
    'residential',
    'commercial',
    'industrial',
    'land',
  ]);

  // Fetch portfolio data
  const {
    data: portfolioStats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
  } = useQuery<PortfolioStats>({
    queryKey: ['/api/portfolio/stats', timeRange],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/portfolio/stats?period=${timeRange}`);
      return response.json();
    },
  });

  // Fetch investments
  const {
    data: investments,
    isLoading: isLoadingInvestments,
    isError: isErrorInvestments,
  } = useQuery<InvestmentSummary[]>({
    queryKey: ['/api/portfolio/investments', timeRange, selectedPropertyTypes],
    queryFn: async () => {
      const types = selectedPropertyTypes.join(',');
      const response = await apiRequest(
        'GET',
        `/api/portfolio/investments?period=${timeRange}&types=${types}`
      );
      return response.json();
    },
  });

  // Fetch portfolio allocation
  const {
    data: allocation,
    isLoading: isLoadingAllocation,
    isError: isErrorAllocation,
  } = useQuery<PortfolioAllocation[]>({
    queryKey: ['/api/portfolio/allocation', selectedPropertyTypes],
    queryFn: async () => {
      const types = selectedPropertyTypes.join(',');
      const response = await apiRequest('GET', `/api/portfolio/allocation?types=${types}`);
      return response.json();
    },
  });

  // Fetch monthly performance
  const {
    data: performance,
    isLoading: isLoadingPerformance,
    isError: isErrorPerformance,
  } = useQuery<MonthlyPerformance[]>({
    queryKey: ['/api/portfolio/performance', timeRange],
    queryFn: async () => {
      const response = await apiRequest(
        'GET',
        `/api/portfolio/performance?period=${timeRange}`
      );
      return response.json();
    },
  });

  // Fetch return history
  const {
    data: returnHistory,
    isLoading: isLoadingReturns,
    isError: isErrorReturns,
  } = useQuery<ReturnHistory[]>({
    queryKey: ['/api/portfolio/returns', timeRange],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/portfolio/returns?period=${timeRange}`);
      return response.json();
    },
  });

  // Fetch investment alerts
  const {
    data: alerts,
    isLoading: isLoadingAlerts,
    isError: isErrorAlerts,
  } = useQuery<InvestmentAlert[]>({
    queryKey: ['/api/portfolio/alerts'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/portfolio/alerts');
      return response.json();
    },
  });

  // Property types for filtering
  const propertyTypes = [
    { label: 'Residential', value: 'residential' },
    { label: 'Commercial', value: 'commercial' },
    { label: 'Industrial', value: 'industrial' },
    { label: 'Land', value: 'land' },
  ];

  // Handle property type filtering
  const togglePropertyType = (type: string) => {
    if (selectedPropertyTypes.includes(type)) {
      setSelectedPropertyTypes(selectedPropertyTypes.filter((t) => t !== type));
    } else {
      setSelectedPropertyTypes([...selectedPropertyTypes, type]);
    }
  };

  // Loading state for the entire page
  if (
    isLoadingStats &&
    isLoadingInvestments &&
    isLoadingAllocation &&
    isLoadingPerformance &&
    isLoadingReturns
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-lg">Loading portfolio data...</p>
      </div>
    );
  }

  // Error state for critical data
  if (isErrorStats || isErrorInvestments || isErrorAllocation) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Unable to load portfolio data</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          We encountered an error while fetching your portfolio information. Please try again later.
        </p>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    );
  }

  // Get the colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#83a6ed'];

  // Get alert priority color
  const getAlertPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-50';
      case 'medium':
        return 'text-amber-500 bg-amber-50';
      case 'low':
        return 'text-emerald-500 bg-emerald-50';
      default:
        return 'text-blue-500 bg-blue-50';
    }
  };

  // Get investment status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-500 border-emerald-200 bg-emerald-50';
      case 'pending':
        return 'text-amber-500 border-amber-200 bg-amber-50';
      case 'completed':
        return 'text-blue-500 border-blue-200 bg-blue-50';
      default:
        return 'text-gray-500 border-gray-200 bg-gray-50';
    }
  };

  // Get ROI trend color and icon
  const getRoiTrend = (roi: number) => {
    if (roi > 0) {
      return {
        color: 'text-emerald-500',
        icon: <ArrowUpRight className="h-4 w-4" />,
      };
    } else if (roi < 0) {
      return {
        color: 'text-red-500',
        icon: <ArrowDownRight className="h-4 w-4" />,
      };
    } else {
      return {
        color: 'text-muted-foreground',
        icon: null,
      };
    }
  };

  return (
    <div className="container py-10 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Investment Portfolio</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your real estate investments
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Property Types</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {propertyTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type.value}
                  checked={selectedPropertyTypes.includes(type.value)}
                  onCheckedChange={() => togglePropertyType(type.value)}
                >
                  {type.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                <Calendar className="h-4 w-4 mr-2" />
                {timeRange === '1m'
                  ? 'Last Month'
                  : timeRange === '3m'
                  ? 'Last 3 Months'
                  : timeRange === '6m'
                  ? 'Last 6 Months'
                  : timeRange === '1y'
                  ? 'Last Year'
                  : 'All Time'}
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTimeRange('1m')}>
                Last Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('3m')}>
                Last 3 Months
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('6m')}>
                Last 6 Months
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('1y')}>
                Last Year
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('all')}>
                All Time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" className="h-9">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Portfolio Summary Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioStats ? formatCurrency(portfolioStats.totalInvested) : '₦0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {portfolioStats?.activeInvestments || 0} active investments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioStats ? formatCurrency(portfolioStats.currentValue) : '₦0'}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              {portfolioStats && portfolioStats.portfolioGrowth > 0 ? (
                <>
                  <span className="text-emerald-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {formatPercentage(portfolioStats.portfolioGrowth)}
                  </span>
                  <span className="ml-1">from investment</span>
                </>
              ) : portfolioStats && portfolioStats.portfolioGrowth < 0 ? (
                <>
                  <span className="text-red-500 flex items-center">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    {formatPercentage(Math.abs(portfolioStats.portfolioGrowth))}
                  </span>
                  <span className="ml-1">from investment</span>
                </>
              ) : (
                'No change from investment'
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 22V8M5 12H2a10 10 0 0 0 20 0h-3" />
              <path d="M22 4.18v.27a10 10 0 0 1-20 0v-.27a10 10 0 0 1 20 0Z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioStats ? formatCurrency(portfolioStats.totalReturns) : '₦0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {portfolioStats ? formatPercentage(portfolioStats.averageROI) : '0%'} average ROI
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Health</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioStats ? `${portfolioStats.portfolioHealthScore}%` : '0%'}
            </div>
            <Progress
              value={portfolioStats?.portfolioHealthScore || 0}
              className="h-2"
              indicatorClassName={
                (portfolioStats?.portfolioHealthScore || 0) > 80
                  ? 'bg-emerald-500'
                  : (portfolioStats?.portfolioHealthScore || 0) > 50
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Content - Left Side (2 Columns) */}
        <div className="space-y-8 md:col-span-2">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Investment Performance</CardTitle>
                  <CardDescription>
                    Track how your investments have performed over time
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Chart Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked id="show-benchmark" />
                      <label htmlFor="show-benchmark">Show Benchmark</label>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked id="show-returns" />
                      <label htmlFor="show-returns">Show Returns</label>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoadingPerformance ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isErrorPerformance ? (
                <div className="flex justify-center items-center h-64 text-center">
                  <div>
                    <AlertCircle className="h-12 w-12 text-destructive mb-2 mx-auto" />
                    <p>Failed to load performance data</p>
                  </div>
                </div>
              ) : !performance || performance.length === 0 ? (
                <div className="flex justify-center items-center h-64 text-center">
                  <div>
                    <p className="text-muted-foreground">No performance data available</p>
                  </div>
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={performance}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        tickFormatter={(value) => `₦${value / 1000}k`}
                      />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="returns"
                        stroke="#0088FE"
                        fillOpacity={1}
                        fill="url(#colorReturns)"
                        name="Your Returns"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="benchmark"
                        stroke="#82ca9d"
                        fillOpacity={1}
                        fill="url(#colorBenchmark)"
                        name="Market Benchmark"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              *Benchmark based on Nigerian Real Estate Market Index
            </CardFooter>
          </Card>

          {/* Investment List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Investments</CardTitle>
                  <CardDescription>
                    A summary of all your property investments
                  </CardDescription>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[160px] h-8">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Investments</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingInvestments ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isErrorInvestments ? (
                <div className="flex justify-center items-center h-64 text-center">
                  <div>
                    <AlertCircle className="h-12 w-12 text-destructive mb-2 mx-auto" />
                    <p>Failed to load investment data</p>
                  </div>
                </div>
              ) : !investments || investments.length === 0 ? (
                <div className="flex flex-col justify-center items-center py-8 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No investments yet</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                    Start your real estate journey by investing in a property
                  </p>
                  <Button>Browse Properties</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead>ROI</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Investment Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {investments.map((investment) => (
                        <TableRow key={investment.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 rounded">
                                <AvatarImage src={investment.propertyImage} alt={investment.propertyName} />
                                <AvatarFallback>
                                  {investment.propertyName.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{investment.propertyName}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {investment.propertyType} • {investment.propertyLocation}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(investment.investmentAmount)}
                          </TableCell>
                          <TableCell>{formatCurrency(investment.currentValue)}</TableCell>
                          <TableCell>
                            <div
                              className={`flex items-center ${
                                getRoiTrend(investment.roi).color
                              }`}
                            >
                              {getRoiTrend(investment.roi).icon}
                              <span className="ml-1">{formatPercentage(investment.roi)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`capitalize ${getStatusColor(investment.status)}`}
                            >
                              {investment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(investment.investmentDate)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {investments?.length || 0} of {investments?.length || 0} investments
              </p>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Main Content - Right Side (1 Column) */}
        <div className="space-y-8">
          {/* Portfolio Allocation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Portfolio Allocation</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant={chartType === 'pie' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setChartType('pie')}
                  >
                    <PieChartIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === 'bar' ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setChartType('bar')}
                  >
                    <BarChartIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Distribution of your investments by property type
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              {isLoadingAllocation ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isErrorAllocation ? (
                <div className="flex justify-center items-center h-64 text-center">
                  <div>
                    <AlertCircle className="h-12 w-12 text-destructive mb-2 mx-auto" />
                    <p>Failed to load allocation data</p>
                  </div>
                </div>
              ) : !allocation || allocation.length === 0 ? (
                <div className="flex justify-center items-center h-64 text-center">
                  <div>
                    <p className="text-muted-foreground">No allocation data available</p>
                  </div>
                </div>
              ) : chartType === 'pie' ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocation}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="type"
                      >
                        {allocation.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={allocation}
                      layout="vertical"
                      margin={{ top: 5, right: 5, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <YAxis dataKey="type" type="category" axisLine={false} tickLine={false} width={100} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="percentage" fill="#8884d8" name="Percentage">
                        {allocation.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="grid grid-cols-2 gap-2 w-full">
                {allocation?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                      ></div>
                      <span>{item.type}</span>
                    </div>
                    <span>{formatPercentage(item.percentage * 100)}</span>
                  </div>
                ))}
              </div>
            </CardFooter>
          </Card>

          {/* Return History */}
          <Card>
            <CardHeader>
              <CardTitle>Return History</CardTitle>
              <CardDescription>Recent payments from your investments</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReturns ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isErrorReturns ? (
                <div className="flex justify-center items-center h-40 text-center">
                  <div>
                    <AlertCircle className="h-8 w-8 text-destructive mb-2 mx-auto" />
                    <p className="text-sm">Failed to load return data</p>
                  </div>
                </div>
              ) : !returnHistory || returnHistory.length === 0 ? (
                <div className="flex justify-center items-center h-40 text-center">
                  <p className="text-sm text-muted-foreground">No return history available</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {returnHistory.slice(0, 5).map((returnItem, index) => (
                    <div key={index} className="flex items-start">
                      <div
                        className={`mr-4 rounded-full p-2 ${
                          returnItem.type === 'dividend'
                            ? 'bg-green-100 text-green-600'
                            : returnItem.type === 'interest'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-amber-100 text-amber-600'
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {returnItem.type === 'dividend'
                            ? 'Dividend Payment'
                            : returnItem.type === 'interest'
                            ? 'Interest Payment'
                            : 'Capital Gain'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {returnItem.propertyName}
                        </p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-sm font-medium">{formatCurrency(returnItem.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(returnItem.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Returns
              </Button>
            </CardFooter>
          </Card>

          {/* Alerts and Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Alerts</CardTitle>
              <CardDescription>Important updates about your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAlerts ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isErrorAlerts ? (
                <div className="flex justify-center items-center h-40 text-center">
                  <div>
                    <AlertCircle className="h-8 w-8 text-destructive mb-2 mx-auto" />
                    <p className="text-sm">Failed to load alerts</p>
                  </div>
                </div>
              ) : !alerts || alerts.length === 0 ? (
                <div className="flex justify-center items-center h-40 text-center">
                  <p className="text-sm text-muted-foreground">No alerts at this time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start p-3 rounded-lg ${
                        alert.read ? 'bg-muted/30' : 'bg-muted/50'
                      }`}
                    >
                      <div
                        className={`rounded-full p-2 mr-4 ${getAlertPriorityColor(alert.priority)}`}
                      >
                        {alert.type === 'opportunity' ? (
                          <Building2 className="h-4 w-4" />
                        ) : alert.type === 'maturity' ? (
                          <Calendar className="h-4 w-4" />
                        ) : alert.type === 'payment' ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{formatDate(alert.date)}</p>
                          {alert.propertyName && (
                            <Badge variant="outline" className="text-xs">
                              {alert.propertyName}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Alerts
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDashboardPage;