import { useQuery } from "@tanstack/react-query";
import { Loader2, HelpCircle } from "lucide-react";
import { Property, Investment } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface InvestmentWithProperty extends Investment {
  property: Property;
}

export default function AdvancedAnalytics() {
  const { data: investments, isLoading, error } = useQuery<InvestmentWithProperty[]>({
    queryKey: ["/api/investments"],
  });
  
  const [timeRange, setTimeRange] = useState<"1m" | "6m" | "1y" | "5y" | "all">("1y");
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !investments || investments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            {error 
              ? "Failed to load your investment data. Please try again later." 
              : "You don't have any investments yet to analyze."}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate key metrics
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalGrowth = ((totalCurrentValue - totalInvested) / totalInvested) * 100;
  
  // ROI over time data (simulated data for demonstration)
  const getTimeSeriesData = () => {
    // Generate data based on selected time range
    const dataPoints = timeRange === "1m" ? 30 : 
                      timeRange === "6m" ? 26 : 
                      timeRange === "1y" ? 12 : 
                      timeRange === "5y" ? 20 : 24;
    
    const baseReturn = investments.reduce((sum: number, inv) => sum + inv.property.targetReturn, 0) / investments.length;
    
    return Array.from({ length: dataPoints }, (_, i) => {
      // Add some random variation to simulate real-world data
      const volatility = 0.3;
      const randomFactor = 1 + (Math.random() * volatility - volatility/2);
      
      let date: string;
      if (timeRange === "1m") {
        date = `Day ${i+1}`;
      } else if (timeRange === "6m" || timeRange === "1y") {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonth = new Date().getMonth();
        const month = months[(currentMonth - i + 12) % 12];
        date = month;
      } else {
        date = `Year ${2025 - Math.floor(i/4)}, Q${4 - (i % 4)}`;
      }
      
      return {
        date,
        value: totalCurrentValue * (1 + (baseReturn/100) * (i/dataPoints) * randomFactor),
        roi: baseReturn * (1 + (i/dataPoints) * 0.2 * randomFactor)
      };
    }).reverse();
  };
  
  const timeSeriesData = getTimeSeriesData();
  
  // Property type allocation
  const propertyTypeData = investments.reduce((acc, inv) => {
    const type = inv.property.type;
    if (!acc[type]) {
      acc[type] = 0;
    }
    acc[type] += inv.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const pieChartData = Object.entries(propertyTypeData).map(([name, value]) => ({
    name,
    value
  }));
  
  // Location distribution
  const locationData = investments.reduce((acc, inv) => {
    const location = inv.property.location;
    if (!acc[location]) {
      acc[location] = 0;
    }
    acc[location] += inv.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const barChartData = Object.entries(locationData)
    .map(([name, value]) => ({
      name,
      value,
      percentage: (value / totalInvested) * 100
    }))
    .sort((a, b) => b.value - a.value);
  
  // Risk assessment (simplified for demonstration)
  const riskAssessment = investments.map(inv => {
    const riskScore = 100 - ((inv.property.targetReturn / 20) * 100);
    return {
      name: inv.property.name,
      amount: inv.amount,
      risk: riskScore,
      return: inv.property.targetReturn
    };
  });
  
  // Investment projection (5-year forecast)
  const projectionData = Array.from({ length: 6 }, (_, i) => {
    const year = 2025 + i;
    const projectedValue = totalCurrentValue * Math.pow(1 + (totalGrowth/100), i);
    
    return {
      year: `${year}`,
      conservative: projectedValue * 0.9,
      expected: projectedValue,
      optimistic: projectedValue * 1.1
    };
  });
  
  // COLORS
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Advanced Analytics</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Time Range:</span>
          <div className="flex bg-muted rounded-md">
            <Button 
              variant={timeRange === "1m" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setTimeRange("1m")}
              className="rounded-r-none h-8"
            >
              1M
            </Button>
            <Button 
              variant={timeRange === "6m" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setTimeRange("6m")}
              className="rounded-none h-8"
            >
              6M
            </Button>
            <Button 
              variant={timeRange === "1y" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setTimeRange("1y")}
              className="rounded-none h-8"
            >
              1Y
            </Button>
            <Button 
              variant={timeRange === "5y" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setTimeRange("5y")}
              className="rounded-none h-8"
            >
              5Y
            </Button>
            <Button 
              variant={timeRange === "all" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setTimeRange("all")}
              className="rounded-l-none h-8"
            >
              ALL
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Value Over Time */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Portfolio Value Over Time</CardTitle>
              <TooltipProvider>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      This chart shows the growth of your investment portfolio over time, 
                      based on projected returns of your properties.
                    </p>
                  </TooltipContent>
                </TooltipUI>
              </TooltipProvider>
            </div>
            <CardDescription>
              Historical performance and growth trajectory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timeSeriesData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis 
                    tickFormatter={(value) => `₦${(value/1000000).toFixed(1)}M`}
                  />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip 
                    formatter={(value: any) => [`₦${value.toLocaleString()}`, "Portfolio Value"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Asset Allocation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Asset Allocation</CardTitle>
              <TooltipProvider>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Distribution of your investments across different property types.
                    </p>
                  </TooltipContent>
                </TooltipUI>
              </TooltipProvider>
            </div>
            <CardDescription>
              Distribution by property type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`₦${value.toLocaleString()}`, "Invested"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Geographic Distribution</CardTitle>
              <TooltipProvider>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Distribution of your investments across different locations in Nigeria.
                    </p>
                  </TooltipContent>
                </TooltipUI>
              </TooltipProvider>
            </div>
            <CardDescription>
              Investment exposure by location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" 
                    tickFormatter={(value) => `${(value / totalInvested * 100).toFixed(0)}%`}
                  />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip 
                    formatter={(value: any) => [`₦${value.toLocaleString()} (${(value / totalInvested * 100).toFixed(1)}%)`, "Invested"]}
                  />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Risk vs. Return Analysis */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Risk vs. Return Analysis</CardTitle>
              <TooltipProvider>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Analysis of your investments' risk profiles compared to their expected returns.
                      Bubble size represents investment amount.
                    </p>
                  </TooltipContent>
                </TooltipUI>
              </TooltipProvider>
            </div>
            <CardDescription>
              Portfolio risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="bubble">
              <TabsList className="mb-4">
                <TabsTrigger value="bubble">Bubble Chart</TabsTrigger>
                <TabsTrigger value="table">Table View</TabsTrigger>
              </TabsList>
              <TabsContent value="bubble">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="risk" 
                        name="Risk" 
                        domain={[0, 100]} 
                        label={{ value: 'Risk Score (Lower is Riskier)', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="return" 
                        name="Return" 
                        label={{ value: 'Expected Return (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: any, name: any) => {
                          if (name === "risk") return [`${value}/100`, "Risk Score"];
                          if (name === "return") return [`${value}%`, "Expected Return"];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      {riskAssessment.map((item, index) => (
                        <Line
                          key={index}
                          type="monotone"
                          data={[item]}
                          dataKey="return"
                          name={item.name}
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={0}
                          dot={{
                            r: Math.sqrt(item.amount) / 15,
                            fill: COLORS[index % COLORS.length],
                            stroke: COLORS[index % COLORS.length],
                          }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="table">
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left">Property</th>
                        <th className="p-2 text-left">Investment</th>
                        <th className="p-2 text-left">Expected Return</th>
                        <th className="p-2 text-left">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {riskAssessment.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.name}</td>
                          <td className="p-2">₦{item.amount.toLocaleString()}</td>
                          <td className="p-2">{item.return}%</td>
                          <td className="p-2">
                            <span 
                              className={
                                item.risk > 80 ? "text-green-600" : 
                                item.risk > 60 ? "text-yellow-600" : 
                                "text-red-600"
                              }
                            >
                              {item.risk > 80 ? "Low" : 
                               item.risk > 60 ? "Medium" : 
                               "High"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* 5-Year Projection */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>5-Year Portfolio Projection</CardTitle>
              <TooltipProvider>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Projection of your portfolio value over the next 5 years based on 
                      conservative, expected, and optimistic scenarios.
                    </p>
                  </TooltipContent>
                </TooltipUI>
              </TooltipProvider>
            </div>
            <CardDescription>
              Future growth scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={projectionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `₦${(value/1000000).toFixed(1)}M`} />
                  <Tooltip 
                    formatter={(value: any) => [`₦${value.toLocaleString()}`, ""]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="conservative" 
                    name="Conservative" 
                    stroke="#0088FE" 
                    strokeDasharray="5 5" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expected" 
                    name="Expected" 
                    stroke="#00C49F" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="optimistic" 
                    name="Optimistic" 
                    stroke="#FFBB28" 
                    strokeDasharray="3 3" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="text-sm text-muted-foreground">
              <p>
                * Projections are based on historical performance and target returns of your current portfolio. 
                Actual results may vary. This is not financial advice.
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}