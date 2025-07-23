import express from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken, requirePermission } from "../auth/middleware.js";
import { PERMISSIONS } from "../users/roles.js";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./productService.js";

const router = express.Router();

// Product routes
router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSIONS.INVENTORY.VIEW),
  async (req, res) => {
    try {
      const { category, search, page = 1, limit = 50 } = req.query;
      const products = await getAllProducts({
        category,
        search,
        page: parseInt(page),
        limit: parseInt(limit),
        storeId: req.user.store_id,
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.get(
  "/low-stock",
  authenticateToken,
  requirePermission(PERMISSIONS.INVENTORY.VIEW_LOW_STOCK),
  async (req, res) => {
    try {
      const products = await getLowStockProducts(req.user.store_id);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.get(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.INVENTORY.VIEW),
  async (req, res) => {
    try {
      const product = await getProductById(req.params.id);
      res.json(product);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
);

router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSIONS.INVENTORY.ADD_ITEM),
  [
    body("name").notEmpty().withMessage("Nombre del producto requerido"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Precio debe ser un número válido"),
    body("category_id").notEmpty().withMessage("Categoría requerida"),
    body("stock")
      .isInt({ min: 0 })
      .withMessage("Stock debe ser un número entero"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await createProduct(req.body, req.user);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.INVENTORY.UPDATE_ITEM),
  async (req, res) => {
    try {
      const product = await updateProduct(req.params.id, req.body, req.user);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.INVENTORY.DELETE_ITEM),
  async (req, res) => {
    try {
      await deleteProduct(req.params.id, req.user);
      res.json({ message: "Producto eliminado exitosamente" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// Category routes
router.get(
  "/categories/all",
  authenticateToken,
  requirePermission(PERMISSIONS.INVENTORY.VIEW),
  async (req, res) => {
    try {
      const categories = await getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/categories",
  authenticateToken,
  requirePermission(PERMISSIONS.INVENTORY.ADD_ITEM),
  [
    body("name").notEmpty().withMessage("Nombre de categoría requerido"),
    body("aisle").notEmpty().withMessage("Pasillo requerido"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const category = await createCategory(req.body, req.user);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.put(
  "/categories/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.INVENTORY.UPDATE_ITEM),
  async (req, res) => {
    try {
      const category = await updateCategory(req.params.id, req.body, req.user);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

router.delete(
  "/categories/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.INVENTORY.DELETE_ITEM),
  async (req, res) => {
    try {
      await deleteCategory(req.params.id, req.user);
      res.json({ message: "Categoría eliminada exitosamente" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

export default router;
