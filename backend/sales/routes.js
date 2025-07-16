import express from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken, requirePermission } from "../auth/middleware.js";
import { PERMISSIONS } from "../users/roles.js";
import {
  scanProduct,
  createSale,
  processPayment,
  generateReceipt,
  processSaleRefund,
  getSaleById,
  getSales,
  getSalesReport,
} from "./salesService.js";

const router = express.Router();

// Barcode scanning
router.post(
  "/scan",
  authenticateToken,
  requirePermission(PERMISSIONS.SALES.CREATE_ORDER),
  [body("barcode").notEmpty().withMessage("Código de barras requerido")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await scanProduct(req.body.barcode);
      res.json(product);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
);

// Create sale/checkout
router.post(
  "/checkout",
  authenticateToken,
  requirePermission(PERMISSIONS.SALES.PROCESS_PAYMENT),
  [
    body("items").isArray().withMessage("Items requeridos"),
    body("items.*.product_id")
      .notEmpty()
      .withMessage("ID de producto requerido"),
    body("items.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Cantidad debe ser mayor a 0"),
    body("payment_method")
      .isIn(["cash", "card", "transfer"])
      .withMessage("Método de pago inválido"),
    body("total")
      .isFloat({ min: 0 })
      .withMessage("Total debe ser un número válido"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const sale = await createSale(req.body, req.user);
      res.json(sale);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Process payment
router.post(
  "/payment",
  authenticateToken,
  requirePermission(PERMISSIONS.SALES.PROCESS_PAYMENT),
  [
    body("sale_id").notEmpty().withMessage("ID de venta requerido"),
    body("payment_method")
      .isIn(["cash", "card", "transfer"])
      .withMessage("Método de pago inválido"),
    body("amount_received")
      .isFloat({ min: 0 })
      .withMessage("Monto recibido debe ser válido"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const payment = await processPayment(req.body, req.user);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Generate receipt/ticket
router.get(
  "/ticket/:saleId",
  authenticateToken,
  requirePermission(PERMISSIONS.SALES.VIEW_SALES),
  async (req, res) => {
    try {
      const receipt = await generateReceipt(req.params.saleId);
      res.json(receipt);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
);

// Process refund
router.post(
  "/refund",
  authenticateToken,
  requirePermission(PERMISSIONS.SALES.HANDLE_RETURN),
  [
    body("sale_id").notEmpty().withMessage("ID de venta requerido"),
    body("items").isArray().withMessage("Items a devolver requeridos"),
    body("reason").notEmpty().withMessage("Razón de devolución requerida"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const refund = await processSaleRefund(req.body, req.user);
      res.json(refund);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Get sale by ID
router.get(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.SALES.VIEW_SALES),
  async (req, res) => {
    try {
      const sale = await getSaleById(req.params.id);
      res.json(sale);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
);

// Get sales list
router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSIONS.SALES.VIEW_SALES),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        from_date,
        to_date,
        cashier_id,
      } = req.query;

      const sales = await getSales({
        page: parseInt(page),
        limit: parseInt(limit),
        from_date,
        to_date,
        cashier_id,
        store_id: req.user.store_id,
      });

      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Sales report
router.get(
  "/reports/summary",
  authenticateToken,
  requirePermission(PERMISSIONS.REPORTS.VIEW_SALES),
  async (req, res) => {
    try {
      const { from_date, to_date, cashier_id } = req.query;
      const report = await getSalesReport({
        from_date,
        to_date,
        cashier_id,
        store_id: req.user.store_id,
      });
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
