import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../hooks/useApiRequest';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'wouter';
import { format, formatDistanceToNow } from 'date-fns';
import { Bell, CheckCircle, X, Award, CreditCard, CheckSquare, LockKeyhole, Settings, ExternalLink } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from './ui/popover';
import { Button } from './ui/button';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

const NotificationBell = () => {
  const { user } = useAuth();
  const api = useApiRequest();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Query notifications
  const {
    data: notificationsData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const response = await api.get('notifications');
      return response.data;
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

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('notifications/mark-all-read');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/notifications']);
    }
  });

  // Mark notifications as read when opened
  useEffect(() => {
    if (open && notificationsData?.data?.notifications) {
      const unreadIds = notificationsData.data.notifications
        .filter(notif => !notif.isRead)
        .map(notif => notif.id);
      
      if (unreadIds.length > 0) {
        markAsReadMutation.mutate(unreadIds);
      }
    }
  }, [open, notificationsData]);

  // Get notification icon
  const getNotificationIcon = (type, status = null) => {
    switch (type) {
      case 'investment':
        return <Award className="h-4 w-4 text-green-500" />;
      case 'kyc':
        if (status === 'approved') {
          return <CheckSquare className="h-4 w-4 text-green-500" />;
        } else if (status === 'rejected') {
          return <X className="h-4 w-4 text-red-500" />;
        }
        return <LockKeyhole className="h-4 w-4 text-yellow-500" />;
      case 'roi':
        return <Award className="h-4 w-4 text-purple-500" />;
      case 'wallet':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'system':
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  // Filter notifications by tab
  const getFilteredNotifications = () => {
    if (!notificationsData?.data?.notifications) return [];
    
    if (activeTab === 'all') {
      return notificationsData.data.notifications;
    }
    
    return notificationsData.data.notifications.filter(
      notification => notification.type === activeTab
    );
  };

  // Format time display
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

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notificationsData?.data?.meta?.unreadCount || 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 px-[5px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <h4 className="font-medium text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={unreadCount === 0}
              className="h-8 text-xs"
              title="Mark all as read"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Clear all
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b px-1 py-2">
            <TabsList className="grid grid-cols-4 h-8">
              <TabsTrigger value="all" className="text-xs py-1">All</TabsTrigger>
              <TabsTrigger value="investment" className="text-xs py-1">Investments</TabsTrigger>
              <TabsTrigger value="roi" className="text-xs py-1">ROI</TabsTrigger>
              <TabsTrigger value="wallet" className="text-xs py-1">Wallet</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="focus-visible:outline-none p-0">
            <ScrollArea className="h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-3 hover:bg-accent/30 ${!notification.isRead ? 'bg-accent/40' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type, notification.data?.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium line-clamp-1">{notification.title}</p>
                            <span className="text-xs text-muted-foreground ml-2 shrink-0">
                              {getTimeDisplay(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {notification.message}
                          </p>
                          <div>
                            <Link href={notification.type === 'roi' 
                              ? "/insights/reports" 
                              : notification.type === 'wallet' 
                                ? "/wallet" 
                                : "/"}
                            >
                              <Button variant="link" size="sm" className="h-auto p-0 text-xs flex items-center">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">No notifications</p>
                  <p className="text-xs text-muted-foreground/60">
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
          <Link href="/notifications">
            <Button variant="outline" size="sm" className="w-full text-xs">
              View all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;