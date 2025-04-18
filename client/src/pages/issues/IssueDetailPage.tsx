import React from 'react';
import { useRoute } from 'wouter';
import { Helmet } from 'react-helmet-async';
import IssueDetail from '@/components/issues/IssueDetail';

const IssueDetailPage: React.FC = () => {
  // Extract issue ID from URL
  const [match, params] = useRoute<{ id: string }>('/issues/:id');
  const issueId = match ? parseInt(params.id, 10) : 0;
  
  return (
    <>
      <Helmet>
        <title>Issue #{issueId} | iREVA</title>
      </Helmet>
      
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <IssueDetail issueId={issueId} />
      </div>
    </>
  );
};

export default IssueDetailPage;