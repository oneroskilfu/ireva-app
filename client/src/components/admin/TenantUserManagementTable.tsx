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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useTenant } from "@/contexts/TenantContext";
import { 
  Search, 
  MoreHorizontal, 
  Plus, 
  Edit, 
  Trash, 
  Shield, 
  Mail,
  UserPlus,
  Key,
  EyeOff
} from "lucide-react";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// User type
interface TenantUser {
  id: number;
  username: string;
  email: string;
  role: string;
  isOwner: boolean;
  isActive: boolean;
  joinedAt: string;
  lastAccessAt?: string;
}

// Invitation form schema
const invitationFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.string().min(1, "Please select a role"),
});

// Role update form schema
const roleUpdateFormSchema = z.object({
  role: z.string().min(1, "Please select a role"),
});

const TenantUserManagementTable = ({ tenantId }: { tenantId: string }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  
  // Fetch tenant users
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/admin/tenants/${tenantId}/users`, currentPage, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const res = await fetch(`/api/admin/tenants/${tenantId}/users?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tenant users');
      }
      return res.json();
    },
    enabled: !!tenantId,
  });
  
  // Invite user mutation
  const inviteMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof invitationFormSchema>) => {
      const res = await apiRequest('POST', `/api/admin/tenants/${tenantId}/invitations`, formData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to send invitation');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invitation sent',
        description: 'The invitation has been sent successfully.',
      });
      setIsInviteDialogOpen(false);
      inviteForm.reset();
      // No need to invalidate user queries since invitations don't change the users list
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send invitation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number, role: string }) => {
      const res = await apiRequest('PUT', `/api/admin/tenants/${tenantId}/users/${userId}`, { role });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update user role');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Role updated',
        description: 'The user role has been updated successfully.',
      });
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      roleForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/admin/tenants/${tenantId}/users`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Remove user mutation
  const removeUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest('DELETE', `/api/admin/tenants/${tenantId}/users/${userId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to remove user');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'User removed',
        description: 'The user has been removed from the tenant successfully.',
      });
      setIsRemoveDialogOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: [`/api/admin/tenants/${tenantId}/users`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove user',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Invite form
  const inviteForm = useForm<z.infer<typeof invitationFormSchema>>({
    resolver: zodResolver(invitationFormSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });
  
  // Role form
  const roleForm = useForm<z.infer<typeof roleUpdateFormSchema>>({
    resolver: zodResolver(roleUpdateFormSchema),
    defaultValues: {
      role: 'member',
    },
  });
  
  // Update role form when selected user changes
  useEffect(() => {
    if (selectedUser && isRoleDialogOpen) {
      roleForm.reset({
        role: selectedUser.role,
      });
    }
  }, [selectedUser, isRoleDialogOpen, roleForm]);
  
  // Handle invite form submission
  const onInviteSubmit = (formData: z.infer<typeof invitationFormSchema>) => {
    inviteMutation.mutate(formData);
  };
  
  // Handle role form submission
  const onRoleSubmit = (formData: z.infer<typeof roleUpdateFormSchema>) => {
    if (selectedUser) {
      updateRoleMutation.mutate({ 
        userId: selectedUser.id, 
        role: formData.role 
      });
    }
  };
  
  // Handle remove confirmation
  const handleRemoveConfirm = () => {
    if (selectedUser) {
      removeUserMutation.mutate(selectedUser.id);
    }
  };
  
  // Handle edit role button click
  const handleEditRoleClick = (user: TenantUser) => {
    setSelectedUser(user);
    setIsRoleDialogOpen(true);
  };
  
  // Handle remove user button click
  const handleRemoveClick = (user: TenantUser) => {
    setSelectedUser(user);
    setIsRemoveDialogOpen(true);
  };
  
  // Filter function
  const handleSearch = () => {
    setCurrentPage(1);
    // The query will be refetched automatically due to the queryKey change
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get role badge based on user role
  const getRoleBadge = (role: string, isOwner: boolean) => {
    if (isOwner) {
      return <Badge className="bg-amber-500">Owner</Badge>;
    }
    
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-500">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-blue-500">Manager</Badge>;
      case 'member':
        return <Badge className="bg-green-500">Member</Badge>;
      case 'viewer':
        return <Badge className="bg-gray-500">Viewer</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };
  
  // Determine if current user can edit another user
  const canEditUser = (user: TenantUser) => {
    // Owner can't have their role changed
    if (user.isOwner) return false;
    
    // Only owners and admins can edit others
    const currentUserRoles = ['owner', 'admin'];
    
    return true; // Simplified for now - in a real app, check current user role
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage users for {currentTenant?.name || 'this organization'}
            </CardDescription>
          </div>
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Invite User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="secondary" onClick={handleSearch}>
            Search
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">
            Error loading users: {(error as Error).message}
          </div>
        ) : data?.users?.length === 0 ? (
          <div className="text-center py-4">No users found</div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Access</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.users?.map((user: TenantUser) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.username}</span>
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role, user.isOwner)}</TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.joinedAt)}</TableCell>
                      <TableCell>{formatDate(user.lastAccessAt)}</TableCell>
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
                            {canEditUser(user) && (
                              <DropdownMenuItem onClick={() => handleEditRoleClick(user)}>
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Change Role</span>
                              </DropdownMenuItem>
                            )}
                            {!user.isOwner && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleRemoveClick(user)}
                                  className="text-red-600"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Remove</span>
                                </DropdownMenuItem>
                              </>
                            )}
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
      
      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation to join this organization. The user will receive an email with a link to accept the invitation.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4">
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormDescription>
                      This email will receive the invitation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={inviteForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      The user's role in this organization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsInviteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={inviteMutation.isPending}
                >
                  {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Change Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...roleForm}>
            <form onSubmit={roleForm.handleSubmit(onRoleSubmit)} className="space-y-4">
              <FormField
                control={roleForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      Roles determine what permissions the user has in this organization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsRoleDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateRoleMutation.isPending}
                >
                  {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Remove User Confirmation Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedUser?.username} from this organization?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={removeUserMutation.isPending}
            >
              {removeUserMutation.isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default TenantUserManagementTable;