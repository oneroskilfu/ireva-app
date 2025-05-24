import React from 'react';
import { Helmet } from 'react-helmet-async';
import MessagingInbox from '@/components/messaging/MessagingInbox';

const MessagesPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Messages | iREVA</title>
      </Helmet>
      
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Chat with property developers, customer support, and other investors
          </p>
        </div>
        
        <div className="bg-card rounded-xl shadow">
          <MessagingInbox />
        </div>
      </div>
    </>
  );
};

export default MessagesPage;