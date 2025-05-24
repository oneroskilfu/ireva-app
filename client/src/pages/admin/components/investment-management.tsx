import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Loader2, 
  Search, 
  RefreshCw, 
  ArrowUpDown, 
  BarChart4, 
  Calendar, 
  Check, 
  X,
  User 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate, getStatusBadgeVariant } from "@/lib/utils";

type Investment = {
  id: number;
  userId: number;
  propertyId: number;
  amount: number;
  date: string;
  status: string;
  currentValue: number;
  earnings: number;
  property?: {
    name: string;
    location: string;
    type: string;
  };
  user?: {
    username: string;
    email: string;
  };
};

const InvestmentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [returnsDialogOpen, setReturnsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newEarnings, setNewEarnings] = useState<number>(0);
  const [monthlyReturns, setMonthlyReturns] = useState<{ month: string; amount: number }[]>([
    { month: "Jan", amount: 0 },
    { month: "Feb", amount: 0 },
    { month: "Mar", amount: 0 },
  ]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: investments, isLoading, error } = useQuery<Investment[]>({
    queryKey: ["/api/admin/investments"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/investments/${id}/status`,
        { status }
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/investments"] });
      toast({
        title: "Investment status updated successfully",
        variant: "default",
      });
      setStatusDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update investment status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateReturnsMutation = useMutation({
    mutationFn: async ({ id, earnings, monthlyReturns }: { id: number; earnings: number; monthlyReturns: any }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/investments/${id}/returns`,
        { earnings, monthlyReturns }
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/investments"] });
      toast({
        title: "Investment returns updated successfully",
        variant: "default",
      });
      setReturnsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update investment returns",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openStatusDialog = (investment: Investment) => {
    setSelectedInvestment(investment);
    setNewStatus(investment.status);
    setStatusDialogOpen(true);
  };

  const openReturnsDialog = (investment: Investment) => {
    setSelectedInvestment(investment);
    setNewEarnings(investment.earnings || 0);
    // Initialize with existing monthly returns or defaults
    setMonthlyReturns(investment.monthlyReturns || [
      { month: "Jan", amount: 0 },
      { month: "Feb", amount: 0 },
      { month: "Mar", amount: 0 },
    ]);
    setReturnsDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedInvestment || !newStatus) return;
    
    updateStatusMutation.mutate({
      id: selectedInvestment.id,
      status: newStatus,
    });
  };

  const handleReturnsUpdate = () => {
    if (!selectedInvestment) return;
    
    updateReturnsMutation.mutate({
      id: selectedInvestment.id,
      earnings: newEarnings,
      monthlyReturns,
    });
  };

  const handleMonthlyReturnChange = (index: number, amount: number) => {
    const updatedReturns = [...monthlyReturns];
    updatedReturns[index] = { ...updatedReturns[index], amount };
    setMonthlyReturns(updatedReturns);
  };

  const filteredInvestments = investments
    ? investments.filter(
        (investment) =>
          investment.property?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          investment.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          investment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          investment.status?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <p className="text-destructive mb-2">Failed to load investments</p>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/investments"] })}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>Investment Management</CardTitle>
            <CardDescription>
              Track and manage all property investments
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <Search className="w-4 h-4 mr-2 text-muted-foreground" />
          <Input
            placeholder="Search investments..."
            className="w-full max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Investor</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Current Value</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvestments.map((investment) => (
              <TableRow key={investment.id}>
                <TableCell>{investment.id}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{investment.user?.username}</p>
                      <p className="text-xs text-muted-foreground">{investment.user?.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{investment.property?.name}</p>
                    <p className="text-xs text-muted-foreground">{investment.property?.location}</p>
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(investment.amount)}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {formatCurrency(investment.currentValue)}
                    {investment.earnings > 0 && (
                      <Badge variant="outline" className="ml-2 bg-green-50 text-green-600">
                        +{formatCurrency(investment.earnings)}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(investment.date)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(investment.status)}>
                    {investment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openStatusDialog(investment)}
                    >
                      <ArrowUpDown className="h-3.5 w-3.5 mr-1" /> Status
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReturnsDialog(investment)}
                      disabled={investment.status !== "active"}
                    >
                      <BarChart4 className="h-3.5 w-3.5 mr-1" /> Returns
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredInvestments.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No investments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Update Status Dialog */}
        {selectedInvestment && (
          <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Investment Status</DialogTitle>
                <DialogDescription>
                  Change status for investment #{selectedInvestment.id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p className="font-medium mb-1">Status Information:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Pending:</strong> Funds received but not yet allocated</li>
                    <li><strong>Active:</strong> Investment is actively earning returns</li>
                    <li><strong>Completed:</strong> Investment term has ended</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Status
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Update Returns Dialog */}
        {selectedInvestment && (
          <Dialog open={returnsDialogOpen} onOpenChange={setReturnsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Investment Returns</DialogTitle>
                <DialogDescription>
                  Manage investment earnings for #{selectedInvestment.id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Earnings</label>
                  <Input
                    type="number"
                    value={newEarnings}
                    onChange={(e) => setNewEarnings(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">Total accumulated earnings to date</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Returns</label>
                  <div className="space-y-2">
                    {monthlyReturns.map((monthData, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-16 text-sm">{monthData.month}</div>
                        <Input
                          type="number"
                          value={monthData.amount}
                          onChange={(e) => handleMonthlyReturnChange(index, parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Monthly return breakdown for charts</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReturnsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleReturnsUpdate}
                  disabled={updateReturnsMutation.isPending}
                >
                  {updateReturnsMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Returns
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default InvestmentManagement;