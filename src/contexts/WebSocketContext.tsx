import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useToast } from "@/hooks/use-toast";

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  id?: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  lastMessage: WebSocketMessage | null;
  sendMessage: (type: string, data: any) => void;
  subscribe: (type: string, callback: (data: any) => void) => () => void;
  reconnect: () => void;
  connectionAttempts: number;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  url = process.env.NODE_ENV === "production"
    ? `wss://${window.location.hostname}/ws`
    : `ws://${window.location.hostname}:5001`,
  autoReconnect = true,
  maxReconnectAttempts = 3,
  reconnectInterval = 5000,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Map<string, Set<(data: any) => void>>>(
    new Map(),
  );
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  const clearTimeouts = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const startHeartbeat = () => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendMessage("ping", { timestamp: Date.now() });
      }
    }, 30000); // Send ping every 30 seconds
  };

  const connect = () => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      setConnectionStatus("connecting");

      // Check if WebSocket is available
      if (typeof WebSocket === "undefined") {
        console.warn("WebSocket is not supported in this environment");
        setConnectionStatus("error");
        return;
      }

      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setConnectionStatus("connected");
        setConnectionAttempts(0);
        startHeartbeat();

        // Only show success message if we had previous connection issues
        if (connectionAttempts > 0) {
          toast({
            title: "Conexión restablecida",
            description: "Conectado al servidor en tiempo real",
          });
        }

        // Send authentication if needed
        sendMessage("auth", {
          token: localStorage.getItem("authToken"),
          clientType: "pos-terminal",
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          // Handle heartbeat response
          if (message.type === "pong") {
            return;
          }

          // Notify subscribers
          const subscribers = subscribersRef.current.get(message.type);
          if (subscribers) {
            subscribers.forEach((callback) => callback(message.data));
          }

          // Handle global message types
          handleGlobalMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus("disconnected");
        clearTimeouts();

        if (autoReconnect && connectionAttempts < maxReconnectAttempts) {
          const nextAttempt = connectionAttempts + 1;
          setConnectionAttempts(nextAttempt);

          console.log(
            `Attempting to reconnect (${nextAttempt}/${maxReconnectAttempts})...`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval * nextAttempt); // Exponential backoff
        } else if (connectionAttempts >= maxReconnectAttempts) {
          setConnectionStatus("error");
          // Only show error toast in production or if user was previously connected
          if (process.env.NODE_ENV === "production" || connectionAttempts > 1) {
            toast({
              title: "Servidor en tiempo real no disponible",
              description:
                "Algunas funciones en tiempo real pueden estar limitadas",
              variant: "destructive",
            });
          }
          console.warn("WebSocket connection failed after maximum attempts");
        }
      };

      wsRef.current.onerror = (error) => {
        console.warn(
          "WebSocket connection error - this is normal if no WebSocket server is running",
        );
        setConnectionStatus("error");
      };
    } catch (error) {
      console.warn("Failed to create WebSocket connection:", error);
      setConnectionStatus("error");

      // Don't show toast in development if it's just a connection failure
      if (process.env.NODE_ENV === "production") {
        toast({
          title: "Error de conexión WebSocket",
          description: "No se pudo conectar al servidor en tiempo real",
          variant: "destructive",
        });
      }
    }
  };

  const disconnect = () => {
    clearTimeouts();
    if (wsRef.current) {
      wsRef.current.close(1000, "Client disconnect");
      wsRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus("disconnected");
  };

  const sendMessage = (type: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now(),
        id: generateMessageId(),
      };

      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected. Message not sent:", type, data);
    }
  };

  const subscribe = (type: string, callback: (data: any) => void) => {
    if (!subscribersRef.current.has(type)) {
      subscribersRef.current.set(type, new Set());
    }

    subscribersRef.current.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = subscribersRef.current.get(type);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          subscribersRef.current.delete(type);
        }
      }
    };
  };

  const reconnect = () => {
    disconnect();
    setConnectionAttempts(0);
    setTimeout(connect, 1000);
  };

  const handleGlobalMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case "stock_update":
        toast({
          title: "Inventario actualizado",
          description: `Stock actualizado para ${message.data.productName}`,
        });
        break;

      case "sale_completed":
        toast({
          title: "Venta registrada",
          description: `Nueva venta por Bs. ${message.data.total}`,
        });
        break;

      case "low_stock_alert":
        toast({
          title: "Stock bajo",
          description: `${message.data.productName} tiene solo ${message.data.quantity} unidades`,
          variant: "destructive",
        });
        break;

      case "system_notification":
        toast({
          title: message.data.title || "Notificación del sistema",
          description: message.data.message,
          variant: message.data.type === "error" ? "destructive" : "default",
        });
        break;

      case "user_action":
        // Handle real-time user actions (like another cashier making a sale)
        console.log("User action received:", message.data);
        break;

      default:
        console.log("Unhandled message type:", message.type);
    }
  };

  const generateMessageId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  useEffect(() => {
    // Only auto-connect in production or if explicitly enabled
    if (
      process.env.NODE_ENV === "production" ||
      process.env.REACT_APP_ENABLE_WEBSOCKET === "true"
    ) {
      try {
        connect();
      } catch (error) {
        console.warn("WebSocket connection failed:", error);
        setConnectionStatus("error");
      }
    }

    return () => {
      try {
        disconnect();
      } catch (error) {
        console.warn("WebSocket disconnect failed:", error);
      }
    };
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      try {
        if (document.hidden) {
          // Page is hidden, reduce heartbeat frequency
          clearTimeouts();
        } else {
          // Page is visible, restore normal operation
          if (isConnected) {
            startHeartbeat();
          } else if (autoReconnect) {
            reconnect();
          }
        }
      } catch (error) {
        console.warn("Error handling visibility change:", error);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isConnected, autoReconnect]);

  const contextValue: WebSocketContextType = {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    subscribe,
    reconnect,
    connectionAttempts,
  };

  const contextValueWithFallback: WebSocketContextType = {
    ...contextValue,
    // Wrap methods with error handling
    sendMessage: (type: string, data: any) => {
      try {
        contextValue.sendMessage(type, data);
      } catch (error) {
        console.warn("WebSocket sendMessage failed:", error);
      }
    },
    subscribe: (type: string, callback: (data: any) => void) => {
      try {
        return contextValue.subscribe(type, callback);
      } catch (error) {
        console.warn("WebSocket subscribe failed:", error);
        return () => {}; // Return empty unsubscribe function
      }
    },
    reconnect: () => {
      try {
        contextValue.reconnect();
      } catch (error) {
        console.warn("WebSocket reconnect failed:", error);
      }
    },
  };

  return (
    <WebSocketContext.Provider value={contextValueWithFallback}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hooks for specific WebSocket subscriptions
export const useInventoryUpdates = () => {
  const { subscribe } = useWebSocket();
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe("stock_update", (data) => {
      setUpdates((prev) => [data, ...prev.slice(0, 9)]); // Keep last 10 updates
    });

    return unsubscribe;
  }, [subscribe]);

  return updates;
};

export const useSalesUpdates = () => {
  const { subscribe } = useWebSocket();
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe("sale_completed", (data) => {
      setSales((prev) => [data, ...prev.slice(0, 9)]); // Keep last 10 sales
    });

    return unsubscribe;
  }, [subscribe]);

  return sales;
};

export const useSystemAlerts = () => {
  const { subscribe } = useWebSocket();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeStock = subscribe("low_stock_alert", (data) => {
      setAlerts((prev) => [
        {
          type: "low_stock",
          data,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 19),
      ]); // Keep last 20 alerts
    });

    const unsubscribeSystem = subscribe("system_notification", (data) => {
      setAlerts((prev) => [
        {
          type: "system",
          data,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 19),
      ]);
    });

    return () => {
      unsubscribeStock();
      unsubscribeSystem();
    };
  }, [subscribe]);

  return alerts;
};

export default WebSocketProvider;
