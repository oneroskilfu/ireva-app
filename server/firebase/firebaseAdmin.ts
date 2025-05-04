// firebaseAdmin.ts
import admin from 'firebase-admin';

// Check if Firebase Admin has already been initialized
if (!admin.apps || admin.apps.length === 0) {
  try {
    // First, check if environment variables are available
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // The private key might be stored with newlines encoded as \n strings, so we need to replace them
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin initialized with environment variables');
    } else if (process.env.NODE_ENV === 'development') {
      // In development, we can initialize with a minimal configuration
      // This allows the app to start without full Firebase functionality
      admin.initializeApp({
        projectId: 'ireva-platform-dev',
      });
      console.log('Firebase Admin initialized in development mode with limited functionality');
    } else {
      console.log('Firebase Admin initialization skipped: Missing environment variables');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Firebase Admin initialization error:', errorMessage);
  }
}

// Create a messaging service only if Firebase is properly initialized
// Define a type for our messaging service that matches both real and mock implementations
type MessagingService = {
  send: (message: any) => Promise<{ messageId: string }>;
  sendMulticast: (message: any) => Promise<{ 
    successCount: number; 
    failureCount: number;
    responses: any[];
  }>;
};

let messagingService: MessagingService;
try {
  // Use the actual Firebase admin messaging service
  const firebaseMessaging = admin.messaging();
  
  // Create a wrapper with consistent interface
  messagingService = {
    send: (message) => firebaseMessaging.send(message),
    sendMulticast: (message) => firebaseMessaging.sendMulticast(message)
  };
  console.log('Firebase messaging service initialized');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.log('Firebase messaging service not available: ', errorMessage);
  // Create a mock messaging service for development
  messagingService = {
    send: () => Promise.resolve({ messageId: 'mock-message-id' }),
    sendMulticast: () => Promise.resolve({ 
      successCount: 0, 
      failureCount: 0,
      responses: []
    })
  };
  console.log('Using mock messaging service in development');
}

export const messaging = messagingService;
export default admin;