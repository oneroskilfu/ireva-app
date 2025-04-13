import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Property, Investment } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  DollarSign, 
  BarChart3, 
  PieChart as PieChartIcon,
  Download,
  Calendar,
  Timer,
  BarChart4,
  Building,
  LineChart as LineChartIcon,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface AnalyticsProps {
  investments: (Investment & {property: Property})[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdvancedAnalytics({ investments }: AnalyticsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('performance');
  const [timeframe, setTimeframe] = useState('1y');

  // Portfolio Performance Analytics
  const portfolioPerformanceQuery = useQuery({
    queryKey: ['/api/analytics/portfolio-performance'],
    enabled: !!user
  });

  // Investment Projections
  const investmentProjectionsQuery = useQuery({
    queryKey: ['/api/analytics/investment-projections'],
    enabled: !!user
  });

  // Investment Risk Analysis
  const investmentRiskQuery = useQuery({
    queryKey: ['/api/analytics/investment-risk'],
    enabled: !!user
  });

  const handleDownloadData = (dataType: string) => {
    let data;
    let filename;

    if (dataType === 'performance') {
      data = portfolioPerformanceQuery.data;
      filename = 'portfolio-performance.json';
    } else if (dataType === 'projections') {
      data = investmentProjectionsQuery.data;
      filename = 'investment-projections.json';
    } else if (dataType === 'risk') {
      data = investmentRiskQuery.data;
      filename = 'investment-risk-analysis.json';
    } else {
      return;
    }

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download Complete',
      description: `${filename} has been downloaded to your device.`,
    });
  };

  // Loading states and error handling
  if (portfolioPerformanceQuery.isLoading || investmentProjectionsQuery.isLoading || investmentRiskQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3">Loading analytics data...</span>
      </div>
    );
  }

  // Error states
  const hasError = portfolioPerformanceQuery.isError || investmentProjectionsQuery.isError || investmentRiskQuery.isError;
  
  if (hasError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center p-4">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-700">Unable to Load Analytics</h3>
            <p className="text-red-600 mt-2">There was a problem loading your investment analytics. Please try again later.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                portfolioPerformanceQuery.refetch();
                investmentProjectionsQuery.refetch();
                investmentRiskQuery.refetch();
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for charts
  const performanceData = portfolioPerformanceQuery.data || {
    totalInvested: 0,
    totalReturns: 0,
    roi: 0,
    assetAllocation: [],
    monthlyPerformance: [],
    investmentCount: 0
  };

  const projectionsData = investmentProjectionsQuery.data || [
    { year: 1, projectedValue: 0, projectedReturn: 0, annualReturnRate: 0 }
  ];

  const riskData = investmentRiskQuery.data || {
    investments: [],
    overallRiskScore: 0,
    riskLevel: 'Unknown',
    diversificationScore: 0
  };

  // Format asset allocation data for pie chart
  const assetAllocationData = performanceData.assetAllocation || [];

  // Format monthly performance data
  const monthlyPerformanceData = performanceData.monthlyPerformance || [];

  // Format risk data for radar chart
  const riskMetricsData = riskData.investments?.map(inv => ({
    name: inv.propertyName,
    riskScore: inv.riskScore,
    amount: inv.amount,
    diversification: inv.diversificationImpact
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advanced Investment Analytics</h2>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6m">6 Months</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
            <SelectItem value="5y">5 Years</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        {/* Portfolio Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <DollarSign className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-gray-500">Total Invested</p>
                  <p className="text-2xl font-bold">${performanceData.totalInvested?.toLocaleString() || '0'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Across {performanceData.investmentCount || 0} investments
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <BarChart3 className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-gray-500">Total Returns</p>
                  <p className="text-2xl font-bold">${performanceData.totalReturns?.toLocaleString() || '0'}</p>
                  <div className="flex items-center text-sm mt-1 text-emerald-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {performanceData.roi?.toFixed(2) || '0'}% ROI
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <PieChartIcon className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-gray-500">Asset Allocation</p>
                  <p className="text-2xl font-bold">{assetAllocationData.length || 0} Types</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Diversification level: {assetAllocationData.length > 2 ? 'Good' : 'Needs improvement'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Distribution of investments by property type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetAllocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="type"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {assetAllocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [`$${Number(value).toLocaleString()}`, props.payload.type]} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-gray-500">
                  <Calendar className="h-4 w-4 inline-block mr-1" />
                  As of {new Date().toLocaleDateString()}
                </p>
                <Button variant="outline" size="sm" onClick={() => handleDownloadData('performance')}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </CardFooter>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Monthly Returns</CardTitle>
                <CardDescription>Return rates over the past 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Return Rate']} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="return"
                        stroke="#3b82f6"
                        activeDot={{ r: 8 }}
                        name="Return Rate"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="ghost" size="sm">
                  View Detailed Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Investment Projections Tab */}
        <TabsContent value="projections" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <BarChart4 className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-gray-500">5-Yr Projected Value</p>
                  <p className="text-2xl font-bold">
                    ${projectionsData[4]?.projectedValue.toLocaleString() || '0'}
                  </p>
                  <div className="flex items-center text-sm mt-1 text-emerald-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {projectionsData[4]?.annualReturnRate.toFixed(1) || '0'}% annual return
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Timer className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-gray-500">Time to Double</p>
                  <p className="text-2xl font-bold">
                    {Math.round(72 / (projectionsData[0]?.annualReturnRate || 8))} years
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on Rule of 72
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Building className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-gray-500">Total Projected Gain</p>
                  <p className="text-2xl font-bold">
                    ${projectionsData[4]?.projectedReturn.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Over 5 years
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Investment Growth Projection</CardTitle>
                  <CardDescription>Estimated 5-year growth trajectory</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleDownloadData('projections')}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={projectionsData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                      labelFormatter={(value) => `Year ${value}`}
                    />
                    <Legend />
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="projectedValue"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      name="Projected Value"
                    />
                    <ReferenceLine
                      y={performanceData.totalInvested}
                      label="Initial Investment"
                      stroke="#666"
                      strokeDasharray="3 3"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-5 gap-2 mt-6">
                {projectionsData.map((projection) => (
                  <div key={projection.year} className="p-3 bg-gray-50 rounded-md text-center">
                    <p className="text-sm font-medium">Year {projection.year}</p>
                    <p className="text-lg font-bold">${projection.projectedValue.toLocaleString()}</p>
                    <p className="text-xs text-emerald-600">
                      +${projection.projectedReturn.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full text-sm text-gray-500">
                <p className="italic">
                  Projections are based on an estimated annual return rate of {projectionsData[0]?.annualReturnRate}%.
                  Actual results may vary.
                </p>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Return Scenarios</CardTitle>
              <CardDescription>Conservative, expected, and optimistic projections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      type="category"
                      domain={[1, 5]}
                      allowDecimals={false}
                      tickCount={5}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Legend />
                    <Line
                      data={projectionsData.map(p => ({
                        year: p.year,
                        value: performanceData.totalInvested * Math.pow(1 + 0.06, p.year)
                      }))}
                      name="Conservative (6%)"
                      type="monotone"
                      dataKey="value"
                      stroke="#ef4444"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      data={projectionsData}
                      name="Expected (8%)"
                      type="monotone"
                      dataKey="projectedValue"
                      stroke="#3b82f6"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      data={projectionsData.map(p => ({
                        year: p.year,
                        value: performanceData.totalInvested * Math.pow(1 + 0.10, p.year)
                      }))}
                      name="Optimistic (10%)"
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <AlertCircle className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-gray-500">Overall Risk Score</p>
                  <p className="text-2xl font-bold">{riskData.overallRiskScore?.toFixed(1) || '0'}/10</p>
                  <Badge 
                    className={`mt-1 ${
                      riskData.riskLevel === 'Low' 
                        ? 'bg-green-100 text-green-800' 
                        : riskData.riskLevel === 'Moderate' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {riskData.riskLevel} Risk
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <LineChartIcon className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-gray-500">Diversification Score</p>
                  <p className="text-2xl font-bold">{riskData.diversificationScore?.toFixed(0) || '0'}/100</p>
                  <div className="w-full mt-2">
                    <Progress value={riskData.diversificationScore || 0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <TrendingDown className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-gray-500">Risk-Adjusted Return</p>
                  <p className="text-2xl font-bold">
                    {(performanceData.roi / (riskData.overallRiskScore || 1)).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Return per unit of risk
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Analysis by Investment</CardTitle>
                <CardDescription>Risk metrics for individual properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="riskScore" 
                        name="Risk Score" 
                        domain={[0, 10]} 
                        label={{ value: 'Risk Score', position: 'bottom', offset: 0 }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="amount" 
                        name="Investment Amount" 
                        label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'Risk Score') return [value, name];
                          if (name === 'Investment Amount') return [`$${Number(value).toLocaleString()}`, name];
                          return [value, name];
                        }}
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded shadow-md">
                                <p className="font-bold">{data.name}</p>
                                <p>Risk Score: {data.riskScore}/10</p>
                                <p>Amount: ${data.amount.toLocaleString()}</p>
                                <p>Diversification: {data.diversification.toFixed(1)}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter 
                        name="Properties" 
                        data={riskMetricsData} 
                        fill="#3b82f6"
                      >
                        {riskMetricsData.map((entry, index) => {
                          // Color based on risk level
                          let color = '#10b981'; // low risk (green)
                          if (entry.riskScore > 6) color = '#ef4444'; // high risk (red)
                          else if (entry.riskScore > 3) color = '#f59e0b'; // medium risk (amber)
                          
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-4 text-sm">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                    <span>Low Risk</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-amber-500 mr-1"></span>
                    <span>Medium Risk</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                    <span>High Risk</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleDownloadData('risk')}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Profile</CardTitle>
                <CardDescription>Distribution of investments by risk category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={riskMetricsData.slice(0, 5)}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} />
                      <Radar
                        name="Risk Score"
                        dataKey="riskScore"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.5}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full space-y-2">
                  <h4 className="font-medium">Risk Mitigation Recommendations</h4>
                  <ul className="space-y-1 text-sm">
                    {riskData.overallRiskScore > 5 && (
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Consider diversifying across more property types to reduce portfolio risk.</span>
                      </li>
                    )}
                    {(riskData.investments || []).some(inv => inv.riskScore > 7) && (
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>High-risk investments detected. Balance with lower-risk properties.</span>
                      </li>
                    )}
                    {riskData.diversificationScore < 50 && (
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Improve diversification by investing in different geographic regions.</span>
                      </li>
                    )}
                    {riskData.overallRiskScore <= 5 && riskData.diversificationScore >= 50 && (
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Your portfolio has a well-balanced risk profile. Continue monitoring.</span>
                      </li>
                    )}
                  </ul>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}