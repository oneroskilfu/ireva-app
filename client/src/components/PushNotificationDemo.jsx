import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BellIcon, SendIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PushNotificationSubscription from './PushNotificationSubscription';

const PushNotificationDemo = () => {
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendTestNotification = async () => {
    if (!notificationTitle || !notificationBody) {
      toast({
        title: 'Missing fields',
        description: 'Please provide both a title and message for the notification',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSending(true);
      const response = await fetch('/api/push-notifications/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: notificationTitle,
          body: notificationBody
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      const data = await response.json();
      
      toast({
        title: 'Notification sent',
        description: data.message || 'Your test notification has been sent successfully!'
      });
      
      // Clear the form after successful submission
      setNotificationTitle('');
      setNotificationBody('');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong sending the notification',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <BellIcon className="h-6 w-6" />
          Push Notification Demo
        </CardTitle>
        <CardDescription>
          Subscribe to notifications and test sending them to your device
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Manage notifications</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Enable push notifications to receive important updates about your investments, account activity, and property news.
          </p>
          <PushNotificationSubscription />
        </div>
        
        <div>
          <h3 className="font-semibold mb-4">Test notifications</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notification-title">Notification title</Label>
              <Input 
                id="notification-title" 
                placeholder="Enter notification title..."
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notification-body">Notification message</Label>
              <Textarea 
                id="notification-body" 
                placeholder="Enter notification message..."
                value={notificationBody}
                onChange={(e) => setNotificationBody(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full flex items-center gap-2" 
          onClick={sendTestNotification}
          disabled={isSending || !notificationTitle || !notificationBody}
        >
          {isSending ? (
            <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full"></div>
          ) : (
            <SendIcon className="h-4 w-4" />
          )}
          Send Test Notification
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PushNotificationDemo;