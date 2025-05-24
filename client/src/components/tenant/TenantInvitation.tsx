import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Check, X, Clock, AlertCircle } from 'lucide-react';

interface TenantInvitationProps {
  token: string;
}

const TenantInvitation: React.FC<TenantInvitationProps> = ({ token }) => {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { userTenants, refetch: refetchTenants } = useTenant();
  const { toast } = useToast();
  const [invitationStatus, setInvitationStatus] = useState<'loading' | 'valid' | 'invalid' | 'expired' | 'wrong-email'>('loading');
  
  // Fetch invitation details
  const { data: invitation, isLoading: invitationLoading, error } = useQuery({
    queryKey: ['/api/invitations', token],
    queryFn: async () => {
      const res = await fetch(`/api/invitations/${token}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch invitation');
      }
      return res.json();
    },
    retry: false,
  });
  
  // Check invitation status
  useEffect(() => {
    if (!invitationLoading && invitation) {
      if (invitation.error) {
        setInvitationStatus('invalid');
      } else if (new Date(invitation.data.expiresAt) < new Date()) {
        setInvitationStatus('expired');
      } else if (user && invitation.data.email !== user.email) {
        setInvitationStatus('wrong-email');
      } else {
        setInvitationStatus('valid');
      }
    } else if (!invitationLoading && error) {
      setInvitationStatus('invalid');
    }
  }, [invitation, invitationLoading, error, user]);
  
  // Check if user is already a member of the tenant
  const isAlreadyMember = userTenants?.some(tenant => tenant.id === invitation?.data?.tenantId);
  
  // Accept invitation mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/user/invitations/${token}/accept`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to accept invitation');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Invitation accepted',
        description: `You have successfully joined ${data.data.tenantName}.`,
      });
      
      // Refresh tenant list
      refetchTenants();
      
      // Redirect to dashboard
      setTimeout(() => {
        setLocation('/dashboard');
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to accept invitation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Decline invitation mutation
  const declineMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/user/invitations/${token}/decline`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to decline invitation');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invitation declined',
        description: 'You have declined the invitation.',
      });
      
      // Redirect to homepage
      setTimeout(() => {
        setLocation('/');
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to decline invitation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle accept invitation
  const handleAccept = () => {
    if (!user) {
      // Save token to local storage and redirect to auth page
      localStorage.setItem('pendingInvitationToken', token);
      setLocation('/auth');
      return;
    }
    
    acceptMutation.mutate();
  };
  
  // Handle decline invitation
  const handleDecline = () => {
    if (!user) {
      // Simply redirect to homepage if not logged in
      setLocation('/');
      return;
    }
    
    declineMutation.mutate();
  };
  
  // Loading state
  if (authLoading || invitationLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Loading Invitation</CardTitle>
          <CardDescription>Please wait while we load the invitation details.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }
  
  // Invalid invitation
  if (invitationStatus === 'invalid') {
    return (
      <Card className="w-full max-w-md mx-auto border-destructive">
        <CardHeader>
          <CardTitle>Invalid Invitation</CardTitle>
          <CardDescription>This invitation is not valid or has already been used.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <p className="text-center text-muted-foreground">The invitation link you are trying to use is invalid or has already been used.</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => setLocation('/')}>Return to Home</Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Expired invitation
  if (invitationStatus === 'expired') {
    return (
      <Card className="w-full max-w-md mx-auto border-destructive">
        <CardHeader>
          <CardTitle>Expired Invitation</CardTitle>
          <CardDescription>This invitation has expired.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Clock className="h-16 w-16 text-destructive mb-4" />
          <p className="text-center text-muted-foreground">The invitation has expired. Please contact the organization administrator for a new invitation.</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => setLocation('/')}>Return to Home</Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Wrong email
  if (invitationStatus === 'wrong-email') {
    return (
      <Card className="w-full max-w-md mx-auto border-destructive">
        <CardHeader>
          <CardTitle>Email Mismatch</CardTitle>
          <CardDescription>This invitation was sent to a different email address.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <p className="text-center text-muted-foreground">
            This invitation was sent to {invitation?.data?.email}. You are currently logged in with a different email address.
            Please log in with the correct account or contact the organization administrator.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={() => {
            // Log out and redirect to auth page with token
            localStorage.setItem('pendingInvitationToken', token);
            // This assumes there's a logout function in useAuth()
            setLocation('/auth');
          }}>Log in with Different Account</Button>
          <Button className="w-full" variant="outline" onClick={() => setLocation('/')}>Return to Home</Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Already a member
  if (isAlreadyMember) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Already a Member</CardTitle>
          <CardDescription>You are already a member of this organization.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Check className="h-16 w-16 text-primary mb-4" />
          <p className="text-center text-muted-foreground">
            You are already a member of {invitation?.data?.tenantName}.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => setLocation('/dashboard')}>Go to Dashboard</Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Valid invitation
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Organization Invitation</CardTitle>
        <CardDescription>You have been invited to join an organization.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 border rounded-md bg-muted/50">
          <h3 className="text-lg font-medium">{invitation?.data?.tenantName}</h3>
          <p className="text-sm text-muted-foreground">has invited you to join their organization</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Invited by:</span>
            <span className="text-sm font-medium">{invitation?.data?.invitedByName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Role:</span>
            <span className="text-sm font-medium">{invitation?.data?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Expires:</span>
            <span className="text-sm font-medium">
              {new Date(invitation?.data?.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {!user && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
            <p className="font-medium">You need to log in or create an account to join this organization.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex space-x-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleDecline}
          disabled={declineMutation.isPending}
        >
          {declineMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Declining...
            </>
          ) : (
            <>
              <X className="mr-2 h-4 w-4" />
              Decline
            </>
          )}
        </Button>
        <Button 
          className="flex-1"
          onClick={handleAccept}
          disabled={acceptMutation.isPending}
        >
          {acceptMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Accepting...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Accept
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TenantInvitation;