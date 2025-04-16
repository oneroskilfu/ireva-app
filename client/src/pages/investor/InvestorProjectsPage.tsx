import { Helmet } from 'react-helmet-async';
import ProjectListInvestor from '@/components/ProjectListInvestor';
import InvestorLayout from '@/components/layouts/InvestorLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { Building, Heart, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const InvestorProjectsPage = () => {
  const { data: stats } = useQuery({
    queryKey: ['/api/investor/stats/projects'],
    enabled: false, // Disabled for now - will enable when API endpoint is ready
  });

  // Example stats - will be replaced with actual API data
  const projectStats = {
    availableProjects: 12,
    investedProjects: 3,
    totalInvestments: '₦2,450,000',
    projectedReturns: '₦3,185,000'
  };

  return (
    <InvestorLayout>
      <Helmet>
        <title>Investment Projects | iREVA Investor</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Projects</h1>
          <p className="text-muted-foreground mt-1">
            Explore available investment opportunities and track your investments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Projects</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.availableProjects}</div>
              <p className="text-xs text-muted-foreground">Projects open for investment</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Investments</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.investedProjects}</div>
              <p className="text-xs text-muted-foreground">Projects you've invested in</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.totalInvestments}</div>
              <p className="text-xs text-muted-foreground">Across all projects</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projected Returns</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.projectedReturns}</div>
              <p className="text-xs text-muted-foreground">Expected upon maturity</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="invested">My Investments</TabsTrigger>
            <TabsTrigger value="saved">Saved Projects</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <ProjectListInvestor />
          </TabsContent>
          <TabsContent value="invested" className="mt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Your Investments</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Projects you've invested in will appear here. Track performance and receive updates.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="saved" className="mt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Saved Projects</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                You haven't saved any projects yet. Click the bookmark icon on any project to save it for later.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </InvestorLayout>
  );
};

export default InvestorProjectsPage;