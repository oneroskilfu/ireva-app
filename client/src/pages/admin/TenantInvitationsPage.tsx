import React, { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import TenantInvitationTable from '@/components/admin/TenantInvitationTable';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ArrowLeft, Building, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TenantInvitationsPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [match, params] = useRoute('/admin/tenants/:id/invitations');
  const tenantId = params?.id;

  // Get tenant details
  const { data: tenantDetails, isLoading: tenantLoading, error } = useQuery({
    queryKey: [`/api/admin/tenants/${tenantId}`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/tenants/${tenantId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tenant details');
      }
      return res.json();
    },
    enabled: !!tenantId && !!user,
  });

  useEffect(() => {
    // Set page title
    document.title = tenantDetails?.data?.name 
      ? `${tenantDetails.data.name} Invitations | iREVA Admin` 
      : 'Tenant Invitations | iREVA Admin';
  }, [tenantDetails]);

  // Show loading spinner while authentication status is being determined
  if (authLoading || tenantLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center space-x-2 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[600px] w-full rounded-md" />
      </div>
    );
  }

  // Redirect to auth page if user is not logged in
  if (!user) {
    setLocation("/auth");
    return null;
  }

  // Redirect to home page if user is not an admin
  if (user.role !== 'admin') {
    setLocation("/");
    return null;
  }

  // Show error if tenant not found
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>There was a problem loading the tenant information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <p className="text-destructive text-center">
              {(error as Error).message || 'Failed to load tenant details'}
            </p>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin/tenants')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tenants
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tenant = tenantDetails?.data;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation('/admin/tenants')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
              {tenant?.status}
            </Badge>
            
            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20 transition-colors">
              {tenant?.tier}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold flex items-center">
            <Building className="mr-2 h-6 w-6" />
            {tenant?.name} 
            <span className="text-lg font-normal text-muted-foreground ml-2">
              Invitations
            </span>
          </h1>
          
          <p className="text-muted-foreground mt-1 flex items-center">
            <Mail className="mr-1 h-4 w-4" />
            Manage invitations and onboarding for this organization
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setLocation(`/admin/tenants/${tenantId}/users`)}
          >
            View Users
          </Button>
        </div>
      </div>

      {tenantId && <TenantInvitationTable tenantId={tenantId} />}
    </div>
  );
};

export default TenantInvitationsPage;