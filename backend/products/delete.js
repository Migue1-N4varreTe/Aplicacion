const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken, requireRole } = require("../auth/middleware");

const router = express.Router();

// Eliminar producto (soft delete)
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar que el producto existe
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      // Verificar si el producto tiene ventas asociadas
      const { data: sales, error: salesError } = await supabase
        .from("sale_items")
        .select("id")
        .eq("product_id", id)
        .limit(1);

      if (salesError) {
        console.error("Error checking sales:", salesError);
        return res.status(500).json({ error: "Error al verificar ventas" });
      }

      // Si tiene ventas, solo desactivar (soft delete)
      if (sales && sales.length > 0) {
        const { data: updatedProduct, error: updateError } = await supabase
          .from("products")
          .update({
            is_active: false,
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select("*")
          .single();

        if (updateError) {
          console.error("Error deactivating product:", updateError);
          return res
            .status(500)
            .json({ error: "Error al desactivar producto" });
        }

        return res.json({
          message: "Producto desactivado exitosamente (tiene ventas asociadas)",
          product: updatedProduct,
          soft_delete: true,
        });
      }

      // Si no tiene ventas, eliminar completamente
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Error deleting product:", deleteError);
        return res.status(500).json({ error: "Error al eliminar producto" });
      }

      res.json({
        message: "Producto eliminado exitosamente",
        product_id: id,
        soft_delete: false,
      });
    } catch (error) {
      console.error("Error in delete product:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Restaurar producto desactivado
router.patch(
  "/:id/restore",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data: product, error } = await supabase
        .from("products")
        .update({
          is_active: true,
          deleted_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("is_active", false)
        .select("*")
        .single();

      if (error || !product) {
        return res
          .status(404)
          .json({ error: "Producto no encontrado o ya está activo" });
      }

      res.json({
        message: "Producto restaurado exitosamente",
        product,
      });
    } catch (error) {
      console.error("Error in restore product:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Eliminar definitivamente productos desactivados
router.delete(
  "/:id/permanent",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar que el producto está desactivado
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_active", false)
        .single();

      if (fetchError || !product) {
        return res
          .status(404)
          .json({ error: "Producto no encontrado o está activo" });
      }

      // Eliminar alertas de stock relacionadas
      await supabase.from("stock_alerts").delete().eq("product_id", id);

      // Eliminar movimientos de stock
      await supabase.from("stock_movements").delete().eq("product_id", id);

      // Eliminar producto
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Error permanently deleting product:", deleteError);
        return res
          .status(500)
          .json({ error: "Error al eliminar producto permanentemente" });
      }

      res.json({
        message: "Producto eliminado permanentemente",
        product_id: id,
      });
    } catch (error) {
      console.error("Error in permanent delete:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

module.exports = router;
