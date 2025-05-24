import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useApiRequest } from '../../hooks/useApiRequest';
import { useToast } from '../../hooks/use-toast';
import {
  Card,
  Button,
  Input,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Avatar,
  Select,
  Switch,
  Separator,
  Alert,
  AlertTitle,
  AlertDescription,
} from '../../components/ui/DesignSystem';
import {
  UserIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const UserProfile = () => {
  const { user } = useAuth();
  const api = useApiRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State for edit modes
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  // Form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profileImage: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [preferencesData, setPreferencesData] = useState({
    notifications: {
      email: true,
      sms: false,
      inApp: true,
    },
    investmentPreferences: [],
    theme: 'light',
  });
  
  // Fetch user profile data
  const { 
    data: userData, 
    isLoading: isLoadingUser,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['/api/users/profile'],
    queryFn: async () => {
      const response = await api.get('users/profile');
      return response.data.data.user;
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.patch('users/profile', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/users/profile']);
      queryClient.invalidateQuery(['/api/user']);
      setIsEditingProfile(false);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.patch('users/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Password change failed',
        description: error.response?.data?.message || 'Failed to change password. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.patch('users/preferences', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/users/profile']);
      
      toast({
        title: 'Preferences updated',
        description: 'Your preferences have been updated successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || 'Failed to update preferences. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Update profile form when user data is loaded
  useEffect(() => {
    if (userData) {
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        profileImage: userData.profileImage || '',
      });
      
      if (userData.preferences) {
        setPreferencesData({
          notifications: {
            email: userData.preferences.notifications?.email ?? true,
            sms: userData.preferences.notifications?.sms ?? false,
            inApp: userData.preferences.notifications?.inApp ?? true,
          },
          investmentPreferences: userData.preferences.investmentPreferences || [],
          theme: userData.preferences.theme || 'light',
        });
      }
    }
  }, [userData]);
  
  // Handle profile form change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle notification preference change
  const handleNotificationChange = (type, value) => {
    setPreferencesData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }));
  };
  
  // Handle theme preference change
  const handleThemeChange = (value) => {
    setPreferencesData(prev => ({
      ...prev,
      theme: value
    }));
    
    // Apply theme immediately
    updatePreferencesMutation.mutate({
      preferences: {
        theme: value
      }
    });
  };
  
  // Handle investment preference change
  const handleInvestmentPreferenceChange = (e) => {
    const { value, checked } = e.target;
    setPreferencesData(prev => {
      const currentPreferences = [...prev.investmentPreferences];
      
      if (checked && !currentPreferences.includes(value)) {
        currentPreferences.push(value);
      } else if (!checked && currentPreferences.includes(value)) {
        const index = currentPreferences.indexOf(value);
        currentPreferences.splice(index, 1);
      }
      
      return {
        ...prev,
        investmentPreferences: currentPreferences
      };
    });
  };
  
  // Handle profile form submission
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };
  
  // Handle password form submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'New password and confirmation do not match.',
        variant: 'destructive',
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Password too short',
        description: 'New password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };
  
  // Handle preferences form submission
  const handlePreferencesSubmit = (e) => {
    e.preventDefault();
    updatePreferencesMutation.mutate({
      preferences: preferencesData
    });
  };
  
  // Placeholder for profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload the file to a server
      // For now, create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileData(prev => ({
          ...prev,
          profileImage: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">My Profile</h1>
      <p className="text-gray-500 mb-6">
        Manage your personal information and account preferences
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Personal Information
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <BellIcon className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>
        
        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card>
            <div className="p-6">
              {isLoadingUser ? (
                <div className="flex justify-center">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-semibold">Personal Details</h2>
                    {!isEditingProfile ? (
                      <Button onClick={() => setIsEditingProfile(true)}>
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingProfile(false);
                            if (userData) {
                              setProfileData({
                                name: userData.name || '',
                                email: userData.email || '',
                                phone: userData.phone || '',
                                address: userData.address || '',
                                profileImage: userData.profileImage || '',
                              });
                            }
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          form="profile-form"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <Avatar className="h-32 w-32 mb-4">
                          {profileData.profileImage ? (
                            <img 
                              src={profileData.profileImage} 
                              alt={userData?.name} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="h-12 w-12 text-gray-500" />
                            </div>
                          )}
                        </Avatar>
                        
                        {isEditingProfile && (
                          <div className="absolute bottom-4 right-0">
                            <label 
                              htmlFor="profile-image"
                              className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                            >
                              <CameraIcon className="h-4 w-4" />
                            </label>
                            <input
                              id="profile-image"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <h3 className="font-medium text-lg">
                          {userData?.name || 'User'}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Member since {new Date(userData?.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="mt-4">
                        <Badge variant={userData?.kycStatus === 'verified' ? 'success' : userData?.kycStatus === 'pending' ? 'warning' : 'default'}>
                          KYC Status: {userData?.kycStatus?.charAt(0).toUpperCase() + userData?.kycStatus?.slice(1) || 'Not Started'}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Profile Form */}
                    <div className="flex-1">
                      <form id="profile-form" onSubmit={handleProfileSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={profileData.name}
                              onChange={handleProfileChange}
                              disabled={!isEditingProfile}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={profileData.email}
                              onChange={handleProfileChange}
                              disabled={!isEditingProfile}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={profileData.phone}
                              onChange={handleProfileChange}
                              disabled={!isEditingProfile}
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              name="address"
                              value={profileData.address}
                              onChange={handleProfileChange}
                              disabled={!isEditingProfile}
                            />
                          </div>
                        </div>
                      </form>
                      
                      {!isEditingProfile && (
                        <div className="mt-6">
                          <Alert>
                            <InformationCircleIcon className="h-4 w-4" />
                            <AlertTitle>Need to update your KYC information?</AlertTitle>
                            <AlertDescription>
                              To update your identity verification documents, please visit the{' '}
                              <a href="/kyc" className="font-medium underline">
                                KYC Verification
                              </a>{' '}
                              page.
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold">Security Settings</h2>
                {!isChangingPassword ? (
                  <Button onClick={() => setIsChangingPassword(true)}>
                    Change Password
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      form="password-form"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </div>
                )}
              </div>
              
              {isChangingPassword ? (
                <form id="password-form" onSubmit={handlePasswordSubmit}>
                  <div className="space-y-4 max-w-lg">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={8}
                      />
                      <p className="text-xs text-gray-500">
                        Must be at least 8 characters long
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <KeyIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Password</h3>
                      <p className="text-gray-500 text-sm mb-2">
                        Your password was last changed {userData?.passwordChangedAt ? new Date(userData.passwordChangedAt).toLocaleDateString() : 'never'}.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}>
                        Change Password
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <ShieldCheckIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Two-Factor Authentication</h3>
                      <p className="text-gray-500 text-sm mb-2">
                        Add an extra layer of security to your account.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => window.location.href = '/profile/2fa'}>
                        Setup 2FA
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <BellIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Login Notifications</h3>
                      <p className="text-gray-500 text-sm mb-2">
                        Get notified when someone logs into your account from a new device.
                      </p>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="login-notifications" 
                          checked={preferencesData.notifications.email}
                          onCheckedChange={(checked) => {
                            handleNotificationChange('email', checked);
                            // Update immediately
                            updatePreferencesMutation.mutate({
                              preferences: {
                                notifications: {
                                  ...preferencesData.notifications,
                                  email: checked
                                }
                              }
                            });
                          }}
                        />
                        <Label htmlFor="login-notifications">
                          Receive login alert emails
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">User Preferences</h2>
              
              <form id="preferences-form" onSubmit={handlePreferencesSubmit}>
                <div className="space-y-8">
                  {/* Notification Preferences */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                          <p className="text-sm text-gray-500">Receive updates, ROI payments, and property alerts</p>
                        </div>
                        <Switch 
                          id="email-notifications" 
                          checked={preferencesData.notifications.email}
                          onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms-notifications" className="font-medium">SMS Notifications</Label>
                          <p className="text-sm text-gray-500">Get text messages for urgent updates</p>
                        </div>
                        <Switch 
                          id="sms-notifications" 
                          checked={preferencesData.notifications.sms}
                          onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="inapp-notifications" className="font-medium">In-App Notifications</Label>
                          <p className="text-sm text-gray-500">Show alerts and updates within the platform</p>
                        </div>
                        <Switch 
                          id="inapp-notifications" 
                          checked={preferencesData.notifications.inApp}
                          onCheckedChange={(checked) => handleNotificationChange('inApp', checked)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Theme Preferences */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Display Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="theme-preference" className="font-medium">Theme</Label>
                        <Select
                          id="theme-preference"
                          value={preferencesData.theme}
                          onChange={(e) => handleThemeChange(e.target.value)}
                          className="mt-1"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System Default</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Investment Preferences */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Investment Preferences</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Select the property types you're interested in to receive tailored investment opportunities
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {['residential', 'commercial', 'industrial', 'retail', 'hospitality', 'land', 'mixed-use', 'office'].map((type) => (
                        <div key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`type-${type}`}
                            value={type}
                            checked={preferencesData.investmentPreferences.includes(type)}
                            onChange={handleInvestmentPreferenceChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={updatePreferencesMutation.isPending}
                    >
                      {updatePreferencesMutation.isPending ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Preferences'
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;