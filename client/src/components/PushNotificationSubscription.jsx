import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BellIcon, BellOffIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  subscribeUserToPush, 
  unsubscribeFromPush, 
  checkPushPermission,
  requestPushPermission
} from '@/utils/pushNotification';

const PushNotificationSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState('loading'); // 'loading', 'denied', 'granted', 'default', 'unsupported'
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const permissionStatus = await checkPushPermission();
      setSubscriptionStatus(permissionStatus);
      
      if (permissionStatus === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          setSubscriptionStatus('default'); // Permission granted but not subscribed
        }
      }
    } catch (error) {
      console.error('Error checking push subscription status:', error);
      setSubscriptionStatus('unsupported');
    }
  };

  const handleSubscribe = async () => {
    try {
      setIsSubscribing(true);
      
      // First request permission if needed
      if (subscriptionStatus === 'default') {
        const permissionResult = await requestPushPermission();
        if (permissionResult !== 'granted') {
          toast({
            title: 'Permission denied',
            description: 'You need to allow notifications to receive updates.',
            variant: 'destructive'
          });
          setSubscriptionStatus(permissionResult);
          setIsSubscribing(false);
          return;
        }
      }
      
      // Then subscribe
      await subscribeUserToPush();
      setSubscriptionStatus('granted');
      toast({
        title: 'Notifications enabled',
        description: 'You will now receive push notifications for important updates.',
      });
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Subscription failed',
        description: error.message || 'Could not subscribe to push notifications.',
        variant: 'destructive'
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setIsSubscribing(true);
      const result = await unsubscribeFromPush();
      if (result) {
        toast({
          title: 'Notifications disabled',
          description: 'You will no longer receive push notifications.',
        });
        setSubscriptionStatus('default');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      toast({
        title: 'Error disabling notifications',
        description: error.message || 'Could not unsubscribe from push notifications.',
        variant: 'destructive'
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  if (subscriptionStatus === 'loading') {
    return <Button disabled className="w-full md:w-auto flex items-center">
      <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
      Checking...
    </Button>;
  }

  if (subscriptionStatus === 'unsupported') {
    return <Button disabled className="w-full md:w-auto flex items-center">
      <BellOffIcon className="mr-2 h-4 w-4" />
      Not supported
    </Button>;
  }

  if (subscriptionStatus === 'denied') {
    return <Button 
      variant="outline" 
      className="w-full md:w-auto flex items-center"
      onClick={() => {
        toast({
          title: 'Notifications blocked',
          description: 'Please update your browser settings to allow notifications from this site.',
          variant: 'destructive'
        });
      }}
    >
      <BellOffIcon className="mr-2 h-4 w-4" />
      Notifications blocked
    </Button>;
  }

  return (
    <>
      {subscriptionStatus === 'granted' ? (
        <Button 
          variant="outline" 
          className="w-full md:w-auto flex items-center" 
          onClick={handleUnsubscribe}
          disabled={isSubscribing}
        >
          {isSubscribing ? (
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          ) : (
            <BellIcon className="mr-2 h-4 w-4" />
          )}
          Disable notifications
        </Button>
      ) : (
        <Button 
          className="w-full md:w-auto flex items-center" 
          onClick={handleSubscribe}
          disabled={isSubscribing}
        >
          {isSubscribing ? (
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          ) : (
            <BellIcon className="mr-2 h-4 w-4" />
          )}
          Enable notifications
        </Button>
      )}
    </>
  );
};

export default PushNotificationSubscription;