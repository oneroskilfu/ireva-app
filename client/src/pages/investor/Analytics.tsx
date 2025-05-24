import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import InvestorLayout from '@/components/layouts/InvestorLayout-new';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart as LineChartIcon, 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  BarChart as BarChartIcon, 
  Map, 
  Building 
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';

// Import mock components for the charts that would be replaced with actual chart libraries
// Sample portfolio value data
const portfolioValueData = [
  { date: 'Jan', value: 9500000 },
  { date: 'Feb', value: 9800000 },
  { date: 'Mar', value: 10200000 },
  { date: 'Apr', value: 10500000 },
  { date: 'May', value: 11000000 },
  { date: 'Jun', value: 11800000 },
  { date: 'Jul', value: 12100000 },
  { date: 'Aug', value: 12300000 },
  { date: 'Sep', value: 12500000 },
];

const LineChartComponent = ({ title, description, data, dataKey, xAxisKey, valuePrefix = '', valueSuffix = '' }) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Select defaultValue="6months">
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{fontSize: 12}} 
              stroke="#718096"
            />
            <YAxis 
              tick={{fontSize: 12}} 
              stroke="#718096"
              tickFormatter={(value) => 
                valuePrefix + value.toLocaleString() + valueSuffix
              }
            />
            <Tooltip 
              formatter={(value) => [
                valuePrefix + value.toLocaleString() + valueSuffix,
                "Value"
              ]}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke="#8884d8" 
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
            <Line 
              type="monotone" 
              dataKey="benchmark" 
              stroke="#82ca9d" 
              strokeWidth={2}
              activeDot={{ r: 8 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

// Sample monthly returns data
const monthlyReturnsData = [
  { month: 'Jan', returns: 125000, benchmark: 120000 },
  { month: 'Feb', returns: 125000, benchmark: 120000 },
  { month: 'Mar', returns: 130000, benchmark: 122000 },
  { month: 'Apr', returns: 128000, benchmark: 123000 },
  { month: 'May', returns: 132000, benchmark: 125000 },
  { month: 'Jun', returns: 135000, benchmark: 128000 },
];

const BarChartComponent = ({ title, description, data, dataKey, xAxisKey, valuePrefix = '', valueSuffix = '' }) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Select defaultValue="monthly">
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{fontSize: 12}} 
              stroke="#718096"
            />
            <YAxis 
              tick={{fontSize: 12}} 
              stroke="#718096"
              tickFormatter={(value) => 
                valuePrefix + value.toLocaleString() + valueSuffix
              }
            />
            <Tooltip 
              formatter={(value) => [
                valuePrefix + value.toLocaleString() + valueSuffix,
                "Value"
              ]}
            />
            <Legend />
            <Bar 
              dataKey={dataKey} 
              name="Returns" 
              fill="#8884d8" 
              radius={[4, 4, 0, 0]}
            />
            {data[0]?.benchmark && (
              <Bar 
                dataKey="benchmark" 
                name="Benchmark" 
                fill="#82ca9d" 
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

// Sample portfolio allocation data
const allocationData = [
  { name: 'Residential', value: 45 },
  { name: 'Commercial', value: 30 },
  { name: 'Mixed-use', value: 15 },
  { name: 'Industrial', value: 10 },
];

// Colors for pie chart sections
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const PieChartComponent = ({ title, description, data }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

const MockMapView = ({ title, description }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[300px] flex items-center justify-center bg-muted rounded-md">
        <div className="flex flex-col items-center">
          <Map className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Map view will be displayed here</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Performance metrics component
const PerformanceMetrics = ({ portfolioData }) => {
  const metrics = [
    {
      title: "Total Portfolio Value",
      value: "₦12,500,000",
      change: "+12.5%",
      isPositive: true,
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      title: "Total Earnings YTD",
      value: "₦1,250,000",
      change: "+8.3%",
      isPositive: true,
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      title: "Average Annual Return",
      value: "14.2%",
      change: "+2.1%",
      isPositive: true,
      icon: <BarChart className="h-5 w-5" />
    },
    {
      title: "Number of Properties",
      value: "5",
      change: "+1",
      isPositive: true,
      icon: <Building className="h-5 w-5" />
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
                <div className={`flex items-center mt-1 ${metric.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {metric.isPositive ? 
                    <TrendingUp className="h-4 w-4 mr-1" /> : 
                    <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" />
                  }
                  <span className="text-sm">{metric.change}</span>
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                {metric.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Portfolio allocation component
const PortfolioAllocation = ({ investments, properties }) => {
  // Sample data - would be calculated from actual investments
  const allocations = [
    { category: "Residential", percentage: 45, value: "₦5,625,000" },
    { category: "Commercial", percentage: 30, value: "₦3,750,000" },
    { category: "Mixed-use", percentage: 15, value: "₦1,875,000" },
    { category: "Industrial", percentage: 10, value: "₦1,250,000" }
  ];
  
  const locations = [
    { location: "Lagos", percentage: 60, value: "₦7,500,000" },
    { location: "Abuja", percentage: 25, value: "₦3,125,000" },
    { location: "Port Harcourt", percentage: 10, value: "₦1,250,000" },
    { location: "Other", percentage: 5, value: "₦625,000" }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Allocation by Property Type</CardTitle>
          <CardDescription>Distribution of your investments across property types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center bg-muted rounded-md mb-4">
            <div className="flex flex-col items-center">
              <PieChart className="h-12 w-12 text-muted-foreground mb-2" />
            </div>
          </div>
          
          <div className="space-y-4">
            {allocations.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{item.category}</span>
                  <span className="text-sm font-medium">{item.value} ({item.percentage}%)</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Allocation by Location</CardTitle>
          <CardDescription>Distribution of your investments across locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center bg-muted rounded-md mb-4">
            <div className="flex flex-col items-center">
              <Map className="h-12 w-12 text-muted-foreground mb-2" />
            </div>
          </div>
          
          <div className="space-y-4">
            {locations.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{item.location}</span>
                  <span className="text-sm font-medium">{item.value} ({item.percentage}%)</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Cash flow analysis component
const CashFlowAnalysis = () => {
  // Sample cash flow data
  const monthlyReturns = [
    { month: "Jan", returns: 125000 },
    { month: "Feb", returns: 125000 },
    { month: "Mar", returns: 130000 },
    { month: "Apr", returns: 128000 },
    { month: "May", returns: 132000 },
    { month: "Jun", returns: 135000 }
  ];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Monthly Cash Flow</CardTitle>
            <CardDescription>Monthly returns from your investment portfolio</CardDescription>
          </div>
          <Select defaultValue="6months">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyReturns}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="month" 
                tick={{fontSize: 12}} 
                stroke="#718096"
              />
              <YAxis 
                tick={{fontSize: 12}} 
                stroke="#718096"
                tickFormatter={(value) => 
                  "₦" + value.toLocaleString()
                }
              />
              <Tooltip 
                formatter={(value) => [
                  "₦" + value.toLocaleString(),
                  "Returns"
                ]}
              />
              <Bar 
                dataKey="returns" 
                name="Monthly Returns" 
                fill="#8884d8" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Month</th>
                <th className="text-right py-3 px-4 font-medium">Returns</th>
                <th className="text-right py-3 px-4 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {monthlyReturns.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-4">{item.month}</td>
                  <td className="py-3 px-4 text-right">₦{item.returns.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    {index > 0 ? (
                      <span className={
                        item.returns > monthlyReturns[index - 1].returns 
                          ? "text-emerald-500" 
                          : item.returns < monthlyReturns[index - 1].returns 
                            ? "text-red-500" 
                            : ""
                      }>
                        {item.returns > monthlyReturns[index - 1].returns ? "+" : ""}
                        {(((item.returns - monthlyReturns[index - 1].returns) / monthlyReturns[index - 1].returns) * 100).toFixed(1)}%
                      </span>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// Investment comparison component
const InvestmentComparison = ({ investments, properties }) => {
  // Sample comparison data
  const propertyPerformance = [
    { name: "Skyline Apartments", return: 15.2, benchmark: 12.5 },
    { name: "Heritage Heights", return: 13.8, benchmark: 12.5 },
    { name: "Lekki Gardens", return: 11.9, benchmark: 12.5 },
    { name: "Victoria Crest", return: 14.5, benchmark: 12.5 },
    { name: "Royal Palms", return: 10.8, benchmark: 12.5 }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Performance Comparison</CardTitle>
        <CardDescription>Compare the performance of your investments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={propertyPerformance}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
              <XAxis 
                type="number"
                tick={{fontSize: 12}} 
                stroke="#718096"
                domain={[0, 20]}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                dataKey="name"
                type="category"
                tick={{fontSize: 12}} 
                stroke="#718096"
                width={120}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, ""]}
              />
              <Legend />
              <Bar 
                dataKey="return" 
                name="Actual Return" 
                fill="#8884d8" 
                radius={[0, 4, 4, 0]}
              />
              <Bar 
                dataKey="benchmark" 
                name="Target Return" 
                fill="#82ca9d" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-4">
          {propertyPerformance.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{item.name}</span>
                <span className="text-sm font-medium">
                  {item.return}% 
                  <span className={
                    item.return > item.benchmark 
                      ? "text-emerald-500 ml-2" 
                      : "text-red-500 ml-2"
                  }>
                    ({item.return > item.benchmark ? "+" : ""}
                    {(item.return - item.benchmark).toFixed(1)}%)
                  </span>
                </span>
              </div>
              <div className="flex">
                <div className="flex-1">
                  <Progress value={item.return * 5} className="h-2 bg-gray-100" />
                </div>
                <div className="w-px bg-gray-200 mx-2"></div>
                <div className="flex-1">
                  <Progress value={item.benchmark * 5} className="h-2 bg-gray-100" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Actual Return</span>
                <span>Target Return</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Projected future value component
const ProjectedFutureValue = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projected Future Value</CardTitle>
        <CardDescription>Estimated future value of your portfolio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { year: 2025, value: 12500000 },
                { year: 2026, value: 14125000 },
                { year: 2027, value: 16243750 },
                { year: 2028, value: 18562500 },
                { year: 2029, value: 21346875 },
                { year: 2030, value: 25000000 }
              ]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="year" 
                tick={{fontSize: 12}} 
                stroke="#718096"
              />
              <YAxis 
                tick={{fontSize: 12}} 
                stroke="#718096"
                tickFormatter={(value) => 
                  `₦${(value / 1000000).toFixed(1)}M`
                }
              />
              <Tooltip 
                formatter={(value) => [
                  `₦${value.toLocaleString()}`,
                  "Projected Value"
                ]}
                labelFormatter={(label) => `Year: ${label}`}
              />
              <ReferenceLine 
                y={12500000} 
                stroke="#ff0000" 
                strokeDasharray="3 3" 
                label={{ value: "Current Value", position: "insideTopLeft", fill: "#ff0000", fontSize: 12 }} 
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                name="Projected Value" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
              <Brush dataKey="year" height={30} stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">1 Year Projection</div>
              <div className="text-lg font-semibold">₦14,125,000</div>
              <div className="text-xs text-emerald-500">+13% growth</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">3 Year Projection</div>
              <div className="text-lg font-semibold">₦18,562,500</div>
              <div className="text-xs text-emerald-500">+48.5% growth</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">5 Year Projection</div>
              <div className="text-lg font-semibold">₦25,000,000</div>
              <div className="text-xs text-emerald-500">+100% growth</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

// Main analytics component
const InvestorAnalytics = () => {
  // Fetch user's investments
  const { data: investments } = useQuery({
    queryKey: ['/api/investments'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/investments');
      return await res.json();
    }
  });
  
  // Fetch properties
  const { data: properties } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/properties');
      return await res.json();
    }
  });
  
  return (
    <InvestorLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Investment Analytics</h1>
            <p className="text-muted-foreground">Comprehensive analysis of your investment portfolio</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Custom Range
            </Button>
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
        
        {/* Performance metrics cards */}
        <div className="mb-6">
          <PerformanceMetrics portfolioData={{}} />
        </div>
        
        {/* Analytics tabs */}
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList className="grid grid-cols-1 md:grid-cols-4 w-full">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="allocation">
              <PieChart className="h-4 w-4 mr-2" />
              Portfolio Allocation
            </TabsTrigger>
            <TabsTrigger value="cashflow">
              <LineChart className="h-4 w-4 mr-2" />
              Cash Flow
            </TabsTrigger>
            <TabsTrigger value="comparison">
              <BarChart className="h-4 w-4 mr-2" />
              Performance Comparison
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <LineChartComponent 
                title="Portfolio Value Over Time" 
                description="Track how your portfolio value has changed"
                data={portfolioValueData}
                dataKey="value"
                xAxisKey="date"
                valuePrefix="₦"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BarChartComponent 
                  title="Monthly Returns" 
                  description="Your monthly investment returns"
                  data={monthlyReturnsData}
                  dataKey="returns"
                  xAxisKey="month"
                  valuePrefix="₦"
                />
                <PieChartComponent 
                  title="Portfolio Composition" 
                  description="Breakdown of your investment portfolio"
                  data={allocationData}
                />
              </div>
              
              <ProjectedFutureValue />
            </div>
          </TabsContent>
          
          <TabsContent value="allocation" className="mt-6">
            <div className="space-y-6">
              <PortfolioAllocation investments={investments} properties={properties} />
              
              <MockMapView 
                title="Geographic Distribution" 
                description="Where your properties are located" 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="cashflow" className="mt-6">
            <div className="space-y-6">
              <CashFlowAnalysis />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BarChartComponent 
                  title="Income by Property" 
                  description="Monthly income distribution by property"
                  data={[
                    { property: "Skyline Apartments", income: 180000 },
                    { property: "Heritage Heights", income: 150000 },
                    { property: "Victoria Crest", income: 120000 },
                    { property: "Royal Palms", income: 90000 },
                    { property: "Lekki Gardens", income: 70000 }
                  ]}
                  dataKey="income"
                  xAxisKey="property"
                  valuePrefix="₦"
                />
                <LineChartComponent 
                  title="Cumulative Returns" 
                  description="Your cumulative returns over time"
                  data={[
                    { month: 'Jan', cumulative: 125000 },
                    { month: 'Feb', cumulative: 250000 },
                    { month: 'Mar', cumulative: 380000 },
                    { month: 'Apr', cumulative: 508000 },
                    { month: 'May', cumulative: 640000 },
                    { month: 'Jun', cumulative: 775000 }
                  ]}
                  dataKey="cumulative"
                  xAxisKey="month"
                  valuePrefix="₦"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="comparison" className="mt-6">
            <div className="space-y-6">
              <InvestmentComparison investments={investments} properties={properties} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BarChartComponent 
                  title="ROI Comparison" 
                  description="ROI comparison against benchmarks"
                  data={[
                    { category: "Residential", roi: 12.5, benchmark: 10.2 },
                    { category: "Commercial", roi: 14.2, benchmark: 11.3 },
                    { category: "Mixed-use", roi: 13.8, benchmark: 10.8 },
                    { category: "Industrial", roi: 11.5, benchmark: 9.5 }
                  ]}
                  dataKey="roi"
                  xAxisKey="category"
                  valueSuffix="%"
                />
                <LineChartComponent 
                  title="Performance vs Market" 
                  description="Your portfolio performance vs market indices"
                  data={[
                    { month: 'Jan', portfolio: 12.5, market: 10.2 },
                    { month: 'Feb', portfolio: 12.8, market: 10.5 },
                    { month: 'Mar', portfolio: 13.2, market: 10.8 },
                    { month: 'Apr', portfolio: 13.5, market: 11.0 },
                    { month: 'May', portfolio: 14.1, market: 11.3 },
                    { month: 'Jun', portfolio: 14.5, market: 11.5 }
                  ]}
                  dataKey="portfolio"
                  xAxisKey="month"
                  valueSuffix="%"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </InvestorLayout>
  );
};

export default InvestorAnalytics;