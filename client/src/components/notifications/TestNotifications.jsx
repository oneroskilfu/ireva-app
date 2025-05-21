import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  Label,
} from '../ui/DesignSystem';

/**
 * TestNotifications Component
 * 
 * Allows administrators to easily test the notification system
 * by sending test notifications across different channels
 */
const TestNotifications = () => {
  const api = useApiRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [notificationType, setNotificationType] = useState('system');
  const [selectedChannels, setSelectedChannels] = useState(['in-app']);
  
  // Create test notification mutation
  const createTestNotification = useMutation({
    mutationFn: async () => {
      const response = await api.post('notifications/test', {
        type: notificationType,
        channels: selectedChannels
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQuery(['/api/notifications']);
      toast({
        title: 'Test Notification Sent',
        description: `A test ${notificationType} notification has been sent through the selected channels.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Sending Notification',
        description: error.response?.data?.message || 'An error occurred while sending the test notification.',
        variant: 'destructive',
      });
    }
  });
  
  // Handle notification type change
  const handleTypeChange = (value) => {
    setNotificationType(value);
  };
  
  // Handle channel selection
  const handleChannelChange = (channel) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter(c => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };
  
  // Send test notification
  const handleSendTest = () => {
    if (selectedChannels.length === 0) {
      toast({
        title: 'No Channels Selected',
        description: 'Please select at least one notification channel.',
        variant: 'destructive',
      });
      return;
    }
    
    createTestNotification.mutate();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Notification System</CardTitle>
        <CardDescription>
          Send test notifications to verify the notification system is working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="notification-type">Notification Type</Label>
          <Select
            value={notificationType}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger id="notification-type">
              <SelectValue placeholder="Select notification type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System Message</SelectItem>
              <SelectItem value="investment">Investment Update</SelectItem>
              <SelectItem value="roi">ROI Payment</SelectItem>
              <SelectItem value="kyc">KYC Verification</SelectItem>
              <SelectItem value="wallet">Wallet Transaction</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-3">
          <Label>Notification Channels</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="channel-in-app"
                checked={selectedChannels.includes('in-app')}
                onCheckedChange={() => handleChannelChange('in-app')}
              />
              <Label htmlFor="channel-in-app">In-App Notification</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="channel-email"
                checked={selectedChannels.includes('email')}
                onCheckedChange={() => handleChannelChange('email')}
              />
              <Label htmlFor="channel-email">Email Notification</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="channel-sms"
                checked={selectedChannels.includes('sms')}
                onCheckedChange={() => handleChannelChange('sms')}
              />
              <Label htmlFor="channel-sms">SMS Notification</Label>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-800">
            <p className="font-medium mb-1">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>SMS notifications require a verified phone number.</li>
              <li>Email notifications will be sent to your registered email address.</li>
              <li>Test notifications are marked as test data in the database.</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSendTest} 
          disabled={createTestNotification.isPending}
          className="w-full md:w-auto"
        >
          {createTestNotification.isPending ? 'Sending...' : 'Send Test Notification'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TestNotifications;