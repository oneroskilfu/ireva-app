import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertCircle, 
  Check, 
  MoreHorizontal, 
  Pencil, 
  Plus, 
  Shield, 
  Trash, 
  User, 
  UserCog, 
  UserPlus,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TenantUser {
  id: string;
  tenantId: string;
  userId: number;
  user: {
    id: number;
    username: string;
    email: string;
    name: string;
    profileImage?: string;
  };
  role: string;
  isOwner: boolean;
  isActive: boolean;
  joinedAt: string;
  lastActiveAt?: string;
}

export default function TenantUserManagement() {
  const { tenantId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');

  // Fetch tenant users
  const {
    data: tenantUsers,
    isLoading,
    error,
  } = useQuery<TenantUser[]>({
    queryKey: [`/api/tenants/${tenantId}/users`],
    enabled: !!tenantId,
  });

  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const res = await apiRequest('POST', `/api/tenants/${tenantId}/invitations`, {
        email,
        role,
      });
      return await res.json();
    },
    onSuccess: () => {
      // Clear form and close dialog
      setInviteEmail('');
      setInviteRole('user');
      setIsInviteDialogOpen(false);
      
      // Show success message
      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${inviteEmail}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send invitation',
        description: error.message || 'There was an error sending the invitation. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Change user role mutation
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await apiRequest('PUT', `/api/tenants/${tenantId}/users/${userId}/role`, {
        role,
      });
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate users query to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/tenants/${tenantId}/users`] });
      
      // Show success message
      toast({
        title: 'Role updated',
        description: 'The user role has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update role',
        description: error.message || 'There was an error updating the user role. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Remove user mutation
  const removeUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest('DELETE', `/api/tenants/${tenantId}/users/${userId}`);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate users query to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/tenants/${tenantId}/users`] });
      
      // Show success message
      toast({
        title: 'User removed',
        description: 'The user has been removed from the organization.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove user',
        description: error.message || 'There was an error removing the user. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle invite form submission
  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteUserMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was an error loading the organization users. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Organization Members</h1>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
              <DialogDescription>
                Send an invitation email to add a new user to your organization.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="role" className="text-sm font-medium">
                    Role
                  </label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={inviteUserMutation.isPending}
                >
                  {inviteUserMutation.isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
          <CardDescription>
            Manage the users in your organization and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenantUsers && tenantUsers.map((tenantUser) => (
                <TableRow key={tenantUser.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {tenantUser.user.profileImage ? (
                        <img
                          src={tenantUser.user.profileImage}
                          alt={tenantUser.user.name}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div>{tenantUser.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {tenantUser.user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${getRoleBadgeColor(tenantUser.role)} capitalize`}
                        variant="outline"
                      >
                        {tenantUser.role}
                      </Badge>
                      {tenantUser.isOwner && (
                        <Badge variant="outline">Owner</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {tenantUser.isActive ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" /> Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500">
                        <X className="h-4 w-4" /> Inactive
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(tenantUser.joinedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {!tenantUser.isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => 
                              changeRoleMutation.mutate({
                                userId: tenantUser.user.id,
                                role: tenantUser.role === 'admin' ? 'user' : 'admin'
                              })
                            }
                          >
                            {tenantUser.role === 'admin' ? (
                              <>
                                <User className="mr-2 h-4 w-4" />
                                <span>Make User</span>
                              </>
                            ) : (
                              <>
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Make Admin</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => removeUserMutation.mutate(tenantUser.user.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Remove User</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {tenantUsers && tenantUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <UserCog className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No users found. Invite users to get started.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsInviteDialogOpen(true)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite User
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}