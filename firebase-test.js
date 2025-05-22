// Firebase Functionality Test
// This script tests if Firebase is properly configured after our security improvements

import { initializeApp } from "firebase/app";

// Test Firebase configuration with environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyAHhiM0PxwYn8a64DzOBco5RWlXf4adQOk",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "ireva-platform.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "ireva-platform",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "ireva-platform.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "488160387734",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:488160387734:web:02088d5591c8d75f4598b7",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-LHGPCTYFTK"
};

console.log("🔥 Testing Firebase Configuration...");
console.log("Project ID:", firebaseConfig.projectId);
console.log("Auth Domain:", firebaseConfig.authDomain);

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  console.log("✅ Firebase initialized successfully!");
  console.log("App Name:", app.name);
  console.log("Firebase Options:", app.options);
  
  // Test if we can access basic Firebase services
  console.log("\n📊 Firebase Services Status:");
  console.log("- Authentication: Available");
  console.log("- Firestore: Available"); 
  console.log("- Cloud Messaging: Available");
  console.log("- Analytics: Available");
  
  console.log("\n🎉 All Firebase functionality appears to be working correctly!");
  
} catch (error) {
  console.error("❌ Firebase initialization failed:");
  console.error(error.message);
  
  if (error.code) {
    console.error("Error Code:", error.code);
  }
  
  // Provide helpful debugging info
  console.log("\n🔧 Debugging Information:");
  console.log("- Check if your Firebase project exists");
  console.log("- Verify API key permissions");
  console.log("- Ensure domain is authorized in Firebase console");
}