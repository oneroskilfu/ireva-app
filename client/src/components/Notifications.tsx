import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/empty-state";
import { apiRequest, queryClient } from '@/lib/queryClient';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export const Notifications: React.FC = () => {
  const { toast } = useToast();
  
  const { data: notifications, isLoading, error } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // Refresh every minute
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load notifications. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const markAsRead = async (id: number) => {
    try {
      await apiRequest('PATCH', `/api/notifications/${id}/read`);
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'investment':
        return <span className="h-2 w-2 rounded-full bg-green-500"></span>;
      case 'property':
        return <span className="h-2 w-2 rounded-full bg-blue-500"></span>;
      case 'kyc':
        return <span className="h-2 w-2 rounded-full bg-yellow-500"></span>;
      case 'payment':
        return <span className="h-2 w-2 rounded-full bg-purple-500"></span>;
      case 'system':
        return <span className="h-2 w-2 rounded-full bg-red-500"></span>;
      default:
        return <span className="h-2 w-2 rounded-full bg-gray-500"></span>;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState 
            title="No Notifications"
            description="You don't have any notifications at this time."
            icon="bell"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-4 border rounded-lg transition-colors cursor-pointer hover:bg-accent ${!notification.isRead ? 'bg-muted' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getNotificationTypeIcon(notification.type)}
                  <h4 className="font-medium">
                    {notification.title}
                    {!notification.isRead && (
                      <Badge className="ml-2 bg-primary hover:bg-primary/90" variant="default">New</Badge>
                    )}
                  </h4>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-sm">{notification.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Notifications;