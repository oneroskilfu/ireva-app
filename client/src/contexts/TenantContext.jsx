import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../hooks/useApiRequest';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';

// Create tenant context
const TenantContext = createContext(null);

/**
 * TenantProvider Component
 * 
 * Provides tenant context to the application, allowing components to access 
 * and modify the current tenant. This is central to the multi-tenant architecture.
 */
export const TenantProvider = ({ children }) => {
  const api = useApiRequest();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Current active tenant
  const [currentTenant, setCurrentTenant] = useState(null);

  // Fetch user's tenants
  const { 
    data: userTenants,
    isLoading: isLoadingTenants,
    error: tenantsError 
  } = useQuery({
    queryKey: ['/api/tenants/user'],
    queryFn: async () => {
      // Skip if user is not authenticated
      if (!user) return null;
      
      try {
        const response = await api.get('tenants/user');
        return response.data.data;
      } catch (error) {
        console.error('Error fetching user tenants:', error);
        throw error;
      }
    },
    enabled: !!user, // Only run query if user is authenticated
  });

  // Get current tenant
  const { 
    data: tenantData, 
    isLoading: isLoadingCurrentTenant,
    error: currentTenantError
  } = useQuery({
    queryKey: ['/api/tenants/current'],
    queryFn: async () => {
      // Skip if user is not authenticated
      if (!user) return null;
      
      try {
        const response = await api.get('tenants/current');
        return response.data.data;
      } catch (error) {
        // If no current tenant context, this will 404 which is expected
        if (error.response?.status === 404) {
          return null;
        }
        console.error('Error fetching current tenant:', error);
        throw error;
      }
    },
    enabled: !!user, // Only run query if user is authenticated
  });

  // Set default tenant mutation
  const setDefaultTenantMutation = useMutation({
    mutationFn: async (tenantId) => {
      const response = await api.post(`tenants/${tenantId}/default`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/tenants/user']);
      queryClient.invalidateQueries(['/api/tenants/current']);
      toast({
        title: 'Organization Changed',
        description: 'Your active organization has been updated',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to change organization',
        variant: 'destructive',
      });
    },
  });

  // Update current tenant when data changes
  useEffect(() => {
    if (tenantData) {
      setCurrentTenant(tenantData);
    } else if (userTenants && userTenants.length > 0) {
      // If no current tenant but user has tenants, set first default tenant or first tenant
      const defaultTenant = userTenants.find(t => t.isDefault);
      setCurrentTenant(defaultTenant?.tenant || userTenants[0].tenant);
    } else {
      setCurrentTenant(null);
    }
  }, [tenantData, userTenants]);

  // Switch to a different tenant
  const switchTenant = (tenantId) => {
    if (!tenantId || !user) return;
    setDefaultTenantMutation.mutate(tenantId);
  };

  // Get tenant role (for the current user)
  const getTenantRole = (tenantId) => {
    if (!userTenants || !tenantId) return null;
    const tenantUser = userTenants.find(t => t.tenant.id === tenantId);
    return tenantUser?.role || null;
  };

  // Get current role for active tenant
  const currentRole = currentTenant ? getTenantRole(currentTenant.id) : null;

  // Current tenant role permissions
  const hasPermission = (permission) => {
    if (!currentRole) return false;
    
    // Simple role-based permissions (can be expanded to more granular permissions)
    switch (currentRole) {
      case 'admin':
        return true; // Admins have all permissions
      case 'manager':
        // Managers have all permissions except user management and tenant settings
        return !['manage_users', 'manage_tenant'].includes(permission);
      case 'user':
        // Standard users have limited permissions
        return ['view_properties', 'view_investments', 'view_reports'].includes(permission);
      default:
        return false;
    }
  };

  // Value to be provided
  const value = {
    currentTenant,
    userTenants: userTenants || [],
    isLoading: isLoadingTenants || isLoadingCurrentTenant,
    error: tenantsError || currentTenantError,
    switchTenant,
    currentRole,
    hasPermission,
    getTenantRole,
  };
  
  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

/**
 * Hook to use tenant context
 */
export const useTenant = () => {
  const context = useContext(TenantContext);
  
  if (context === null) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  
  return context;
};

export default TenantContext;