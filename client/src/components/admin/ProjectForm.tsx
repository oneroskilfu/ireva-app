import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

// Define project interface
interface Project {
  id: number;
  name: string;
  location: string;
  description: string;
  type: string;
  imageUrl: string;
  tier: string;
  targetReturn: string;
  minimumInvestment: number;
  totalFunding: number;
  currentFunding: number;
  numberOfInvestors: number;
  daysLeft: number;
}

// Define form schema
const projectFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['residential', 'commercial', 'industrial', 'mixed-use', 'land']),
  imageUrl: z.string().url('Please enter a valid image URL'),
  tier: z.enum(['starter', 'growth', 'premium', 'elite']),
  targetReturn: z.string().min(1, 'Target return is required'),
  minimumInvestment: z.coerce.number().min(1000, 'Minimum investment must be at least 1,000'),
  totalFunding: z.coerce.number().min(100000, 'Total funding must be at least 100,000'),
  currentFunding: z.coerce.number().default(0).optional(),
  numberOfInvestors: z.coerce.number().default(0).optional(),
  daysLeft: z.coerce.number().min(1, 'Days left must be at least 1'),
  accreditedOnly: z.boolean().default(false),
  term: z.coerce.number().min(1, 'Term must be at least 1 month'),
  developer: z.string().min(2, 'Developer name must be at least 2 characters'),
  riskLevel: z.enum(['low', 'medium', 'high']),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  project?: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSuccess, onCancel }) => {
  const { toast } = useToast();

  // Default values for the form
  const defaultValues: Partial<ProjectFormValues> = {
    name: project?.name || '',
    location: project?.location || '',
    description: project?.description || '',
    type: (project?.type as any) || 'residential',
    imageUrl: project?.imageUrl || '',
    tier: (project?.tier as any) || 'starter',
    targetReturn: project?.targetReturn || '',
    minimumInvestment: project?.minimumInvestment || 10000,
    totalFunding: project?.totalFunding || 100000,
    currentFunding: project?.currentFunding || 0,
    numberOfInvestors: project?.numberOfInvestors || 0,
    daysLeft: project?.daysLeft || 30,
    accreditedOnly: false,
    term: 12,
    developer: '',
    riskLevel: 'medium',
  };

  // Initialize form
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      const response = await apiRequest('POST', '/api/projects', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Project Created',
        description: 'The project has been successfully created.',
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Create Project',
        description: error.message || 'An error occurred while creating the project.',
        variant: 'destructive',
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormValues & { id: number }) => {
      const response = await apiRequest('PUT', `/api/projects/${data.id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Project Updated',
        description: 'The project has been successfully updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Project',
        description: error.message || 'An error occurred while updating the project.',
        variant: 'destructive',
      });
    },
  });

  // Submit handler
  const onSubmit = (data: ProjectFormValues) => {
    if (project?.id) {
      updateProjectMutation.mutate({ ...data, id: project.id });
    } else {
      createProjectMutation.mutate(data);
    }
  };

  // Check if form is submitting
  const isSubmitting = createProjectMutation.isPending || updateProjectMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter project name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter project location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="mixed-use">Mixed-Use</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Investment Tier</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select investment tier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Determines the minimum investment and target audience
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="Enter image URL" {...field} />
                </FormControl>
                <FormDescription>Main image for the property listing</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetReturn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Return (%)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 12.5" {...field} />
                </FormControl>
                <FormDescription>Annual return percentage</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minimumInvestment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Investment</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter amount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalFunding"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Funding Target</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter amount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="term"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Investment Term (months)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter months" {...field} />
                </FormControl>
                <FormDescription>
                  How long the investment will last
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="daysLeft"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Days Left for Funding</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter days" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="developer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Developer</FormLabel>
                <FormControl>
                  <Input placeholder="Enter developer name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="riskLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Risk Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="accreditedOnly"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Accredited Investors Only</FormLabel>
                <FormDescription>
                  Restrict this investment to accredited investors only
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter detailed project description"
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectForm;