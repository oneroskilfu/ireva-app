import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useApiRequest } from '../hooks/useApiRequest';
import { useToast } from '../hooks/use-toast';
import {
  Bell,
  BellRing,
  X,
  Info,
  AlertTriangle,
  Check,
  Building,
  DollarSign,
  Calendar,
  FileText,
  Clock,
  ChevronDown
} from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Badge,
  ScrollArea,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Avatar,
} from './ui/DesignSystem';

// Format date utility
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
};

// Get notification icon based on type
const getNotificationIcon = (type) => {
  switch (type) {
    case 'property':
      return <Building className="h-5 w-5 text-blue-500" />;
    case 'investment':
      return <DollarSign className="h-5 w-5 text-green-500" />;
    case 'roi':
      return <DollarSign className="h-5 w-5 text-green-600" />;
    case 'document':
      return <FileText className="h-5 w-5 text-orange-500" />;
    case 'reminder':
      return <Calendar className="h-5 w-5 text-purple-500" />;
    case 'alert':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'success':
      return <Check className="h-5 w-5 text-green-500" />;
    default:
      return <Info className="h-5 w-5 text-gray-500" />;
  }
};

const NotificationCenter = () => {
  const { user } = useAuth();
  const api = useApiRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch notifications
  const { 
    data: notificationsData,
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const response = await api.get('notifications');
      return response.data;
    },
    refetchOnWindowFocus: false,
    refetchInterval: 60000, // Refetch every minute
    enabled: !!user,
  });
  
  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const response = await api.patch(`notifications/${notificationId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/notifications']);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    },
  });
  
  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch('notifications/read-all');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/notifications']);
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    },
  });
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate to associated content if link exists
    if (notification.link) {
      window.location.href = notification.link;
    }
    
    // Close popover
    setIsOpen(false);
  };
  
  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    if (!notificationsData || !notificationsData.data || !notificationsData.data.notifications) {
      return [];
    }
    
    const notifications = notificationsData.data.notifications;
    
    if (activeTab === 'all') {
      return notifications;
    } else if (activeTab === 'unread') {
      return notifications.filter(notification => !notification.isRead);
    } else {
      return notifications.filter(notification => notification.type === activeTab);
    }
  };
  
  // Count unread notifications
  const unreadCount = notificationsData?.data?.notifications 
    ? notificationsData.data.notifications.filter(notification => !notification.isRead).length 
    : 0;
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label="Notifications"
        >
          {unreadCount > 0 ? (
            <>
              <BellRing className="h-5 w-5" />
              <Badge 
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[380px] p-0" 
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                Mark all as read
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={refetch}
              aria-label="Refresh notifications"
            >
              <Clock className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-2 pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="investment" className="flex-1">
                Investment
              </TabsTrigger>
              <TabsTrigger value="roi" className="flex-1">
                ROI
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[350px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-500">Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-red-500">Failed to load notifications</p>
                </div>
              ) : getFilteredNotifications().length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[250px] p-4">
                  <Bell className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No notifications</p>
                  {activeTab === 'unread' && (
                    <p className="text-xs text-gray-400 mt-1">
                      You're all caught up!
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  {getFilteredNotifications().map((notification) => (
                    <div key={notification.id}>
                      <div 
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          !notification.isRead ? 'bg-gray-50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex">
                          <div className="flex-shrink-0 mr-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              notification.isRead ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="flex-shrink-0 ml-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <div className="p-2 border-t text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.location.href = '/notifications';
                  setIsOpen(false);
                }}
                className="text-xs w-full"
              >
                View All Notifications
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;