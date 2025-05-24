import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useRoute, useRouter } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../../hooks/useApiRequest';
import { useToast } from '../../../hooks/use-toast';
import { useAuth } from '../../../hooks/useAuth';

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
  Checkbox,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Alert,
  AlertTitle,
  AlertDescription,
} from '../../ui/DesignSystem';

import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserPlusIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

/**
 * AcceptInvitation Component
 * 
 * Handles accepting tenant invitations. This is shown when a user clicks
 * on an invitation link sent to their email.
 */
const AcceptInvitation = () => {
  const api = useApiRequest();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, navigate] = useRouter();
  
  // Get token from URL parameter
  const params = useParams();
  const token = params.token;
  
  // State for handling the invitation flow
  const [setAsDefault, setSetAsDefault] = useState(true);
  
  // Fetch invitation details
  const { 
    data: invitation, 
    isLoading: isInvitationLoading,
    error: invitationError,
    refetch: refetchInvitation
  } = useQuery({
    queryKey: [`/api/tenants/invitation/${token}`],
    queryFn: async () => {
      try {
        const response = await api.get(`tenants/invitation/${token}`);
        return response.data.data;
      } catch (error) {
        console.error('Error fetching invitation:', error);
        throw error;
      }
    },
    enabled: !!token,
  });
  
  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`tenants/invitation/${token}/accept`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['/api/tenants/user']);
      
      if (setAsDefault) {
        // Set as default tenant
        return setDefaultTenantMutation.mutate(data.data.tenantId);
      } else {
        toast({
          title: 'Invitation Accepted',
          description: 'You have successfully joined the organization.',
          variant: 'success',
        });
        
        // Redirect to dashboard
        navigate('/');
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to accept invitation',
        variant: 'destructive',
      });
    },
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
        title: 'Invitation Accepted',
        description: 'You have successfully joined the organization and set it as your default.',
        variant: 'success',
      });
      
      // Redirect to dashboard
      navigate('/');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to set default tenant',
        variant: 'destructive',
      });
      
      // Still redirect to dashboard even if setting default fails
      navigate('/');
    },
  });
  
  // Handle accept invitation
  const handleAcceptInvitation = () => {
    if (!user) {
      // If not logged in, redirect to login page with redirect back to this page
      navigate(`/auth?redirect=/invitation/${token}`);
      return;
    }
    
    acceptInvitationMutation.mutate();
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
  
  // Get status of the invitation
  const getInvitationStatus = () => {
    if (!invitation) return null;
    
    const now = new Date();
    const expiresAt = new Date(invitation.expiresAt);
    
    if (invitation.acceptedAt) {
      return {
        status: 'accepted',
        message: 'This invitation has already been accepted.',
      };
    } else if (expiresAt < now) {
      return {
        status: 'expired',
        message: 'This invitation has expired.',
      };
    }
    
    return {
      status: 'valid',
      message: `Valid until ${new Date(invitation.expiresAt).toLocaleDateString()}`,
    };
  };
  
  // Check if invitation is for the logged-in user
  const isInvitationForCurrentUser = () => {
    if (!user || !invitation) return false;
    
    return user.email === invitation.email;
  };
  
  const invitationStatus = invitation ? getInvitationStatus() : null;
  const isLoading = isAuthLoading || isInvitationLoading;
  const isPending = acceptInvitationMutation.isPending || setDefaultTenantMutation.isPending;
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md px-4">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Organization Invitation</CardTitle>
            <CardDescription>
              You've been invited to join an organization
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : invitationError ? (
              <Alert variant="destructive" className="mb-4">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Invalid Invitation</AlertTitle>
                <AlertDescription>
                  This invitation link is invalid or has been removed.
                </AlertDescription>
              </Alert>
            ) : invitation ? (
              <>
                {invitationStatus.status !== 'valid' && (
                  <Alert variant={invitationStatus.status === 'accepted' ? 'default' : 'destructive'} className="mb-4">
                    {invitationStatus.status === 'accepted' ? (
                      <CheckCircleIcon className="h-4 w-4" />
                    ) : (
                      <XCircleIcon className="h-4 w-4" />
                    )}
                    <AlertTitle className="capitalize">{invitationStatus.status}</AlertTitle>
                    <AlertDescription>
                      {invitationStatus.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="border rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      {invitation.tenant?.logoUrl ? (
                        <AvatarImage src={invitation.tenant.logoUrl} alt={invitation.tenant.name} />
                      ) : (
                        <AvatarFallback
                          style={{ backgroundColor: invitation.tenant?.primaryColor || '#0066cc' }}
                          className="text-white"
                        >
                          {getInitials(invitation.tenant?.name || '?')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="space-y-1">
                      <h3 className="font-medium text-lg">{invitation.tenant?.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <BuildingOfficeIcon className="h-4 w-4" />
                        {invitation.tenant?.slug}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                    <div className="text-gray-500">You've been invited as:</div>
                    <div className="font-medium capitalize">{invitation.role}</div>
                    
                    <div className="text-gray-500">Invitation sent to:</div>
                    <div className="font-medium">{invitation.email}</div>
                    
                    <div className="text-gray-500">Invited by:</div>
                    <div className="font-medium">{invitation.createdBy?.name || 'Administrator'}</div>
                    
                    <div className="text-gray-500">Status:</div>
                    <div className="font-medium text-primary">{invitationStatus.message}</div>
                  </div>
                </div>
                
                {user && !isInvitationForCurrentUser() && (
                  <Alert variant="warning" className="mb-4">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Different Email Address</AlertTitle>
                    <AlertDescription>
                      This invitation was sent to {invitation.email}, but you're logged in as {user.email}.
                      You can still accept the invitation, but you may want to log in with the correct account first.
                    </AlertDescription>
                  </Alert>
                )}
                
                {invitationStatus.status === 'valid' && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="set-default"
                        checked={setAsDefault}
                        onCheckedChange={setSetAsDefault}
                      />
                      <Label htmlFor="set-default" className="text-sm cursor-pointer">
                        Set as my default organization
                      </Label>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              disabled={isPending}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleAcceptInvitation}
              disabled={isLoading || invitationError || invitationStatus?.status !== 'valid' || isPending}
              className="flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {user ? (
                    <>
                      <UserPlusIcon className="h-4 w-4" />
                      Accept Invitation
                    </>
                  ) : (
                    <>
                      <ChevronRightIcon className="h-4 w-4" />
                      Log in to Accept
                    </>
                  )}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AcceptInvitation;