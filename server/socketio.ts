import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from './auth-jwt';

// Store socket.io instance
let io: SocketServer | null = null;

/**
 * Initialize Socket.IO server with authentication
 */
export const initializeSocketIO = (httpServer: HttpServer) => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'development' 
        ? '*' 
        : [process.env.APP_URL || 'https://ireva.app'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io'
  });
  
  // Authentication middleware
  io.use((socket, next) => {
    // Extract token from handshake auth or query
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      // Allow connection without auth for now, but they won't receive private data
      console.log('Socket connection without authentication');
      return next();
    }
    
    try {
      // Verify JWT token
      const decoded = verifyToken(token as string);
      
      if (decoded) {
        // Attach user data to socket
        socket.data.user = decoded;
        
        // Join user-specific room for targeted messages
        socket.join(`user-${decoded.id}`);
        console.log(`User ${decoded.id} authenticated on socket ${socket.id}`);
        return next();
      }
      
      return next(new Error('Authentication failed'));
    } catch (error) {
      console.error('Socket authentication error:', error);
      return next(new Error('Authentication failed'));
    }
  });
  
  // Connection event handler
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Join rooms based on authenticated user
    if (socket.data.user) {
      // If admin, join admin broadcast room
      if (socket.data.user.role === 'admin') {
        socket.join('admins');
      }
      
      // Additional rooms can be joined here based on user properties
    }
    
    // Listen for client subscription to specific investment updates
    socket.on('subscribe-to-investment', (investmentId) => {
      if (socket.data.user) {
        socket.join(`investment-${investmentId}`);
        console.log(`User ${socket.data.user.id} subscribed to investment ${investmentId}`);
      }
    });
    
    // Unsubscribe from investment updates
    socket.on('unsubscribe-from-investment', (investmentId) => {
      socket.leave(`investment-${investmentId}`);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
  
  console.log('Socket.io initialized successfully');
  return io;
};

/**
 * Get the Socket.IO instance
 */
export const getSocketIo = (): SocketServer | null => {
  return io;
};

/**
 * Alias for initializeSocketIO for backward compatibility
 */
export const setupSocketIO = initializeSocketIO;