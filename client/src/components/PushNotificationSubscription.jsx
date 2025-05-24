import { useState, useEffect } from "react";
import { requestNotificationPermission, saveTokenToServer } from "../utils/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellOff, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";

const PushNotificationSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState("loading"); // loading, denied, subscribed, unsubscribed, error
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Check existing subscription status on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkSubscriptionStatus = async () => {
      try {
        // Check if notifications are supported
        if (!("Notification" in window)) {
          setSubscriptionStatus("unsupported");
          return;
        }
        
        // Check permission status
        if (Notification.permission === "denied") {
          setSubscriptionStatus("denied");
          return;
        }
        
        if (Notification.permission === "granted") {
          // Check if we have a subscription in the database
          const response = await axios.get('/api/push-notifications/status');
          
          if (response.data.isSubscribed) {
            setSubscriptionStatus("subscribed");
          } else {
            setSubscriptionStatus("unsubscribed");
          }
        } else {
          setSubscriptionStatus("unsubscribed");
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setSubscriptionStatus("error");
      }
    };
    
    checkSubscriptionStatus();
  }, []);
  
  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // Request permission and get token
      const token = await requestNotificationPermission();
      
      if (!token) {
        toast({
          title: "Notification permission denied",
          description: "Please enable notifications in your browser settings to receive updates",
          variant: "destructive",
        });
        setSubscriptionStatus("denied");
        return;
      }
      
      // Save token to server
      await saveTokenToServer(token);
      
      setSubscriptionStatus("subscribed");
      toast({
        title: "Notifications enabled",
        description: "You'll now receive important updates about your investments",
        variant: "success",
      });
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast({
        title: "Failed to enable notifications",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      setSubscriptionStatus("error");
    } finally {
      setLoading(false);
    }
  };
  
  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      await axios.delete('/api/push-notifications/unsubscribe');
      
      setSubscriptionStatus("unsubscribed");
      toast({
        title: "Notifications disabled",
        description: "You won't receive any more push notifications",
      });
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      toast({
        title: "Failed to disable notifications",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Render different UI based on subscription status
  if (subscriptionStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (subscriptionStatus === "unsupported") {
    return (
      <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg border">
        <AlertCircle className="h-6 w-6 text-muted-foreground" />
        <div>
          <h4 className="font-medium">Notifications not supported</h4>
          <p className="text-sm text-muted-foreground">
            Your browser doesn't support push notifications. Try using a modern browser like Chrome or Firefox.
          </p>
        </div>
      </div>
    );
  }
  
  if (subscriptionStatus === "denied") {
    return (
      <div className="flex items-center space-x-4 p-4 bg-amber-50 text-amber-900 rounded-lg border border-amber-200">
        <AlertCircle className="h-6 w-6 text-amber-700 flex-shrink-0" />
        <div>
          <h4 className="font-medium">Notifications blocked</h4>
          <p className="text-sm text-amber-800">
            You've blocked notifications for this site. To enable them:
          </p>
          <ol className="text-xs text-amber-800 mt-2 space-y-1 list-decimal list-inside">
            <li>Click the lock/info icon in your browser's address bar</li>
            <li>Look for "Notifications" and change the setting to "Allow"</li>
            <li>Refresh this page</li>
          </ol>
        </div>
      </div>
    );
  }
  
  if (subscriptionStatus === "subscribed") {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 text-green-900 rounded-lg border border-green-200">
        <div className="flex items-start space-x-3">
          <CheckCircle2 className="h-5 w-5 text-green-700 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium">Notifications enabled</h4>
            <p className="text-sm text-green-800">
              You'll receive updates about investments, property milestones, and important platform announcements
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-4 border-green-300 text-green-700 hover:bg-green-100"
          onClick={handleUnsubscribe}
          disabled={loading}
        >
          {loading ? (
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <>
              <BellOff className="h-4 w-4 mr-2" />
              Disable
            </>
          )}
        </Button>
      </div>
    );
  }
  
  if (subscriptionStatus === "unsubscribed") {
    return (
      <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
        <div>
          <h4 className="font-medium">Stay informed with notifications</h4>
          <p className="text-sm text-muted-foreground">
            Get real-time alerts about your investments, property milestones, and ROI payments
          </p>
        </div>
        <Button 
          variant="default" 
          className="ml-4"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
          ) : (
            <Bell className="h-4 w-4 mr-2" />
          )}
          Enable
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-4 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
      <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
      <div>
        <h4 className="font-medium">Something went wrong</h4>
        <p className="text-sm opacity-80">
          We couldn't determine your notification preferences. Please try refreshing the page.
        </p>
      </div>
      <Button 
        variant="outline" 
        className="ml-auto border-destructive/30 text-destructive hover:bg-destructive/10"
        onClick={() => window.location.reload()}
      >
        Refresh
      </Button>
    </div>
  );
};

export default PushNotificationSubscription;