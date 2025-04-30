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
import { verify } from 'jsonwebtoken';
import { randomUUID } from 'crypto';

// Define connection types
interface AuthenticatedWebSocket extends WebSocket {
  id: string;
  userId?: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
  lastPing: number;
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

// Create and configure WebSocket server
export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ 
    server, 
    path: '/ws',
    clientTracking: true,
  });

  console.log('WebSocket server initialized');

  // Handle client connections
  wss.on('connection', (ws: WebSocket, req: Request) => {
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

    // Handle incoming messages
    socket.on('message', (message: string) => {
      try {
        const parsedMessage: WSMessage = JSON.parse(message);
        handleClientMessage(socket, parsedMessage);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        sendErrorMessage(socket, 'Invalid message format');
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
  
  return wss;
}

// Handle messages received from clients
function handleClientMessage(socket: AuthenticatedWebSocket, message: WSMessage) {
  // Update last ping time
  socket.lastPing = Date.now();
  
  switch (message.type) {
    case 'authenticate':
      authenticateClient(socket, message);
      break;
      
    case 'pong':
      // Just update the ping time, already done above
      break;
      
    case 'subscribe':
      // Handle subscription to specific data
      if (socket.isAuthenticated) {
        // Store subscription info for the client
        // This could be extended to support room-based subscriptions
      } else {
        sendErrorMessage(socket, 'Authentication required');
      }
      break;
      
    case 'unsubscribe':
      // Handle unsubscription
      break;
      
    default:
      console.log(`Received message of type ${message.type} from ${socket.id}`);
  }
}

// Authenticate a client connection using JWT or other method
function authenticateClient(socket: AuthenticatedWebSocket, message: WSMessage) {
  const { userId, token } = message;
  
  if (!userId) {
    sendErrorMessage(socket, 'User ID required for authentication');
    return;
  }
  
  try {
    // Ideally verify a token here
    // For now, just using the user ID provided
    
    // Update socket with user info
    socket.userId = userId;
    socket.isAuthenticated = true;
    
    // Check if user is admin (this would be part of token verification)
    // socket.isAdmin = decoded.role === 'admin';
    
    // Add connection to user's connections list
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    userConnections.get(userId)!.add(socket.id);
    
    sendMessage(socket, {
      type: 'authentication_success',
      userId,
      timestamp: new Date().toISOString(),
    });
    
    console.log(`Client ${socket.id} authenticated as user ${userId}`);
  } catch (error) {
    console.error('Authentication error:', error);
    sendErrorMessage(socket, 'Authentication failed');
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

// Broadcast to specific room (group of users)
export function broadcastToRoom(room: string, message: any) {
  // This would require implementing a room subscription system
  // For now, just a placeholder
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