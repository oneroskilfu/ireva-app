// firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Firebase configuration - requires environment variables to be set
// Note: Service workers cannot access import.meta.env, so config must be injected at build time
const firebaseConfig = {
  apiKey: self.VITE_FIREBASE_API_KEY || "",
  authDomain: self.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: self.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: self.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: self.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: self.VITE_FIREBASE_APP_ID || "",
  measurementId: self.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Validate that required configuration is present
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase configuration missing. Please set environment variables.');
  // Exit early if configuration is incomplete
  throw new Error('Firebase configuration incomplete');
}

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received');
  
  event.notification.close();
  
  // Get the URL from the notification data or default to root
  const clickAction = event.notification.data.url || '/';
  
  // This looks to see if the current is already open and focuses it
  event.waitUntil(
    clients.matchAll({
      type: "window"
    })
    .then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === clickAction && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(clickAction);
      }
    })
  );
});