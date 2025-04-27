import { useEffect, useState, useCallback, useRef } from 'react';

type MessageHandler = (data: any) => void;

// WebSocket connection status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

// WebSocket hook for real-time updates
export function useWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const messageHandlers = useRef<Map<string, MessageHandler[]>>(new Map());
  const reconnectTimeoutRef = useRef<number | null>(null);
  
  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    try {
      setStatus('connecting');
      
      // Create WebSocket connection with the correct protocol and path
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        setStatus('connected');
        setError(null);
        console.log('WebSocket connection established');
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message && message.type) {
            // Call all registered handlers for this message type
            const handlers = messageHandlers.current.get(message.type) || [];
            handlers.forEach(handler => handler(message));
            
            // Also call handlers registered for 'all' messages
            const allHandlers = messageHandlers.current.get('all') || [];
            allHandlers.forEach(handler => handler(message));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      socket.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError(new Error('WebSocket connection error'));
      };
      
      socket.onclose = () => {
        setStatus('disconnected');
        console.log('WebSocket connection closed');
        
        // Attempt to reconnect after a delay
        if (reconnectTimeoutRef.current) {
          window.clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          connect();
        }, 3000); // Reconnect after 3 seconds
      };
      
      webSocketRef.current = socket;
    } catch (err) {
      setStatus('disconnected');
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Failed to connect WebSocket:', err);
    }
  }, []);
  
  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
    
    setStatus('disconnected');
  }, []);
  
  // Send message to the server
  const sendMessage = useCallback((data: any) => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(JSON.stringify(data));
      return true;
    } else {
      // If socket isn't open, try to reconnect
      connect();
      
      // Add to a queue or return false to indicate the message wasn't sent
      console.log('WebSocket not connected, message not sent');
      return false;
    }
  }, [connect]);
  
  // Register a handler for a specific message type
  const addMessageHandler = useCallback((type: string, handler: MessageHandler) => {
    const handlers = messageHandlers.current.get(type) || [];
    handlers.push(handler);
    messageHandlers.current.set(type, handlers);
    
    // Return a function to remove the handler
    return () => {
      const updatedHandlers = messageHandlers.current.get(type) || [];
      messageHandlers.current.set(
        type,
        updatedHandlers.filter(h => h !== handler)
      );
    };
  }, []);
  
  // Connect on component mount, disconnect on unmount
  useEffect(() => {
    connect();
    
    // Add window focus/blur event listeners to improve connection reliability
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (webSocketRef.current?.readyState !== WebSocket.OPEN) {
          console.log('Page visible again, reconnecting WebSocket...');
          connect();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Ping the server every 30 seconds to keep the connection alive
    const pingInterval = window.setInterval(() => {
      if (webSocketRef.current?.readyState === WebSocket.OPEN) {
        try {
          sendMessage({ type: 'ping' });
        } catch (err) {
          console.error('Error sending ping:', err);
        }
      }
    }, 30000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(pingInterval);
      disconnect();
    };
  }, [connect, disconnect, sendMessage]);
  
  return {
    status,
    error,
    sendMessage,
    addMessageHandler,
    connect,
    disconnect
  };
}

// WebSocket context for app-wide use
import { createContext, useContext, ReactNode } from 'react';

type WebSocketContextType = ReturnType<typeof useWebSocket>;

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const webSocket = useWebSocket();
  
  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  
  return context;
}