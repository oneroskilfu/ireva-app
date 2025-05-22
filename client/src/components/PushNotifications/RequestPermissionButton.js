// RequestPermissionButton.js

import { messaging } from "../../firebase/firebaseConfig";
import { getToken } from "firebase/messaging";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

function RequestPermissionButton() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const requestPermission = async () => {
    setLoading(true);
    
    try {
      // Request permission first
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Get the token
        const currentToken = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
        });

        if (currentToken) {
          console.log("User FCM Token:", currentToken);
          setToken(currentToken);

          // Save token to the backend
          await saveTokenToServer(currentToken);
          
          toast({
            title: "Push notifications enabled",
            description: "You'll now receive important updates about your investments",
            variant: "default",
          });
        } else {
          console.log("No registration token available.");
          toast({
            title: "Notification permission denied",
            description: "Please enable notifications in your browser settings",
            variant: "destructive",
          });
        }
      } else {
        console.log("Notification permission denied");
        toast({
          title: "Notification permission denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("An error occurred while retrieving token: ", err);
      toast({
        title: "Error enabling notifications",
        description: err.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const saveTokenToServer = async (token) => {
    try {
      // Using fetch API as requested in your example
      const response = await fetch('/api/push-notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Token saved to server successfully');
    } catch (error) {
      console.error('Error saving token to server:', error);
      throw new Error('Failed to save subscription to server');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button 
        onClick={requestPermission} 
        disabled={loading}
        className="flex items-center gap-2"
      >
        {loading ? (
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        Enable Push Notifications
      </Button>
      
      {token && (
        <div className="text-xs text-muted-foreground mt-2 max-w-md break-all">
          <p className="font-medium mb-1">Device registered successfully</p>
          <p className="bg-muted p-2 rounded overflow-hidden text-ellipsis">
            {token.substring(0, 20)}...{token.substring(token.length - 20)}
          </p>
        </div>
      )}
    </div>
  );
}

export default RequestPermissionButton;