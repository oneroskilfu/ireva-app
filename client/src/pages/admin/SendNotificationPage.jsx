import { useState } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BellRing, Send, Users, AlertTriangle, Info, Target, Calendar, Layers } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";

const SendNotificationPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    type: "all",
    priority: "normal",
    clickAction: "/notifications",
    scheduleFor: "",
    sendToAll: true,
    targetSegment: "",
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("compose");
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSegmentChange = (value) => {
    setFormData({ ...formData, targetSegment: value });
  };

  const handlePriorityChange = (value) => {
    setFormData({ ...formData, priority: value });
  };

  const handleTypeChange = (value) => {
    setFormData({ ...formData, type: value });
  };

  const handleSendToAllChange = (value) => {
    setFormData({ ...formData, sendToAll: value });
  };

  const getTemplates = () => {
    return [
      {
        title: "New Investment Property",
        body: "A new investment opportunity is now available on iREVA: {{propertyName}} in {{location}}. Limited units!",
        type: "investment",
        priority: "high",
        clickAction: "/properties"
      },
      {
        title: "ROI Payment Processed",
        body: "Your quarterly ROI payment of {{amount}} from {{propertyName}} has been processed and will be credited to your wallet within 24 hours.",
        type: "roi",
        priority: "normal",
        clickAction: "/investor/roi-dashboard"
      },
      {
        title: "System Maintenance",
        body: "iREVA will undergo scheduled maintenance on {{date}} from {{startTime}} to {{endTime}} WAT. Some services may be temporarily unavailable.",
        type: "system",
        priority: "low",
        clickAction: "/notifications"
      },
      {
        title: "KYC Verification Required",
        body: "Please complete your KYC verification to unlock all investment opportunities on iREVA.",
        type: "security",
        priority: "high",
        clickAction: "/investor/kyc"
      },
      {
        title: "Property Milestone Reached",
        body: "Great news! Your investment in {{propertyName}} has reached a new milestone: {{milestone}}. View the latest updates and photos.",
        type: "investment",
        priority: "normal",
        clickAction: "/investor/properties"
      },
    ];
  };

  const applyTemplate = (template) => {
    setFormData({
      ...formData,
      title: template.title,
      body: template.body,
      type: template.type,
      priority: template.priority,
      clickAction: template.clickAction
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Notification title required",
        description: "Please enter a title for your notification",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.body.trim()) {
      toast({
        title: "Notification content required",
        description: "Please enter the message content",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('/api/admin/send-notification', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      toast({
        title: "Notification sent successfully",
        description: `Notification sent to ${formData.sendToAll ? 'all users' : 'targeted users'}`,
        variant: "success",
      });
      
      // Reset form after successful send
      setFormData({
        ...formData,
        title: "",
        body: "",
        scheduleFor: "",
      });
      
    } catch (error) {
      console.error('Error sending notification:', error);
      
      toast({
        title: "Failed to send notification",
        description: error.response?.data?.message || error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container py-6">
        <Helmet>
          <title>Send Notifications | Admin Dashboard | iREVA</title>
        </Helmet>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Push Notification Management</h1>
            <p className="text-muted-foreground">Send push notifications to users for important updates and alerts</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => window.history.back()}>
              Back
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="compose">
                  Compose Notification
                </TabsTrigger>
                <TabsTrigger value="templates">
                  Notification Templates
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="compose" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BellRing className="h-5 w-5" />
                      New Push Notification
                    </CardTitle>
                    <CardDescription>
                      Create and send notification to users' browsers and mobile devices
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <form className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid gap-3">
                          <Label htmlFor="title">Notification Title</Label>
                          <Input
                            id="title"
                            name="title"
                            placeholder="Enter a clear, attention-grabbing title"
                            value={formData.title}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div className="grid gap-3">
                          <Label htmlFor="body">Notification Message</Label>
                          <Textarea
                            id="body"
                            name="body"
                            placeholder="Enter the notification content. Keep it concise and actionable."
                            rows={4}
                            value={formData.body}
                            onChange={handleChange}
                          />
                          <p className="text-sm text-muted-foreground">
                            {formData.body.length} / 180 characters
                          </p>
                        </div>
                        
                        <div className="grid gap-3">
                          <Label htmlFor="clickAction">Redirect URL</Label>
                          <Input
                            id="clickAction"
                            name="clickAction"
                            placeholder="/path/to/redirect"
                            value={formData.clickAction}
                            onChange={handleChange}
                          />
                          <p className="text-sm text-muted-foreground">
                            Where to direct users when they click the notification
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="type">Notification Type</Label>
                            <Select
                              value={formData.type}
                              onValueChange={handleTypeChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">General</SelectItem>
                                <SelectItem value="investment">Investment</SelectItem>
                                <SelectItem value="roi">ROI & Payment</SelectItem>
                                <SelectItem value="security">Security Alert</SelectItem>
                                <SelectItem value="system">System Update</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="priority">Priority Level</Label>
                            <Select
                              value={formData.priority}
                              onValueChange={handlePriorityChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" type="button">
                      Save Draft
                    </Button>
                    <Button
                      onClick={sendNotification}
                      disabled={loading}
                      className="px-6"
                    >
                      {loading ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Notification
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="templates" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5" />
                      Notification Templates
                    </CardTitle>
                    <CardDescription>
                      Ready-to-use templates for common notification scenarios
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {getTemplates().map((template, index) => (
                        <Card key={index} className="overflow-hidden">
                          <div className="flex flex-col sm:flex-row">
                            <div className="p-4 flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium">{template.title}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">{template.body}</p>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  {template.priority === 'high' && (
                                    <span className="text-xs bg-red-100 text-red-800 rounded-full px-2 py-1 font-medium">High</span>
                                  )}
                                  {template.type === 'investment' && (
                                    <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1 font-medium">Investment</span>
                                  )}
                                  {template.type === 'roi' && (
                                    <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1 font-medium">ROI</span>
                                  )}
                                  {template.type === 'security' && (
                                    <span className="text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-1 font-medium">Security</span>
                                  )}
                                  {template.type === 'system' && (
                                    <span className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-1 font-medium">System</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="px-4 py-3 bg-muted/50 flex justify-end items-center sm:w-auto">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => applyTemplate(template)}
                              >
                                Use Template
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Audience Targeting
                </CardTitle>
                <CardDescription>
                  Define which users will receive this notification
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Send to All Users</Label>
                    <p className="text-sm text-muted-foreground">
                      Send to everyone with notifications enabled
                    </p>
                  </div>
                  <Switch 
                    checked={formData.sendToAll}
                    onCheckedChange={handleSendToAllChange}
                  />
                </div>
                
                {!formData.sendToAll && (
                  <div className="space-y-2 pt-2">
                    <Label>Target User Segment</Label>
                    <Select
                      value={formData.targetSegment}
                      onValueChange={handleSegmentChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user segment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new_users">New Users (less than 30 days)</SelectItem>
                        <SelectItem value="active_investors">Active Investors</SelectItem>
                        <SelectItem value="premium_tier">Premium Tier Users</SelectItem>
                        <SelectItem value="dormant_users">Dormant Users (more than 90 days)</SelectItem>
                        <SelectItem value="kyc_verified">KYC Verified Users</SelectItem>
                        <SelectItem value="non_kyc">Non-KYC Users</SelectItem>
                        <SelectItem value="lagos_users">Lagos Region Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Schedule Delivery</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="sendNow" 
                        name="scheduleType" 
                        value="now"
                        defaultChecked 
                        className="h-4 w-4 text-primary border-muted-foreground focus:ring-primary"
                      />
                      <Label htmlFor="sendNow" className="font-normal">Send immediately</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="schedule" 
                        name="scheduleType" 
                        value="scheduled" 
                        className="h-4 w-4 text-primary border-muted-foreground focus:ring-primary"
                      />
                      <Label htmlFor="schedule" className="font-normal">Schedule for later</Label>
                    </div>
                    
                    <Input
                      type="datetime-local"
                      name="scheduleFor"
                      value={formData.scheduleFor}
                      onChange={handleChange}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Notification Stats</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Total Sent Today</p>
                    <p className="text-xl font-bold mt-1">24</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Open Rate</p>
                    <p className="text-xl font-bold mt-1">68%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Users Subscribed</p>
                    <p className="text-xl font-bold mt-1">5,782</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Click Rate</p>
                    <p className="text-xl font-bold mt-1">42%</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="pt-2">
                  <h4 className="font-medium mb-2">Recent Notifications</h4>
                  <ul className="space-y-3">
                    <li className="text-xs text-muted-foreground">
                      <span className="block font-medium text-foreground">KYC Verification Reminder</span>
                      Sent 2 hours ago • 1,245 recipients • 68% open rate
                    </li>
                    <li className="text-xs text-muted-foreground">
                      <span className="block font-medium text-foreground">New Property Launch</span>
                      Sent yesterday • 5,782 recipients • 75% open rate
                    </li>
                    <li className="text-xs text-muted-foreground">
                      <span className="block font-medium text-foreground">ROI Payment Processed</span>
                      Sent 2 days ago • 834 recipients • 94% open rate
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SendNotificationPage;