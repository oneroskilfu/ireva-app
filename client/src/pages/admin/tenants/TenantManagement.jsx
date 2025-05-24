import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../../hooks/useApiRequest';
import { useToast } from '../../../hooks/use-toast';
import { Link } from 'wouter';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../components/ui/DesignSystem';

import {
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  UserPlusIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  UserIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ChevronUpDownIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  Cog6ToothIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

import { TenantStatusEnum, TenantTierEnum } from '../../../../shared/schema-tenants';

const ITEMS_PER_PAGE = 10;

/**
 * Tenant Management Component
 * 
 * Admin interface to manage organizations (tenants) in the multi-tenant system.
 * Allows viewing, creating, editing, and managing tenant organizations.
 */
const TenantManagement = () => {
  const api = useApiRequest();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // Selected tenant for detail operations
  const [selectedTenant, setSelectedTenant] = useState(null);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  // Form states
  const [tenantForm, setTenantForm] = useState({
    name: '',
    slug: '',
    domain: '',
    contactEmail: '',
    status: 'ACTIVE',
    tier: 'BASIC',
    primaryColor: '#0066cc',
    maxUsers: 10,
    maxProperties: 20,
  });
  
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'user',
  });
  
  // Fetch tenants with pagination and filters
  const { data: tenantsData, isLoading } = useQuery({
    queryKey: ['/api/tenants', page, searchQuery, statusFilter, tierFilter],
    queryFn: async () => {
      let url = `tenants?page=${page}&limit=${ITEMS_PER_PAGE}`;
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      if (statusFilter) {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }
      
      if (tierFilter) {
        url += `&tier=${encodeURIComponent(tierFilter)}`;
      }
      
      try {
        const response = await api.get(url);
        return response.data.data;
      } catch (error) {
        console.error('Error fetching tenants:', error);
        throw error;
      }
    },
  });
  
  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('tenants', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/tenants']);
      setCreateDialogOpen(false);
      resetTenantForm();
      toast({
        title: 'Success',
        description: 'Tenant created successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create tenant',
        variant: 'destructive',
      });
    },
  });
  
  // Update tenant mutation
  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`tenants/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/tenants']);
      setEditDialogOpen(false);
      setSelectedTenant(null);
      toast({
        title: 'Success',
        description: 'Tenant updated successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update tenant',
        variant: 'destructive',
      });
    },
  });
  
  // Delete tenant mutation
  const deleteTenantMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`tenants/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/tenants']);
      setDeleteDialogOpen(false);
      setSelectedTenant(null);
      toast({
        title: 'Success',
        description: 'Tenant deleted successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete tenant',
        variant: 'destructive',
      });
    },
  });
  
  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: async ({ tenantId, data }) => {
      const response = await api.post(`tenants/${tenantId}/invitations`, data);
      return response.data;
    },
    onSuccess: () => {
      setInviteDialogOpen(false);
      setInviteForm({ email: '', role: 'user' });
      toast({
        title: 'Success',
        description: 'Invitation sent successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send invitation',
        variant: 'destructive',
      });
    },
  });
  
  // Reset tenant form
  const resetTenantForm = () => {
    setTenantForm({
      name: '',
      slug: '',
      domain: '',
      contactEmail: '',
      status: 'ACTIVE',
      tier: 'BASIC',
      primaryColor: '#0066cc',
      maxUsers: 10,
      maxProperties: 20,
    });
  };
  
  // Handle edit tenant
  const handleEditTenant = (tenant) => {
    setSelectedTenant(tenant);
    setTenantForm({
      name: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain || '',
      contactEmail: tenant.contactEmail,
      status: tenant.status,
      tier: tenant.tier,
      primaryColor: tenant.primaryColor || '#0066cc',
      maxUsers: tenant.maxUsers || 10,
      maxProperties: tenant.maxProperties || 20,
    });
    setEditDialogOpen(true);
  };
  
  // Handle delete tenant
  const handleDeleteTenant = (tenant) => {
    setSelectedTenant(tenant);
    setDeleteDialogOpen(true);
  };
  
  // Handle invite user
  const handleInviteUser = (tenant) => {
    setSelectedTenant(tenant);
    setInviteForm({ email: '', role: 'user' });
    setInviteDialogOpen(true);
  };
  
  // Handle create tenant submit
  const handleCreateTenantSubmit = () => {
    createTenantMutation.mutate(tenantForm);
  };
  
  // Handle update tenant submit
  const handleUpdateTenantSubmit = () => {
    if (!selectedTenant) return;
    
    updateTenantMutation.mutate({
      id: selectedTenant.id,
      data: tenantForm,
    });
  };
  
  // Handle delete tenant submit
  const handleDeleteTenantSubmit = () => {
    if (!selectedTenant) return;
    
    deleteTenantMutation.mutate(selectedTenant.id);
  };
  
  // Handle invite user submit
  const handleInviteUserSubmit = () => {
    if (!selectedTenant) return;
    
    inviteUserMutation.mutate({
      tenantId: selectedTenant.id,
      data: inviteForm,
    });
  };
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    let variant = "default";
    let icon = null;
    
    switch (status) {
      case TenantStatusEnum.ACTIVE:
        variant = "success";
        icon = <CheckBadgeIcon className="h-4 w-4 mr-1" />;
        break;
      case TenantStatusEnum.INACTIVE:
        variant = "secondary";
        icon = <XCircleIcon className="h-4 w-4 mr-1" />;
        break;
      case TenantStatusEnum.SUSPENDED:
        variant = "destructive";
        icon = <XCircleIcon className="h-4 w-4 mr-1" />;
        break;
      case TenantStatusEnum.ONBOARDING:
        variant = "warning";
        icon = <ClockIcon className="h-4 w-4 mr-1" />;
        break;
      case TenantStatusEnum.ARCHIVED:
        variant = "outline";
        icon = <ArchiveBoxIcon className="h-4 w-4 mr-1" />;
        break;
      default:
        break;
    }
    
    return (
      <Badge variant={variant} className="flex items-center">
        {icon}
        <span className="capitalize">{status.toLowerCase()}</span>
      </Badge>
    );
  };
  
  // Tier badge component
  const TierBadge = ({ tier }) => {
    let color = "text-gray-500";
    
    switch (tier) {
      case TenantTierEnum.BASIC:
        color = "text-blue-500";
        break;
      case TenantTierEnum.STANDARD:
        color = "text-green-500";
        break;
      case TenantTierEnum.PREMIUM:
        color = "text-purple-500";
        break;
      case TenantTierEnum.ENTERPRISE:
        color = "text-amber-500";
        break;
      default:
        break;
    }
    
    return (
      <span className={`font-medium ${color} capitalize`}>
        {tier.toLowerCase()}
      </span>
    );
  };
  
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
  
  // Generate tenant color from primary color
  const getTenantColor = (tenant) => {
    return tenant.primaryColor || '#0066cc';
  };
  
  // Get total pages
  const totalPages = tenantsData?.pagination?.pages || 1;
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Organization Management</h1>
        
        <Button 
          onClick={() => {
            resetTenantForm();
            setCreateDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <PlusCircleIcon className="h-5 w-5" />
          Create Organization
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search organizations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <div className="w-full">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {Object.values(TenantStatusEnum).map((status) => (
                      <SelectItem key={status} value={status}>
                        <span className="capitalize">{status.toLowerCase()}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full">
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Tiers</SelectItem>
                    {Object.values(TenantTierEnum).map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        <span className="capitalize">{tier.toLowerCase()}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setViewMode('list')}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tenantsData?.tenants?.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tenantsData.tenants.map((tenant) => (
                  <Card key={tenant.id} className="overflow-hidden">
                    <div 
                      className="h-2"
                      style={{ backgroundColor: getTenantColor(tenant) }}
                    />
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            {tenant.logoUrl ? (
                              <AvatarImage src={tenant.logoUrl} alt={tenant.name} />
                            ) : (
                              <AvatarFallback 
                                style={{ backgroundColor: getTenantColor(tenant) }}
                                className="text-white"
                              >
                                {getInitials(tenant.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{tenant.name}</CardTitle>
                            <CardDescription>{tenant.slug}</CardDescription>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <EllipsisVerticalIcon className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleEditTenant(tenant)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <PencilIcon className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleInviteUser(tenant)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <UserPlusIcon className="h-4 w-4" />
                              Invite User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 cursor-pointer"
                              asChild
                            >
                              <Link href={`/admin/tenants/${tenant.id}/users`}>
                                <UsersIcon className="h-4 w-4" />
                                Manage Users
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 cursor-pointer"
                              asChild
                            >
                              <Link href={`/admin/tenants/${tenant.id}/settings`}>
                                <Cog6ToothIcon className="h-4 w-4" />
                                Settings
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTenant(tenant)}
                              className="flex items-center gap-2 cursor-pointer text-red-600"
                            >
                              <TrashIcon className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="mt-2 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Status</span>
                          <StatusBadge status={tenant.status} />
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Tier</span>
                          <TierBadge tier={tenant.tier} />
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-gray-600 truncate">{tenant.contactEmail}</span>
                        </div>
                        
                        {tenant.domain && (
                          <div className="flex items-center text-sm">
                            <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-gray-600 truncate">{tenant.domain}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenantsData.tenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              {tenant.logoUrl ? (
                                <AvatarImage src={tenant.logoUrl} alt={tenant.name} />
                              ) : (
                                <AvatarFallback 
                                  style={{ backgroundColor: getTenantColor(tenant) }}
                                  className="text-white"
                                >
                                  {getInitials(tenant.name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <div className="font-medium">{tenant.name}</div>
                              <div className="text-sm text-gray-500">{tenant.slug}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={tenant.status} />
                        </TableCell>
                        <TableCell>
                          <TierBadge tier={tenant.tier} />
                        </TableCell>
                        <TableCell>{tenant.contactEmail}</TableCell>
                        <TableCell>{tenant.domain || '-'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <EllipsisVerticalIcon className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleEditTenant(tenant)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <PencilIcon className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleInviteUser(tenant)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <UserPlusIcon className="h-4 w-4" />
                                Invite User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                asChild
                              >
                                <Link href={`/admin/tenants/${tenant.id}/users`}>
                                  <UsersIcon className="h-4 w-4" />
                                  Manage Users
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                asChild
                              >
                                <Link href={`/admin/tenants/${tenant.id}/settings`}>
                                  <Cog6ToothIcon className="h-4 w-4" />
                                  Settings
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTenant(tenant)}
                                className="flex items-center gap-2 cursor-pointer text-red-600"
                              >
                                <TrashIcon className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Organizations Found</h3>
              <p className="text-gray-500 mt-1 max-w-md">
                {searchQuery || statusFilter || tierFilter 
                  ? "No organizations match your search criteria. Try adjusting your filters." 
                  : "Get started by creating your first organization."}
              </p>
              {(searchQuery || statusFilter || tierFilter) && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('');
                    setTierFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                    let pageNumber;
                    
                    // Logic to show relevant page numbers
                    if (totalPages <= 5) {
                      pageNumber = index + 1;
                    } else if (page <= 3) {
                      pageNumber = index + 1;
                      if (index === 4) return (
                        <PaginationItem key={index}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    } else if (page >= totalPages - 2) {
                      pageNumber = totalPages - 4 + index;
                      if (index === 0) return (
                        <PaginationItem key={index}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    } else {
                      if (index === 0) return (
                        <PaginationItem key={index}>
                          <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
                        </PaginationItem>
                      );
                      if (index === 1) return (
                        <PaginationItem key={index}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                      if (index === 2) pageNumber = page;
                      if (index === 3) return (
                        <PaginationItem key={index}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                      if (index === 4) return (
                        <PaginationItem key={index}>
                          <PaginationLink onClick={() => setPage(totalPages)}>
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    
                    return (
                      <PaginationItem key={index}>
                        <PaginationLink
                          isActive={page === pageNumber}
                          onClick={() => setPage(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create Tenant Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Create a new tenant organization to manage properties and users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tenant-name">Organization Name</Label>
                <Input
                  id="tenant-name"
                  value={tenantForm.name}
                  onChange={(e) => setTenantForm({...tenantForm, name: e.target.value})}
                  placeholder="ABC Real Estate"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tenant-slug">URL Identifier</Label>
                <div className="flex items-center">
                  <div className="bg-gray-100 px-3 py-2 rounded-l-md text-gray-500 text-sm border">
                    ireva.com/
                  </div>
                  <Input
                    id="tenant-slug"
                    value={tenantForm.slug}
                    onChange={(e) => setTenantForm({...tenantForm, slug: e.target.value})}
                    placeholder="abc-real-estate"
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Letters, numbers, and hyphens only. No spaces.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tenant-domain">Custom Domain (Optional)</Label>
                <Input
                  id="tenant-domain"
                  value={tenantForm.domain}
                  onChange={(e) => setTenantForm({...tenantForm, domain: e.target.value})}
                  placeholder="invest.example.com"
                />
                <p className="text-xs text-gray-500">
                  Custom domain for white-label access
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tenant-email">Contact Email</Label>
                <Input
                  id="tenant-email"
                  type="email"
                  value={tenantForm.contactEmail}
                  onChange={(e) => setTenantForm({...tenantForm, contactEmail: e.target.value})}
                  placeholder="admin@example.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tenant-status">Status</Label>
                <Select
                  value={tenantForm.status}
                  onValueChange={(value) => setTenantForm({...tenantForm, status: value})}
                >
                  <SelectTrigger id="tenant-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TenantStatusEnum).map((status) => (
                      <SelectItem key={status} value={status}>
                        <span className="capitalize">{status.toLowerCase()}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tenant-tier">Tier</Label>
                <Select
                  value={tenantForm.tier}
                  onValueChange={(value) => setTenantForm({...tenantForm, tier: value})}
                >
                  <SelectTrigger id="tenant-tier">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TenantTierEnum).map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        <span className="capitalize">{tier.toLowerCase()}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tenant-color">Primary Color</Label>
                <div className="flex">
                  <div 
                    className="h-10 w-10 rounded-l-md border"
                    style={{ backgroundColor: tenantForm.primaryColor }}
                  />
                  <Input
                    id="tenant-color"
                    type="text"
                    value={tenantForm.primaryColor}
                    onChange={(e) => setTenantForm({...tenantForm, primaryColor: e.target.value})}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tenant-max-users">Max Users</Label>
                <Input
                  id="tenant-max-users"
                  type="number"
                  value={tenantForm.maxUsers}
                  onChange={(e) => setTenantForm({...tenantForm, maxUsers: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tenant-max-properties">Max Properties</Label>
                <Input
                  id="tenant-max-properties"
                  type="number"
                  value={tenantForm.maxProperties}
                  onChange={(e) => setTenantForm({...tenantForm, maxProperties: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTenantSubmit}
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
      
      {/* Edit Tenant Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update organization details and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-name">Organization Name</Label>
                <Input
                  id="edit-tenant-name"
                  value={tenantForm.name}
                  onChange={(e) => setTenantForm({...tenantForm, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-slug">URL Identifier</Label>
                <div className="flex items-center">
                  <div className="bg-gray-100 px-3 py-2 rounded-l-md text-gray-500 text-sm border">
                    ireva.com/
                  </div>
                  <Input
                    id="edit-tenant-slug"
                    value={tenantForm.slug}
                    onChange={(e) => setTenantForm({...tenantForm, slug: e.target.value})}
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-domain">Custom Domain</Label>
                <Input
                  id="edit-tenant-domain"
                  value={tenantForm.domain}
                  onChange={(e) => setTenantForm({...tenantForm, domain: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-email">Contact Email</Label>
                <Input
                  id="edit-tenant-email"
                  type="email"
                  value={tenantForm.contactEmail}
                  onChange={(e) => setTenantForm({...tenantForm, contactEmail: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-status">Status</Label>
                <Select
                  value={tenantForm.status}
                  onValueChange={(value) => setTenantForm({...tenantForm, status: value})}
                >
                  <SelectTrigger id="edit-tenant-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TenantStatusEnum).map((status) => (
                      <SelectItem key={status} value={status}>
                        <span className="capitalize">{status.toLowerCase()}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-tier">Tier</Label>
                <Select
                  value={tenantForm.tier}
                  onValueChange={(value) => setTenantForm({...tenantForm, tier: value})}
                >
                  <SelectTrigger id="edit-tenant-tier">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TenantTierEnum).map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        <span className="capitalize">{tier.toLowerCase()}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-color">Primary Color</Label>
                <div className="flex">
                  <div 
                    className="h-10 w-10 rounded-l-md border"
                    style={{ backgroundColor: tenantForm.primaryColor }}
                  />
                  <Input
                    id="edit-tenant-color"
                    type="text"
                    value={tenantForm.primaryColor}
                    onChange={(e) => setTenantForm({...tenantForm, primaryColor: e.target.value})}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-max-users">Max Users</Label>
                <Input
                  id="edit-tenant-max-users"
                  type="number"
                  value={tenantForm.maxUsers}
                  onChange={(e) => setTenantForm({...tenantForm, maxUsers: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-max-properties">Max Properties</Label>
                <Input
                  id="edit-tenant-max-properties"
                  type="number"
                  value={tenantForm.maxProperties}
                  onChange={(e) => setTenantForm({...tenantForm, maxProperties: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTenantSubmit}
              disabled={updateTenantMutation.isPending}
            >
              {updateTenantMutation.isPending ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Organization'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Tenant Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this organization? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedTenant && (
              <div className="flex items-center gap-3 p-4 border rounded-md bg-gray-50">
                <Avatar className="h-10 w-10">
                  {selectedTenant.logoUrl ? (
                    <AvatarImage src={selectedTenant.logoUrl} alt={selectedTenant.name} />
                  ) : (
                    <AvatarFallback 
                      style={{ backgroundColor: getTenantColor(selectedTenant) }}
                      className="text-white"
                    >
                      {getInitials(selectedTenant.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium">{selectedTenant.name}</div>
                  <div className="text-sm text-gray-500">{selectedTenant.slug}</div>
                </div>
              </div>
            )}
            <p className="mt-4 text-red-600 text-sm">
              This will delete all data associated with this organization, including users, properties, and investments.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTenantSubmit}
              disabled={deleteTenantMutation.isPending}
            >
              {deleteTenantMutation.isPending ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Organization'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Invite User Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              {selectedTenant && (
                <>Invite a new user to join <strong>{selectedTenant.name}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                placeholder="user@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value) => setInviteForm({...inviteForm, role: value})}
              >
                <SelectTrigger id="invite-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                <span className="font-medium">Admin:</span> Full access to manage organization settings and users
                <br />
                <span className="font-medium">Manager:</span> Can manage properties and investments
                <br />
                <span className="font-medium">User:</span> Standard user access
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteUserSubmit}
              disabled={inviteUserMutation.isPending}
            >
              {inviteUserMutation.isPending ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantManagement;