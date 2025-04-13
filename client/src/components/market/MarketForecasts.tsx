import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  BarChart3, 
  Calendar, 
  Download, 
  ExternalLink, 
  TrendingUp,
  Home,
  DollarSign,
  BarChart4,
  HelpCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from "recharts";

// Sample forecasting data
const forecastData = {
  // Historical data + forecasts
  priceForecast: [
    { month: "2023-01", actual: 478200, forecast: null, lower: null, upper: null },
    { month: "2023-02", actual: 479800, forecast: null, lower: null, upper: null },
    { month: "2023-03", actual: 481500, forecast: null, lower: null, upper: null },
    { month: "2023-04", actual: 483200, forecast: null, lower: null, upper: null },
    { month: "2023-05", actual: 484900, forecast: null, lower: null, upper: null },
    { month: "2023-06", actual: 486700, forecast: null, lower: null, upper: null },
    { month: "2023-07", actual: 488500, forecast: null, lower: null, upper: null },
    { month: "2023-08", actual: 490400, forecast: null, lower: null, upper: null },
    { month: "2023-09", actual: 492100, forecast: null, lower: null, upper: null },
    { month: "2023-10", actual: 493800, forecast: null, lower: null, upper: null },
    { month: "2023-11", actual: 496000, forecast: null, lower: null, upper: null },
    { month: "2023-12", actual: 498900, forecast: null, lower: null, upper: null },
    { month: "2024-01", actual: 502400, forecast: 501200, lower: 498000, upper: 504400 },
    { month: "2024-02", actual: 506700, forecast: 503800, lower: 499500, upper: 508100 },
    { month: "2024-03", actual: 511500, forecast: 507100, lower: 501200, upper: 513000 },
    { month: "2024-04", actual: 516200, forecast: 510700, lower: 503500, upper: 517900 },
    { month: "2024-05", actual: 520800, forecast: 514600, lower: 506000, upper: 523200 },
    { month: "2024-06", actual: 525100, forecast: 518900, lower: 509200, upper: 528600 },
    { month: "2024-07", actual: 529400, forecast: 523500, lower: 512800, upper: 534200 },
    { month: "2024-08", actual: 533900, forecast: 528600, lower: 516900, upper: 540300 },
    { month: "2024-09", actual: 538200, forecast: 534100, lower: 521500, upper: 546700 },
    { month: "2024-10", actual: 542500, forecast: 539800, lower: 526400, upper: 553200 },
    { month: "2024-11", actual: 546300, forecast: 545700, lower: 531700, upper: 559700 },
    { month: "2024-12", actual: 549800, forecast: 551900, lower: 537400, upper: 566400 },
    { month: "2025-01", actual: 553200, forecast: 558300, lower: 543400, upper: 573200 },
    { month: "2025-02", actual: 556500, forecast: 564900, lower: 549700, upper: 580100 },
    { month: "2025-03", actual: 560300, forecast: 571700, lower: 556300, upper: 587100 },
    { month: "2025-04", actual: 565200, forecast: 578800, lower: 563200, upper: 594400 },
    { month: "2025-05", forecast: 586200, lower: 570500, upper: 601900, actual: null },
    { month: "2025-06", forecast: 593700, lower: 577900, upper: 609500, actual: null },
    { month: "2025-07", forecast: 601500, lower: 585600, upper: 617400, actual: null },
    { month: "2025-08", forecast: 609400, lower: 593500, upper: 625300, actual: null },
    { month: "2025-09", forecast: 617300, lower: 601500, upper: 633100, actual: null },
    { month: "2025-10", forecast: 625200, lower: 608800, upper: 641600, actual: null },
    { month: "2025-11", forecast: 632800, lower: 615400, upper: 650200, actual: null },
    { month: "2025-12", forecast: 640100, lower: 621200, upper: 659000, actual: null },
    { month: "2026-01", forecast: 646900, lower: 626300, upper: 667500, actual: null },
    { month: "2026-02", forecast: 653100, lower: 630900, upper: 675300, actual: null },
    { month: "2026-03", forecast: 659000, lower: 635200, upper: 682800, actual: null },
    { month: "2026-04", forecast: 664800, lower: 639400, upper: 690200, actual: null }
  ],
  // Sales volume forecasts
  salesForecast: [
    { month: "2023-10", actual: 4.28, forecast: null },
    { month: "2023-11", actual: 4.12, forecast: null },
    { month: "2023-12", actual: 3.95, forecast: null },
    { month: "2024-01", actual: 3.87, forecast: 3.92 },
    { month: "2024-02", actual: 3.94, forecast: 3.89 },
    { month: "2024-03", actual: 4.18, forecast: 4.05 },
    { month: "2024-04", actual: 4.53, forecast: 4.35 },
    { month: "2024-05", actual: 4.92, forecast: 4.72 },
    { month: "2024-06", actual: 5.31, forecast: 5.15 },
    { month: "2024-07", actual: 5.62, forecast: 5.52 },
    { month: "2024-08", actual: 5.87, forecast: 5.79 },
    { month: "2024-09", actual: 5.96, forecast: 5.91 },
    { month: "2024-10", actual: 5.89, forecast: 5.84 },
    { month: "2024-11", actual: 5.73, forecast: 5.68 },
    { month: "2024-12", actual: 5.45, forecast: 5.38 },
    { month: "2025-01", actual: 5.29, forecast: 5.21 },
    { month: "2025-02", actual: 5.36, forecast: 5.18 },
    { month: "2025-03", actual: 5.58, forecast: 5.41 },
    { month: "2025-04", actual: 5.92, forecast: 5.75 },
    { month: "2025-05", forecast: 6.19, actual: null },
    { month: "2025-06", forecast: 6.55, actual: null },
    { month: "2025-07", forecast: 6.83, actual: null },
    { month: "2025-08", forecast: 7.04, actual: null },
    { month: "2025-09", forecast: 7.11, actual: null },
    { month: "2025-10", forecast: 7.05, actual: null },
    { month: "2025-11", forecast: 6.86, actual: null },
    { month: "2025-12", forecast: 6.55, actual: null }
  ],
  // Interest rate forecasts
  rateForecast: [
    { month: "2023-07", actual: 6.81, forecast: null },
    { month: "2023-08", actual: 7.12, forecast: null },
    { month: "2023-09", actual: 7.31, forecast: null },
    { month: "2023-10", actual: 7.62, forecast: null },
    { month: "2023-11", actual: 7.44, forecast: null },
    { month: "2023-12", actual: 6.97, forecast: null },
    { month: "2024-01", actual: 6.64, forecast: 6.78 },
    { month: "2024-02", actual: 6.38, forecast: 6.55 },
    { month: "2024-03", actual: 6.12, forecast: 6.32 },
    { month: "2024-04", actual: 5.87, forecast: 6.08 },
    { month: "2024-05", actual: 5.63, forecast: 5.85 },
    { month: "2024-06", actual: 5.42, forecast: 5.60 },
    { month: "2024-07", actual: 5.28, forecast: 5.39 },
    { month: "2024-08", actual: 5.19, forecast: 5.24 },
    { month: "2024-09", actual: 5.11, forecast: 5.16 },
    { month: "2024-10", actual: 5.07, forecast: 5.09 },
    { month: "2024-11", actual: 5.06, forecast: 5.05 },
    { month: "2024-12", actual: 5.03, forecast: 5.02 },
    { month: "2025-01", actual: 5.01, forecast: 5.00 },
    { month: "2025-02", actual: 5.01, forecast: 4.98 },
    { month: "2025-03", actual: 4.97, forecast: 4.95 },
    { month: "2025-04", actual: 4.92, forecast: 4.93 },
    { month: "2025-05", forecast: 4.90, actual: null },
    { month: "2025-06", forecast: 4.87, actual: null },
    { month: "2025-07", forecast: 4.85, actual: null },
    { month: "2025-08", forecast: 4.82, actual: null },
    { month: "2025-09", forecast: 4.80, actual: null },
    { month: "2025-10", forecast: 4.78, actual: null },
    { month: "2025-11", forecast: 4.75, actual: null },
    { month: "2025-12", forecast: 4.73, actual: null }
  ],
  // Scenario forecasts
  scenarios: {
    baseline: {
      "2025Q2": 3.8,
      "2025Q3": 4.2,
      "2025Q4": 3.9,
      "2026Q1": 3.7,
      "2026Q2": 3.5,
      "2026Q3": 3.6,
      "2026Q4": 3.8
    },
    optimistic: {
      "2025Q2": 5.2,
      "2025Q3": 5.8,
      "2025Q4": 6.1,
      "2026Q1": 5.9,
      "2026Q2": 5.7,
      "2026Q3": 5.6,
      "2026Q4": 5.4
    },
    pessimistic: {
      "2025Q2": 2.1,
      "2025Q3": 1.8,
      "2025Q4": 1.2,
      "2026Q1": 0.7,
      "2026Q2": 0.3,
      "2026Q3": 0.2,
      "2026Q4": 0.5
    }
  },
  // Forecast errors and accuracy
  accuracy: {
    mape: 1.83, // Mean Absolute Percentage Error
    rmse: 3456, // Root Mean Square Error
    lastRevision: "2025-04-10",
    successRate: 92, // Percentage of forecasts within confidence interval
    forecastHorizon: 12 // months
  },
  // Influential factors
  factors: [
    { factor: "Interest Rates", impact: "high", direction: "negative", confidence: 85 },
    { factor: "Employment Growth", impact: "high", direction: "positive", confidence: 78 },
    { factor: "Housing Supply", impact: "medium", direction: "negative", confidence: 82 },
    { factor: "Population Growth", impact: "medium", direction: "positive", confidence: 75 },
    { factor: "Inflation", impact: "medium", direction: "negative", confidence: 70 },
    { factor: "Consumer Sentiment", impact: "low", direction: "positive", confidence: 65 }
  ]
};

