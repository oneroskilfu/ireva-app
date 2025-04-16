import React, { useState } from 'react';
import ProjectTable from '@/components/admin/ProjectTable';
import ProjectForm from '@/components/admin/ProjectForm';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Project } from '@/components/admin/ProjectForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const ProjectListAdmin = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch projects
  const { data: projects, isLoading, isError, refetch } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/projects');
      return await res.json();
    },
  });

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    refetch();
  };

  const handleFormCancel = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  return (
    <Card className="rounded-lg border shadow">
      <CardHeader className="border-b bg-muted/40 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Project Management</CardTitle>
            <CardDescription>
              Create, view, edit, and delete real estate investment projects.
            </CardDescription>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Project
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <ProjectTable 
          onEdit={handleEdit}
          projects={projects || []}
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
        />
      </CardContent>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm 
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <ProjectForm
              initialData={selectedProject}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProjectListAdmin;