import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../hooks/useApiRequest';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  ScrollArea,
  Separator,
} from '../ui/DesignSystem';

import {
  BellIcon,
  CheckCircleIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  CurrencyDollarIcon,
  IdentificationIcon,
  ChartBarIcon,
  CreditCardIcon,
  ServerIcon,
  EyeIcon,
  BellAlertIcon,
  BellSlashIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

/**
 * NotificationCenter Component
 * 
 * Provides a persistent notification center UI that displays in-app
 * notifications and allows users to manage their notification settings
 */
const NotificationCenter = () => {
  const { user } = useAuth();
  const api = useApiRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Get notifications
  const {
    data: notificationsData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const response = await api.get('notifications');
      return response.data.data;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (ids) => {
      const response = await api.post('notifications/mark-read', { ids });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/notifications']);
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
      toast({
        title: 'All Notifications Marked as Read',
        description: 'Your notification center has been cleared',
        variant: 'success',
      });
    }
  });
  
  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`notifications/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/notifications']);
    }
  });
  
  // Mark notification as read when opened
  useEffect(() => {
    if (open && notificationsData?.notifications) {
      const unreadIds = notificationsData.notifications
        .filter(notif => !notif.isRead)
        .map(notif => notif.id);
      
      if (unreadIds.length > 0) {
        markAsReadMutation.mutate(unreadIds);
      }
    }
  }, [open, notificationsData]);
  
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
      case 'system':
        return <ServerIcon className="h-5 w-5 text-gray-500" />;
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
  
  // Get notification time display
  const getTimeDisplay = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true });
      } else {
        return format(date, 'MMM d, h:mm a');
      }
    } catch (e) {
      return 'Unknown time';
    }
  };
  
  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    if (!notificationsData?.notifications) return [];
    
    if (activeTab === 'all') {
      return notificationsData.notifications;
    }
    
    return notificationsData.notifications.filter(
      notification => notification.type === activeTab
    );
  };
  
  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notificationsData?.meta?.unreadCount || 0;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <BellIcon className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <BellIcon className="h-5 w-5" />
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
              title="Mark all as read"
            >
              <CheckCircleIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
              title="Refresh notifications"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="p-2 border-b">
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="investment" className="text-xs">Investments</TabsTrigger>
              <TabsTrigger value="roi" className="text-xs">ROI</TabsTrigger>
              <TabsTrigger value="kyc" className="text-xs">KYC</TabsTrigger>
              <TabsTrigger value="wallet" className="text-xs">Wallet</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="focus-visible:outline-none">
            <ScrollArea className="h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent" />
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type, notification.data?.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-sm font-medium">
                              {notification.title}
                            </p>
                            <div className="flex ml-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => deleteNotificationMutation.mutate(notification.id)}
                                title="Remove notification"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <Link href={getNotificationAction(notification)}>
                              <Button size="sm" variant="link" className="h-auto p-0 text-xs font-medium flex items-center gap-1">
                                <EyeIcon className="h-3 w-3" />
                                View Details
                              </Button>
                            </Link>
                            <span className="text-xs text-gray-500">
                              {getTimeDisplay(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BellSlashIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">No notifications found</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activeTab === 'all' 
                      ? "You're all caught up!" 
                      : `You don't have any ${activeTab} notifications`}
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <div className="p-2 border-t">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/notifications">View All Notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;