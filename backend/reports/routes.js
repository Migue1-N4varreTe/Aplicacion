import express from "express";
import { authenticateToken, requirePermission } from "../auth/middleware.js";
import { PERMISSIONS } from "../users/roles.js";

const router = express.Router();

// Sales reports
router.get(
  "/sales",
  authenticateToken,
  requirePermission(PERMISSIONS.REPORTS.VIEW_SALES),
  async (req, res) => {
    try {
      const { range = "daily", from_date, to_date } = req.query;
      res.json({
        message: "Sales reports",
        range,
        from_date,
        to_date,
        data: "Coming soon",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Top products
router.get(
  "/products/top",
  authenticateToken,
  requirePermission(PERMISSIONS.REPORTS.VIEW_INVENTORY),
  async (req, res) => {
    try {
      res.json({ message: "Top products report coming soon" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Employee performance
router.get(
  "/employees",
  authenticateToken,
  requirePermission(PERMISSIONS.REPORTS.VIEW_EMPLOYEES),
  async (req, res) => {
    try {
      res.json({ message: "Employee reports coming soon" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Client reports
router.get(
  "/clients",
  authenticateToken,
  requirePermission(PERMISSIONS.CUSTOMERS.VIEW_DETAILED),
  async (req, res) => {
    try {
      res.json({ message: "Client reports coming soon" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
