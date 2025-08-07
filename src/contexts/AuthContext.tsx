import React, { createContext, useContext, useEffect, useState } from "react";
import { apiService } from "../services/api";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  level: number;
  store_id?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  hasLevel: (minLevel: number) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS = {
  LEVEL_5_DEVELOPER: ["*"], // Full access
  LEVEL_4_OWNER: [
    "sales:create",
    "sales:create_order",
    "sales:process_payment",
    "sales:apply_discount",
    "sales:handle_return",
    "sales:view_sales",
    "inventory:view",
    "inventory:add_item",
    "inventory:update_item",
    "inventory:delete_item",
    "inventory:manage_suppliers",
    "inventory:view_low_stock",
    "reports:view",
    "reports:view_sales",
    "reports:view_financial",
    "reports:view_inventory",
    "reports:view_employees",
    "reports:export_data",
    "staff:view",
    "staff:create",
    "staff:update",
    "staff:delete",
    "staff:manage_roles",
    "staff:view_attendance",
    "business:manage_pricing",
    "business:manage_stores",
    "business:manage_policies",
    "business:view_analytics",
    "clients:view",
    "customers:view_basic",
    "customers:view_detailed",
    "customers:manage_loyalty",
    "customers:handle_complaints",
    "system:config",
  ],
  LEVEL_3_MANAGER: [
    "sales:create",
    "sales:create_order",
    "sales:process_payment",
    "sales:apply_discount",
    "sales:handle_return",
    "sales:view_sales",
    "inventory:view",
    "inventory:add_item",
    "inventory:update_item",
    "inventory:view_low_stock",
    "reports:view",
    "reports:view_sales",
    "reports:view_inventory",
    "reports:view_employees",
    "staff:view",
    "staff:update",
    "staff:view_attendance",
    "clients:view",
    "customers:view_basic",
    "customers:view_detailed",
    "customers:handle_complaints",
  ],
  LEVEL_2_SUPERVISOR: [
    "sales:create",
    "sales:create_order",
    "sales:process_payment",
    "sales:view_sales",
    "inventory:view",
    "inventory:view_low_stock",
    "reports:view",
    "reports:view_sales",
    "staff:view",
    "staff:view_attendance",
    "clients:view",
    "customers:view_basic",
    "customers:handle_complaints",
  ],
  LEVEL_1_CASHIER: [
    "sales:create",
    "sales:create_order",
    "sales:process_payment",
    "inventory:view",
    "customers:view_basic",
  ],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
  }) => {
    try {
      const response = await apiService.register(userData);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await apiService.getMe();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    const userPermissions =
      ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];
    if (!userPermissions) return false;

    // Developer has all permissions
    if (userPermissions.includes("*")) return true;

    return userPermissions.includes(permission);
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  const hasLevel = (minLevel: number): boolean => {
    if (!user) return false;
    return user.level >= minLevel;
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        try {
          await refreshUser();
        } catch (error) {
          console.error("Auth initialization failed:", error);
          // Don't remove token on initialization failure - might be network issue
          console.warn("Keeping auth token - will retry on next request");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    hasPermission,
    hasRole,
    hasLevel,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
