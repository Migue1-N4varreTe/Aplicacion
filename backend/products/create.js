const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken, requireRole } = require("../auth/middleware");

const router = express.Router();

// Crear producto
router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        cost,
        sku,
        barcode,
        category_id,
        stock_quantity,
        min_stock,
        unit,
        brand,
        supplier,
        expiry_date,
        is_active = true,
      } = req.body;

      // Validaciones
      if (!name || !price || !category_id || stock_quantity === undefined) {
        return res.status(400).json({
          error: "Nombre, precio, categoría y cantidad de stock son requeridos",
        });
      }

      // Verificar que la categoría existe
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("id", category_id)
        .single();

      if (categoryError || !category) {
        return res.status(400).json({ error: "Categoría no válida" });
      }

      // Verificar SKU único si se proporciona
      if (sku) {
        const { data: existingSku } = await supabase
          .from("products")
          .select("id")
          .eq("sku", sku)
          .single();

        if (existingSku) {
          return res.status(400).json({ error: "SKU ya existe" });
        }
      }

      // Verificar código de barras único si se proporciona
      if (barcode) {
        const { data: existingBarcode } = await supabase
          .from("products")
          .select("id")
          .eq("barcode", barcode)
          .single();

        if (existingBarcode) {
          return res.status(400).json({ error: "Código de barras ya existe" });
        }
      }

      const { data: product, error } = await supabase
        .from("products")
        .insert({
          name,
          description,
          price: parseFloat(price),
          cost: cost ? parseFloat(cost) : null,
          sku,
          barcode,
          category_id,
          stock_quantity: parseInt(stock_quantity),
          min_stock: min_stock ? parseInt(min_stock) : 10,
          unit: unit || "unidad",
          brand,
          supplier,
          expiry_date,
          is_active,
          created_by: req.user.id,
        })
        .select(
          `
        *,
        categories(name, description)
      `,
        )
        .single();

      if (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ error: "Error al crear producto" });
      }

      // Verificar si el stock inicial está por debajo del mínimo
      if (product.stock_quantity < product.min_stock) {
        // Crear alerta de stock bajo
        await supabase.from("stock_alerts").insert({
          product_id: product.id,
          alert_type: "low_stock",
          message: `Stock bajo: ${product.name} (${product.stock_quantity} unidades)`,
          is_resolved: false,
        });
      }

      res.status(201).json({
        message: "Producto creado exitosamente",
        product,
      });
    } catch (error) {
      console.error("Error in create product:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

module.exports = router;
