/**
 * WebSocket Server for iREVA
 * 
 * This file configures the WebSocket server for real-time updates.
 * It handles client connections, authentication, and message broadcasting.
 */
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { Request } from 'express';
import { parse } from 'url';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

// Define connection types
interface AuthenticatedWebSocket extends WebSocket {
  id: string;
  userId?: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
  lastPing: number;
  ip?: string;
}

// WebSocket message type
type WSMessage = {
  type: string;
  [key: string]: any;
};

// Connected clients store
const clients = new Map<string, AuthenticatedWebSocket>();

// User ID to connection IDs mapping (for multiple device/tab support)
const userConnections = new Map<string, Set<string>>();

// Room ID to connection IDs mapping
const rooms = new Map<string, Set<string>>();

// Rate limiting
const MAX_MESSAGES_PER_SECOND = 10;
const messageRateLimiter = new Map<string, { count: number, timestamp: number }>();

// Create and configure WebSocket server
// Use singleton pattern to ensure WebSocketServer is only initialized once
let wssInstance: WebSocketServer | null = null;

export function setupWebSocketServer(server: Server) {
  // Return existing instance if already initialized
  if (wssInstance) {
    console.log('WebSocket server already initialized, reusing existing instance');
    return wssInstance;
  }

  // Create new instance
  wssInstance = new WebSocketServer({ 
    server, 
    path: '/ws',
    clientTracking: true,
  });

  console.log('WebSocket server initialized');

  // Handle client connections
  wssInstance.on('connection', (ws: WebSocket, req: Request) => {
    const socket = ws as AuthenticatedWebSocket;
    const connectionId = randomUUID();
    
    // Initialize socket properties
    socket.id = connectionId;
    socket.isAuthenticated = false;
    socket.isAdmin = false;
    socket.lastPing = Date.now();
    
    // Store client in our connected clients map
    clients.set(connectionId, socket);

    console.log(`WebSocket client connected: ${connectionId}`);

    // Extract client IP from request
    socket.ip = req.headers['x-forwarded-for']?.toString() || 
                req.socket.remoteAddress || 
                'unknown';

    // Handle incoming messages with enhanced error handling
    socket.on('message', (message: string) => {
      try {
        // Validate message is proper JSON
        let parsedMessage: WSMessage;
        try {
          parsedMessage = JSON.parse(message);
        } catch (e) {
          console.error('Invalid JSON in WebSocket message:', message.substring(0, 100));
          sendErrorMessage(socket, 'Invalid JSON format');
          return;
        }
        
        // Validate message has a type
        if (!parsedMessage.type || typeof parsedMessage.type !== 'string') {
          console.error('Missing or invalid message type:', parsedMessage);
          sendErrorMessage(socket, 'Message must include a valid "type" field');
          return;
        }
        
        // Rate limiting
        const now = Date.now();
        const messageCount = messageRateLimiter.get(socket.id) || { count: 0, timestamp: now };
        
        if (now - messageCount.timestamp < 1000) { // 1 second window
          messageCount.count++;
          if (messageCount.count > MAX_MESSAGES_PER_SECOND) {
            console.warn(`Rate limit exceeded for client ${socket.id}`);
            sendErrorMessage(socket, 'Rate limit exceeded. Please slow down requests.');
            return;
          }
        } else {
          // Reset counter for new time window
          messageCount.count = 1;
          messageCount.timestamp = now;
        }
        
        messageRateLimiter.set(socket.id, messageCount);
        
        // Process the message
        handleClientMessage(socket, parsedMessage);
      } catch (error: any) {
        console.error('Error processing WebSocket message:', error);
        sendErrorMessage(socket, `Error: ${error.message || 'Unknown error'}`);
      }
    });

    // Handle client disconnection
    socket.on('close', () => {
      handleClientDisconnection(socket);
    });

    // Send welcome message to client
    sendMessage(socket, {
      type: 'connection_established',
      connectionId,
      timestamp: new Date().toISOString(),
    });

    // Start ping interval for this connection
    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        // Check if client has been responsive
        const timeSinceLastPing = Date.now() - socket.lastPing;
        if (timeSinceLastPing > 30000) { // 30 seconds
          console.log(`Client ${socket.id} has been unresponsive for 30s, terminating connection`);
          socket.terminate();
          clearInterval(pingInterval);
          return;
        }
        
        // Send ping to client
        sendMessage(socket, {
          type: 'ping',
          timestamp: new Date().toISOString(),
        });
      } else {
        // Clear interval if socket is closed
        clearInterval(pingInterval);
      }
    }, 15000); // Ping every 15 seconds
  });

  // Interval for broadcasting stats to admin clients
  setInterval(() => {
    broadcastServerStats();
  }, 60000); // Every minute
  
  return wssInstance;
}

// Event types clients can subscribe to
type EventCategory = 
  | 'investment' 
  | 'property' 
  | 'wallet' 
  | 'transaction' 
  | 'kyc' 
  | 'market' 
  | 'admin' 
  | 'system';

// Store client subscriptions
const clientSubscriptions = new Map<string, Set<EventCategory>>();

