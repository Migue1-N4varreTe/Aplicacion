const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken, requireRole } = require("../auth/middleware");

const router = express.Router();

// Procesar reembolso
router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const {
        sale_id,
        items, // Array de { product_id, quantity }
        refund_type = "partial", // 'full' o 'partial'
        reason,
        notes,
      } = req.body;

      if (!sale_id || !reason) {
        return res.status(400).json({
          error: "ID de venta y motivo del reembolso son requeridos",
        });
      }

      // Obtener venta original
      const { data: originalSale, error: saleError } = await supabase
        .from("sales")
        .select(
          `
        *,
        sale_items(
          *,
          products(name, stock_quantity)
        )
      `,
        )
        .eq("id", sale_id)
        .single();

      if (saleError || !originalSale) {
        return res.status(404).json({ error: "Venta no encontrada" });
      }

      if (originalSale.status === "refunded") {
        return res.status(400).json({ error: "Esta venta ya fue reembolsada" });
      }

      // Verificar que no haya reembolsos previos que interfieran
      const { data: existingRefunds } = await supabase
        .from("refunds")
        .select("*, refund_items(*)")
        .eq("original_sale_id", sale_id)
        .eq("status", "completed");

      let refundItems = [];
      let totalRefundAmount = 0;

      if (refund_type === "full") {
        // Reembolso completo
        refundItems = originalSale.sale_items
          .map((item) => {
            // Verificar cuánto ya se ha reembolsado de este item
            const previouslyRefunded =
              existingRefunds?.reduce((total, refund) => {
                const refundItem = refund.refund_items.find(
                  (ri) => ri.product_id === item.product_id,
                );
                return total + (refundItem?.quantity || 0);
              }, 0) || 0;

            const availableToRefund = item.quantity - previouslyRefunded;

            return {
              product_id: item.product_id,
              original_quantity: item.quantity,
              refund_quantity: availableToRefund,
              unit_price: item.unit_price,
              subtotal: availableToRefund * item.unit_price,
            };
          })
          .filter((item) => item.refund_quantity > 0);
      } else {
        // Reembolso parcial
        if (!items || items.length === 0) {
          return res.status(400).json({
            error: "Para reembolso parcial se requiere especificar los items",
          });
        }

        for (const refundItem of items) {
          const originalItem = originalSale.sale_items.find(
            (si) => si.product_id === refundItem.product_id,
          );

          if (!originalItem) {
            return res.status(400).json({
              error: `Producto ${refundItem.product_id} no encontrado en la venta original`,
            });
          }

          // Verificar cantidad disponible para reembolso
          const previouslyRefunded =
            existingRefunds?.reduce((total, refund) => {
              const refundItem = refund.refund_items.find(
                (ri) => ri.product_id === originalItem.product_id,
              );
              return total + (refundItem?.quantity || 0);
            }, 0) || 0;

          const availableToRefund = originalItem.quantity - previouslyRefunded;

          if (refundItem.quantity > availableToRefund) {
            return res.status(400).json({
              error: `Cantidad de reembolso excede disponible para ${originalItem.products.name}. Disponible: ${availableToRefund}`,
            });
          }

          refundItems.push({
            product_id: refundItem.product_id,
            original_quantity: originalItem.quantity,
            refund_quantity: refundItem.quantity,
            unit_price: originalItem.unit_price,
            subtotal: refundItem.quantity * originalItem.unit_price,
          });
        }
      }

      if (refundItems.length === 0) {
        return res
          .status(400)
          .json({ error: "No hay items disponibles para reembolso" });
      }

      totalRefundAmount = refundItems.reduce(
        (sum, item) => sum + item.subtotal,
        0,
      );

      // Crear registro de reembolso
      const { data: refund, error: refundError } = await supabase
        .from("refunds")
        .insert({
          original_sale_id: sale_id,
          refund_type,
          reason,
          notes,
          total_amount: totalRefundAmount,
          processed_by: req.user.id,
          status: "completed",
        })
        .select("*")
        .single();

      if (refundError) {
        console.error("Error creating refund:", refundError);
        return res.status(500).json({ error: "Error al procesar reembolso" });
      }

      // Crear items de reembolso y actualizar stock
      const processedItems = [];

      for (const item of refundItems) {
        // Crear item de reembolso
        const { data: refundItem, error: itemError } = await supabase
          .from("refund_items")
          .insert({
            refund_id: refund.id,
            product_id: item.product_id,
            quantity: item.refund_quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
          })
          .select(
            `
          *,
          products(name, sku)
        `,
          )
          .single();

        if (itemError) {
          console.error("Error creating refund item:", itemError);
          return res
            .status(500)
            .json({ error: "Error al crear items de reembolso" });
        }

        processedItems.push(refundItem);

        // Actualizar stock del producto (devolver al inventario)
        const originalItem = originalSale.sale_items.find(
          (si) => si.product_id === item.product_id,
        );
        const newStock =
          originalItem.products.stock_quantity + item.refund_quantity;

        const { error: stockError } = await supabase
          .from("products")
          .update({
            stock_quantity: newStock,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.product_id);

        if (stockError) {
          console.error("Error updating stock:", stockError);
          return res.status(500).json({ error: "Error al actualizar stock" });
        }

        // Registrar movimiento de stock
        await supabase.from("stock_movements").insert({
          product_id: item.product_id,
          movement_type: "refund",
          quantity: item.refund_quantity,
          previous_stock: originalItem.products.stock_quantity,
          new_stock: newStock,
          reason: `Reembolso #${refund.id} - ${reason}`,
          reference_id: refund.id,
          created_by: req.user.id,
        });
      }

      // Actualizar estado de la venta original si es reembolso completo
      if (refund_type === "full") {
        await supabase
          .from("sales")
          .update({
            status: "refunded",
            updated_at: new Date().toISOString(),
          })
          .eq("id", sale_id);
      } else {
        // Verificar si todos los items han sido reembolsados
        const allRefunds = [...(existingRefunds || []), refund];
        const totalItemsRefunded = {};

        allRefunds.forEach((refund) => {
          refund.refund_items?.forEach((item) => {
            totalItemsRefunded[item.product_id] =
              (totalItemsRefunded[item.product_id] || 0) + item.quantity;
          });
        });

        const allItemsRefunded = originalSale.sale_items.every(
          (item) => (totalItemsRefunded[item.product_id] || 0) >= item.quantity,
        );

        if (allItemsRefunded) {
          await supabase
            .from("sales")
            .update({
              status: "refunded",
              updated_at: new Date().toISOString(),
            })
            .eq("id", sale_id);
        }
      }

      res.status(201).json({
        message: "Reembolso procesado exitosamente",
        refund: {
          ...refund,
          items: processedItems,
        },
        original_sale: {
          id: originalSale.id,
          sale_number: originalSale.sale_number,
        },
      });
    } catch (error) {
      console.error("Error in refund process:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Obtener reembolsos de una venta
router.get("/sale/:sale_id", authenticateToken, async (req, res) => {
  try {
    const { sale_id } = req.params;

    const { data: refunds, error } = await supabase
      .from("refunds")
      .select(
        `
        *,
        refund_items(
          *,
          products(name, sku)
        ),
        users(name as processed_by_name)
      `,
      )
      .eq("original_sale_id", sale_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching refunds:", error);
      return res.status(500).json({ error: "Error al obtener reembolsos" });
    }

    res.json({ refunds });
  } catch (error) {
    console.error("Error in get refunds:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener reembolso por ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: refund, error } = await supabase
      .from("refunds")
      .select(
        `
        *,
        refund_items(
          *,
          products(name, sku, unit)
        ),
        users(name as processed_by_name),
        sales(sale_number, created_at)
      `,
      )
      .eq("id", id)
      .single();

    if (error || !refund) {
      return res.status(404).json({ error: "Reembolso no encontrado" });
    }

    res.json({ refund });
  } catch (error) {
    console.error("Error in get refund:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Listar todos los reembolsos con filtros
router.get(
  "/",
  authenticateToken,
  requireRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        refund_type,
        start_date,
        end_date,
        processed_by,
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = supabase.from("refunds").select(
        `
        *,
        refund_items(quantity, subtotal),
        users(name as processed_by_name),
        sales(sale_number, created_at as sale_date)
      `,
        { count: "exact" },
      );

      // Filtros
      if (status) {
        query = query.eq("status", status);
      }

      if (refund_type) {
        query = query.eq("refund_type", refund_type);
      }

      if (start_date) {
        query = query.gte("created_at", start_date);
      }

      if (end_date) {
        query = query.lte("created_at", end_date);
      }

      if (processed_by) {
        query = query.eq("processed_by", processed_by);
      }

      // Ordenamiento y paginación
      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      const { data: refunds, error, count } = await query;

      if (error) {
        console.error("Error fetching refunds:", error);
        return res.status(500).json({ error: "Error al obtener reembolsos" });
      }

      res.json({
        refunds,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / parseInt(limit)),
          total_items: count,
          items_per_page: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Error in list refunds:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Cancelar reembolso (solo si está pendiente)
router.patch(
  "/:id/cancel",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const { data: refund, error } = await supabase
        .from("refunds")
        .update({
          status: "cancelled",
          cancellation_reason: reason,
          cancelled_by: req.user.id,
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("status", "pending")
        .select("*")
        .single();

      if (error || !refund) {
        return res.status(404).json({
          error: "Reembolso no encontrado o no se puede cancelar",
        });
      }

      res.json({
        message: "Reembolso cancelado exitosamente",
        refund,
      });
    } catch (error) {
      console.error("Error cancelling refund:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

module.exports = router;
