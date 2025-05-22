import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2 } from 'lucide-react';

// Form schema with validation
const createTenantSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).max(100),
  slug: z
    .string()
    .min(2, { message: 'Slug must be at least 2 characters' })
    .max(50)
    .regex(/^[a-z0-9-]+$/, {
      message: 'Slug can only contain lowercase letters, numbers, and hyphens',
    }),
  description: z.string().max(500).optional(),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  industry: z.string().max(100).optional(),
});

type CreateTenantFormValues = z.infer<typeof createTenantSchema>;

export default function CreateTenantForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [slugEdited, setSlugEdited] = useState(false);

  // Initialize form with default values
  const form = useForm<CreateTenantFormValues>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      website: '',
      industry: '',
    },
  });

  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (data: CreateTenantFormValues) => {
      const res = await apiRequest('POST', '/api/tenants', data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Organization created',
        description: 'Your organization has been created successfully.',
      });
      
      // Invalidate tenants query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
      
      // Redirect to the new tenant dashboard
      setLocation(`/tenant/${data.id}/dashboard`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create organization',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: CreateTenantFormValues) => {
    createTenantMutation.mutate(data);
  };

  // Auto-generate slug from name if slug hasn't been manually edited
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);
    
    if (!slugEdited) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      
      form.setValue('slug', slug);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Create New Organization
        </CardTitle>
        <CardDescription>
          Set up a new organization for your real estate investment projects
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Properties"
                      {...field}
                      onChange={handleNameChange}
                      disabled={createTenantMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    The name of your organization as it will appear to users
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="acme-properties"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setSlugEdited(true);
                      }}
                      disabled={createTenantMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Used in URLs: yoursite.com/tenant/{form.watch('slug') || 'acme-properties'}
                  </FormDescription>
                  <FormMessage />
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
                      placeholder="A brief description of your organization"
                      className="resize-none"
                      {...field}
                      disabled={createTenantMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        {...field}
                        disabled={createTenantMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Real Estate Investment"
                        {...field}
                        disabled={createTenantMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/')}
              disabled={createTenantMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTenantMutation.isPending}
            >
              {createTenantMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Organization'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}