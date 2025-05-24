import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  TrendingUp, 
  Wallet, 
  Calendar, 
  BarChart3, 
  FileText, 
  Clock, 
  Filter, 
  RefreshCw,
  ChevronRight,
  Download,
  AlertCircle
} from "lucide-react";
import { Investment, Property, User } from "@shared/schema";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Portfolio Summary Component
const PortfolioSummary = ({ investments, properties }: { investments: Investment[], properties: Property[] }) => {
  // Calculate total invested amount
  const totalInvested = investments.reduce((sum, investment) => sum + investment.amount, 0);
  
  // Calculate current portfolio value
  const currentValue = investments.reduce((sum, investment) => sum + investment.currentValue, 0);
  
  // Calculate total earnings
  const totalEarnings = investments.reduce((sum, investment) => sum + (investment.earnings || 0), 0);
  
  // Calculate overall ROI percentage
  const overallROI = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
  
  // Calculate portfolio growth - example data
  const portfolioGrowth = [
    { month: 'Jan', value: totalInvested * 1.01 },
    { month: 'Feb', value: totalInvested * 1.02 },
    { month: 'Mar', value: totalInvested * 1.024 },
    { month: 'Apr', value: totalInvested * 1.035 },
    { month: 'May', value: totalInvested * 1.042 },
    { month: 'Jun', value: totalInvested * 1.05 },
    { month: 'Jul', value: totalInvested * 1.063 },
    { month: 'Aug', value: totalInvested * 1.072 },
    { month: 'Sep', value: totalInvested * 1.081 },
    { month: 'Oct', value: totalInvested * 1.09 },
    { month: 'Nov', value: totalInvested * 1.105 },
    { month: 'Dec', value: currentValue },
  ];
  
  // Distribution by property type
  const propertyTypes = investments.reduce((acc: Record<string, number>, investment) => {
    const property = properties.find(p => p.id === investment.propertyId);
    if (property) {
      acc[property.type] = (acc[property.type] || 0) + investment.currentValue;
    }
    return acc;
  }, {});
  
  const distributionData = Object.entries(propertyTypes).map(([type, value]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value,
  }));
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Monthly returns data - example
  const monthlyReturnsData = [
    { month: 'Jan', return: 1.2 },
    { month: 'Feb', return: 1.3 },
    { month: 'Mar', return: 1.1 },
    { month: 'Apr', return: 1.4 },
    { month: 'May', return: 1.5 },
    { month: 'Jun', return: 1.3 },
    { month: 'Jul', return: 1.6 },
    { month: 'Aug', return: 1.7 },
    { month: 'Sep', return: 1.5 },
    { month: 'Oct', return: 1.8 },
    { month: 'Nov', return: 1.7 },
    { month: 'Dec', return: 1.9 },
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalInvested.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">
              {investments.length} active investments
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{currentValue.toLocaleString()}</div>
            <div className="flex items-center text-xs mt-1">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+{overallROI.toFixed(2)}%</span>
              <span className="text-gray-500 ml-1">overall</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalEarnings.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">
              From rental income and distributions
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Next Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(totalInvested * 0.008).toLocaleString()}</div>
            <div className="flex items-center text-xs mt-1">
              <Calendar className="w-3 h-3 text-blue-500 mr-1" />
              <span className="text-gray-500">Expected on May 15, 2025</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Growth Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Portfolio Growth</CardTitle>
            <CardDescription>12-month portfolio value progression</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={portfolioGrowth}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Portfolio Value']} 
                    labelFormatter={(label) => `Month: ${label}`}
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
        
        {/* Property Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Portfolio Composition</CardTitle>
            <CardDescription>Distribution by property type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Investment Value']}
                  />
                  <Legend layout="vertical" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Monthly Returns Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Returns</CardTitle>
          <CardDescription>Performance over the past 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={monthlyReturnsData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Monthly Return']}
                />
                <Bar dataKey="return" fill="#4f46e5" barSize={30} radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Investment History Component
const InvestmentHistory = ({ investments, properties }: { investments: Investment[], properties: Property[] }) => {
  const [filter, setFilter] = useState("all");
  
  // Filter investments based on status
  const filteredInvestments = filter === "all" 
    ? investments 
    : investments.filter(inv => inv.status === filter);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Investment History</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={filter === "all" ? "bg-primary/10" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={filter === "active" ? "bg-primary/10" : ""}
            onClick={() => setFilter("active")}
          >
            Active
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={filter === "completed" ? "bg-primary/10" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" /> 
            More Filters
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Current Value</TableHead>
              <TableHead>ROI</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvestments.length > 0 ? (
              filteredInvestments.map((investment) => {
                const property = properties.find(p => p.id === investment.propertyId);
                const roi = investment.amount > 0 
                  ? ((investment.currentValue - investment.amount) / investment.amount) * 100 
                  : 0;
                  
                return (
                  <TableRow key={investment.id}>
                    <TableCell className="font-medium">
                      {property ? property.name : `Property #${investment.propertyId}`}
                    </TableCell>
                    <TableCell>₦{investment.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(investment.date || Date.now()).toLocaleDateString()}</TableCell>
                    <TableCell>₦{investment.currentValue.toLocaleString()}</TableCell>
                    <TableCell className={roi >= 0 ? "text-green-600" : "text-red-600"}>
                      {roi >= 0 ? "+" : ""}{roi.toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          investment.status === "active" 
                            ? "default" 
                            : investment.status === "completed" 
                              ? "outline" 
                              : "secondary"
                        }
                      >
                        {investment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/investment/${investment.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  No investments found matching the current filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// Investment Documents Component
const InvestmentDocuments = ({ investments, properties }: { investments: Investment[], properties: Property[] }) => {
  // Example document types
  const documents = [
    {
      id: 1,
      name: "Investment Certificate #1089",
      type: "Certificate",
      property: "Skyline Apartments",
      date: "Jan 15, 2025",
      fileSize: "1.2 MB"
    },
    {
      id: 2,
      name: "Tax Statement Q1 2025",
      type: "Tax",
      property: "All Properties",
      date: "Apr 10, 2025",
      fileSize: "2.4 MB"
    },
    {
      id: 3,
      name: "Monthly Report - March 2025",
      type: "Report",
      property: "Ocean View Villas",
      date: "Apr 05, 2025",
      fileSize: "3.1 MB"
    },
    {
      id: 4,
      name: "Annual Portfolio Statement",
      type: "Statement",
      property: "All Properties",
      date: "Dec 31, 2024",
      fileSize: "4.5 MB"
    },
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Investment Documents</h3>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.name}</TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>{doc.property}</TableCell>
                <TableCell>{doc.date}</TableCell>
                <TableCell>{doc.fileSize}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// Main Portfolio Management Component
export default function PortfolioManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("summary");
  
  const { data: investments = [], isLoading: investmentsLoading } = useQuery<Investment[]>({
    queryKey: ['/api/investments/user'],
    queryFn: getQueryFn({ on401: 'throw' }),
    enabled: !!user,
  });
  
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });
  
  if (investmentsLoading || propertiesLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
        <p className="text-gray-500 mb-4">Please sign in to view your portfolio.</p>
        <Link href="/auth">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Investment Portfolio</h2>
        <p className="text-gray-500">
          Manage and track all your real estate investments in one place
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Summary
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> History
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Documents
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <PortfolioSummary investments={investments} properties={properties} />
        </TabsContent>
        
        <TabsContent value="history">
          <InvestmentHistory investments={investments} properties={properties} />
        </TabsContent>
        
        <TabsContent value="documents">
          <InvestmentDocuments investments={investments} properties={properties} />
        </TabsContent>
      </Tabs>
    </div>
  );
}