// Handle messages received from clients
function handleClientMessage(socket: AuthenticatedWebSocket, message: WSMessage) {
  // Update last ping time
  socket.lastPing = Date.now();
  
  try {
    switch (message.type) {
      case 'authenticate':
        authenticateClient(socket, message);
        break;
        
      case 'pong':
        // Just update the ping time, already done above
        break;
        
      case 'subscribe':
        handleSubscription(socket, message);
        break;
        
      case 'unsubscribe':
        handleUnsubscription(socket, message);
        break;
        
      // Event-specific handlers
      case 'join_room':
        if (socket.isAuthenticated) {
          const roomId = message.roomId as string;
          if (roomId) joinRoom(socket, roomId);
        } else {
          sendErrorMessage(socket, 'Authentication required for joining rooms');
        }
        break;
        
      case 'leave_room':
        if (socket.isAuthenticated) {
          const roomId = message.roomId as string;
          if (roomId) leaveRoom(socket, roomId);
        }
        break;
        
      default:
        console.log(`Received message of type ${message.type} from ${socket.id}`);
        // Send acknowledgment for custom event types
        sendMessage(socket, {
          type: 'ack',
          originalType: message.type,
          timestamp: new Date().toISOString()
        });
    }
  } catch (error: any) {
    console.error(`Error handling message ${message.type}:`, error);
    sendErrorMessage(socket, `Failed to process message: ${error.message || 'Unknown error'}`);
  }
}

// Handle subscription to event categories
function handleSubscription(socket: AuthenticatedWebSocket, message: WSMessage) {
  if (!socket.isAuthenticated) {
    sendErrorMessage(socket, 'Authentication required for subscriptions');
    return;
  }
  
  const categories = message.categories as EventCategory[];
  if (!Array.isArray(categories) || categories.length === 0) {
    sendErrorMessage(socket, 'Invalid subscription request: categories missing or empty');
    return;
  }
  
  // Initialize client's subscription set if not exists
  if (!clientSubscriptions.has(socket.id)) {
    clientSubscriptions.set(socket.id, new Set());
  }
  
  const subscriptions = clientSubscriptions.get(socket.id)!;
  let invalidCategories: string[] = [];
  
  // Add each category to client's subscriptions
  categories.forEach(category => {
    if (['investment', 'property', 'wallet', 'transaction', 'kyc', 'market', 'admin', 'system'].includes(category)) {
      subscriptions.add(category);
    } else {
      invalidCategories.push(category);
    }
  });
  
  // Send confirmation/error
  if (invalidCategories.length > 0) {
    sendMessage(socket, {
      type: 'subscription_partial',
      subscribed: Array.from(subscriptions),
      invalid: invalidCategories,
      timestamp: new Date().toISOString()
    });
  } else {
    sendMessage(socket, {
      type: 'subscription_success',
      subscribed: Array.from(subscriptions),
      timestamp: new Date().toISOString()
    });
  }
  
  console.log(`Client ${socket.id} subscribed to: ${Array.from(subscriptions).join(', ')}`);
}

// Handle unsubscription from event categories
function handleUnsubscription(socket: AuthenticatedWebSocket, message: WSMessage) {
  if (!clientSubscriptions.has(socket.id)) {
    sendMessage(socket, {
      type: 'unsubscription_success',
      subscribed: [],
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  const categories = message.categories as EventCategory[];
  const subscriptions = clientSubscriptions.get(socket.id)!;
  
  if (Array.isArray(categories) && categories.length > 0) {
    // Remove specific categories
    categories.forEach(category => {
      subscriptions.delete(category);
    });
  } else {
    // If no categories specified, remove all
    subscriptions.clear();
  }
  
  sendMessage(socket, {
    type: 'unsubscription_success',
    subscribed: Array.from(subscriptions),
    timestamp: new Date().toISOString()
  });
  
  console.log(`Client ${socket.id} updated subscriptions: ${Array.from(subscriptions).join(', ')}`);
}

// Join a specific room for group messaging
function joinRoom(socket: AuthenticatedWebSocket, roomId: string) {
  // We'll implement room management with a Map of roomId -> Set of connection IDs
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  
  rooms.get(roomId)!.add(socket.id);
  
  sendMessage(socket, {
    type: 'room_joined',
    roomId,
    timestamp: new Date().toISOString()
  });
  
  console.log(`Client ${socket.id} joined room: ${roomId}`);
}

// Authenticate a client connection using JWT token
function authenticateClient(socket: AuthenticatedWebSocket, message: WSMessage) {
  const { token } = message;
  
  if (!token) {
    sendErrorMessage(socket, 'Authentication token required');
    return;
  }
  
  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret') as any;
    
    if (!decoded || !decoded.userId) {
      throw new Error('Invalid token payload');
    }
    
    const userId = decoded.userId;
    
    // Update socket with user info
    socket.userId = userId;
    socket.isAuthenticated = true;
    
    // Check if user is admin based on decoded role
    socket.isAdmin = decoded.role === 'admin' || decoded.role === 'superadmin';
    
    // Add connection to user's connections list
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    userConnections.get(userId)!.add(socket.id);
    
    // Send success response with user info and permissions
    sendMessage(socket, {
      type: 'authentication_success',
      userId,
      isAdmin: socket.isAdmin,
      expiresAt: decoded.exp * 1000, // Convert to milliseconds
      timestamp: new Date().toISOString(),
    });
    
    console.log(`Client ${socket.id} authenticated as user ${userId} (admin: ${socket.isAdmin})`);
    
    // Log user activity for security monitoring
    // This could be stored in a database for auditing
    const ipAddress = socket.ip || 'unknown';
    console.log(`User ${userId} connected via WebSocket from IP: ${ipAddress}`);
    
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    sendErrorMessage(socket, 'Authentication failed: ' + (error.message || 'Invalid token'));
  }
}

// Handle client disconnection
function handleClientDisconnection(socket: AuthenticatedWebSocket) {
  // Remove from connections
  clients.delete(socket.id);
  
  // Remove from user connections if authenticated
  if (socket.userId && userConnections.has(socket.userId)) {
    userConnections.get(socket.userId)!.delete(socket.id);
    
    // Clean up empty user connections
    if (userConnections.get(socket.userId)!.size === 0) {
      userConnections.delete(socket.userId);
    }
  }
  
  // Remove from all subscriptions
  clientSubscriptions.delete(socket.id);
  
  // Remove from all rooms
  rooms.forEach((connections, roomId) => {
    if (connections.has(socket.id)) {
      connections.delete(socket.id);
      // Clean up empty rooms
      if (connections.size === 0) {
        rooms.delete(roomId);
      }
    }
  });
  
  console.log(`WebSocket client disconnected: ${socket.id}`);
}

// Send message to a specific client
function sendMessage(socket: AuthenticatedWebSocket, message: any) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

// Send error message to client
function sendErrorMessage(socket: AuthenticatedWebSocket, errorMessage: string) {
  sendMessage(socket, {
    type: 'error',
    message: errorMessage,
    timestamp: new Date().toISOString(),
  });
}

// Broadcast to all connected clients regardless of authentication
export function broadcastToAll(message: any) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      sendMessage(client, message);
    }
  });
}

