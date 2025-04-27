import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Bell,
  SendIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import RequestPermissionButton from './RequestPermissionButton';

// Create a schema for the form
const notificationSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  message: z.string().min(5, { message: "Message must be at least 5 characters long" }),
  link: z.string().optional()
});

const PushNotificationDemo = () => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState("enable"); // "enable" or "demo"

  // Form setup using react-hook-form
  const form = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      message: '',
      link: ''
    }
  });

  // Get unread notifications count
  const { data: unreadCount, refetch: refetchUnreadCount } = useQuery({
    queryKey: ['/api/push-notifications/unread-count'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/push-notifications/unread-count');
        return response.data.count;
      } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }
    }
  });

  // Send self notification (demo feature)
  const onSubmit = async (data) => {
    setIsSending(true);
    try {
      await axios.post('/api/notifications/send-self', {
        title: data.title,
        message: data.message,
        link: data.link || null
      });
      
      toast({
        title: "Notification sent",
        description: "Check your notifications to see it",
        variant: "default",
      });
      
      form.reset();
      refetchUnreadCount();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Push Notifications</CardTitle>
            <CardDescription>Stay updated with important events</CardDescription>
          </div>
          {unreadCount > 0 && (
            <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
              {unreadCount}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enable">Setup</TabsTrigger>
            <TabsTrigger value="demo">Test</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enable" className="pt-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Enable push notifications to receive updates about:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>New investment opportunities</li>
                  <li>ROI distribution alerts</li>
                  <li>KYC status updates</li>
                  <li>Withdrawal confirmations</li>
                </ul>
              </div>
              
              <div className="pt-2">
                <RequestPermissionButton />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="demo" className="pt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Send yourself a test notification to make sure everything is working correctly.
              </p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Notification title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Notification message" 
                            className="resize-none" 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="/dashboard" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSending}
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <SendIcon className="mr-2 h-4 w-4" />
                        Send Test Notification
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PushNotificationDemo;