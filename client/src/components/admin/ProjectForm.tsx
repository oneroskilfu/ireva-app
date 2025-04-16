import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
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
import { Switch } from '@/components/ui/switch';
import { Loader } from 'lucide-react';

// Define Project type and form schema
export interface Project {
  id: number;
  name: string;
  location: string;
  description: string;
  type: 'residential' | 'commercial' | 'industrial' | 'mixed-use' | 'land';
  imageUrl: string;
  imageGallery?: string[];
  videoUrl?: string | null;
  tier: 'standard' | 'premium' | 'elite';
  targetReturn: string;
  minimumInvestment: number;
  term: number;
  totalFunding: number;
  currentFunding: number;
  numberOfInvestors: number;
  daysLeft: number;
  accreditedOnly: boolean;
}

const projectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  location: z.string().min(2, 'Location is required'),
  description: z.string().min(20, 'Please provide a detailed description'),
  type: z.enum(['residential', 'commercial', 'industrial', 'mixed-use', 'land']),
  imageUrl: z.string().url('Please provide a valid image URL'),
  imageGallery: z.array(z.string().url()).optional(),
  videoUrl: z.string().url().nullable().optional(),
  tier: z.enum(['standard', 'premium', 'elite']),
  targetReturn: z.string(),
  minimumInvestment: z.coerce.number().positive('Must be a positive number'),
  term: z.coerce.number().positive('Must be a positive number'),
  totalFunding: z.coerce.number().positive('Must be a positive number'),
  currentFunding: z.coerce.number().nonnegative('Must be a non-negative number'),
  numberOfInvestors: z.coerce.number().nonnegative('Must be a non-negative number'),
  daysLeft: z.coerce.number().nonnegative('Must be a non-negative number'),
  accreditedOnly: z.boolean().default(false),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData?: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const isEditing = !!initialData;

  // Initialize form with default values or existing project data
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData || {
      name: '',
      location: '',
      description: '',
      type: 'residential',
      imageUrl: '',
      imageGallery: [],
      videoUrl: null,
      tier: 'standard',
      targetReturn: '',
      minimumInvestment: 0,
      term: 0,
      totalFunding: 0,
      currentFunding: 0,
      numberOfInvestors: 0,
      daysLeft: 0,
      accreditedOnly: false,
    },
  });

  // Create or update project mutation
  const mutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      if (isEditing && initialData) {
        const res = await apiRequest('PATCH', `/api/projects/${initialData.id}`, data);
        return res.json();
      } else {
        const res = await apiRequest('POST', '/api/projects', data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: isEditing ? 'Project Updated' : 'Project Created',
        description: isEditing
          ? 'The project has been successfully updated.'
          : 'The project has been successfully created.',
      });
      onSuccess();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} project.`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name*</FormLabel>
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
                <FormLabel>Location*</FormLabel>
                <FormControl>
                  <Input placeholder="City, State" {...field} />
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
                <FormLabel>Property Type*</FormLabel>
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
                <FormLabel>Investment Tier*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select investment tier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetReturn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Return (%)* </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 12.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minimumInvestment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Investment (₦)*</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 100000" {...field} />
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
                <FormLabel>Investment Term (months)*</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 36" {...field} />
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
                <FormLabel>Total Funding Required (₦)*</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 5000000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentFunding"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Funding (₦)*</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 2500000" {...field} />
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
                  <Input type="number" placeholder="e.g. 45" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="daysLeft"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Days Left</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Image URL*</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/video.mp4" 
                    value={field.value || ''} 
                    onChange={(e) => field.onChange(e.target.value || null)}
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
                    Restrict this project to accredited investors only
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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a detailed description of the project"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update Project' : 'Create Project'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectForm;