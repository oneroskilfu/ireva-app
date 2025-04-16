import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  UserCog,
  Building,
  Users,
  BadgeDollarSign,
  ShieldCheck,
  BarChart3,
  ClipboardList,
  Settings,
  Menu,
  Home,
  ChevronRight,
  LogOut,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLocation } from "wouter";

// Admin components
import UserManagement from "./components/user-management";
import PropertyManagement from "./components/property-management";
import InvestmentManagement from "./components/investment-management";
import KycVerification from "./components/kyc-verification";
import RoiTracker from "./components/roi-tracker";

// Dashboard statistics component
const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Users"
        value="342"
        change="+12%"
        icon={<Users className="h-8 w-8" />}
      />
      <StatCard
        title="Total Properties"
        value="18"
        change="+3"
        icon={<Building className="h-8 w-8" />}
      />
      <StatCard
        title="Active Investments"
        value="₦45.8M"
        change="+₦5.2M"
        icon={<BadgeDollarSign className="h-8 w-8" />}
      />
      <StatCard
        title="Pending KYC"
        value="7"
        change="-2"
        icon={<ShieldCheck className="h-8 w-8" />}
      />
    </div>
  );
};

// Stat card component
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
  const isPositive = change.startsWith("+");
  return (
    <div className="bg-card border rounded-lg p-6 flex flex-col">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 bg-primary/10 rounded-md text-primary">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <div className={`mt-1 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
        {change} from last month
      </div>
    </div>
  );
};

// Activity chart component
const ActivityChart = () => {
  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Platform Activity</h3>
      <div className="h-64 flex items-center justify-center">
        <p className="text-muted-foreground">Chart visualization will appear here</p>
      </div>
    </div>
  );
};

// Admin dashboard component
const AdminDashboard = () => {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const isSuperAdmin = user?.role === "super_admin";

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/auth");
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="flex flex-col gap-4 mt-8">
                  <SidebarItem
                    icon={<Home />}
                    label="Dashboard"
                    active={activeTab === "overview"}
                    onClick={() => setActiveTab("overview")}
                  />
                  <SidebarItem
                    icon={<UserCog />}
                    label="User Management"
                    active={activeTab === "users"}
                    onClick={() => setActiveTab("users")}
                  />
                  <SidebarItem
                    icon={<Building />}
                    label="Property Management"
                    active={activeTab === "properties"}
                    onClick={() => setActiveTab("properties")}
                  />
                  <SidebarItem
                    icon={<BadgeDollarSign />}
                    label="Investments"
                    active={activeTab === "investments"}
                    onClick={() => setActiveTab("investments")}
                  />
                  <SidebarItem
                    icon={<ShieldCheck />}
                    label="KYC Verification"
                    active={activeTab === "kyc"}
                    onClick={() => setActiveTab("kyc")}
                  />
                  <SidebarItem
                    icon={<BarChart3 />}
                    label="Analytics"
                    active={activeTab === "analytics"}
                    onClick={() => setActiveTab("analytics")}
                  />
                  <SidebarItem
                    icon={<TrendingUp />}
                    label="ROI Tracker"
                    active={activeTab === "roi"}
                    onClick={() => setActiveTab("roi")}
                  />
                  <SidebarItem
                    icon={<ClipboardList />}
                    label="Reports"
                    active={activeTab === "reports"}
                    onClick={() => setActiveTab("reports")}
                  />
                  {isSuperAdmin && (
                    <SidebarItem
                      icon={<Settings />}
                      label="System Settings"
                      active={activeTab === "settings"}
                      onClick={() => setActiveTab("settings")}
                    />
                  )}
                </nav>
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold ml-2">IREVA Admin</h1>
            <div className="hidden md:flex ml-10">
              <TabsList className="grid grid-cols-4 w-[400px]">
                <TabsTrigger 
                  value="overview" 
                  onClick={() => setActiveTab("overview")}
                  className={activeTab === "overview" ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  onClick={() => setActiveTab("users")}
                  className={activeTab === "users" ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
                >
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="properties" 
                  onClick={() => setActiveTab("properties")}
                  className={activeTab === "properties" ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
                >
                  Properties
                </TabsTrigger>
                <TabsTrigger 
                  value="more" 
                  onClick={() => setActiveTab("more")}
                  className={activeTab === "more" ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
                >
                  More
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <p className="text-sm font-medium">
                {user?.username} <span className="text-muted-foreground">({user?.role})</span>
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r min-h-[calc(100vh-60px)] p-4 bg-card">
          <nav className="flex flex-col gap-1">
            <SidebarItem
              icon={<Home />}
              label="Dashboard"
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
            />
            <SidebarItem
              icon={<UserCog />}
              label="User Management"
              active={activeTab === "users"}
              onClick={() => setActiveTab("users")}
            />
            <SidebarItem
              icon={<Building />}
              label="Property Management"
              active={activeTab === "properties"}
              onClick={() => setActiveTab("properties")}
            />
            <SidebarItem
              icon={<BadgeDollarSign />}
              label="Investments"
              active={activeTab === "investments"}
              onClick={() => setActiveTab("investments")}
            />
            <SidebarItem
              icon={<ShieldCheck />}
              label="KYC Verification"
              active={activeTab === "kyc"}
              onClick={() => setActiveTab("kyc")}
            />
            <SidebarItem
              icon={<BarChart3 />}
              label="Analytics"
              active={activeTab === "analytics"}
              onClick={() => setActiveTab("analytics")}
            />
            <SidebarItem
              icon={<TrendingUp />}
              label="ROI Tracker"
              active={activeTab === "roi"}
              onClick={() => setActiveTab("roi")}
            />
            <SidebarItem
              icon={<ClipboardList />}
              label="Reports"
              active={activeTab === "reports"}
              onClick={() => setActiveTab("reports")}
            />
            {isSuperAdmin && (
              <SidebarItem
                icon={<Settings />}
                label="System Settings"
                active={activeTab === "settings"}
                onClick={() => setActiveTab("settings")}
              />
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="overview" className="space-y-6">
              <h2 className="text-2xl font-bold">Dashboard Overview</h2>
              <DashboardStats />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="col-span-2">
                  <ActivityChart />
                </div>
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Recent Activities</h3>
                  <div className="space-y-4">
                    <ActivityItem 
                      title="New User Registration" 
                      description="John Doe joined the platform" 
                      time="2 hours ago" 
                    />
                    <ActivityItem 
                      title="Investment Made" 
                      description="₦500,000 invested in Lekki Gardens" 
                      time="3 hours ago" 
                    />
                    <ActivityItem 
                      title="KYC Submitted" 
                      description="Sarah Johnson submitted KYC documents" 
                      time="4 hours ago" 
                    />
                    <ActivityItem 
                      title="Property Added" 
                      description="Harmony Heights added to listings" 
                      time="Yesterday" 
                    />
                    <ActivityItem 
                      title="Return Disbursed" 
                      description="Monthly returns processed for Victoria Island Towers" 
                      time="Yesterday" 
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">User Management</h2>
              </div>
              <UserManagement isSuperAdmin={isSuperAdmin} />
            </TabsContent>

            <TabsContent value="properties" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Property Management</h2>
              </div>
              <PropertyManagement />
            </TabsContent>

            <TabsContent value="investments" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Investment Management</h2>
              </div>
              <InvestmentManagement />
            </TabsContent>

            <TabsContent value="kyc" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">KYC Verification</h2>
              </div>
              <KycVerification />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Analytics & Reporting</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Investment Distribution</h3>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Chart will appear here</p>
                  </div>
                </div>
                
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">User Growth</h3>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Chart will appear here</p>
                  </div>
                </div>
                
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Property Performance</h3>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Chart will appear here</p>
                  </div>
                </div>
                
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Revenue Metrics</h3>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Chart will appear here</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Reports</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ReportCard 
                  title="Monthly Financial Report" 
                  description="Revenue, expenses, and profit for the current month" 
                  buttonText="Generate Report"
                />
                <ReportCard 
                  title="User Activity Report" 
                  description="User registrations, logins, and engagement metrics" 
                  buttonText="Generate Report"
                />
                <ReportCard 
                  title="Investment Summary" 
                  description="Total investments, returns, and performance by property" 
                  buttonText="Generate Report"
                />
                <ReportCard 
                  title="KYC Compliance Report" 
                  description="Status of user verification and compliance metrics" 
                  buttonText="Generate Report"
                />
                <ReportCard 
                  title="Property Performance" 
                  description="Return rates, occupancy, and maintenance costs" 
                  buttonText="Generate Report"
                />
                <ReportCard 
                  title="Custom Report" 
                  description="Create a custom report with selected metrics and timeframes" 
                  buttonText="Create Custom"
                />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">System Settings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Platform Settings</h3>
                  <div className="space-y-4">
                    <SettingsItem 
                      title="Maintenance Mode" 
                      description="Enable maintenance mode for scheduled updates" 
                      type="toggle"
                      value={false}
                    />
                    <SettingsItem 
                      title="Investment Fee" 
                      description="Fee percentage for each investment transaction" 
                      type="input"
                      value="2.5%"
                    />
                    <SettingsItem 
                      title="KYC Requirements" 
                      description="Configure required documents for verification" 
                      type="select"
                      value="Standard"
                    />
                    <SettingsItem 
                      title="Email Notifications" 
                      description="Configure system email notification settings" 
                      type="button"
                      value="Configure"
                    />
                  </div>
                </div>
                
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Security Settings</h3>
                  <div className="space-y-4">
                    <SettingsItem 
                      title="Two-Factor Authentication" 
                      description="Require 2FA for admin accounts" 
                      type="toggle"
                      value={true}
                    />
                    <SettingsItem 
                      title="Password Policy" 
                      description="Configure password requirements and expiration" 
                      type="button"
                      value="Configure"
                    />
                    <SettingsItem 
                      title="Session Timeout" 
                      description="Time before admin sessions expire" 
                      type="input"
                      value="30 minutes"
                    />
                    <SettingsItem 
                      title="IP Restrictions" 
                      description="Restrict admin access to specific IP addresses" 
                      type="button"
                      value="Configure"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

// Sidebar Item Component
interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => {
  return (
    <button
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted"
      }`}
      onClick={onClick}
    >
      <span className={`${active ? "" : "text-muted-foreground"}`}>{icon}</span>
      <span className="font-medium">{label}</span>
      {active && <ChevronRight className="h-4 w-4 ml-auto" />}
    </button>
  );
};

// Activity Item Component
interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ title, description, time }) => {
  return (
    <div className="border-b pb-4 last:border-0 last:pb-0">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
      <p className="text-xs text-muted-foreground mt-1">{time}</p>
    </div>
  );
};

// Report Card Component
interface ReportCardProps {
  title: string;
  description: string;
  buttonText: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, buttonText }) => {
  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Button variant="outline" className="w-full">
        {buttonText}
      </Button>
    </div>
  );
};

// Settings Item Component
interface SettingsItemProps {
  title: string;
  description: string;
  type: "toggle" | "input" | "select" | "button";
  value: string | boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ title, description, type, value }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {type === "toggle" && (
        <div className={`w-10 h-5 rounded-full relative ${value ? "bg-primary" : "bg-muted"}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? "left-5" : "left-0.5"}`}></div>
        </div>
      )}
      {type === "input" && (
        <Input value={value as string} className="w-24 text-sm" />
      )}
      {type === "select" && (
        <select className="bg-muted rounded px-2 py-1 text-sm">
          <option>{value}</option>
          <option>Custom</option>
          <option>Basic</option>
        </select>
      )}
      {type === "button" && (
        <Button variant="outline" size="sm">{value}</Button>
      )}
    </div>
  );
};

export default AdminDashboard;