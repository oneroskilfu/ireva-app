import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/use-auth';
import UserSettingsForm from '@/components/settings/UserSettingsForm';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return null; // Don't render anything if not logged in
  }
  
  return (
    <>
      <Helmet>
        <title>Account Settings | iREVA</title>
      </Helmet>
      
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <UserSettingsForm />
      </div>
    </>
  );
};

export default SettingsPage;