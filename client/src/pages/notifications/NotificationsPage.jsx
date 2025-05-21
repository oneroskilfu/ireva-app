import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../hooks/useApiRequest';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { format } from 'date-fns';
import { Link } from 'wouter';
import NotificationSettings from '../../components/notifications/NotificationSettings';
import TestNotifications from '../../components/notifications/TestNotifications';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Checkbox,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
} from '../../components/ui/DesignSystem';

import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  IdentificationIcon,
  ChartBarIcon,
  CreditCardIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  EyeIcon,
  TrashIcon,
  CheckBadgeIcon,
  InformationCircleIcon,
  BellSlashIcon,
} from '@heroicons/react/24/outline';

const NotificationsPage = () => {
  const { user } = useAuth();
  const api = useApiRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    inApp: true,
    sms: false,
    investment: true,
    roi: true,
    kyc: true,
    wallet: true,
    system: true
  });
  
  // Get notifications
  const {
    data: notificationsData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['/api/notifications', page, activeTab],
    queryFn: async () => {
      let url = `notifications?page=${page}&limit=20`;
      
      if (activeTab !== 'all') {
        url += `&type=${activeTab}`;
      }
      
      const response = await api.get(url);
      return response.data.data;
    },
    enabled: !!user
  });
  
  // Get user notification preferences
  const {
    data: preferencesData,
    isLoading: isLoadingPreferences
  } = useQuery({
    queryKey: ['/api/users/notification-preferences'],
    queryFn: async () => {
      const response = await api.get('users/notification-preferences');
      return response.data.data.preferences;
    },
    enabled: !!user,
    onSuccess: (data) => {
      if (data) {
        setNotificationPreferences({
          ...notificationPreferences,
          ...data
        });
      }
    }
  });
  
  // Update notification preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences) => {
      const response = await api.put('users/notification-preferences', { preferences });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been saved',
        variant: 'success',
      });
      queryClient.invalidateQuery(['/api/users/notification-preferences']);
    }
  });
  
  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (ids) => {
      const response = await api.post('notifications/mark-read', { ids });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/notifications']);
      setSelectedNotifications([]);
      toast({
        title: 'Notifications Marked as Read',
        variant: 'success',
      });
    }
  });
  
  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('notifications/mark-all-read');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/notifications']);
      setSelectedNotifications([]);
      toast({
        title: 'All Notifications Marked as Read',
        description: 'Your notification center has been cleared',
        variant: 'success',
      });
    }
  });
  
  // Delete notifications mutation
  const deleteNotificationsMutation = useMutation({
    mutationFn: async (ids) => {
      const response = await api.post('notifications/delete', { ids });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/notifications']);
      setSelectedNotifications([]);
      toast({
        title: 'Notifications Deleted',
        variant: 'success',
      });
    }
  });
  
  // Handle preferences change
  const handlePreferenceChange = (key, value) => {
    const newPreferences = {
      ...notificationPreferences,
      [key]: value
    };
    
    setNotificationPreferences(newPreferences);
    updatePreferencesMutation.mutate(newPreferences);
  };
  
  // Handle notification selection
  const handleSelectNotification = (id) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(nId => nId !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };
  
  // Handle select all notifications
  const handleSelectAll = () => {
    if (notificationsData && notificationsData.notifications) {
      if (selectedNotifications.length === notificationsData.notifications.length) {
        setSelectedNotifications([]);
      } else {
        setSelectedNotifications(notificationsData.notifications.map(n => n.id));
      }
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type, status = null) => {
    switch (type) {
      case 'investment':
        return <CurrencyDollarIcon className="h-5 w-5 text-green-500" />;
      case 'kyc':
        if (status === 'approved') {
          return <CheckBadgeIcon className="h-5 w-5 text-green-500" />;
        } else if (status === 'rejected') {
          return <XMarkIcon className="h-5 w-5 text-red-500" />;
        }
        return <IdentificationIcon className="h-5 w-5 text-yellow-500" />;
      case 'roi':
        return <ChartBarIcon className="h-5 w-5 text-purple-500" />;
      case 'wallet':
        return <CreditCardIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get notification action URL
  const getNotificationAction = (notification) => {
    switch (notification.type) {
      case 'investment':
        return `/investments/${notification.data?.investmentId || ''}`;
      case 'kyc':
        return '/profile/kyc';
      case 'roi':
        return `/investments/${notification.data?.investmentId || ''}`;
      case 'wallet':
        return '/wallet/transactions';
      default:
        return '#';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600">Manage your notifications and communication preferences</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BellIcon className="h-5 w-5" />
                    Notification Center
                    {notificationsData?.meta?.unreadCount > 0 && (
                      <Badge className="ml-2" variant="secondary">
                        {notificationsData.meta.unreadCount} unread
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      disabled={isLoading}
                      className="flex items-center gap-1"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only">Refresh</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAllAsReadMutation.mutate()}
                      disabled={
                        !notificationsData?.notifications?.length ||
                        !notificationsData?.meta?.unreadCount ||
                        markAllAsReadMutation.isPending
                      }
                      className="flex items-center gap-1"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only">Mark All Read</span>
                    </Button>
                  </div>
                </div>
                
                <TabsList className="w-full mt-4 grid grid-cols-5">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="investment" className="text-xs">Investments</TabsTrigger>
                  <TabsTrigger value="roi" className="text-xs">ROI</TabsTrigger>
                  <TabsTrigger value="kyc" className="text-xs">KYC</TabsTrigger>
                  <TabsTrigger value="wallet" className="text-xs">Wallet</TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent className="pt-4">
                {selectedNotifications.length > 0 && (
                  <div className="flex items-center justify-between p-2 mb-4 bg-gray-100 rounded-md">
                    <div className="text-sm">
                      {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsReadMutation.mutate(selectedNotifications)}
                        disabled={markAsReadMutation.isPending}
                        className="flex items-center gap-1 text-xs"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Mark Read
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteNotificationsMutation.mutate(selectedNotifications)}
                        disabled={deleteNotificationsMutation.isPending}
                        className="flex items-center gap-1 text-xs"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
                
                <TabsContent value={activeTab} className="space-y-4 mt-0 focus-visible:outline-none">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent" />
                    </div>
                  ) : notificationsData?.notifications?.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2 py-2 px-4 border-b">
                        <Checkbox
                          id="select-all"
                          checked={
                            notificationsData.notifications.length > 0 &&
                            selectedNotifications.length === notificationsData.notifications.length
                          }
                          onCheckedChange={handleSelectAll}
                        />
                        <Label htmlFor="select-all" className="text-xs text-gray-600">Select All</Label>
                      </div>
                      
                      {notificationsData.notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start p-4 border rounded-md ${
                            !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <Checkbox
                              id={`notification-${notification.id}`}
                              checked={selectedNotifications.includes(notification.id)}
                              onCheckedChange={() => handleSelectNotification(notification.id)}
                              className="mt-1"
                            />
                            
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type, notification.data?.status)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium">{notification.title}</p>
                                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                  
                                  {notification.data && Object.keys(notification.data).length > 0 && (
                                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                                      {notification.data.propertyName && (
                                        <div className="text-xs">
                                          <span className="text-gray-500">Property: </span>
                                          <span className="font-medium">{notification.data.propertyName}</span>
                                        </div>
                                      )}
                                      
                                      {notification.data.amount && (
                                        <div className="text-xs">
                                          <span className="text-gray-500">Amount: </span>
                                          <span className="font-medium">${notification.data.amount}</span>
                                        </div>
                                      )}
                                      
                                      {notification.data.status && (
                                        <div className="text-xs">
                                          <span className="text-gray-500">Status: </span>
                                          <span className="font-medium capitalize">{notification.data.status}</span>
                                        </div>
                                      )}
                                      
                                      {notification.data.date && (
                                        <div className="text-xs">
                                          <span className="text-gray-500">Date: </span>
                                          <span className="font-medium">{formatDate(notification.data.date)}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center mt-3">
                                    <Link href={getNotificationAction(notification)}>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs flex items-center gap-1"
                                      >
                                        <EyeIcon className="h-3 w-3" />
                                        View Details
                                      </Button>
                                    </Link>
                                    
                                    <div className="ml-auto flex items-center gap-2">
                                      <span className="text-xs text-gray-500">
                                        {formatDate(notification.createdAt)}
                                      </span>
                                      
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteNotificationsMutation.mutate([notification.id])}
                                        className="h-6 w-6 p-0"
                                      >
                                        <TrashIcon className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Pagination */}
                      {notificationsData.pagination.pages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                            disabled={page === 1}
                          >
                            Previous
                          </Button>
                          
                          <span className="text-sm">
                            Page {page} of {notificationsData.pagination.pages}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(p + 1, notificationsData.pagination.pages))}
                            disabled={page === notificationsData.pagination.pages}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <BellSlashIcon className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                      <p className="text-gray-600 mt-1">
                        {activeTab === 'all'
                          ? "You don't have any notifications yet"
                          : `You don't have any ${activeTab} notifications`}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Card>
            
            {/* Test Notifications Section */}
            {user?.role === 'admin' && (
              <div className="mt-6">
                <TestNotifications />
              </div>
            )}
          </Tabs>
        </div>
        
        <div className="space-y-6">
          {/* Use our enhanced NotificationSettings component */}
          <NotificationSettings />
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;