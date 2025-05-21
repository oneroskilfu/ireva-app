import React, { useEffect } from 'react';
import { useRoute } from 'wouter';
import TenantInvitation from '@/components/tenant/TenantInvitation';
import { Loader2 } from 'lucide-react';

const InvitationPage = () => {
  // Extract token from URL
  const [, params] = useRoute('/invitations/:token');
  const token = params?.token;

  useEffect(() => {
    // Set page title
    document.title = 'Organization Invitation | iREVA';
  }, []);

  // If there's no token, show an error
  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Invalid Invitation</h1>
        <p className="text-muted-foreground mb-6 text-center">
          The invitation link is invalid or has been tampered with.
          Please check the link and try again.
        </p>
        <a
          href="/"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Return to Home
        </a>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Organization Invitation</h1>
        <p className="text-muted-foreground mt-2">
          Join an organization on the iREVA real estate investment platform
        </p>
      </div>

      <TenantInvitation token={token} />
    </div>
  );
};

export default InvitationPage;