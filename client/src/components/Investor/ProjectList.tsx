import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, MapPin, TrendingUp, Calendar, Users, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface Project {
  id: number;
  title: string;
  description: string;
  type: string;
  location: string;
  totalFunding: number;
  fundingRaised: number;
  roi: number;
  maturityPeriod: number;
  imageUrl: string;
  availableUnits: number;
  totalUnits: number;
  status: 'active' | 'fully_funded' | 'completed' | 'coming_soon';
  startDate: string;
  endDate: string;
  investorCount: number;
  minimumInvestment: number;
  featured: boolean;
}

const ProjectList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-10 w-10 text-red-500" />}
        title="Error loading projects"
        description="We couldn't load the investment projects. Please try again later."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  if (!projects?.length) {
    return (
      <EmptyState
        icon={<Building className="h-10 w-10 text-muted-foreground" />}
        title="No projects available"
        description="There are currently no investment projects available. Please check back soon for new opportunities."
      />
    );
  }

  const filteredProjects = projects.filter(project => {
    // Filter by tab (project status)
    const matchesTab = activeTab === 'all' || 
                        (activeTab === 'active' && project.status === 'active') ||
                        (activeTab === 'coming_soon' && project.status === 'coming_soon') ||
                        (activeTab === 'fully_funded' && project.status === 'fully_funded') ||
                        (activeTab === 'completed' && project.status === 'completed');
    
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
                          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const getProgressVariant = (percentage: number) => {
    if (percentage < 30) return "bg-red-500";
    if (percentage < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'fully_funded':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Fully Funded</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Completed</Badge>;
      case 'coming_soon':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Coming Soon</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investment Projects</h2>
          <p className="text-muted-foreground">Discover and invest in premium real estate opportunities</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full md:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="coming_soon">Coming Soon</TabsTrigger>
          <TabsTrigger value="fully_funded">Fully Funded</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {filteredProjects.length === 0 ? (
            <EmptyState
              icon={<Building className="h-10 w-10 text-muted-foreground" />}
              title={`No ${activeTab !== 'all' ? activeTab.replace('_', ' ') : ''} projects found`}
              description={`There are no ${activeTab !== 'all' ? activeTab.replace('_', ' ') : ''} projects matching your search criteria.`}
              action={
                searchQuery ? 
                <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button> : 
                undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const fundingPercentage = Math.round((project.fundingRaised / project.totalFunding) * 100);
                
                return (
                  <Card key={project.id} className="overflow-hidden h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      {project.featured && (
                        <Badge className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground">
                          Featured
                        </Badge>
                      )}
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-bold line-clamp-1">{project.title}</CardTitle>
                        {getStatusBadge(project.status)}
                      </div>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" /> 
                        {project.location}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-grow">
                      <p className="text-sm line-clamp-2 mb-4">{project.description}</p>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{fundingPercentage}%</span>
                          </div>
                          <Progress 
                            value={fundingPercentage} 
                            className="h-2"
                            indicatorClassName={getProgressVariant(fundingPercentage)}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-muted/50 p-2 rounded-md">
                            <div className="text-xs text-muted-foreground">ROI (Annual)</div>
                            <div className="font-semibold flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                              {project.roi}%
                            </div>
                          </div>
                          
                          <div className="bg-muted/50 p-2 rounded-md">
                            <div className="text-xs text-muted-foreground">Maturity</div>
                            <div className="font-semibold flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-blue-600" />
                              {project.maturityPeriod} years
                            </div>
                          </div>
                          
                          <div className="bg-muted/50 p-2 rounded-md">
                            <div className="text-xs text-muted-foreground">Min. Investment</div>
                            <div className="font-semibold">₦{project.minimumInvestment.toLocaleString()}</div>
                          </div>
                          
                          <div className="bg-muted/50 p-2 rounded-md">
                            <div className="text-xs text-muted-foreground">Investors</div>
                            <div className="font-semibold flex items-center">
                              <Users className="h-3 w-3 mr-1 text-primary" />
                              {project.investorCount}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Link href={`/investor/projects/${project.id}`}>
                        <Button className="w-full" disabled={project.status !== 'active'}>
                          {project.status === 'active' ? 'Invest Now' : 
                           project.status === 'coming_soon' ? 'Coming Soon' : 
                           project.status === 'fully_funded' ? 'Fully Funded' : 'Completed'}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectList;