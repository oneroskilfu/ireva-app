import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

// This configuration will need to be updated with actual values
// from your Firebase project once available
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "placeholder-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "placeholder-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "placeholder-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "placeholder-project"}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "placeholder-app-id",
};

// Initialize Firebase (this will be a no-op until real credentials are provided)
let app;
let auth;
let googleProvider;
let facebookProvider;

// Only initialize Firebase if we have valid credentials
try {
  // We'll initialize this when we have the actual Firebase credentials
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_APP_ID) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    facebookProvider = new FacebookAuthProvider();
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { auth, googleProvider, facebookProvider };

// Social authentication methods
export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    console.error("Firebase authentication not initialized. Missing credentials.");
    return null;
  }
  try {
    const result = await auth.signInWithPopup(googleProvider);
    return result;
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  }
}

export async function signInWithFacebook() {
  if (!auth || !facebookProvider) {
    console.error("Firebase authentication not initialized. Missing credentials.");
    return null;
  }
  try {
    const result = await auth.signInWithPopup(facebookProvider);
    return result;
  } catch (error) {
    console.error("Facebook sign in error:", error);
    throw error;
  }
}