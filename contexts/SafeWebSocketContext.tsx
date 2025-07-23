import React, { createContext, useContext } from "react";

// Safe no-op WebSocket context that never fails
interface SafeWebSocketContextType {
  isConnected: boolean;
  connectionStatus: "disconnected";
  lastMessage: null;
  sendMessage: (type: string, data: any) => void;
  subscribe: (type: string, callback: (data: any) => void) => () => void;
  reconnect: () => void;
  connectionAttempts: number;
}

const SafeWebSocketContext = createContext<SafeWebSocketContextType>({
  isConnected: false,
  connectionStatus: "disconnected",
  lastMessage: null,
  sendMessage: () => {}, // No-op
  subscribe: () => () => {}, // No-op that returns no-op unsubscribe
  reconnect: () => {}, // No-op
  connectionAttempts: 0,
});

export const useSafeWebSocket = () => {
  return useContext(SafeWebSocketContext);
};

export const SafeWebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const contextValue: SafeWebSocketContextType = {
    isConnected: false,
    connectionStatus: "disconnected",
    lastMessage: null,
    sendMessage: () => {},
    subscribe: () => () => {},
    reconnect: () => {},
    connectionAttempts: 0,
  };

  return (
    <SafeWebSocketContext.Provider value={contextValue}>
      {children}
    </SafeWebSocketContext.Provider>
  );
};

// Safe no-op hooks that never fail
export const useSafeInventoryUpdates = () => {
  return []; // Always return empty array
};

export const useSafeSalesUpdates = () => {
  return []; // Always return empty array
};

export const useSafeSystemAlerts = () => {
  return []; // Always return empty array
};

export default SafeWebSocketProvider;
