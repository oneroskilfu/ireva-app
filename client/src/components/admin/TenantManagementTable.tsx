import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Search, 
  MoreHorizontal, 
  Plus, 
  Edit, 
  Trash, 
  Users, 
  Mail, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from "lucide-react";
import { TenantStatusEnum, TenantTierEnum, insertTenantSchema } from "../../shared/schema-tenants";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Tenant } from "../../shared/schema-tenants";

// Extended schema with validations
const tenantFormSchema = insertTenantSchema.extend({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  primaryContactEmail: z.string().email("Please enter a valid email address"),
  primaryContactName: z.string().min(2, "Contact name must be at least 2 characters"),
});

// Convert form values to backend payload
const convertFormToPayload = (data: z.infer<typeof tenantFormSchema>) => {
  // Create a base payload
  const payload = {
    ...data,
    theme: data.theme || { primaryColor: "#2563eb" },
    features: data.features || {
      kycVerification: true,
      investorDashboard: true,
      adminDashboard: true,
      walletManagement: true,
      documentManagement: true,
    },
  };

  return payload;
};

const TenantManagementTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch tenants
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/tenants', currentPage, searchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
      const res = await fetch(`/api/admin/tenants?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tenants');
      }
      return res.json();
    },
  });
  
  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (tenantData: z.infer<typeof tenantFormSchema>) => {
      const payload = convertFormToPayload(tenantData);
      const res = await apiRequest('POST', '/api/admin/tenants', payload);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create tenant');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Tenant created',
        description: 'The tenant has been created successfully.',
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create tenant',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update tenant mutation
  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: z.infer<typeof tenantFormSchema> }) => {
      const payload = convertFormToPayload(data);
      const res = await apiRequest('PUT', `/api/admin/tenants/${id}`, payload);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update tenant');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Tenant updated',
        description: 'The tenant has been updated successfully.',
      });
      setIsEditDialogOpen(false);
      setSelectedTenant(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update tenant',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete tenant mutation
  const deleteTenantMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/admin/tenants/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete tenant');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Tenant deleted',
        description: 'The tenant has been deleted successfully.',
      });
      setIsDeleteDialogOpen(false);
      setSelectedTenant(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete tenant',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Create form
  const createForm = useForm<z.infer<typeof tenantFormSchema>>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      status: TenantStatusEnum.ACTIVE,
      tier: TenantTierEnum.BASIC,
      primaryContactEmail: '',
      primaryContactName: '',
      primaryContactPhone: '',
      billingEmail: '',
      billingAddress: '',
      logoUrl: '',
      customDomain: '',
    },
  });
  
  // Edit form
  const editForm = useForm<z.infer<typeof tenantFormSchema>>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      status: TenantStatusEnum.ACTIVE,
      tier: TenantTierEnum.BASIC,
      primaryContactEmail: '',
      primaryContactName: '',
      primaryContactPhone: '',
      billingEmail: '',
      billingAddress: '',
      logoUrl: '',
      customDomain: '',
    },
  });
  
  // Update edit form when selected tenant changes
  useEffect(() => {
    if (selectedTenant && isEditDialogOpen) {
      editForm.reset({
        name: selectedTenant.name,
        slug: selectedTenant.slug,
        status: selectedTenant.status as TenantStatusEnum,
        tier: selectedTenant.tier as TenantTierEnum,
        primaryContactEmail: selectedTenant.primaryContactEmail,
        primaryContactName: selectedTenant.primaryContactName,
        primaryContactPhone: selectedTenant.primaryContactPhone || '',
        billingEmail: selectedTenant.billingEmail || '',
        billingAddress: selectedTenant.billingAddress || '',
        logoUrl: selectedTenant.logoUrl || '',
        customDomain: selectedTenant.customDomain || '',
      });
    }
  }, [selectedTenant, isEditDialogOpen, editForm]);
  
  // Handle create form submission
  const onCreateSubmit = (data: z.infer<typeof tenantFormSchema>) => {
    createTenantMutation.mutate(data);
  };
  
  // Handle edit form submission
  const onEditSubmit = (data: z.infer<typeof tenantFormSchema>) => {
    if (selectedTenant) {
      updateTenantMutation.mutate({ id: selectedTenant.id, data });
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedTenant) {
      deleteTenantMutation.mutate(selectedTenant.id);
    }
  };
  
  // Handle edit button click
  const handleEditClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsEditDialogOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDeleteDialogOpen(true);
  };
  
  // Filter function
  const handleSearch = () => {
    setCurrentPage(1);
    // The query will be refetched automatically due to the queryKey change
  };
  
  // Generate status badge based on tenant status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case TenantStatusEnum.ACTIVE:
        return <Badge className="bg-green-500">{status}</Badge>;
      case TenantStatusEnum.INACTIVE:
        return <Badge className="bg-gray-500">{status}</Badge>;
      case TenantStatusEnum.SUSPENDED:
        return <Badge variant="destructive">{status}</Badge>;
      case TenantStatusEnum.PENDING:
        return <Badge className="bg-yellow-500">{status}</Badge>;
      case TenantStatusEnum.TRIAL:
        return <Badge className="bg-blue-500">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Generate tier badge based on tenant tier
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case TenantTierEnum.FREE:
        return <Badge className="bg-gray-500">{tier}</Badge>;
      case TenantTierEnum.BASIC:
        return <Badge className="bg-blue-500">{tier}</Badge>;
      case TenantTierEnum.STANDARD:
        return <Badge className="bg-green-500">{tier}</Badge>;
      case TenantTierEnum.PREMIUM:
        return <Badge className="bg-purple-500">{tier}</Badge>;
      case TenantTierEnum.ENTERPRISE:
        return <Badge className="bg-amber-500">{tier}</Badge>;
      default:
        return <Badge>{tier}</Badge>;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Tenant Management</CardTitle>
            <CardDescription>
              Manage all tenants on the iREVA platform
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Tenant
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tenants..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex-initial">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {statusFilter ? `Status: ${statusFilter}` : 'All Statuses'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.values(TenantStatusEnum).map((status) => (
                  <DropdownMenuItem 
                    key={status}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button variant="secondary" onClick={handleSearch}>
            Search
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">Loading tenants...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">
            Error loading tenants: {(error as Error).message}
          </div>
        ) : data?.tenants?.length === 0 ? (
          <div className="text-center py-4">No tenants found</div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.tenants?.map((tenant: Tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>{tenant.slug}</TableCell>
                      <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                      <TableCell>{getTierBadge(tenant.tier)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{tenant.primaryContactName}</span>
                          <span className="text-xs text-muted-foreground">{tenant.primaryContactEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(tenant.createdAt)}</TableCell>
                      <TableCell>{tenant.userCount}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditClick(tenant)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.location.href = `/admin/tenants/${tenant.id}/users`}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              <span>Manage Users</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.location.href = `/admin/tenants/${tenant.id}/invitations`}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              <span>Invitations</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(tenant)}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {data?.pagination && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {data.pagination.pages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage < data.pagination.pages ? currentPage + 1 : data.pagination.pages)}
                  disabled={currentPage >= data.pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      {/* Create Tenant Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Create New Tenant</DialogTitle>
            <DialogDescription>
              Add a new tenant to the iREVA platform. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Tenant name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug *</FormLabel>
                      <FormControl>
                        <Input placeholder="tenant-slug" {...field} />
                      </FormControl>
                      <FormDescription>
                        Used in URLs. Only lowercase letters, numbers, and hyphens.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          {Object.values(TenantStatusEnum).map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tier *</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          {Object.values(TenantTierEnum).map((tier) => (
                            <option key={tier} value={tier}>{tier}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="primaryContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Contact Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="primaryContactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Contact Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="primaryContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="billingEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Email</FormLabel>
                      <FormControl>
                        <Input placeholder="billing@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/logo.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="customDomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Domain</FormLabel>
                      <FormControl>
                        <Input placeholder="app.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTenantMutation.isPending}
                >
                  {createTenantMutation.isPending ? 'Creating...' : 'Create Tenant'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Tenant Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>
              Update tenant information. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Tenant name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug *</FormLabel>
                      <FormControl>
                        <Input placeholder="tenant-slug" {...field} />
                      </FormControl>
                      <FormDescription>
                        Used in URLs. Only lowercase letters, numbers, and hyphens.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          {Object.values(TenantStatusEnum).map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tier *</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          {Object.values(TenantTierEnum).map((tier) => (
                            <option key={tier} value={tier}>{tier}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="primaryContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Contact Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="primaryContactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Contact Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="primaryContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="billingEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Email</FormLabel>
                      <FormControl>
                        <Input placeholder="billing@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/logo.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="customDomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Domain</FormLabel>
                      <FormControl>
                        <Input placeholder="app.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateTenantMutation.isPending}
                >
                  {updateTenantMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Tenant Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tenant 
              <span className="font-semibold">{selectedTenant ? ` "${selectedTenant.name}"` : ''}</span> 
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteTenantMutation.isPending}
            >
              {deleteTenantMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default TenantManagementTable;