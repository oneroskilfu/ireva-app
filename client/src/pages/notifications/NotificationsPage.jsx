import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import axios from "axios";
import { 
  Bell, 
  Clock, 
  Calendar, 
  ExternalLink, 
  Search,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  ChevronDown  
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import PushNotificationSubscription from "../../components/PushNotificationSubscription";
import PushNotificationDemo from "../../components/PushNotificationDemo";
import UserLayout from "../../components/layouts/UserLayout";

// Date formatting function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, 'MMMM d, yyyy');
};

// Relative date formatting
const formatRelativeDate = (dateString) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

// Helper to get badge color based on notification type
const getNotificationBadge = (type) => {
  switch (type) {
    case 'investment':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Investment</Badge>;
    case 'security':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Security</Badge>;
    case 'roi':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">ROI</Badge>;
    case 'milestone':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Milestone</Badge>;
    case 'announcement':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Announcement</Badge>;
    default:
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">System</Badge>;
  }
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedTab, setSelectedTab] = useState("all");
  const { toast } = useToast();
  
  useEffect(() => {
    fetchNotifications();
  }, [currentPage, filter, sortDirection, selectedTab]);
  
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Add params for pagination, filtering, sorting
      const params = {
        page: currentPage,
        limit: 10,
        sort: sortDirection,
        filter: filter,
        type: selectedTab !== "all" ? selectedTab : undefined
      };
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await axios.get('/api/notifications', { params });
      
      setNotifications(response.data.notifications || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Failed to load notifications",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page for new search
    fetchNotifications();
  };
  
  const handleToggleRead = async (id, isRead) => {
    try {
      await axios.patch(`/api/notifications/${id}`, { isRead: !isRead });
      
      // Update the notification in the local state
      setNotifications(
        notifications.map((notification) =>
          notification.id === id 
            ? { ...notification, isRead: !isRead } 
            : notification
        )
      );
      
      toast({
        title: isRead ? "Marked as unread" : "Marked as read",
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating notification:', error);
      toast({
        title: "Failed to update notification",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      
      // Remove the notification from the local state
      setNotifications(
        notifications.filter((notification) => notification.id !== id)
      );
      
      toast({
        title: "Notification deleted",
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Failed to delete notification",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/mark-all-read');
      
      // Update all notifications in the local state
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
      
      toast({
        title: "All notifications marked as read",
        variant: "default",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Failed to update notifications",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };
  
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };
  
  // Sample notification data for demonstration
  const sampleNotifications = [
    {
      id: 1,
      title: "ROI Payment Processed",
      body: "Your Q2 2023 ROI payment of ₦450,000 has been processed and will be credited to your wallet within 24 hours.",
      type: "roi",
      isRead: false,
      createdAt: "2023-07-15T10:30:00Z",
      link: "/investor/wallet"
    },
    {
      id: 2,
      title: "New Property Investment Opportunity",
      body: "Exclusive pre-launch access: Victoria Garden City Luxury Apartments now available for premium investors.",
      type: "investment",
      isRead: true,
      createdAt: "2023-07-12T14:45:00Z",
      link: "/properties/12"
    },
    {
      id: 3,
      title: "KYC Verification Approved",
      body: "Congratulations! Your KYC verification has been approved. You now have full access to all investment opportunities.",
      type: "security",
      isRead: true,
      createdAt: "2023-07-10T09:15:00Z",
      link: "/account/kyc"
    },
    {
      id: 4,
      title: "Construction Milestone Reached",
      body: "Victoria Garden City project has completed foundation work. View the latest photos and construction updates.",
      type: "milestone",
      isRead: false,
      createdAt: "2023-07-08T11:20:00Z",
      link: "/properties/12/updates"
    },
    {
      id: 5,
      title: "Platform Update: New Features",
      body: "We've added new features to enhance your experience: Portfolio analytics, document management, and improved reporting.",
      type: "announcement",
      isRead: false,
      createdAt: "2023-07-05T16:30:00Z",
      link: "/announcements/platform-update"
    }
  ];
  
  return (
    <UserLayout>
      <div className="container py-8">
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with important information about your investments
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Notifications</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={markAllAsRead}
                        disabled={!notifications.some(n => !n.isRead)}
                      >
                        Mark all as read
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={toggleSortDirection}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <div className="relative flex-grow">
                      <form onSubmit={handleSearch}>
                        <Input
                          placeholder="Search notifications..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      </form>
                    </div>
                    <Select 
                      value={filter} 
                      onValueChange={setFilter}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="unread">Unread</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                
                <Tabs defaultValue="all" onValueChange={setSelectedTab}>
                  <div className="px-6">
                    <TabsList className="grid grid-cols-6 w-full">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="investment">Investments</TabsTrigger>
                      <TabsTrigger value="roi">ROI</TabsTrigger>
                      <TabsTrigger value="milestone">Milestones</TabsTrigger>
                      <TabsTrigger value="security">Security</TabsTrigger>
                      <TabsTrigger value="announcement">Announcements</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <CardContent className="pt-6">
                    <TabsContent value="all" className="mt-0">
                      {/* Using sample data while API integration is in progress */}
                      {loading ? (
                        <div className="flex justify-center py-12">
                          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="text-center py-12">
                          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium">No notifications</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            You don't have any notifications at the moment
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {sampleNotifications.map((notification) => (
                            <div 
                              key={notification.id}
                              className={`relative p-4 rounded-lg border ${
                                notification.isRead 
                                  ? 'bg-background' 
                                  : 'bg-primary/5 border-primary/20'
                              }`}
                            >
                              {!notification.isRead && (
                                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />
                              )}
                              
                              <div className="flex items-start gap-4">
                                <div className="rounded-full p-2 bg-primary/10 text-primary">
                                  <Bell className="h-5 w-5" />
                                </div>
                                
                                <div className="flex-grow">
                                  <div className="flex items-center gap-2 mb-1">
                                    {getNotificationBadge(notification.type)}
                                    <span className="text-xs text-muted-foreground flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {formatRelativeDate(notification.createdAt)}
                                    </span>
                                  </div>
                                  
                                  <h3 className="font-medium">{notification.title}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {notification.body}
                                  </p>
                                  
                                  <div className="flex items-center justify-between mt-3">
                                    <div className="text-xs text-muted-foreground flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {formatDate(notification.createdAt)}
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      {notification.link && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          asChild
                                          className="h-8 px-2 text-xs"
                                        >
                                          <Link to={notification.link}>
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            View details
                                          </Link>
                                        </Button>
                                      )}
                                      
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem 
                                            onClick={() => handleToggleRead(notification.id, notification.isRead)}
                                          >
                                            Mark as {notification.isRead ? 'unread' : 'read'}
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem 
                                            className="text-destructive"
                                            onClick={() => handleDelete(notification.id)}
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {totalPages > 1 && (
                            <div className="flex justify-center pt-4">
                              <div className="flex space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentPage(currentPage - 1)}
                                  disabled={currentPage === 1}
                                >
                                  Previous
                                </Button>
                                <Button variant="outline" size="sm" disabled>
                                  Page {currentPage} of {totalPages}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentPage(currentPage + 1)}
                                  disabled={currentPage === totalPages}
                                >
                                  Next
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>
                    
                    {/* Other tabs would filter based on notification type */}
                    <TabsContent value="investment" className="mt-0">
                      {/* Content filtered for investments */}
                      <div className="space-y-4">
                        {sampleNotifications
                          .filter(n => n.type === 'investment')
                          .map((notification) => (
                            <div 
                              key={notification.id}
                              className={`relative p-4 rounded-lg border ${
                                notification.isRead 
                                  ? 'bg-background' 
                                  : 'bg-primary/5 border-primary/20'
                              }`}
                            >
                              {/* Same content structure as above */}
                              {!notification.isRead && (
                                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />
                              )}
                              
                              <div className="flex items-start gap-4">
                                <div className="rounded-full p-2 bg-primary/10 text-primary">
                                  <Bell className="h-5 w-5" />
                                </div>
                                
                                <div className="flex-grow">
                                  <div className="flex items-center gap-2 mb-1">
                                    {getNotificationBadge(notification.type)}
                                    <span className="text-xs text-muted-foreground flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {formatRelativeDate(notification.createdAt)}
                                    </span>
                                  </div>
                                  
                                  <h3 className="font-medium">{notification.title}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {notification.body}
                                  </p>
                                  
                                  <div className="flex items-center justify-between mt-3">
                                    <div className="text-xs text-muted-foreground flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {formatDate(notification.createdAt)}
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      {notification.link && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          asChild
                                          className="h-8 px-2 text-xs"
                                        >
                                          <Link to={notification.link}>
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            View details
                                          </Link>
                                        </Button>
                                      )}
                                      
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem 
                                            onClick={() => handleToggleRead(notification.id, notification.isRead)}
                                          >
                                            Mark as {notification.isRead ? 'unread' : 'read'}
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem 
                                            className="text-destructive"
                                            onClick={() => handleDelete(notification.id)}
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </TabsContent>
                    
                    {/* Similar structure for other tabs */}
                    <TabsContent value="roi" className="mt-0">
                      {/* Filtered ROI notifications */}
                    </TabsContent>
                    
                    <TabsContent value="milestone" className="mt-0">
                      {/* Filtered milestone notifications */}
                    </TabsContent>
                    
                    <TabsContent value="security" className="mt-0">
                      {/* Filtered security notifications */}
                    </TabsContent>
                    
                    <TabsContent value="announcement" className="mt-0">
                      {/* Filtered announcement notifications */}
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Control how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PushNotificationSubscription />
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Email Notifications</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium text-sm">Investment Updates</div>
                        <div className="text-xs text-muted-foreground">
                          New properties and investment opportunities
                        </div>
                      </div>
                      <Select defaultValue="daily">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="off">Off</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium text-sm">ROI Payments</div>
                        <div className="text-xs text-muted-foreground">
                          Dividend distributions and performance reports
                        </div>
                      </div>
                      <Select defaultValue="realtime">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="off">Off</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium text-sm">Security Alerts</div>
                        <div className="text-xs text-muted-foreground">
                          Account activities and login attempts
                        </div>
                      </div>
                      <Select defaultValue="realtime">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="off">Off</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium text-sm">Platform Announcements</div>
                        <div className="text-xs text-muted-foreground">
                          New features and system updates
                        </div>
                      </div>
                      <Select defaultValue="weekly">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="off">Off</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="pt-2">
                    <Button className="w-full">Save Preferences</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Test Notifications</CardTitle>
                  <CardDescription>
                    Send a test notification to verify your settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PushNotificationDemo />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default NotificationsPage;