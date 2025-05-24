import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { 
  Building, 
  Paintbrush, 
  Cog, 
  Globe, 
  Mail, 
  Check,
  Loader2,
  PlugZap,
  Shield,
  BellRing
} from "lucide-react";

// Theme Schema
const themeSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Please enter a valid hex color code (e.g., #2563eb)"
  }).optional(),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Please enter a valid hex color code (e.g., #4f46e5)"
  }).optional(),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Please enter a valid hex color code (e.g., #22c55e)"
  }).optional(),
  logoUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  font: z.string().optional(),
  isDarkMode: z.boolean().optional(),
  customCss: z.string().optional(),
});

// Features Schema
const featuresSchema = z.object({
  kycVerification: z.boolean().default(true),
  investorDashboard: z.boolean().default(true),
  adminDashboard: z.boolean().default(true),
  walletManagement: z.boolean().default(true),
  documentManagement: z.boolean().default(true),
  multiCurrency: z.boolean().default(false),
  apiAccess: z.boolean().default(false),
  whiteLabel: z.boolean().default(false),
  advancedAnalytics: z.boolean().default(false),
  customIntegrations: z.boolean().default(false),
});

// Settings form schema
const settingsFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  status: z.string(),
  tier: z.string(),
  primaryContactName: z.string().min(2, "Contact name must be at least 2 characters"),
  primaryContactEmail: z.string().email("Please enter a valid email address"),
  primaryContactPhone: z.string().optional(),
  billingEmail: z.string().email("Please enter a valid email address").optional().or(z.literal('')),
  billingAddress: z.string().optional(),
  customDomain: z.string().optional(),
  theme: themeSchema.optional(),
  features: featuresSchema.optional(),
});

interface TenantSettingsFormProps {
  tenantId: string;
  initialData: any;
}

