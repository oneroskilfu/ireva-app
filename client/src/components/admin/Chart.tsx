import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Chart = () => {
  const [chartData, setChartData] = useState({
    investments: [],
    users: [],
    properties: [],
    distributions: []
  });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await apiRequest('GET', '/api/admin/analytics');
        const data = await res.json();
        setChartData(data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchChartData();
  }, []);

  // Sample data in case the API doesn't return data
  const sampleInvestmentData = [
    { month: 'Jan', amount: 4000, count: 24 },
    { month: 'Feb', amount: 3000, count: 18 },
    { month: 'Mar', amount: 5000, count: 27 },
    { month: 'Apr', amount: 2780, count: 15 },
    { month: 'May', amount: 7890, count: 35 },
    { month: 'Jun', amount: 2390, count: 12 },
    { month: 'Jul', amount: 3490, count: 21 },
  ];

  const sampleUserData = [
    { month: 'Jan', newUsers: 40, activeUsers: 24 },
    { month: 'Feb', newUsers: 30, activeUsers: 18 },
    { month: 'Mar', newUsers: 50, activeUsers: 27 },
    { month: 'Apr', newUsers: 27, activeUsers: 15 },
    { month: 'May', newUsers: 78, activeUsers: 35 },
    { month: 'Jun', newUsers: 23, activeUsers: 12 },
    { month: 'Jul', newUsers: 34, activeUsers: 21 },
  ];

  const samplePropertyData = [
    { month: 'Jan', listed: 4, funded: 2 },
    { month: 'Feb', listed: 3, funded: 1 },
    { month: 'Mar', listed: 5, funded: 3 },
    { month: 'Apr', listed: 2, funded: 2 },
    { month: 'May', listed: 7, funded: 4 },
    { month: 'Jun', listed: 2, funded: 1 },
    { month: 'Jul', listed: 3, funded: 2 },
  ];

  const sampleDistributionData = [
    { name: 'Residential', value: 400 },
    { name: 'Commercial', value: 300 },
    { name: 'Mixed Use', value: 200 },
    { name: 'Industrial', value: 100 },
    { name: 'Land', value: 150 },
  ];

  // Use either API data or sample data
  const investmentData = chartData.investments.length > 0 ? chartData.investments : sampleInvestmentData;
  const userData = chartData.users.length > 0 ? chartData.users : sampleUserData;
  const propertyData = chartData.properties.length > 0 ? chartData.properties : samplePropertyData;
  const distributionData = chartData.distributions.length > 0 ? chartData.distributions : sampleDistributionData;

  // Format numbers with Naira currency and thousands separators
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Investment Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="investments" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="users">User Growth</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="distribution">Property Types</TabsTrigger>
          </TabsList>
          
          <TabsContent value="investments" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={investmentData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" tickFormatter={formatCurrency} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'amount') return formatCurrency(value as number);
                    return value;
                  }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="amount" name="Investment Amount" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="count" name="Investment Count" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={userData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newUsers" name="New Users" fill="#8884d8" />
                  <Bar dataKey="activeUsers" name="Active Users" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="properties" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={propertyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="listed" name="Properties Listed" fill="#8884d8" />
                  <Bar dataKey="funded" name="Properties Funded" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="distribution" className="space-y-4">
            <div className="h-[400px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [value, props.payload.name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Chart;