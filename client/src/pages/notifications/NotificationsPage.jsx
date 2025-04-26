import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, ChevronDown, Settings, Calendar, Mail, BellOff, Info, AlertTriangle, RefreshCw, Send, CheckCheck, PlusCircle, MessageSquare, DollarSign, Award, Clock, Eye, Filter } from "lucide-react";
import PushNotificationDemo from "@/components/PushNotificationDemo";

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    pushEnabled: true,
    emailEnabled: true,
    categories: {
      investments: true,
      roi: true,
      security: true,
      marketing: false,
      system: true,
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would filter based on activeTab
      const response = await axios.get('/api/notifications');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Failed to load notifications",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
      // Set some example notifications for development
      setNotifications(getSampleNotifications());
    } finally {
      setLoading(false);
    }
  };

  const getSampleNotifications = () => {
    return [
      {
        id: 1,
        type: 'investment',
        title: 'New Investment Opportunity',
        message: 'Prime Lekki Phase 1 Apartment complex now available for investment. Limited units!',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        priority: 'high',
        action: '/properties/5',
      },
      {
        id: 2,
        type: 'roi',
        title: 'ROI Payment',
        message: 'You have received a quarterly ROI payment of ₦123,500 from your investment in Victoria Island Commercial Plaza.',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
        priority: 'medium',
        action: '/investor/roi-dashboard',
      },
      {
        id: 3,
        type: 'security',
        title: 'New Login Detected',
        message: 'Your account was accessed from a new device. If this wasn\'t you, please contact support immediately.',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
        priority: 'high',
        action: '/investor/security',
      },
      {
        id: 4,
        type: 'system',
        title: 'Platform Maintenance',
        message: 'iREVA will undergo scheduled maintenance this weekend. Services might be temporarily unavailable on Saturday from 2 AM to 4 AM WAT.',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        priority: 'low',
        action: null,
      },
      {
        id: 5,
        type: 'investment',
        title: 'Property Construction Update',
        message: 'The Westfield Retail Center construction is now 75% complete. View the latest photos and progress report.',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36 hours ago
        priority: 'medium',
        action: '/properties/2/updates',
      },
      {
        id: 6,
        type: 'roi',
        title: 'Upcoming ROI Distribution',
        message: 'Your upcoming quarterly ROI payment from Lekki Gardens investment is scheduled for next week.',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        priority: 'medium',
        action: '/investor/roi-dashboard',
      },
      {
        id: 7,
        type: 'marketing',
        title: 'Exclusive Investor Webinar',
        message: 'Join our CEO for an exclusive webinar on "The Future of Real Estate in Nigeria" this Friday at 5 PM.',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
        priority: 'low',
        action: 'https://webinar.ireva.com/future-real-estate',
      },
    ];
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      ));
      
      toast({
        title: "Notification marked as read",
        variant: "default",
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      
      // Still update UI optimistically
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      ));
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read');
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
      
      toast({
        title: "All notifications marked as read",
        variant: "default",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      
      // Still update UI optimistically
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    }
  };

  const updatePreference = (category, value) => {
    if (category === 'pushEnabled' || category === 'emailEnabled') {
      setPreferences({
        ...preferences,
        [category]: value
      });
    } else {
      setPreferences({
        ...preferences,
        categories: {
          ...preferences.categories,
          [category]: value
        }
      });
    }
    
    // In a real implementation, save preferences to the server
    toast({
      title: `${category} notifications ${value ? 'enabled' : 'disabled'}`,
      variant: "default",
    });
  };

  const getNotificationIcon = (type, priority) => {
    switch(type) {
      case 'investment':
        return <PlusCircle className={`h-5 w-5 ${priority === 'high' ? 'text-green-600' : 'text-green-500'}`} />;
      case 'roi':
        return <DollarSign className={`h-5 w-5 ${priority === 'high' ? 'text-blue-600' : 'text-blue-500'}`} />;
      case 'security':
        return <AlertTriangle className={`h-5 w-5 ${priority === 'high' ? 'text-amber-600' : 'text-amber-500'}`} />;
      case 'system':
        return <Info className={`h-5 w-5 ${priority === 'high' ? 'text-purple-600' : 'text-purple-500'}`} />;
      case 'marketing':
        return <MessageSquare className={`h-5 w-5 text-indigo-500`} />;
      default:
        return <Bell className={`h-5 w-5 ${priority === 'high' ? 'text-primary' : 'text-muted-foreground'}`} />;
    }
  };

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  const getFilteredNotifications = () => {
    if (activeTab === 'all') {
      return notifications;
    }
    
    return notifications.filter(notification => notification.type === activeTab);
  };

  const getUnreadCount = (type = null) => {
    if (type) {
      return notifications.filter(n => n.type === type && !n.isRead).length;
    }
    return notifications.filter(n => !n.isRead).length;
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Helmet>
        <title>Notifications | iREVA</title>
      </Helmet>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Notifications</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={fetchNotifications}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden md:inline">Refresh</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={markAllAsRead}
                disabled={!getUnreadCount()}
              >
                <CheckCheck className="h-4 w-4" />
                <span className="hidden md:inline">Mark all as read</span>
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all" className="relative">
                  All
                  {getUnreadCount() > 0 && (
                    <Badge variant="default" className="ml-1 px-1 py-0 h-5 min-w-[20px] absolute -top-2 -right-2">
                      {getUnreadCount()}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="investment" className="relative">
                  Investments
                  {getUnreadCount('investment') > 0 && (
                    <Badge variant="default" className="ml-1 px-1 py-0 h-5 min-w-[20px] absolute -top-2 -right-2">
                      {getUnreadCount('investment')}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="roi" className="relative">
                  ROI
                  {getUnreadCount('roi') > 0 && (
                    <Badge variant="default" className="ml-1 px-1 py-0 h-5 min-w-[20px] absolute -top-2 -right-2">
                      {getUnreadCount('roi')}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span className="hidden md:inline">Filter</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex justify-center items-center p-12">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : getFilteredNotifications().length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No notifications</h3>
                      <p className="text-muted-foreground mt-2">
                        You don't have any notifications in this category yet
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[calc(100vh-24rem)] pr-4">
                      <ul className="divide-y divide-border">
                        {getFilteredNotifications().map((notification) => (
                          <li 
                            key={notification.id}
                            className={`p-4 hover:bg-muted/50 ${!notification.isRead ? 'bg-muted/30' : ''}`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="mt-1">
                                {getNotificationIcon(notification.type, notification.priority)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h3 className={`text-base font-medium truncate ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {notification.title}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                      {formatNotificationTime(notification.createdAt)}
                                    </span>
                                    {notification.priority === 'high' && (
                                      <Badge variant="destructive" className="px-1 py-0 h-5">
                                        Important
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <p className={`mt-1 text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.message}
                                </p>
                                <div className="mt-2 flex items-center gap-3">
                                  {notification.action && (
                                    <Button 
                                      variant="link" 
                                      className="h-auto p-0 text-sm"
                                      onClick={() => window.location.href = notification.action}
                                    >
                                      View details
                                    </Button>
                                  )}
                                  {!notification.isRead && (
                                    <Button 
                                      variant="link" 
                                      className="h-auto p-0 text-sm"
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      Mark as read
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="investment" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  {getFilteredNotifications().length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No investment notifications</h3>
                      <p className="text-muted-foreground mt-2">
                        Investment updates and new opportunities will appear here
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {getFilteredNotifications().map((notification) => (
                        <li 
                          key={notification.id}
                          className={`py-4 first:pt-0 last:pb-0 ${!notification.isRead ? 'bg-muted/30' : ''}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="mt-1">
                              {getNotificationIcon(notification.type, notification.priority)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className={`text-base font-medium truncate ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </h3>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatNotificationTime(notification.createdAt)}
                                </span>
                              </div>
                              <p className={`mt-1 text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.message}
                              </p>
                              <div className="mt-2 flex items-center gap-3">
                                {notification.action && (
                                  <Button 
                                    variant="link" 
                                    className="h-auto p-0 text-sm"
                                    onClick={() => window.location.href = notification.action}
                                  >
                                    View details
                                  </Button>
                                )}
                                {!notification.isRead && (
                                  <Button 
                                    variant="link" 
                                    className="h-auto p-0 text-sm"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    Mark as read
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="roi" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  {getFilteredNotifications().length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No ROI notifications</h3>
                      <p className="text-muted-foreground mt-2">
                        You'll be notified here about ROI payments and dividend distributions
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {getFilteredNotifications().map((notification) => (
                        <li 
                          key={notification.id}
                          className={`py-4 first:pt-0 last:pb-0 ${!notification.isRead ? 'bg-muted/30' : ''}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="mt-1">
                              {getNotificationIcon(notification.type, notification.priority)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className={`text-base font-medium truncate ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </h3>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatNotificationTime(notification.createdAt)}
                                </span>
                              </div>
                              <p className={`mt-1 text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.message}
                              </p>
                              <div className="mt-2 flex items-center gap-3">
                                {notification.action && (
                                  <Button 
                                    variant="link" 
                                    className="h-auto p-0 text-sm"
                                    onClick={() => window.location.href = notification.action}
                                  >
                                    View details
                                  </Button>
                                )}
                                {!notification.isRead && (
                                  <Button 
                                    variant="link" 
                                    className="h-auto p-0 text-sm"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    Mark as read
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  {getFilteredNotifications().length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No security notifications</h3>
                      <p className="text-muted-foreground mt-2">
                        Security alerts and account status updates will appear here
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {getFilteredNotifications().map((notification) => (
                        <li 
                          key={notification.id}
                          className={`py-4 first:pt-0 last:pb-0 ${!notification.isRead ? 'bg-muted/30' : ''}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="mt-1">
                              {getNotificationIcon(notification.type, notification.priority)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className={`text-base font-medium truncate ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </h3>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatNotificationTime(notification.createdAt)}
                                </span>
                              </div>
                              <p className={`mt-1 text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.message}
                              </p>
                              <div className="mt-2 flex items-center gap-3">
                                {notification.action && (
                                  <Button 
                                    variant="link" 
                                    className="h-auto p-0 text-sm"
                                    onClick={() => window.location.href = notification.action}
                                  >
                                    View details
                                  </Button>
                                )}
                                {!notification.isRead && (
                                  <Button 
                                    variant="link" 
                                    className="h-auto p-0 text-sm"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    Mark as read
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications in your browser
                  </p>
                </div>
                <Switch 
                  checked={preferences.pushEnabled} 
                  onCheckedChange={(value) => updatePreference('pushEnabled', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch 
                  checked={preferences.emailEnabled} 
                  onCheckedChange={(value) => updatePreference('emailEnabled', value)}
                />
              </div>
              
              <Separator />
              
              <h4 className="text-sm font-medium pt-2">Notification Categories</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Investment Updates</span>
                </div>
                <Switch 
                  checked={preferences.categories.investments} 
                  onCheckedChange={(value) => updatePreference('investments', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">ROI & Payments</span>
                </div>
                <Switch 
                  checked={preferences.categories.roi} 
                  onCheckedChange={(value) => updatePreference('roi', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Security Alerts</span>
                </div>
                <Switch 
                  checked={preferences.categories.security} 
                  onCheckedChange={(value) => updatePreference('security', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm">Marketing & Events</span>
                </div>
                <Switch 
                  checked={preferences.categories.marketing} 
                  onCheckedChange={(value) => updatePreference('marketing', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">System Notifications</span>
                </div>
                <Switch 
                  checked={preferences.categories.system} 
                  onCheckedChange={(value) => updatePreference('system', value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Save Preferences</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Browser Notifications
              </CardTitle>
              <CardDescription>
                Enable push notifications in your browser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PushNotificationDemo />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;