const TenantSettingsForm: React.FC<TenantSettingsFormProps> = ({
  tenantId,
  initialData,
}) => {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Create form
  const form = useForm<z.infer<typeof settingsFormSchema>>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      status: initialData?.status || 'active',
      tier: initialData?.tier || 'basic',
      primaryContactName: initialData?.primaryContactName || '',
      primaryContactEmail: initialData?.primaryContactEmail || '',
      primaryContactPhone: initialData?.primaryContactPhone || '',
      billingEmail: initialData?.billingEmail || '',
      billingAddress: initialData?.billingAddress || '',
      customDomain: initialData?.customDomain || '',
      theme: {
        primaryColor: initialData?.theme?.primaryColor || '#2563eb',
        secondaryColor: initialData?.theme?.secondaryColor || '',
        accentColor: initialData?.theme?.accentColor || '',
        logoUrl: initialData?.theme?.logoUrl || '',
        font: initialData?.theme?.font || 'Inter',
        isDarkMode: initialData?.theme?.isDarkMode || false,
        customCss: initialData?.theme?.customCss || '',
      },
      features: {
        kycVerification: initialData?.features?.kycVerification ?? true,
        investorDashboard: initialData?.features?.investorDashboard ?? true,
        adminDashboard: initialData?.features?.adminDashboard ?? true,
        walletManagement: initialData?.features?.walletManagement ?? true,
        documentManagement: initialData?.features?.documentManagement ?? true,
        multiCurrency: initialData?.features?.multiCurrency ?? false,
        apiAccess: initialData?.features?.apiAccess ?? false,
        whiteLabel: initialData?.features?.whiteLabel ?? false,
        advancedAnalytics: initialData?.features?.advancedAnalytics ?? false,
        customIntegrations: initialData?.features?.customIntegrations ?? false,
      },
    },
  });
  
  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        slug: initialData.slug || '',
        status: initialData.status || 'active',
        tier: initialData.tier || 'basic',
        primaryContactName: initialData.primaryContactName || '',
        primaryContactEmail: initialData.primaryContactEmail || '',
        primaryContactPhone: initialData.primaryContactPhone || '',
        billingEmail: initialData.billingEmail || '',
        billingAddress: initialData.billingAddress || '',
        customDomain: initialData.customDomain || '',
        theme: {
          primaryColor: initialData.theme?.primaryColor || '#2563eb',
          secondaryColor: initialData.theme?.secondaryColor || '',
          accentColor: initialData.theme?.accentColor || '',
          logoUrl: initialData.theme?.logoUrl || '',
          font: initialData.theme?.font || 'Inter',
          isDarkMode: initialData.theme?.isDarkMode || false,
          customCss: initialData.theme?.customCss || '',
        },
        features: {
          kycVerification: initialData.features?.kycVerification ?? true,
          investorDashboard: initialData.features?.investorDashboard ?? true,
          adminDashboard: initialData.features?.adminDashboard ?? true,
          walletManagement: initialData.features?.walletManagement ?? true,
          documentManagement: initialData.features?.documentManagement ?? true,
          multiCurrency: initialData.features?.multiCurrency ?? false,
          apiAccess: initialData.features?.apiAccess ?? false,
          whiteLabel: initialData.features?.whiteLabel ?? false,
          advancedAnalytics: initialData.features?.advancedAnalytics ?? false,
          customIntegrations: initialData.features?.customIntegrations ?? false,
        },
      });
    }
  }, [initialData, form]);
  
  // Update tenant mutation
  const updateTenantMutation = useMutation({
    mutationFn: async (data: z.infer<typeof settingsFormSchema>) => {
      const res = await apiRequest('PUT', `/api/admin/tenants/${tenantId}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update tenant settings');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Settings updated',
        description: 'The tenant settings have been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/tenants/${tenantId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update settings',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof settingsFormSchema>) => {
    updateTenantMutation.mutate(data);
  };
  
  // Dynamic CSS preview based on theme settings
  const getThemePreview = () => {
    const primaryColor = form.watch('theme.primaryColor') || '#2563eb';
    const secondaryColor = form.watch('theme.secondaryColor') || '#4f46e5';
    const accentColor = form.watch('theme.accentColor') || '#22c55e';
    const isDarkMode = form.watch('theme.isDarkMode');
    
    return {
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      color: isDarkMode ? '#f3f4f6' : '#1f2937',
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      primaryBg: primaryColor,
      primaryText: '#ffffff',
      secondaryBg: secondaryColor,
      accentBg: accentColor,
      accentText: '#ffffff',
    };
  };
  
  const themePreview = getThemePreview();
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full mb-8">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Paintbrush className="h-4 w-4" />
              <span className="hidden sm:inline">Branding</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <PlugZap className="h-4 w-4" />
              <span className="hidden sm:inline">Features</span>
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center gap-2">
              <Cog className="h-4 w-4" />
              <span className="hidden sm:inline">Integration</span>
            </TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Organization name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The display name of your organization
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
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="organization-slug" {...field} />
                    </FormControl>
                    <FormDescription>
                      Used in URLs. Only lowercase letters, numbers, and hyphens.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                        <option value="pending">Pending</option>
                        <option value="trial">Trial</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      The current status of this organization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Tier</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="free">Free</option>
                        <option value="basic">Basic</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      The subscription tier determines available features
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Primary Contact</h3>
              <p className="text-sm text-muted-foreground">
                Who should we contact regarding this organization?
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="primaryContactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="primaryContactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email *</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="primaryContactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Billing Information</h3>
              <p className="text-sm text-muted-foreground">
                Used for invoicing and subscription management
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="billingEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Email</FormLabel>
                    <FormControl>
                      <Input placeholder="billing@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave blank to use primary contact email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="billingAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter billing address" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          {/* Branding Settings */}
          <TabsContent value="branding" className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Appearance & Branding</h3>
              <p className="text-sm text-muted-foreground">
                Customize how your organization appears to your users
              </p>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Theme Preview</CardTitle>
                <CardDescription>
                  A live preview of your theme settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="p-6 rounded-md border"
                  style={{ 
                    backgroundColor: themePreview.backgroundColor,
                    color: themePreview.color,
                    borderColor: themePreview.borderColor
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-md flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: themePreview.primaryBg }}
                      >
                        Logo
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{form.watch('name') || 'Organization Name'}</h3>
                        <p className="text-sm opacity-70">Customized branding preview</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        className="px-3 py-1 rounded-md text-sm font-medium text-white"
                        style={{ backgroundColor: themePreview.primaryBg }}
                      >
                        Primary Button
                      </button>
                      
                      <button 
                        className="px-3 py-1 rounded-md text-sm font-medium text-white"
                        style={{ backgroundColor: themePreview.secondaryBg }}
                      >
                        Secondary Button
                      </button>
                      
                      <button 
                        className="px-3 py-1 rounded-md text-sm font-medium text-white"
                        style={{ backgroundColor: themePreview.accentBg }}
                      >
                        Accent Button
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="theme.primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input placeholder="#2563eb" {...field} />
                      </FormControl>
                      <div 
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: field.value || '#2563eb' }}
                      />
                    </div>
                    <FormDescription>
                      Main brand color (hex format, e.g. #2563eb)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="theme.secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Color</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input placeholder="#4f46e5" {...field} />
                      </FormControl>
                      <div 
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: field.value || '#4f46e5' }}
                      />
                    </div>
                    <FormDescription>
                      Secondary color (hex format)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="theme.accentColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accent Color</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input placeholder="#22c55e" {...field} />
                      </FormControl>
                      <div 
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: field.value || '#22c55e' }}
                      />
                    </div>
                    <FormDescription>
                      Used for highlights and call-to-actions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="theme.font"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Family</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      Primary font for your organization's interface
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="theme.logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL to your organization's logo (recommended size: 200x200px)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customDomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Domain</FormLabel>
                    <FormControl>
                      <Input placeholder="app.yourcompany.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enterprise feature: Set up a custom domain for your portal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="theme.isDarkMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Dark Mode Default
                      </FormLabel>
                      <FormDescription>
                        Set dark mode as the default theme
                      </FormDescription>
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
              name="theme.customCss"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom CSS</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter custom CSS" 
                      className="min-h-[150px] font-mono"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Advanced: Add custom CSS for further customization (Enterprise tier only)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          {/* Features Settings */}
          <TabsContent value="features" className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Feature Management</h3>
              <p className="text-sm text-muted-foreground">
                Enable or disable features for this organization
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Core Features</h4>
              
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="features.investorDashboard"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Investor Dashboard
                        </FormLabel>
                        <FormDescription>
                          Provides user-friendly dashboard for investors to track investments
                        </FormDescription>
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
                
                <FormField
                  control={form.control}
                  name="features.adminDashboard"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Admin Dashboard
                        </FormLabel>
                        <FormDescription>
                          Comprehensive dashboard for organization administrators
                        </FormDescription>
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
                
                <FormField
                  control={form.control}
                  name="features.walletManagement"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Wallet Management
                        </FormLabel>
                        <FormDescription>
                          Digital wallet functionality for investment transactions
                        </FormDescription>
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
                
                <FormField
                  control={form.control}
                  name="features.documentManagement"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Document Management
                        </FormLabel>
                        <FormDescription>
                          Secure storage and management of investment documents
                        </FormDescription>
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
              
              <Separator className="my-4" />
              
              <h4 className="text-sm font-medium text-muted-foreground">Compliance Features</h4>
              
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="features.kycVerification"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          KYC/AML Verification
                        </FormLabel>
                        <FormDescription>
                          Identity verification and AML screening for investors
                        </FormDescription>
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
              
              <Separator className="my-4" />
              
              <h4 className="text-sm font-medium text-muted-foreground">Premium Features</h4>
              
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="features.multiCurrency"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Multi-Currency Support
                        </FormLabel>
                        <FormDescription>
                          Support for multiple currencies in transactions and investments
                        </FormDescription>
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
                
                <FormField
                  control={form.control}
                  name="features.advancedAnalytics"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Advanced Analytics
                        </FormLabel>
                        <FormDescription>
                          Comprehensive analytics and reporting capabilities
                        </FormDescription>
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
              
              <Separator className="my-4" />
              
              <h4 className="text-sm font-medium text-muted-foreground">Enterprise Features</h4>
              
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="features.whiteLabel"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          White Labeling
                        </FormLabel>
                        <FormDescription>
                          Complete white-label solution with custom branding
                        </FormDescription>
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
                
                <FormField
                  control={form.control}
                  name="features.apiAccess"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          API Access
                        </FormLabel>
                        <FormDescription>
                          Programmatic access via REST API for integrations
                        </FormDescription>
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
                
                <FormField
                  control={form.control}
                  name="features.customIntegrations"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Custom Integrations
                        </FormLabel>
                        <FormDescription>
                          Custom integrations with third-party systems
                        </FormDescription>
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
            </div>
          </TabsContent>
          
          {/* Integration Settings */}
          <TabsContent value="integration" className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Integrations & APIs</h3>
              <p className="text-sm text-muted-foreground">
                Connect third-party services and configure API access
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Configure email service for notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>SendGrid Integration</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Compliance Services</CardTitle>
                <CardDescription>
                  Third-party services for KYC/AML compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>Trulioo Identity Verification</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>Smile Identity Verification</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Notification Services</CardTitle>
                <CardDescription>
                  Configure multi-channel notification delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BellRing className="h-4 w-4 text-muted-foreground" />
                    <span>SMS Notifications</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>
                  Generate and manage API keys for external access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6">
                  <p className="text-sm text-muted-foreground">
                    API access is available for Enterprise tier organizations.
                    <br />
                    Upgrade your subscription to unlock this feature.
                  </p>
                  
                  <Button className="mt-4" disabled={form.watch('tier') !== 'enterprise'}>
                    Generate API Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="sticky bottom-0 flex justify-end pt-4 pb-4 bg-background border-t">
          <Button
            type="submit"
            disabled={updateTenantMutation.isPending}
            className="w-full md:w-auto"
          >
            {updateTenantMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TenantSettingsForm;