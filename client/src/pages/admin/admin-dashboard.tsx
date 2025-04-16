import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useRoute } from "wouter";
import { 
  Users, 
  Home, 
  Settings, 
  Activity, 
  Building, 
  FileText, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Redirect if not admin
  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    navigate("/dashboard");
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this area.",
      variant: "destructive"
    });
    return null;
  }
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex h-screen bg-amber-50">
      {/* Admin Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b border-amber-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#8B4513] text-white flex items-center justify-center">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-gray-800">iREVA Admin</div>
              <div className="text-xs text-gray-500">
                {user?.role === 'super_admin' ? 'Super Admin' : 'Administrator'}
              </div>
            </div>
          </div>
        </div>

        <div className="py-4">
          <div className="px-4 py-2 text-xs font-semibold text-amber-800">MAIN</div>
          <button
            className={`flex items-center w-full px-4 py-2 text-left ${
              activeTab === "overview" ? "bg-amber-50 text-[#8B4513]" : "text-gray-700 hover:bg-amber-50"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            <Home className="h-4 w-4 mr-3" />
            Overview
          </button>
          <button
            className={`flex items-center w-full px-4 py-2 text-left ${
              activeTab === "users" ? "bg-amber-50 text-[#8B4513]" : "text-gray-700 hover:bg-amber-50"
            }`}
            onClick={() => setActiveTab("users")}
          >
            <Users className="h-4 w-4 mr-3" />
            Users
          </button>
          <button
            className={`flex items-center w-full px-4 py-2 text-left ${
              activeTab === "properties" ? "bg-amber-50 text-[#8B4513]" : "text-gray-700 hover:bg-amber-50"
            }`}
            onClick={() => setActiveTab("properties")}
          >
            <Building className="h-4 w-4 mr-3" />
            Properties
          </button>
          <button
            className={`flex items-center w-full px-4 py-2 text-left ${
              activeTab === "investments" ? "bg-amber-50 text-[#8B4513]" : "text-gray-700 hover:bg-amber-50"
            }`}
            onClick={() => setActiveTab("investments")}
          >
            <Activity className="h-4 w-4 mr-3" />
            Investments
          </button>
          <button
            className={`flex items-center w-full px-4 py-2 text-left ${
              activeTab === "kyc" ? "bg-amber-50 text-[#8B4513]" : "text-gray-700 hover:bg-amber-50"
            }`}
            onClick={() => setActiveTab("kyc")}
          >
            <FileText className="h-4 w-4 mr-3" />
            KYC Verifications
          </button>
          <button
            className={`flex items-center w-full px-4 py-2 text-left ${
              activeTab === "payments" ? "bg-amber-50 text-[#8B4513]" : "text-gray-700 hover:bg-amber-50"
            }`}
            onClick={() => setActiveTab("payments")}
          >
            <CreditCard className="h-4 w-4 mr-3" />
            Payments
          </button>
          
          <div className="px-4 py-2 mt-4 text-xs font-semibold text-amber-800">SYSTEM</div>
          <button
            className={`flex items-center w-full px-4 py-2 text-left ${
              activeTab === "settings" ? "bg-amber-50 text-[#8B4513]" : "text-gray-700 hover:bg-amber-50"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </button>
          <button
            className={`flex items-center w-full px-4 py-2 text-left ${
              activeTab === "help" ? "bg-amber-50 text-[#8B4513]" : "text-gray-700 hover:bg-amber-50"
            }`}
            onClick={() => setActiveTab("help")}
          >
            <HelpCircle className="h-4 w-4 mr-3" />
            Help & Support
          </button>
          
          <div className="px-4 pt-6 pb-2">
            <Button variant="outline" className="w-full justify-start text-[#8B4513] border-amber-200 hover:bg-amber-50 hover:text-[#8B4513]" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Admin Header */}
        <div className="bg-amber-50 shadow-sm border-b border-amber-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#8B4513]">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "users" && "User Management"}
              {activeTab === "properties" && "Property Management"}
              {activeTab === "investments" && "Investment Tracking"}
              {activeTab === "kyc" && "KYC Verification Requests"}
              {activeTab === "payments" && "Payment Transactions"}
              {activeTab === "settings" && "System Settings"}
              {activeTab === "help" && "Help & Documentation"}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-amber-700">{user?.email}</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-[#8B4513] flex items-center justify-center text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="hidden">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="investments">Investments</TabsTrigger>
              <TabsTrigger value="kyc">KYC</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,451</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">+16%</span> from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">+5</span> new listings
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦856.3M</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">+23%</span> growth rate
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent User Signups</CardTitle>
                  <CardDescription>New users in the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                            U{i}
                          </div>
                          <div>
                            <div className="font-medium">User {1000 + i}</div>
                            <div className="text-xs text-gray-500">user{i}@example.com</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full border-amber-200 hover:bg-amber-50 text-[#8B4513] hover:text-[#8B4513]">View All Users</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending KYC Verifications</CardTitle>
                  <CardDescription>Verification requests awaiting approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">Verification #{i}</div>
                            <div className="text-xs text-gray-500">Submitted 2 days ago</div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="border-amber-200 hover:bg-amber-50 text-[#8B4513] hover:text-[#8B4513]">Review</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full border-amber-200 hover:bg-amber-50 text-[#8B4513] hover:text-[#8B4513]">View All Requests</Button>
                </CardFooter>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Properties</CardTitle>
                <CardDescription>Based on investment volume and returns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="font-medium">Property Name {i}</div>
                        <div className="text-xs text-gray-500">Lagos, Nigeria</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₦{i * 12.5}M</div>
                        <div className="text-xs text-green-600">+{i + 10}% ROI</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage and monitor platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium text-gray-400">User management functionality will be implemented here</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Property Management</CardTitle>
                <CardDescription>Add, edit, and monitor investment properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium text-gray-400">Property management functionality will be implemented here</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investments">
            <Card>
              <CardHeader>
                <CardTitle>Investment Monitoring</CardTitle>
                <CardDescription>Track all platform investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium text-gray-400">Investment tracking functionality will be implemented here</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc">
            <Card>
              <CardHeader>
                <CardTitle>KYC Verification Queue</CardTitle>
                <CardDescription>Manage user verification requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium text-gray-400">KYC management functionality will be implemented here</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Transactions</CardTitle>
                <CardDescription>Monitor and manage all financial transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium text-gray-400">Payment transaction functionality will be implemented here</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure platform settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium text-gray-400">Settings management functionality will be implemented here</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="help">
            <Card>
              <CardHeader>
                <CardTitle>Help & Documentation</CardTitle>
                <CardDescription>Administrator documentation and resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium text-gray-400">Help and documentation functionality will be implemented here</div>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}