import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property, Investment } from "@shared/schema";
import { Link } from "wouter";
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
import { 
  ArrowDownUp, 
  Calendar, 
  ChevronRight, 
  ClipboardCheck, 
  Download, 
  Eye, 
  FileText, 
  Loader2 
} from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

// Extended type for investments with property data
interface InvestmentWithProperty extends Investment {
  property: Property;
}

export default function InvestmentHistory() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  
  // Fetch investments with property data
  const { data: investments, isLoading, error } = useQuery<InvestmentWithProperty[]>({
    queryKey: ["/api/investments/user"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !investments) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">Failed to load your investment history. Please try again later.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (investments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment History</CardTitle>
          <CardDescription>Track all your real estate investments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">You haven't made any investments yet.</p>
            <Button asChild>
              <Link href="/properties">Browse Properties</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Apply filters and sorting
  const filteredInvestments = investments.filter(investment => {
    if (!statusFilter) return true;
    return investment.status === statusFilter;
  });
  
  const sortedInvestments = [...filteredInvestments].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "date-asc":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "amount-desc":
        return b.amount - a.amount;
      case "amount-asc":
        return a.amount - b.amount;
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });
  
  // Group investments by status for tab view
  const activeInvestments = sortedInvestments.filter(inv => inv.status === "active");
  const pendingInvestments = sortedInvestments.filter(inv => inv.status === "pending");
  const completedInvestments = sortedInvestments.filter(inv => inv.status === "completed");
  
  // Calculate total portfolio value
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const currentPortfolioValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalEarnings = investments.reduce((sum, inv) => sum + inv.earnings, 0);
  
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
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Investment History</h2>
          <p className="text-muted-foreground">Track and manage all your real estate investments</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="amount-desc">Highest Amount</SelectItem>
              <SelectItem value="amount-asc">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(totalInvested)}</div>
            <p className="text-xs text-muted-foreground">Across {investments.length} investments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(currentPortfolioValue)}</div>
            <p className="text-xs text-muted-foreground">
              {currentPortfolioValue > totalInvested ? (
                <span className="text-green-500">+{formatNaira(currentPortfolioValue - totalInvested)}</span>
              ) : (
                <span className="text-red-500">-{formatNaira(totalInvested - currentPortfolioValue)}</span>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatNaira(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Return on investment: {Math.round((totalEarnings / totalInvested) * 100)}%
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All ({investments.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeInvestments.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingInvestments.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedInvestments.length})</TabsTrigger>
          </TabsList>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={undefined}>All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <TabsContent value="all" className="pt-4">
          <InvestmentTable investments={sortedInvestments} formatDate={formatDate} formatNaira={formatNaira} getStatusBadge={getStatusBadge} />
        </TabsContent>
        
        <TabsContent value="active" className="pt-4">
          <InvestmentTable investments={activeInvestments} formatDate={formatDate} formatNaira={formatNaira} getStatusBadge={getStatusBadge} />
        </TabsContent>
        
        <TabsContent value="pending" className="pt-4">
          <InvestmentTable investments={pendingInvestments} formatDate={formatDate} formatNaira={formatNaira} getStatusBadge={getStatusBadge} />
        </TabsContent>
        
        <TabsContent value="completed" className="pt-4">
          <InvestmentTable investments={completedInvestments} formatDate={formatDate} formatNaira={formatNaira} getStatusBadge={getStatusBadge} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface InvestmentTableProps {
  investments: InvestmentWithProperty[];
  formatDate: (date: string) => string;
  formatNaira: (amount: number) => string;
  getStatusBadge: (status: string) => JSX.Element;
}

function InvestmentTable({ investments, formatDate, formatNaira, getStatusBadge }: InvestmentTableProps) {
  if (investments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p className="text-muted-foreground">No investments found with the selected filter.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Current Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Earnings</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((investment) => (
            <TableRow key={investment.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <img 
                    src={investment.property.imageUrl} 
                    alt={investment.property.name} 
                    className="w-10 h-10 object-cover rounded-md"
                  />
                  <div className="truncate max-w-[200px]">
                    {investment.property.name}
                  </div>
                </div>
              </TableCell>
              <TableCell className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {formatDate(investment.date)}
              </TableCell>
              <TableCell>{formatNaira(investment.amount)}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  {formatNaira(investment.currentValue)}
                  {investment.currentValue > investment.amount ? (
                    <span className="text-xs text-green-500">
                      +{Math.round(((investment.currentValue - investment.amount) / investment.amount) * 100)}%
                    </span>
                  ) : investment.currentValue < investment.amount ? (
                    <span className="text-xs text-red-500">
                      -{Math.round(((investment.amount - investment.currentValue) / investment.amount) * 100)}%
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">0%</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(investment.status)}</TableCell>
              <TableCell className="text-green-500">{formatNaira(investment.earnings)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/investments/${investment.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Link>
                  </Button>
                  {investment.certificateUrl && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={investment.certificateUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View Certificate</span>
                      </a>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}