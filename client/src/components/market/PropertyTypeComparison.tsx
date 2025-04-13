import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Building, 
  Download,
  Home,
  Factory,
  Store,
  TreePine,
  Hotel,
  Warehouse,
  DollarSign,
  TrendingUp,
  ListFilter,
  Clock
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Sector
} from "recharts";

// Sample property type comparison data
const propertyTypeData = {
  // Performance metrics for different property types
  performance: [
    { 
      type: "Residential", 
      icon: <Home className="h-5 w-5" />,
      priceGrowth: 6.3, 
      rentalYield: 4.7, 
      vacancyRate: 3.2, 
      cashFlow: 7.1, 
      roi: 12.6,
      supplyDemandRatio: 0.82,
      averagePrice: 425000,
      constructionCosts: 248,
      medianSaleTime: 28
    },
    { 
      type: "Commercial", 
      icon: <Store className="h-5 w-5" />,
      priceGrowth: 4.2, 
      rentalYield: 6.8, 
      vacancyRate: 7.5, 
      cashFlow: 9.4, 
      roi: 10.7,
      supplyDemandRatio: 1.08,
      averagePrice: 1250000,
      constructionCosts: 327,
      medianSaleTime: 63
    },
    { 
      type: "Industrial", 
      icon: <Factory className="h-5 w-5" />,
      priceGrowth: 7.5, 
      rentalYield: 5.9, 
      vacancyRate: 4.1, 
      cashFlow: 8.2, 
      roi: 13.8,
      supplyDemandRatio: 0.73,
      averagePrice: 850000,
      constructionCosts: 189,
      medianSaleTime: 42
    },
    { 
      type: "Land", 
      icon: <TreePine className="h-5 w-5" />,
      priceGrowth: 9.2, 
      rentalYield: 2.1, 
      vacancyRate: 0, 
      cashFlow: 3.8, 
      roi: 11.5,
      supplyDemandRatio: 0.95,
      averagePrice: 275000,
      constructionCosts: 0,
      medianSaleTime: 87
    },
    { 
      type: "Mixed-Use", 
      icon: <Building className="h-5 w-5" />,
      priceGrowth: 5.7, 
      rentalYield: 5.8, 
      vacancyRate: 5.2, 
      cashFlow: 8.5, 
      roi: 12.2,
      supplyDemandRatio: 0.89,
      averagePrice: 925000,
      constructionCosts: 312,
      medianSaleTime: 54
    },
    { 
      type: "Hospitality", 
      icon: <Hotel className="h-5 w-5" />,
      priceGrowth: 3.2, 
      rentalYield: 7.2, 
      vacancyRate: 13.5, 
      cashFlow: 7.8, 
      roi: 9.1,
      supplyDemandRatio: 1.14,
      averagePrice: 1850000,
      constructionCosts: 365,
      medianSaleTime: 83
    },
    { 
      type: "Storage", 
      icon: <Warehouse className="h-5 w-5" />,
      priceGrowth: 8.3, 
      rentalYield: 6.5, 
      vacancyRate: 4.7, 
      cashFlow: 9.1, 
      roi: 14.2,
      supplyDemandRatio: 0.68,
      averagePrice: 675000,
      constructionCosts: 147,
      medianSaleTime: 37
    }
  ],
  // Historical performance by type
  historical: {
    "Residential": [
      { year: 2020, value: 100 },
      { year: 2021, value: 110.3 },
      { year: 2022, value: 118.4 },
      { year: 2023, value: 124.9 },
      { year: 2024, value: 132.7 },
      { year: 2025, value: 141.0 }
    ],
    "Commercial": [
      { year: 2020, value: 100 },
      { year: 2021, value: 103.8 },
      { year: 2022, value: 109.1 },
      { year: 2023, value: 113.7 },
      { year: 2024, value: 118.2 },
      { year: 2025, value: 123.2 }
    ],
    "Industrial": [
      { year: 2020, value: 100 },
      { year: 2021, value: 108.2 },
      { year: 2022, value: 117.6 },
      { year: 2023, value: 128.1 },
      { year: 2024, value: 139.3 },
      { year: 2025, value: 149.7 }
    ],
    "Land": [
      { year: 2020, value: 100 },
      { year: 2021, value: 114.2 },
      { year: 2022, value: 128.5 },
      { year: 2023, value: 139.3 },
      { year: 2024, value: 151.0 },
      { year: 2025, value: 164.9 }
    ],
    "Mixed-Use": [
      { year: 2020, value: 100 },
      { year: 2021, value: 107.3 },
      { year: 2022, value: 115.1 },
      { year: 2023, value: 121.8 },
      { year: 2024, value: 128.6 },
      { year: 2025, value: 135.9 }
    ],
    "Hospitality": [
      { year: 2020, value: 100 },
      { year: 2021, value: 93.5 },
      { year: 2022, value: 98.1 },
      { year: 2023, value: 104.2 },
      { year: 2024, value: 110.3 },
      { year: 2025, value: 113.8 }
    ],
    "Storage": [
      { year: 2020, value: 100 },
      { year: 2021, value: 112.7 },
      { year: 2022, value: 123.8 },
      { year: 2023, value: 135.2 },
      { year: 2024, value: 147.1 },
      { year: 2025, value: 159.3 }
    ]
  },
  // Market share by property type
  marketShare: [
    { type: "Residential", value: 62.3, color: "#3b82f6" },
    { type: "Commercial", value: 14.7, color: "#ef4444" },
    { type: "Industrial", value: 9.2, color: "#f59e0b" },
    { type: "Land", value: 6.8, color: "#10b981" },
    { type: "Mixed-Use", value: 3.5, color: "#8b5cf6" },
    { type: "Hospitality", value: 2.1, color: "#ec4899" },
    { type: "Storage", value: 1.4, color: "#6366f1" }
  ],
  // Regional variations
  regionalTrends: [
    { region: "Northeast", residential: 5.8, commercial: 3.9, industrial: 6.7, land: 7.3 },
    { region: "Midwest", residential: 4.1, commercial: 2.3, industrial: 5.2, land: 6.1 },
    { region: "South", residential: 7.2, commercial: 4.8, industrial: 8.9, land: 11.2 },
    { region: "West", residential: 6.9, commercial: 5.1, industrial: 8.3, land: 8.7 }
  ],
  // Risk-reward profiles
  riskRewardProfile: [
    { type: "Residential", risk: 4.2, reward: 6.3, stability: 8.5, liquidity: 7.9, barrier: 5.2 },
    { type: "Commercial", risk: 6.5, reward: 7.2, stability: 6.1, liquidity: 5.8, barrier: 7.6 },
    { type: "Industrial", risk: 5.7, reward: 8.1, stability: 7.2, liquidity: 6.3, barrier: 6.9 },
    { type: "Land", risk: 7.8, reward: 9.3, stability: 4.8, liquidity: 3.9, barrier: 6.1 },
    { type: "Mixed-Use", risk: 5.9, reward: 7.5, stability: 6.8, liquidity: 6.2, barrier: 7.3 },
    { type: "Hospitality", risk: 8.3, reward: 7.9, stability: 4.5, liquidity: 4.2, barrier: 8.5 },
    { type: "Storage", risk: 5.3, reward: 8.7, stability: 7.4, liquidity: 6.8, barrier: 5.8 }
  ]
};

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#6366f1'];

