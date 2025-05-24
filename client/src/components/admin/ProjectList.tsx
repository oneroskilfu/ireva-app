import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger, 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  PlusCircle, 
  MoreVertical, 
  FileEdit, 
  Eye, 
  Trash2, 
  AlertTriangle,
  MapPin,
  Building,
  DollarSign,
  Users,
  Clock,
  Percent
} from 'lucide-react';

interface Project {
  id: number;
  name: string;
  location: string;
  description: string;
  type: string;
  imageUrl: string;
  totalFunding: number;
  currentFunding: number;
  targetReturn: string;
  numberOfInvestors: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  developerId: number;
  developerName: string;
  createdAt: string;
  updatedAt: string;
}

const ProjectList = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch projects
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/admin/properties'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/properties');
      return await res.json();
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const res = await apiRequest('DELETE', `/api/admin/properties/${projectId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Project Deleted',
        description: 'The project has been successfully deleted.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/properties'] });
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete project: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle view project details
  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setDetailsOpen(true);
  };

  // Handle delete project
  const handleDeleteProject = () => {
    if (selectedProject) {
      deleteMutation.mutate(selectedProject.id);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status: 'draft' | 'active' | 'completed' | 'cancelled') => {
    switch(status) {
      case 'draft':
        return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">Draft</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Filter projects by search query
  const filteredProjects = projects?.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.developerName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Listings</CardTitle>
          <CardDescription>Manage real estate investment properties</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Listings</CardTitle>
          <CardDescription>Manage real estate investment properties</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> Failed to load projects. Please try again later.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Listings</CardTitle>
          <CardDescription>Manage real estate investment properties</CardDescription>
        </div>
        <Button className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          Add New Project
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search projects..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredProjects.length} projects found
            </span>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {projects?.length === 0 ? 
              "No projects have been created yet." : 
              "No projects match your search."}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Funding Target</TableHead>
                  <TableHead>Current Funding</TableHead>
                  <TableHead>ROI</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md overflow-hidden">
                          <img 
                            src={project.imageUrl} 
                            alt={project.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground">{project.type}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{project.location}</TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>{formatCurrency(project.totalFunding)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatCurrency(project.currentFunding)}</span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round((project.currentFunding / project.totalFunding) * 100)}% funded
                        </span>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${Math.round((project.currentFunding / project.totalFunding) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{project.targetReturn}%</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(project)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileEdit className="h-4 w-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setSelectedProject(project);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Project Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Project Details</DialogTitle>
              <DialogDescription>
                Complete information about the selected project.
              </DialogDescription>
            </DialogHeader>
            
            {selectedProject && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="relative h-48 rounded-md overflow-hidden">
                    <img 
                      src={selectedProject.imageUrl} 
                      alt={selectedProject.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(selectedProject.status)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{selectedProject.name}</h3>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedProject.location}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span>{selectedProject.type}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                    <p className="text-sm">{selectedProject.description || 'No description provided.'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Developer</h4>
                    <p className="text-sm font-medium">{selectedProject.developerName}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs">Target Funding</span>
                      </div>
                      <p className="text-lg font-semibold">{formatCurrency(selectedProject.totalFunding)}</p>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs">Current Funding</span>
                      </div>
                      <p className="text-lg font-semibold">{formatCurrency(selectedProject.currentFunding)}</p>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                        <Percent className="h-4 w-4" />
                        <span className="text-xs">Target ROI</span>
                      </div>
                      <p className="text-lg font-semibold">{selectedProject.targetReturn}%</p>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="text-xs">Investors</span>
                      </div>
                      <p className="text-lg font-semibold">{selectedProject.numberOfInvestors}</p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-3">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Funding Progress</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{Math.round((selectedProject.currentFunding / selectedProject.totalFunding) * 100)}% Funded</span>
                        <span>{formatCurrency(selectedProject.currentFunding)} of {formatCurrency(selectedProject.totalFunding)}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${Math.round((selectedProject.currentFunding / selectedProject.totalFunding) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(selectedProject.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{new Date(selectedProject.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
              <Button variant="default">
                <FileEdit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this project? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center p-4 bg-amber-50 rounded-md text-amber-800 gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <p className="text-sm">
                This will remove all project information and may impact investor dashboards.
              </p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteProject}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProjectList;