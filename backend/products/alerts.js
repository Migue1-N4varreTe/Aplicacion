const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken, requireRole } = require("../auth/middleware");

const router = express.Router();

// Obtener productos con stock bajo
router.get("/low-stock", authenticateToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        sku,
        stock_quantity,
        min_stock,
        unit,
        categories(name)
      `,
      )
      .eq("is_active", true)
      .filter("stock_quantity", "lt", "min_stock")
      .order("stock_quantity", { ascending: true })
      .limit(parseInt(limit));

    if (error) {
      console.error("Error fetching low stock products:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener productos con stock bajo" });
    }

    res.json({
      low_stock_products: products,
      count: products?.length || 0,
    });
  } catch (error) {
    console.error("Error in low stock alert:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener productos sin stock
router.get("/out-of-stock", authenticateToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        sku,
        stock_quantity,
        min_stock,
        unit,
        categories(name)
      `,
      )
      .eq("is_active", true)
      .eq("stock_quantity", 0)
      .order("updated_at", { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error("Error fetching out of stock products:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener productos sin stock" });
    }

    res.json({
      out_of_stock_products: products,
      count: products?.length || 0,
    });
  } catch (error) {
    console.error("Error in out of stock alert:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener productos próximos a vencer
router.get("/expiring-soon", authenticateToken, async (req, res) => {
  try {
    const { days = 7, limit = 50 } = req.query;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days));

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        sku,
        stock_quantity,
        expiry_date,
        unit,
        categories(name)
      `,
      )
      .eq("is_active", true)
      .not("expiry_date", "is", null)
      .lte("expiry_date", expiryDate.toISOString())
      .gte("expiry_date", new Date().toISOString())
      .order("expiry_date", { ascending: true })
      .limit(parseInt(limit));

    if (error) {
      console.error("Error fetching expiring products:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener productos próximos a vencer" });
    }

    res.json({
      expiring_products: products,
      days_limit: parseInt(days),
      count: products?.length || 0,
    });
  } catch (error) {
    console.error("Error in expiring products alert:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener productos vencidos
router.get("/expired", authenticateToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        sku,
        stock_quantity,
        expiry_date,
        unit,
        categories(name)
      `,
      )
      .eq("is_active", true)
      .not("expiry_date", "is", null)
      .lt("expiry_date", new Date().toISOString())
      .order("expiry_date", { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error("Error fetching expired products:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener productos vencidos" });
    }

    res.json({
      expired_products: products,
      count: products?.length || 0,
    });
  } catch (error) {
    console.error("Error in expired products alert:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener todas las alertas de stock
router.get("/stock-alerts", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, resolved = "false", alert_type } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase.from("stock_alerts").select(
      `
        *,
        products(id, name, sku, stock_quantity, min_stock)
      `,
      { count: "exact" },
    );

    if (resolved === "false") {
      query = query.eq("is_resolved", false);
    } else if (resolved === "true") {
      query = query.eq("is_resolved", true);
    }

    if (alert_type) {
      query = query.eq("alert_type", alert_type);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data: alerts, error, count } = await query;

    if (error) {
      console.error("Error fetching stock alerts:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener alertas de stock" });
    }

    res.json({
      alerts,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / parseInt(limit)),
        total_items: count,
        items_per_page: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error in stock alerts:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Marcar alerta como resuelta
router.patch(
  "/stock-alerts/:id/resolve",
  authenticateToken,
  requireRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { resolution_note } = req.body;

      const { data: alert, error } = await supabase
        .from("stock_alerts")
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: req.user.id,
          resolution_note,
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error || !alert) {
        return res.status(404).json({ error: "Alerta no encontrada" });
      }

      res.json({
        message: "Alerta marcada como resuelta",
        alert,
      });
    } catch (error) {
      console.error("Error resolving alert:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Crear alerta manual
router.post(
  "/stock-alerts",
  authenticateToken,
  requireRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { product_id, alert_type, message } = req.body;

      if (!product_id || !alert_type || !message) {
        return res.status(400).json({
          error: "ID del producto, tipo de alerta y mensaje son requeridos",
        });
      }

      // Verificar que el producto existe
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, name")
        .eq("id", product_id)
        .single();

      if (productError || !product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      const { data: alert, error } = await supabase
        .from("stock_alerts")
        .insert({
          product_id,
          alert_type,
          message,
          is_resolved: false,
          created_by: req.user.id,
        })
        .select(
          `
        *,
        products(id, name, sku)
      `,
        )
        .single();

      if (error) {
        console.error("Error creating alert:", error);
        return res.status(500).json({ error: "Error al crear alerta" });
      }

      res.status(201).json({
        message: "Alerta creada exitosamente",
        alert,
      });
    } catch (error) {
      console.error("Error in create alert:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Dashboard de alertas
router.get("/dashboard/summary", authenticateToken, async (req, res) => {
  try {
    // Productos con stock bajo
    const { data: lowStockProducts } = await supabase
      .from("products")
      .select("id")
      .eq("is_active", true)
      .filter("stock_quantity", "lt", "min_stock");

    // Productos sin stock
    const { data: outOfStockProducts } = await supabase
      .from("products")
      .select("id")
      .eq("is_active", true)
      .eq("stock_quantity", 0);

    // Productos próximos a vencer (7 días)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const { data: expiringProducts } = await supabase
      .from("products")
      .select("id")
      .eq("is_active", true)
      .not("expiry_date", "is", null)
      .lte("expiry_date", expiryDate.toISOString())
      .gte("expiry_date", new Date().toISOString());

    // Productos vencidos
    const { data: expiredProducts } = await supabase
      .from("products")
      .select("id")
      .eq("is_active", true)
      .not("expiry_date", "is", null)
      .lt("expiry_date", new Date().toISOString());

    // Alertas sin resolver
    const { data: unresolvedAlerts } = await supabase
      .from("stock_alerts")
      .select("id")
      .eq("is_resolved", false);

    res.json({
      summary: {
        low_stock_count: lowStockProducts?.length || 0,
        out_of_stock_count: outOfStockProducts?.length || 0,
        expiring_soon_count: expiringProducts?.length || 0,
        expired_count: expiredProducts?.length || 0,
        unresolved_alerts_count: unresolvedAlerts?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error in alerts dashboard:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
