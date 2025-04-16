import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Define the form schema with validation rules
const projectSchema = z.object({
  name: z.string().min(3, { message: 'Project name must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  location: z.string().min(2, { message: 'Location is required' }),
  type: z.enum(['residential', 'commercial', 'industrial', 'mixed-use', 'land']),
  imageUrl: z.string().url({ message: 'Please enter a valid URL for the image' }),
  targetReturn: z.string().refine((val) => !isNaN(parseFloat(val)), {
    message: 'Target return must be a number',
  }),
  term: z.number().min(1, { message: 'Term must be at least 1 month' }),
  minimumInvestment: z.number().min(1000, { message: 'Minimum investment must be at least ₦1,000' }),
  totalFunding: z.number().min(10000, { message: 'Total funding must be at least ₦10,000' }),
  currentFunding: z.number().min(0, { message: 'Current funding cannot be negative' }),
  numberOfInvestors: z.number().min(0, { message: 'Number of investors cannot be negative' }),
  developer: z.string().min(2, { message: 'Developer name is required' }),
  accreditedOnly: z.boolean().default(false),
  amenities: z.string().transform((val) => 
    val.split(',').map(item => item.trim()).filter(Boolean)
  ),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProjectForm = ({ project, onSuccess, onCancel }: ProjectFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values or existing project data
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: project ? {
      ...project,
      amenities: project.amenities ? project.amenities.join(', ') : '',
    } : {
      name: '',
      description: '',
      location: '',
      type: 'residential',
      imageUrl: '',
      targetReturn: '',
      term: 12,
      minimumInvestment: 50000,
      totalFunding: 1000000,
      currentFunding: 0,
      numberOfInvestors: 0,
      developer: '',
      accreditedOnly: false,
      amenities: '',
    },
  });

  // Create or update project mutation
  const mutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      setIsSubmitting(true);
      try {
        // If project exists, update it, otherwise create new
        const url = project ? `/api/projects/${project.id}` : '/api/projects';
        const method = project ? 'PUT' : 'POST';
        
        const response = await apiRequest(method, url, data);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save project');
        }
        
        return await response.json();
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: project ? 'Project Updated' : 'Project Created',
        description: project 
          ? 'The project has been successfully updated.' 
          : 'The project has been successfully created.',
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Input placeholder="e.g., Lagos, Abuja" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide a detailed description of the project" 
                  rows={4}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="financial-details">
            <AccordionTrigger>Financial Details</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="targetReturn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Return (%)</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="e.g., 12.5" {...field} />
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
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minimumInvestment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Investment (₦)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))} 
                          />
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
                        <FormLabel>Total Funding Goal (₦)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currentFunding"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Funding (₦)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numberOfInvestors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Investors</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="additional-info">
            <AccordionTrigger>Additional Information</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="developer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Developer</FormLabel>
                      <FormControl>
                        <Input placeholder="Name of the developer/company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amenities</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Pool, Gym, Security, etc. (comma-separated)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accreditedOnly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Accredited Investors Only</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Restrict this project to accredited investors only.
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectForm;