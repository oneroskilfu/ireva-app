import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  BarChart3Icon,
  HomeIcon,
  Users2Icon,
  Building2Icon,
  BriefcaseIcon,
  Settings2Icon,
  LogOutIcon,
  LayoutDashboardIcon,
  AlertCircleIcon,
  ArrowUpRightIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Admin Dashboard page component
 * Only accessible to users with admin role
 */
const AdminDashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    setLocation('/login');
  };
  
  // Dummy data for the dashboard
  const stats = {
    totalUsers: 856,
    activeInvestors: 492,
    totalProperties: 38,
    activeInvestments: 1204,
    totalFunds: '₦892,450,000',
    returnsPaid: '₦123,560,000',
    pendingKyc: 24,
    pendingWithdrawals: 12
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-muted/30 border-r border-border">
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary">iREVA Admin</h2>
          <p className="text-sm text-muted-foreground">Property Investment Platform</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 py-4">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin" className="flex items-center">
                <LayoutDashboardIcon className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <Users2Icon className="mr-3 h-5 w-5" />
              Users
            </Button>
            
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <Building2Icon className="mr-3 h-5 w-5" />
              Properties
            </Button>
            
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <BriefcaseIcon className="mr-3 h-5 w-5" />
              Investments
            </Button>
            
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <BarChart3Icon className="mr-3 h-5 w-5" />
              Analytics
            </Button>
            
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <Settings2Icon className="mr-3 h-5 w-5" />
              Settings
            </Button>
          </div>
        </nav>
        
        <div className="p-4 mt-auto border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleLogout}>
            <LogOutIcon className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-background border-b border-border h-16 flex items-center px-6">
          <div className="md:hidden mr-4">
            <Button variant="ghost" size="icon">
              <LayoutDashboardIcon className="h-5 w-5" />
            </Button>
          </div>
          
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/" className="flex items-center">
                <HomeIcon className="mr-2 h-4 w-4" />
                View Site
              </Link>
            </Button>
            
            <Button variant="destructive" className="md:hidden" onClick={handleLogout}>
              <LogOutIcon className="h-4 w-4" />
            </Button>
          </div>
        </header>
        
        {/* Main dashboard content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-6">
            {/* Stats overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Investors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeInvestors}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Properties Listed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProperties}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +3 new this month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Investments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeInvestments}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +24% from last month
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Alerts section */}
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <AlertCircleIcon className="h-4 w-4 mr-2 text-amber-500" />
                  Pending Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-md">
                      <Users2Icon className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">KYC Verifications</p>
                      <p className="text-xs text-muted-foreground">{stats.pendingKyc} users waiting for approval</p>
                    </div>
                    <Button size="sm" variant="outline" className="ml-auto">
                      Review
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-md">
                      <ArrowUpRightIcon className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Withdrawal Requests</p>
                      <p className="text-xs text-muted-foreground">{stats.pendingWithdrawals} pending withdrawals</p>
                    </div>
                    <Button size="sm" variant="outline" className="ml-auto">
                      Process
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Financial overview */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Total Funds Invested</p>
                        <p className="text-xs text-muted-foreground">Current active investments</p>
                      </div>
                      <div className="font-bold">{stats.totalFunds}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Returns Paid to Investors</p>
                        <p className="text-xs text-muted-foreground">Total ROI paid to date</p>
                      </div>
                      <div className="font-bold">{stats.returnsPaid}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Average ROI</p>
                        <p className="text-xs text-muted-foreground">Across all properties</p>
                      </div>
                      <div className="font-bold">14.5%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <p className="text-sm font-medium">New investment</p>
                      <p className="text-xs text-muted-foreground">Uzoma I. invested ₦500,000 in Lagos Heights</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                      <p className="text-sm font-medium">User registered</p>
                      <p className="text-xs text-muted-foreground">Chioma E. created a new account</p>
                      <p className="text-xs text-muted-foreground">4 hours ago</p>
                    </div>
                    
                    <div className="border-l-4 border-amber-500 pl-4 py-2">
                      <p className="text-sm font-medium">KYC submitted</p>
                      <p className="text-xs text-muted-foreground">Emeka O. completed KYC verification</p>
                      <p className="text-xs text-muted-foreground">Yesterday</p>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4 py-2">
                      <p className="text-sm font-medium">Property added</p>
                      <p className="text-xs text-muted-foreground">New property: Lekki Garden Apartments</p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;