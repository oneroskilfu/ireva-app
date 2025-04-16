import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import SharedLayout from "@/layouts/SharedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Bell, Lock, Phone, Shield, AlertCircle, Check } from "lucide-react";

// Password change schema
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

// Notification settings schema
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  investmentUpdates: z.boolean(),
  marketingEmails: z.boolean(),
  newPropertyAlerts: z.boolean(),
  paymentReceipts: z.boolean(),
});

type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  
  // Fetch user settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/user/settings"],
    enabled: !!user,
  });
  
  // Password change form
  const passwordForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Notification settings form
  const notificationsForm = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: settings?.emailNotifications ?? true,
      smsNotifications: settings?.smsNotifications ?? false,
      pushNotifications: settings?.pushNotifications ?? true,
      investmentUpdates: settings?.investmentUpdates ?? true,
      marketingEmails: settings?.marketingEmails ?? false,
      newPropertyAlerts: settings?.newPropertyAlerts ?? true,
      paymentReceipts: settings?.paymentReceipts ?? true,
    },
  });
  
  // Update form when settings data is loaded
  if (settings && !isLoading) {
    notificationsForm.reset({
      emailNotifications: settings.emailNotifications ?? true,
      smsNotifications: settings.smsNotifications ?? false,
      pushNotifications: settings.pushNotifications ?? true,
      investmentUpdates: settings.investmentUpdates ?? true,
      marketingEmails: settings.marketingEmails ?? false,
      newPropertyAlerts: settings.newPropertyAlerts ?? true,
      paymentReceipts: settings.paymentReceipts ?? true,
    });
  }
  
  // Password change mutation
  const passwordChangeMutation = useMutation({
    mutationFn: async (data: PasswordChangeValues) => {
      const res = await apiRequest("POST", "/api/user/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      passwordForm.reset();
      setPasswordChangeSuccess(true);
      setTimeout(() => setPasswordChangeSuccess(false), 5000); // Hide success message after 5 seconds
    },
    onError: (error: Error) => {
      toast.error(`Failed to change password: ${error.message}`);
    },
  });
  
  // Notification settings mutation
  const notificationSettingsMutation = useMutation({
    mutationFn: async (data: NotificationSettingsValues) => {
      const res = await apiRequest("PATCH", "/api/user/notification-settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      toast.success("Notification settings updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update notification settings: ${error.message}`);
    },
  });
  
  // Handle password form submission
  const onPasswordSubmit = (data: PasswordChangeValues) => {
    passwordChangeMutation.mutate(data);
  };
  
  // Handle notification settings form submission
  const onNotificationSettingsSubmit = (data: NotificationSettingsValues) => {
    notificationSettingsMutation.mutate(data);
  };
  
  // Handle individual notification setting change
  const handleNotificationSettingChange = (field: keyof NotificationSettingsValues, value: boolean) => {
    notificationsForm.setValue(field, value);
    
    // Automatically submit the form when a setting is changed
    const currentValues = notificationsForm.getValues();
    notificationSettingsMutation.mutate({
      ...currentValues,
      [field]: value,
    });
  };
  
  if (isLoading) {
    return (
      <SharedLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SharedLayout>
    );
  }
  
  return (
    <SharedLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and security settings
          </p>
        </div>
        
        <Tabs defaultValue="security" className="space-y-6">
          <TabsList>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="security">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <CardTitle>Change Password</CardTitle>
                  </div>
                  <CardDescription>
                    Update your account password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {passwordChangeSuccess && (
                    <Alert className="mb-6 bg-green-50 border-green-200">
                      <Check className="h-4 w-4 text-green-500" />
                      <AlertTitle className="text-green-700">Password Updated</AlertTitle>
                      <AlertDescription className="text-green-600">
                        Your password has been changed successfully.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 8 characters with uppercase, lowercase, and numbers
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
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={passwordChangeMutation.isPending}
                      >
                        {passwordChangeMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-5 w-5 text-primary" />
                      <CardTitle>Two-Factor Authentication</CardTitle>
                    </div>
                    <CardDescription>
                      Add an extra layer of security to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">SMS Authentication</p>
                          <p className="text-sm text-muted-foreground">
                            Receive a code via SMS to verify your identity
                          </p>
                        </div>
                        <Switch 
                          checked={settings?.twoFactorEnabled}
                          onCheckedChange={() => toast.info("2FA configuration will be available soon")}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Authenticator App</p>
                          <p className="text-sm text-muted-foreground">
                            Use an authenticator app to generate verification codes
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Setup</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <CardTitle>Security Alerts</CardTitle>
                    </div>
                    <CardDescription>
                      Manage security notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Login Alerts</p>
                          <p className="text-sm text-muted-foreground">
                            Get notified of new logins to your account
                          </p>
                        </div>
                        <Switch 
                          checked={settings?.loginAlerts} 
                          onCheckedChange={() => {
                            // Update setting in local form state
                            handleNotificationSettingChange('emailNotifications', !settings?.loginAlerts);
                          }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Suspicious Activity</p>
                          <p className="text-sm text-muted-foreground">
                            Get alerts about suspicious account activity
                          </p>
                        </div>
                        <Switch 
                          checked={settings?.suspiciousActivityAlerts} 
                          onCheckedChange={() => {
                            toast.info("This feature will be available soon");
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Notification Preferences</CardTitle>
                </div>
                <CardDescription>
                  Choose how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationsForm}>
                  <form className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Notification Channels</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Receive updates via email
                            </p>
                          </div>
                          <FormField
                            control={notificationsForm.control}
                            name="emailNotifications"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch 
                                    checked={field.value} 
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      handleNotificationSettingChange('emailNotifications', checked);
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">SMS Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Receive updates via text message
                            </p>
                          </div>
                          <FormField
                            control={notificationsForm.control}
                            name="smsNotifications"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch 
                                    checked={field.value} 
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      handleNotificationSettingChange('smsNotifications', checked);
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Push Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Receive updates on your device
                            </p>
                          </div>
                          <FormField
                            control={notificationsForm.control}
                            name="pushNotifications"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch 
                                    checked={field.value} 
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      handleNotificationSettingChange('pushNotifications', checked);
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Notification Types</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Investment Updates</p>
                            <p className="text-sm text-muted-foreground">
                              Updates about your investments and returns
                            </p>
                          </div>
                          <FormField
                            control={notificationsForm.control}
                            name="investmentUpdates"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch 
                                    checked={field.value} 
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      handleNotificationSettingChange('investmentUpdates', checked);
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">New Property Alerts</p>
                            <p className="text-sm text-muted-foreground">
                              Notifications when new properties are available
                            </p>
                          </div>
                          <FormField
                            control={notificationsForm.control}
                            name="newPropertyAlerts"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch 
                                    checked={field.value} 
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      handleNotificationSettingChange('newPropertyAlerts', checked);
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Payment Receipts</p>
                            <p className="text-sm text-muted-foreground">
                              Notifications for payments and transactions
                            </p>
                          </div>
                          <FormField
                            control={notificationsForm.control}
                            name="paymentReceipts"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch 
                                    checked={field.value} 
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      handleNotificationSettingChange('paymentReceipts', checked);
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Marketing Emails</p>
                            <p className="text-sm text-muted-foreground">
                              Updates about new features and promotions
                            </p>
                          </div>
                          <FormField
                            control={notificationsForm.control}
                            name="marketingEmails"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch 
                                    checked={field.value} 
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      handleNotificationSettingChange('marketingEmails', checked);
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Privacy Settings</CardTitle>
                </div>
                <CardDescription>
                  Manage your privacy and data preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Privacy Settings</AlertTitle>
                    <AlertDescription>
                      Privacy settings will be available in a future update.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-muted-foreground">
                        Control who can see your profile information
                      </p>
                    </div>
                    <Button variant="outline" disabled>Configure</Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Data Management</p>
                      <p className="text-sm text-muted-foreground">
                        View or delete your account data
                      </p>
                    </div>
                    <Button variant="outline" disabled>Manage</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SharedLayout>
  );
}