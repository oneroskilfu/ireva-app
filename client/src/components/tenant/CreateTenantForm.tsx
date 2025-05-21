import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Form validation schema
const tenantFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug cannot be longer than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  industry: z.string().optional(),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

// Default form values
const defaultValues: Partial<TenantFormValues> = {
  name: '',
  slug: '',
  description: '',
  website: '',
  industry: '',
};

export default function CreateTenantForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Initialize form
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues,
  });
  
  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  };
  
  // Handle name change to auto-generate slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = generateSlug(name);
    form.setValue('slug', slug);
  };
  
  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (data: TenantFormValues) => {
      const res = await apiRequest('POST', '/api/tenants', data);
      return await res.json();
    },
    
    onSuccess: (data) => {
      toast({
        title: 'Organization created',
        description: `${data.name} has been created successfully.`,
      });
      
      // Invalidate tenants query to refresh the tenant list
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
      
      // Store selected tenant in local storage for persistence
      localStorage.setItem('selectedTenantId', data.id);
      
      // Navigate to the tenant dashboard
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
  
  // Form submission handler
  const onSubmit = (data: TenantFormValues) => {
    createTenantMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Organization</CardTitle>
        <CardDescription>
          Create a new organization for your properties and investments.
          Each organization has its own separate dashboard, properties, and users.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e);
                      }}
                      placeholder="Acme Real Estate"
                      disabled={createTenantMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="acme-real-estate"
                      disabled={createTenantMutation.isPending}
                    />
                  </FormControl>
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
                      {...field}
                      placeholder="Tell us about your organization"
                      className="min-h-24"
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
                        {...field}
                        placeholder="https://example.com"
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
                        {...field}
                        placeholder="Real Estate, Construction, etc."
                        disabled={createTenantMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/tenant/select')}
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
                ) : 'Create Organization'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}