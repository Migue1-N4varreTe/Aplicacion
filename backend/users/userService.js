import { supabase, supabaseAdmin } from "../config/supabase.js";
import bcrypt from "bcryptjs";

export class UserService {
  // Create new user using auth.users and user_profiles
  static async createUser(userData) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        role = "ventas",
        phone,
        employeeId,
        storeLocation,
        salary,
      } = userData;

      // Create user in Supabase Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Get or create role
      let { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("*")
        .eq("name", role)
        .single();

      if (roleError && roleError.code === 'PGRST116') {
        // Role doesn't exist, create it
        const { data: newRole, error: createRoleError } = await supabaseAdmin
          .from("roles")
          .insert([{
            name: role,
            description: `Role for ${role}`,
            permissions: {}
          }])
          .select()
          .single();

        if (createRoleError) throw createRoleError;
        roleData = newRole;
      } else if (roleError) {
        throw roleError;
      }

      // Create user profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .insert([{
          id: authUser.user.id,
          role_id: roleData.id,
          first_name: firstName,
          last_name: lastName,
          phone,
          employee_id: employeeId,
          store_location: storeLocation,
          salary,
          is_active: true,
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      // Also create user_auth_profiles for additional data
      await supabaseAdmin
        .from("user_auth_profiles")
        .insert([{
          user_id: authUser.user.id,
          full_name: `${firstName} ${lastName}`,
        }]);

      return { 
        ...authUser.user, 
        profile,
        role: roleData 
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  // Get user by ID with profile and role
  static async getUserById(userId) {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select(`
          *,
          role:roles(*)
        `)
        .eq("id", userId)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("User not found");
    }
  }

  // Get all users with pagination
  static async getAllUsers(page = 1, limit = 10, storeLocation = null) {
    try {
      const offset = (page - 1) * limit;
      
      let query = supabase
        .from("user_profiles")
        .select(`
          *,
          role:roles(*)
        `, { count: "exact" })
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (storeLocation) {
        query = query.eq("store_location", storeLocation);
      }

      const { data: users, error, count } = await query;

      if (error) throw error;

      return {
        users,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  // Update user profile
  static async updateUser(userId, updateData) {
    try {
      const {
        firstName,
        lastName,
        phone,
        employeeId,
        storeLocation,
        salary,
        isActive,
      } = updateData;

      const updateFields = {
        updated_at: new Date().toISOString(),
      };

      if (firstName !== undefined) updateFields.first_name = firstName;
      if (lastName !== undefined) updateFields.last_name = lastName;
      if (phone !== undefined) updateFields.phone = phone;
      if (employeeId !== undefined) updateFields.employee_id = employeeId;
      if (storeLocation !== undefined) updateFields.store_location = storeLocation;
      if (salary !== undefined) updateFields.salary = salary;
      if (isActive !== undefined) updateFields.is_active = isActive;

      const { data: profile, error } = await supabaseAdmin
        .from("user_profiles")
        .update(updateFields)
        .eq("id", userId)
        .select(`
          *,
          role:roles(*)
        `)
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user");
    }
  }

  // Update user role
  static async updateUserRole(userId, roleId) {
    try {
      const { data: profile, error } = await supabaseAdmin
        .from("user_profiles")
        .update({
          role_id: roleId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select(`
          *,
          role:roles(*)
        `)
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw new Error("Failed to update user role");
    }
  }

  // Soft delete user
  static async deleteUser(userId) {
    try {
      const { error } = await supabaseAdmin
        .from("user_profiles")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
      return { message: "User deleted successfully" };
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Failed to delete user");
    }
  }

  // Get users by role
  static async getUsersByRole(roleName, storeLocation = null) {
    try {
      let query = supabase
        .from("user_profiles")
        .select(`
          *,
          role:roles!inner(*)
        `)
        .eq("role.name", roleName)
        .eq("is_active", true)
        .order("first_name", { ascending: true });

      if (storeLocation) {
        query = query.eq("store_location", storeLocation);
      }

      const { data: users, error } = await query;

      if (error) throw error;
      return users;
    } catch (error) {
      console.error("Error fetching users by role:", error);
      throw new Error("Failed to fetch users by role");
    }
  }

  // Grant temporary permission
  static async grantTemporaryPermission(userId, permissionType, resourceId, expiresAt, grantedBy) {
    try {
      const { data: permission, error } = await supabaseAdmin
        .from("temporary_permissions")
        .insert([{
          user_id: userId,
          permission_type: permissionType,
          resource_id: resourceId,
          granted_by: grantedBy,
          expires_at: expiresAt,
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return permission;
    } catch (error) {
      console.error("Error granting temporary permission:", error);
      throw new Error("Failed to grant temporary permission");
    }
  }

  // Get active temporary permissions for user
  static async getTemporaryPermissions(userId) {
    try {
      const { data: permissions, error } = await supabase
        .from("temporary_permissions")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .gte("expires_at", new Date().toISOString());

      if (error) throw error;
      return permissions;
    } catch (error) {
      console.error("Error fetching temporary permissions:", error);
      throw new Error("Failed to fetch temporary permissions");
    }
  }

  // Revoke temporary permission
  static async revokeTemporaryPermission(permissionId) {
    try {
      const { error } = await supabaseAdmin
        .from("temporary_permissions")
        .update({
          is_active: false,
        })
        .eq("id", permissionId);

      if (error) throw error;
      return { message: "Permission revoked successfully" };
    } catch (error) {
      console.error("Error revoking temporary permission:", error);
      throw new Error("Failed to revoke temporary permission");
    }
  }

  // Get all roles
  static async getAllRoles() {
    try {
      const { data: roles, error } = await supabase
        .from("roles")
        .select("*")
        .order("name");

      if (error) throw error;
      return roles;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw new Error("Failed to fetch roles");
    }
  }
}

export default UserService;
