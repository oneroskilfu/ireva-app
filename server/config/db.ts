import mongoose from 'mongoose';

// Configuration for connection retries
const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000; // 5 seconds between retries

/**
 * Enhanced database connection function with retry logic
 */
const connectDB = async (retryCount = 0): Promise<void> => {
  try {
    // Use the MongoDB connection string from environment variables
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ireva';
    
    const options: mongoose.ConnectOptions = {
      // These options help with connection stability
      // No need to specify useNewUrlParser, useUnifiedTopology, etc. as they're true by default in mongoose 6+
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      heartbeatFrequencyMS: 10000,    // Check server health more frequently
      socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
    };
    
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Monitor connection health
    setupConnectionHealthMonitoring();
    
    return;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : String(error)}`);
    
    if (retryCount < MAX_RETRIES) {
      const nextRetryCount = retryCount + 1;
      const backoffTime = RETRY_INTERVAL_MS * Math.pow(1.5, retryCount); // Exponential backoff
      
      console.log(`Retrying connection (${nextRetryCount}/${MAX_RETRIES}) in ${backoffTime / 1000} seconds...`);
      
      // Wait and retry
      setTimeout(() => {
        connectDB(nextRetryCount);
      }, backoffTime);
    } else {
      console.error(`Failed to connect to MongoDB after ${MAX_RETRIES} retries. Exiting application.`);
      process.exit(1); // Exit with failure after all retries exhausted
    }
  }
};

/**
 * Monitor connection health and handle reconnection automatically
 */
function setupConnectionHealthMonitoring() {
  // Graceful shutdown function
  const gracefulShutdown = (): void => {
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  };

  // Set up event listeners for connection errors
  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err}`);
  });

  // Reconnect when disconnected
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected, attempting to reconnect...');
    // Mongoose will attempt to reconnect automatically by default
  });

  // Connected event
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established');
  });

  // Reconnected event
  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnection successful');
  });

  // Listen for Node.js termination signals
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit, just log as this might be related to a single operation
  });
}

/**
 * Check if the database connection is healthy
 */
export const checkDatabaseConnection = (): boolean => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

export default connectDB;