const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken, requireRole } = require("../auth/middleware");

const router = express.Router();

// Actualizar producto
router.put(
  "/:id",
  authenticateToken,
  requireRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { id } = req.params;
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
        is_active,
      } = req.body;

      // Verificar que el producto existe
      const { data: existingProduct, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !existingProduct) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      // Verificar SKU único si se está actualizando
      if (sku && sku !== existingProduct.sku) {
        const { data: existingSku } = await supabase
          .from("products")
          .select("id")
          .eq("sku", sku)
          .neq("id", id)
          .single();

        if (existingSku) {
          return res.status(400).json({ error: "SKU ya existe" });
        }
      }

      // Verificar código de barras único si se está actualizando
      if (barcode && barcode !== existingProduct.barcode) {
        const { data: existingBarcode } = await supabase
          .from("products")
          .select("id")
          .eq("barcode", barcode)
          .neq("id", id)
          .single();

        if (existingBarcode) {
          return res.status(400).json({ error: "Código de barras ya existe" });
        }
      }

      // Verificar categoría si se está actualizando
      if (category_id && category_id !== existingProduct.category_id) {
        const { data: category, error: categoryError } = await supabase
          .from("categories")
          .select("id")
          .eq("id", category_id)
          .single();

        if (categoryError || !category) {
          return res.status(400).json({ error: "Categoría no válida" });
        }
      }

      // Preparar datos para actualizar
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (cost !== undefined) updateData.cost = cost ? parseFloat(cost) : null;
      if (sku !== undefined) updateData.sku = sku;
      if (barcode !== undefined) updateData.barcode = barcode;
      if (category_id !== undefined) updateData.category_id = category_id;
      if (stock_quantity !== undefined)
        updateData.stock_quantity = parseInt(stock_quantity);
      if (min_stock !== undefined) updateData.min_stock = parseInt(min_stock);
      if (unit !== undefined) updateData.unit = unit;
      if (brand !== undefined) updateData.brand = brand;
      if (supplier !== undefined) updateData.supplier = supplier;
      if (expiry_date !== undefined) updateData.expiry_date = expiry_date;
      if (is_active !== undefined) updateData.is_active = is_active;

      updateData.updated_at = new Date().toISOString();

      const { data: product, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select(
          `
        *,
        categories(name, description)
      `,
        )
        .single();

      if (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ error: "Error al actualizar producto" });
      }

      // Verificar alerta de stock si se actualizó la cantidad
      if (stock_quantity !== undefined || min_stock !== undefined) {
        const currentStock =
          stock_quantity !== undefined
            ? stock_quantity
            : existingProduct.stock_quantity;
        const currentMinStock =
          min_stock !== undefined ? min_stock : existingProduct.min_stock;

        if (currentStock < currentMinStock) {
          // Crear o actualizar alerta de stock bajo
          const { data: existingAlert } = await supabase
            .from("stock_alerts")
            .select("id")
            .eq("product_id", id)
            .eq("alert_type", "low_stock")
            .eq("is_resolved", false)
            .single();

          if (!existingAlert) {
            await supabase.from("stock_alerts").insert({
              product_id: id,
              alert_type: "low_stock",
              message: `Stock bajo: ${product.name} (${currentStock} unidades)`,
              is_resolved: false,
            });
          }
        } else {
          // Resolver alertas de stock bajo si ahora hay suficiente stock
          await supabase
            .from("stock_alerts")
            .update({
              is_resolved: true,
              resolved_at: new Date().toISOString(),
            })
            .eq("product_id", id)
            .eq("alert_type", "low_stock")
            .eq("is_resolved", false);
        }
      }

      res.json({
        message: "Producto actualizado exitosamente",
        product,
      });
    } catch (error) {
      console.error("Error in update product:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Actualizar stock
router.patch(
  "/:id/stock",
  authenticateToken,
  requireRole(["admin", "manager", "employee"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity, operation, reason } = req.body; // operation: 'add', 'subtract', 'set'

      if (!quantity || !operation) {
        return res
          .status(400)
          .json({ error: "Cantidad y operación son requeridas" });
      }

      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      let newStock;
      switch (operation) {
        case "add":
          newStock = product.stock_quantity + parseInt(quantity);
          break;
        case "subtract":
          newStock = product.stock_quantity - parseInt(quantity);
          break;
        case "set":
          newStock = parseInt(quantity);
          break;
        default:
          return res
            .status(400)
            .json({ error: "Operación no válida. Use: add, subtract, set" });
      }

      if (newStock < 0) {
        return res
          .status(400)
          .json({ error: "El stock no puede ser negativo" });
      }

      const { data: updatedProduct, error: updateError } = await supabase
        .from("products")
        .update({
          stock_quantity: newStock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

      if (updateError) {
        console.error("Error updating stock:", updateError);
        return res.status(500).json({ error: "Error al actualizar stock" });
      }

      // Registrar movimiento de stock
      await supabase.from("stock_movements").insert({
        product_id: id,
        movement_type: operation,
        quantity: parseInt(quantity),
        previous_stock: product.stock_quantity,
        new_stock: newStock,
        reason: reason || `Stock ${operation}`,
        created_by: req.user.id,
      });

      // Verificar alerta de stock
      if (newStock < product.min_stock) {
        const { data: existingAlert } = await supabase
          .from("stock_alerts")
          .select("id")
          .eq("product_id", id)
          .eq("alert_type", "low_stock")
          .eq("is_resolved", false)
          .single();

        if (!existingAlert) {
          await supabase.from("stock_alerts").insert({
            product_id: id,
            alert_type: "low_stock",
            message: `Stock bajo: ${product.name} (${newStock} unidades)`,
            is_resolved: false,
          });
        }
      }

      res.json({
        message: "Stock actualizado exitosamente",
        product: updatedProduct,
        previous_stock: product.stock_quantity,
        new_stock: newStock,
      });
    } catch (error) {
      console.error("Error in update stock:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

module.exports = router;
