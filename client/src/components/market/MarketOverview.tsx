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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  Activity,
  RefreshCw,
  Clock,
  Calendar,
  BarChart4,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  MoveHorizontal
} from "lucide-react";
import { 
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
  BarChart,
  Bar
} from "recharts";

// Sample market data
const marketSummary = {
  averagePrice: 425000,
  priceChange: 6.3,
  inventoryChange: -8.5,
  daysOnMarket: 28,
  mortgageRate: 5.12,
  affordabilityIndex: 104,
  lastUpdated: "2025-04-12"
};

const priceHistory = [
  { month: 'Apr 2024', price: 400000, inventory: 1250, sales: 620 },
  { month: 'May 2024', price: 402000, inventory: 1200, sales: 640 },
  { month: 'Jun 2024', price: 408000, inventory: 1180, sales: 670 },
  { month: 'Jul 2024', price: 410000, inventory: 1150, sales: 690 },
  { month: 'Aug 2024', price: 415000, inventory: 1120, sales: 710 },
  { month: 'Sep 2024', price: 419000, inventory: 1100, sales: 680 },
  { month: 'Oct 2024', price: 420000, inventory: 1080, sales: 650 },
  { month: 'Nov 2024', price: 418000, inventory: 1050, sales: 620 },
  { month: 'Dec 2024', price: 417000, inventory: 1020, sales: 580 },
  { month: 'Jan 2025', price: 415000, inventory: 1000, sales: 570 },
  { month: 'Feb 2025', price: 418000, inventory: 980, sales: 590 },
  { month: 'Mar 2025', price: 422000, inventory: 950, sales: 610 },
  { month: 'Apr 2025', price: 425000, inventory: 900, sales: 630 }
];

const propertyTypeTrends = [
  { type: 'Single-Family', price: 538000, change: 7.2 },
  { type: 'Condo', price: 315000, change: 4.5 },
  { type: 'Townhouse', price: 412000, change: 6.8 },
  { type: 'Multi-Family', price: 792000, change: 9.1 },
  { type: 'Land', price: 221000, change: -2.3 }
];

const regionalData = [
  { region: 'Northeast', price: 475000, change: 5.8, inventory: -7.2 },
  { region: 'Midwest', price: 325000, change: 4.2, inventory: -3.5 },
  { region: 'South', price: 398000, change: 6.7, inventory: -10.2 },
  { region: 'West', price: 612000, change: 8.5, inventory: -12.8 }
];

export function MarketOverview() {
  const [timeframe, setTimeframe] = useState("1y");
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold">Market Summary</h2>
          <p className="text-gray-500">Last updated: {new Date(marketSummary.lastUpdated).toLocaleDateString()}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last 12 Months</SelectItem>
              <SelectItem value="2y">Last 2 Years</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" title="Refresh data">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Key Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <DollarSign className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-gray-500">Average Price</p>
              <p className="text-2xl font-bold">${marketSummary.averagePrice.toLocaleString()}</p>
              <div className={`flex items-center text-sm mt-1 ${marketSummary.priceChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {marketSummary.priceChange >= 0 ? 
                  <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                }
                {Math.abs(marketSummary.priceChange)}% YoY
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Home className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-gray-500">Inventory</p>
              <p className="text-2xl font-bold">900 listings</p>
              <div className={`flex items-center text-sm mt-1 ${marketSummary.inventoryChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {marketSummary.inventoryChange >= 0 ? 
                  <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                }
                {Math.abs(marketSummary.inventoryChange)}% YoY
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Clock className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-gray-500">Days on Market</p>
              <p className="text-2xl font-bold">{marketSummary.daysOnMarket} days</p>
              <div className="flex items-center text-sm mt-1 text-gray-500">
                <MoveHorizontal className="h-3 w-3 mr-1" />
                -3 days MoM
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-gray-500">Monthly Sales</p>
              <p className="text-2xl font-bold">630 homes</p>
              <div className="flex items-center text-sm mt-1 text-emerald-600">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                3.3% MoM
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Activity className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-gray-500">Mortgage Rate</p>
              <p className="text-2xl font-bold">{marketSummary.mortgageRate}%</p>
              <div className="flex items-center text-sm mt-1 text-red-600">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                0.18 pts MoM
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <BarChart4 className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-gray-500">Affordability</p>
              <p className="text-2xl font-bold">{marketSummary.affordabilityIndex}</p>
              <div className="flex items-center text-sm mt-1 text-red-600">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                -2.8 pts YoY
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Price & Sales Trends</CardTitle>
            <CardDescription>Average home prices and monthly sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={priceHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" domain={['auto', 'auto']} />
                  <YAxis yAxisId="right" orientation="right" domain={[500, 750]} />
                  <Tooltip formatter={(value, name) => {
                    if (name === "price") return ["$" + value.toLocaleString(), "Avg. Price"];
                    if (name === "sales") return [value, "Monthly Sales"];
                    return [value, name];
                  }} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="price" 
                    stroke="#3b82f6" 
                    activeDot={{ r: 8 }} 
                    name="Avg. Price"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#10b981" 
                    name="Monthly Sales"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Inventory Levels</CardTitle>
            <CardDescription>Available listings on market over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={priceHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => {
                    if (name === "inventory") return [value.toLocaleString(), "Available Listings"];
                    return [value, name];
                  }} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="inventory" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.3}
                    name="Available Listings"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Property types and regional data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Type Analysis</CardTitle>
            <CardDescription>Price trends by property category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={propertyTypeTrends}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 800000]} tickFormatter={(value) => `$${value/1000}k`} />
                  <YAxis type="category" dataKey="type" width={100} />
                  <Tooltip formatter={(value, name) => {
                    if (name === "price") return ["$" + value.toLocaleString(), "Avg. Price"];
                    return [value, name];
                  }} />
                  <Legend />
                  <Bar 
                    dataKey="price" 
                    fill="#3b82f6" 
                    name="Avg. Price"
                    label={(props) => {
                      const { x, y, width, value, change } = props;
                      const color = change >= 0 ? "#10b981" : "#ef4444";
                      const sign = change >= 0 ? "+" : "";
                      return (
                        <text 
                          x={x + width + 5} 
                          y={y + 4} 
                          fontSize="12" 
                          textAnchor="start" 
                          fill={color}
                        >
                          {sign}{change}%
                        </text>
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Regional Market Insights</CardTitle>
            <CardDescription>Price and inventory changes by region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {regionalData.map(region => (
                <div key={region.region} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{region.region}</h3>
                    <span className="text-sm font-medium">${region.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <div className={`${region.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {region.change >= 0 ? 
                        <ArrowUpRight className="h-3 w-3 inline mr-1" /> : 
                        <ArrowDownRight className="h-3 w-3 inline mr-1" />
                      }
                      {Math.abs(region.change)}% price (YoY)
                    </div>
                    <div className={`${region.inventory >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {region.inventory >= 0 ? 
                        <ArrowUpRight className="h-3 w-3 inline mr-1" /> : 
                        <ArrowDownRight className="h-3 w-3 inline mr-1" />
                      }
                      {Math.abs(region.inventory)}% inventory
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${region.change >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(region.change) * 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View Detailed Regional Analysis</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}