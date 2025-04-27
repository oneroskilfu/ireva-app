import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const NotificationsList = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  // Fetch notifications using react-query
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/push-notifications/history', page, limit],
    queryFn: async () => {
      const response = await axios.get(`/api/push-notifications/history?page=${page}&limit=${limit}`);
      return response.data;
    }
  });

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/push-notifications/${notificationId}/read`);
      refetch();
      toast({
        title: "Notification marked as read",
        variant: "default",
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/push-notifications/mark-all-read');
      refetch();
      toast({
        title: "All notifications marked as read",
        variant: "default",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  // Get notification type icon
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'investment':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isError) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-destructive">
            <AlertCircle className="mr-2 h-5 w-5" />
            <p>Error loading notifications: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold">Notifications</CardTitle>
          <CardDescription>Stay updated with your investment activities</CardDescription>
        </div>
        
        <Button 
          onClick={markAllAsRead} 
          variant="outline" 
          size="sm"
          disabled={isLoading || !data?.notifications?.some(n => !n.read)}
        >
          Mark all as read
        </Button>
      </CardHeader>
      
      <CardContent className="pt-4">
        {isLoading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="mb-4 flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))
        ) : data?.notifications?.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">No notifications yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              When you receive notifications, they'll appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`flex items-start space-x-4 p-3 rounded-lg transition-colors
                  ${notification.read ? 'bg-background' : 'bg-muted/50'}`}
              >
                <div className="mt-1 flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  
                  <p className="mt-1 text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  
                  <div className="mt-2 flex items-center justify-between">
                    {notification.link && (
                      <Button 
                        asChild 
                        variant="link" 
                        className="h-auto p-0 text-xs font-medium"
                      >
                        <a href={notification.link}>View details</a>
                      </Button>
                    )}
                    
                    {!notification.read && (
                      <Badge 
                        variant="outline" 
                        className="ml-auto cursor-pointer"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {data?.pagination && data.pagination.total > limit && (
        <CardFooter className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1}-
            {Math.min(page * limit, data.pagination.total)} of {data.pagination.total}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(prev => prev + 1)}
              disabled={page >= data.pagination.pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default NotificationsList;