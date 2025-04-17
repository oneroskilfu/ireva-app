import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { User, Lock, Bell, Wrench, CreditCard, Smartphone, Mail, ShieldCheck, HelpCircle, AlertTriangle, Upload, Check } from 'lucide-react';

// Profile settings form schema
const profileFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
  bio: z.string().optional(),
  profileImage: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Notification settings form schema
const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  investmentUpdates: z.boolean(),
  marketingMessages: z.boolean(),
  newPropertyAlerts: z.boolean(),
  paymentReceipts: z.boolean(),
  securityAlerts: z.boolean(),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

// Password form schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

// Investment preferences form schema
const investmentPreferencesSchema = z.object({
  minInvestment: z.string(),
  maxInvestment: z.string(),
  riskTolerance: z.enum(['low', 'medium', 'high']),
  preferredLocations: z.array(z.string()),
  preferredPropertyTypes: z.array(z.string()),
  investmentHorizon: z.enum(['short', 'medium', 'long']),
  autoInvest: z.boolean(),
  reinvestDividends: z.boolean(),
});

type InvestmentPreferencesValues = z.infer<typeof investmentPreferencesSchema>;

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      bio: user?.bio || '',
    },
  });

  // Notification form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      investmentUpdates: true,
      marketingMessages: false,
      newPropertyAlerts: true,
      paymentReceipts: true,
      securityAlerts: true,
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Investment preferences form
  const investmentPreferencesForm = useForm<InvestmentPreferencesValues>({
    resolver: zodResolver(investmentPreferencesSchema),
    defaultValues: {
      minInvestment: '50000',
      maxInvestment: '5000000',
      riskTolerance: 'medium',
      preferredLocations: ['Lagos'],
      preferredPropertyTypes: ['residential'],
      investmentHorizon: 'medium',
      autoInvest: false,
      reinvestDividends: true,
    },
  });

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'profileImage' && value && value[0]) {
            formData.append(key, value[0]);
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
        
        const response = await apiRequest('PATCH', '/api/user/profile', formData);
        return response.json();
      } catch (error) {
        console.error('Profile update error:', error);
        throw new Error('Failed to update profile');
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been updated successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Notification update mutation
  const notificationMutation = useMutation({
    mutationFn: async (data: NotificationFormValues) => {
      setIsSubmitting(true);
      try {
        const response = await apiRequest('PATCH', '/api/user/notifications', data);
        return response.json();
      } catch (error) {
        console.error('Notification settings update error:', error);
        throw new Error('Failed to update notification settings');
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Notifications Updated',
        description: 'Your notification preferences have been updated.',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update notification settings. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Password update mutation
  const passwordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      setIsSubmitting(true);
      try {
        const response = await apiRequest('PATCH', '/api/user/password', data);
        return response.json();
      } catch (error) {
        console.error('Password update error:', error);
        throw new Error('Failed to update password');
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
        variant: 'default',
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Investment preferences mutation
  const preferenceMutation = useMutation({
    mutationFn: async (data: InvestmentPreferencesValues) => {
      setIsSubmitting(true);
      try {
        const response = await apiRequest('PATCH', '/api/user/investment-preferences', data);
        return response.json();
      } catch (error) {
        console.error('Investment preferences update error:', error);
        throw new Error('Failed to update investment preferences');
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Preferences Updated',
        description: 'Your investment preferences have been updated.',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update investment preferences. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submissions
  const onProfileSubmit = (data: ProfileFormValues) => {
    profileMutation.mutate(data);
  };

  const onNotificationSubmit = (data: NotificationFormValues) => {
    notificationMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    passwordMutation.mutate(data);
  };

  const onPreferenceSubmit = (data: InvestmentPreferencesValues) => {
    preferenceMutation.mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>Settings | iREVA</title>
      </Helmet>

      <div className="container mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile, notifications, security, and investment preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 w-full">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Wrench className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="account">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and how others see you on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                      <div className="flex flex-col items-center space-y-2">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={user?.profileImage ?? ''} alt={user?.firstName || 'User'} />
                          <AvatarFallback className="text-lg">
                            {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <FormField
                          control={profileForm.control}
                          name="profileImage"
                          render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex flex-col items-center">
                                  <label htmlFor="profile-upload" className="cursor-pointer">
                                    <div className="flex items-center gap-1 text-sm text-primary hover:underline">
                                      <Upload className="h-3.5 w-3.5" />
                                      Change photo
                                    </div>
                                    <Input
                                      id="profile-upload"
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        onChange(e.target.files);
                                      }}
                                      {...rest}
                                    />
                                  </label>
                                  <FormDescription className="text-xs text-center mt-1">
                                    JPG, PNG or GIF, max 2MB
                                  </FormDescription>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex-1 space-y-4 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="john.doe@example.com" {...field} />
                                </FormControl>
                                <FormDescription>
                                  This is your verification email and will receive important updates
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="+234 800 1234 567" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Used for security verification and important alerts
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={profileForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us a bit about yourself as an investor..."
                                  className="min-h-[120px] resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                This will be visible to project developers and potential co-investors if you enable community features
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how and when you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Delivery Channels</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={notificationForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-0.5">
                                <FormLabel className="flex items-center text-base">
                                  <Mail className="h-5 w-5 mr-2 text-primary" />
                                  Email
                                </FormLabel>
                                <FormDescription>
                                  Receive notifications via email
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
                          control={notificationForm.control}
                          name="smsNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-0.5">
                                <FormLabel className="flex items-center text-base">
                                  <Smartphone className="h-5 w-5 mr-2 text-primary" />
                                  SMS
                                </FormLabel>
                                <FormDescription>
                                  Receive notifications via SMS
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
                          control={notificationForm.control}
                          name="pushNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-0.5">
                                <FormLabel className="flex items-center text-base">
                                  <Bell className="h-5 w-5 mr-2 text-primary" />
                                  Push
                                </FormLabel>
                                <FormDescription>
                                  Receive push notifications
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <Badge variant="outline" className="ml-2">Coming Soon</Badge>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notification Types</h3>
                      <div className="space-y-4">
                        <FormField
                          control={notificationForm.control}
                          name="investmentUpdates"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Investment Updates</FormLabel>
                                <FormDescription>
                                  Property status changes, dividend payments, and value changes
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
                          control={notificationForm.control}
                          name="newPropertyAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">New Property Alerts</FormLabel>
                                <FormDescription>
                                  Be notified when new investment opportunities matching your criteria are available
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
                          control={notificationForm.control}
                          name="paymentReceipts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Payment Receipts</FormLabel>
                                <FormDescription>
                                  Transaction confirmations and payment receipts
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
                          control={notificationForm.control}
                          name="securityAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Security Alerts</FormLabel>
                                <FormDescription>
                                  Login attempts, password changes, and profile updates
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
                          control={notificationForm.control}
                          name="marketingMessages"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Marketing Messages</FormLabel>
                                <FormDescription>
                                  News, updates, and promotional messages from iREVA
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
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Preferences'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormDescription>
                              At least 8 characters with a mix of letters, numbers & symbols
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Last password change: Never
                </div>
                <Button variant="link" className="px-0">
                  Forgot Password?
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">SMS Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Use your phone as a second factor to authenticate your login
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
                      Not Enabled
                    </Badge>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Alert variant="default" className="w-full">
                  <HelpCircle className="h-4 w-4" />
                  <AlertTitle>Recommendation</AlertTitle>
                  <AlertDescription>
                    We strongly recommend enabling two-factor authentication for added security.
                  </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Login Sessions</CardTitle>
                <CardDescription>
                  Manage your active sessions and devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <h4 className="font-medium">Current Session</h4>
                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Chrome on Windows • Lagos, Nigeria
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Started: {new Date().toLocaleString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" disabled>
                      This Device
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Only seeing your current session? Other sessions will appear here when you log in from other devices.
                </div>
                <Button variant="destructive" size="sm">
                  Log Out All Devices
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Investment Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Preferences</CardTitle>
                <CardDescription>
                  Customize your investment strategy and property preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...investmentPreferencesForm}>
                  <form onSubmit={investmentPreferencesForm.handleSubmit(onPreferenceSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Investment Parameters</h3>
                        
                        <FormField
                          control={investmentPreferencesForm.control}
                          name="minInvestment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Investment (₦)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormDescription>
                                The minimum amount you want to invest in a single property
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={investmentPreferencesForm.control}
                          name="maxInvestment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Investment (₦)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormDescription>
                                The maximum amount you want to invest in a single property
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={investmentPreferencesForm.control}
                          name="riskTolerance"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Risk Tolerance</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select risk tolerance" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low Risk (Conservative)</SelectItem>
                                  <SelectItem value="medium">Medium Risk (Balanced)</SelectItem>
                                  <SelectItem value="high">High Risk (Aggressive)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                This helps us recommend properties that match your risk comfort level
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={investmentPreferencesForm.control}
                          name="investmentHorizon"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Investment Horizon</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select investment period" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="short">Short Term (1-2 years)</SelectItem>
                                  <SelectItem value="medium">Medium Term (3-5 years)</SelectItem>
                                  <SelectItem value="long">Long Term (5+ years)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                How long you plan to keep your investments
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Property Preferences</h3>
                        
                        <FormField
                          control={investmentPreferencesForm.control}
                          name="autoInvest"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Auto-Invest</FormLabel>
                                <FormDescription>
                                  Automatically invest in properties that match your criteria
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <Badge variant="outline" className="ml-2">Coming Soon</Badge>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={investmentPreferencesForm.control}
                          name="reinvestDividends"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Reinvest Dividends</FormLabel>
                                <FormDescription>
                                  Automatically reinvest your earnings into new properties
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
                        
                        <div className="pt-4">
                          <h4 className="text-sm font-medium mb-2">Preferred Locations</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer">Lagos</Badge>
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer">Abuja</Badge>
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer">Port Harcourt</Badge>
                            <Badge variant="outline" className="cursor-pointer">+ Add Location</Badge>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <h4 className="text-sm font-medium mb-2">Preferred Property Types</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer">Residential</Badge>
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer">Commercial</Badge>
                            <Badge variant="outline" className="cursor-pointer">Industrial</Badge>
                            <Badge variant="outline" className="cursor-pointer">Mixed-Use</Badge>
                            <Badge variant="outline" className="cursor-pointer">Land</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Preferences'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage your payment methods and transaction settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No payment methods found</AlertTitle>
                  <AlertDescription>
                    Add a payment method to quickly fund your investments.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 gap-4">
                  <Button className="w-full sm:w-auto justify-start" variant="outline">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Add Credit/Debit Card
                  </Button>
                  
                  <Button className="w-full sm:w-auto justify-start" variant="outline">
                    <Check className="mr-2 h-4 w-4" />
                    Connect Bank Account
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Transaction Settings</h3>
                  
                  <div className="flex flex-row items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <h4 className="font-medium">Transaction Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Get notified about all transactions from your payment methods
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex flex-row items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <h4 className="font-medium">Auto Top-up</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically add funds to your wallet when balance is low
                      </p>
                    </div>
                    <Badge variant="outline" className="mr-2">Coming Soon</Badge>
                    <Switch disabled />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Your payment information is encrypted and secure.
                </div>
                <Button variant="link" className="px-0" disabled>
                  Payment History
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View and manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Account Details</h3>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Account Type</p>
                      <div className="flex items-center gap-2">
                        <Badge>Individual Investor</Badge>
                        <Button variant="link" className="h-auto p-0">Upgrade</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Account ID</p>
                      <p className="text-sm text-muted-foreground">
                        IREVA-{user?.id || '000000'}-{Math.floor(Math.random() * 1000)}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Member Since</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">KYC Status</p>
                      <div className="flex items-center gap-2">
                        {user?.kycStatus === 'verified' ? (
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        ) : user?.kycStatus === 'pending' ? (
                          <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                        ) : (
                          <Badge variant="outline">Not Started</Badge>
                        )}
                        {user?.kycStatus !== 'verified' && (
                          <Button variant="link" className="h-auto p-0">Complete KYC</Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Account Actions</h3>
                    
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full justify-start">
                        <Bell className="mr-2 h-4 w-4" />
                        Update Communication Preferences
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Request Account Information
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Temporarily Deactivate Account
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Permanently Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Alert>
                  <HelpCircle className="h-4 w-4" />
                  <AlertTitle>Need assistance with your account?</AlertTitle>
                  <AlertDescription>
                    Contact our support team for help with account-related issues.
                  </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default SettingsPage;