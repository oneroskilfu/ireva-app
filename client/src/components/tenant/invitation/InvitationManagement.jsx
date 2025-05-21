import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../../hooks/useApiRequest';
import { useToast } from '../../../hooks/use-toast';
import { useTenant } from '../../../contexts/TenantContext';
import copy from 'clipboard-copy';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/DesignSystem';

import {
  UserPlusIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  ArchiveBoxIcon,
  PaperAirplaneIcon,
  DocumentDuplicateIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * InvitationManagement Component
 * 
 * Allows administrators to manage and send invitations to users
 * to join their tenant organizations.
 */
const InvitationManagement = () => {
  const api = useApiRequest();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  
  // States for modals
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  
  // State for selected invitation
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  
  // Form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'user',
  });
  
  // Fetch invitations for current tenant
  const { data: invitations, isLoading, refetch } = useQuery({
    queryKey: [`/api/tenants/${currentTenant?.id}/invitations`],
    queryFn: async () => {
      try {
        const response = await api.get(`tenants/${currentTenant.id}/invitations`);
        return response.data.data;
      } catch (error) {
        console.error('Error fetching invitations:', error);
        throw error;
      }
    },
    enabled: !!currentTenant?.id,
  });
  
  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post(`tenants/${currentTenant.id}/invitations`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`/api/tenants/${currentTenant?.id}/invitations`]);
      setInviteDialogOpen(false);
      resetInviteForm();
      toast({
        title: 'Invitation Sent',
        description: 'The invitation has been sent successfully.',
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
  
  // Delete invitation mutation
  const deleteInvitationMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`tenants/${currentTenant.id}/invitations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`/api/tenants/${currentTenant?.id}/invitations`]);
      setDeleteDialogOpen(false);
      setSelectedInvitation(null);
      toast({
        title: 'Invitation Deleted',
        description: 'The invitation has been deleted successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete invitation',
        variant: 'destructive',
      });
    },
  });
  
  // Resend invitation mutation
  const resendInvitationMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.post(`tenants/${currentTenant.id}/invitations/${id}/resend`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`/api/tenants/${currentTenant?.id}/invitations`]);
      setResendDialogOpen(false);
      setSelectedInvitation(null);
      toast({
        title: 'Invitation Resent',
        description: 'The invitation has been resent successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to resend invitation',
        variant: 'destructive',
      });
    },
  });
  
  // Reset invite form
  const resetInviteForm = () => {
    setInviteForm({
      email: '',
      role: 'user',
    });
  };
  
  // Handle send invitation
  const handleSendInvitation = () => {
    if (!inviteForm.email || !inviteForm.role) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    createInvitationMutation.mutate(inviteForm);
  };
  
  // Handle delete invitation
  const handleDeleteInvitation = (invitation) => {
    setSelectedInvitation(invitation);
    setDeleteDialogOpen(true);
  };
  
  // Handle resend invitation
  const handleResendInvitation = (invitation) => {
    setSelectedInvitation(invitation);
    setResendDialogOpen(true);
  };
  
  // Handle copying invitation link
  const handleCopyInvitationLink = (token) => {
    const baseUrl = window.location.origin;
    const invitationLink = `${baseUrl}/invitation/${token}`;
    
    copy(invitationLink)
      .then(() => {
        toast({
          title: 'Link Copied',
          description: 'Invitation link copied to clipboard',
          variant: 'success',
        });
      })
      .catch((error) => {
        console.error('Failed to copy link:', error);
        toast({
          title: 'Error',
          description: 'Failed to copy link to clipboard',
          variant: 'destructive',
        });
      });
  };
  
  // Check if invitation is expired
  const isInvitationExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };
  
  // Invitation status badge
  const InvitationStatusBadge = ({ invitation }) => {
    if (invitation.acceptedAt) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircleIcon className="h-3 w-3" />
          Accepted
        </Badge>
      );
    } else if (isInvitationExpired(invitation.expiresAt)) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircleIcon className="h-3 w-3" />
          Expired
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <ClockIcon className="h-3 w-3" />
          Pending
        </Badge>
      );
    }
  };
  
  // No invitations display
  const NoInvitationsDisplay = () => (
    <div className="text-center py-10">
      <EnvelopeIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
      <h3 className="text-lg font-medium text-gray-900">No Invitations</h3>
      <p className="text-gray-500 mt-1 max-w-sm mx-auto">
        No invitations have been sent yet. Invite team members to join your organization.
      </p>
      <Button
        className="mt-4"
        onClick={() => {
          resetInviteForm();
          setInviteDialogOpen(true);
        }}
      >
        <UserPlusIcon className="h-4 w-4 mr-2" />
        Invite Users
      </Button>
    </div>
  );
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Team Invitations</CardTitle>
          <CardDescription>
            Manage invitations to join your organization
          </CardDescription>
        </div>
        <Button
          onClick={() => {
            resetInviteForm();
            setInviteDialogOpen(true);
          }}
        >
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !invitations || invitations.length === 0 ? (
          <NoInvitationsDisplay />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div className="font-medium">{invitation.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {invitation.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <InvitationStatusBadge invitation={invitation} />
                    </TableCell>
                    <TableCell>
                      {formatDate(invitation.expiresAt)}
                    </TableCell>
                    <TableCell>
                      {formatDate(invitation.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleCopyInvitationLink(invitation.token)}
                                disabled={invitation.acceptedAt || isInvitationExpired(invitation.expiresAt)}
                              >
                                <DocumentDuplicateIcon className="h-4 w-4" />
                                <span className="sr-only">Copy Link</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy invitation link</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleResendInvitation(invitation)}
                                disabled={invitation.acceptedAt || !isInvitationExpired(invitation.expiresAt)}
                              >
                                <PaperAirplaneIcon className="h-4 w-4" />
                                <span className="sr-only">Resend</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{!isInvitationExpired(invitation.expiresAt) ? 'Invitation still valid' : 'Resend invitation'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600"
                                onClick={() => handleDeleteInvitation(invitation)}
                                disabled={invitation.acceptedAt}
                              >
                                <TrashIcon className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{invitation.acceptedAt ? 'Cannot delete accepted invitation' : 'Delete invitation'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      {/* Invite User Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation to join your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
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
              onClick={handleSendInvitation}
              disabled={createInvitationMutation.isPending}
            >
              {createInvitationMutation.isPending ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Invitation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invitation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedInvitation && (
            <div className="py-4">
              <div className="p-3 border rounded-md bg-gray-50">
                <p className="font-medium">{selectedInvitation.email}</p>
                <p className="text-sm text-gray-500">
                  Role: <span className="capitalize">{selectedInvitation.role}</span>
                </p>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteInvitationMutation.mutate(selectedInvitation.id)}
              disabled={deleteInvitationMutation.isPending}
            >
              {deleteInvitationMutation.isPending ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Resend Invitation Dialog */}
      <AlertDialog open={resendDialogOpen} onOpenChange={setResendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resend Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to resend this invitation? The previous invitation link will be replaced with a new one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedInvitation && (
            <div className="py-4">
              <div className="p-3 border rounded-md bg-gray-50">
                <p className="font-medium">{selectedInvitation.email}</p>
                <p className="text-sm text-gray-500">
                  Role: <span className="capitalize">{selectedInvitation.role}</span>
                </p>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => resendInvitationMutation.mutate(selectedInvitation.id)}
              disabled={resendInvitationMutation.isPending}
            >
              {resendInvitationMutation.isPending ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Resending...
                </>
              ) : (
                'Resend'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default InvitationManagement;