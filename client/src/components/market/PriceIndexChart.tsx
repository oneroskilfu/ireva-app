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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Area,
  Bar
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Download, Filter, RefreshCw } from "lucide-react";

// Sample price index data
const priceIndexData = {
  national: [
    { date: '2020-04', index: 100.0, trend: 100.0 },
    { date: '2020-07', index: 102.1, trend: 101.2 },
    { date: '2020-10', index: 104.5, trend: 102.5 },
    { date: '2021-01', index: 106.3, trend: 103.9 },
    { date: '2021-04', index: 109.8, trend: 105.7 },
    { date: '2021-07', index: 115.2, trend: 107.8 },
    { date: '2021-10', index: 118.7, trend: 110.2 },
    { date: '2022-01', index: 122.3, trend: 112.9 },
    { date: '2022-04', index: 127.1, trend: 115.8 },
    { date: '2022-07', index: 130.5, trend: 118.9 },
    { date: '2022-10', index: 132.7, trend: 122.1 },
    { date: '2023-01', index: 133.2, trend: 125.4 },
    { date: '2023-04', index: 134.8, trend: 128.7 },
    { date: '2023-07', index: 136.3, trend: 131.8 },
    { date: '2023-10', index: 137.5, trend: 134.5 },
    { date: '2024-01', index: 138.4, trend: 136.9 },
    { date: '2024-04', index: 140.1, trend: 139.0 },
    { date: '2024-07', index: 142.3, trend: 140.7 },
    { date: '2024-10', index: 144.5, trend: 142.0 },
    { date: '2025-01', index: 146.2, trend: 143.1 },
    { date: '2025-04', index: 148.7, trend: 144.0 }
  ],
  // City-specific data
  cities: [
    {
      name: "New York",
      data: [
        { date: '2020-04', index: 100.0 },
        { date: '2020-10', index: 101.2 },
        { date: '2021-04', index: 103.5 },
        { date: '2021-10', index: 108.9 },
        { date: '2022-04', index: 116.7 },
        { date: '2022-10', index: 123.5 },
        { date: '2023-04', index: 127.9 },
        { date: '2023-10', index: 129.8 },
        { date: '2024-04', index: 133.2 },
        { date: '2024-10', index: 137.4 },
        { date: '2025-04', index: 140.2 }
      ],
      yearlyChange: 5.3
    },
    {
      name: "Los Angeles",
      data: [
        { date: '2020-04', index: 100.0 },
        { date: '2020-10', index: 104.3 },
        { date: '2021-04', index: 112.6 },
        { date: '2021-10', index: 122.1 },
        { date: '2022-04', index: 134.5 },
        { date: '2022-10', index: 141.8 },
        { date: '2023-04', index: 144.3 },
        { date: '2023-10', index: 146.1 },
        { date: '2024-04', index: 149.5 },
        { date: '2024-10', index: 153.2 },
        { date: '2025-04', index: 157.6 }
      ],
      yearlyChange: 5.4
    },
    {
      name: "Chicago",
      data: [
        { date: '2020-04', index: 100.0 },
        { date: '2020-10', index: 101.8 },
        { date: '2021-04', index: 105.6 },
        { date: '2021-10', index: 111.2 },
        { date: '2022-04', index: 119.8 },
        { date: '2022-10', index: 124.3 },
        { date: '2023-04', index: 126.5 },
        { date: '2023-10', index: 127.2 },
        { date: '2024-04', index: 128.3 },
        { date: '2024-10', index: 130.1 },
        { date: '2025-04', index: 132.5 }
      ],
      yearlyChange: 3.3
    },
    {
      name: "Miami",
      data: [
        { date: '2020-04', index: 100.0 },
        { date: '2020-10', index: 105.2 },
        { date: '2021-04', index: 116.8 },
        { date: '2021-10', index: 132.4 },
        { date: '2022-04', index: 149.6 },
        { date: '2022-10', index: 159.3 },
        { date: '2023-04', index: 163.7 },
        { date: '2023-10', index: 167.2 },
        { date: '2024-04', index: 171.4 },
        { date: '2024-10', index: 175.6 },
        { date: '2025-04', index: 181.3 }
      ],
      yearlyChange: 5.8
    },
    {
      name: "Dallas",
      data: [
        { date: '2020-04', index: 100.0 },
        { date: '2020-10', index: 104.1 },
        { date: '2021-04', index: 112.2 },
        { date: '2021-10', index: 124.6 },
        { date: '2022-04', index: 138.1 },
        { date: '2022-10', index: 146.2 },
        { date: '2023-04', index: 149.8 },
        { date: '2023-10', index: 152.3 },
        { date: '2024-04', index: 155.6 },
        { date: '2024-10', index: 160.1 },
        { date: '2025-04', index: 165.7 }
      ],
      yearlyChange: 6.5
    },
    {
      name: "Seattle",
      data: [
        { date: '2020-04', index: 100.0 },
        { date: '2020-10', index: 107.3 },
        { date: '2021-04', index: 119.6 },
        { date: '2021-10', index: 132.2 },
        { date: '2022-04', index: 146.5 },
        { date: '2022-10', index: 151.7 },
        { date: '2023-04', index: 149.2 },
        { date: '2023-10', index: 147.6 },
        { date: '2024-04', index: 148.3 },
        { date: '2024-10', index: 152.4 },
        { date: '2025-04', index: 156.3 }
      ],
      yearlyChange: 5.4
    },
    {
      name: "Boston",
      data: [
        { date: '2020-04', index: 100.0 },
        { date: '2020-10', index: 102.2 },
        { date: '2021-04', index: 107.1 },
        { date: '2021-10', index: 116.3 },
        { date: '2022-04', index: 127.8 },
        { date: '2022-10', index: 135.6 },
        { date: '2023-04', index: 139.1 },
        { date: '2023-10', index: 141.3 },
        { date: '2024-04', index: 143.5 },
        { date: '2024-10', index: 146.8 },
        { date: '2025-04', index: 150.1 }
      ],
      yearlyChange: 4.6
    },
    {
      name: "Austin",
      data: [
        { date: '2020-04', index: 100.0 },
        { date: '2020-10', index: 106.5 },
        { date: '2021-04', index: 118.7 },
        { date: '2021-10', index: 134.6 },
        { date: '2022-04', index: 152.3 },
        { date: '2022-10', index: 159.7 },
        { date: '2023-04', index: 157.5 },
        { date: '2023-10', index: 155.4 },
        { date: '2024-04', index: 156.2 },
        { date: '2024-10', index: 160.3 },
        { date: '2025-04', index: 165.4 }
      ],
      yearlyChange: 5.9
    }
  ],
  // Growth rates comparison
  growthData: [
    { name: '2020', national: 3.8, metro: 4.2, rural: 2.9 },
    { name: '2021', national: 17.4, metro: 18.5, rural: 15.2 },
    { name: '2022', national: 13.9, metro: 14.2, rural: 13.1 },
    { name: '2023', national: 6.1, metro: 5.3, rural: 8.4 },
    { name: '2024', national: 6.8, metro: 6.5, rural: 7.6 },
    { name: '2025 (YTD)', national: 4.2, metro: 3.9, rural: 4.8 }
  ]
};

