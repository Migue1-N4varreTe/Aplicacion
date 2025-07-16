import { verifyToken } from "../utils/jwt.js";
import { supabase } from "../config/supabase.js";
import { hasPermission } from "../users/permissions.js";

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token de acceso requerido" });
  }

  try {
    const decoded = verifyToken(token);

    // Verify user still exists in database
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Usuario no válido" });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: "Usuario desactivado" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      level: user.level,
      store_id: user.store_id,
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido" });
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        error: "No tienes permiso para realizar esta acción",
        required_permission: permission,
      });
    }

    next();
  };
};

const requireRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (!roleArray.includes(req.user.role)) {
      return res.status(403).json({
        error: "No tienes el rol necesario para esta acción",
        required_roles: roleArray,
      });
    }

    next();
  };
};

const requireLevel = (minLevel) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (req.user.level < minLevel) {
      return res.status(403).json({
        error: "Nivel de acceso insuficiente",
        required_level: minLevel,
        user_level: req.user.level,
      });
    }

    next();
  };
};

export { authenticateToken, requirePermission, requireRole, requireLevel };
