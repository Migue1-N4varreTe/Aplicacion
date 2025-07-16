import { supabase } from "../config/supabase.js";
import {
  canManageUser,
  validateRoleTransition,
  hasPermission,
} from "./permissions.js";
import { ROLE_HIERARCHY } from "./roles.js";

const getAllUsers = async (currentUser) => {
  try {
    // Users can only see users of their level or lower
    const { data: users, error } = await supabase
      .from("users")
      .select(
        `
        id,
        email,
        first_name,
        last_name,
        role,
        level,
        store_id,
        is_active,
        created_at,
        last_login_at,
        stores (
          id,
          name
        )
      `,
      )
      .lte("level", currentUser.level)
      .order("level", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Error al obtener usuarios: " + error.message);
    }

    return users;
  } catch (error) {
    throw error;
  }
};

const getUserById = async (userId, currentUser) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select(
        `
        id,
        email,
        first_name,
        last_name,
        role,
        level,
        store_id,
        is_active,
        created_at,
        last_login_at,
        stores (
          id,
          name,
          address
        )
      `,
      )
      .eq("id", userId)
      .single();

    if (error || !user) {
      throw new Error("Usuario no encontrado");
    }

    // Check if current user can view this user
    if (
      !canManageUser(currentUser.role, user.role) &&
      currentUser.id !== userId
    ) {
      throw new Error("No tienes permiso para ver este usuario");
    }

    return user;
  } catch (error) {
    throw error;
  }
};

const updateUser = async (userId, updateData, currentUser) => {
  try {
    // Get target user first
    const { data: targetUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError || !targetUser) {
      throw new Error("Usuario no encontrado");
    }

    // Check permissions
    if (
      !canManageUser(currentUser.role, targetUser.role) &&
      currentUser.id !== userId
    ) {
      throw new Error("No tienes permiso para modificar este usuario");
    }

    // Prepare update data (exclude sensitive fields)
    const allowedFields = [
      "first_name",
      "last_name",
      "email",
      "store_id",
      "is_active",
    ];
    const filteredData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    // Only allow certain users to modify is_active
    if (filteredData.is_active !== undefined && currentUser.level < 3) {
      delete filteredData.is_active;
    }

    filteredData.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(filteredData)
      .eq("id", userId)
      .select(
        `
        id,
        email,
        first_name,
        last_name,
        role,
        level,
        store_id,
        is_active,
        updated_at
      `,
      )
      .single();

    if (error) {
      throw new Error("Error al actualizar usuario: " + error.message);
    }

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

const updateUserRole = async (userId, newRole, currentUser) => {
  try {
    // Get target user
    const { data: targetUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError || !targetUser) {
      throw new Error("Usuario no encontrado");
    }

    // Validate role transition
    validateRoleTransition(targetUser.role, newRole, currentUser.role);

    // Update role and level
    const newLevel = ROLE_HIERARCHY[newRole];

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        role: newRole,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select(
        `
        id,
        email,
        first_name,
        last_name,
        role,
        level,
        store_id,
        is_active,
        updated_at
      `,
      )
      .single();

    if (error) {
      throw new Error("Error al actualizar rol: " + error.message);
    }

    // Log role change
    await supabase.from("audit_logs").insert([
      {
        user_id: currentUser.id,
        target_user_id: userId,
        action: "role_change",
        details: {
          old_role: targetUser.role,
          new_role: newRole,
          old_level: targetUser.level,
          new_level: newLevel,
        },
        created_at: new Date().toISOString(),
      },
    ]);

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (userId, currentUser) => {
  try {
    // Get target user
    const { data: targetUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError || !targetUser) {
      throw new Error("Usuario no encontrado");
    }

    // Check permissions
    if (!canManageUser(currentUser.role, targetUser.role)) {
      throw new Error("No tienes permiso para eliminar este usuario");
    }

    // Can't delete yourself
    if (currentUser.id === userId) {
      throw new Error("No puedes eliminar tu propia cuenta");
    }

    // Soft delete by deactivating
    const { error } = await supabase
      .from("users")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      throw new Error("Error al eliminar usuario: " + error.message);
    }

    // Log deletion
    await supabase.from("audit_logs").insert([
      {
        user_id: currentUser.id,
        target_user_id: userId,
        action: "user_deactivated",
        details: {
          target_user_email: targetUser.email,
          target_user_role: targetUser.role,
        },
        created_at: new Date().toISOString(),
      },
    ]);

    return true;
  } catch (error) {
    throw error;
  }
};

const getTemporaryPermissions = async (userId) => {
  try {
    const { data: permissions, error } = await supabase
      .from("temporary_permissions")
      .select("*")
      .eq("user_id", userId)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Error al obtener permisos temporales: " + error.message);
    }

    return permissions || [];
  } catch (error) {
    throw error;
  }
};

const grantTemporaryPermission = async (
  userId,
  permission,
  durationMinutes,
  granter,
) => {
  try {
    // Check if granter has the permission they're trying to grant
    if (!hasPermission(granter.role, permission)) {
      throw new Error("No puedes otorgar un permiso que no tienes");
    }

    // Get target user
    const { data: targetUser, error: fetchError } = await supabase
      .from("users")
      .select("role, level")
      .eq("id", userId)
      .single();

    if (fetchError || !targetUser) {
      throw new Error("Usuario no encontrado");
    }

    // Check if granter can manage target user
    if (!canManageUser(granter.role, targetUser.role)) {
      throw new Error("No tienes permiso para otorgar permisos a este usuario");
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);

    const { data: tempPermission, error } = await supabase
      .from("temporary_permissions")
      .insert([
        {
          user_id: userId,
          permission,
          granted_by: granter.id,
          expires_at: expiresAt.toISOString(),
          duration_minutes: durationMinutes,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error("Error al otorgar permiso temporal: " + error.message);
    }

    // Log permission grant
    await supabase.from("audit_logs").insert([
      {
        user_id: granter.id,
        target_user_id: userId,
        action: "temporary_permission_granted",
        details: {
          permission,
          duration_minutes: durationMinutes,
          expires_at: expiresAt.toISOString(),
        },
        created_at: new Date().toISOString(),
      },
    ]);

    return tempPermission;
  } catch (error) {
    throw error;
  }
};

const revokeTemporaryPermission = async (userId, permission, revoker) => {
  try {
    const { error } = await supabase
      .from("temporary_permissions")
      .delete()
      .eq("user_id", userId)
      .eq("permission", permission)
      .gte("expires_at", new Date().toISOString());

    if (error) {
      throw new Error("Error al revocar permiso temporal: " + error.message);
    }

    // Log permission revocation
    await supabase.from("audit_logs").insert([
      {
        user_id: revoker.id,
        target_user_id: userId,
        action: "temporary_permission_revoked",
        details: { permission },
        created_at: new Date().toISOString(),
      },
    ]);

    return true;
  } catch (error) {
    throw error;
  }
};

export {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
  getTemporaryPermissions,
  grantTemporaryPermission,
  revokeTemporaryPermission,
};
