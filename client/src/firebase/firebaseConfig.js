// firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// Firebase configuration from your project
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

// Initialize Messaging - only in browser environment
let messaging;

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  messaging = getMessaging(app);
}

export { messaging };
export default app;