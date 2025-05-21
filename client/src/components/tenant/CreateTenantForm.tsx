import React from 'react';
import { useNavigate } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { Building2, Loader2 } from 'lucide-react';

// Form validation schema
const tenantFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  domain: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color').optional().or(z.literal('')),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

export default function CreateTenantForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      domain: '',
      primaryColor: '#3B82F6',
    },
  });

  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (data: TenantFormValues) => {
      const res = await apiRequest('POST', '/api/tenants', data);
      return await res.json();
    },
    onSuccess: (data) => {
      // Invalidate tenant list query to refresh it
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
      
      // Show success message
      toast({
        title: 'Organization created',
        description: `${data.name} has been created successfully.`,
      });
      
      // Store selected tenant in local storage for persistence
      localStorage.setItem('selectedTenantId', data.id);
      
      // Navigate to the tenant dashboard
      navigate(`/tenant/${data.id}/dashboard`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create organization',
        description: error.message || 'There was an error creating your organization. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: TenantFormValues) => {
    createTenantMutation.mutate(data);
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Organization</CardTitle>
        <CardDescription>
          Set up your organization for property investments and management
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
                      placeholder="Skyline Investments" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        // Auto-generate slug when name changes
                        if (!form.getValues('slug')) {
                          form.setValue('slug', generateSlug(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your organization's display name
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
                    <Input placeholder="skyline-investments" {...field} />
                  </FormControl>
                  <FormDescription>
                    Used in URLs and must be unique. Only lowercase letters, numbers, and hyphens.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://skylineinvestments.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    If your organization has a website, enter its URL here
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Color</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input type="color" {...field} className="w-12 h-10" />
                    </FormControl>
                    <Input 
                      value={field.value} 
                      onChange={(e) => field.onChange(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <FormDescription>
                    Choose a primary color for your organization's branding
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tenant/select')}
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
                  <>
                    <Building2 className="mr-2 h-4 w-4" />
                    Create Organization
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}