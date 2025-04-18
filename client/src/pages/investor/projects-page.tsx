import React from 'react';
import InvestorLayout from '@/components/layouts/InvestorLayout';
import ProjectList from '@/components/Investor/ProjectList';
import { Building } from 'lucide-react';

const ProjectsPage: React.FC = () => {
  return (
    <InvestorLayout>
      <div className="container mx-auto py-6 max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Investment Projects</h1>
          </div>
          <p className="text-muted-foreground mt-1">Discover and invest in premium real estate opportunities across Nigeria</p>
        </header>
        
        <ProjectList />
      </div>
    </InvestorLayout>
  );
};

export default ProjectsPage;