// Broadcast to specific user's connections
export function broadcastToUser(userId: string, message: any) {
  if (!userConnections.has(userId)) return;
  
  userConnections.get(userId)!.forEach(connectionId => {
    const client = clients.get(connectionId);
    if (client && client.readyState === WebSocket.OPEN) {
      sendMessage(client, message);
    }
  });
}

// Broadcast to admin users only
export function broadcastToAdmins(message: any) {
  clients.forEach(client => {
    if (client.isAdmin && client.readyState === WebSocket.OPEN) {
      sendMessage(client, message);
    }
  });
}

// Leave a specific room
function leaveRoom(socket: AuthenticatedWebSocket, roomId: string) {
  if (!rooms.has(roomId)) {
    sendMessage(socket, {
      type: 'room_left',
      roomId,
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  rooms.get(roomId)!.delete(socket.id);
  
  // Clean up empty rooms
  if (rooms.get(roomId)!.size === 0) {
    rooms.delete(roomId);
  }
  
  sendMessage(socket, {
    type: 'room_left',
    roomId,
    timestamp: new Date().toISOString()
  });
  
  console.log(`Client ${socket.id} left room: ${roomId}`);
}

// Broadcast to specific room (group of users)
export function broadcastToRoom(roomId: string, message: any) {
  if (!rooms.has(roomId)) return;
  
  rooms.get(roomId)!.forEach(connectionId => {
    const client = clients.get(connectionId);
    if (client && client.readyState === WebSocket.OPEN) {
      sendMessage(client, message);
    }
  });
}

// Broadcast current server statistics to admin clients
function broadcastServerStats() {
  const stats = {
    type: 'server_stats',
    activeConnections: clients.size,
    authenticatedUsers: userConnections.size,
    timestamp: new Date().toISOString(),
  };
  
  broadcastToAdmins(stats);
}

// Function to notify users of wallet updates
export function notifyWalletUpdate(walletId: string, userId: string, data: any) {
  broadcastToUser(userId, {
    type: 'wallet_update',
    queryKey: ['wallet', walletId],
    payload: data,
    timestamp: new Date().toISOString(),
  });
}

// Function to notify users of transaction updates
export function notifyTransactionUpdate(transaction: any) {
  if (!transaction.userId) return;
  
  broadcastToUser(transaction.userId, {
    type: 'transaction_update',
    queryKey: ['wallet', transaction.walletId, 'transactions'],
    payload: transaction,
    timestamp: new Date().toISOString(),
  });
}

// Function to send notification to user
export function sendNotificationToUser(userId: string, notification: { title: string, message: string, type?: string }) {
  broadcastToUser(userId, {
    type: 'notification',
    payload: {
      ...notification,
      type: notification.type || 'info',
    },
    timestamp: new Date().toISOString(),
  });
}

// Function to invalidate specific query for a user
export function invalidateUserQuery(userId: string, queryKey: string | string[]) {
  broadcastToUser(userId, {
    type: 'invalidate_query',
    queryKey,
    timestamp: new Date().toISOString(),
  });
}