import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useApiRequest } from '../../hooks/useApiRequest';
import {
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
} from '../../components/ui/DesignSystem';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BellIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ArrowPathIcon,
  UserPlusIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';

import UserManagement from '../../components/admin/UserManagement';
import PropertyManagement from '../../components/admin/PropertyManagement';
import InvestmentManagement from '../../components/admin/InvestmentManagement';
import KycManagement from '../../components/admin/KycManagement';
import AdminReports from '../../components/admin/AdminReports';
import NotificationManager from '../../components/admin/NotificationManager';
import SecurityDashboard from '../../components/admin/SecurityDashboard';

// Format currency utility
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount));
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const api = useApiRequest();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch admin stats
  const { 
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await api.get('admin/stats');
      return response.data.data;
    },
    enabled: !!user && user.role === 'admin',
    refetchOnWindowFocus: false,
  });
  
  // Make sure user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShieldCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
        <p className="text-gray-600 mb-6">
          You do not have sufficient permissions to access the admin dashboard.
        </p>
        <Button onClick={() => window.location.href = '/'}>
          Return to Home
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">
            Manage your platform, users, properties, and investments
          </p>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={refetchStats} disabled={isLoadingStats}>
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold">
                  {isLoadingStats ? '...' : statsData?.users?.total || 0}
                </h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm">
              <span>Active: {isLoadingStats ? '...' : statsData?.users?.active || 0}</span>
              <span>Pending KYC: {isLoadingStats ? '...' : statsData?.users?.pendingKyc || 0}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Properties</p>
                <h3 className="text-2xl font-bold">
                  {isLoadingStats ? '...' : statsData?.properties?.total || 0}
                </h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm">
              <span>Active: {isLoadingStats ? '...' : statsData?.properties?.active || 0}</span>
              <span>Fully Funded: {isLoadingStats ? '...' : statsData?.properties?.fullyFunded || 0}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Investments</p>
                <h3 className="text-2xl font-bold">
                  {isLoadingStats ? '...' : formatCurrency(statsData?.investments?.totalAmount || 0)}
                </h3>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <div>Count: {isLoadingStats ? '...' : statsData?.investments?.count || 0}</div>
              <div>Avg: {isLoadingStats ? '...' : formatCurrency(statsData?.investments?.averageAmount || 0)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Platform Revenue</p>
                <h3 className="text-2xl font-bold">
                  {isLoadingStats ? '...' : formatCurrency(statsData?.revenue?.total || 0)}
                </h3>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <div>Monthly: {isLoadingStats ? '...' : formatCurrency(statsData?.revenue?.monthly || 0)}</div>
              <div>YTD: {isLoadingStats ? '...' : formatCurrency(statsData?.revenue?.ytd || 0)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-24"
          onClick={() => {
            setActiveTab('users');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <UserPlusIcon className="h-8 w-8 mb-2" />
          <span>Add User</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-24"
          onClick={() => {
            setActiveTab('properties');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <BuildingLibraryIcon className="h-8 w-8 mb-2" />
          <span>Add Property</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-24"
          onClick={() => {
            setActiveTab('kyc');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <DocumentTextIcon className="h-8 w-8 mb-2" />
          <span>Review KYC</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-24"
          onClick={() => {
            setActiveTab('reports');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <ChartBarIcon className="h-8 w-8 mb-2" />
          <span>Reports</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-24"
          onClick={() => {
            setActiveTab('notifications');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <BellIcon className="h-8 w-8 mb-2" />
          <span>Send Notification</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-24"
          onClick={() => {
            setActiveTab('security');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <ShieldCheckIcon className="h-8 w-8 mb-2" />
          <span>Security</span>
        </Button>
      </div>
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 sm:grid-cols-7 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="kyc">KYC</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview">
              <AdminReports />
            </TabsContent>
            
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="properties">
              <PropertyManagement />
            </TabsContent>
            
            <TabsContent value="investments">
              <InvestmentManagement />
            </TabsContent>
            
            <TabsContent value="kyc">
              <KycManagement />
            </TabsContent>
            
            <TabsContent value="notifications">
              <NotificationManager />
            </TabsContent>
            
            <TabsContent value="security">
              <SecurityDashboard />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;