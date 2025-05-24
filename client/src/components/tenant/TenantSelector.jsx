import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../hooks/useApiRequest';
import { useToast } from '../../hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Button,
  Input,
  Label,
  Badge,
  Skeleton,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../ui/DesignSystem';
import {
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  PlusCircleIcon,
  CheckIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

/**
 * TenantSelector Component
 * 
 * Allows users to select and switch between different tenants/organizations they belong to.
 * Also provides a way to create new tenants (if user has permission) and set a default tenant.
 */
const TenantSelector = () => {
  const api = useApiRequest();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [createTenantOpen, setCreateTenantOpen] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState({
    name: '',
    slug: '',
    contactEmail: '',
  });

  // Fetch user's tenants
  const { data: userTenants, isLoading, error } = useQuery({
    queryKey: ['/api/tenants/user'],
    queryFn: async () => {
      try {
        const response = await api.get('tenants/user');
        return response.data.data;
      } catch (error) {
        console.error('Error fetching user tenants:', error);
        throw error;
      }
    }
  });

  // Set default tenant mutation
  const setDefaultTenantMutation = useMutation({
    mutationFn: async (tenantId) => {
      const response = await api.post(`tenants/${tenantId}/default`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/tenants/user']);
      toast({
        title: 'Default tenant updated',
        description: 'Your default tenant has been updated.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update default tenant',
        variant: 'destructive',
      });
    }
  });

  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (tenantData) => {
      const response = await api.post('tenants', tenantData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/tenants/user']);
      setCreateTenantOpen(false);
      setNewTenantForm({
        name: '',
        slug: '',
        contactEmail: '',
      });
      toast({
        title: 'Tenant created',
        description: 'Your new tenant has been created successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating tenant',
        description: error.response?.data?.message || 'Failed to create tenant',
        variant: 'destructive',
      });
    }
  });

  // Handle setting default tenant
  const handleSetDefaultTenant = (tenantId) => {
    setDefaultTenantMutation.mutate(tenantId);
  };

  // Handle creating new tenant
  const handleCreateTenant = () => {
    if (!newTenantForm.name || !newTenantForm.slug || !newTenantForm.contactEmail) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    createTenantMutation.mutate({
      ...newTenantForm,
      status: 'ACTIVE',
      tier: 'BASIC',
    });
  };

  // Auto-generate slug when name changes
  useEffect(() => {
    if (newTenantForm.name && !newTenantForm.slug) {
      setNewTenantForm(prev => ({
        ...prev,
        slug: prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }));
    }
  }, [newTenantForm.name]);

  // Get current default tenant
  const currentTenant = userTenants?.find(t => t.isDefault) || userTenants?.[0];

  // Generate initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate random color based on tenant name (for consistent avatar colors)
  const getTenantColor = (name) => {
    if (!name) return 'hsl(212, 100%, 50%)';
    
    const colors = [
      'hsl(212, 100%, 50%)', // Blue
      'hsl(356, 100%, 50%)', // Red
      'hsl(160, 100%, 40%)', // Green
      'hsl(45, 100%, 50%)',  // Yellow
      'hsl(262, 100%, 50%)', // Purple
      'hsl(30, 100%, 50%)',  // Orange
      'hsl(180, 100%, 40%)', // Teal
    ];
    
    // Simple hash function to get consistent color
    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const colorIndex = charCodeSum % colors.length;
    
    return colors[colorIndex];
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 min-w-[200px]">
            {isLoading ? (
              <Skeleton className="h-7 w-7 rounded-full" />
            ) : currentTenant ? (
              <Avatar className="h-7 w-7">
                {currentTenant.tenant.logoUrl ? (
                  <AvatarImage src={currentTenant.tenant.logoUrl} alt={currentTenant.tenant.name} />
                ) : (
                  <AvatarFallback 
                    style={{ backgroundColor: getTenantColor(currentTenant.tenant.name) }}
                    className="text-white"
                  >
                    {getInitials(currentTenant.tenant.name)}
                  </AvatarFallback>
                )}
              </Avatar>
            ) : (
              <BuildingOfficeIcon className="h-5 w-5" />
            )}
            
            <span className="truncate">
              {isLoading ? (
                <Skeleton className="h-5 w-32" />
              ) : currentTenant ? (
                currentTenant.tenant.name
              ) : (
                'Select Tenant'
              )}
            </span>
            
            <ChevronDownIcon className="h-4 w-4 ml-auto" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-[250px]">
          <DropdownMenuLabel>Your Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="px-2 py-1.5">
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))
          ) : error ? (
            <div className="px-2 py-1.5 text-sm text-red-500">
              Error loading tenants
            </div>
          ) : userTenants?.length > 0 ? (
            userTenants.map((userTenant) => (
              <DropdownMenuItem
                key={userTenant.tenant.id}
                className={`flex items-center gap-3 py-2 px-2 cursor-pointer ${
                  userTenant.isDefault ? 'bg-muted/50' : ''
                }`}
                onClick={() => handleSetDefaultTenant(userTenant.tenant.id)}
              >
                <Avatar className="h-8 w-8">
                  {userTenant.tenant.logoUrl ? (
                    <AvatarImage src={userTenant.tenant.logoUrl} alt={userTenant.tenant.name} />
                  ) : (
                    <AvatarFallback 
                      style={{ backgroundColor: getTenantColor(userTenant.tenant.name) }}
                      className="text-white"
                    >
                      {getInitials(userTenant.tenant.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1 truncate">
                  <div className="text-sm font-medium">{userTenant.tenant.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <UserGroupIcon className="h-3 w-3" />
                    <span className="capitalize">{userTenant.role}</span>
                  </div>
                </div>
                
                {userTenant.isDefault && (
                  <Badge variant="outline" className="text-xs">
                    Default
                  </Badge>
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-2 py-3 text-center text-sm text-gray-500">
              No organizations found
            </div>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="flex items-center gap-2 text-primary cursor-pointer py-2"
            onClick={() => setCreateTenantOpen(true)}
          >
            <PlusCircleIcon className="h-5 w-5" />
            Create New Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Create Tenant Dialog */}
      <Dialog open={createTenantOpen} onOpenChange={setCreateTenantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to manage your properties and investments
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={newTenantForm.name}
                onChange={(e) => setNewTenantForm({...newTenantForm, name: e.target.value})}
                placeholder="ABC Real Estate"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="org-slug">URL Identifier</Label>
              <div className="flex items-center">
                <div className="bg-gray-100 px-3 py-2 rounded-l-md text-gray-500 text-sm border">
                  ireva.com/
                </div>
                <Input
                  id="org-slug"
                  value={newTenantForm.slug}
                  onChange={(e) => setNewTenantForm({...newTenantForm, slug: e.target.value})}
                  placeholder="abc-real-estate"
                  className="rounded-l-none"
                />
              </div>
              <p className="text-xs text-gray-500">
                Letters, numbers, and hyphens only. No spaces.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="org-email">Contact Email</Label>
              <Input
                id="org-email"
                type="email"
                value={newTenantForm.contactEmail}
                onChange={(e) => setNewTenantForm({...newTenantForm, contactEmail: e.target.value})}
                placeholder="admin@example.com"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateTenantOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTenant}
              disabled={createTenantMutation.isPending}
            >
              {createTenantMutation.isPending ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Organization'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TenantSelector;