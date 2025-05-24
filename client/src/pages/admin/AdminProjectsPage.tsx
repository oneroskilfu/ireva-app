import { Helmet } from 'react-helmet-async';
import ProjectListAdmin from '@/components/ProjectListAdmin';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import ProjectForm from '@/components/admin/ProjectForm';

const AdminProjectsPage = () => {
  const [isAddingProject, setIsAddingProject] = useState(false);

  return (
    <>
      <Helmet>
        <title>Project Management | iREVA Admin</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor all real estate investment projects.
            </p>
          </div>
          <Button onClick={() => setIsAddingProject(true)} className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4 mr-1" />
            Add New Project
          </Button>
        </div>

        <ProjectListAdmin />

        <Sheet open={isAddingProject} onOpenChange={setIsAddingProject}>
          <SheetContent className="sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add New Project</SheetTitle>
              <SheetDescription>
                Create a new investment project to be listed on the platform.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <ProjectForm 
                onSuccess={() => setIsAddingProject(false)}
                onCancel={() => setIsAddingProject(false)} 
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default AdminProjectsPage;