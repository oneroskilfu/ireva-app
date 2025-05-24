import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Bell, 
  BellRing, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Get unread notification count
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Get recent notifications (limited to 5)
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications/recent'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/notifications');
      const allNotifications = await response.json();
      // Return only the 5 most recent notifications
      return allNotifications.slice(0, 5);
    },
    enabled: isOpen, // Only fetch when dropdown is open
  });
  
  const unreadCount = unreadData?.count || 0;
  
  const markAsRead = async (id: number) => {
    try {
      await apiRequest('PATCH', `/api/notifications/${id}/read`);
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/recent'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await apiRequest('PATCH', '/api/notifications/mark-all-read');
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/recent'] });
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };
  
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    // Navigate to linked page if available
    if (notification.link) {
      navigate(notification.link);
    }
    
    // Close dropdown
    setIsOpen(false);
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'investment':
        return <div className="h-2 w-2 rounded-full bg-green-500"></div>;
      case 'property':
        return <div className="h-2 w-2 rounded-full bg-blue-500"></div>;
      case 'kyc':
        return <div className="h-2 w-2 rounded-full bg-yellow-500"></div>;
      case 'payment':
        return <div className="h-2 w-2 rounded-full bg-purple-500"></div>;
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-500"></div>;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-9 w-9 rounded-full p-0" 
          aria-label="Notifications"
        >
          {unreadCount > 0 ? (
            <>
              <BellRing className="h-5 w-5" />
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs" 
                variant="destructive"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8"
              onClick={markAllAsRead}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        
        {isLoading && (
          <div className="p-4 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        )}
        
        {!isLoading && (!notifications || notifications.length === 0) && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        )}
        
        {!isLoading && notifications && notifications.length > 0 && (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`p-4 flex flex-col items-start cursor-pointer ${!notification.isRead ? 'bg-muted' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-center gap-2 w-full">
                  {getNotificationIcon(notification.type)}
                  <span className="flex-grow font-medium text-sm">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs mt-1 line-clamp-2">{notification.message}</p>
                {notification.link && (
                  <div className="flex items-center text-xs text-blue-500 mt-1">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open
                  </div>
                )}
              </DropdownMenuItem>
            ))}
            
            <Separator />
            <DropdownMenuItem 
              className="p-3 justify-center text-sm font-medium"
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;