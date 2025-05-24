import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Loader2, 
  Search, 
  RefreshCw, 
  Calendar, 
  TrendingUp,
  Download
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
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";

// ROI summary type
type RoiSummary = {
  id: number;
  userId: number;
  propertyId: number;
  amount: number;
  date: string;
  roiPercentage: number;
  payoutDate: string;
  userEmail: string;
  userName: string;
  projectTitle: string;
  projectLocation: string;
  earnings: number;
  status: string;
  monthlyReturns?: { month: string; amount: number }[];
};

const RoiTracker = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch ROI summary from API
  const { data: roiData, isLoading, error } = useQuery<RoiSummary[]>({
    queryKey: ["/api/admin/roi/summary"],
  });

  // Export ROI data as CSV
  const exportToCSV = () => {
    if (!roiData || roiData.length === 0) {
      toast({
        title: "No data to export",
        variant: "destructive",
      });
      return;
    }

    // Create CSV header row
    const csvHeader = "User,Project,Amount,ROI %,Payout Date,Earnings,Status\n";
    
    // Map data to CSV rows
    const csvRows = roiData.map(roi => {
      return `"${roi.userName}","${roi.projectTitle}",${roi.amount},${roi.roiPercentage},"${roi.payoutDate}",${roi.earnings},"${roi.status}"`;
    }).join("\n");
    
    // Combine header and rows
    const csvContent = `data:text/csv;charset=utf-8,${csvHeader}${csvRows}`;
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `roi_summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "ROI data exported successfully",
      variant: "default",
    });
  };

  // Filter ROI data based on search term
  const filteredRoiData = roiData
    ? roiData.filter(
        (roi) =>
          roi.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          roi.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          roi.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          roi.projectLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          roi.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // ROI overview statistics
  const totalInvestments = filteredRoiData.length;
  const totalAmount = filteredRoiData.reduce((sum, roi) => sum + roi.amount, 0);
  const totalEarnings = filteredRoiData.reduce((sum, roi) => sum + roi.earnings, 0);
  const averageRoi = filteredRoiData.length > 0 
    ? filteredRoiData.reduce((sum, roi) => sum + roi.roiPercentage, 0) / filteredRoiData.length 
    : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <p className="text-destructive mb-2">Failed to load ROI data</p>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/roi/summary"] })}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ROI summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium text-muted-foreground">Total Investments</h3>
              <p className="text-2xl font-bold mt-2">{totalInvestments}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
              <p className="text-2xl font-bold mt-2">{formatCurrency(totalAmount)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium text-muted-foreground">Total Earnings</h3>
              <p className="text-2xl font-bold mt-2 text-green-600">{formatCurrency(totalEarnings)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium text-muted-foreground">Average ROI</h3>
              <p className="text-2xl font-bold mt-2 flex items-center">
                {averageRoi.toFixed(2)}%
                <TrendingUp className="ml-2 h-5 w-5 text-green-600" />
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI data table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle>ROI Summary</CardTitle>
              <CardDescription>
                Track return on investment across all properties
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              disabled={!roiData || roiData.length === 0}
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>
          <div className="flex items-center mt-4">
            <Search className="w-4 h-4 mr-2 text-muted-foreground" />
            <Input
              placeholder="Search by user, project, or status..."
              className="w-full max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>ROI %</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Payout Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoiData.map((roi, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{roi.userName}</p>
                        <p className="text-xs text-muted-foreground">{roi.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{roi.projectTitle}</p>
                        <p className="text-xs text-muted-foreground">{roi.projectLocation}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(roi.amount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {roi.roiPercentage}%
                        <TrendingUp className="ml-1 h-3 w-3 text-green-600" />
                      </div>
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(roi.earnings)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(roi.payoutDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roi.status === "paid" ? "outline" : "secondary"}>
                        {roi.status === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRoiData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No ROI data found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredRoiData.length} of {roiData?.length || 0} entries
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RoiTracker;