// Format date labels
function formatMonthYear(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
}

// Format price values
function formatPrice(price: number) {
  return `$${price.toLocaleString()}`;
}

// Custom tooltip component
const ForecastTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isActual = data.actual !== null;
    const displayValue = isActual ? data.actual : data.forecast;
    
    return (
      <div className="bg-white p-4 border rounded shadow-md">
        <p className="font-bold">{formatMonthYear(label)}</p>
        <div className="mt-2">
          {payload.map((entry: any, index: number) => {
            if (entry.dataKey === "actual" && entry.value !== null) {
              return (
                <p key={`actual-${index}`} className="text-gray-700">
                  Actual: <span className="font-semibold">{formatPrice(entry.value)}</span>
                </p>
              );
            }
            if (entry.dataKey === "forecast" && entry.value !== null) {
              return (
                <p key={`forecast-${index}`} className="text-blue-600">
                  Forecast: <span className="font-semibold">{formatPrice(entry.value)}</span>
                </p>
              );
            }
            if (entry.dataKey === "lower" && entry.value !== null) {
              return (
                <p key={`lower-${index}`} className="text-gray-500 text-sm">
                  Lower bound: <span className="font-semibold">{formatPrice(entry.value)}</span>
                </p>
              );
            }
            if (entry.dataKey === "upper" && entry.value !== null) {
              return (
                <p key={`upper-${index}`} className="text-gray-500 text-sm">
                  Upper bound: <span className="font-semibold">{formatPrice(entry.value)}</span>
                </p>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }
  return null;
};

export function MarketForecasts() {
  const [forecastType, setForecastType] = useState("price");
  const [timeframe, setTimeframe] = useState("2y");
  const [scenarioView, setScenarioView] = useState("baseline");
  
  // Filter data based on timeframe
  const getFilteredData = (data: any[]) => {
    const now = new Date('2025-04');
    let monthsBack = 0;
    let monthsForward = 0;
    
    switch (timeframe) {
      case "1y": 
        monthsBack = 6;
        monthsForward = 6;
        break;
      case "2y": 
        monthsBack = 12;
        monthsForward = 12;
        break;
      case "5y": 
        monthsBack = 24;
        monthsForward = 24;
        break;
      default: 
        return data;
    }
    
    const cutoffBack = new Date(now);
    cutoffBack.setMonth(now.getMonth() - monthsBack);
    const cutoffBackStr = cutoffBack.toISOString().substring(0, 7); // YYYY-MM format
    
    const cutoffForward = new Date(now);
    cutoffForward.setMonth(now.getMonth() + monthsForward);
    const cutoffForwardStr = cutoffForward.toISOString().substring(0, 7);
    
    return data.filter(item => 
      item.month >= cutoffBackStr && 
      item.month <= cutoffForwardStr
    );
  };
  
  // Convert scenario data to chart format
  const getScenarioData = () => {
    return Object.keys(forecastData.scenarios.baseline).map(quarter => ({
      quarter,
      baseline: forecastData.scenarios.baseline[quarter as keyof typeof forecastData.scenarios.baseline],
      optimistic: forecastData.scenarios.optimistic[quarter as keyof typeof forecastData.scenarios.optimistic],
      pessimistic: forecastData.scenarios.pessimistic[quarter as keyof typeof forecastData.scenarios.pessimistic],
    }));
  };
  
  const priceForecastData = getFilteredData(forecastData.priceForecast);
  const salesForecastData = getFilteredData(forecastData.salesForecast);
  const rateForecastData = getFilteredData(forecastData.rateForecast);
  const scenarioData = getScenarioData();
  
  // Calculate latest values and changes
  const getLatestActual = (data: any[], key = 'actual') => {
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i][key] !== null) {
        return data[i][key];
      }
    }
    return null;
  };
  
  const getLatestForecast = (data: any[]) => {
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].forecast !== null && data[i].actual === null) {
        return data[i].forecast;
      }
    }
    return null;
  };
  
  const getYearlyChange = (data: any[], key = 'actual') => {
    let current = null;
    let yearAgo = null;
    
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i][key] !== null && current === null) {
        current = data[i][key];
      }
      
      if (data[i][key] !== null && i <= data.length - 13 && yearAgo === null) {
        yearAgo = data[i][key];
        break;
      }
    }
    
    if (current !== null && yearAgo !== null) {
      return ((current - yearAgo) / yearAgo) * 100;
    }
    
    return null;
  };
  
  // Get latest values
  const latestPriceActual = getLatestActual(forecastData.priceForecast);
  const latestPriceForecast = getLatestForecast(forecastData.priceForecast);
  const priceYearlyChange = getYearlyChange(forecastData.priceForecast);
  
  const latestSalesActual = getLatestActual(forecastData.salesForecast);
  const latestSalesForecast = getLatestForecast(forecastData.salesForecast);
  const salesYearlyChange = getYearlyChange(forecastData.salesForecast);
  
  const latestRateActual = getLatestActual(forecastData.rateForecast);
  const latestRateForecast = getLatestForecast(forecastData.rateForecast);
  const rateYearlyChange = getYearlyChange(forecastData.rateForecast);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Market Forecasts</h2>
          <p className="text-gray-500">
            Predictive analytics and market projections for the next {timeframe === "1y" ? "12" : timeframe === "2y" ? "24" : "60"} months
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="2y">2 Years</SelectItem>
              <SelectItem value="5y">5 Years</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" title="Download forecast data">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Key Forecast Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <DollarSign className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-sm text-gray-500">Average Home Price</p>
              <p className="text-2xl font-bold">{formatPrice(latestPriceActual)}</p>
              <div className={`flex items-center text-sm mt-1 ${priceYearlyChange && priceYearlyChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {priceYearlyChange && priceYearlyChange >= 0 ? 
                  <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                }
                {priceYearlyChange ? Math.abs(priceYearlyChange).toFixed(1) : 0}% YoY
              </div>
              <div className="text-xs text-blue-600 mt-2">
                Forecast: {formatPrice(latestPriceForecast || 0)} (+{((((latestPriceForecast || 0) - latestPriceActual) / latestPriceActual) * 100).toFixed(1)}%)
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Home className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-sm text-gray-500">Sales Volume (millions)</p>
              <p className="text-2xl font-bold">{latestSalesActual.toFixed(2)}</p>
              <div className={`flex items-center text-sm mt-1 ${salesYearlyChange && salesYearlyChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {salesYearlyChange && salesYearlyChange >= 0 ? 
                  <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                }
                {salesYearlyChange ? Math.abs(salesYearlyChange).toFixed(1) : 0}% YoY
              </div>
              <div className="text-xs text-blue-600 mt-2">
                Forecast: {latestSalesForecast.toFixed(2)} ({latestSalesForecast > latestSalesActual ? "+" : ""}{((latestSalesForecast - latestSalesActual) / latestSalesActual * 100).toFixed(1)}%)
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <BarChart4 className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-sm text-gray-500">Mortgage Rate</p>
              <p className="text-2xl font-bold">{latestRateActual.toFixed(2)}%</p>
              <div className={`flex items-center text-sm mt-1 ${rateYearlyChange && rateYearlyChange >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {rateYearlyChange && rateYearlyChange >= 0 ? 
                  <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                }
                {rateYearlyChange ? Math.abs(rateYearlyChange).toFixed(1) : 0}% YoY
              </div>
              <div className="text-xs text-blue-600 mt-2">
                Forecast: {latestRateForecast.toFixed(2)}% ({latestRateForecast > latestRateActual ? "+" : ""}{(latestRateForecast - latestRateActual).toFixed(2)} pts)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Forecast Charts */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Forecast Projections</CardTitle>
              <CardDescription>
                Historical data and future projections with confidence intervals
              </CardDescription>
            </div>
            
            <Tabs defaultValue={forecastType} onValueChange={setForecastType}>
              <TabsList>
                <TabsTrigger value="price">Home Prices</TabsTrigger>
                <TabsTrigger value="sales">Sales Volume</TabsTrigger>
                <TabsTrigger value="rates">Mortgage Rates</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Tabs value={forecastType} className="hidden">
              <TabsContent value="price" className="mt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={priceForecastData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(date) => formatMonthYear(date)}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <Tooltip content={<ForecastTooltip />} />
                    <Legend />
                    <defs>
                      <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#bbdefb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#bbdefb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="upper" 
                      stroke="none" 
                      fill="url(#colorUpper)" 
                      name="Upper Bound" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="lower" 
                      stroke="none" 
                      fill="#bbdefb" 
                      fillOpacity={0.2} 
                      name="Lower Bound" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ r: 1 }}
                      activeDot={{ r: 6 }}
                      name="Actual" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="forecast" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      strokeDasharray="5 5" 
                      dot={{ r: 1 }}
                      activeDot={{ r: 6 }}
                      name="Forecast" 
                    />
                    <ReferenceLine 
                      x={priceForecastData.find(d => d.actual !== null && d.forecast !== null)?.month} 
                      stroke="#888" 
                      strokeDasharray="3 3"
                      label={{ value: "Current", position: "insideTopRight" }}
                    />
                    <Brush 
                      dataKey="month" 
                      height={30} 
                      stroke="#2563eb"
                      tickFormatter={(date) => formatMonthYear(date)}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="sales" className="mt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesForecastData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(date) => formatMonthYear(date)}
                    />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip 
                      formatter={(value) => [`${value} million`, 'Sales Volume']}
                      labelFormatter={(date) => formatMonthYear(date as string)}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ r: 1 }}
                      activeDot={{ r: 6 }}
                      name="Actual" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="forecast" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      strokeDasharray="5 5" 
                      dot={{ r: 1 }}
                      activeDot={{ r: 6 }}
                      name="Forecast" 
                    />
                    <ReferenceLine 
                      x={salesForecastData.find(d => d.actual !== null && d.forecast !== null)?.month} 
                      stroke="#888" 
                      strokeDasharray="3 3"
                      label={{ value: "Current", position: "insideTopRight" }}
                    />
                    <Brush 
                      dataKey="month" 
                      height={30} 
                      stroke="#2563eb"
                      tickFormatter={(date) => formatMonthYear(date)}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="rates" className="mt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={rateForecastData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(date) => formatMonthYear(date)}
                    />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Mortgage Rate']}
                      labelFormatter={(date) => formatMonthYear(date as string)}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ r: 1 }}
                      activeDot={{ r: 6 }}
                      name="Actual" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="forecast" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      strokeDasharray="5 5" 
                      dot={{ r: 1 }}
                      activeDot={{ r: 6 }}
                      name="Forecast" 
                    />
                    <ReferenceLine 
                      x={rateForecastData.find(d => d.actual !== null && d.forecast !== null)?.month} 
                      stroke="#888" 
                      strokeDasharray="3 3"
                      label={{ value: "Current", position: "insideTopRight" }}
                    />
                    <Brush 
                      dataKey="month" 
                      height={30} 
                      stroke="#2563eb"
                      tickFormatter={(date) => formatMonthYear(date)}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="text-sm text-gray-500 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Last updated: {new Date(forecastData.accuracy.lastRevision).toLocaleDateString()}
          </div>
          <div className="text-sm">
            <Badge variant="outline">
              MAPE: {forecastData.accuracy.mape.toFixed(2)}%
            </Badge>
            <Badge variant="outline" className="ml-2">
              Success rate: {forecastData.accuracy.successRate}%
            </Badge>
          </div>
        </CardFooter>
      </Card>
      
      {/* Alternative Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Growth Scenarios (Quarterly Price Change %)</CardTitle>
            <CardDescription>
              Compare baseline, optimistic, and pessimistic market predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={scenarioData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Price Change']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="baseline" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Baseline" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="optimistic" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Optimistic" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pessimistic" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Pessimistic" 
                  />
                  <ReferenceLine y={0} stroke="#888" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="text-sm text-gray-500">
              Based on different economic and policy scenarios
            </div>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Methodology
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Key Drivers</CardTitle>
            <CardDescription>Factors influencing market forecasts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forecastData.factors.map(factor => (
                <div key={factor.factor} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{factor.factor}</span>
                    <Badge 
                      variant={factor.impact === "high" ? "default" : "outline"}
                      className={
                        factor.impact === "high" 
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100" 
                          : "text-gray-700"
                      }
                    >
                      {factor.impact} impact
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span className={factor.direction === "positive" ? "text-emerald-600" : "text-red-500"}>
                      {factor.direction === "positive" ? 
                        <ArrowUpRight className="h-3 w-3 inline mr-1" /> : 
                        <ArrowDownRight className="h-3 w-3 inline mr-1" />
                      }
                      {factor.direction} correlation
                    </span>
                    <span>{factor.confidence}% confidence</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        factor.direction === "positive" ? "bg-emerald-500" : "bg-red-500"
                      }`}
                      style={{ width: `${factor.confidence}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-start p-4 bg-gray-50 rounded-lg space-x-3">
        <HelpCircle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-gray-600">
          <span className="font-medium">About the Forecasts:</span> These projections are based on statistical models incorporating historical trends, current market conditions, economic indicators, and policy changes. The forecast horizon is {forecastData.accuracy.forecastHorizon} months with regular updates. While we strive for accuracy (current MAPE: {forecastData.accuracy.mape.toFixed(2)}%), real estate markets can be influenced by unforeseen events.
        </div>
      </div>
    </div>
  );
}