import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import { Redirect } from 'wouter';

import MessagingInbox from '@/components/messaging/MessagingInbox';

const MessagingPage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <>
      <Helmet>
        <title>Messaging | iREVA</title>
      </Helmet>
      <div className="container max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Messaging Center</h1>
          <p className="text-muted-foreground">
            Communicate with administrators, property developers, and other investors
          </p>
        </div>

        <div className="bg-card rounded-xl shadow">
          <MessagingInbox />
        </div>
      </div>
    </>
  );
};

export default MessagingPage;