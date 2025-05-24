import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Shield,
  BellRing,
  LogOut,
  Edit,
  Check,
  Loader2,
  AlertTriangle,
  Upload,
  X,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// User profile form schema
const profileFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  bio: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

// Security form schema
const securityFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Notification settings schema
const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  newInvestmentOpportunities: z.boolean(),
  investmentUpdates: z.boolean(),
  paymentReminders: z.boolean(),
  marketingCommunications: z.boolean(),
});

// Interface for user profile data
interface UserProfile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  profileImage: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  role: string;
}

// Interface for notification settings
interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  newInvestmentOpportunities: boolean;
  investmentUpdates: boolean;
  paymentReminders: boolean;
  marketingCommunications: boolean;
}

const AccountSettingsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Fetch user profile data
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery<UserProfile>({
    queryKey: ['/api/user/profile'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/profile');
      return response.json();
    },
  });

  // Fetch notification settings
  const { data: notificationSettings, isLoading: isLoadingNotifications } = useQuery<NotificationSettings>({
    queryKey: ['/api/user/notifications/settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/notifications/settings');
      return response.json();
    },
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      bio: '',
      address: '',
      city: '',
      state: '',
      country: '',
    },
  });

  // Security form
  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Notification form
  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      newInvestmentOpportunities: true,
      investmentUpdates: true,
      paymentReminders: true,
      marketingCommunications: false,
    },
  });

  // Update form values when data is loaded
  useState(() => {
    if (userProfile) {
      profileForm.reset({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phone: userProfile.phone,
        bio: userProfile.bio || '',
        address: userProfile.address || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        country: userProfile.country || '',
      });
    }
  });

  useState(() => {
    if (notificationSettings) {
      notificationForm.reset({
        emailNotifications: notificationSettings.emailNotifications,
        smsNotifications: notificationSettings.smsNotifications,
        pushNotifications: notificationSettings.pushNotifications,
        newInvestmentOpportunities: notificationSettings.newInvestmentOpportunities,
        investmentUpdates: notificationSettings.investmentUpdates,
        paymentReminders: notificationSettings.paymentReminders,
        marketingCommunications: notificationSettings.marketingCommunications,
      });
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof profileFormSchema>) => {
      const response = await apiRequest('PATCH', '/api/user/profile', values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (values: z.infer<typeof securityFormSchema>) => {
      const response = await apiRequest('POST', '/api/user/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      return response.json();
    },
    onSuccess: () => {
      securityForm.reset();
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update password',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (values: z.infer<typeof notificationFormSchema>) => {
      const response = await apiRequest('PATCH', '/api/user/notifications/settings', values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/notifications/settings'] });
      toast({
        title: 'Notification settings updated',
        description: 'Your notification preferences have been saved',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update notification settings',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Profile image upload mutation
  const uploadProfileImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/user/profile/image', formData, {}, true);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      setIsUploadingImage(false);
      toast({
        title: 'Profile image updated',
        description: 'Your profile picture has been updated successfully',
      });
    },
    onError: (error: Error) => {
      setIsUploadingImage(false);
      toast({
        title: 'Failed to update profile image',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle profile form submission
  const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
    updateProfileMutation.mutate(values);
  };

  // Handle security form submission
  const onSecuritySubmit = (values: z.infer<typeof securityFormSchema>) => {
    updatePasswordMutation.mutate(values);
  };

  // Handle notification form submission
  const onNotificationSubmit = (values: z.infer<typeof notificationFormSchema>) => {
    updateNotificationsMutation.mutate(values);
  };

  // Handle profile image upload
  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Profile image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Check file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPEG, PNG, or GIF image',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('profileImage', file);
    uploadProfileImageMutation.mutate(formData);
  };

  // Get user initials for avatar
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Loading state for the entire page
  if (isLoadingProfile || isLoadingNotifications) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-lg">Loading account settings...</p>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-6xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 w-full">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-8 md:grid-cols-7">
            <Card className="md:col-span-5">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal information and how others see you on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your first name" {...field} />
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
                              <Input placeholder="Enter your last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="your.email@example.com"
                                {...field}
                                readOnly={userProfile?.emailVerified}
                              />
                            </FormControl>
                            <FormDescription>
                              {userProfile?.emailVerified ? (
                                <span className="flex items-center text-emerald-600 text-xs">
                                  <Check className="h-3 w-3 mr-1" />
                                  Verified
                                </span>
                              ) : (
                                <span className="flex items-center text-orange-500 text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Not verified
                                </span>
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+234 800 000 0000" {...field} />
                            </FormControl>
                            <FormDescription>
                              {userProfile?.phoneVerified ? (
                                <span className="flex items-center text-emerald-600 text-xs">
                                  <Check className="h-3 w-3 mr-1" />
                                  Verified
                                </span>
                              ) : (
                                <span className="flex items-center text-orange-500 text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Not verified
                                </span>
                              )}
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
                              placeholder="Tell us a bit about yourself"
                              className="resize-none min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This will be displayed on your public profile
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Separator />
                    <h3 className="text-lg font-medium">Address Information</h3>
                    <div className="grid gap-4">
                      <FormField
                        control={profileForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your street address"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-4 sm:grid-cols-3">
                        <FormField
                          control={profileForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="City" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="State/Province"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select
                                value={field.value || ''}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="ng">Nigeria</SelectItem>
                                  <SelectItem value="gh">Ghana</SelectItem>
                                  <SelectItem value="ke">Kenya</SelectItem>
                                  <SelectItem value="za">South Africa</SelectItem>
                                  <SelectItem value="et">Ethiopia</SelectItem>
                                  <SelectItem value="eg">Egypt</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending || !profileForm.formState.isDirty}
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Image</CardTitle>
                  <CardDescription>
                    Update your profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <Avatar className="w-32 h-32 border-4 border-background">
                      <AvatarImage src={userProfile?.profileImage || ''} alt={userProfile?.username} />
                      <AvatarFallback className="text-3xl">
                        {userProfile?.firstName && userProfile?.lastName
                          ? getUserInitials(userProfile.firstName, userProfile.lastName)
                          : userProfile?.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="profile-image-upload"
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition"
                    >
                      <Edit className="h-4 w-4" />
                    </label>
                    <input
                      id="profile-image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      disabled={isUploadingImage}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-lg">
                      {userProfile?.firstName} {userProfile?.lastName}
                    </h3>
                    <p className="text-muted-foreground text-sm">@{userProfile?.username}</p>
                    <div className="mt-1 text-xs flex items-center justify-center">
                      <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {userProfile?.role.charAt(0).toUpperCase() + userProfile?.role.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  {isUploadingImage && (
                    <div className="text-center text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      Uploading image...
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground text-center">
                    Upload a square image for best results. Maximum size 5MB.
                  </p>
                </CardFooter>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Account Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Username</p>
                      <p className="text-sm text-muted-foreground">@{userProfile?.username}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Member Since</p>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.createdAt
                          ? new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Account Status</p>
                      <p className="text-sm flex items-center">
                        <span className="h-2 w-2 bg-emerald-500 rounded-full mr-2"></span>
                        Active
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full text-destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will be logged out of your account and redirected to the login page.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            try {
                              await apiRequest('POST', '/api/auth/logout');
                              window.location.href = '/auth';
                            } catch (error) {
                              toast({
                                title: 'Error',
                                description: 'Failed to sign out. Please try again.',
                                variant: 'destructive',
                              });
                            }
                          }}
                        >
                          Sign Out
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...securityForm}>
                  <form
                    onSubmit={securityForm.handleSubmit(onSecuritySubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={securityForm.control}
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
                    <FormField
                      control={securityForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormDescription>
                            Password must be at least 8 characters and include uppercase, lowercase,
                            and numbers.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={securityForm.control}
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
                    <div className="flex justify-end">
                      <Button type="submit" disabled={updatePasswordMutation.isPending}>
                        {updatePasswordMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Change Password'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Two-Factor Authentication</p>
                        <p className="text-xs text-muted-foreground">
                          Protect your account with 2FA
                        </p>
                      </div>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" disabled>
                    Set Up Two-Factor Authentication
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Verification</CardTitle>
                  <CardDescription>Verify your identity to unlock more features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Check
                          className={`h-5 w-5 ${
                            userProfile?.emailVerified
                              ? 'text-emerald-500'
                              : 'text-muted-foreground'
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium">Email Verification</p>
                          <p className="text-xs text-muted-foreground">
                            {userProfile?.emailVerified
                              ? 'Your email has been verified'
                              : 'Verify your email address'}
                          </p>
                        </div>
                      </div>
                      {!userProfile?.emailVerified && (
                        <Button size="sm" variant="outline">
                          Verify
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Check
                          className={`h-5 w-5 ${
                            userProfile?.phoneVerified
                              ? 'text-emerald-500'
                              : 'text-muted-foreground'
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium">Phone Verification</p>
                          <p className="text-xs text-muted-foreground">
                            {userProfile?.phoneVerified
                              ? 'Your phone has been verified'
                              : 'Verify your phone number'}
                          </p>
                        </div>
                      </div>
                      {!userProfile?.phoneVerified && (
                        <Button size="sm" variant="outline">
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications and updates from us
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form
                  onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Notification Channels</h3>
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base flex items-center">
                                <Mail className="h-5 w-5 mr-2" />
                                Email Notifications
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
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base flex items-center">
                                <Smartphone className="h-5 w-5 mr-2" />
                                SMS Notifications
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
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base flex items-center">
                                <BellRing className="h-5 w-5 mr-2" />
                                Push Notifications
                              </FormLabel>
                              <FormDescription>
                                Receive push notifications on your devices
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

                  <Separator />

                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Notification Types</h3>
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="newInvestmentOpportunities"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                New Investment Opportunities
                              </FormLabel>
                              <FormDescription>
                                Be notified when new properties are available for investment
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
                        name="investmentUpdates"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Investment Updates
                              </FormLabel>
                              <FormDescription>
                                Receive updates about your investments' performance
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
                        name="paymentReminders"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Payment Reminders
                              </FormLabel>
                              <FormDescription>
                                Get reminders about upcoming payments or returns
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
                        name="marketingCommunications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Marketing Communications
                              </FormLabel>
                              <FormDescription>
                                Receive promotional offers and newsletters
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
                    <Button
                      type="submit"
                      disabled={
                        updateNotificationsMutation.isPending ||
                        !notificationForm.formState.isDirty
                      }
                    >
                      {updateNotificationsMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Preferences'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods and transaction settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Your Payment Methods</h3>
                  <div className="rounded-lg border shadow-sm">
                    <div className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="bg-muted rounded-md p-2">
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-sm text-muted-foreground">
                            No card added yet
                          </p>
                        </div>
                        <Button variant="outline">Add Card</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Billing Information</h3>
                  <div className="rounded-lg border p-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      This information will be used for receipts and invoices
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          Billing Name
                        </label>
                        <Input placeholder="Your name or company name" />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          Billing Email
                        </label>
                        <Input
                          type="email"
                          placeholder="billing@example.com"
                          defaultValue={userProfile?.email}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-sm font-medium block mb-1">
                        Billing Address
                      </label>
                      <Textarea
                        placeholder="Enter your billing address"
                        className="resize-none"
                      />
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button variant="outline">Save Billing Info</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Payment Settings</h3>
                  <div className="rounded-lg border p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Default Currency</p>
                        <p className="text-sm text-muted-foreground">
                          Set your preferred currency for payments
                        </p>
                      </div>
                      <Select defaultValue="ngn">
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ngn">Nigerian Naira (₦)</SelectItem>
                          <SelectItem value="ghs">Ghanaian Cedi (₵)</SelectItem>
                          <SelectItem value="kes">Kenyan Shilling (KSh)</SelectItem>
                          <SelectItem value="usd">US Dollar ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div>
                        <p className="font-medium">Payment Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified about payment activity
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Manage your privacy preferences and data settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Privacy Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <label className="text-base font-medium">
                          Profile Visibility
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Control who can see your profile information
                        </p>
                      </div>
                      <Select defaultValue="authenticated">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="authenticated">
                            Registered Users Only
                          </SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <label className="text-base font-medium">
                          Investment Privacy
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Control who can see your investment activity
                        </p>
                      </div>
                      <Select defaultValue="private">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select privacy level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="followers">
                            Connections Only
                          </SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <label className="text-base font-medium">
                          Show in Investor Directory
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Allow other users to find you in the platform directory
                        </p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Data Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <label className="text-base font-medium">
                          Data Analytics
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Allow us to collect anonymous usage data to improve our services
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <label className="text-base font-medium">Cookies</label>
                        <p className="text-sm text-muted-foreground">
                          Manage cookie preferences
                        </p>
                      </div>
                      <Button variant="outline">Manage Cookies</Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Account Actions</h3>
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium mb-2">Download Your Data</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get a copy of your personal data in a machine-readable format
                      </p>
                      <Button variant="outline">Request Data Export</Button>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium mb-2 text-destructive">
                        Delete Account
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all associated data
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">Delete Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your
                              account and remove all your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground">
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountSettingsPage;