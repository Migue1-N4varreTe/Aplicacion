import {
  ROLES,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  CAN_ASSIGN_ROLES,
} from "./roles.js";

const hasPermission = (userRole, requiredPermission) => {
  const userPermissions = ROLE_PERMISSIONS[userRole];

  if (!userPermissions) {
    return false;
  }

  // Developer has all permissions
  if (userPermissions.includes("*")) {
    return true;
  }

  return userPermissions.includes(requiredPermission);
};

const hasAnyPermission = (userRole, requiredPermissions) => {
  return requiredPermissions.some((permission) =>
    hasPermission(userRole, permission),
  );
};

const hasAllPermissions = (userRole, requiredPermissions) => {
  return requiredPermissions.every((permission) =>
    hasPermission(userRole, permission),
  );
};

const canAssignRole = (assignerRole, targetRole) => {
  const assignableRoles = CAN_ASSIGN_ROLES[assignerRole];
  return assignableRoles && assignableRoles.includes(targetRole);
};

const getRoleLevel = (role) => {
  return ROLE_HIERARCHY[role] || 0;
};

const canManageUser = (managerRole, targetUserRole) => {
  const managerLevel = getRoleLevel(managerRole);
  const targetLevel = getRoleLevel(targetUserRole);

  // Manager must have higher or equal level to manage user
  return managerLevel >= targetLevel;
};

const getAccessibleRoles = (userRole) => {
  const userLevel = getRoleLevel(userRole);

  return Object.entries(ROLE_HIERARCHY)
    .filter(([role, level]) => level <= userLevel)
    .map(([role]) => role);
};

const validateRoleTransition = (currentRole, newRole, assignerRole) => {
  // Check if assigner can assign the new role
  if (!canAssignRole(assignerRole, newRole)) {
    throw new Error(`No tienes permiso para asignar el rol ${newRole}`);
  }

  // Check if assigner can manage the current user
  if (!canManageUser(assignerRole, currentRole)) {
    throw new Error("No tienes permiso para modificar este usuario");
  }

  return true;
};

export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAssignRole,
  getRoleLevel,
  canManageUser,
  getAccessibleRoles,
  validateRoleTransition,
};
