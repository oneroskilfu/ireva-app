import mongoose from 'mongoose';

// Database connection function
const connectDB = async (): Promise<void> => {
  try {
    // Use the MongoDB connection string from environment variables
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ireva';
    
    const options: mongoose.ConnectOptions = {
      // These options help with connection stability
      // No need to specify useNewUrlParser, useUnifiedTopology, etc. as they're true by default in mongoose 6+
    };
    
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1); // Exit with failure
  }
};

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
  console.log('MongoDB disconnected, trying to reconnect...');
});

// Listen for Node.js termination signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default connectDB;