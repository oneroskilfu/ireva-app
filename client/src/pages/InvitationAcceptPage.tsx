import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  CheckCircle,
  Clock,
  XCircle,
  LogIn,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Invitation interface
interface Invitation {
  id: number;
  tenantId: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  tenantName: string;
}

export default function InvitationAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [accepted, setAccepted] = useState(false);

  // Fetch invitation details
  const {
    data: invitation,
    isLoading: invitationLoading,
    error: invitationError,
    refetch,
  } = useQuery<Invitation>({
    queryKey: [`/api/invitations/${token}`],
    enabled: !!token,
  });

  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/invitations/${token}/accept`);
      return await res.json();
    },
    onSuccess: (data) => {
      setAccepted(true);
      toast({
        title: 'Invitation accepted',
        description: `You have joined ${invitation?.tenantName || 'the organization'}.`,
      });

      // Delay navigation a bit to let the user see the success message
      setTimeout(() => {
        setLocation(`/tenant/${data.invitation.tenantId}/dashboard`);
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

  // Check if invitation matches user email
  const invitationMatchesUser = user && invitation && user.email === invitation.email;

  // Handle accept invitation
  const handleAcceptInvitation = () => {
    if (!user) {
      // Redirect to auth page with return URL
      localStorage.setItem('authRedirectUrl', `/invitations/accept/${token}`);
      setLocation('/auth');
      return;
    }

    acceptInvitationMutation.mutate();
  };

  // Effect for auth redirect
  useEffect(() => {
    if (!authLoading && !invitationLoading && invitation && !user) {
      // Store the target URL for redirect after auth
      localStorage.setItem('authRedirectUrl', `/invitations/accept/${token}`);
      // Wait a bit to allow the invitation details to be viewed
      setTimeout(() => {
        toast({
          title: 'Authentication required',
          description: 'Please login or register to accept this invitation.',
        });
        setLocation('/auth');
      }, 1500);
    }
  }, [authLoading, invitationLoading, invitation, user, token, toast, setLocation]);

  // Render loading state
  if (invitationLoading || authLoading) {
    return (
      <div className="container max-w-lg py-12">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render error state
  if (invitationError || !invitation) {
    return (
      <div className="container max-w-lg py-12">
        <Card>
          <CardHeader>
            <CardTitle>Invitation Not Found</CardTitle>
            <CardDescription>
              The invitation you're looking for doesn't exist or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {invitationError
                  ? 'There was an error loading the invitation. It may have expired or been revoked.'
                  : 'This invitation link is invalid or has expired.'}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => refetch()} className="mr-2">
              Try Again
            </Button>
            <Button onClick={() => setLocation('/')}>Go to Homepage</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Check if invitation is expired
  const isExpired = new Date(invitation.expiresAt) < new Date();

  // Check if invitation is already accepted or revoked
  const isProcessed = invitation.status !== 'pending';

  // Render acceptance page
  return (
    <div className="container max-w-lg py-12">
      <Card>
        <CardHeader>
          <CardTitle>
            {accepted
              ? 'Invitation Accepted'
              : isProcessed
              ? invitation.status === 'accepted'
                ? 'Invitation Already Accepted'
                : 'Invitation Revoked'
              : isExpired
              ? 'Invitation Expired'
              : 'Invitation to Join'}
          </CardTitle>
          <CardDescription>
            {accepted
              ? `You have successfully joined ${invitation.tenantName}.`
              : isProcessed
              ? invitation.status === 'accepted'
                ? 'This invitation has already been accepted.'
                : 'This invitation has been revoked by the organization.'
              : isExpired
              ? 'This invitation has expired and is no longer valid.'
              : `You have been invited to join ${invitation.tenantName} as a ${invitation.role}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accepted ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                You've successfully joined {invitation.tenantName}. You'll be redirected to the
                dashboard momentarily.
              </AlertDescription>
            </Alert>
          ) : isProcessed ? (
            <Alert variant={invitation.status === 'accepted' ? 'default' : 'destructive'}>
              {invitation.status === 'accepted' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {invitation.status === 'accepted' ? 'Already Accepted' : 'Revoked'}
              </AlertTitle>
              <AlertDescription>
                {invitation.status === 'accepted'
                  ? 'This invitation has already been accepted. If you still need access, please contact the organization admin.'
                  : 'This invitation has been revoked and is no longer valid. Please contact the organization admin for a new invitation.'}
              </AlertDescription>
            </Alert>
          ) : isExpired ? (
            <Alert variant="destructive">
              <Clock className="h-4 w-4" />
              <AlertTitle>Expired</AlertTitle>
              <AlertDescription>
                This invitation expired{' '}
                {formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}.
                Please contact the organization admin for a new invitation.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Organization</p>
                  <p className="text-lg font-semibold">{invitation.tenantName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <p className="text-lg font-semibold capitalize">{invitation.role}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg font-semibold">{invitation.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expires</p>
                <p className="text-lg font-semibold">
                  {formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}
                </p>
              </div>
              
              {user && !invitationMatchesUser && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Email Mismatch</AlertTitle>
                  <AlertDescription>
                    You're signed in as {user.email}, but this invitation is for {invitation.email}.
                    Please sign in with the correct account.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          {accepted || isProcessed || isExpired ? (
            <Button onClick={() => setLocation('/')}>Return to Home</Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setLocation('/')}
                disabled={acceptInvitationMutation.isPending}
              >
                Decline
              </Button>
              <Button
                onClick={handleAcceptInvitation}
                disabled={
                  acceptInvitationMutation.isPending || (user && !invitationMatchesUser)
                }
              >
                {acceptInvitationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : user ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept Invitation
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in to Accept
                  </>
                )}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}