// Active pie sector component for the pie chart
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.type}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value}%`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export function PropertyTypeComparison() {
  const [metricView, setMetricView] = useState("roi");
  const [historicalView, setHistoricalView] = useState("index");
  const [selectedType, setSelectedType] = useState("Residential");
  const [activePieIndex, setActivePieIndex] = useState(0);
  
  // Combined historical data for all types
  const combinedHistoricalData = [];
  for (let i = 0; i < propertyTypeData.historical.Residential.length; i++) {
    const yearData: Record<string, any> = { year: propertyTypeData.historical.Residential[i].year };
    Object.keys(propertyTypeData.historical).forEach(type => {
      yearData[type] = propertyTypeData.historical[type as keyof typeof propertyTypeData.historical][i].value;
    });
    combinedHistoricalData.push(yearData);
  }
  
  // Format metric label
  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case "priceGrowth": return "Price Growth (YoY %)";
      case "rentalYield": return "Rental Yield (%)";
      case "vacancyRate": return "Vacancy Rate (%)";
      case "cashFlow": return "Cash Flow Return (%)";
      case "roi": return "Total ROI (%)";
      case "supplyDemandRatio": return "Supply/Demand Ratio";
      case "averagePrice": return "Average Price ($)";
      case "constructionCosts": return "Construction Costs ($/sqft)";
      case "medianSaleTime": return "Median Days on Market";
      default: return metric;
    }
  };
  
  // Get color for metric value
  const getMetricColor = (metric: string, value: number) => {
    // Higher is better for some metrics
    if (metric === "priceGrowth" || metric === "rentalYield" || metric === "cashFlow" || metric === "roi") {
      if (value >= 10) return "text-emerald-600";
      if (value >= 6) return "text-emerald-500";
      if (value >= 3) return "text-amber-500";
      return "text-red-500";
    }
    // Lower is better for some metrics
    else if (metric === "vacancyRate" || metric === "supplyDemandRatio" || metric === "medianSaleTime") {
      if (metric === "supplyDemandRatio") {
        if (value <= 0.8) return "text-emerald-600";
        if (value < 1) return "text-emerald-500";
        if (value < 1.1) return "text-amber-500";
        return "text-red-500";
      } else {
        if (value <= 3) return "text-emerald-600";
        if (value <= 5) return "text-emerald-500";
        if (value <= 10) return "text-amber-500";
        return "text-red-500";
      }
    }
    // Neutral metrics (no color)
    return "text-gray-700";
  };
  
  // Is this metric higher is better?
  const isHigherBetter = (metric: string) => {
    return ["priceGrowth", "rentalYield", "cashFlow", "roi", "averagePrice"].includes(metric);
  };
  
  // Format value based on metric type
  const formatMetricValue = (metric: string, value: number) => {
    if (metric === "averagePrice") {
      return `$${value.toLocaleString()}`;
    }
    if (metric === "constructionCosts") {
      return `$${value}/sqft`;
    }
    if (metric === "supplyDemandRatio") {
      return value.toFixed(2);
    }
    if (metric === "medianSaleTime") {
      return `${value} days`;
    }
    return `${value}%`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Property Type Analysis</h2>
          <p className="text-gray-500">Compare metrics across different real estate asset classes</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={metricView} onValueChange={setMetricView}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roi">Total ROI</SelectItem>
              <SelectItem value="priceGrowth">Price Growth</SelectItem>
              <SelectItem value="rentalYield">Rental Yield</SelectItem>
              <SelectItem value="vacancyRate">Vacancy Rate</SelectItem>
              <SelectItem value="cashFlow">Cash Flow</SelectItem>
              <SelectItem value="medianSaleTime">Days on Market</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" title="Download data">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Performance comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
          <CardDescription>Key metrics by property type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={propertyTypeData.performance}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis 
                  domain={
                    metricView === "medianSaleTime" 
                      ? [0, 100] 
                      : metricView === "averagePrice" 
                        ? [0, 2000000]
                        : ['auto', 'auto']
                  }
                  tickFormatter={(value) => {
                    if (metricView === "averagePrice") {
                      return `$${value/1000}k`;
                    }
                    return value;
                  }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "averagePrice") {
                      return [`$${Number(value).toLocaleString()}`, getMetricLabel(metricView)];
                    }
                    if (name === "constructionCosts") {
                      return [`$${value}/sqft`, getMetricLabel(metricView)];
                    }
                    if (name === "medianSaleTime") {
                      return [`${value} days`, getMetricLabel(metricView)];
                    }
                    if (name === "supplyDemandRatio") {
                      return [value, getMetricLabel(metricView)];
                    }
                    return [`${value}%`, getMetricLabel(metricView)];
                  }} 
                />
                <Legend />
                <Bar 
                  dataKey={metricView} 
                  name={getMetricLabel(metricView)}
                  fill="#3b82f6"
                >
                  {propertyTypeData.performance.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Historical Performance</CardTitle>
                <CardDescription>Property value index (2020 = 100)</CardDescription>
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.keys(propertyTypeData.historical).map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {selectedType === "all" ? (
                  <LineChart
                    data={combinedHistoricalData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis 
                      domain={[90, 170]}
                      label={{ value: 'Index Value (2020=100)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}`, 'Index Value']}
                    />
                    <Legend />
                    {Object.keys(propertyTypeData.historical).map((type, index) => (
                      <Line
                        key={type}
                        type="monotone"
                        dataKey={type}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        name={type}
                      />
                    ))}
                  </LineChart>
                ) : (
                  <LineChart
                    data={propertyTypeData.historical[selectedType as keyof typeof propertyTypeData.historical]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis 
                      domain={[90, 170]}
                      label={{ value: 'Index Value (2020=100)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}`, 'Index Value']}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={COLORS[Object.keys(propertyTypeData.historical).indexOf(selectedType) % COLORS.length]}
                      strokeWidth={3}
                      activeDot={{ r: 8 }}
                      name={selectedType}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="text-sm text-gray-500">
              <Clock className="h-4 w-4 inline-block mr-1" />
              Performance indexed to 2020 = 100
            </div>
            <Button variant="outline" size="sm">
              <ListFilter className="h-4 w-4 mr-2" />
              Adjust Timeframe
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Market Share</CardTitle>
            <CardDescription>Distribution by property type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activePieIndex}
                    activeShape={renderActiveShape}
                    data={propertyTypeData.marketShare}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                  >
                    {propertyTypeData.marketShare.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Market Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Risk-Reward Profiles */}
      <Card>
        <CardHeader>
          <CardTitle>Risk-Reward Profiles</CardTitle>
          <CardDescription>Comparative analysis across multiple dimensions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={150} width={500} height={500} data={propertyTypeData.riskRewardProfile}>
                <PolarGrid />
                <PolarAngleAxis dataKey="type" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="Risk" dataKey="risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                <Radar name="Reward" dataKey="reward" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Radar name="Stability" dataKey="stability" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                <Radar name="Liquidity" dataKey="liquidity" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} />
                <Radar name="Barrier to Entry" dataKey="barrier" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Detailed metrics table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Property Type Metrics</CardTitle>
          <CardDescription>Comprehensive investment metrics for comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Property Type</th>
                  <th className="text-right py-3 font-medium">Price Growth</th>
                  <th className="text-right py-3 font-medium">Rental Yield</th>
                  <th className="text-right py-3 font-medium">Vacancy Rate</th>
                  <th className="text-right py-3 font-medium">Cash Flow</th>
                  <th className="text-right py-3 font-medium">Total ROI</th>
                  <th className="text-right py-3 font-medium">Days on Market</th>
                </tr>
              </thead>
              <tbody>
                {propertyTypeData.performance.map(item => (
                  <tr key={item.type} className="border-b">
                    <td className="py-3 flex items-center">
                      <div className="p-1.5 rounded-full bg-blue-100 text-blue-800 mr-2">
                        {item.icon}
                      </div>
                      {item.type}
                    </td>
                    <td className={`text-right py-3 ${getMetricColor("priceGrowth", item.priceGrowth)}`}>
                      {isHigherBetter("priceGrowth") ? 
                        <ArrowUpRight className="h-3 w-3 inline-block mr-1" /> : 
                        <ArrowDownRight className="h-3 w-3 inline-block mr-1" />
                      }
                      {item.priceGrowth}%
                    </td>
                    <td className={`text-right py-3 ${getMetricColor("rentalYield", item.rentalYield)}`}>
                      {item.rentalYield}%
                    </td>
                    <td className={`text-right py-3 ${getMetricColor("vacancyRate", item.vacancyRate)}`}>
                      {item.vacancyRate}%
                    </td>
                    <td className={`text-right py-3 ${getMetricColor("cashFlow", item.cashFlow)}`}>
                      {item.cashFlow}%
                    </td>
                    <td className={`text-right py-3 ${getMetricColor("roi", item.roi)}`}>
                      {item.roi}%
                    </td>
                    <td className={`text-right py-3 ${getMetricColor("medianSaleTime", item.medianSaleTime)}`}>
                      {item.medianSaleTime} days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="text-sm text-gray-500">
            <DollarSign className="h-4 w-4 inline-block mr-1" />
            Data as of April 2025
          </div>
          <div>
            <Badge variant="outline" className="mr-2">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              Storage: Highest ROI
            </Badge>
            <Badge variant="outline">
              <Building className="h-3.5 w-3.5 mr-1" />
              Residential: Highest Stability
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}