// Helper function to format date strings
function formatDateLabel(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
}

// Display YoY change
const YoyChange = ({ value }: { value: number }) => {
  return (
    <div className={`flex items-center text-sm ${value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
      {value >= 0 ? 
        <ArrowUpRight className="h-3 w-3 mr-1" /> : 
        <ArrowDownRight className="h-3 w-3 mr-1" />
      }
      {Math.abs(value).toFixed(1)}% YoY
    </div>
  );
};

export function PriceIndexChart() {
  const [indexType, setIndexType] = useState("national");
  const [selectedCities, setSelectedCities] = useState<string[]>(["New York", "Miami", "Seattle"]);
  const [timeframe, setTimeframe] = useState("5y");
  const [growthView, setGrowthView] = useState("nominal");
  
  // Filter data based on timeframe
  const getFilteredData = () => {
    const now = new Date('2025-04');
    let monthsBack = 0;
    
    switch (timeframe) {
      case "1y": monthsBack = 12; break;
      case "3y": monthsBack = 36; break;
      case "5y": monthsBack = 60; break;
      case "10y": monthsBack = 120; break;
      default: return priceIndexData.national;
    }
    
    const cutoffDate = new Date(now);
    cutoffDate.setMonth(now.getMonth() - monthsBack);
    const cutoffStr = cutoffDate.toISOString().substring(0, 7); // YYYY-MM format
    
    return priceIndexData.national.filter(item => item.date >= cutoffStr);
  };
  
  // Create combined city data for chart
  const combineSelectedCityData = () => {
    const result: Record<string, any>[] = [];
    
    // Get the date range from the first city (assuming all have same dates)
    const dateRange = priceIndexData.cities[0].data.map(item => item.date);
    
    dateRange.forEach(date => {
      const dataPoint: Record<string, any> = { date };
      
      priceIndexData.cities.forEach(city => {
        if (selectedCities.includes(city.name)) {
          const cityDataPoint = city.data.find(d => d.date === date);
          if (cityDataPoint) {
            dataPoint[city.name] = cityDataPoint.index;
          }
        }
      });
      
      result.push(dataPoint);
    });
    
    return result;
  };
  
  const nationalData = getFilteredData();
  const cityData = combineSelectedCityData();
  
  // Get latest index value and calculate YoY change
  const latestIndex = priceIndexData.national[priceIndexData.national.length - 1].index;
  const yearAgoIndex = priceIndexData.national[priceIndexData.national.length - 5].index;
  const yearOverYearChange = ((latestIndex - yearAgoIndex) / yearAgoIndex) * 100;
  
  const toggleCitySelection = (cityName: string) => {
    if (selectedCities.includes(cityName)) {
      setSelectedCities(selectedCities.filter(name => name !== cityName));
    } else {
      setSelectedCities([...selectedCities, cityName]);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>National Housing Price Index</CardTitle>
                <CardDescription>Base: April 2020 = 100</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-[90px]">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1y">1 Year</SelectItem>
                    <SelectItem value="3y">3 Years</SelectItem>
                    <SelectItem value="5y">5 Years</SelectItem>
                    <SelectItem value="10y">10 Years</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon" title="Refresh data">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="icon" title="Download data">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={nationalData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => formatDateLabel(value)}
                  />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip 
                    formatter={(value) => [`${value}`, 'Index Value']}
                    labelFormatter={(value) => formatDateLabel(value as string)}
                  />
                  <Legend />
                  <ReferenceLine
                    y={100}
                    stroke="#888888"
                    strokeDasharray="3 3"
                    label={{ value: "Base (100)", position: "insideBottomRight" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="index"
                    stroke="#3b82f6"
                    activeDot={{ r: 8 }}
                    name="Price Index"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="trend"
                    stroke="#9ca3af"
                    strokeDasharray="5 5"
                    name="Trend Line"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Index Data</CardTitle>
            <CardDescription>As of April 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-gray-500">National Index Value</p>
                <p className="text-4xl font-bold">{latestIndex.toFixed(1)}</p>
                <YoyChange value={yearOverYearChange} />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Index by Metropolitan Area</h3>
                
                {priceIndexData.cities.slice(0, 5).map(city => {
                  const latestValue = city.data[city.data.length - 1].index;
                  return (
                    <div key={city.name} className="flex justify-between items-center">
                      <span>{city.name}</span>
                      <div className="flex items-center gap-3">
                        <Badge variant={city.yearlyChange > 5 ? "default" : "outline"}>
                          {latestValue.toFixed(1)}
                        </Badge>
                        <YoyChange value={city.yearlyChange} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Metros</Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Metro Area Index Comparison</CardTitle>
          <CardDescription>Select cities to compare (April 2020 = 100 base)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {priceIndexData.cities.map(city => (
              <Badge
                key={city.name}
                onClick={() => toggleCitySelection(city.name)}
                className="cursor-pointer"
                variant={selectedCities.includes(city.name) ? "default" : "outline"}
              >
                {city.name}
              </Badge>
            ))}
            
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              <Filter className="h-3 w-3 mr-1" />
              More Options
            </Button>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={cityData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDateLabel(value)}
                />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Index Value']}
                  labelFormatter={(value) => formatDateLabel(value as string)}
                />
                <Legend />
                <ReferenceLine
                  y={100}
                  stroke="#888888"
                  strokeDasharray="3 3"
                  label={{ value: "Base (100)", position: "insideBottomRight" }}
                />
                {selectedCities.map((city, index) => {
                  // Generate a different color for each city
                  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
                  return (
                    <Line
                      key={city}
                      type="monotone"
                      dataKey={city}
                      stroke={colors[index % colors.length]}
                      activeDot={{ r: 8 }}
                      name={city}
                      strokeWidth={2}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Annual Price Growth Rates</CardTitle>
          <CardDescription>National vs. Metro vs. Rural areas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue={growthView} onValueChange={setGrowthView}>
            <TabsList className="w-full max-w-[400px]">
              <TabsTrigger value="nominal">Nominal Growth</TabsTrigger>
              <TabsTrigger value="comparison">Area Comparison</TabsTrigger>
            </TabsList>
            
            <TabsContent value="nominal" className="pt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={priceIndexData.growthData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'YoY Growth']} />
                    <Legend />
                    <Bar dataKey="national" name="National" fill="#3b82f6" />
                    <Bar dataKey="metro" name="Metropolitan" fill="#10b981" />
                    <Bar dataKey="rural" name="Rural" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="comparison" className="pt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={priceIndexData.growthData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'YoY Growth']} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="national" 
                      fill="#3b82f6" 
                      stroke="#3b82f6" 
                      name="National"
                      fillOpacity={0.3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="metro" 
                      stroke="#10b981" 
                      name="Metropolitan"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rural" 
                      stroke="#f59e0b" 
                      name="Rural"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-500">5-Year CAGR</p>
              <p className="text-xl font-bold">8.3%</p>
              <p className="text-xs text-gray-500">National Average</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Peak Growth</p>
              <p className="text-xl font-bold">18.5%</p>
              <p className="text-xs text-gray-500">Metro (2021)</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Current Trend</p>
              <p className="text-xl font-bold">Moderating</p>
              <p className="text-xs text-gray-500">Growth slowing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}