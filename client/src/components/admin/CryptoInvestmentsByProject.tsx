import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart, 
  Pie
} from 'recharts';
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { Bitcoin, RefreshCw, Search, Download } from "lucide-react";

interface ProjectCryptoData {
  id: number;
  name: string;
  totalInvestment: number;
  cryptoInvestment: number;
  cryptoPercentage: number;
  cryptoBreakdown: {
    currency: string;
    amount: number;
    amountInFiat: number;
  }[];
  investorCount: number;
  cryptoInvestorCount: number;
}

const CryptoInvestmentsByProject: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Fetch projects with crypto investment data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/crypto/properties/crypto-investments'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/crypto/properties/crypto-investments');
      return response.json();
    },
  });

  // Transform the data from API to match our component's format
  const apiProjects: ProjectCryptoData[] = data?.data?.map((item: any) => {
    const property = item.property;
    const cryptoData = item.cryptoData;
    
    // Create crypto breakdown from byCurrency
    const cryptoBreakdown = Object.entries(cryptoData.byCurrency || {}).map(([currency, amount]) => ({
      currency,
      amount: Number(amount),
      amountInFiat: Number(amount) // The amount is already in fiat
    }));
    
    return {
      id: property.id,
      name: property.name,
      totalInvestment: property.totalFunding || 0,
      cryptoInvestment: cryptoData.totalInvestment || 0,
      cryptoPercentage: property.totalFunding ? 
        Math.round((cryptoData.totalInvestment / property.totalFunding) * 100) : 0,
      cryptoBreakdown,
      investorCount: property.numberOfInvestors || 0,
      cryptoInvestorCount: cryptoData.uniqueInvestorCount || 0
    };
  }) || [];
  
  // Filter projects based on search term
  const filteredProjects = apiProjects?.filter(project => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return project.name.toLowerCase().includes(term);
  });

  // Generate colors for chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const generatePieChartData = (project: ProjectCryptoData) => {
    return [
      {
        name: 'Crypto Investment',
        value: project.cryptoInvestment
      },
      {
        name: 'Traditional Investment',
        value: project.totalInvestment - project.cryptoInvestment
      }
    ];
  };

  const generateCurrencyBreakdownData = (project: ProjectCryptoData) => {
    return project.cryptoBreakdown.map(item => ({
      name: item.currency,
      value: item.amountInFiat
    }));
  };

  // Mock data for demonstration (will be replaced by real data)
  const mockProjects: ProjectCryptoData[] = [
    {
      id: 1,
      name: "Lagos Heights",
      totalInvestment: 5000000,
      cryptoInvestment: 1500000,
      cryptoPercentage: 30,
      cryptoBreakdown: [
        { currency: "BTC", amount: 1.2, amountInFiat: 750000 },
        { currency: "ETH", amount: 125, amountInFiat: 500000 },
        { currency: "USDT", amount: 250000, amountInFiat: 250000 }
      ],
      investorCount: 25,
      cryptoInvestorCount: 8
    },
    {
      id: 2,
      name: "Westfield Retail Center",
      totalInvestment: 12000000,
      cryptoInvestment: 3600000,
      cryptoPercentage: 30,
      cryptoBreakdown: [
        { currency: "BTC", amount: 2.5, amountInFiat: 1500000 },
        { currency: "ETH", amount: 250, amountInFiat: 1000000 },
        { currency: "USDC", amount: 1100000, amountInFiat: 1100000 }
      ],
      investorCount: 120,
      cryptoInvestorCount: 35
    },
    {
      id: 3,
      name: "Garden City Apartments",
      totalInvestment: 8000000,
      cryptoInvestment: 1200000,
      cryptoPercentage: 15,
      cryptoBreakdown: [
        { currency: "BTC", amount: 0.8, amountInFiat: 400000 },
        { currency: "ETH", amount: 100, amountInFiat: 350000 },
        { currency: "USDT", amount: 450000, amountInFiat: 450000 }
      ],
      investorCount: 80,
      cryptoInvestorCount: 12
    }
  ];

  // Use mock data for now when real data is not available
  const displayProjects = filteredProjects || mockProjects;

  // Generate data for overview chart
  const overviewChartData = displayProjects.map(project => ({
    name: project.name,
    cryptoInvestment: project.cryptoInvestment,
    traditionalInvestment: project.totalInvestment - project.cryptoInvestment
  }));

  // Calculate total crypto investment across all projects
  const totalCryptoInvestment = displayProjects.reduce((sum, project) => sum + project.cryptoInvestment, 0);
  const totalInvestment = displayProjects.reduce((sum, project) => sum + project.totalInvestment, 0);
  const overallCryptoPercentage = totalInvestment > 0 ? (totalCryptoInvestment / totalInvestment) * 100 : 0;

  // Generate data for currency breakdown chart
  const currencyData: Record<string, number> = {};
  displayProjects.forEach(project => {
    project.cryptoBreakdown.forEach(item => {
      if (currencyData[item.currency]) {
        currencyData[item.currency] += item.amountInFiat;
      } else {
        currencyData[item.currency] = item.amountInFiat;
      }
    });
  });

  const overallCurrencyData = Object.entries(currencyData).map(([currency, amount]) => ({
    name: currency,
    value: amount
  }));

  // Handle export data
  const exportData = () => {
    try {
      const exportData = displayProjects.map(project => ({
        Project_ID: project.id,
        Project_Name: project.name,
        Total_Investment: project.totalInvestment,
        Crypto_Investment: project.cryptoInvestment,
        Crypto_Percentage: project.cryptoPercentage,
        Investor_Count: project.investorCount,
        Crypto_Investor_Count: project.cryptoInvestorCount,
        Crypto_Breakdown: project.cryptoBreakdown.map(item => 
          `${item.currency}: ${item.amount} (${formatCurrency(item.amountInFiat)})`
        ).join(', ')
      }));

      const csvContent = 
        "data:text/csv;charset=utf-8," + 
        "Project ID,Project Name,Total Investment,Crypto Investment,Crypto Percentage,Investor Count,Crypto Investor Count,Crypto Breakdown\n" +
        exportData.map(item => 
          Object.values(item).map(value => 
            typeof value === 'string' && value.includes(',') ? `"${value}"` : value
          ).join(',')
        ).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "crypto_investments_by_project.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: "Data has been exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An error occurred while exporting data",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-64">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>Failed to load crypto investment data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Crypto Investments by Project</h2>
          <p className="text-muted-foreground">Track and analyze cryptocurrency investments across all projects</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestment)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Crypto Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCryptoInvestment)}</div>
            <Progress className="mt-2" value={overallCryptoPercentage} />
            <p className="text-xs text-muted-foreground mt-1">{overallCryptoPercentage.toFixed(1)}% of total investment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Crypto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallCurrencyData.length > 0 
                ? overallCurrencyData.sort((a, b) => b.value - a.value)[0].name 
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {overallCurrencyData.length > 0 
                ? formatCurrency(overallCurrencyData.sort((a, b) => b.value - a.value)[0].value)
                : 'No data'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Projects with Crypto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayProjects.filter(p => p.cryptoInvestment > 0).length} / {displayProjects.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {((displayProjects.filter(p => p.cryptoInvestment > 0).length / displayProjects.length) * 100).toFixed(1)}% of projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Data */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Currency Breakdown</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crypto vs Traditional Investment by Project</CardTitle>
              <CardDescription>
                Visual representation of how crypto investments compare to traditional funding sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={overviewChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis tickFormatter={(value) => formatCurrency(value).replace('₦', '')} />
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="traditionalInvestment" name="Traditional Investment" stackId="a" fill="#8884d8" />
                    <Bar dataKey="cryptoInvestment" name="Crypto Investment" stackId="a" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-4">
            {displayProjects.map((project) => (
              <Card key={project.id}>
                <CardHeader className="pb-2">
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>
                    {formatCurrency(project.cryptoInvestment)} of {formatCurrency(project.totalInvestment)} from crypto ({project.cryptoPercentage}%)
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center justify-between">
                  <div className="w-[150px] h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={generatePieChartData(project)}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {generatePieChartData(project).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-4 md:mt-0 space-y-2 w-full md:w-1/2">
                    {project.cryptoBreakdown.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium flex items-center">
                            <Bitcoin className="h-3 w-3 mr-1 inline" /> {item.currency}
                          </span>
                          <span>{formatCurrency(item.amountInFiat)}</span>
                        </div>
                        <Progress value={(item.amountInFiat / project.cryptoInvestment) * 100} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Currency Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overall Cryptocurrency Distribution</CardTitle>
              <CardDescription>
                Breakdown of different cryptocurrencies used for investments across all projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overallCurrencyData}
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) => `${name}: ${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {overallCurrencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-4">
            {displayProjects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>Cryptocurrency breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={generateCurrencyBreakdownData(project)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {generateCurrencyBreakdownData(project).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Total: {formatCurrency(project.cryptoInvestment)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Investors: {project.cryptoInvestorCount}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Table View Tab */}
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Crypto Investment Data</CardTitle>
              <CardDescription>
                Comprehensive breakdown of cryptocurrency investments across all projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Total Investment</TableHead>
                    <TableHead>Crypto Investment</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Currencies</TableHead>
                    <TableHead>Investors (Crypto/Total)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{formatCurrency(project.totalInvestment)}</TableCell>
                      <TableCell>{formatCurrency(project.cryptoInvestment)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress className="w-20" value={project.cryptoPercentage} />
                          <span>{project.cryptoPercentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {project.cryptoBreakdown.map((item, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <Bitcoin className="h-3 w-3 mr-1 text-primary" />
                              <span>{item.currency}: {item.amount} ({formatCurrency(item.amountInFiat)})</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{project.cryptoInvestorCount} / {project.investorCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={exportData} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data to CSV
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CryptoInvestmentsByProject;