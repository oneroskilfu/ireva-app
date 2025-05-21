import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building, LogOut, Plus, User } from 'lucide-react';
import { useLocation, useRoute } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  role: string;
  isOwner: boolean;
}

export default function TenantSelector() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/tenant/:tenantId/*');
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();
  
  // Get current tenant ID from route or localStorage
  const currentTenantId = params?.tenantId || localStorage.getItem('selectedTenantId');
  
  // Fetch tenants for the current user
  const { 
    data: tenants = [], 
    isLoading,
    error
  } = useQuery<Tenant[]>({
    queryKey: ['/api/tenants'],
    enabled: !!user,
  });
  
  // Find the currently selected tenant
  const selectedTenant = tenants.find(tenant => tenant.id === currentTenantId);

  // Handle tenant change
  const handleTenantChange = (tenantId: string) => {
    // Store selected tenant in localStorage
    localStorage.setItem('selectedTenantId', tenantId);
    
    // Navigate to the tenant dashboard
    setLocation(`/tenant/${tenantId}/dashboard`);
  };
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        // Clear selected tenant from localStorage
        localStorage.removeItem('selectedTenantId');
        
        // Navigate to login page
        setLocation('/auth');
      },
      onError: (error: Error) => {
        toast({
          title: 'Logout failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };
  
  if (error) {
    return (
      <Button variant="ghost" className="flex items-center gap-2" onClick={() => setLocation('/tenant/select')}>
        <Building className="h-4 w-4" />
        <span>Error loading organizations</span>
      </Button>
    );
  }
  
  if (isLoading) {
    return (
      <Button variant="ghost" className="flex items-center gap-2" disabled>
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 max-w-[200px]">
          {selectedTenant?.logo ? (
            <Avatar className="h-5 w-5">
              <AvatarImage src={selectedTenant.logo} alt={selectedTenant.name} />
              <AvatarFallback>{selectedTenant.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <Building className="h-4 w-4" />
          )}
          <span className="truncate">{selectedTenant?.name || 'Select Organization'}</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {tenants.length === 0 ? (
          <DropdownMenuItem disabled className="text-muted-foreground">
            No organizations found
          </DropdownMenuItem>
        ) : (
          tenants.map(tenant => (
            <DropdownMenuItem 
              key={tenant.id} 
              onClick={() => handleTenantChange(tenant.id)}
              className={tenant.id === currentTenantId ? 'bg-accent' : ''}
            >
              <div className="flex items-center gap-2 w-full">
                {tenant.logo ? (
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={tenant.logo} alt={tenant.name} />
                    <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <Building className="h-4 w-4" />
                )}
                <div className="flex-1 truncate">{tenant.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{tenant.role}</div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => setLocation('/tenant/create')}>
          <Plus className="h-4 w-4 mr-2" />
          <span>Create Organization</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}