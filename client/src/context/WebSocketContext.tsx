import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { queryClient } from '@/lib/queryClient';

// Define WebSocket message types
export type WebSocketMessage = {
  type: string;
  queryKey: string | string[];
  payload: any;
  timestamp: string;
};

// Define connection status type
export type ConnectionStatus = 'connecting' | 'open' | 'closed' | 'error';

// Define context type
type WebSocketContextType = {
  socket: WebSocket | null;
  connectionStatus: ConnectionStatus;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: Omit<WebSocketMessage, 'timestamp'>) => void;
  reconnect: () => void;
};

// Create WebSocket context
const WebSocketContext = createContext<WebSocketContextType | null>(null);

// Custom hook to use WebSocket context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// WebSocket Provider component
export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  // State for WebSocket instance
  const [socket, setSocket] = useState<WebSocket | null>(null);
  // State for connection status
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('closed');
  // State for last received message
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  // Reference to reconnection attempts
  const reconnectAttempts = useRef(0);
  // Reference to reconnection timeout
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Maximum reconnect attempts
  const MAX_RECONNECT_ATTEMPTS = 5;
  // Base reconnection delay (increases with backoff)
  const RECONNECT_DELAY_BASE = 1000;

  const { toast } = useToast();
  const { user } = useAuth();

  // Function to establish WebSocket connection
  const connectWebSocket = () => {
    try {
      // Get WebSocket URL from environment or use default
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}/ws`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setConnectionStatus('open');
        reconnectAttempts.current = 0;
        
        // Authenticate after connection
        if (user) {
          ws.send(JSON.stringify({
            type: 'authenticate',
            userId: user.id,
            timestamp: new Date().toISOString()
          }));
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message received:', data.type);
          
          // Handle different message types
          switch (data.type) {
            case 'data_update':
              // Update the query cache with new data
              if (data.queryKey && data.payload) {
                queryClient.setQueryData(data.queryKey, data.payload);
                
                // Show toast notification for important updates
                if (data.payload.notification) {
                  toast({
                    title: data.payload.notification.title,
                    description: data.payload.notification.message,
                    variant: data.payload.notification.type === 'error' ? 'destructive' : 'default',
                  });
                }
              }
              break;
              
            case 'notification':
              // Show notification toast
              toast({
                title: data.payload.title,
                description: data.payload.message,
                variant: data.payload.type === 'error' ? 'destructive' : 'default',
              });
              
              // Also invalidate notifications query to update the notification badge
              queryClient.invalidateQueries(['notifications']);
              break;
              
            case 'invalidate_query':
              // Invalidate specific queries to trigger refetch
              if (data.queryKey) {
                queryClient.invalidateQueries(data.queryKey);
              }
              break;
              
            case 'ping':
              // Respond to ping with pong
              ws.send(JSON.stringify({
                type: 'pong',
                timestamp: new Date().toISOString()
              }));
              break;
              
            default:
              // For any other message, just update the lastMessage state
              setLastMessage(data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      ws.onclose = (event) => {
        setConnectionStatus('closed');
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        
        // If not closed cleanly and not exceeding max retry attempts, try to reconnect
        if (!event.wasClean && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_DELAY_BASE * Math.pow(1.5, reconnectAttempts.current);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            connectWebSocket();
          }, delay);
        } else if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
          console.log('Maximum reconnection attempts reached');
          toast({
            title: 'Connection Lost',
            description: 'Could not reconnect to the server. Please refresh the page.',
            variant: 'destructive',
          });
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };
      
      setSocket(ws);
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  };

  // Handle reconnection manually
  const reconnect = () => {
    if (socket) {
      socket.close();
      reconnectAttempts.current = 0;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    setConnectionStatus('connecting');
    connectWebSocket();
  };

  // Function to send messages through the WebSocket
  const sendMessage = (message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString()
      };
      
      socket.send(JSON.stringify(fullMessage));
    } else {
      console.warn('Cannot send message, WebSocket is not connected');
      toast({
        title: 'Connection Issue',
        description: 'Cannot send message, trying to reconnect...',
        variant: 'destructive',
      });
      
      // Try to reconnect
      reconnect();
    }
  };

  // Initialize WebSocket connection on component mount
  useEffect(() => {
    setConnectionStatus('connecting');
    connectWebSocket();
    
    // Cleanup function
    return () => {
      if (socket) {
        socket.close();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Authenticate when user changes
  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN && user) {
      socket.send(JSON.stringify({
        type: 'authenticate',
        userId: user.id,
        timestamp: new Date().toISOString()
      }));
    }
  }, [user, socket]);

  // Handle window focus/blur events to reconnect when tab becomes active again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // If connection is not open when tab becomes visible, reconnect
        if (socket?.readyState !== WebSocket.OPEN) {
          console.log('Tab visible, reconnecting WebSocket');
          reconnect();
        }
      }
    };

    // Handle connection issues when network status changes
    const handleNetworkChange = () => {
      if (navigator.onLine) {
        console.log('Network connection restored, reconnecting WebSocket');
        // Allow a brief delay for network to stabilize
        setTimeout(reconnect, 1000);
      } else {
        console.log('Network connection lost');
        if (socket) {
          socket.close();
        }
        setConnectionStatus('closed');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, [socket]);

  return (
    <WebSocketContext.Provider value={{
      socket,
      connectionStatus,
      lastMessage,
      sendMessage,
      reconnect
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to subscribe to specific WebSocket events
export const useWebSocketSubscription = (
  eventType: string,
  callback: (data: any) => void
) => {
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage && lastMessage.type === eventType) {
      callback(lastMessage.payload);
    }
  }, [lastMessage, eventType, callback]);
};

// Hook for real-time wallet updates
export const useRealTimeWalletUpdates = (walletId: string) => {
  const { connectionStatus } = useWebSocket();
  
  useEffect(() => {
    // If connected, invalidate wallet data periodically to ensure freshness
    if (connectionStatus === 'open') {
      const intervalId = setInterval(() => {
        queryClient.invalidateQueries(['wallet', walletId]);
      }, 60000); // Refresh every minute as backup to WebSocket
      
      return () => clearInterval(intervalId);
    }
  }, [connectionStatus, walletId]);
  
  // Subscribe to specific wallet updates
  useWebSocketSubscription('wallet_update', (data) => {
    if (data.id === walletId) {
      queryClient.setQueryData(['wallet', walletId], data);
    }
  });
};

// Hook for real-time transaction updates
export const useRealTimeTransactionUpdates = (walletId: string) => {
  // Subscribe to transaction updates for specific wallet
  useWebSocketSubscription('transaction_update', (data) => {
    if (data.walletId === walletId) {
      // Invalidate wallet transactions query to trigger refetch
      queryClient.invalidateQueries(['wallet', walletId, 'transactions']);
      
      // Also update wallet balance data
      queryClient.invalidateQueries(['wallet', walletId]);
    }
  });
};