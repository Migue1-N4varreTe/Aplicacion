const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken } = require("../auth/middleware");

const router = express.Router();

// Procesar checkout
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      client_id,
      payment_method,
      payment_amount,
      discount_amount = 0,
      coupon_code,
      notes,
    } = req.body;

    if (!payment_method || !payment_amount) {
      return res.status(400).json({
        error: "Método de pago y monto son requeridos",
      });
    }

    // Obtener items del carrito
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        products(
          id,
          name,
          sku,
          stock_quantity,
          price
        )
      `,
      )
      .eq("user_id", req.user.id)
      .eq("is_active", true);

    if (cartError || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Carrito vacío" });
    }

    // Verificar stock disponible para todos los items
    for (const item of cartItems) {
      if (item.products.stock_quantity < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para ${item.products.name}`,
          available: item.products.stock_quantity,
          required: item.quantity,
        });
      }
    }

    // Calcular totales
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const tax_amount = 0; // Se puede agregar cálculo de impuestos
    const total_amount = subtotal - discount_amount + tax_amount;

    // Verificar que el monto pagado es suficiente
    if (payment_amount < total_amount) {
      return res.status(400).json({
        error: "Monto insuficiente",
        required: total_amount,
        provided: payment_amount,
      });
    }

    const change_amount = payment_amount - total_amount;

    // Iniciar transacción
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        cashier_id: req.user.id,
        client_id: client_id || null,
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        payment_method,
        payment_amount,
        change_amount,
        coupon_code,
        notes,
        status: "completed",
      })
      .select("*")
      .single();

    if (saleError) {
      console.error("Error creating sale:", saleError);
      return res.status(500).json({ error: "Error al procesar venta" });
    }

    // Crear items de venta y actualizar stock
    const saleItems = [];

    for (const cartItem of cartItems) {
      // Crear item de venta
      const { data: saleItem, error: itemError } = await supabase
        .from("sale_items")
        .insert({
          sale_id: sale.id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          unit_price: cartItem.unit_price,
          subtotal: cartItem.subtotal,
        })
        .select(
          `
          *,
          products(name, sku)
        `,
        )
        .single();

      if (itemError) {
        console.error("Error creating sale item:", itemError);
        // En un caso real, aquí se haría rollback
        return res.status(500).json({ error: "Error al crear items de venta" });
      }

      saleItems.push(saleItem);

      // Actualizar stock del producto
      const newStock = cartItem.products.stock_quantity - cartItem.quantity;

      const { error: stockError } = await supabase
        .from("products")
        .update({
          stock_quantity: newStock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cartItem.product_id);

      if (stockError) {
        console.error("Error updating stock:", stockError);
        // En un caso real, aquí se haría rollback
        return res.status(500).json({ error: "Error al actualizar stock" });
      }

      // Registrar movimiento de stock
      await supabase.from("stock_movements").insert({
        product_id: cartItem.product_id,
        movement_type: "sale",
        quantity: -cartItem.quantity,
        previous_stock: cartItem.products.stock_quantity,
        new_stock: newStock,
        reason: `Venta #${sale.id}`,
        reference_id: sale.id,
        created_by: req.user.id,
      });

      // Verificar alerta de stock bajo
      const { data: product } = await supabase
        .from("products")
        .select("min_stock, name")
        .eq("id", cartItem.product_id)
        .single();

      if (product && newStock < product.min_stock) {
        // Crear alerta de stock bajo si no existe una sin resolver
        const { data: existingAlert } = await supabase
          .from("stock_alerts")
          .select("id")
          .eq("product_id", cartItem.product_id)
          .eq("alert_type", "low_stock")
          .eq("is_resolved", false)
          .single();

        if (!existingAlert) {
          await supabase.from("stock_alerts").insert({
            product_id: cartItem.product_id,
            alert_type: "low_stock",
            message: `Stock bajo después de venta: ${product.name} (${newStock} unidades)`,
            is_resolved: false,
          });
        }
      }
    }

    // Procesar cupón si se usó
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", coupon_code)
        .single();

      if (coupon) {
        // Registrar uso del cupón
        await supabase.from("coupon_usage").insert({
          coupon_id: coupon.id,
          user_id: req.user.id,
          sale_id: sale.id,
          discount_amount,
        });

        // Actualizar contador de usos
        await supabase
          .from("coupons")
          .update({
            usage_count: (coupon.usage_count || 0) + 1,
          })
          .eq("id", coupon.id);
      }
    }

    // Agregar puntos al cliente si existe
    if (client_id) {
      const pointsEarned = Math.floor(total_amount / 10); // 1 punto por cada $10

      await supabase.from("client_rewards").insert({
        client_id,
        sale_id: sale.id,
        points_earned: pointsEarned,
        reward_type: "purchase",
        description: `Compra #${sale.id}`,
      });

      // Actualizar total de puntos del cliente
      const { data: client } = await supabase
        .from("clients")
        .select("total_points")
        .eq("id", client_id)
        .single();

      if (client) {
        await supabase
          .from("clients")
          .update({
            total_points: (client.total_points || 0) + pointsEarned,
            last_purchase: new Date().toISOString(),
          })
          .eq("id", client_id);
      }
    }

    // Limpiar carrito
    await supabase
      .from("cart_items")
      .update({ is_active: false })
      .eq("user_id", req.user.id)
      .eq("is_active", true);

    res.status(201).json({
      message: "Venta procesada exitosamente",
      sale: {
        ...sale,
        items: saleItems,
      },
      receipt: {
        sale_id: sale.id,
        sale_number: sale.sale_number,
        date: sale.created_at,
        cashier: req.user.name,
        items: saleItems,
        totals: {
          subtotal,
          discount_amount,
          tax_amount,
          total_amount,
          payment_amount,
          change_amount,
        },
      },
    });
  } catch (error) {
    console.error("Error in checkout:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener venta por ID (para reimpresión de ticket)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: sale, error } = await supabase
      .from("sales")
      .select(
        `
        *,
        sale_items(
          *,
          products(name, sku)
        ),
        clients(name, phone, email),
        users(name as cashier_name)
      `,
      )
      .eq("id", id)
      .single();

    if (error || !sale) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    res.json({
      sale,
      receipt: {
        sale_id: sale.id,
        sale_number: sale.sale_number,
        date: sale.created_at,
        cashier: sale.users?.cashier_name,
        client: sale.clients,
        items: sale.sale_items,
        totals: {
          subtotal: sale.subtotal,
          discount_amount: sale.discount_amount,
          tax_amount: sale.tax_amount,
          total_amount: sale.total_amount,
          payment_amount: sale.payment_amount,
          change_amount: sale.change_amount,
        },
      },
    });
  } catch (error) {
    console.error("Error in get sale:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Validar carrito antes del checkout
router.post("/validate", authenticateToken, async (req, res) => {
  try {
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        products(
          id,
          name,
          stock_quantity,
          price,
          is_active
        )
      `,
      )
      .eq("user_id", req.user.id)
      .eq("is_active", true);

    if (error) {
      console.error("Error validating cart:", error);
      return res.status(500).json({ error: "Error al validar carrito" });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Carrito vacío" });
    }

    const issues = [];
    let subtotal = 0;

    for (const item of cartItems) {
      // Verificar que el producto sigue activo
      if (!item.products.is_active) {
        issues.push({
          type: "product_inactive",
          product_name: item.products.name,
          message: "Producto ya no está disponible",
        });
        continue;
      }

      // Verificar stock
      if (item.products.stock_quantity < item.quantity) {
        issues.push({
          type: "insufficient_stock",
          product_name: item.products.name,
          available: item.products.stock_quantity,
          required: item.quantity,
          message: `Stock insuficiente para ${item.products.name}`,
        });
        continue;
      }

      // Verificar precio (en caso de cambios)
      if (item.unit_price !== item.products.price) {
        issues.push({
          type: "price_changed",
          product_name: item.products.name,
          old_price: item.unit_price,
          new_price: item.products.price,
          message: `El precio de ${item.products.name} ha cambiado`,
        });
      }

      subtotal += item.subtotal;
    }

    const isValid = issues.length === 0;

    res.json({
      is_valid: isValid,
      issues,
      cart_summary: {
        item_count: cartItems.length,
        subtotal,
      },
    });
  } catch (error) {
    console.error("Error in validate checkout:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
