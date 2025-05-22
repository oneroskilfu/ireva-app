import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Copy,
  MoreHorizontal,
  Loader2,
  Mail,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  UserX,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Invitation form schema
const invitationFormSchema = z.object({
  email: z.string().email('Must be a valid email'),
  role: z.string().min(1, 'Role is required'),
});

type InvitationFormValues = z.infer<typeof invitationFormSchema>;

// Invitation and user types
interface Invitation {
  id: number;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  createdByUser: {
    id: number;
    name: string;
    email: string;
  };
}

interface TenantUser {
  id: number;
  userId: number;
  role: string;
  isOwner: boolean;
  joinedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default function TenantUserManagement() {
  const [activeTab, setActiveTab] = useState('members');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [, params] = useRoute('/tenant/:tenantId/*');
  const tenantId = params?.tenantId;
  const { toast } = useToast();

  // Fetch users and invitations
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery<TenantUser[]>({
    queryKey: [`/api/tenants/${tenantId}/users`],
    enabled: !!tenantId,
  });

  const {
    data: invitations = [],
    isLoading: invitationsLoading,
    error: invitationsError,
  } = useQuery<Invitation[]>({
    queryKey: [`/api/tenants/${tenantId}/invitations`],
    enabled: !!tenantId,
  });

  // Invitation form
  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationFormSchema),
    defaultValues: {
      email: '',
      role: 'user',
    },
  });

  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: async (data: InvitationFormValues) => {
      const res = await apiRequest('POST', `/api/tenants/${tenantId}/invitations`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invitation sent',
        description: 'The invitation has been sent successfully.',
      });
      
      // Reset form and close dialog
      form.reset();
      setInviteDialogOpen(false);
      
      // Refresh invitations list
      queryClient.invalidateQueries({ queryKey: [`/api/tenants/${tenantId}/invitations`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send invitation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Resend invitation mutation
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: number) => {
      const res = await apiRequest('POST', `/api/tenants/${tenantId}/invitations/${invitationId}/resend`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invitation resent',
        description: 'The invitation has been resent successfully.',
      });
      
      // Refresh invitations list
      queryClient.invalidateQueries({ queryKey: [`/api/tenants/${tenantId}/invitations`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to resend invitation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Revoke invitation mutation
  const revokeInvitationMutation = useMutation({
    mutationFn: async (invitationId: number) => {
      const res = await apiRequest('DELETE', `/api/tenants/${tenantId}/invitations/${invitationId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invitation revoked',
        description: 'The invitation has been revoked successfully.',
      });
      
      // Refresh invitations list
      queryClient.invalidateQueries({ queryKey: [`/api/tenants/${tenantId}/invitations`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to revoke invitation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await apiRequest('PATCH', `/api/tenants/${tenantId}/users/${userId}`, { role });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Role updated',
        description: 'The user role has been updated successfully.',
      });
      
      // Refresh users list
      queryClient.invalidateQueries({ queryKey: [`/api/tenants/${tenantId}/users`] });
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
      const res = await apiRequest('DELETE', `/api/tenants/${tenantId}/users/${userId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'User removed',
        description: 'The user has been removed from the organization.',
      });
      
      // Refresh users list
      queryClient.invalidateQueries({ queryKey: [`/api/tenants/${tenantId}/users`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove user',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: InvitationFormValues) => {
    createInvitationMutation.mutate(data);
  };

  // Copy invitation link
  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/invitations/accept/${token}`;
    navigator.clipboard.writeText(link);
    
    toast({
      title: 'Link copied',
      description: 'The invitation link has been copied to clipboard.',
    });
  };

  // Role badge component
  const RoleBadge = ({ role }: { role: string }) => {
    let color = 'default';
    let icon = null;
    
    switch (role) {
      case 'admin':
        color = 'default';
        icon = <ShieldCheck className="h-3 w-3 mr-1" />;
        break;
      case 'owner':
        color = 'destructive';
        icon = <ShieldAlert className="h-3 w-3 mr-1" />;
        break;
      default:
        color = 'secondary';
        break;
    }
    
    return (
      <Badge variant={color as any} className="capitalize flex items-center">
        {icon}
        {role}
      </Badge>
    );
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let color = 'default';
    let icon = null;
    
    switch (status) {
      case 'pending':
        color = 'warning';
        icon = <Clock className="h-3 w-3 mr-1" />;
        break;
      case 'accepted':
        color = 'success';
        icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
        break;
      case 'revoked':
        color = 'destructive';
        icon = <XCircle className="h-3 w-3 mr-1" />;
        break;
      default:
        color = 'secondary';
        break;
    }
    
    return (
      <Badge variant={color as any} className="capitalize flex items-center">
        {icon}
        {status}
      </Badge>
    );
  };

  // Check if user is tenant owner
  const isOwner = users.some(user => user.isOwner && user.user.id === users[0]?.user.id);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage your organization's team members and invitations.
          </CardDescription>
        </div>
        
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
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
                Send an invitation to join your organization.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="user@example.com"
                          {...field}
                          disabled={createInvitationMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={createInvitationMutation.isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInviteDialogOpen(false)}
                    disabled={createInvitationMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createInvitationMutation.isPending}
                  >
                    {createInvitationMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="members">
            {usersLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 py-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="ml-auto h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : usersError ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Error loading team members. Please try again.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/tenants/${tenantId}/users`] })}
                >
                  Retry
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No team members found. Invite users to join your organization.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.user.name || 'Unknown'}
                      </TableCell>
                      <TableCell>{member.user.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={member.isOwner ? 'owner' : member.role} />
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.isOwner ? (
                          <Badge variant="outline">Owner</Badge>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              {isOwner && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => updateUserRoleMutation.mutate({
                                      userId: member.userId,
                                      role: member.role === 'user' ? 'admin' : 'user'
                                    })}
                                    disabled={updateUserRoleMutation.isPending}
                                  >
                                    {member.role === 'user' ? (
                                      <>
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        Make Admin
                                      </>
                                    ) : (
                                      <>
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        Remove Admin
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              
                              <DropdownMenuItem
                                onClick={() => {
                                  if (confirm(`Are you sure you want to remove ${member.user.name || member.user.email}?`)) {
                                    removeUserMutation.mutate(member.userId);
                                  }
                                }}
                                disabled={removeUserMutation.isPending}
                                className="text-destructive"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Remove User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="invitations">
            {invitationsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 py-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="ml-auto h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : invitationsError ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Error loading invitations. Please try again.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/tenants/${tenantId}/invitations`] })}
                >
                  Retry
                </Button>
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No invitations found. Invite users to join your organization.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">
                        {invitation.email}
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={invitation.role} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={invitation.status} />
                      </TableCell>
                      <TableCell>
                        {invitation.status === 'pending' ? (
                          formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {invitation.createdByUser?.name || invitation.createdByUser?.email || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-right">
                        {invitation.status === 'pending' ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem
                                onClick={() => copyInvitationLink(invitation.id.toString())}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Link
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem
                                onClick={() => resendInvitationMutation.mutate(invitation.id)}
                                disabled={resendInvitationMutation.isPending}
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                Resend
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem
                                onClick={() => {
                                  if (confirm(`Are you sure you want to revoke the invitation for ${invitation.email}?`)) {
                                    revokeInvitationMutation.mutate(invitation.id);
                                  }
                                }}
                                disabled={revokeInvitationMutation.isPending}
                                className="text-destructive"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Revoke
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Badge variant="outline">
                            {invitation.status === 'accepted' ? 'Accepted' : 'Revoked'}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}