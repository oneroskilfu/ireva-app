import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
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
import {
  Building2,
  ChevronDown,
  Plus,
  Loader2,
} from 'lucide-react';

// Tenant interface
interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  role: string;
  isOwner: boolean;
}

export default function TenantSelector() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);

  // Get current tenant ID from URL
  useEffect(() => {
    const match = window.location.pathname.match(/\/tenant\/([^\/]+)/);
    if (match) {
      setCurrentTenantId(match[1]);
    } else {
      setCurrentTenantId(null);
    }
  }, [window.location.pathname]);

  // Fetch tenants
  const {
    data: tenants = [],
    isLoading,
    error,
  } = useQuery<Tenant[]>({
    queryKey: ['/api/tenants'],
    enabled: !!user,
  });

  // Get current tenant
  const currentTenant = currentTenantId
    ? tenants.find((tenant) => tenant.id === currentTenantId)
    : null;

  // Handle tenant selection
  const handleSelectTenant = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    setLocation(`/tenant/${tenantId}/dashboard`);
  };

  // Handle create new tenant
  const handleCreateTenant = () => {
    setLocation('/tenants/create');
  };

  // If loading
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-28" />
      </div>
    );
  }

  // If error or no tenants
  if (error || tenants.length === 0) {
    return (
      <Button
        variant="outline"
        className="flex items-center space-x-2"
        onClick={handleCreateTenant}
      >
        <Plus className="h-4 w-4" />
        <span>Create Organization</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-between space-x-2 px-3 min-w-[220px]"
        >
          <div className="flex items-center space-x-2 truncate">
            {currentTenant?.logo ? (
              <img
                src={currentTenant.logo}
                alt={currentTenant.name}
                className="h-5 w-5 rounded object-cover"
              />
            ) : (
              <Building2 className="h-5 w-5" />
            )}
            <span className="truncate">
              {currentTenant?.name || 'Select Organization'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        <DropdownMenuLabel>Your Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleSelectTenant(tenant.id)}
          >
            {tenant.logo ? (
              <img
                src={tenant.logo}
                alt={tenant.name}
                className="h-5 w-5 rounded object-cover"
              />
            ) : (
              <Building2 className="h-5 w-5" />
            )}
            <span>{tenant.name}</span>
            {tenant.id === currentTenantId && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCreateTenant} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          <span>Create New Organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}