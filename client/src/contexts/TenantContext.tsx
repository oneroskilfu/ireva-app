import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Define the Tenant type
export type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  tier: string;
  logoUrl?: string;
  primaryContactName: string;
  primaryContactEmail: string;
};

// Define the TenantContextType
type TenantContextType = {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  userTenants: Tenant[];
  isLoading: boolean;
  error: Error | null;
  switchTenant: (tenantId: string) => void;
  refetch: () => Promise<any>;
};

// Create the TenantContext
const TenantContext = createContext<TenantContextType | null>(null);

// TenantProvider props
interface TenantProviderProps {
  children: ReactNode;
}

// Create the TenantProvider component
export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const { toast } = useToast();

  // Fetch user's tenants from the API
  const {
    data: userTenants = [],
    isLoading: tenantsLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['/api/user/tenants'],
    queryFn: async () => {
      // Skip query if user is not logged in
      if (!user) return [];

      const res = await fetch('/api/user/tenants');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch tenants');
      }
      return (await res.json()).data || [];
    },
    enabled: !!user, // Only run query if user is logged in
  });

  // Set the first tenant as the current tenant when tenants are loaded
  useEffect(() => {
    if (userTenants.length > 0 && !currentTenant) {
      // Check if there's a tenant ID in localStorage
      const savedTenantId = localStorage.getItem('currentTenantId');
      
      if (savedTenantId) {
        // Try to find the saved tenant in the user's tenants
        const savedTenant = userTenants.find((t: Tenant) => t.id === savedTenantId);
        if (savedTenant) {
          setCurrentTenant(savedTenant);
        } else {
          // If saved tenant not found, use the first tenant
          setCurrentTenant(userTenants[0]);
          localStorage.setItem('currentTenantId', userTenants[0].id);
        }
      } else {
        // No saved tenant, use the first tenant
        setCurrentTenant(userTenants[0]);
        localStorage.setItem('currentTenantId', userTenants[0].id);
      }
    }
  }, [userTenants, currentTenant]);

  // Switch tenant function
  const switchTenant = (tenantId: string) => {
    const tenant = userTenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      localStorage.setItem('currentTenantId', tenant.id);
      
      // Show toast notification
      toast({
        title: 'Tenant Switched',
        description: `You are now working in ${tenant.name}`,
      });
    }
  };

  // Clear current tenant when user logs out
  useEffect(() => {
    if (!user && currentTenant) {
      setCurrentTenant(null);
      localStorage.removeItem('currentTenantId');
    }
  }, [user, currentTenant]);

  // Set tenant header on API requests
  useEffect(() => {
    if (currentTenant) {
      // Add an interceptor to set the tenant header on all fetch requests
      const originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        const tenantHeader = { 'x-tenant-id': currentTenant.id };
        
        // Create new init with tenant header
        const newInit = {
          ...init,
          headers: {
            ...(init?.headers || {}),
            ...tenantHeader,
          },
        };
        
        return originalFetch(input, newInit);
      };
      
      // Cleanup function to restore original fetch
      return () => {
        window.fetch = originalFetch;
      };
    }
  }, [currentTenant]);

  // Provide the context value
  const contextValue: TenantContextType = {
    currentTenant,
    setCurrentTenant,
    userTenants,
    isLoading: authLoading || tenantsLoading,
    error,
    switchTenant,
    refetch,
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

// Custom hook to use the TenantContext
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

// TenantSwitcher component for switching between tenants
export const TenantSwitcher: React.FC = () => {
  const { currentTenant, userTenants, switchTenant, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-2 py-1">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading tenants...</span>
      </div>
    );
  }

  if (!currentTenant || userTenants.length <= 1) {
    return null; // Don't show switcher if there's only one tenant
  }

  return (
    <div className="relative">
      <select
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        value={currentTenant.id}
        onChange={(e) => switchTenant(e.target.value)}
      >
        {userTenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// Function to create a tenant-aware route component
export const withTenant = <P extends object>(
  Component: React.ComponentType<P>,
  requiredTenant = true
): React.FC<P> => {
  const TenantAwareComponent: React.FC<P> = (props) => {
    const { currentTenant, isLoading } = useTenant();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (requiredTenant && !currentTenant) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-xl font-semibold mb-2">No Tenant Selected</h2>
          <p className="text-muted-foreground mb-4 text-center">
            You need to select a tenant to access this page.
            Please contact your administrator if you don't have any tenants assigned.
          </p>
        </div>
      );
    }

    return <Component {...props} />;
  };

  return TenantAwareComponent;
};

export default TenantContext;