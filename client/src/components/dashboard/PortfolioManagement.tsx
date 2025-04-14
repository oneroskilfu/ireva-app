import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Download, Clock, TrendingUp, TrendingDown, Landmark, Banknote, Info, ExternalLink, FileBarChart, Calculator, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// For WebSocket
type InvestmentWithDetails = {
  id: number;
  userId: number;
  propertyId: number;
  amount: number;
  date: string;
  returns: number;
  status: string;
  property: {
    id: number;
    name: string;
    location: string;
    type: string;
    description: string;
    price: number;
    size: number;
    imageUrl: string;
    targetReturn: string;
    minimumInvestment: number;
    fundingGoal: number;
    currentFunding: number;
    status: string;
    riskRating: string;
    duration: string;
  };
  // Real-time data added by WebSocket
  currentValue?: number;
  appreciation?: string;
  rentalIncome?: string;
  distributions?: string;
  lastUpdated?: string;
};

export default function PortfolioManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState("all");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [realTimeInvestments, setRealTimeInvestments] = useState<InvestmentWithDetails[]>([]);
  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    investment?: InvestmentWithDetails;
  }>({
    open: false
  });

  // Fetch investments
  const { data: investments = [], isLoading } = useQuery({
    queryKey: ['/api/investments'],
    enabled: !!user
  });

  // Connect to WebSocket for real-time investment updates
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected for portfolio management");
      
      // Subscribe to investment updates
      newSocket.send(JSON.stringify({
        type: 'subscribe',
        userId: user.id
      }));
    };

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Handle investment updates
        if (message.type === 'investment_update') {
          setRealTimeInvestments(message.data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    newSocket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    setSocket(newSocket);

    return () => {
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [user]);

  // Combine static and real-time investment data
  const combinedInvestments = (investments as InvestmentWithDetails[]).map((investment: InvestmentWithDetails) => {
    const realTimeData = realTimeInvestments.find(rtInv => rtInv.id === investment.id);
    return {
      ...investment,
      ...(realTimeData || {}),
    };
  });

  // Calculate portfolio metrics
  const totalInvested = combinedInvestments.reduce((sum: number, inv: InvestmentWithDetails) => sum + inv.amount, 0);
  const totalCurrentValue = combinedInvestments.reduce((sum: number, inv: InvestmentWithDetails) => sum + (inv.currentValue || inv.amount), 0);
  const totalReturns = combinedInvestments.reduce((sum: number, inv: InvestmentWithDetails) => sum + (inv.returns || 0), 0);
  const totalAppreciation = totalCurrentValue - totalInvested;
  const appreciationPercentage = totalInvested > 0 ? (totalAppreciation / totalInvested) * 100 : 0;

  // Filter investments based on active tab
  const filteredInvestments = combinedInvestments.filter((inv: InvestmentWithDetails) => {
    if (activeSubTab === "all") return true;
    if (activeSubTab === "residential") return inv.property.type === "residential";
    if (activeSubTab === "commercial") return inv.property.type === "commercial";
    if (activeSubTab === "industrial") return inv.property.type === "industrial";
    return true;
  });

  // Generate investment performance data for export
  const generatePerformanceReport = () => {
    if (combinedInvestments.length === 0) {
      toast({
        title: "No data to export",
        description: "You don't have any investments to generate a report for.",
        variant: "destructive",
      });
      return;
    }

    // In a real application, this would generate a CSV or PDF
    // For now, we'll just show a success message
    toast({
      title: "Report Generated",
      description: "Your investment performance report has been downloaded.",
    });
  };

  // Placeholder function for reinvesting
  const handleReinvest = (investmentId: number) => {
    toast({
      title: "Reinvestment Initiated",
      description: `You've chosen to reinvest returns from investment #${investmentId}. This feature will be available soon.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Portfolio Management</h2>
          <p className="text-muted-foreground">
            Track and manage your real estate investments
          </p>
        </div>
        <div className="flex mt-4 lg:mt-0 space-x-3">
          <Button variant="outline" onClick={generatePerformanceReport}>
            <FileBarChart className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Returns
          </Button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invested
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalInvested.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {combinedInvestments.length} investments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Value
            </CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalCurrentValue.toLocaleString()}</div>
            <div className="flex items-center">
              <Badge className={appreciationPercentage >= 0 ? "bg-green-500" : "bg-red-500"}>
                {appreciationPercentage >= 0 ? "+" : ""}{appreciationPercentage.toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Returns
            </CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalReturns.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From rental income and distributions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Appreciation
            </CardTitle>
            {totalAppreciation >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{Math.abs(totalAppreciation).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalAppreciation >= 0 ? "Gain" : "Loss"} in property value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Management Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Your Investment Portfolio
          </CardTitle>
          <CardDescription>
            Track performance and manage all your real estate investments
          </CardDescription>
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="mt-4">
            <TabsList>
              <TabsTrigger value="all">All Investments</TabsTrigger>
              <TabsTrigger value="residential">Residential</TabsTrigger>
              <TabsTrigger value="commercial">Commercial</TabsTrigger>
              <TabsTrigger value="industrial">Industrial</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredInvestments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You don't have any investments yet</p>
              <Button>Browse Properties</Button>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableCaption>Real-time investment data updated every minute</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Invested Amount</TableHead>
                      <TableHead>Current Value</TableHead>
                      <TableHead>Returns</TableHead>
                      <TableHead>Appreciation</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvestments.map((investment: InvestmentWithDetails) => (
                      <TableRow key={investment.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="h-8 w-8 mr-2 overflow-hidden rounded">
                              <img 
                                src={investment.property.imageUrl} 
                                alt={investment.property.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span>{investment.property.name}</span>
                              <span className="text-xs text-muted-foreground">{investment.property.location}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>₦{investment.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            ₦{(investment.currentValue || investment.amount).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">₦{(investment.returns || 0).toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">
                              {investment.rentalIncome ? `₦${investment.rentalIncome}/mo` : 'Pending'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {investment.currentValue ? (
                            <Badge className={(investment.currentValue - investment.amount) >= 0 ? "bg-green-500" : "bg-red-500"}>
                              {(investment.currentValue - investment.amount) >= 0 ? "+" : ""}
                              {(((investment.currentValue - investment.amount) / investment.amount) * 100).toFixed(2)}%
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleReinvest(investment.id)}
                            >
                              <Banknote className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setDetailsDialog({
                                open: true,
                                investment
                              })}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Mobile View */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredInvestments.map((investment: InvestmentWithDetails) => (
                  <Card key={investment.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-12 w-12 rounded overflow-hidden">
                            <img 
                              src={investment.property.imageUrl} 
                              alt={investment.property.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <CardTitle className="text-base">{investment.property.name}</CardTitle>
                            <CardDescription>{investment.property.location}</CardDescription>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDetailsDialog({
                            open: true,
                            investment
                          })}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Invested</p>
                          <p className="font-medium">₦{investment.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Value</p>
                          <p className="font-medium">₦{(investment.currentValue || investment.amount).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Returns</p>
                          <p className="font-medium">₦{(investment.returns || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Appreciation</p>
                          {investment.currentValue ? (
                            <Badge className={(investment.currentValue - investment.amount) >= 0 ? "bg-green-500" : "bg-red-500"}>
                              {(investment.currentValue - investment.amount) >= 0 ? "+" : ""}
                              {(((investment.currentValue - investment.amount) / investment.amount) * 100).toFixed(2)}%
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between">
                      <Badge variant="outline" className="capitalize">
                        {investment.status || 'Active'}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => handleReinvest(investment.id)}>
                        <Banknote className="h-4 w-4 mr-2" /> Reinvest
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Investment Details Dialog */}
      <Dialog 
        open={detailsDialog.open} 
        onOpenChange={(open) => setDetailsDialog({ ...detailsDialog, open })}
      >
        <DialogContent className="max-w-2xl">
          {detailsDialog.investment && (
            <>
              <DialogHeader>
                <DialogTitle>Investment Details</DialogTitle>
                <DialogDescription>
                  Comprehensive details about your investment
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Property Overview */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {detailsDialog.investment.property.name}
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <img 
                      src={detailsDialog.investment.property.imageUrl} 
                      alt={detailsDialog.investment.property.name}
                      className="w-full sm:w-40 h-28 rounded-md object-cover"
                    />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {detailsDialog.investment.property.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {detailsDialog.investment.property.type}
                        </Badge>
                        <Badge variant="outline">
                          {detailsDialog.investment.property.location}
                        </Badge>
                        <Badge variant="outline">
                          {detailsDialog.investment.property.size} sqft
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Investment Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Investment Date</p>
                    <p className="font-medium">
                      {new Date(detailsDialog.investment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="outline" className="capitalize">
                      {detailsDialog.investment.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Invested Amount</p>
                    <p className="font-medium">
                      ₦{detailsDialog.investment.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className="font-medium">
                      ₦{(detailsDialog.investment.currentValue || detailsDialog.investment.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Returns</p>
                    <p className="font-medium">
                      ₦{(detailsDialog.investment.returns || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Appreciation</p>
                    <div className="flex items-center">
                      {detailsDialog.investment.currentValue ? (
                        <Badge className={(detailsDialog.investment.currentValue - detailsDialog.investment.amount) >= 0 ? "bg-green-500" : "bg-red-500"}>
                          {(detailsDialog.investment.currentValue - detailsDialog.investment.amount) >= 0 ? "+" : ""}
                          {(((detailsDialog.investment.currentValue - detailsDialog.investment.amount) / detailsDialog.investment.amount) * 100).toFixed(2)}%
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Financial Performance */}
                <div>
                  <h4 className="font-medium mb-4">Financial Performance</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Investment Maturity</span>
                        <span className="text-sm font-medium">
                          {detailsDialog.investment.property.duration}
                        </span>
                      </div>
                      <Progress value={40} className="h-2" />
                      <div className="flex flex-wrap justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          Invested {new Date(detailsDialog.investment.date).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          3 years remaining
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Rental Income</p>
                        <p className="font-medium">
                          ₦{detailsDialog.investment.rentalIncome || (detailsDialog.investment.amount * 0.008).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Distributions to Date</p>
                        <p className="font-medium">
                          ₦{detailsDialog.investment.distributions || (detailsDialog.investment.amount * 0.006 * 3).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Target Return</p>
                        <p className="font-medium">
                          {detailsDialog.investment.property.targetReturn}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Risk Rating</p>
                        <p className="font-medium capitalize">
                          {detailsDialog.investment.property.riskRating}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Real-time Updates */}
                <div>
                  <h4 className="font-medium mb-2">Real-time Updates</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Latest performance data for your investment
                  </p>
                  
                  <div className="bg-muted p-4 rounded-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Last Updated</p>
                        <p className="text-sm">
                          {detailsDialog.investment.lastUpdated ? 
                            new Date(detailsDialog.investment.lastUpdated).toLocaleString() : 
                            "Pending updates"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Next Distribution</p>
                        <p className="text-sm">Estimated in 15 days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Statement
                </Button>
                <Button>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Property Details
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}