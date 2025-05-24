import React, { useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BellRing, CheckCircle2, Users, Send, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "../../components/layouts/AdminLayout";

// Validation schema for notification form
const notificationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  body: z.string().min(10, "Message must be at least 10 characters").max(500),
  type: z.enum(["announcement", "milestone", "roi", "security", "investment", "system"]),
  priority: z.enum(["low", "medium", "high"]),
  clickAction: z.string().optional(),
  sendToAll: z.boolean().default(true),
  targetSegment: z.string().optional(),
  scheduleFor: z.string().optional(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

const SendNotificationPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sendingStats, setSendingStats] = useState<{
    total: number;
    success: number;
    failed: number;
  } | null>(null);
  const { toast } = useToast();
  
  // Initialize form with default values
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      body: "",
      type: "announcement",
      priority: "medium",
      clickAction: "/notifications",
      sendToAll: true,
      targetSegment: "",
      scheduleFor: "",
    },
  });
  
  const onSubmit = async (data: NotificationFormValues) => {
    setIsSubmitting(true);
    setShowSuccess(false);
    setSendingStats(null);
    
    try {
      const response = await axios.post('/api/push-notifications/admin/send', data);
      
      console.log('Notification sent:', response.data);
      setShowSuccess(true);
      
      // Set stats if available
      if (response.data.stats) {
        setSendingStats(response.data.stats);
      }
      
      toast({
        title: "Notifications sent successfully",
        description: `Sent to ${response.data.stats?.success || 0} users`,
        variant: "default",
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      console.error('Error sending notifications:', error);
      
      toast({
        title: "Failed to send notifications",
        description: (error as any).response?.data?.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const watchSendToAll = form.watch("sendToAll");
  
  return (
    <AdminLayout>
      <div className="container py-8">
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Send Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Send push notifications and in-app alerts to users
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Content</CardTitle>
                      <CardDescription>
                        Create a notification to send to users. Be clear and concise.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notification Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="E.g., New Investment Opportunity" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Appears as the headline of the notification (max 100 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="body"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notification Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter the detailed content of your notification..." 
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              The main content of your notification (max 500 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notification Type</FormLabel>
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="announcement">Announcement</SelectItem>
                                  <SelectItem value="investment">Investment Update</SelectItem>
                                  <SelectItem value="roi">ROI Payment</SelectItem>
                                  <SelectItem value="milestone">Project Milestone</SelectItem>
                                  <SelectItem value="security">Security Alert</SelectItem>
                                  <SelectItem value="system">System Update</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Categorizes the notification for filtering
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority Level</FormLabel>
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Determines the urgency of the notification
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="clickAction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Redirect URL (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="/investor/properties/123" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Where to direct users when they click the notification
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Settings</CardTitle>
                      <CardDescription>
                        Configure who receives this notification and when
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="sendToAll"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Send to all users
                              </FormLabel>
                              <FormDescription>
                                Notification will be sent to all users with active subscriptions
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {!watchSendToAll && (
                        <div className="space-y-2">
                          <Label>Target User Segment</Label>
                          <Select
                            value={form.watch("targetSegment")}
                            onValueChange={(value) => form.setValue("targetSegment", value)}
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
                            {...form.register("scheduleFor")}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => form.reset()}
                      >
                        Reset
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isSubmitting}
                        className="gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Notification
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </Form>
              
              {showSuccess && (
                <Card className="mt-6 border-green-200 bg-green-50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                      <CardTitle className="text-green-800">Notification Sent Successfully</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-green-800">
                      <p>Your notification has been sent to the selected recipients.</p>
                      
                      {sendingStats && (
                        <div className="flex items-center gap-6 mt-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Total: {sendingStats.total}</span>
                          </div>
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Delivered: {sendingStats.success}</span>
                          </div>
                          {sendingStats.failed > 0 && (
                            <div className="flex items-center gap-2 text-amber-700">
                              <span>Failed: {sendingStats.failed}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div>
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
      </div>
    </AdminLayout>
  );
};

export default SendNotificationPage;