import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/components/admin/ProjectForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Search, Info, AlertCircle, MapPin, Building, Clock, DollarSign, TrendingUp, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InvestmentFormData {
  projectId: number;
  amount: number;
}

const ProjectListInvestor = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showInvestDialog, setShowInvestDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);

  // Fetch projects
  const { data: projects, isLoading, isError } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/projects');
      return await res.json();
    },
  });

  // Create investment mutation
  const investMutation = useMutation({
    mutationFn: async (data: InvestmentFormData) => {
      const res = await apiRequest('POST', '/api/investments', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Investment Successful',
        description: 'Your investment has been processed successfully.',
      });
      setShowInvestDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Investment Failed',
        description: error.message || 'There was an error processing your investment. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle invest action
  const handleInvest = (project: Project) => {
    setSelectedProject(project);
    setInvestmentAmount(project.minimumInvestment);
    setShowInvestDialog(true);
  };

  // Confirm investment
  const confirmInvestment = () => {
    if (selectedProject && investmentAmount >= selectedProject.minimumInvestment) {
      investMutation.mutate({
        projectId: selectedProject.id,
        amount: investmentAmount,
      });
    } else {
      toast({
        title: 'Invalid Amount',
        description: `Investment amount must be at least ${formatCurrency(selectedProject?.minimumInvestment || 0)}.`,
        variant: 'destructive',
      });
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter projects based on search term and filters
  const filteredProjects = projects?.filter((project) => {
    const matchesSearch = 
      searchTerm === '' ||
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || project.type === typeFilter;
    const matchesLocation = locationFilter === 'all' || project.location === locationFilter;
    
    return matchesSearch && matchesType && matchesLocation;
  });

  // Get unique locations and types for filters
  const locations = projects ? Array.from(new Set(projects.map(project => project.location))) : [];
  const types = projects ? Array.from(new Set(projects.map(project => project.type))) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[180px]">
                <MapPin className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} className="overflow-hidden">
              <div className="h-48 bg-muted animate-pulse"></div>
              <CardHeader className="animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
              <CardFooter className="animate-pulse">
                <div className="h-9 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-medium mb-2">Failed to Load Projects</h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading the investment projects. Please try again later.
          </p>
          <Button variant="secondary" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/projects'] })}>
            Retry
          </Button>
        </div>
      ) : filteredProjects?.length === 0 ? (
        <div className="text-center py-12">
          <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Projects Found</h3>
          <p className="text-muted-foreground">
            No projects match your current search criteria. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects?.map((project) => (
            <Card key={project.id} className="overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={project.imageUrl} 
                  alt={project.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge variant="secondary" className="capitalize">
                    {project.type}
                  </Badge>
                  {project.accreditedOnly && (
                    <Badge className="bg-amber-500">Accredited Only</Badge>
                  )}
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold line-clamp-1">{project.name}</CardTitle>
                <CardDescription className="flex items-center text-sm">
                  <MapPin className="h-3.5 w-3.5 mr-1 inline" />
                  {project.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2 flex-grow">
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center">
                      <TrendingUp className="h-3.5 w-3.5 mr-1 text-primary" />
                      <span>{project.targetReturn}% returns</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1 text-primary" />
                      <span>{project.term} months</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="h-3.5 w-3.5 mr-1 text-primary" />
                      <span>{project.numberOfInvestors} investors</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Investment Progress</span>
                      <span className="font-medium">
                        {Math.round((project.currentFunding / project.totalFunding) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(project.currentFunding / project.totalFunding) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {formatCurrency(project.currentFunding)} raised
                      </span>
                      <span>
                        Goal: {formatCurrency(project.totalFunding)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-xs text-muted-foreground">Minimum Investment</p>
                    <p className="font-semibold">{formatCurrency(project.minimumInvestment)}</p>
                  </div>
                  <Button
                    onClick={() => handleInvest(project)}
                    className="flex items-center"
                    disabled={project.accreditedOnly}
                  >
                    <DollarSign className="mr-1 h-4 w-4" />
                    Invest Now
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Investment Dialog */}
      <Dialog open={showInvestDialog} onOpenChange={setShowInvestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invest in {selectedProject?.name}</DialogTitle>
            <DialogDescription>
              Please specify the amount you wish to invest in this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Project Summary</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className="text-muted-foreground">Location:</div>
                <div>{selectedProject?.location}</div>
                <div className="text-muted-foreground">Target Return:</div>
                <div>{selectedProject?.targetReturn}%</div>
                <div className="text-muted-foreground">Investment Term:</div>
                <div>{selectedProject?.term} months</div>
                <div className="text-muted-foreground">Minimum Investment:</div>
                <div>{formatCurrency(selectedProject?.minimumInvestment || 0)}</div>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="investment-amount" className="font-medium block">
                Investment Amount
              </label>
              <Input
                id="investment-amount"
                type="number"
                min={selectedProject?.minimumInvestment}
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(parseFloat(e.target.value))}
                className="w-full"
              />
              {selectedProject && investmentAmount < selectedProject.minimumInvestment && (
                <p className="text-xs text-destructive">
                  Amount must be at least {formatCurrency(selectedProject.minimumInvestment)}
                </p>
              )}
            </div>
            <div className="rounded-lg border p-3 bg-muted/50">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Estimated Returns:</span>
                <span className="font-semibold">
                  {selectedProject && formatCurrency(
                    investmentAmount * (parseFloat(selectedProject.targetReturn) / 100) * (selectedProject.term / 12)
                  )}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on the target return rate over the investment term. Actual returns may vary.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowInvestDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmInvestment}
              disabled={investMutation.isPending || (selectedProject ? investmentAmount < selectedProject.minimumInvestment : true)}
            >
              {investMutation.isPending ? "Processing..." : "Confirm Investment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectListInvestor;