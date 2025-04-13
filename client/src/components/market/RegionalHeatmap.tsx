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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Download, 
  Filter, 
  Info,
  RefreshCw, 
  Map
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";

// Sample regional market data
const regionalData = {
  regions: [
    { region: "Northeast", priceGrowth: 6.8, inventory: -7.2, affordability: 82, salesVolume: 5.3, daysOnMarket: 32 },
    { region: "Mid-Atlantic", priceGrowth: 5.9, inventory: -5.3, affordability: 78, salesVolume: 3.1, daysOnMarket: 28 },
    { region: "Southeast", priceGrowth: 8.3, inventory: -9.6, affordability: 89, salesVolume: 7.5, daysOnMarket: 24 },
    { region: "Midwest", priceGrowth: 4.2, inventory: -2.8, affordability: 104, salesVolume: 2.8, daysOnMarket: 34 },
    { region: "Southwest", priceGrowth: 7.4, inventory: -8.2, affordability: 92, salesVolume: 6.4, daysOnMarket: 26 },
    { region: "West", priceGrowth: 6.2, inventory: -10.1, affordability: 68, salesVolume: 3.2, daysOnMarket: 29 },
    { region: "Northwest", priceGrowth: 5.7, inventory: -6.8, affordability: 75, salesVolume: 2.9, daysOnMarket: 33 },
    { region: "Mountain", priceGrowth: 9.3, inventory: -11.2, affordability: 82, salesVolume: 8.1, daysOnMarket: 25 },
    { region: "South Central", priceGrowth: 6.9, inventory: -7.5, affordability: 95, salesVolume: 5.8, daysOnMarket: 27 }
  ],
  cities: [
    { city: "New York, NY", region: "Northeast", priceGrowth: 5.3, inventory: -4.2, affordability: 62, salesVolume: 2.8, daysOnMarket: 45, population: 8.8 },
    { city: "Los Angeles, CA", region: "West", priceGrowth: 5.4, inventory: -8.7, affordability: 59, salesVolume: 3.1, daysOnMarket: 38, population: 4.0 },
    { city: "Chicago, IL", region: "Midwest", priceGrowth: 3.3, inventory: -1.6, affordability: 88, salesVolume: 2.2, daysOnMarket: 42, population: 2.7 },
    { city: "Houston, TX", region: "South Central", priceGrowth: 6.8, inventory: -5.4, affordability: 97, salesVolume: 6.2, daysOnMarket: 32, population: 2.3 },
    { city: "Phoenix, AZ", region: "Southwest", priceGrowth: 8.2, inventory: -9.6, affordability: 85, salesVolume: 7.3, daysOnMarket: 28, population: 1.6 },
    { city: "Philadelphia, PA", region: "Mid-Atlantic", priceGrowth: 4.9, inventory: -3.2, affordability: 82, salesVolume: 2.6, daysOnMarket: 35, population: 1.6 },
    { city: "San Antonio, TX", region: "South Central", priceGrowth: 7.3, inventory: -6.2, affordability: 103, salesVolume: 6.5, daysOnMarket: 29, population: 1.5 },
    { city: "San Diego, CA", region: "West", priceGrowth: 6.9, inventory: -11.3, affordability: 62, salesVolume: 3.8, daysOnMarket: 32, population: 1.4 },
    { city: "Dallas, TX", region: "South Central", priceGrowth: 7.8, inventory: -7.9, affordability: 92, salesVolume: 7.2, daysOnMarket: 25, population: 1.3 },
    { city: "Austin, TX", region: "South Central", priceGrowth: 9.4, inventory: -12.3, affordability: 78, salesVolume: 8.4, daysOnMarket: 22, population: 1.0 },
    { city: "Jacksonville, FL", region: "Southeast", priceGrowth: 8.7, inventory: -10.2, affordability: 90, salesVolume: 7.9, daysOnMarket: 26, population: 0.9 },
    { city: "San Francisco, CA", region: "West", priceGrowth: 4.2, inventory: -5.8, affordability: 45, salesVolume: 1.8, daysOnMarket: 40, population: 0.9 },
    { city: "Charlotte, NC", region: "Southeast", priceGrowth: 8.9, inventory: -8.4, affordability: 88, salesVolume: 7.6, daysOnMarket: 23, population: 0.9 },
    { city: "Seattle, WA", region: "Northwest", priceGrowth: 5.4, inventory: -7.2, affordability: 68, salesVolume: 3.2, daysOnMarket: 36, population: 0.7 },
    { city: "Denver, CO", region: "Mountain", priceGrowth: 6.6, inventory: -8.9, affordability: 72, salesVolume: 5.3, daysOnMarket: 28, population: 0.7 },
    { city: "Boston, MA", region: "Northeast", priceGrowth: 4.6, inventory: -3.7, affordability: 65, salesVolume: 2.4, daysOnMarket: 38, population: 0.7 },
    { city: "Nashville, TN", region: "Southeast", priceGrowth: 7.8, inventory: -8.1, affordability: 84, salesVolume: 6.8, daysOnMarket: 25, population: 0.7 },
    { city: "Atlanta, GA", region: "Southeast", priceGrowth: 7.2, inventory: -7.5, affordability: 86, salesVolume: 6.3, daysOnMarket: 27, population: 0.5 },
    { city: "Miami, FL", region: "Southeast", priceGrowth: 10.3, inventory: -13.4, affordability: 71, salesVolume: 9.2, daysOnMarket: 19, population: 0.5 },
    { city: "Boise, ID", region: "Mountain", priceGrowth: 11.2, inventory: -14.8, affordability: 78, salesVolume: 10.5, daysOnMarket: 18, population: 0.2 }
  ]
};

