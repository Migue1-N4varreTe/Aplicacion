import React from "react";
import { useAuth } from "../contexts/AuthContext";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  role?: string | string[];
  level?: number;
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, user must have ALL specified permissions/roles/levels
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  role,
  level,
  fallback = null,
  requireAll = true,
}) => {
  const { user, hasPermission, hasRole, hasLevel } = useAuth();

  if (!user) {
    // In development, provide helpful message for protected routes
    if (process.env.NODE_ENV === "development") {
      if (permission === "staff:view") {
        console.warn(
          "Employee management access requires login with staff permissions. Use a user with LEVEL_2_SUPERVISOR or higher role.",
        );
      } else if (permission === "reports:view") {
        console.warn(
          "Reports access requires login with reports permissions. Use a user with LEVEL_2_SUPERVISOR or higher role.",
        );
      } else if (permission === "inventory:view") {
        console.warn(
          "Inventory access requires login with inventory permissions. Use a user with LEVEL_1_CASHIER or higher role.",
        );
      } else if (permission === "sales:create") {
        console.warn(
          "POS access requires login with sales permissions. Use a user with LEVEL_1_CASHIER or higher role.",
        );
      }
    }
    return <>{fallback}</>;
  }

  const checks: boolean[] = [];

  if (permission) {
    const hasPermissionResult = hasPermission(permission);
    checks.push(hasPermissionResult);

    // Debug logging for protected routes in development
    if (process.env.NODE_ENV === "development") {
      if (
        [
          "reports:view",
          "staff:view",
          "inventory:view",
          "sales:create",
        ].includes(permission)
      ) {
        console.log(`${permission} permission check:`, {
          permission,
          hasPermission: hasPermissionResult,
          userRole: user.role,
          userLevel: user.level,
        });
      }
    }
  }

  if (role) {
    checks.push(hasRole(role));
  }

  if (level !== undefined) {
    checks.push(hasLevel(level));
  }

  // If no checks specified, allow access
  if (checks.length === 0) {
    return <>{children}</>;
  }

  const hasAccess = requireAll
    ? checks.every((check) => check)
    : checks.some((check) => check);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;
