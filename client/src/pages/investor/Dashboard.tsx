import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Banknote, 
  Home, 
  LineChart, 
  TrendingUp, 
  FileText, 
  Building, 
  Users, 
  Calendar,
  BadgeCheck 
} from 'lucide-react';
import InvestorLayout from '@/components/layouts/InvestorLayout-new';
import { apiRequest } from '@/lib/queryClient';

// Portfolio summary component
const PortfolioSummary = ({ investments, properties }) => {
  const totalInvested = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
  const totalEarnings = investments?.reduce((sum, inv) => sum + inv.earnings, 0) || 0;
  const totalValue = investments?.reduce((sum, inv) => sum + inv.currentValue, 0) || 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₦{totalInvested.toLocaleString()}</div>
          <Progress value={75} className="h-2 mt-2" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Current Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₦{totalValue.toLocaleString()}</div>
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-xs text-emerald-500">
              {((totalValue - totalInvested) / totalInvested * 100).toFixed(2)}% growth
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₦{totalEarnings.toLocaleString()}</div>
          <div className="flex items-center mt-2">
            <Banknote className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-xs text-emerald-500">
              {((totalEarnings / totalInvested) * 100).toFixed(2)}% ROI
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{investments?.length || 0}</div>
          <div className="flex items-center mt-2">
            <Building className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-xs">Active investments</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Active investments component
const ActiveInvestments = ({ investments, properties }) => {
  // Combine investment data with property details
  const investmentsWithDetails = investments?.map(inv => {
    const property = properties?.find(p => p.id === inv.propertyId);
    return { ...inv, property };
  }) || [];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Active Investments</h3>
        <Button variant="outline" size="sm">View All</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {investmentsWithDetails.length > 0 ? (
          investmentsWithDetails.map((inv) => (
            <Card key={inv.id}>
              <div className="flex h-full">
                <div className="w-1/3 h-full">
                  <img 
                    src={inv.property?.imageUrl} 
                    alt={inv.property?.name}
                    className="h-full w-full object-cover rounded-l"
                  />
                </div>
                <div className="w-2/3 p-4">
                  <h4 className="font-semibold">{inv.property?.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{inv.property?.location}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Invested</p>
                      <p className="font-medium">₦{inv.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current Value</p>
                      <p className="font-medium">₦{inv.currentValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Return</p>
                      <p className="font-medium">{inv.property?.targetReturn}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Term</p>
                      <p className="font-medium">{inv.property?.term} months</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Button size="sm" variant="outline" className="w-full">View Details</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-2 p-6 text-center">
            <p className="text-muted-foreground mb-4">You don't have any active investments yet.</p>
            <Button>Explore Properties</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

// Recommended properties component
const RecommendedProperties = ({ properties }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recommended Properties</h3>
        <Button variant="outline" size="sm">View All</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {properties?.slice(0, 3).map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <div className="relative h-40">
              <img 
                src={property.imageUrl} 
                alt={property.name} 
                className="h-full w-full object-cover"
              />
              <Badge 
                className="absolute top-2 right-2" 
                variant={property.tier === 'premium' ? 'default' : 'secondary'}
              >
                {property.tier}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h4 className="font-semibold">{property.name}</h4>
              <p className="text-sm text-muted-foreground">{property.location}</p>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Min. Investment</p>
                  <p className="font-medium">₦{property.minimumInvestment.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Target Return</p>
                  <p className="font-medium">{property.targetReturn}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Term</p>
                  <p className="font-medium">{property.term} months</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Funded</p>
                  <p className="font-medium">{Math.round(property.currentFunding / property.totalFunding * 100)}%</p>
                </div>
              </div>
              
              <Progress 
                value={property.currentFunding / property.totalFunding * 100} 
                className="h-1 mt-3" 
              />
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {property.daysLeft} days left
                </div>
                <Button size="sm">Invest Now</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// KYC status card component
const KycStatusCard = ({ kycStatus }) => {
  const getStatusDetails = () => {
    switch(kycStatus) {
      case 'verified':
        return {
          icon: <BadgeCheck className="h-8 w-8 text-emerald-500" />,
          title: 'KYC Verified',
          description: 'Your identity has been verified. You have full access to all investment opportunities.',
          actionText: 'View Investment Opportunities',
          color: 'bg-emerald-50 border-emerald-200'
        };
      case 'pending':
        return {
          icon: <FileText className="h-8 w-8 text-amber-500" />,
          title: 'KYC Under Review',
          description: 'Your KYC documents are under review. This usually takes 1-2 business days.',
          actionText: 'Check Status',
          color: 'bg-amber-50 border-amber-200'
        };
      case 'rejected':
        return {
          icon: <FileText className="h-8 w-8 text-red-500" />,
          title: 'KYC Rejected',
          description: 'Your KYC verification was not successful. Please update your information and try again.',
          actionText: 'Update KYC',
          color: 'bg-red-50 border-red-200'
        };
      default:
        return {
          icon: <FileText className="h-8 w-8 text-blue-500" />,
          title: 'Complete KYC',
          description: 'Complete your KYC verification to unlock all investment opportunities.',
          actionText: 'Start KYC Verification',
          color: 'bg-blue-50 border-blue-200'
        };
    }
  };
  
  const { icon, title, description, actionText, color } = getStatusDetails();
  
  return (
    <Card className={`border ${color}`}>
      <CardContent className="pt-6">
        <div className="flex items-start">
          <div className="mr-4">{icon}</div>
          <div>
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
            <Button variant="link" className="p-0 h-auto mt-2 font-medium">{actionText}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Recent activities component
const RecentActivities = () => {
  const activities = [
    { id: 1, type: 'investment', description: 'You invested ₦250,000 in Skyline Apartments', date: '2 days ago' },
    { id: 2, type: 'payment', description: 'Received ₦12,500 monthly return from Heritage Heights', date: '5 days ago' },
    { id: 3, type: 'kyc', description: 'Your KYC verification was approved', date: '1 week ago' },
    { id: 4, type: 'system', description: 'Welcome to iREVA! Your account has been created successfully', date: '2 weeks ago' }
  ];
  
  const getActivityIcon = (type) => {
    switch(type) {
      case 'investment': return <Building className="h-4 w-4 text-blue-500" />;
      case 'payment': return <Banknote className="h-4 w-4 text-emerald-500" />;
      case 'kyc': return <BadgeCheck className="h-4 w-4 text-purple-500" />;
      case 'system': return <Users className="h-4 w-4 text-gray-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-start p-4">
              <div className="mr-3 mt-0.5">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <Button variant="ghost" size="sm" className="w-full">View All Activities</Button>
      </CardFooter>
    </Card>
  );
};

// Main dashboard component
const InvestorDashboard = () => {
  const { user } = useAuth();
  
  // Fetch properties
  const { data: properties } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/properties');
      return await res.json();
    }
  });
  
  // Fetch user's investments
  const { data: investments } = useQuery({
    queryKey: ['/api/investments'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/investments');
      return await res.json();
    },
    enabled: !!user
  });
  
  // Fetch user's KYC status
  const { data: kycData } = useQuery({
    queryKey: ['/api/kyc/status'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/kyc/status');
      return await res.json();
    },
    enabled: !!user
  });
  
  return (
    <InvestorLayout>
      <div className="container py-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.firstName || user?.username}</h1>
            <p className="text-muted-foreground">Here's a summary of your investment portfolio</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <Button>Explore New Opportunities</Button>
          </div>
        </div>
        
        {/* Portfolio summary section */}
        <PortfolioSummary investments={investments} properties={properties} />
        
        {/* KYC status card */}
        <div className="mb-6">
          <KycStatusCard kycStatus={kycData?.status || 'not_started'} />
        </div>
        
        {/* Main content tabs */}
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="investments">
              <Building className="h-4 w-4 mr-2" />
              My Investments
            </TabsTrigger>
            <TabsTrigger value="returns">
              <LineChart className="h-4 w-4 mr-2" />
              Returns
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ActiveInvestments investments={investments} properties={properties} />
                <RecommendedProperties properties={properties} />
              </div>
              <div>
                <RecentActivities />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="investments">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Detailed investment information will be displayed here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="returns">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Returns and earnings analysis will be displayed here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Investment certificates and documents will be displayed here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </InvestorLayout>
  );
};

export default InvestorDashboard;