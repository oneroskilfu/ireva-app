import { useState } from 'react';
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
import { 
  Search, 
  MoreHorizontal, 
  Plus, 
  Mail,
  RotateCcw, 
  XCircle,
  RefreshCw,
  ClipboardCopy,
  Clock,
  CheckCircle
} from "lucide-react";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Invitation type
interface TenantInvitation {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitedByUserId: number;
  invitedByUsername: string;
  expiresAt: string;
  createdAt: string;
}

// Invitation form schema
const invitationFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.string().min(1, "Please select a role"),
});

const TenantInvitationTable = ({ tenantId }: { tenantId: string }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvitation, setSelectedInvitation] = useState<TenantInvitation | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isResendDialogOpen, setIsResendDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch tenant invitations
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/admin/tenants/${tenantId}/invitations`, currentPage, searchQuery, statusFilter],
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
      
      const res = await fetch(`/api/admin/tenants/${tenantId}/invitations?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch invitations');
      }
      return res.json();
    },
    enabled: !!tenantId,
  });
  
  // Create invitation mutation
  const createInvitationMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: [`/api/admin/tenants/${tenantId}/invitations`] });
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
    mutationFn: async (invitationId: string) => {
      const res = await apiRequest('POST', `/api/admin/tenants/${tenantId}/invitations/${invitationId}/resend`, {});
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to resend invitation');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invitation resent',
        description: 'The invitation has been resent successfully.',
      });
      setIsResendDialogOpen(false);
      setSelectedInvitation(null);
      queryClient.invalidateQueries({ queryKey: [`/api/admin/tenants/${tenantId}/invitations`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to resend invitation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Cancel invitation mutation
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await apiRequest('DELETE', `/api/admin/tenants/${tenantId}/invitations/${invitationId}`, {});
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to cancel invitation');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invitation cancelled',
        description: 'The invitation has been cancelled successfully.',
      });
      setIsCancelDialogOpen(false);
      setSelectedInvitation(null);
      queryClient.invalidateQueries({ queryKey: [`/api/admin/tenants/${tenantId}/invitations`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to cancel invitation',
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
  
  // Handle invite form submission
  const onInviteSubmit = (formData: z.infer<typeof invitationFormSchema>) => {
    createInvitationMutation.mutate(formData);
  };
  
  // Handle resend confirmation
  const handleResendConfirm = () => {
    if (selectedInvitation) {
      resendInvitationMutation.mutate(selectedInvitation.id);
    }
  };
  
  // Handle cancel confirmation
  const handleCancelConfirm = () => {
    if (selectedInvitation) {
      cancelInvitationMutation.mutate(selectedInvitation.id);
    }
  };
  
  // Handle resend button click
  const handleResendClick = (invitation: TenantInvitation) => {
    setSelectedInvitation(invitation);
    setIsResendDialogOpen(true);
  };
  
  // Handle cancel button click
  const handleCancelClick = (invitation: TenantInvitation) => {
    setSelectedInvitation(invitation);
    setIsCancelDialogOpen(true);
  };
  
  // Filter function
  const handleSearch = () => {
    setCurrentPage(1);
    // The query will be refetched automatically due to the queryKey change
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
  
  // Check if invitation is expired
  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };
  
  // Get status badge
  const getStatusBadge = (status: string, expiresAt: string) => {
    if (status === 'pending' && isExpired(expiresAt)) {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Expired</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'declined':
        return <Badge className="bg-red-500">Declined</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Copy invitation link to clipboard
  const copyInvitationLink = (invitationId: string) => {
    const link = `${window.location.origin}/invitations/${invitationId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link copied',
      description: 'Invitation link copied to clipboard',
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Invitations</CardTitle>
            <CardDescription>
              Manage invitations for this organization
            </CardDescription>
          </div>
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <Mail className="mr-2 h-4 w-4" /> New Invitation
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
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
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('accepted')}>
                  Accepted
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('declined')}>
                  Declined
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button variant="secondary" onClick={handleSearch}>
            Search
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">Loading invitations...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">
            Error loading invitations: {(error as Error).message}
          </div>
        ) : data?.invitations?.length === 0 ? (
          <div className="text-center py-4">No invitations found</div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.invitations?.map((invitation: TenantInvitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>{invitation.role}</TableCell>
                      <TableCell>
                        {getStatusBadge(invitation.status, invitation.expiresAt)}
                      </TableCell>
                      <TableCell>{invitation.invitedByUsername}</TableCell>
                      <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {isExpired(invitation.expiresAt) ? (
                            <span className="text-red-500 flex items-center">
                              <XCircle className="h-4 w-4 mr-1" />
                              Expired
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDate(invitation.expiresAt)}
                            </span>
                          )}
                        </div>
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => copyInvitationLink(invitation.id)}>
                              <ClipboardCopy className="mr-2 h-4 w-4" />
                              <span>Copy Link</span>
                            </DropdownMenuItem>
                            {invitation.status === 'pending' && !isExpired(invitation.expiresAt) && (
                              <DropdownMenuItem onClick={() => handleResendClick(invitation)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                <span>Resend</span>
                              </DropdownMenuItem>
                            )}
                            {invitation.status === 'pending' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleCancelClick(invitation)}
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  <span>Cancel</span>
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
      
      {/* Create Invitation Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Invitation</DialogTitle>
            <DialogDescription>
              Send an invitation to join this organization. The user will receive an email with a link to accept.
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
                      The email address of the person you want to invite
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
                      The role assigned to the user in this organization
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
                  disabled={createInvitationMutation.isPending}
                >
                  {createInvitationMutation.isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Resend Invitation Dialog */}
      <AlertDialog open={isResendDialogOpen} onOpenChange={setIsResendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resend Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to resend the invitation to {selectedInvitation?.email}?
              This will extend the invitation expiration period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResendConfirm}
              disabled={resendInvitationMutation.isPending}
            >
              {resendInvitationMutation.isPending ? 'Resending...' : 'Resend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Cancel Invitation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the invitation to {selectedInvitation?.email}?
              This action cannot be undone and the invitation link will no longer work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={cancelInvitationMutation.isPending}
            >
              {cancelInvitationMutation.isPending ? 'Cancelling...' : 'Cancel Invitation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default TenantInvitationTable;