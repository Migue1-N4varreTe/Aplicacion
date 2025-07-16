import express from "express";
import { body, validationResult } from "express-validator";
import {
  authenticateToken,
  requirePermission,
  requireLevel,
} from "../auth/middleware.js";
import { PERMISSIONS } from "./roles.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  getTemporaryPermissions,
  grantTemporaryPermission,
  revokeTemporaryPermission,
} from "./userService.js";

const router = express.Router();

// Get all users (requires staff view permission)
router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSIONS.STAFF.VIEW),
  async (req, res) => {
    try {
      const users = await getAllUsers(req.user);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get user by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.params.id, req.user);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Update user
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.STAFF.UPDATE),
  [
    body("first_name")
      .optional()
      .notEmpty()
      .withMessage("Nombre no puede estar vacío"),
    body("last_name")
      .optional()
      .notEmpty()
      .withMessage("Apellido no puede estar vacío"),
    body("email").optional().isEmail().withMessage("Email inválido"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedUser = await updateUser(req.params.id, req.body, req.user);
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Update user role
router.put(
  "/:id/role",
  authenticateToken,
  requirePermission(PERMISSIONS.STAFF.MANAGE_ROLES),
  [
    body("role")
      .isIn([
        "LEVEL_5_DEVELOPER",
        "LEVEL_4_OWNER",
        "LEVEL_3_MANAGER",
        "LEVEL_2_SUPERVISOR",
        "LEVEL_1_CASHIER",
      ])
      .withMessage("Rol inválido"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedUser = await updateUserRole(
        req.params.id,
        req.body.role,
        req.user,
      );
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Delete user
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.STAFF.DELETE),
  async (req, res) => {
    try {
      await deleteUser(req.params.id, req.user);
      res.json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Get temporary permissions for user
router.get(
  "/:id/temporary-permissions",
  authenticateToken,
  async (req, res) => {
    try {
      const tempPermissions = await getTemporaryPermissions(req.params.id);
      res.json(tempPermissions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Grant temporary permission
router.post(
  "/:id/temporary-permissions",
  authenticateToken,
  requireLevel(2), // Supervisor level or higher
  [
    body("permission").notEmpty().withMessage("Permiso requerido"),
    body("duration_minutes")
      .optional()
      .isInt({ min: 1, max: 1440 })
      .withMessage("Duración debe ser entre 1 y 1440 minutos"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await grantTemporaryPermission(
        req.params.id,
        req.body.permission,
        req.body.duration_minutes || 120,
        req.user,
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Revoke temporary permission
router.delete(
  "/:id/temporary-permissions/:permission",
  authenticateToken,
  requireLevel(2),
  async (req, res) => {
    try {
      await revokeTemporaryPermission(
        req.params.id,
        req.params.permission,
        req.user,
      );
      res.json({ message: "Permiso temporal revocado" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

export default router;
