import { supabase } from "../config/supabase.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { generateToken, refreshToken } from "../utils/jwt.js";
import { ROLES } from "../users/roles.js";

const login = async ({ email, password }) => {
  try {
    // Get user from database
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !user) {
      throw new Error("Credenciales inválidas");
    }

    if (!user.is_active) {
      throw new Error("Usuario desactivado");
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error("Credenciales inválidas");
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      level: user.level,
    });

    // Update last login
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id);

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      message: "Inicio de sesión exitoso",
    };
  } catch (error) {
    throw error;
  }
};

const register = async ({
  email,
  password,
  first_name,
  last_name,
  role = ROLES.CASHIER,
  store_id = null,
}) => {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      throw new Error("El usuario ya existe");
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Determine user level based on role
    const level =
      {
        [ROLES.DEVELOPER]: 5,
        [ROLES.OWNER]: 4,
        [ROLES.MANAGER]: 3,
        [ROLES.SUPERVISOR]: 2,
        [ROLES.CASHIER]: 1,
      }[role] || 1;

    // Create user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          email: email.toLowerCase(),
          password_hash,
          first_name,
          last_name,
          role,
          level,
          store_id,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error("Error al crear usuario: " + error.message);
    }

    // Generate token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      level: newUser.level,
    });

    // Return user without password
    const { password_hash: _, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      token,
      message: "Usuario registrado exitosamente",
    };
  } catch (error) {
    throw error;
  }
};

const getMe = async (userId) => {
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

    return user;
  } catch (error) {
    throw error;
  }
};

const refreshUserToken = async (token) => {
  try {
    return refreshToken(token);
  } catch (error) {
    throw new Error("Token inválido o expirado");
  }
};

const logout = async (userId) => {
  // In a more complex system, you might want to blacklist the token
  // For now, we just log the logout
  console.log(`User ${userId} logged out at ${new Date().toISOString()}`);
  return true;
};

export { login, register, getMe, refreshUserToken, logout };
