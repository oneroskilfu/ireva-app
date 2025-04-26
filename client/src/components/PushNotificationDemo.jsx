import { useState } from "react";
import { onMessage, messaging } from "../utils/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { BellRing, CheckCircle2, AlertCircle } from "lucide-react";
import PushNotificationSubscription from "./PushNotificationSubscription";

const PushNotificationDemo = () => {
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    icon: "/logo.png",
    clickAction: "/investor/dashboard",
  });
  const [loading, setLoading] = useState(false);
  const [testNotification, setTestNotification] = useState(null);
  const { toast } = useToast();
  
  // Listen for messages when component mounts
  useState(() => {
    if (onMessage && typeof window !== 'undefined') {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received:', payload);
        toast({
          title: payload.notification?.title || "New notification",
          description: payload.notification?.body || "You have a new notification",
          variant: "default",
        });
      });
      
      return () => {
        unsubscribe && unsubscribe();
      };
    }
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const sendTestNotification = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/push-notifications/send-test', formData);
      console.log('Test notification sent:', response.data);
      
      // Show a sample notification
      setTestNotification(formData);
      
      toast({
        title: "Test notification sent",
        description: "Check your browser for the notification",
        variant: "success",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      
      toast({
        title: "Failed to send notification",
        description: error.response?.data?.message || error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendClick = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.body) {
      toast({
        title: "Please fill all required fields",
        description: "Title and message content are required",
        variant: "destructive",
      });
      return;
    }
    
    await sendTestNotification();
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enable Push Notifications</CardTitle>
          <CardDescription>
            Get real-time updates about your investments, property milestones, and important platform announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PushNotificationSubscription />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Notifications</CardTitle>
          <CardDescription>
            Send a test notification to verify your browser is configured correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Notification Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Investment Update"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="body">Notification Message</Label>
              <Textarea
                id="body"
                name="body"
                placeholder="Your investment has earned a 5% ROI this month!"
                value={formData.body}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="clickAction">Redirect URL (Optional)</Label>
              <Input
                id="clickAction"
                name="clickAction"
                placeholder="/investor/dashboard"
                value={formData.clickAction}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground">
                Where to direct users when they click the notification
              </p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button 
            onClick={handleSendClick}
            disabled={loading || !formData.title || !formData.body}
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                Sending...
              </>
            ) : (
              <>
                <BellRing className="mr-2 h-4 w-4" />
                Send Test Notification
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {testNotification && (
        <Card className="border border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-base text-green-700">Preview Sent</CardTitle>
            </div>
            <CardDescription className="text-green-600">
              This is how your notification appears to users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4 bg-white p-4 rounded-md border border-gray-200 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">{testNotification.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{testNotification.body}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Different types of notifications you'll receive after enabling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Investment Updates</h4>
                <p className="text-sm text-muted-foreground">Property milestones, construction updates, and occupancy changes</p>
              </div>
            </li>
            <li className="flex space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Financial Alerts</h4>
                <p className="text-sm text-muted-foreground">ROI payments, dividend distributions, and transaction confirmations</p>
              </div>
            </li>
            <li className="flex space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Account Security</h4>
                <p className="text-sm text-muted-foreground">Login attempts, password changes, and KYC status updates</p>
              </div>
            </li>
            <li className="flex space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">New Opportunities</h4>
                <p className="text-sm text-muted-foreground">New property listings, exclusive investments, and limited-time offers</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PushNotificationDemo;