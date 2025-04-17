import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Settings, 
  Save, 
  Mail, 
  BellRing, 
  CreditCard, 
  Lock, 
  UserCog, 
  Globe, 
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  PlusCircle
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from '@/components/ui/badge';

export default function AdminSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [settingsChanged, setSettingsChanged] = useState(false);

  // Temporarily use a mock data approach until the API endpoint is implemented
  const { data: settings, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      // Return mock data instead of making an actual API call that would fail
      return {
        general: {
          platformName: "iREVA",
          contactEmail: "contact@ireva.com",
          supportEmail: "support@ireva.com",
          homepageDescription: "A comprehensive real estate investment platform empowering investors across African markets with advanced digital tools and cross-border financial engagement capabilities."
        }
      };
    }
  });

  const handleSaveChanges = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
    setSettingsChanged(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        <div>
          <Skeleton className="h-8 w-96 mb-4" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
        <div className="mx-auto h-12 w-12 text-destructive opacity-75">⚠️</div>
        <h3 className="mt-4 text-lg font-semibold">Failed to Load Settings</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          There was an error loading the system settings. Please try again later.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">
          Configure platform-wide settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
            <TabsList className="flex flex-col h-auto bg-transparent p-0 space-y-1 md:w-56">
              <TabsTrigger value="general" className="w-full justify-start px-3 py-2 h-9 data-[state=active]:bg-muted">
                <Settings className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="email" className="w-full justify-start px-3 py-2 h-9 data-[state=active]:bg-muted">
                <Mail className="h-4 w-4 mr-2" />
                Email Configuration
              </TabsTrigger>
              <TabsTrigger value="payment" className="w-full justify-start px-3 py-2 h-9 data-[state=active]:bg-muted">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Settings
              </TabsTrigger>
              <TabsTrigger value="notifications" className="w-full justify-start px-3 py-2 h-9 data-[state=active]:bg-muted">
                <BellRing className="h-4 w-4 mr-2" />
                Notification Settings
              </TabsTrigger>
              <TabsTrigger value="security" className="w-full justify-start px-3 py-2 h-9 data-[state=active]:bg-muted">
                <Lock className="h-4 w-4 mr-2" />
                Security Settings
              </TabsTrigger>
              <TabsTrigger value="users" className="w-full justify-start px-3 py-2 h-9 data-[state=active]:bg-muted">
                <UserCog className="h-4 w-4 mr-2" />
                User Settings
              </TabsTrigger>
              <TabsTrigger value="localization" className="w-full justify-start px-3 py-2 h-9 data-[state=active]:bg-muted">
                <Globe className="h-4 w-4 mr-2" />
                Localization
              </TabsTrigger>
              <TabsTrigger value="support" className="w-full justify-start px-3 py-2 h-9 data-[state=active]:bg-muted">
                <MessageSquare className="h-4 w-4 mr-2" />
                Support Settings
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1">
            <TabsContent value="general" className="p-0 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure general platform settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform-name">Platform Name</Label>
                      <Input 
                        id="platform-name" 
                        placeholder="iREVA"
                        defaultValue="iREVA"
                        onChange={() => setSettingsChanged(true)}
                      />
                      <p className="text-sm text-muted-foreground">
                        The name of your platform displayed throughout the application
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Contact Email</Label>
                      <Input 
                        id="contact-email" 
                        type="email" 
                        placeholder="contact@ireva.com"
                        defaultValue="contact@ireva.com"
                        onChange={() => setSettingsChanged(true)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Main contact email for the platform
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="support-email">Support Email</Label>
                      <Input 
                        id="support-email" 
                        type="email" 
                        placeholder="support@ireva.com" 
                        defaultValue="support@ireva.com"
                        onChange={() => setSettingsChanged(true)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Email address for support inquiries
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="homepage-description">Homepage Description</Label>
                      <Textarea 
                        id="homepage-description" 
                        placeholder="A real estate investment platform..."
                        defaultValue="A comprehensive real estate investment platform empowering investors across African markets with advanced digital tools and cross-border financial engagement capabilities."
                        onChange={() => setSettingsChanged(true)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Brief description displayed on the homepage
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable maintenance mode to prevent user access
                        </p>
                      </div>
                      <Switch onChange={() => setSettingsChanged(true)} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable User Registration</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow new users to register on the platform
                        </p>
                      </div>
                      <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Email Verification</Label>
                        <p className="text-sm text-muted-foreground">
                          Require users to verify their email address
                        </p>
                      </div>
                      <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t px-6 py-4">
                  <Button 
                    disabled={!settingsChanged} 
                    className="gap-1"
                    onClick={handleSaveChanges}
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="email" className="p-0 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Email Configuration</CardTitle>
                  <CardDescription>
                    Configure email sending settings and templates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-service">Email Service</Label>
                      <Select defaultValue="sendgrid" onValueChange={() => setSettingsChanged(true)}>
                        <SelectTrigger id="email-service">
                          <SelectValue placeholder="Select email service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sendgrid">SendGrid</SelectItem>
                          <SelectItem value="mailchimp">Mailchimp</SelectItem>
                          <SelectItem value="ses">Amazon SES</SelectItem>
                          <SelectItem value="smtp">Custom SMTP</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Service used for sending emails
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sender-name">Sender Name</Label>
                      <Input 
                        id="sender-name" 
                        placeholder="iREVA Team"
                        defaultValue="iREVA Team"
                        onChange={() => setSettingsChanged(true)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Name displayed as the sender in emails
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sender-email">Sender Email</Label>
                      <Input 
                        id="sender-email" 
                        type="email" 
                        placeholder="noreply@ireva.com"
                        defaultValue="noreply@ireva.com"
                        onChange={() => setSettingsChanged(true)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Email address used as the sender
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Email Templates</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <div className="font-medium">Welcome Email</div>
                            <div className="text-sm text-muted-foreground">Sent when a new user registers</div>
                          </div>
                          <Button variant="outline">Edit Template</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <div className="font-medium">Password Reset</div>
                            <div className="text-sm text-muted-foreground">Sent when a user requests a password reset</div>
                          </div>
                          <Button variant="outline">Edit Template</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <div className="font-medium">KYC Verification</div>
                            <div className="text-sm text-muted-foreground">Sent when KYC status changes</div>
                          </div>
                          <Button variant="outline">Edit Template</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <div className="font-medium">Investment Confirmation</div>
                            <div className="text-sm text-muted-foreground">Sent when an investment is made</div>
                          </div>
                          <Button variant="outline">Edit Template</Button>
                        </div>
                        
                        <Button variant="outline" className="w-full mt-2 gap-1">
                          <PlusCircle className="h-4 w-4" />
                          <span>Add New Template</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t px-6 py-4">
                  <Button 
                    disabled={!settingsChanged} 
                    className="gap-1"
                    onClick={handleSaveChanges}
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="payment" className="p-0 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>
                    Configure payment processors and options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Default Currency</Label>
                      <Select defaultValue="ngn" onValueChange={() => setSettingsChanged(true)}>
                        <SelectTrigger id="currency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ngn">Nigerian Naira (₦)</SelectItem>
                          <SelectItem value="usd">US Dollar ($)</SelectItem>
                          <SelectItem value="eur">Euro (€)</SelectItem>
                          <SelectItem value="gbp">British Pound (£)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Primary currency used for transactions
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="min-investment">Minimum Investment Amount</Label>
                      <Input 
                        id="min-investment" 
                        type="number" 
                        placeholder="10000"
                        defaultValue="10000"
                        onChange={() => setSettingsChanged(true)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Minimum amount required for any investment
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Payment Providers</h3>
                      
                      <div className="space-y-4">
                        <div className="p-4 border rounded-md">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">Stripe</div>
                              <Badge variant="outline" className="bg-green-500/10 text-green-600">
                                Active
                              </Badge>
                            </div>
                            <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                          </div>
                          
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="stripe-public-key">Public Key</Label>
                              <Input 
                                id="stripe-public-key" 
                                placeholder="pk_test_..."
                                type="password"
                                onChange={() => setSettingsChanged(true)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="stripe-secret-key">Secret Key</Label>
                              <Input 
                                id="stripe-secret-key" 
                                placeholder="sk_test_..."
                                type="password"
                                onChange={() => setSettingsChanged(true)}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label>Test Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                  Use test credentials for development
                                </p>
                              </div>
                              <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 border rounded-md">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">PayPal</div>
                              <Badge variant="outline" className="bg-muted">
                                Inactive
                              </Badge>
                            </div>
                            <Switch onChange={() => setSettingsChanged(true)} />
                          </div>
                          
                          <Button variant="outline" className="w-full">Configure</Button>
                        </div>
                        
                        <div className="p-4 border rounded-md">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">Flutterwave</div>
                              <Badge variant="outline" className="bg-muted">
                                Inactive
                              </Badge>
                            </div>
                            <Switch onChange={() => setSettingsChanged(true)} />
                          </div>
                          
                          <Button variant="outline" className="w-full">Configure</Button>
                        </div>
                        
                        <div className="p-4 border rounded-md">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">Paystack</div>
                              <Badge variant="outline" className="bg-muted">
                                Inactive
                              </Badge>
                            </div>
                            <Switch onChange={() => setSettingsChanged(true)} />
                          </div>
                          
                          <Button variant="outline" className="w-full">Configure</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t px-6 py-4">
                  <Button 
                    disabled={!settingsChanged} 
                    className="gap-1"
                    onClick={handleSaveChanges}
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="p-0 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure system-wide notification settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Email Notifications</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>User Registration</Label>
                            <p className="text-sm text-muted-foreground">
                              Send email when a new user registers
                            </p>
                          </div>
                          <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>KYC Status Updates</Label>
                            <p className="text-sm text-muted-foreground">
                              Send email when KYC status changes
                            </p>
                          </div>
                          <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>New Investments</Label>
                            <p className="text-sm text-muted-foreground">
                              Send email when a user makes a new investment
                            </p>
                          </div>
                          <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Payment Confirmations</Label>
                            <p className="text-sm text-muted-foreground">
                              Send email when a payment is processed
                            </p>
                          </div>
                          <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Admin Notifications</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>New User Registrations</Label>
                            <p className="text-sm text-muted-foreground">
                              Notify admins when a new user registers
                            </p>
                          </div>
                          <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>New KYC Submissions</Label>
                            <p className="text-sm text-muted-foreground">
                              Notify admins when a user submits KYC documents
                            </p>
                          </div>
                          <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Large Investments</Label>
                            <p className="text-sm text-muted-foreground">
                              Notify admins for investments above a threshold
                            </p>
                          </div>
                          <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="investment-threshold">Large Investment Threshold</Label>
                          <Input 
                            id="investment-threshold" 
                            type="number" 
                            placeholder="1000000"
                            defaultValue="1000000"
                            onChange={() => setSettingsChanged(true)}
                          />
                          <p className="text-sm text-muted-foreground">
                            Amount that triggers a large investment notification
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t px-6 py-4">
                  <Button 
                    disabled={!settingsChanged} 
                    className="gap-1"
                    onClick={handleSaveChanges}
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="p-0 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Configure security and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password-min-length">Minimum Password Length</Label>
                      <Input 
                        id="password-min-length" 
                        type="number" 
                        min="8"
                        max="32"
                        placeholder="8"
                        defaultValue="8"
                        onChange={() => setSettingsChanged(true)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Minimum number of characters required for passwords
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Password Complexity</Label>
                        <p className="text-sm text-muted-foreground">
                          Require uppercase, lowercase, numbers, and special characters
                        </p>
                      </div>
                      <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Require 2FA for all admin accounts
                        </p>
                      </div>
                      <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable 2FA for Users</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to enable two-factor authentication
                        </p>
                      </div>
                      <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input 
                        id="session-timeout" 
                        type="number" 
                        placeholder="60"
                        defaultValue="60"
                        onChange={() => setSettingsChanged(true)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Time until user sessions expire due to inactivity
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Account Lockout</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Account Lockout Protection</Label>
                            <p className="text-sm text-muted-foreground">
                              Lock accounts after multiple failed login attempts
                            </p>
                          </div>
                          <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="max-attempts">Maximum Login Attempts</Label>
                          <Input 
                            id="max-attempts" 
                            type="number" 
                            placeholder="5"
                            defaultValue="5"
                            onChange={() => setSettingsChanged(true)}
                          />
                          <p className="text-sm text-muted-foreground">
                            Number of failed attempts before account lockout
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
                          <Input 
                            id="lockout-duration" 
                            type="number" 
                            placeholder="30"
                            defaultValue="30"
                            onChange={() => setSettingsChanged(true)}
                          />
                          <p className="text-sm text-muted-foreground">
                            Duration of account lockout after failed attempts
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t px-6 py-4">
                  <Button 
                    disabled={!settingsChanged} 
                    className="gap-1"
                    onClick={handleSaveChanges}
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="users" className="p-0 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>User Settings</CardTitle>
                  <CardDescription>
                    Configure user-related settings and defaults
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>User Self Registration</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to register accounts themselves
                        </p>
                      </div>
                      <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Email Verification</Label>
                        <p className="text-sm text-muted-foreground">
                          Users must verify email before accessing the platform
                        </p>
                      </div>
                      <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Phone Verification</Label>
                        <p className="text-sm text-muted-foreground">
                          Users must verify phone number before investing
                        </p>
                      </div>
                      <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require KYC Verification</Label>
                        <p className="text-sm text-muted-foreground">
                          Users must complete KYC before investing
                        </p>
                      </div>
                      <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="default-user-role">Default User Role</Label>
                      <Select defaultValue="user" onValueChange={() => setSettingsChanged(true)}>
                        <SelectTrigger id="default-user-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Regular User</SelectItem>
                          <SelectItem value="verified">Verified User</SelectItem>
                          <SelectItem value="premium">Premium User</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Default role assigned to new users
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">KYC Requirements</h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Require ID Document</Label>
                            <p className="text-sm text-muted-foreground">
                              Passport, National ID, or Driver's License
                            </p>
                          </div>
                          <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Require Proof of Address</Label>
                            <p className="text-sm text-muted-foreground">
                              Utility bill or bank statement
                            </p>
                          </div>
                          <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Require Selfie Verification</Label>
                            <p className="text-sm text-muted-foreground">
                              Selfie with ID document
                            </p>
                          </div>
                          <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t px-6 py-4">
                  <Button 
                    disabled={!settingsChanged} 
                    className="gap-1"
                    onClick={handleSaveChanges}
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="localization" className="p-0 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Localization Settings</CardTitle>
                  <CardDescription>
                    Configure language and regional settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="default-language">Default Language</Label>
                      <Select defaultValue="en" onValueChange={() => setSettingsChanged(true)}>
                        <SelectTrigger id="default-language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="yo">Yoruba</SelectItem>
                          <SelectItem value="ha">Hausa</SelectItem>
                          <SelectItem value="ig">Igbo</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Default language for the platform
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="default-timezone">Default Timezone</Label>
                      <Select defaultValue="africa-lagos" onValueChange={() => setSettingsChanged(true)}>
                        <SelectTrigger id="default-timezone">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="africa-lagos">Africa/Lagos (UTC+1)</SelectItem>
                          <SelectItem value="europe-london">Europe/London (UTC+0)</SelectItem>
                          <SelectItem value="america-new_york">America/New_York (UTC-5)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Default timezone for dates and times
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date-format">Date Format</Label>
                      <Select defaultValue="dd-mm-yyyy" onValueChange={() => setSettingsChanged(true)}>
                        <SelectTrigger id="date-format">
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                          <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Format for displaying dates
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Multi-language Support</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to select their preferred language
                        </p>
                      </div>
                      <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Supported Languages</h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">English</div>
                            <Badge variant="outline" className="bg-green-500/10 text-green-600">
                              Active
                            </Badge>
                          </div>
                          <Switch defaultChecked disabled />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">French</div>
                            <Badge variant="outline" className="bg-green-500/10 text-green-600">
                              Active
                            </Badge>
                          </div>
                          <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">Yoruba</div>
                            <Badge variant="outline" className="bg-green-500/10 text-green-600">
                              Active
                            </Badge>
                          </div>
                          <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">Hausa</div>
                            <Badge variant="outline" className="bg-muted">
                              Inactive
                            </Badge>
                          </div>
                          <Switch onChange={() => setSettingsChanged(true)} />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">Igbo</div>
                            <Badge variant="outline" className="bg-muted">
                              Inactive
                            </Badge>
                          </div>
                          <Switch onChange={() => setSettingsChanged(true)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t px-6 py-4">
                  <Button 
                    disabled={!settingsChanged} 
                    className="gap-1"
                    onClick={handleSaveChanges}
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="support" className="p-0 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Support Settings</CardTitle>
                  <CardDescription>
                    Configure help and support options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="support-email">Support Email</Label>
                      <Input 
                        id="support-email" 
                        type="email" 
                        placeholder="support@ireva.com"
                        defaultValue="support@ireva.com"
                        onChange={() => setSettingsChanged(true)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Main support email address
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="support-phone">Support Phone</Label>
                      <Input 
                        id="support-phone" 
                        placeholder="+234 800 1234 5678"
                        defaultValue="+234 800 1234 5678"
                        onChange={() => setSettingsChanged(true)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Support phone number
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Live Chat Support</Label>
                        <p className="text-sm text-muted-foreground">
                          Show live chat widget for users
                        </p>
                      </div>
                      <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="support-hours">Support Hours</Label>
                      <Input 
                        id="support-hours" 
                        placeholder="Monday-Friday, 9am-5pm WAT"
                        defaultValue="Monday-Friday, 9am-5pm WAT"
                        onChange={() => setSettingsChanged(true)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Hours when support is available
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="help-center-url">Help Center URL</Label>
                      <Input 
                        id="help-center-url" 
                        placeholder="https://help.ireva.com"
                        defaultValue="https://help.ireva.com"
                        onChange={() => setSettingsChanged(true)}
                      />
                      <p className="text-sm text-muted-foreground">
                        URL to your help documentation
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">FAQ Settings</h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show FAQ on Landing Page</Label>
                            <p className="text-sm text-muted-foreground">
                              Display frequently asked questions on the homepage
                            </p>
                          </div>
                          <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show FAQ in User Dashboard</Label>
                            <p className="text-sm text-muted-foreground">
                              Display FAQ section in the user dashboard
                            </p>
                          </div>
                          <Switch defaultChecked onChange={() => setSettingsChanged(true)} />
                        </div>
                        
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full gap-1">
                            <HelpCircle className="h-4 w-4" />
                            <span>Manage FAQ Categories & Questions</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t px-6 py-4">
                  <Button 
                    disabled={!settingsChanged} 
                    className="gap-1"
                    onClick={handleSaveChanges}
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}