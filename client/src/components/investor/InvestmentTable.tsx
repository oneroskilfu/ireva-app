import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Search, Plus, MoreVertical, ExternalLink, PieChart, FileText } from "lucide-react";

interface Investment {
  id: number;
  propertyId: number;
  propertyName: string;
  location: string;
  type: string;
  imageUrl: string;
  amount: number;
  date: string;
  status: 'active' | 'matured' | 'cancelled';
  currentValue: number;
  earnings: number;
  roi: number;
  term: number;
  maturityDate: string;
}

const InvestmentTable: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Fetch investments
  const { data: investments, isLoading, error } = useQuery<Investment[]>({
    queryKey: ['/api/investor/investments'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/investor/investments');
      return await res.json();
    },
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
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

  // Filter investments by search text
  const filteredInvestments = investments?.filter(investment => 
    investment.propertyName.toLowerCase().includes(searchText.toLowerCase()) ||
    investment.location.toLowerCase().includes(searchText.toLowerCase()) ||
    investment.type.toLowerCase().includes(searchText.toLowerCase())
  ) || [];

  // Handle view details
  const handleViewDetails = (investment: Investment) => {
    setSelectedInvestment(investment);
    setDetailsOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status: 'active' | 'matured' | 'cancelled') => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'matured':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Matured</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Investments</CardTitle>
          <CardDescription>Track your property investment portfolio</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Investments</CardTitle>
          <CardDescription>Track your property investment portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> Failed to load investments. Please try again later.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Investments</CardTitle>
          <CardDescription>Track your property investment portfolio</CardDescription>
        </div>
        <Button variant="outline" className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          New Investment
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search investments..."
              className="pl-8"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {filteredInvestments.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {investments?.length === 0 ? 
              "You don't have any investments yet. Start investing today!" : 
              "No investments match your search."}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>ROI</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Maturity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvestments.map((investment) => (
                  <TableRow key={investment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md overflow-hidden">
                          <img 
                            src={investment.imageUrl} 
                            alt={investment.propertyName}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{investment.propertyName}</div>
                          <div className="text-sm text-muted-foreground">{investment.location}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(investment.amount)}</div>
                      <div className="text-sm text-muted-foreground">Current: {formatCurrency(investment.currentValue)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">+{investment.roi}%</div>
                      <div className="text-sm text-muted-foreground">Earnings: {formatCurrency(investment.earnings)}</div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(investment.status)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatDate(investment.maturityDate)}</div>
                      <div className="text-sm text-muted-foreground">{investment.term} months term</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Options</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(investment)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <PieChart className="mr-2 h-4 w-4" />
                            View Performance
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Download Statement
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Investment Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Investment Details</DialogTitle>
              <DialogDescription>
                Details of your investment in {selectedInvestment?.propertyName}
              </DialogDescription>
            </DialogHeader>
            
            {selectedInvestment && (
              <div className="space-y-4">
                <div className="relative h-40 w-full rounded-md overflow-hidden">
                  <img 
                    src={selectedInvestment.imageUrl} 
                    alt={selectedInvestment.propertyName}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-0 right-0 m-2">
                    {getStatusBadge(selectedInvestment.status)}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">{selectedInvestment.propertyName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvestment.type.charAt(0).toUpperCase() + selectedInvestment.type.slice(1)} property in {selectedInvestment.location}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Investment Amount</p>
                    <p className="font-medium">{formatCurrency(selectedInvestment.amount)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className="font-medium">{formatCurrency(selectedInvestment.currentValue)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">ROI</p>
                    <p className="font-medium text-green-600">+{selectedInvestment.roi}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Earnings</p>
                    <p className="font-medium">{formatCurrency(selectedInvestment.earnings)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Investment Date</p>
                    <p className="font-medium">{formatDate(selectedInvestment.date)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Maturity Date</p>
                    <p className="font-medium">{formatDate(selectedInvestment.maturityDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Term</p>
                    <p className="font-medium">{selectedInvestment.term} months</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{selectedInvestment.status.charAt(0).toUpperCase() + selectedInvestment.status.slice(1)}</p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
              <Button variant="default">View Property Details</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default InvestmentTable;