// Custom tooltip component for the scatter chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border rounded shadow-md text-sm">
        <p className="font-bold">{data.city}</p>
        <p className="text-gray-500">{data.region} Region</p>
        <div className="mt-2 space-y-1">
          <p>Price Growth: <span className="font-semibold">{data.priceGrowth}%</span></p>
          <p>Affordability: <span className="font-semibold">{data.affordability}/100</span></p>
          <p>Days on Market: <span className="font-semibold">{data.daysOnMarket} days</span></p>
          <p>Inventory Change: <span className="font-semibold">{data.inventory}%</span></p>
        </div>
      </div>
    );
  }
  return null;
};

export function RegionalHeatmap() {
  const [dataView, setDataView] = useState("regional");
  const [metric, setMetric] = useState("priceGrowth");
  const [regionFilter, setRegionFilter] = useState("all");
  
  // Helper function to get color based on value
  const getMetricColor = (value: number, metricType: string) => {
    if (metricType === "priceGrowth" || metricType === "salesVolume") {
      if (value >= 9) return "#15803d"; // dark green for high growth
      if (value >= 7) return "#22c55e"; // green for good growth
      if (value >= 5) return "#86efac"; // light green for moderate growth
      if (value >= 3) return "#fde68a"; // yellow for low growth
      return "#fca5a5"; // red for minimal growth
    } else if (metricType === "inventory") {
      if (value >= 0) return "#22c55e"; // green for positive inventory
      if (value >= -5) return "#fde68a"; // yellow for slightly negative
      if (value >= -10) return "#fb923c"; // orange for moderately negative
      return "#ef4444"; // red for very negative
    } else if (metricType === "affordability") {
      if (value >= 95) return "#15803d"; // dark green for highly affordable
      if (value >= 85) return "#22c55e"; // green for affordable
      if (value >= 75) return "#fde68a"; // yellow for moderate
      if (value >= 65) return "#fb923c"; // orange for less affordable
      return "#ef4444"; // red for least affordable
    } else if (metricType === "daysOnMarket") {
      if (value <= 20) return "#15803d"; // dark green for fast sales
      if (value <= 25) return "#22c55e"; // green for quick sales
      if (value <= 30) return "#fde68a"; // yellow for moderate
      if (value <= 35) return "#fb923c"; // orange for slow
      return "#ef4444"; // red for very slow
    }
    return "#cccccc"; // default
  };
  
  // Get filtered data based on selected region
  const getFilteredCityData = () => {
    if (regionFilter === "all") return regionalData.cities;
    return regionalData.cities.filter(city => city.region === regionFilter);
  };
  
  // Format the label for the metric
  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case "priceGrowth": return "Price Growth (%)";
      case "inventory": return "Inventory Change (%)";
      case "affordability": return "Affordability Index";
      case "salesVolume": return "Sales Volume Change (%)";
      case "daysOnMarket": return "Days on Market";
      default: return metric;
    }
  };
  
  // Define domain ranges for scatter plot
  const getDomain = (metric: string) => {
    switch (metric) {
      case "priceGrowth": return [0, 12];
      case "inventory": return [-15, 5];
      case "affordability": return [40, 105];
      case "salesVolume": return [0, 11];
      case "daysOnMarket": return [15, 50];
      default: return [0, 100];
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Regional Market Analysis</h2>
          <p className="text-gray-500">Compare real estate metrics across regions and cities</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dataView} onValueChange={setDataView}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Data View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regional">Regions</SelectItem>
              <SelectItem value="cities">Major Cities</SelectItem>
              <SelectItem value="scatter">Scatter Plot</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priceGrowth">Price Growth</SelectItem>
              <SelectItem value="inventory">Inventory</SelectItem>
              <SelectItem value="affordability">Affordability</SelectItem>
              <SelectItem value="salesVolume">Sales Volume</SelectItem>
              <SelectItem value="daysOnMarket">Days on Market</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" title="Download data">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  {dataView === "regional" ? "Regional" : dataView === "cities" ? "City" : "Interactive"} {getMetricLabel(metric)}
                </CardTitle>
                <CardDescription>
                  Color intensity represents {metric === "inventory" ? "severity of change" : "performance"}
                </CardDescription>
              </div>
              
              {dataView === "cities" && (
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filter by Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {[...new Set(regionalData.cities.map(city => city.region))].map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <Tabs
                value={dataView}
                onValueChange={setDataView}
                className="hidden" // Hide these tabs as we're controlling via the dropdown
              >
                <TabsContent value="regional" className="mt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={regionalData.regions}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        domain={getDomain(metric)}
                        tickFormatter={(value) => metric === "inventory" ? `${value}%` : value.toString()}
                      />
                      <YAxis 
                        dataKey="region" 
                        type="category" 
                        width={100}
                      />
                      <Tooltip 
                        formatter={(value) => {
                          if (metric === "priceGrowth" || metric === "inventory" || metric === "salesVolume") {
                            return [`${value}%`, getMetricLabel(metric)];
                          }
                          return [value, getMetricLabel(metric)];
                        }}
                      />
                      <Bar dataKey={metric} fill="#3b82f6" name={getMetricLabel(metric)}>
                        {regionalData.regions.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getMetricColor(entry[metric as keyof typeof entry] as number, metric)} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
                
                <TabsContent value="cities" className="mt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getFilteredCityData()}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        domain={getDomain(metric)}
                        tickFormatter={(value) => metric === "inventory" ? `${value}%` : value.toString()}
                      />
                      <YAxis 
                        dataKey="city" 
                        type="category" 
                        width={120}
                      />
                      <Tooltip 
                        formatter={(value) => {
                          if (metric === "priceGrowth" || metric === "inventory" || metric === "salesVolume") {
                            return [`${value}%`, getMetricLabel(metric)];
                          }
                          return [value, getMetricLabel(metric)];
                        }}
                      />
                      <Bar dataKey={metric} fill="#3b82f6" name={getMetricLabel(metric)}>
                        {getFilteredCityData().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getMetricColor(entry[metric as keyof typeof entry] as number, metric)} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
                
                <TabsContent value="scatter" className="mt-0">
                  <div className="mb-2 text-center text-sm text-gray-500">
                    Bubble size represents population, color represents {getMetricLabel(metric)}
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="affordability" 
                        name="Affordability" 
                        domain={[40, 110]}
                        label={{ value: "Affordability Index", position: "bottom", offset: 0 }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="priceGrowth" 
                        name="Price Growth" 
                        domain={[0, 12]}
                        label={{ value: "Price Growth (%)", angle: -90, position: "left" }}
                      />
                      <ZAxis
                        type="number"
                        dataKey="population"
                        range={[300, 1500]}
                        name="Population"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Scatter 
                        name="Cities" 
                        data={regionalData.cities}
                      >
                        {regionalData.cities.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getMetricColor(entry[metric as keyof typeof entry] as number, metric)} 
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Market Health Indicators</CardTitle>
            <CardDescription>Performance metrics by region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {regionalData.regions.slice(0, 6).map(region => {
                // Calculate a health score based on metrics
                const healthScore = 
                  (region.priceGrowth / 12) * 30 + 
                  ((region.inventory + 15) / 20) * 20 + 
                  (region.affordability / 105) * 30 + 
                  ((45 - region.daysOnMarket) / 30) * 20;
                
                const getHealthColor = (score: number) => {
                  if (score >= 80) return "text-emerald-600";
                  if (score >= 65) return "text-lime-600";
                  if (score >= 50) return "text-amber-600";
                  if (score >= 35) return "text-orange-600";
                  return "text-red-600";
                };
                
                return (
                  <div key={region.region} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{region.region}</h3>
                      <span className={`font-medium text-sm ${getHealthColor(healthScore)}`}>
                        {Math.round(healthScore)}%
                      </span>
                    </div>
                    <div className="flex space-x-4 text-xs">
                      <div className={region.priceGrowth >= 6 ? "text-emerald-600" : "text-gray-500"}>
                        {region.priceGrowth >= 0 ? 
                          <ArrowUpRight className="h-3 w-3 inline mr-1" /> : 
                          <ArrowDownRight className="h-3 w-3 inline mr-1" />
                        }
                        {region.priceGrowth}%
                      </div>
                      <div className={region.affordability >= 85 ? "text-emerald-600" : "text-gray-500"}>
                        {region.affordability}/100
                      </div>
                      <div className={region.daysOnMarket <= 28 ? "text-emerald-600" : "text-gray-500"}>
                        {region.daysOnMarket} days
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getHealthColor(healthScore)}`}
                        style={{ width: `${healthScore}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-4">
                <Button variant="outline" className="w-full flex items-center">
                  <Map className="h-4 w-4 mr-2" />
                  View Interactive Map
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="p-4 bg-blue-50 rounded-lg flex items-start space-x-4">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-blue-800">About Regional Analysis</p>
          <p className="text-blue-700 mt-1">
            This analysis compares market trends across different geographic regions. 
            Higher price growth indicates stronger demand, while inventory changes reflect supply conditions. 
            The affordability index measures the relationship between household income and housing costs 
            (higher is more affordable). Use these metrics to identify promising investment locations.
          </p>
        </div>
      </div>
    </div>
  );
}