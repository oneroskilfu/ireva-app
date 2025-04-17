import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ProjectTable from '@/components/admin/ProjectTable';
import { AlertCircle, Edit, Trash2, Eye } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import ProjectForm from '@/components/admin/ProjectForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

const ProjectListAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProject, setEditingProject] = useState<any>(null);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [viewingProject, setViewingProject] = useState<any>(null);

  // Use the real API endpoint that's now working
  const { data: projects, isLoading, isError, refetch } = useQuery<any[]>({
    queryKey: ['/api/properties'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/properties/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete project');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: 'Project Deleted',
        description: 'The project has been successfully deleted.',
      });
      setProjectToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleView = (project: any) => {
    setViewingProject(project);
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
  };

  const handleDelete = (project: any) => {
    setProjectToDelete(project);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteMutation.mutate(projectToDelete.id);
    }
  };

  const actions = [
    {
      icon: <Eye className="h-4 w-4" />,
      label: 'View',
      onClick: handleView,
    },
    {
      icon: <Edit className="h-4 w-4" />,
      label: 'Edit',
      onClick: handleEdit,
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      label: 'Delete',
      onClick: handleDelete,
    },
  ];

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive opacity-75" />
        <h3 className="mt-4 text-lg font-semibold">Failed to Load Projects</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          There was an error loading the project data. Please try again later.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <ProjectTable
        data={Array.isArray(projects) ? projects : []}
        isLoading={isLoading}
        actions={actions}
      />

      {/* Edit Project Modal */}
      <Sheet open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Project</SheetTitle>
            <SheetDescription>
              Make changes to the project information.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {editingProject && (
              <ProjectForm
                project={editingProject}
                onSuccess={() => {
                  setEditingProject(null);
                  queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
                }}
                onCancel={() => setEditingProject(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* View Project Modal */}
      <Sheet open={!!viewingProject} onOpenChange={(open) => !open && setViewingProject(null)}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{viewingProject?.name}</SheetTitle>
            <SheetDescription>
              Project details and information.
            </SheetDescription>
          </SheetHeader>
          {viewingProject && (
            <div className="mt-6 space-y-6">
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                <img
                  src={viewingProject.imageUrl}
                  alt={viewingProject.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="mt-1">{viewingProject.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                    <p className="mt-1">{viewingProject.location}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                    <p className="mt-1 capitalize">{viewingProject.type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Target Return</h3>
                    <p className="mt-1">{viewingProject.targetReturn}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Term</h3>
                    <p className="mt-1">{viewingProject.term} months</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Minimum Investment</h3>
                    <p className="mt-1">₦{viewingProject.minimumInvestment.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Funding Goal</h3>
                    <p className="mt-1">₦{viewingProject.totalFunding.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Current Funding</h3>
                    <p className="mt-1">₦{viewingProject.currentFunding.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Investors</h3>
                    <p className="mt-1">{viewingProject.numberOfInvestors}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Amenities</h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {viewingProject.amenities.map((amenity: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Developer</h3>
                  <p className="mt-1">{viewingProject.developer}</p>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setViewingProject(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              "{projectToDelete?.name}" and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectListAdmin;