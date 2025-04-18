import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';
import IssueForm from '@/components/issues/IssueForm';

const NewIssuePage: React.FC = () => {
  const [, setLocation] = useLocation();
  
  // Handle successful form submission
  const handleSuccess = () => {
    // Redirect to issues list after successful submission
    setTimeout(() => {
      setLocation('/issues');
    }, 1500); // Small delay to allow for success message to be seen
  };
  
  return (
    <>
      <Helmet>
        <title>Report New Issue | iREVA</title>
      </Helmet>
      
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <IssueForm onSuccess={handleSuccess} />
      </div>
    </>
  );
};

export default NewIssuePage;