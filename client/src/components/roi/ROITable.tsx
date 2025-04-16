import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property, Investment } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Search, Calendar, Download, FileSpreadsheet, ArrowRight, AlertCircle } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

// Extended interface for ROI data
interface ROIData {
  id: number;
  investmentId: number;
  propertyId: number;
  month: string;
  year: number;
  amount: number;
  percentage: number;
  paymentDate: string;
  paymentStatus: "scheduled" | "processing" | "paid" | "delayed";
  paymentMethod?: string;
  transactionId?: string;
}

// Extended interface for investment with property data
interface InvestmentWithProperty extends Investment {
  property: Property;
}

export default function ROITable() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Fetch investments and ROI data
  const { data: investments, isLoading: investmentsLoading } = useQuery<InvestmentWithProperty[]>({
    queryKey: ["/api/investments/user"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  const { data: roiData, isLoading: roiLoading, error } = useQuery<ROIData[]>({
    queryKey: ["/api/roi/user"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  const isLoading = investmentsLoading || roiLoading;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !roiData || !investments) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load ROI data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Get unique years from ROI data for filtering
  const years = Array.from(new Set(roiData.map(item => item.year))).sort((a, b) => b - a);
  
  // Apply filters
  const filteredROIData = roiData.filter(item => {
    const matchesSearch = !searchTerm || 
      investments.find(inv => inv.id === item.investmentId)?.property.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = yearFilter === "all" || item.year.toString() === yearFilter;
    
    const matchesStatus = statusFilter === "all" || item.paymentStatus === statusFilter;
    
    return matchesSearch && matchesYear && matchesStatus;
  });
  
  // Group by property for tab view
  const roiByProperty = filteredROIData.reduce((acc, item) => {
    const investment = investments.find(inv => inv.id === item.investmentId);
    if (!investment) return acc;
    
    const propertyId = investment.propertyId;
    if (!acc[propertyId]) {
      acc[propertyId] = {
        propertyId,
        propertyName: investment.property.name,
        roiItems: []
      };
    }
    acc[propertyId].roiItems.push(item);
    return acc;
  }, {} as Record<number, { propertyId: number; propertyName: string; roiItems: ROIData[] }>);
  
  // Calculate total ROI stats
  const totalROIPaid = filteredROIData
    .filter(item => item.paymentStatus === "paid")
    .reduce((sum, item) => sum + item.amount, 0);
  
  const totalROIScheduled = filteredROIData
    .filter(item => item.paymentStatus === "scheduled")
    .reduce((sum, item) => sum + item.amount, 0);
  
  const averageROIPercentage = filteredROIData.length 
    ? filteredROIData.reduce((sum, item) => sum + item.percentage, 0) / filteredROIData.length
    : 0;
  
  // Format currency (Naira)
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Scheduled</Badge>;
      case "delayed":
        return <Badge variant="destructive">Delayed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">ROI Tracking</h2>
          <p className="text-muted-foreground">Track your investment returns across all properties</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="flex items-center gap-1">
            <FileSpreadsheet className="h-4 w-4" />
            Statements
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total ROI Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatNaira(totalROIPaid)}</div>
            <p className="text-xs text-muted-foreground">
              From {filteredROIData.filter(item => item.paymentStatus === "paid").length} payments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Scheduled Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(totalROIScheduled)}</div>
            <p className="text-xs text-muted-foreground">
              Due in the next 30 days: {formatNaira(
                filteredROIData
                  .filter(item => 
                    item.paymentStatus === "scheduled" && 
                    (new Date(item.paymentDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 30
                  )
                  .reduce((sum, item) => sum + item.amount, 0)
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Average ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {averageROIPercentage.toFixed(2)}%
              {averageROIPercentage > 0 ? 
                <TrendingUp className="ml-2 h-5 w-5 text-green-500" /> : 
                <TrendingDown className="ml-2 h-5 w-5 text-red-500" />
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Across all investments
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by property name..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="Filter by year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredROIData.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No ROI data found with the current filters.</p>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setYearFilter("all");
                setStatusFilter("all");
              }}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Properties</TabsTrigger>
            {Object.values(roiByProperty).map((property) => (
              <TabsTrigger key={property.propertyId} value={property.propertyId.toString()}>
                {property.propertyName}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all">
            <ROITableView 
              data={filteredROIData} 
              investments={investments} 
              formatDate={formatDate} 
              formatNaira={formatNaira} 
              getStatusBadge={getStatusBadge} 
            />
          </TabsContent>
          
          {Object.values(roiByProperty).map((property) => (
            <TabsContent key={property.propertyId} value={property.propertyId.toString()}>
              <ROITableView 
                data={property.roiItems} 
                investments={investments} 
                formatDate={formatDate} 
                formatNaira={formatNaira} 
                getStatusBadge={getStatusBadge} 
                propertyName={property.propertyName}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

interface ROITableViewProps {
  data: ROIData[];
  investments: InvestmentWithProperty[];
  formatDate: (date: string) => string;
  formatNaira: (amount: number) => string;
  getStatusBadge: (status: string) => JSX.Element;
  propertyName?: string;
}

function ROITableView({ 
  data, 
  investments, 
  formatDate, 
  formatNaira, 
  getStatusBadge,
  propertyName
}: ROITableViewProps) {
  // Sort data by payment date (most recent first)
  const sortedData = [...data].sort((a, b) => 
    new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );
  
  return (
    <Card className="overflow-hidden">
      {propertyName && (
        <CardHeader>
          <CardTitle>{propertyName}</CardTitle>
          <CardDescription>
            ROI payments for this property
          </CardDescription>
        </CardHeader>
      )}
      
      <Table>
        <TableHeader>
          <TableRow>
            {!propertyName && <TableHead>Property</TableHead>}
            <TableHead>Period</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>ROI %</TableHead>
            <TableHead>Status</TableHead>
            {data.some(item => item.paymentMethod) && <TableHead>Payment Method</TableHead>}
            <TableHead className="text-right">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => {
            const investment = investments.find(inv => inv.id === item.investmentId);
            
            return (
              <TableRow key={item.id}>
                {!propertyName && (
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {investment && (
                        <>
                          <img 
                            src={investment.property.imageUrl} 
                            alt={investment.property.name} 
                            className="w-8 h-8 object-cover rounded-md"
                          />
                          <span className="truncate max-w-[150px]">
                            {investment.property.name}
                          </span>
                        </>
                      )}
                    </div>
                  </TableCell>
                )}
                <TableCell>{item.month} {item.year}</TableCell>
                <TableCell className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDate(item.paymentDate)}
                </TableCell>
                <TableCell className="font-medium">{formatNaira(item.amount)}</TableCell>
                <TableCell>
                  <span className={item.percentage >= 0 ? "text-green-500" : "text-red-500"}>
                    {item.percentage.toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(item.paymentStatus)}</TableCell>
                {data.some(item => item.paymentMethod) && (
                  <TableCell>{item.paymentMethod || '-'}</TableCell>
                )}
                <TableCell className="text-right">
                  {item.paymentStatus === "paid" && item.transactionId ? (
                    <Button variant="ghost" size="sm" className="flex items-center">
                      View Receipt
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}