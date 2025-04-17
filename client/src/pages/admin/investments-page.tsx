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
import { Search, Filter, RefreshCw } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function AdminInvestments() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Temporarily use a mock data approach until the API endpoint is implemented
  const { data: investments, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/admin/investments'],
    queryFn: async () => {
      // Return mock data instead of making an actual API call that would fail
      return [];
    }
  });

  const handleRefresh = () => {
    toast({
      title: "Refreshing investments data",
      description: "The investments list is being updated.",
    });
    refetch();
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
        <div className="mx-auto h-12 w-12 text-destructive opacity-75">⚠️</div>
        <h3 className="mt-4 text-lg font-semibold">Failed to Load Investments</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          There was an error loading the investment data. Please try again later.
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
        <h2 className="text-3xl font-bold tracking-tight">Investment Management</h2>
        <p className="text-muted-foreground">
          Track and manage all property investments on the platform.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search investments..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Investments</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investment List</CardTitle>
              <CardDescription>
                View and manage all investments on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {investments && investments.length > 0 ? (
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3.5 text-left text-sm font-semibold">Investor</th>
                        <th className="px-4 py-3.5 text-left text-sm font-semibold">Property</th>
                        <th className="px-4 py-3.5 text-right text-sm font-semibold">Amount</th>
                        <th className="px-4 py-3.5 text-center text-sm font-semibold">Status</th>
                        <th className="px-4 py-3.5 text-right text-sm font-semibold">Date</th>
                        <th className="px-4 py-3.5 text-right text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-4 text-sm" colSpan={6}>
                          <div className="text-center text-muted-foreground">
                            No investment data available
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No investments found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Investments</CardTitle>
              <CardDescription>
                Currently active investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-muted-foreground">
                <p>No active investments found</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Investments</CardTitle>
              <CardDescription>
                Investments awaiting approval or processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-muted-foreground">
                <p>No pending investments found</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Investments</CardTitle>
              <CardDescription>
                Investments that have reached maturity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-muted-foreground">
                <p>No completed investments found</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}