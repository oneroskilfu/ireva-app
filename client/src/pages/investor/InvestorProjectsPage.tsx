import React from 'react';
import ProjectListInvestor from '@/components/ProjectListInvestor';
import InvestorLayout from '@/components/layouts/InvestorLayout';

const InvestorProjectsPage = () => {
  return (
    <InvestorLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Investment Opportunities</h1>
        <ProjectListInvestor />
      </div>
    </InvestorLayout>
  );
};

export default InvestorProjectsPage;