import express from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken, requirePermission } from "../auth/middleware.js";
import { PERMISSIONS } from "../users/roles.js";
import {
  registerClient,
  getClientById,
  getAllClients,
  updateClient,
  getClientHistory,
  addLoyaltyPoints,
  redeemLoyaltyPoints,
  generateCoupon,
  getClientCoupons,
  applyCoupon,
} from "./clientService.js";

const router = express.Router();

// Register new client
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSIONS.CUSTOMERS.VIEW_BASIC),
  [
    body("first_name").notEmpty().withMessage("Nombre requerido"),
    body("last_name").notEmpty().withMessage("Apellido requerido"),
    body("email").optional().isEmail().withMessage("Email inválido"),
    body("phone").optional().isMobilePhone().withMessage("Teléfono inválido"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const client = await registerClient(req.body, req.user);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Get all clients
router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSIONS.CUSTOMERS.VIEW_BASIC),
  async (req, res) => {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const clients = await getAllClients({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        store_id: req.user.store_id,
      });
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get client by ID
router.get(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.CUSTOMERS.VIEW_BASIC),
  async (req, res) => {
    try {
      const client = await getClientById(req.params.id);
      res.json(client);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
);

// Update client
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.CUSTOMERS.VIEW_DETAILED),
  async (req, res) => {
    try {
      const client = await updateClient(req.params.id, req.body, req.user);
      res.json(client);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Get client purchase history
router.get(
  "/:id/history",
  authenticateToken,
  requirePermission(PERMISSIONS.CUSTOMERS.VIEW_DETAILED),
  async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const history = await getClientHistory(req.params.id, {
        page: parseInt(page),
        limit: parseInt(limit),
      });
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Add loyalty points
router.post(
  "/:id/rewards",
  authenticateToken,
  requirePermission(PERMISSIONS.CUSTOMERS.MANAGE_LOYALTY),
  [
    body("points")
      .isInt({ min: 1 })
      .withMessage("Puntos debe ser un número positivo"),
    body("reason").notEmpty().withMessage("Razón requerida"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await addLoyaltyPoints(
        req.params.id,
        req.body.points,
        req.body.reason,
        req.user,
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Redeem loyalty points
router.post(
  "/:id/redeem",
  authenticateToken,
  requirePermission(PERMISSIONS.CUSTOMERS.MANAGE_LOYALTY),
  [
    body("points")
      .isInt({ min: 1 })
      .withMessage("Puntos debe ser un número positivo"),
    body("reward_type").notEmpty().withMessage("Tipo de recompensa requerido"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await redeemLoyaltyPoints(
        req.params.id,
        req.body.points,
        req.body.reward_type,
        req.user,
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Generate coupon
router.post(
  "/:id/coupons",
  authenticateToken,
  requirePermission(PERMISSIONS.CUSTOMERS.MANAGE_LOYALTY),
  [
    body("discount_type")
      .isIn(["percentage", "fixed"])
      .withMessage("Tipo de descuento inválido"),
    body("discount_value")
      .isFloat({ min: 0 })
      .withMessage("Valor de descuento inválido"),
    body("expires_at").notEmpty().withMessage("Fecha de expiración requerida"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const coupon = await generateCoupon(req.params.id, req.body, req.user);
      res.json(coupon);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Get client coupons
router.get(
  "/:id/coupons",
  authenticateToken,
  requirePermission(PERMISSIONS.CUSTOMERS.VIEW_DETAILED),
  async (req, res) => {
    try {
      const coupons = await getClientCoupons(req.params.id);
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Apply coupon
router.post(
  "/apply-coupon",
  authenticateToken,
  requirePermission(PERMISSIONS.SALES.APPLY_DISCOUNT),
  [
    body("coupon_code").notEmpty().withMessage("Código de cupón requerido"),
    body("sale_total")
      .isFloat({ min: 0 })
      .withMessage("Total de venta requerido"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await applyCoupon(
        req.body.coupon_code,
        req.body.sale_total,
        req.user,
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

export default router;
