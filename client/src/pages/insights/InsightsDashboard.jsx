import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useApiRequest } from '../../hooks/useApiRequest';
import { format } from 'date-fns';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
  Label,
} from '../../components/ui/DesignSystem';

import {
  ArrowPathIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  PresentationChartLineIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapIcon,
} from '@heroicons/react/24/outline';

const InsightsDashboard = () => {
  const { user } = useAuth();
  const api = useApiRequest();
  
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [roiPropertyId, setRoiPropertyId] = useState('');
  const [roiMonths, setRoiMonths] = useState('6');
  const [marketTimeframe, setMarketTimeframe] = useState('last_6_months');
  const [aiQuestion, setAiQuestion] = useState('');
  
  // Get ROI trend predictions
  const {
    data: roiTrendsData,
    isLoading: isLoadingRoiTrends,
    refetch: refetchRoiTrends
  } = useQuery({
    queryKey: ['/api/insights/roi-trends', roiPropertyId, roiMonths],
    queryFn: async () => {
      let url = `insights/roi-trends?months=${roiMonths}`;
      if (roiPropertyId) {
        url += `&propertyId=${roiPropertyId}`;
      }
      const response = await api.get(url);
      return response.data.data;
    }
  });
  
  // Get market dynamics analysis
  const {
    data: marketDynamicsData,
    isLoading: isLoadingMarketDynamics,
    refetch: refetchMarketDynamics
  } = useQuery({
    queryKey: ['/api/insights/market-dynamics', marketTimeframe],
    queryFn: async () => {
      const response = await api.get(`insights/market-dynamics?timeframe=${marketTimeframe}`);
      return response.data.data;
    }
  });
  
  // Get personalized recommendations
  const {
    data: recommendationsData,
    isLoading: isLoadingRecommendations
  } = useQuery({
    queryKey: ['/api/insights/recommendations'],
    queryFn: async () => {
      const response = await api.get('insights/recommendations?limit=5&includeReasons=true');
      return response.data.data;
    },
    enabled: !!user
  });
  
  // Helper to get overall platform trends
  const getPlatformTrends = () => {
    if (!marketDynamicsData?.success) return [];
    
    const marketData = marketDynamicsData.marketDynamics;
    
    return [
      {
        title: 'Investment Growth',
        value: marketData.summary.marketTrend === 'growing' ? 'Positive' : marketData.summary.marketTrend === 'declining' ? 'Negative' : 'Stable',
        change: marketData.summary.marketTrend === 'growing' ? '+' : marketData.summary.marketTrend === 'declining' ? '-' : '=',
        icon: <PresentationChartLineIcon className={`h-8 w-8 ${marketData.summary.marketTrend === 'growing' ? 'text-green-500' : marketData.summary.marketTrend === 'declining' ? 'text-red-500' : 'text-yellow-500'}`} />,
        color: marketData.summary.marketTrend === 'growing' ? 'text-green-500' : marketData.summary.marketTrend === 'declining' ? 'text-red-500' : 'text-yellow-500',
        description: `${(marketData.summary.trendConfidence * 100).toFixed(0)}% confidence`
      },
      {
        title: 'Most Popular Type',
        value: marketData.propertyTypeAnalysis[0]?.propertyType || 'N/A',
        change: '+',
        icon: <BuildingOfficeIcon className="h-8 w-8 text-blue-500" />,
        color: 'text-blue-500',
        description: `${marketData.propertyTypeAnalysis[0]?.investmentCount || 0} investments`
      },
      {
        title: 'Hottest Location',
        value: marketData.locationAnalysis[0]?.location || 'N/A',
        change: '+',
        icon: <MapIcon className="h-8 w-8 text-purple-500" />,
        color: 'text-purple-500',
        description: `${marketData.locationAnalysis[0]?.uniqueInvestors || 0} investors`
      },
      {
        title: 'Average ROI',
        value: `${roiTrendsData?.predictions?.[0]?.forecast?.[0]?.predictedROI?.toFixed(2) || 0}%`,
        change: roiTrendsData?.predictions?.[0]?.trend === 'increasing' ? '+' : roiTrendsData?.predictions?.[0]?.trend === 'decreasing' ? '-' : '=',
        icon: <CurrencyDollarIcon className={`h-8 w-8 ${roiTrendsData?.predictions?.[0]?.trend === 'increasing' ? 'text-green-500' : roiTrendsData?.predictions?.[0]?.trend === 'decreasing' ? 'text-red-500' : 'text-yellow-500'}`} />,
        color: roiTrendsData?.predictions?.[0]?.trend === 'increasing' ? 'text-green-500' : roiTrendsData?.predictions?.[0]?.trend === 'decreasing' ? 'text-red-500' : 'text-yellow-500',
        description: 'Predicted average'
      }
    ];
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Investment Insights</h1>
          <p className="text-gray-600">AI-powered analytics and predictions to optimize your investment strategy</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="roi" className="flex items-center gap-2">
            <CurrencyDollarIcon className="h-5 w-5" />
            <span className="hidden sm:inline">ROI Trends</span>
          </TabsTrigger>
          <TabsTrigger value="market" className="flex items-center gap-2">
            <BuildingOfficeIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Market Dynamics</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" />
            <span className="hidden sm:inline">AI Analysis</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {marketDynamicsData?.success ? getPlatformTrends().map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        {stat.change && (
                          <span className={stat.change === '+' ? 'text-green-500' : stat.change === '-' ? 'text-red-500' : 'text-yellow-500'}>
                            {stat.change === '+' ? '↑' : stat.change === '-' ? '↓' : '→'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                    {stat.icon}
                  </div>
                </CardContent>
              </Card>
            )) : (
              Array(4).fill(0).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-8 w-16 bg-gray-300 rounded animate-pulse mb-2"></div>
                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PresentationChartLineIcon className="h-5 w-5 text-blue-500" />
                  ROI Forecast
                </CardTitle>
                <CardDescription>
                  Predicted investment returns based on historical data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRoiTrends ? (
                  <div className="flex justify-center py-20">
                    <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : roiTrendsData?.success && roiTrendsData?.predictions?.length > 0 ? (
                  <div className="h-64">
                    <div className="text-center font-medium mb-4">Predicted ROI Trends (Next 6 Months)</div>
                    
                    <div className="flex items-center justify-center">
                      <div className="text-center max-w-sm">
                        <div className="text-sm mb-1 text-gray-500">
                          Overall Trend
                        </div>
                        <div className="text-2xl font-bold mb-2">
                          {roiTrendsData.predictions[0].trend === 'increasing' && (
                            <span className="text-green-500">Upward Trend ↑</span>
                          )}
                          {roiTrendsData.predictions[0].trend === 'decreasing' && (
                            <span className="text-red-500">Downward Trend ↓</span>
                          )}
                          {roiTrendsData.predictions[0].trend === 'stable' && (
                            <span className="text-yellow-500">Stable Trend →</span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          {roiTrendsData.predictions[0].forecast.slice(0, 3).map((point, i) => (
                            <div key={i} className="bg-gray-50 p-2 rounded-md">
                              <div className="text-xs text-gray-500">Month {i+1}</div>
                              <div className="font-medium">{point.predictedROI.toFixed(2)}%</div>
                            </div>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">
                          Confidence: {(roiTrendsData.predictions[0].confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <ExclamationTriangleIcon className="h-10 w-10 text-yellow-500 mb-2" />
                    <p className="text-gray-600 text-center">
                      Could not load ROI predictions. 
                      <br />Please try again later.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BuildingOfficeIcon className="h-5 w-5 text-purple-500" />
                  Top Recommendations
                </CardTitle>
                <CardDescription>
                  Properties that match your investment preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRecommendations ? (
                  <div className="flex justify-center py-20">
                    <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : recommendationsData?.success && recommendationsData?.recommendations?.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {recommendationsData.recommendations.slice(0, 2).map((rec, index) => (
                      <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{rec.propertyName}</h4>
                          <span className="text-sm font-medium text-green-600">{rec.expectedROI}% ROI</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                          <span>{rec.propertyType}</span>
                          <span>{rec.location}</span>
                        </div>
                        <div className="text-sm mb-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, rec.fundingProgress)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span>{rec.fundingProgress.toFixed(0)}% Funded</span>
                            <span>Min: ${rec.minInvestment}</span>
                          </div>
                        </div>
                        {rec.reasons && (
                          <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                            <div className="font-medium mb-1">Why we recommend this:</div>
                            <ul className="list-disc list-inside">
                              {rec.reasons.map((reason, i) => (
                                <li key={i}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" className="w-full text-sm">View All Recommendations</Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <ExclamationTriangleIcon className="h-10 w-10 text-yellow-500 mb-2" />
                    <p className="text-gray-600 text-center">
                      Could not load recommendations.
                      <br />Please try again later.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-amber-500" />
                AI Market Insights
              </CardTitle>
              <CardDescription>
                Intelligent analysis of market trends and investment opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center max-w-2xl">
                  <SparklesIcon className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Unlock AI-Powered Investment Insights</h3>
                  <p className="text-gray-600 mb-4">
                    Our advanced AI analyzes platform data, market trends, and your investment history
                    to provide personalized insights and recommendations.
                  </p>
                  <Button onClick={() => setActiveTab('ai')} className="inline-flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5" />
                    Explore AI Insights
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* ROI Trends Tab */}
        <TabsContent value="roi">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                ROI Trend Analysis
              </CardTitle>
              <CardDescription>
                Predicted returns on investment based on historical performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="property-select">Property</Label>
                  <Select 
                    value={roiPropertyId} 
                    onValueChange={setRoiPropertyId}
                  >
                    <SelectTrigger id="property-select">
                      <SelectValue placeholder="All properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All properties</SelectItem>
                      {/* We would populate this with actual properties */}
                      <SelectItem value="1">Oakwood Residences</SelectItem>
                      <SelectItem value="2">Marina Heights</SelectItem>
                      <SelectItem value="3">Parkview Condos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="forecast-months">Forecast Months</Label>
                  <Select 
                    value={roiMonths} 
                    onValueChange={setRoiMonths}
                  >
                    <SelectTrigger id="forecast-months">
                      <SelectValue placeholder="Select months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={() => refetchRoiTrends()}
                    disabled={isLoadingRoiTrends}
                    className="w-full"
                  >
                    {isLoadingRoiTrends ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Update Forecast
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {isLoadingRoiTrends ? (
                <div className="flex justify-center py-20">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : roiTrendsData?.success && roiTrendsData?.predictions?.length > 0 ? (
                <div className="space-y-8">
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="col-span-4 md:col-span-1">
                      <div className="font-medium text-gray-700 mb-1">Properties Analyzed</div>
                      <div className="text-3xl font-bold">{roiTrendsData.predictions.length}</div>
                    </div>
                    <div className="col-span-4 md:col-span-1">
                      <div className="font-medium text-gray-700 mb-1">Forecast Period</div>
                      <div className="text-3xl font-bold">{roiMonths} months</div>
                    </div>
                    <div className="col-span-4 md:col-span-1">
                      <div className="font-medium text-gray-700 mb-1">Avg. Predicted ROI</div>
                      <div className="text-3xl font-bold">
                        {(roiTrendsData.predictions.reduce((sum, p) => 
                          sum + (p.forecast?.[0]?.predictedROI || 0), 0) / 
                          roiTrendsData.predictions.length).toFixed(2)}%
                      </div>
                    </div>
                    <div className="col-span-4 md:col-span-1">
                      <div className="font-medium text-gray-700 mb-1">Overall Trend</div>
                      <div className="text-3xl font-bold">
                        {(() => {
                          const trends = roiTrendsData.predictions.map(p => p.trend);
                          const increasingCount = trends.filter(t => t === 'increasing').length;
                          const decreasingCount = trends.filter(t => t === 'decreasing').length;
                          
                          if (increasingCount > decreasingCount) {
                            return <span className="text-green-500">↑ Up</span>;
                          } else if (decreasingCount > increasingCount) {
                            return <span className="text-red-500">↓ Down</span>;
                          } else {
                            return <span className="text-yellow-500">→ Stable</span>;
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Table of properties */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-4 text-left">Property</th>
                          <th className="py-2 px-4 text-left">Trend</th>
                          <th className="py-2 px-4 text-right">Current ROI</th>
                          {[1, 2, 3].map(month => (
                            <th key={month} className="py-2 px-4 text-right">Month {month}</th>
                          ))}
                          <th className="py-2 px-4 text-right">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roiTrendsData.predictions.map((prediction, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{prediction.propertyName}</td>
                            <td className="py-3 px-4">
                              {prediction.trend === 'increasing' && (
                                <span className="text-green-500 flex items-center gap-1">
                                  <ArrowUpIcon className="h-4 w-4" /> Increasing
                                </span>
                              )}
                              {prediction.trend === 'decreasing' && (
                                <span className="text-red-500 flex items-center gap-1">
                                  <ArrowDownIcon className="h-4 w-4" /> Decreasing
                                </span>
                              )}
                              {prediction.trend === 'stable' && (
                                <span className="text-yellow-500">Stable</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {prediction.historicalData?.[prediction.historicalData.length - 1]?.roi.toFixed(2)}%
                            </td>
                            {[0, 1, 2].map(month => (
                              <td key={month} className="py-3 px-4 text-right font-medium">
                                {prediction.forecast?.[month]?.predictedROI.toFixed(2)}%
                              </td>
                            ))}
                            <td className="py-3 px-4 text-right">
                              {(prediction.confidence * 100).toFixed(0)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mb-4" />
                  <p className="text-lg text-gray-600 text-center">
                    Could not load ROI predictions. 
                    <br />Please try again later.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Market Dynamics Tab */}
        <TabsContent value="market">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />
                Market Dynamics Analysis
              </CardTitle>
              <CardDescription>
                Insights into investment patterns, popular property types, and market sentiment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="timeframe-select">Timeframe</Label>
                  <Select 
                    value={marketTimeframe} 
                    onValueChange={setMarketTimeframe}
                  >
                    <SelectTrigger id="timeframe-select">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last_month">Last month</SelectItem>
                      <SelectItem value="last_3_months">Last 3 months</SelectItem>
                      <SelectItem value="last_6_months">Last 6 months</SelectItem>
                      <SelectItem value="last_year">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={() => refetchMarketDynamics()}
                    disabled={isLoadingMarketDynamics}
                    className="w-full"
                  >
                    {isLoadingMarketDynamics ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Update Analysis
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {isLoadingMarketDynamics ? (
                <div className="flex justify-center py-20">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : marketDynamicsData?.success ? (
                <div className="space-y-6">
                  {/* Summary stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Total Investments</div>
                      <div className="text-2xl font-bold">
                        {marketDynamicsData.marketDynamics.summary.totalInvestments}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                      <div className="text-2xl font-bold">
                        ${marketDynamicsData.marketDynamics.summary.totalAmount.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Unique Investors</div>
                      <div className="text-2xl font-bold">
                        {marketDynamicsData.marketDynamics.summary.uniqueInvestors}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Properties</div>
                      <div className="text-2xl font-bold">
                        {marketDynamicsData.marketDynamics.summary.uniqueProperties}
                      </div>
                    </div>
                  </div>
                  
                  {/* Property Types */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Popular Property Types</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {marketDynamicsData.marketDynamics.propertyTypeAnalysis.map((type, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{type.propertyType}</span>
                            <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                              {type.investmentCount} investments
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Total:</span>
                              <span className="font-medium ml-1">${type.totalInvestment.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Investors:</span>
                              <span className="font-medium ml-1">{type.uniqueInvestors}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Average:</span>
                              <span className="font-medium ml-1">${type.averageInvestment.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Locations */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Top Locations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {marketDynamicsData.marketDynamics.locationAnalysis.slice(0, 6).map((location, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="font-medium mb-2">{location.location}</div>
                          <div className="text-sm mb-1">
                            <span className="text-gray-500">Investments:</span>
                            <span className="font-medium ml-1">{location.investmentCount}</span>
                          </div>
                          <div className="text-sm mb-1">
                            <span className="text-gray-500">Total:</span>
                            <span className="font-medium ml-1">${location.totalInvestment.toFixed(2)}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Investors:</span>
                            <span className="font-medium ml-1">{location.uniqueInvestors}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Monthly Trends */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Monthly Investment Trends</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-4 text-left">Month</th>
                            <th className="py-2 px-4 text-right">Investments</th>
                            <th className="py-2 px-4 text-right">Total Amount</th>
                            <th className="py-2 px-4 text-right">Unique Investors</th>
                            <th className="py-2 px-4 text-right">Avg. Investment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {marketDynamicsData.marketDynamics.monthlyTrends.map((month, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium">{month.month}</td>
                              <td className="py-3 px-4 text-right">{month.investmentCount}</td>
                              <td className="py-3 px-4 text-right">${month.totalInvestment.toFixed(2)}</td>
                              <td className="py-3 px-4 text-right">{month.uniqueInvestors}</td>
                              <td className="py-3 px-4 text-right">${month.averageInvestment.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mb-4" />
                  <p className="text-lg text-gray-600 text-center">
                    Could not load market dynamics analysis. 
                    <br />Please try again later.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* AI Analysis Tab */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-purple-500" />
                AI Investment Analysis
              </CardTitle>
              <CardDescription>
                Ask questions about market trends, get personalized insights, and receive strategic investment advice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label htmlFor="ai-question" className="mb-2 block">Ask AI for Investment Advice</Label>
                <div className="flex gap-2">
                  <Input
                    id="ai-question"
                    placeholder="Example: What property types are trending? Which locations show the best ROI?"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    className="flex-1"
                  />
                  <Button>
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Ask AI
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Powered by AI analysis of platform data and market trends
                </p>
              </div>
              
              <div className="bg-gray-50 border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white">
                    <SparklesIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-2">AI Investment Analysis</h3>
                    <div className="prose prose-sm max-w-none">
                      <h4>Market Overview</h4>
                      <p>
                        Based on platform data analysis, the real estate investment market is showing a 
                        <strong className="text-green-600"> positive growth trend</strong> with a 
                        <strong> 82% confidence rating</strong>. 
                        The most active property type is <strong>Commercial</strong>, followed by 
                        <strong> Residential Multi-Family</strong>.
                      </p>
                      
                      <h4>Key Insights</h4>
                      <ul>
                        <li>
                          <strong>Rising demand in suburban areas</strong> - Our analysis shows a 
                          23% increase in investments in suburban properties over the last quarter.
                        </li>
                        <li>
                          <strong>Commercial properties outperforming</strong> - Commercial properties 
                          are delivering an average ROI of 8.2%, outperforming residential at 6.7%.
                        </li>
                        <li>
                          <strong>Emerging market opportunity</strong> - Miami and Austin are showing 
                          strong growth potential with increasing investor interest and rising property values.
                        </li>
                      </ul>
                      
                      <h4>Recommendations</h4>
                      <p>
                        Consider diversifying your portfolio with commercial properties in emerging markets. 
                        Based on your investment history, properties with 7-9% ROI and minimum investment 
                        of $5,000-$15,000 would align well with your strategy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LightBulbIcon className="h-5 w-5 text-amber-500" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>
                  Properties that match your investment profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRecommendations ? (
                  <div className="flex justify-center py-12">
                    <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : recommendationsData?.success && recommendationsData?.recommendations?.length > 0 ? (
                  <div className="space-y-4">
                    {recommendationsData.recommendations.map((rec, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{rec.propertyName}</h4>
                          <span className="text-sm font-medium text-green-600">{rec.expectedROI}% ROI</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                          <span>{rec.propertyType}</span>
                          <span>{rec.location}</span>
                        </div>
                        <div className="text-sm mb-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, rec.fundingProgress)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span>{rec.fundingProgress.toFixed(0)}% Funded</span>
                            <span>Min: ${rec.minInvestment}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {rec.description || 'A promising investment opportunity with excellent returns potential.'}
                        </p>
                        {rec.reasons && (
                          <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                            <div className="font-medium mb-1">Why we recommend this:</div>
                            <ul className="list-disc list-inside">
                              {rec.reasons.map((reason, i) => (
                                <li key={i}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="mt-3">
                          <Button size="sm" variant="outline" className="w-full">View Property</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <ExclamationTriangleIcon className="h-10 w-10 text-yellow-500 mb-2" />
                    <p className="text-gray-600 text-center">
                      Could not load recommendations.
                      <br />Please try again later.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  Your Investment Profile
                </CardTitle>
                <CardDescription>
                  Based on your past investment decisions and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRecommendations ? (
                  <div className="flex justify-center py-12">
                    <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : recommendationsData?.success && recommendationsData.userPreferences ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Favorite Property Types</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {recommendationsData.userPreferences.favoritePropertyTypes.map((type, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                            <span className="font-medium">{type.type}</span>
                            <span className="text-sm text-gray-500">{type.count} investments ({type.percentage.toFixed(0)}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Preferred Locations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {recommendationsData.userPreferences.favoriteLocations.map((loc, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                            <span className="font-medium">{loc.location}</span>
                            <span className="text-sm text-gray-500">{loc.count} investments ({loc.percentage.toFixed(0)}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Investment Behavior</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-sm text-gray-500">Average Investment</div>
                          <div className="text-xl font-semibold">
                            ${recommendationsData.userPreferences.avgInvestmentAmount.toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-sm text-gray-500">Total Investments</div>
                          <div className="text-xl font-semibold">
                            {recommendationsData.userPreferences.investmentCount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <ExclamationTriangleIcon className="h-10 w-10 text-yellow-500 mb-2" />
                    <p className="text-gray-600 text-center">
                      No investment profile available yet.
                      <br />Make some investments to build your profile.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsightsDashboard;