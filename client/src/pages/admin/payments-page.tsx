import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, RefreshCw, Download, Check, AlertCircle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';

export default function AdminPayments() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Temporarily use a mock data approach until the API endpoint is implemented
  const { data: payments, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/admin/payments'],
    queryFn: async () => {
      // Return mock data instead of making an actual API call that would fail
      return [];
    }
  });

  const handleRefresh = () => {
    toast({
      title: "Refreshing payments data",
      description: "The payments list is being updated.",
    });
    refetch();
  };

  const handleExport = () => {
    toast({
      title: "Exporting payments data",
      description: "The payments data is being prepared for export.",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Skeleton className="h-10 w-full sm:w-96" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        
        <div>
          <Skeleton className="h-8 w-96 mb-4" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive opacity-75" />
        <h3 className="mt-4 text-lg font-semibold">Failed to Load Payments</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          There was an error loading the payment data. Please try again later.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={handleRefresh}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payment Management</h2>
        <p className="text-muted-foreground">
          Process and manage all payment transactions on the platform.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="refunded">Refunded</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment List</CardTitle>
              <CardDescription>
                View and manage all payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3.5 text-left text-sm font-semibold">ID</th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold">User</th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold">Method</th>
                      <th className="px-4 py-3.5 text-right text-sm font-semibold">Amount</th>
                      <th className="px-4 py-3.5 text-center text-sm font-semibold">Status</th>
                      <th className="px-4 py-3.5 text-right text-sm font-semibold">Date</th>
                      <th className="px-4 py-3.5 text-right text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-4 text-sm" colSpan={7}>
                        <div className="text-center text-muted-foreground">
                          No payment data available
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>
                Payments awaiting processing or confirmation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3.5 text-left text-sm font-semibold">ID</th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold">User</th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold">Method</th>
                      <th className="px-4 py-3.5 text-right text-sm font-semibold">Amount</th>
                      <th className="px-4 py-3.5 text-right text-sm font-semibold">Date</th>
                      <th className="px-4 py-3.5 text-right text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-4 text-sm" colSpan={6}>
                        <div className="text-center text-muted-foreground">
                          No pending payments
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Payments</CardTitle>
              <CardDescription>
                Successfully processed payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3.5 text-left text-sm font-semibold">ID</th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold">User</th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold">Method</th>
                      <th className="px-4 py-3.5 text-right text-sm font-semibold">Amount</th>
                      <th className="px-4 py-3.5 text-right text-sm font-semibold">Date</th>
                      <th className="px-4 py-3.5 text-right text-sm font-semibold">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-4 text-sm" colSpan={6}>
                        <div className="text-center text-muted-foreground">
                          No completed payments
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Payments</CardTitle>
              <CardDescription>
                Payments that could not be processed successfully
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-muted-foreground">
                <p>No failed payments</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="refunded" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Refunded Payments</CardTitle>
              <CardDescription>
                Payments that have been refunded to the user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-muted-foreground">
                <p>No refunded payments</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}