import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHhiM0PxwYn8a64DzOBco5RWlXf4adQOk",
  authDomain: "ireva-platform.firebaseapp.com",
  projectId: "ireva-platform",
  storageBucket: "ireva-platform.firebasestorage.app",
  messagingSenderId: "488160387734",
  appId: "1:488160387734:web:02088d5591c8d75f4598b7",
  measurementId: "G-LHGPCTYFTK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging;

// Only initialize FCM in browser environment and if it's supported
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  messaging = getMessaging(app);
} else {
  console.log('Firebase messaging is not supported in this environment');
}

// Request permission and get token
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) {
      console.error('Firebase messaging is not initialized');
      return null;
    }
    
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Get the FCM token
      const currentToken = await getToken(messaging, {
        vapidKey: 'BL_hy-dBVTtm08ZIp9lgWIrEcNd8YTwjQHuFyEZYcgbJ3wNPgPPtHZ-1lfHQUJOX_hY2ykJcIoVJPaKXQAQy5Vs'
      });
      
      if (currentToken) {
        console.log('FCM token received:', currentToken);
        return currentToken;
      } else {
        console.error('No FCM token received');
        return null;
      }
    } else {
      console.warn('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Handle foreground messages
export { onMessage, messaging };

// Save FCM token to server
export const saveTokenToServer = async (token) => {
  try {
    const response = await fetch('/api/push-notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save subscription to server');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving subscription to server:', error);
    throw error;
  }
};