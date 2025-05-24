import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/Layout";
import AdvancedAnalytics from "@/components/dashboard/AdvancedAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  ChevronDown, 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  ArrowRightLeft
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth();
  const [dateRange, setDateRange] = useState<"all" | "1y" | "ytd" | "6m" | "3m" | "1m">("all");
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-10 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }
  
  // This check is redundant with ProtectedRoute, but we'll keep it for type safety
  if (!user) {
    return (
      <Layout>
        <div className="container py-10">
          <p>Please sign in to view analytics</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container py-10 max-w-7xl">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Investment Analytics</h1>
              <p className="text-muted-foreground">
                Advanced insights and performance metrics for your real estate portfolio
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select 
                defaultValue={dateRange} 
                onValueChange={(value) => setDateRange(value as any)}
              >
                <SelectTrigger className="w-[180px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="1y">Last 12 Months</SelectItem>
                  <SelectItem value="ytd">Year to Date</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="1m">Last Month</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 md:w-auto md:grid-cols-none md:flex">
              <TabsTrigger value="overview">
                <BarChart3 className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="performance">
                <TrendingUp className="mr-2 h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="transactions">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="reports" disabled>
                Reports
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <AdvancedAnalytics />
            </TabsContent>
            
            <TabsContent value="performance" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Detailed analysis of your investment performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-12">
                    <p className="text-muted-foreground">
                      This feature is coming soon. Check back later for detailed performance analytics.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    Complete record of your investment transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-12">
                    <p className="text-muted-foreground">
                      This feature is coming soon. Check back later for your transaction history.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}