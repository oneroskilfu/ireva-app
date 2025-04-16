import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Building, 
  CreditCard, 
  BarChart, 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';

/**
 * Admin Dashboard Page
 */
export default function AdminDashboard() {
  // Fetch admin dashboard stats
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['/api/admin/dashboard/stats'],
    staleTime: 60 * 1000, // 1 minute
  });

  console.log('Admin dashboard stats:', stats);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <h2 className="text-lg font-medium text-red-800 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Error Loading Dashboard
        </h2>
        <p className="mt-1 text-sm text-red-700">
          Failed to load dashboard data. Please try again.
        </p>
      </div>
    );
  }

  // Cards for dashboard stats
  const statCards = [
    {
      title: 'Total Users',
      value: stats?.userCount || 0,
      description: 'Registered users on the platform',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Properties',
      value: stats?.propertyCount || 0,
      description: 'Active properties listed',
      icon: Building,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Investments',
      value: stats?.investmentCount || 0,
      description: 'All-time investments made',
      icon: CreditCard,
      color: 'bg-orange-500',
    },
    {
      title: 'Total Investment Value',
      value: `₦${(stats?.totalInvestmentAmount || 0).toLocaleString()}`,
      description: 'Value of all investments',
      icon: BarChart,
      color: 'bg-green-500',
    },
    {
      title: 'Total Returns',
      value: `₦${(stats?.totalReturns || 0).toLocaleString()}`,
      description: 'Cumulative investor earnings',
      icon: TrendingUp,
      color: 'bg-amber-500',
    },
    {
      title: 'Pending KYC',
      value: stats?.pendingKycCount || 0,
      description: 'Awaiting verification',
      icon: FileText,
      color: 'bg-red-500',
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`${card.color} p-2 rounded-full text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Additional dashboard sections can be added here */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Recent Activity</h2>
        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>
              Recent platform activity and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 italic">
              Activity feed will be displayed here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}