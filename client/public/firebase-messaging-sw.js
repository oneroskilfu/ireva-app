// firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Firebase configuration - loaded from environment
const firebaseConfig = {
  apiKey: "AIzaSyAHhiM0PxwYn8a64DzOBco5RWlXf4adQOk",
  authDomain: "ireva-platform.firebaseapp.com",
  projectId: "ireva-platform",
  storageBucket: "ireva-platform.firebasestorage.app",
  messagingSenderId: "488160387734",
  appId: "1:488160387734:web:02088d5591c8d75f4598b7",
  measurementId: "G-LHGPCTYFTK"
};

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