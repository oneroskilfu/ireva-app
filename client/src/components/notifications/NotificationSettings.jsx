import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../hooks/useApiRequest';
import { useToast } from '../../hooks/use-toast';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Switch,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Separator,
  Alert,
  AlertTitle,
  AlertDescription,
} from '../ui/DesignSystem';

import { 
  BellIcon, 
  EnvelopeIcon, 
  DevicePhoneMobileIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  BellSlashIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

/**
 * NotificationSettings Component
 * 
 * Allows users to configure their notification preferences across
 * different channels (in-app, email, SMS) and notification types
 */
const NotificationSettings = () => {
  const api = useApiRequest();
  const { toast } = useToast();
  
  // State for notification preferences
  const [preferences, setPreferences] = useState({
    email: true,
    inApp: true,
    sms: false,
    investment: true,
    roi: true,
    kyc: true,
    wallet: true,
    system: true
  });
  
  // State for phone verification
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  
  // Get user notification preferences
  const { data: preferencesData, isLoading, refetch } = useQuery({
    queryKey: ['/api/users/notification-preferences'],
    queryFn: async () => {
      const response = await api.get('users/notification-preferences');
      return response.data.data.preferences;
    },
    onSuccess: (data) => {
      if (data) {
        setPreferences(data);
      }
    }
  });
  
  // Update notification preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updatedPrefs) => {
      const response = await api.put('users/notification-preferences', {
        preferences: updatedPrefs
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been saved.',
        variant: 'success',
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update notification preferences.',
        variant: 'destructive',
      });
    }
  });
  
  // Handle preference change
  const handlePreferenceChange = (key, value) => {
    const newPreferences = {
      ...preferences,
      [key]: value
    };
    
    // If turning off email notifications, show warning
    if (key === 'email' && !value && preferences.email) {
      toast({
        title: 'Important Notice',
        description: 'You will no longer receive email notifications for important updates.',
        variant: 'warning',
      });
    }
    
    // Update preferences in state and send to server
    setPreferences(newPreferences);
    updatePreferencesMutation.mutate(newPreferences);
  };
  
  // Phone verification logic would be implemented here
  // This is a placeholder for demonstration purposes
  const handleVerifyPhone = () => {
    toast({
      title: 'Verification Code Sent',
      description: 'A verification code has been sent to your phone number.',
      variant: 'success',
    });
    
    // In a real implementation, this would trigger sending an SMS verification code
    // and then show a verification code input field
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellIcon className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Customize how and when you receive notifications from the platform
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="channels" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="channels">Communication Channels</TabsTrigger>
            <TabsTrigger value="types">Notification Types</TabsTrigger>
          </TabsList>
          
          <TabsContent value="channels" className="space-y-6 pt-4">
            <div className="grid gap-6">
              {/* In-App Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <BellIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <Label htmlFor="in-app-notifications" className="font-medium">In-App Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications within the platform
                    </p>
                  </div>
                </div>
                <Switch
                  id="in-app-notifications"
                  checked={preferences.inApp}
                  onCheckedChange={(checked) => handlePreferenceChange('inApp', checked)}
                />
              </div>
              
              <Separator />
              
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <EnvelopeIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive important updates via email
                    </p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.email}
                  onCheckedChange={(checked) => handlePreferenceChange('email', checked)}
                />
              </div>
              
              <Separator />
              
              {/* SMS Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <DevicePhoneMobileIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <Label htmlFor="sms-notifications" className="font-medium">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive urgent alerts via text message
                    </p>
                    {!phoneVerified && (
                      <Alert variant="warning" className="mt-2">
                        <XCircleIcon className="h-4 w-4" />
                        <AlertTitle className="text-xs">Phone Not Verified</AlertTitle>
                        <AlertDescription className="text-xs">
                          Verify your phone number to enable SMS notifications.
                        </AlertDescription>
                        <Button size="sm" variant="outline" className="mt-2" onClick={handleVerifyPhone}>
                          Verify Phone
                        </Button>
                      </Alert>
                    )}
                  </div>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={preferences.sms && phoneVerified}
                  onCheckedChange={(checked) => handlePreferenceChange('sms', checked)}
                  disabled={!phoneVerified}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="types" className="space-y-6 pt-4">
            <div className="grid gap-6">
              {/* Investment Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <Label htmlFor="investment-notifications" className="font-medium">Investment Updates</Label>
                    <p className="text-sm text-gray-500">
                      New investment opportunities and confirmations
                    </p>
                  </div>
                </div>
                <Switch
                  id="investment-notifications"
                  checked={preferences.investment}
                  onCheckedChange={(checked) => handlePreferenceChange('investment', checked)}
                />
              </div>
              
              <Separator />
              
              {/* ROI Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <ChartBarIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <Label htmlFor="roi-notifications" className="font-medium">ROI & Payments</Label>
                    <p className="text-sm text-gray-500">
                      Returns on investment and dividend payments
                    </p>
                  </div>
                </div>
                <Switch
                  id="roi-notifications"
                  checked={preferences.roi}
                  onCheckedChange={(checked) => handlePreferenceChange('roi', checked)}
                />
              </div>
              
              <Separator />
              
              {/* KYC Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <ShieldCheckIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <Label htmlFor="kyc-notifications" className="font-medium">KYC & Verification</Label>
                    <p className="text-sm text-gray-500">
                      Identity verification status updates
                    </p>
                  </div>
                </div>
                <Switch
                  id="kyc-notifications"
                  checked={preferences.kyc}
                  onCheckedChange={(checked) => handlePreferenceChange('kyc', checked)}
                />
              </div>
              
              <Separator />
              
              {/* Wallet Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CreditCardIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <Label htmlFor="wallet-notifications" className="font-medium">Wallet Activities</Label>
                    <p className="text-sm text-gray-500">
                      Deposits, withdrawals, and other transactions
                    </p>
                  </div>
                </div>
                <Switch
                  id="wallet-notifications"
                  checked={preferences.wallet}
                  onCheckedChange={(checked) => handlePreferenceChange('wallet', checked)}
                />
              </div>
              
              <Separator />
              
              {/* System Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <BellIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <Label htmlFor="system-notifications" className="font-medium">System Updates</Label>
                    <p className="text-sm text-gray-500">
                      Platform updates, maintenance, and security alerts
                    </p>
                  </div>
                </div>
                <Switch
                  id="system-notifications"
                  checked={preferences.system}
                  onCheckedChange={(checked) => handlePreferenceChange('system', checked)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Alert>
          <InformationCircleIcon className="h-4 w-4" />
          <AlertTitle>Critical Notifications</AlertTitle>
          <AlertDescription>
            Some essential security and account-related notifications cannot be disabled and will always be delivered.
          </AlertDescription>
        </Alert>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
        <Button 
          variant="outline" 
          onClick={() => updatePreferencesMutation.mutate(preferences)}
          disabled={updatePreferencesMutation.isPending}
        >
          {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationSettings;