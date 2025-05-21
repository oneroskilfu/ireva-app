import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Building2, Loader2, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Tenant schema
const tenantFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  domain: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color').optional().or(z.literal('')),
  logo: z.string().optional().or(z.literal('')),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo?: string;
  primaryColor?: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  subscriptionExpiresAt?: string;
  maxUsers: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TenantSettings() {
  const { tenantId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');

  // Fetch tenant data
  const {
    data: tenant,
    isLoading,
    error,
  } = useQuery<Tenant>({
    queryKey: [`/api/tenants/${tenantId}`],
    enabled: !!tenantId,
  });

  // Form setup
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      domain: '',
      primaryColor: '#3B82F6',
      logo: '',
    },
    values: tenant
      ? {
          name: tenant.name,
          slug: tenant.slug,
          domain: tenant.domain || '',
          primaryColor: tenant.primaryColor || '#3B82F6',
          logo: tenant.logo || '',
        }
      : undefined,
  });

  // Update tenant mutation
  const updateTenantMutation = useMutation({
    mutationFn: async (data: TenantFormValues) => {
      const res = await apiRequest('PUT', `/api/tenants/${tenantId}`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      // Invalidate tenant query to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/tenants/${tenantId}`] });
      
      // Show success message
      toast({
        title: 'Settings updated',
        description: 'Organization settings have been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update settings',
        description: error.message || 'There was an error updating the organization settings. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: TenantFormValues) => {
    updateTenantMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="w-full p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was an error loading the organization settings. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Organization Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage your organization's basic information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
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
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          If your organization has a website, enter its URL here
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateTenantMutation.isPending}
                  >
                    {updateTenantMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="branding">
              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                  <CardDescription>
                    Customize your organization's visual identity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter a URL to your organization's logo
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
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateTenantMutation.isPending}
                  >
                    {updateTenantMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                  <CardDescription>
                    Manage your organization's subscription plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="font-medium">Current Plan</span>
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm capitalize">
                        {tenant.subscriptionTier}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="font-medium">Status</span>
                      <span className={`px-2 py-1 rounded-full ${
                        tenant.subscriptionStatus === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      } font-medium text-sm capitalize`}>
                        {tenant.subscriptionStatus}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="font-medium">User Limit</span>
                      <span>{tenant.maxUsers} users</span>
                    </div>
                    
                    {tenant.subscriptionExpiresAt && (
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="font-medium">Expires</span>
                        <span>{new Date(tenant.subscriptionExpiresAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Subscription management will be available soon.
                  </div>
                  <Button type="button" variant="outline" disabled>
                    Upgrade Plan
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}