import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import UserManagement from "./components/user-management";
import PropertyManagement from "./components/property-management";
import InvestmentManagement from "./components/investment-management";
import KycVerification from "./components/kyc-verification";
import { formatCurrency } from "@/lib/utils";

const AdminDashboard = () => {
  const { user, isLoading, error } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Check if user is admin or super_admin
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            {user.role === "super_admin" ? "Super Admin" : "Admin"}
          </Badge>
          <div className="text-sm">
            Welcome, {user.firstName || user.username}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <DashboardOverview />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManagement isSuperAdmin={user.role === "super_admin"} />
        </TabsContent>

        <TabsContent value="properties" className="mt-6">
          <PropertyManagement />
        </TabsContent>

        <TabsContent value="investments" className="mt-6">
          <InvestmentManagement />
        </TabsContent>

        <TabsContent value="kyc" className="mt-6">
          <KycVerification />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;

const DashboardOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/stats"],
    staleTime: 1000 * 60, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userCount}</div>
            <p className="text-xs text-muted-foreground">
              Registered platform users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.propertyCount}</div>
            <p className="text-xs text-muted-foreground">
              Listed investment properties
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalInvestmentAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Total investments made
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingKycCount}</div>
            <p className="text-xs text-muted-foreground">
              Verifications waiting for review
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Funding Progress</CardTitle>
            <CardDescription>
              Overall property funding completion
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="flex items-center">
              <div className="w-full bg-secondary rounded-full h-4">
                <div 
                  className="bg-primary rounded-full h-4" 
                  style={{ width: `${Math.min(stats.propertyFundingProgress || 0, 100)}%` }}
                ></div>
              </div>
              <span className="ml-2">{Math.round(stats.propertyFundingProgress || 0)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Active Investments</CardTitle>
            <CardDescription>
              Currently active investment count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeInvestmentCount}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Investments in active funding status
            </p>
          </CardContent>
        </Card>
      </div>

      <RecentActivity />
    </div>
  );
};

const RecentActivity = () => {
  // Placeholder for recent activity
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest platform activity logs</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Investment Made</TableCell>
              <TableCell>John Doe</TableCell>
              <TableCell>10 minutes ago</TableCell>
              <TableCell>
                <Badge variant="outline">₦250,000</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Property Added</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>1 hour ago</TableCell>
              <TableCell>
                <Badge variant="outline">Marina Heights</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">KYC Submitted</TableCell>
              <TableCell>Sarah Johnson</TableCell>
              <TableCell>2 hours ago</TableCell>
              <TableCell>
                <Badge variant="outline">Pending</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">KYC Approved</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>3 hours ago</TableCell>
              <TableCell>
                <Badge variant="outline">Michael Smith</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};