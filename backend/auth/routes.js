import express from "express";
import { body, validationResult } from "express-validator";
import { login, register, getMe, refreshUserToken, logout } from "./login.js";
import { authenticateToken } from "./middleware.js";

const router = express.Router();

// Validation rules
const loginValidation = [
  body("email").isEmail().withMessage("Email inválido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Contraseña debe tener al menos 6 caracteres"),
];

const registerValidation = [
  body("email").isEmail().withMessage("Email inválido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Contraseña debe tener al menos 6 caracteres"),
  body("first_name").notEmpty().withMessage("Nombre es requerido"),
  body("last_name").notEmpty().withMessage("Apellido es requerido"),
  body("role")
    .optional()
    .isIn([
      "LEVEL_5_DEVELOPER",
      "LEVEL_4_OWNER",
      "LEVEL_3_MANAGER",
      "LEVEL_2_SUPERVISOR",
      "LEVEL_1_CASHIER",
    ]),
];

// Routes
router.post("/login", loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await login(req.body);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.post("/register", registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await getMe(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { token } = req.body;
    const newToken = await refreshUserToken(token);
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.post("/logout", authenticateToken, async (req, res) => {
  try {
    await logout(req.user.id);
    res.json({ message: "Sesión cerrada exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
