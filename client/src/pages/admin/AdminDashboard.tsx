import { useState, useEffect, useTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  CheckSquare, 
  Loader2 
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getQueryFn } from '@/lib/queryClient';

interface DashboardStats {
  userCount: number;
  propertyCount: number;
  investmentCount: number;
  totalInvestmentAmount: number;
  activeInvestmentCount: number;
  pendingKycCount: number;
  propertyFundingProgress: number;
  totalReturns?: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isPending, startTransition] = useTransition();
  
  // Fetch dashboard stats
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard/stats'],
    queryFn: getQueryFn({ on401: "throw" }),
    retry: 1, // Only retry once to prevent excessive API calls
    refetchOnWindowFocus: false, // Prevent refetching on window focus
  });
  
  // Count notifications for the admin
  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications/unread'],
    queryFn: getQueryFn({ on401: "throw" }),
    retry: 1, // Only retry once
    refetchOnWindowFocus: false // Prevent refetching on window focus
  });
  
  // Show loading state
  if (isLoading) {
    return (
      <AdminLayout>
        <Helmet>
          <title>Admin Dashboard | iREVA</title>
        </Helmet>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <AdminLayout>
        <Helmet>
          <title>Error | Admin Dashboard | iREVA</title>
        </Helmet>
        <div className="p-6 text-center">
          <p className="text-red-500 mb-2">Error loading dashboard data.</p>
          <p className="text-muted-foreground">Please try again later or contact support.</p>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Admin Dashboard | iREVA</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of platform performance and management tasks.
          </p>
        </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={(value) => startTransition(() => setActiveTab(value))}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* User Count */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.userCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active accounts on the platform
                </p>
              </CardContent>
            </Card>
            
            {/* Property Count */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Properties</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.propertyCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Listed across all categories
                </p>
              </CardContent>
            </Card>
            
            {/* Investment Count */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investments</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.investmentCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total active investments
                </p>
              </CardContent>
            </Card>
            
            {/* Total Investment Amount */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{data?.totalInvestmentAmount?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Across all properties
                </p>
              </CardContent>
            </Card>
            
            {/* Total Returns */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{data?.totalReturns?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Paid out to investors
                </p>
              </CardContent>
            </Card>
            
            {/* Pending KYC */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.pendingKycCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting verification
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder for recent activity - will be implemented with actual data */}
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Recent activity data will be displayed here.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
                <CardDescription>Key metrics and growth indicators</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder for platform statistics - will be implemented with actual data */}
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Platform statistics charts will be displayed here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Management</CardTitle>
              <CardDescription>Manage properties, listings, and details</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Property management functionality will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="investments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investment Management</CardTitle>
              <CardDescription>Track and manage investor commitments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Investment management functionality will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                User management functionality will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}