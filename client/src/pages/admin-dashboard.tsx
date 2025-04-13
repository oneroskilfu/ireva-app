import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { User, Property, Investment } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  BarChart3, 
  Building, 
  DollarSign, 
  Edit, 
  Plus, 
  Trash, 
  Users 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Type definitions for admin dashboard
interface AdminDashboardData {
  totalUsers: number;
  totalProperties: number;
  totalInvestments: number;
  totalInvestedAmount: number;
  propertiesByType: Record<string, number>;
  investmentsByStatus: Record<string, number>;
  recentUsers: User[];
  recentInvestments: (Investment & {
    user: { id: number; username: string } | null;
    property: { id: number; name: string } | null;
  })[];
}

interface InvestmentWithDetails extends Investment {
  user: User | null;
  property: Property | null;
}

// Reusable stat card component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  change 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  change?: number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground flex items-center">
            {change > 0 ? (
              <ArrowUpIcon className="mr-1 h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownIcon className="mr-1 h-4 w-4 text-red-600" />
            )}
            <span className={change > 0 ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(change)}%
            </span>{' '}
            from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch admin dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<AdminDashboardData>({
    queryKey: ["/api/admin/dashboard"],
    enabled: !!user?.isAdmin,
  });

  // Fetch users list
  const { data: users, isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin && selectedTab === "users",
  });

  // Fetch properties list
  const { data: properties, isLoading: isPropertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/admin/properties"],
    enabled: !!user?.isAdmin && selectedTab === "properties",
  });

  // Fetch investments list
  const { data: investments, isLoading: isInvestmentsLoading } = useQuery<InvestmentWithDetails[]>({
    queryKey: ["/api/admin/investments"],
    enabled: !!user?.isAdmin && selectedTab === "investments",
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Redirect if user is not admin
  if (!user?.isAdmin) {
    toast({
      title: "Unauthorized",
      description: "You do not have access to the admin dashboard",
      variant: "destructive",
    });
    return <Redirect to="/" />;
  }

  // Handle delete user
  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  // Handle delete property
  const handleDeleteProperty = async (propertyId: number) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    
    try {
      await apiRequest("DELETE", `/api/admin/properties/${propertyId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete property. It may have active investments.",
        variant: "destructive",
      });
    }
  };

  // Handle delete investment
  const handleDeleteInvestment = async (investmentId: number) => {
    if (!confirm("Are you sure you want to delete this investment?")) return;
    
    try {
      await apiRequest("DELETE", `/api/admin/investments/${investmentId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      
      toast({
        title: "Success",
        description: "Investment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete investment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/">
          <Button variant="outline">Return to Main Site</Button>
        </Link>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users Management</TabsTrigger>
          <TabsTrigger value="properties">Properties Management</TabsTrigger>
          <TabsTrigger value="investments">Investments Management</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {isDashboardLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : dashboardData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Total Users" 
                  value={dashboardData.totalUsers} 
                  icon={Users}
                  change={5} // Example change value
                />
                <StatCard 
                  title="Total Properties" 
                  value={dashboardData.totalProperties} 
                  icon={Building}
                  change={2} // Example change value
                />
                <StatCard 
                  title="Total Investments" 
                  value={dashboardData.totalInvestments} 
                  icon={BarChart3}
                  change={8} // Example change value
                />
                <StatCard 
                  title="Total Invested" 
                  value={`$${(dashboardData.totalInvestedAmount / 1000).toFixed(1)}K`} 
                  icon={DollarSign}
                  change={12} // Example change value
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentUsers.map(user => (
                        <div key={user.id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <Badge variant={user.isAdmin ? "destructive" : "outline"}>
                            {user.isAdmin ? "Admin" : "User"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Investments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentInvestments.map(investment => (
                        <div key={investment.id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">
                              {investment.user?.username || "Unknown User"} → {investment.property?.name || "Unknown Property"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ${investment.amount.toLocaleString()} • {investment.date ? new Date(investment.date).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                          <Badge variant={investment.status === "active" ? "default" : 
                                         investment.status === "completed" ? "secondary" : "secondary"}>
                            {investment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-10">Failed to load dashboard data</div>
          )}
        </TabsContent>

        {/* Users Management Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Users Management</CardTitle>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isUsersLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : users && users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-4 text-left">ID</th>
                        <th className="py-2 px-4 text-left">Username</th>
                        <th className="py-2 px-4 text-left">Email</th>
                        <th className="py-2 px-4 text-left">Name</th>
                        <th className="py-2 px-4 text-left">Role</th>
                        <th className="py-2 px-4 text-left">Created</th>
                        <th className="py-2 px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{user.id}</td>
                          <td className="py-2 px-4">{user.username}</td>
                          <td className="py-2 px-4">{user.email}</td>
                          <td className="py-2 px-4">{user.firstName} {user.lastName}</td>
                          <td className="py-2 px-4">
                            <Badge variant={user.isAdmin ? "destructive" : "outline"}>
                              {user.isAdmin ? "Admin" : "User"}
                            </Badge>
                          </td>
                          <td className="py-2 px-4">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
                          <td className="py-2 px-4">
                            <div className="flex gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit User</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                      onClick={() => handleDeleteUser(user.id)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete User</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">No users found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Properties Management Tab */}
        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Properties Management</CardTitle>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Property
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isPropertiesLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : properties && properties.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-4 text-left">ID</th>
                        <th className="py-2 px-4 text-left">Name</th>
                        <th className="py-2 px-4 text-left">Location</th>
                        <th className="py-2 px-4 text-left">Type</th>
                        <th className="py-2 px-4 text-left">Funding</th>
                        <th className="py-2 px-4 text-left">Target Return</th>
                        <th className="py-2 px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map(property => (
                        <tr key={property.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{property.id}</td>
                          <td className="py-2 px-4">{property.name}</td>
                          <td className="py-2 px-4">{property.location}</td>
                          <td className="py-2 px-4">
                            <Badge variant="outline" className="capitalize">
                              {property.type}
                            </Badge>
                          </td>
                          <td className="py-2 px-4">
                            ${property.currentFunding.toLocaleString()} / ${property.totalFunding.toLocaleString()}
                            <div className="w-full bg-muted h-2 rounded-full mt-1">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${Math.min(100, (property.currentFunding / property.totalFunding) * 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="py-2 px-4">{property.targetReturn}%</td>
                          <td className="py-2 px-4">
                            <div className="flex gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit Property</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                      onClick={() => handleDeleteProperty(property.id)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete Property</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">No properties found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investments Management Tab */}
        <TabsContent value="investments">
          <Card>
            <CardHeader>
              <CardTitle>Investments Management</CardTitle>
            </CardHeader>
            <CardContent>
              {isInvestmentsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : investments && investments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-4 text-left">ID</th>
                        <th className="py-2 px-4 text-left">User</th>
                        <th className="py-2 px-4 text-left">Property</th>
                        <th className="py-2 px-4 text-left">Amount</th>
                        <th className="py-2 px-4 text-left">Current Value</th>
                        <th className="py-2 px-4 text-left">Status</th>
                        <th className="py-2 px-4 text-left">Date</th>
                        <th className="py-2 px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.map(investment => (
                        <tr key={investment.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{investment.id}</td>
                          <td className="py-2 px-4">{investment.user?.username || 'Unknown'}</td>
                          <td className="py-2 px-4">{investment.property?.name || 'Unknown'}</td>
                          <td className="py-2 px-4">${investment.amount.toLocaleString()}</td>
                          <td className="py-2 px-4">${investment.currentValue.toLocaleString()}</td>
                          <td className="py-2 px-4">
                            <Badge variant={
                              investment.status === "active" ? "default" : 
                              investment.status === "completed" ? "secondary" : 
                              "secondary"
                            }>
                              {investment.status}
                            </Badge>
                          </td>
                          <td className="py-2 px-4">{investment.date ? new Date(investment.date).toLocaleDateString() : "N/A"}</td>
                          <td className="py-2 px-4">
                            <div className="flex gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit Investment</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                      onClick={() => handleDeleteInvestment(investment.id)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete Investment</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">No investments found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}