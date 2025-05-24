export async function subscribeUserToPush() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: '<YOUR_PUBLIC_VAPID_KEY>'
      });

      console.log('Push subscription:', JSON.stringify(subscription));
      // Send subscription to your server to save
      
      // Call your backend API to store this subscription
      try {
        const response = await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subscription })
        });
        
        if (!response.ok) {
          throw new Error('Failed to store push subscription on server');
        }
        
        console.log('Successfully subscribed to push notifications');
        return subscription;
      } catch (apiError) {
        console.error('Error saving subscription to server:', apiError);
        throw apiError;
      }
    } catch (error) {
      console.error('Push subscription error:', error);
      throw error;
    }
  } else {
    throw new Error('Push notifications not supported in this browser');
  }
}

export async function unsubscribeFromPush() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      try {
        // Unsubscribe locally
        await subscription.unsubscribe();
        
        // Tell server to remove the subscription
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            endpoint: subscription.endpoint 
          })
        });
        
        console.log('Successfully unsubscribed from push notifications');
        return true;
      } catch (error) {
        console.error('Error unsubscribing from push notifications:', error);
        return false;
      }
    }
    return true; // Already unsubscribed
  }
  return false; // Not supported
}

export async function checkPushPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  
  return Notification.permission;
}

export async function requestPushPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  
  const permission = await Notification.requestPermission();
  return permission;
}