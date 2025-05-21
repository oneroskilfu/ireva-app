import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useApiRequest } from '../../hooks/useApiRequest';
import { 
  Card, 
  CardContent, 
  Button, 
  Badge, 
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
} from '../../components/ui/DesignSystem';
import PortfolioDistributionChart from '../../components/charts/PortfolioDistributionChart';
import PerformanceLineChart from '../../components/charts/PerformanceLineChart';
import ROIBarChart from '../../components/charts/ROIBarChart';
import {
  BuildingLibraryIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  PresentationChartLineIcon,
  DocumentTextIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

// Format currency utility
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount));
};

// Define time periods for performance filtering
const TIME_PERIODS = [
  { label: 'Last Month', value: '1m' },
  { label: 'Last 3 Months', value: '3m' },
  { label: 'Last 6 Months', value: '6m' },
  { label: 'Year to Date', value: 'ytd' },
  { label: 'Last Year', value: '1y' },
  { label: 'All Time', value: 'all' }
];

const InvestmentDashboard = () => {
  const { user } = useAuth();
  const api = useApiRequest();
  
  // State for dashboard filters
  const [activeTab, setActiveTab] = useState('overview');
  const [timePeriod, setTimePeriod] = useState('3m');
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch portfolio summary
  const { 
    data: portfolioData,
    isLoading: isLoadingPortfolio,
    error: portfolioError,
    refetch: refetchPortfolio
  } = useQuery({
    queryKey: ['/api/investments/portfolio-summary'],
    queryFn: async () => {
      const response = await api.get('investments/portfolio-summary');
      return response.data.data;
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
  });
  
  // Fetch performance data with time period filter
  const { 
    data: performanceData,
    isLoading: isLoadingPerformance,
    refetch: refetchPerformance
  } = useQuery({
    queryKey: ['/api/investments/performance', timePeriod],
    queryFn: async () => {
      const response = await api.get(`investments/performance?period=${timePeriod}`);
      return response.data.data;
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
  });
  
  // Fetch ROI data
  const { 
    data: roiData,
    isLoading: isLoadingROI,
    refetch: refetchROI
  } = useQuery({
    queryKey: ['/api/investments/roi'],
    queryFn: async () => {
      const response = await api.get('investments/roi');
      return response.data.data;
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
  });
  
  // Format data for portfolio distribution chart
  const getPortfolioDistribution = () => {
    if (!portfolioData || !portfolioData.investments) return [];
    
    // Group investments by property type
    const groupedByType = portfolioData.investments.reduce((acc, investment) => {
      const propertyType = investment.property.propertyType;
      if (!acc[propertyType]) {
        acc[propertyType] = 0;
      }
      acc[propertyType] += Number(investment.amount);
      return acc;
    }, {});
    
    // Convert to chart format
    return Object.entries(groupedByType).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  };
  
  // Format data for performance chart
  const getPerformanceData = () => {
    if (!performanceData || !performanceData.performance) return [];
    return performanceData.performance.map(item => ({
      date: item.date,
      value: Number(item.portfolioValue),
      invested: Number(item.investedAmount)
    }));
  };
  
  // Format data for ROI chart
  const getROIData = () => {
    if (!roiData || !roiData.properties) return [];
    return roiData.properties.map(property => ({
      name: property.name,
      roi: Number(property.roi)
    }));
  };
  
  // Calculate portfolio metrics
  const getPortfolioMetrics = () => {
    if (!portfolioData) {
      return {
        totalInvested: 0,
        portfolioValue: 0,
        totalROI: 0,
        roiPercentage: 0,
        totalProperties: 0,
        activeInvestments: 0
      };
    }
    
    return {
      totalInvested: portfolioData.totalInvested || 0,
      portfolioValue: portfolioData.currentValue || 0,
      totalROI: portfolioData.totalROI || 0,
      roiPercentage: portfolioData.roiPercentage || 0,
      totalProperties: portfolioData.properties?.length || 0,
      activeInvestments: portfolioData.investments?.length || 0
    };
  };
  
  // Handle refresh
  const handleRefresh = () => {
    refetchPortfolio();
    refetchPerformance();
    refetchROI();
  };
  
  // Handle period change
  const handlePeriodChange = (e) => {
    setTimePeriod(e.target.value);
  };
  
  // Export portfolio data as CSV
  const handleExportData = () => {
    // This would typically call an API endpoint that generates a CSV file
    window.location.href = '/api/investments/export-csv';
  };
  
  useEffect(() => {
    setIsLoading(isLoadingPortfolio || isLoadingPerformance || isLoadingROI);
  }, [isLoadingPortfolio, isLoadingPerformance, isLoadingROI]);
  
  // Get calculated metrics
  const metrics = getPortfolioMetrics();
  
  // Calculate average ROI for reference line
  const averageROI = roiData?.averageROI || null;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Investment Dashboard</h1>
          <p className="text-gray-500">
            Track your real estate investments and portfolio performance
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData} disabled={isLoading}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Invested</p>
                <h3 className="text-2xl font-bold">{formatCurrency(metrics.totalInvested)}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BuildingLibraryIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Across {metrics.activeInvestments} active investments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Portfolio Value</p>
                <h3 className="text-2xl font-bold">{formatCurrency(metrics.portfolioValue)}</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              In {metrics.totalProperties} properties
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total ROI</p>
                <h3 className="text-2xl font-bold">{formatCurrency(metrics.totalROI)}</h3>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Return on investment
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">ROI Percentage</p>
                <h3 className="text-2xl font-bold">{metrics.roiPercentage.toFixed(2)}%</h3>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <Badge variant={metrics.roiPercentage >= 0 ? 'success' : 'destructive'}>
                {metrics.roiPercentage >= 0 ? '+' : ''}{metrics.roiPercentage.toFixed(2)}%
              </Badge>
              <span className="text-xs text-gray-500 ml-2">Overall return</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full max-w-3xl mx-auto mb-6">
          <TabsTrigger value="overview" className="flex-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex-1">
            Performance
          </TabsTrigger>
          <TabsTrigger value="roi" className="flex-1">
            ROI Analysis
          </TabsTrigger>
          <TabsTrigger value="investments" className="flex-1">
            Investments
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Portfolio Distribution</h3>
                {isLoadingPortfolio ? (
                  <div className="flex justify-center py-12">
                    <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : portfolioError ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-red-500 mb-2">Failed to load portfolio data</p>
                    <Button variant="outline" onClick={refetchPortfolio} size="sm">
                      Retry
                    </Button>
                  </div>
                ) : (
                  <PortfolioDistributionChart 
                    data={getPortfolioDistribution()}
                    height={350}
                  />
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Performance Overview</h3>
                  <Select 
                    value={timePeriod}
                    onChange={handlePeriodChange}
                    className="w-36"
                  >
                    {TIME_PERIODS.map(period => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </Select>
                </div>
                
                {isLoadingPerformance ? (
                  <div className="flex justify-center py-12">
                    <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <PerformanceLineChart 
                    data={getPerformanceData()}
                    height={350}
                    lines={[
                      { dataKey: 'value', name: 'Portfolio Value', color: '#0088FE' },
                      { dataKey: 'invested', name: 'Total Invested', color: '#82CA9D' }
                    ]}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : portfolioData?.recentActivity?.length > 0 ? (
                <div className="space-y-4">
                  {portfolioData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === 'investment' && <BuildingLibraryIcon className="h-5 w-5 text-blue-500" />}
                        {activity.type === 'roi' && <CurrencyDollarIcon className="h-5 w-5 text-green-500" />}
                        {activity.type === 'document' && <DocumentTextIcon className="h-5 w-5 text-amber-500" />}
                        {activity.type === 'update' && <PresentationChartLineIcon className="h-5 w-5 text-purple-500" />}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <span className="text-xs text-gray-500">
                            <CalendarIcon className="inline h-3 w-3 mr-1" />
                            {new Date(activity.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity to display</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Portfolio Performance</h3>
                  <Select 
                    value={timePeriod}
                    onChange={handlePeriodChange}
                    className="w-36"
                  >
                    {TIME_PERIODS.map(period => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </Select>
                </div>
                
                {isLoadingPerformance ? (
                  <div className="flex justify-center py-12">
                    <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <PerformanceLineChart 
                    data={getPerformanceData()}
                    height={400}
                    lines={[
                      { dataKey: 'value', name: 'Portfolio Value', color: '#0088FE' },
                      { dataKey: 'invested', name: 'Total Invested', color: '#82CA9D' }
                    ]}
                    baselineValue={metrics.totalInvested}
                    baselineLabel="Initial Investment"
                  />
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Value Growth</h3>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Initial Investment</span>
                        <span>{formatCurrency(metrics.totalInvested)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Current Value</span>
                        <span>{formatCurrency(metrics.portfolioValue)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Value Growth</span>
                        <span className={metrics.portfolioValue - metrics.totalInvested >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(metrics.portfolioValue - metrics.totalInvested)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Growth Percentage</span>
                        <Badge variant={metrics.roiPercentage >= 0 ? 'success' : 'destructive'}>
                          {metrics.roiPercentage >= 0 ? '+' : ''}{metrics.roiPercentage.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Return Analysis</h3>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Total ROI Received</span>
                        <span className="text-green-600">{formatCurrency(metrics.totalROI)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Average Monthly ROI</span>
                        <span>{formatCurrency(performanceData?.averageMonthlyROI || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Projected Annual ROI</span>
                        <span>{formatCurrency(performanceData?.projectedAnnualROI || 0)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Best Performing Property</span>
                        <Badge variant="success">
                          {performanceData?.bestProperty?.roi.toFixed(2)}% ROI
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Property Name:</span>{' '}
                        {performanceData?.bestProperty?.name || 'N/A'}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* ROI Analysis Tab */}
        <TabsContent value="roi">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">ROI by Property</h3>
                {isLoadingROI ? (
                  <div className="flex justify-center py-12">
                    <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <ROIBarChart 
                    data={getROIData()}
                    height={400}
                    barKey="roi"
                    nameKey="name"
                    averageValue={averageROI}
                  />
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">ROI Statistics</h3>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Average ROI</span>
                        <Badge>{averageROI?.toFixed(2) || 0}%</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Highest ROI</span>
                        <Badge variant="success">{roiData?.highestROI?.toFixed(2) || 0}%</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Lowest ROI</span>
                        <Badge variant={roiData?.lowestROI < 0 ? 'destructive' : 'default'}>
                          {roiData?.lowestROI?.toFixed(2) || 0}%
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Properties Above Average</span>
                        <span>{roiData?.propertiesAboveAverage || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Properties Below Average</span>
                        <span>{roiData?.propertiesBelowAverage || 0}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Performing Properties</h3>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : !roiData?.topProperties?.length ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No property data available</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-medium">Property</th>
                            <th className="text-left py-2 font-medium">Type</th>
                            <th className="text-right py-2 font-medium">Investment</th>
                            <th className="text-right py-2 font-medium">Current Value</th>
                            <th className="text-right py-2 font-medium">ROI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roiData.topProperties.map((property, index) => (
                            <tr key={index} className="border-b last:border-0">
                              <td className="py-2">{property.name}</td>
                              <td className="py-2">{property.propertyType}</td>
                              <td className="py-2 text-right">{formatCurrency(property.investment)}</td>
                              <td className="py-2 text-right">{formatCurrency(property.currentValue)}</td>
                              <td className="py-2 text-right">
                                <Badge variant={property.roi >= 0 ? 'success' : 'destructive'}>
                                  {property.roi.toFixed(2)}%
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Investments Tab */}
        <TabsContent value="investments">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Your Investments</h3>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/properties'}>
                  Browse Properties
                </Button>
              </div>
              
              {isLoadingPortfolio ? (
                <div className="flex justify-center py-12">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : portfolioData?.investments?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Property</th>
                        <th className="text-left py-2 font-medium">Type</th>
                        <th className="text-right py-2 font-medium">Investment</th>
                        <th className="text-right py-2 font-medium">Date</th>
                        <th className="text-right py-2 font-medium">Status</th>
                        <th className="text-right py-2 font-medium">ROI</th>
                        <th className="text-center py-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioData.investments.map((investment) => (
                        <tr key={investment.id} className="border-b last:border-0">
                          <td className="py-2">{investment.property.name}</td>
                          <td className="py-2">{investment.property.propertyType}</td>
                          <td className="py-2 text-right">{formatCurrency(investment.amount)}</td>
                          <td className="py-2 text-right">
                            {new Date(investment.investmentDate).toLocaleDateString()}
                          </td>
                          <td className="py-2 text-right">
                            <Badge variant={
                              investment.status === 'active' ? 'success' :
                              investment.status === 'pending' ? 'warning' :
                              'default'
                            }>
                              {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-2 text-right">
                            <Badge variant={investment.roi >= 0 ? 'success' : 'destructive'}>
                              {investment.roi.toFixed(2)}%
                            </Badge>
                          </td>
                          <td className="py-2 text-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.location.href = `/investments/${investment.id}`}
                            >
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BuildingLibraryIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">No investments yet</h4>
                  <p className="text-gray-500 mb-4">
                    Start your real estate investment journey by browsing our available properties.
                  </p>
                  <Button onClick={() => window.location.href = '/properties'}>
                    Browse Properties
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestmentDashboard;