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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
  Textarea,
  Checkbox,
  Label,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  RadioGroup,
  RadioGroupItem,
  ScrollArea,
  Badge,
  Separator,
  Alert,
  AlertTitle,
  AlertDescription,
} from '../ui/DesignSystem';

import {
  UsersIcon,
  BellIcon,
  MegaphoneIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
  FunnelIcon,
  ArrowRightCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  CalendarIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * AdminBulkNotifications Component
 * 
 * Administrative tool for sending notifications to multiple users
 * based on various filtering criteria
 */
const AdminBulkNotifications = () => {
  const api = useApiRequest();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('compose');

  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'system',
    priority: 'normal',
    targetAudience: 'all',
    channels: ['in-app', 'email'],
    scheduledTime: null,
    userFilters: {
      roles: ['investor'],
      kycStatus: [],
      investmentStatus: [],
      activityPeriod: null,
      minInvestmentAmount: '',
      properties: []
    }
  });

  // Selected user filters flag
  const [usingAdvancedFilters, setUsingAdvancedFilters] = useState(false);
  
  // Recipient count
  const [recipientCount, setRecipientCount] = useState(0);
  
  // Audience preview
  const [showAudiencePreview, setShowAudiencePreview] = useState(false);

  // Preview recipients
  const [recipientPreview, setRecipientPreview] = useState([]);

  // Fetch user statistics for estimation
  const { data: userStats } = useQuery({
    queryKey: ['/api/admin/users/stats'],
    queryFn: async () => {
      try {
        const response = await api.get('admin/users/stats');
        return response.data.data;
      } catch (error) {
        console.error('Error fetching user stats:', error);
        return {
          totalUsers: 0,
          activeUsers: 0,
          investorCount: 0,
          adminCount: 0,
          kycVerified: 0,
          kycPending: 0,
          activeInvestors: 0
        };
      }
    }
  });

  // Fetch properties for property-specific notifications
  const { data: properties } = useQuery({
    queryKey: ['/api/properties/list'],
    queryFn: async () => {
      try {
        const response = await api.get('properties/list');
        return response.data.data;
      } catch (error) {
        console.error('Error fetching properties:', error);
        return [];
      }
    }
  });

  // Send bulk notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('admin/notifications/bulk', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Notifications Sent',
        description: `Successfully sent to ${data.sentCount} recipients.`,
        variant: 'success',
      });
      // Reset form after successful send
      handleResetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error Sending Notifications',
        description: error.response?.data?.message || 'Failed to send notifications',
        variant: 'destructive',
      });
    }
  });

  // Get recipient count
  const getRecipientCountMutation = useMutation({
    mutationFn: async (filters) => {
      const response = await api.post('admin/notifications/recipient-count', filters);
      return response.data;
    },
    onSuccess: (data) => {
      setRecipientCount(data.count);
      
      // Update preview list (first 5 users)
      if (data.preview && data.preview.length > 0) {
        setRecipientPreview(data.preview.slice(0, 5));
      }
    },
    onError: (error) => {
      setRecipientCount(0);
      setRecipientPreview([]);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to get recipient count',
        variant: 'destructive',
      });
    }
  });

  // Handle form field changes
  const handleFormChange = (field, value) => {
    setNotificationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle user filter changes
  const handleFilterChange = (field, value) => {
    setNotificationForm(prev => ({
      ...prev,
      userFilters: {
        ...prev.userFilters,
        [field]: value
      }
    }));
  };

  // Toggle channel selection
  const handleChannelToggle = (channel) => {
    const updatedChannels = notificationForm.channels.includes(channel)
      ? notificationForm.channels.filter(c => c !== channel)
      : [...notificationForm.channels, channel];
    
    handleFormChange('channels', updatedChannels);
  };

  // Get updated recipient count
  const updateRecipientCount = () => {
    // Only use filters if advanced filtering is enabled
    const filters = usingAdvancedFilters ? notificationForm.userFilters : {};
    
    getRecipientCountMutation.mutate({
      targetAudience: notificationForm.targetAudience,
      ...filters
    });
  };

  // Effect to update recipient count when filters change
  useEffect(() => {
    updateRecipientCount();
  }, [notificationForm.targetAudience, usingAdvancedFilters]);

  // Effect to update recipient count when specific filters change (if advanced filters enabled)
  useEffect(() => {
    if (usingAdvancedFilters) {
      updateRecipientCount();
    }
  }, [notificationForm.userFilters]);

  // Toggle role selection
  const handleRoleToggle = (role) => {
    const updatedRoles = notificationForm.userFilters.roles.includes(role)
      ? notificationForm.userFilters.roles.filter(r => r !== role)
      : [...notificationForm.userFilters.roles, role];
    
    handleFilterChange('roles', updatedRoles);
  };

  // Toggle KYC status selection
  const handleKycStatusToggle = (status) => {
    const updatedStatuses = notificationForm.userFilters.kycStatus.includes(status)
      ? notificationForm.userFilters.kycStatus.filter(s => s !== status)
      : [...notificationForm.userFilters.kycStatus, status];
    
    handleFilterChange('kycStatus', updatedStatuses);
  };

  // Toggle investment status selection
  const handleInvestmentStatusToggle = (status) => {
    const updatedStatuses = notificationForm.userFilters.investmentStatus.includes(status)
      ? notificationForm.userFilters.investmentStatus.filter(s => s !== status)
      : [...notificationForm.userFilters.investmentStatus, status];
    
    handleFilterChange('investmentStatus', updatedStatuses);
  };

  // Toggle property selection
  const handlePropertyToggle = (propertyId) => {
    const updatedProperties = notificationForm.userFilters.properties.includes(propertyId)
      ? notificationForm.userFilters.properties.filter(p => p !== propertyId)
      : [...notificationForm.userFilters.properties, propertyId];
    
    handleFilterChange('properties', updatedProperties);
  };

  // Send notification
  const handleSendNotification = () => {
    // Validate form
    if (!notificationForm.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a notification title',
        variant: 'destructive',
      });
      return;
    }

    if (!notificationForm.message.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a notification message',
        variant: 'destructive',
      });
      return;
    }

    if (notificationForm.channels.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one notification channel',
        variant: 'destructive',
      });
      return;
    }

    // Confirm if sending to a large audience
    if (recipientCount > 100) {
      if (!window.confirm(`You are about to send notifications to ${recipientCount} users. Do you want to proceed?`)) {
        return;
      }
    }

    // Prepare data for API
    const notificationData = {
      ...notificationForm,
      // Only include filters if advanced filtering is enabled
      userFilters: usingAdvancedFilters ? notificationForm.userFilters : {}
    };

    // Send notification
    sendNotificationMutation.mutate(notificationData);
  };

  // Reset form
  const handleResetForm = () => {
    setNotificationForm({
      title: '',
      message: '',
      type: 'system',
      priority: 'normal',
      targetAudience: 'all',
      channels: ['in-app', 'email'],
      scheduledTime: null,
      userFilters: {
        roles: ['investor'],
        kycStatus: [],
        investmentStatus: [],
        activityPeriod: null,
        minInvestmentAmount: '',
        properties: []
      }
    });
    setUsingAdvancedFilters(false);
    setShowAudiencePreview(false);
  };

  // Get estimated count based on audience type
  const getEstimatedCount = () => {
    if (!userStats) return 0;
    
    switch (notificationForm.targetAudience) {
      case 'all':
        return userStats.totalUsers || 0;
      case 'investors':
        return userStats.investorCount || 0;
      case 'admins':
        return userStats.adminCount || 0;
      case 'active':
        return userStats.activeUsers || 0;
      case 'kyc_verified':
        return userStats.kycVerified || 0;
      case 'kyc_pending':
        return userStats.kycPending || 0;
      case 'active_investors':
        return userStats.activeInvestors || 0;
      default:
        return 0;
    }
  };

  // Get human-readable audience name
  const getAudienceName = () => {
    switch (notificationForm.targetAudience) {
      case 'all':
        return 'All Users';
      case 'investors':
        return 'All Investors';
      case 'admins':
        return 'Admin Users';
      case 'active':
        return 'Active Users';
      case 'kyc_verified':
        return 'KYC Verified Users';
      case 'kyc_pending':
        return 'Users with Pending KYC';
      case 'active_investors':
        return 'Active Investors';
      default:
        return 'Custom Audience';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MegaphoneIcon className="h-5 w-5" />
          Bulk Notification System
        </CardTitle>
        <CardDescription>
          Send notifications to multiple users based on specific criteria
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6 border-b">
          <TabsList className="w-full">
            <TabsTrigger value="compose" className="flex-1">Compose</TabsTrigger>
            <TabsTrigger value="audience" className="flex-1">Target Audience</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-6">
          <TabsContent value="compose" className="space-y-6 mt-0">
            {/* Notification Type */}
            <div className="space-y-2">
              <Label htmlFor="notification-type">Notification Type</Label>
              <Select
                value={notificationForm.type}
                onValueChange={(value) => handleFormChange('type', value)}
              >
                <SelectTrigger id="notification-type">
                  <SelectValue placeholder="Select notification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System Announcement</SelectItem>
                  <SelectItem value="investment">Investment Opportunity</SelectItem>
                  <SelectItem value="roi">ROI Update</SelectItem>
                  <SelectItem value="kyc">KYC Information</SelectItem>
                  <SelectItem value="wallet">Wallet Update</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Notification Title */}
            <div className="space-y-2">
              <Label htmlFor="notification-title">Notification Title</Label>
              <Input
                id="notification-title"
                value={notificationForm.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="Enter a clear and concise title"
              />
            </div>
            
            {/* Notification Message */}
            <div className="space-y-2">
              <Label htmlFor="notification-message">Message Content</Label>
              <Textarea
                id="notification-message"
                value={notificationForm.message}
                onChange={(e) => handleFormChange('message', e.target.value)}
                placeholder="Enter the notification message"
                rows={4}
              />
            </div>
            
            {/* Notification Priority */}
            <div className="space-y-2">
              <Label>Priority Level</Label>
              <RadioGroup
                value={notificationForm.priority}
                onValueChange={(value) => handleFormChange('priority', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="priority-low" />
                  <Label htmlFor="priority-low" className="cursor-pointer">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="priority-normal" />
                  <Label htmlFor="priority-normal" className="cursor-pointer">Normal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="priority-high" />
                  <Label htmlFor="priority-high" className="cursor-pointer">High</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Notification Channels */}
            <div className="space-y-3">
              <Label>Delivery Channels</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="channel-in-app"
                    checked={notificationForm.channels.includes('in-app')}
                    onCheckedChange={() => handleChannelToggle('in-app')}
                  />
                  <Label htmlFor="channel-in-app" className="cursor-pointer flex items-center gap-2">
                    <BellIcon className="h-4 w-4 text-primary" />
                    In-App Notification
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="channel-email"
                    checked={notificationForm.channels.includes('email')}
                    onCheckedChange={() => handleChannelToggle('email')}
                  />
                  <Label htmlFor="channel-email" className="cursor-pointer flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4 text-green-600" />
                    Email Notification
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="channel-sms"
                    checked={notificationForm.channels.includes('sms')}
                    onCheckedChange={() => handleChannelToggle('sms')}
                  />
                  <Label htmlFor="channel-sms" className="cursor-pointer flex items-center gap-2">
                    <DevicePhoneMobileIcon className="h-4 w-4 text-purple-600" />
                    SMS Notification
                  </Label>
                </div>
              </div>
            </div>
            
            {/* Schedule Notification */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="schedule-notification">Schedule for Later</Label>
                <Switch
                  id="schedule-notification"
                  checked={!!notificationForm.scheduledTime}
                  onCheckedChange={(checked) => handleFormChange('scheduledTime', checked ? new Date().toISOString() : null)}
                />
              </div>
              
              {notificationForm.scheduledTime && (
                <div className="mt-2">
                  <Label htmlFor="scheduled-time">Scheduled Time</Label>
                  <Input
                    id="scheduled-time"
                    type="datetime-local"
                    value={notificationForm.scheduledTime ? new Date(notificationForm.scheduledTime).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleFormChange('scheduledTime', e.target.value ? new Date(e.target.value).toISOString() : null)}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
            
            {/* Recipient Summary */}
            <div className="bg-gray-50 p-4 rounded-md border">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <UserGroupIcon className="h-4 w-4 text-primary" />
                    Recipient Summary
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {usingAdvancedFilters ? 'Using advanced filters' : `Sending to ${getAudienceName()}`}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {getRecipientCountMutation.isPending ? (
                      <ArrowPathIcon className="h-5 w-5 animate-spin inline-block" />
                    ) : (
                      <span>{recipientCount.toLocaleString()}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">recipients</p>
                </div>
              </div>
              
              <div className="mt-2 flex justify-between">
                <Button
                  variant="link"
                  onClick={() => setShowAudiencePreview(!showAudiencePreview)}
                  className="p-0 h-auto text-xs flex items-center"
                >
                  {showAudiencePreview ? 'Hide Preview' : 'Show Recipients Preview'}
                  <ChevronDownIcon className={`h-3 w-3 ml-1 transform transition-transform ${showAudiencePreview ? 'rotate-180' : ''}`} />
                </Button>
                
                <Button
                  variant="link"
                  onClick={() => setActiveTab('audience')}
                  className="p-0 h-auto text-xs flex items-center"
                >
                  Modify Recipients
                  <ArrowRightCircleIcon className="h-3 w-3 ml-1" />
                </Button>
              </div>
              
              {showAudiencePreview && recipientPreview.length > 0 && (
                <div className="mt-3 border rounded-md overflow-hidden">
                  <div className="bg-gray-100 p-2 text-xs font-medium text-gray-700">
                    Preview (First 5 recipients)
                  </div>
                  <div className="divide-y">
                    {recipientPreview.map((user, index) => (
                      <div key={index} className="p-2 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-medium">{user.name || user.username}</span>
                          <span className="text-gray-500 ml-2">{user.email}</span>
                        </div>
                        {user.role && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {user.role}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  {recipientCount > 5 && (
                    <div className="bg-gray-50 p-2 text-xs text-center text-gray-500">
                      ...and {recipientCount - 5} more recipients
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="audience" className="mt-0">
            <div className="space-y-6">
              {/* Predefined Audiences */}
              <div className="space-y-3">
                <Label>Predefined Audiences</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {[
                    { id: 'all', label: 'All Users', icon: <UsersIcon className="h-4 w-4" />, count: userStats?.totalUsers || 0 },
                    { id: 'investors', label: 'All Investors', icon: <UsersIcon className="h-4 w-4" />, count: userStats?.investorCount || 0 },
                    { id: 'admins', label: 'Admin Users', icon: <UsersIcon className="h-4 w-4" />, count: userStats?.adminCount || 0 },
                    { id: 'active', label: 'Active Users', icon: <UsersIcon className="h-4 w-4" />, count: userStats?.activeUsers || 0 },
                    { id: 'kyc_verified', label: 'KYC Verified', icon: <CheckCircleIcon className="h-4 w-4" />, count: userStats?.kycVerified || 0 },
                    { id: 'kyc_pending', label: 'KYC Pending', icon: <ClockIcon className="h-4 w-4" />, count: userStats?.kycPending || 0 },
                    { id: 'active_investors', label: 'Active Investors', icon: <UsersIcon className="h-4 w-4" />, count: userStats?.activeInvestors || 0 },
                  ].map((audience) => (
                    <div
                      key={audience.id}
                      className={`border rounded-md p-3 cursor-pointer transition-colors ${
                        !usingAdvancedFilters && notificationForm.targetAudience === audience.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        handleFormChange('targetAudience', audience.id);
                        setUsingAdvancedFilters(false);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {audience.icon}
                          <span className="text-sm font-medium">{audience.label}</span>
                        </div>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {audience.count.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Advanced User Filtering */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Advanced Filtering</Label>
                  <Switch
                    checked={usingAdvancedFilters}
                    onCheckedChange={setUsingAdvancedFilters}
                  />
                </div>
                
                {usingAdvancedFilters && (
                  <div className="space-y-5 mt-4">
                    {/* Role Filters */}
                    <div className="space-y-2">
                      <Label>User Roles</Label>
                      <div className="flex flex-wrap gap-3">
                        {['investor', 'admin'].map((role) => (
                          <div
                            key={role}
                            className={`border rounded-md px-3 py-2 cursor-pointer transition-colors flex items-center gap-2 ${
                              notificationForm.userFilters.roles.includes(role)
                                ? 'bg-primary/10 border-primary'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleRoleToggle(role)}
                          >
                            <Checkbox
                              checked={notificationForm.userFilters.roles.includes(role)}
                              onCheckedChange={() => handleRoleToggle(role)}
                              id={`role-${role}`}
                            />
                            <Label htmlFor={`role-${role}`} className="cursor-pointer capitalize">
                              {role}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* KYC Status Filters */}
                    <div className="space-y-2">
                      <Label>KYC Status</Label>
                      <div className="flex flex-wrap gap-3">
                        {['verified', 'pending', 'rejected', 'not_submitted'].map((status) => (
                          <div
                            key={status}
                            className={`border rounded-md px-3 py-2 cursor-pointer transition-colors flex items-center gap-2 ${
                              notificationForm.userFilters.kycStatus.includes(status)
                                ? 'bg-primary/10 border-primary'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleKycStatusToggle(status)}
                          >
                            <Checkbox
                              checked={notificationForm.userFilters.kycStatus.includes(status)}
                              onCheckedChange={() => handleKycStatusToggle(status)}
                              id={`kyc-${status}`}
                            />
                            <Label htmlFor={`kyc-${status}`} className="cursor-pointer capitalize">
                              {status.replace('_', ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Investment Status Filters */}
                    <div className="space-y-2">
                      <Label>Investment Status</Label>
                      <div className="flex flex-wrap gap-3">
                        {['active_investor', 'no_investments', 'high_value'].map((status) => (
                          <div
                            key={status}
                            className={`border rounded-md px-3 py-2 cursor-pointer transition-colors flex items-center gap-2 ${
                              notificationForm.userFilters.investmentStatus.includes(status)
                                ? 'bg-primary/10 border-primary'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleInvestmentStatusToggle(status)}
                          >
                            <Checkbox
                              checked={notificationForm.userFilters.investmentStatus.includes(status)}
                              onCheckedChange={() => handleInvestmentStatusToggle(status)}
                              id={`investment-${status}`}
                            />
                            <Label htmlFor={`investment-${status}`} className="cursor-pointer capitalize">
                              {status.replace('_', ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Activity Period */}
                    <div className="space-y-2">
                      <Label>User Activity</Label>
                      <Select
                        value={notificationForm.userFilters.activityPeriod || ''}
                        onValueChange={(value) => handleFilterChange('activityPeriod', value || null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by user activity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any activity level</SelectItem>
                          <SelectItem value="active_7d">Active in last 7 days</SelectItem>
                          <SelectItem value="active_30d">Active in last 30 days</SelectItem>
                          <SelectItem value="inactive_30d">Inactive for 30+ days</SelectItem>
                          <SelectItem value="inactive_90d">Inactive for 90+ days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Investment Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="min-investment">Minimum Investment Amount</Label>
                      <Input
                        id="min-investment"
                        type="number"
                        placeholder="Enter minimum investment amount"
                        value={notificationForm.userFilters.minInvestmentAmount}
                        onChange={(e) => handleFilterChange('minInvestmentAmount', e.target.value)}
                      />
                    </div>
                    
                    {/* Property Filters */}
                    {properties && properties.length > 0 && (
                      <div className="space-y-2">
                        <Label>Filter by Property</Label>
                        <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                          {properties.map((property) => (
                            <div
                              key={property.id}
                              className="flex items-center space-x-2 py-1"
                            >
                              <Checkbox
                                id={`property-${property.id}`}
                                checked={notificationForm.userFilters.properties.includes(property.id)}
                                onCheckedChange={() => handlePropertyToggle(property.id)}
                              />
                              <Label htmlFor={`property-${property.id}`} className="cursor-pointer">
                                {property.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Current Selection Summary */}
              <div className="bg-gray-50 p-4 rounded-md border">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <FunnelIcon className="h-4 w-4 text-primary" />
                  Current Selection
                </h3>
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-sm">
                    {usingAdvancedFilters
                      ? 'Custom audience based on filters'
                      : getAudienceName()}
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {getRecipientCountMutation.isPending ? (
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      `${recipientCount.toLocaleString()} recipients`
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <div className="space-y-4">
              <Alert>
                <InformationCircleIcon className="h-4 w-4" />
                <AlertTitle>Notification History</AlertTitle>
                <AlertDescription>
                  View past bulk notifications sent to users.
                </AlertDescription>
              </Alert>
              
              {/* This would be populated with real data in a full implementation */}
              <div className="border rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 text-sm font-medium">
                  Recent Bulk Notifications
                </div>
                <div className="divide-y">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">System Maintenance Alert</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Notification about scheduled maintenance window
                        </p>
                      </div>
                      <Badge variant="outline">352 recipients</Badge>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>Sent 3 days ago</span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center">
                        <BellIcon className="h-3 w-3 mr-1" />
                        In-App
                      </span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center">
                        <EnvelopeIcon className="h-3 w-3 mr-1" />
                        Email
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">New Investment Opportunity</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Announcement of new property listing
                        </p>
                      </div>
                      <Badge variant="outline">218 recipients</Badge>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>Sent 1 week ago</span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center">
                        <BellIcon className="h-3 w-3 mr-1" />
                        In-App
                      </span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center">
                        <EnvelopeIcon className="h-3 w-3 mr-1" />
                        Email
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="flex justify-between border-t p-6">
        <Button
          variant="outline"
          onClick={handleResetForm}
        >
          Reset Form
        </Button>
        
        <div className="space-x-2">
          <Button
            variant="default"
            disabled={
              !notificationForm.title ||
              !notificationForm.message ||
              notificationForm.channels.length === 0 ||
              recipientCount === 0 ||
              sendNotificationMutation.isPending
            }
            onClick={handleSendNotification}
            className="px-6"
          >
            {notificationForm.scheduledTime ? 'Schedule Notification' : 'Send Notification'}
            {sendNotificationMutation.isPending && (
              <ArrowPathIcon className="ml-2 h-4 w-4 animate-spin" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AdminBulkNotifications;