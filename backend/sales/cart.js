const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken } = require("../auth/middleware");

const router = express.Router();

// Escanear producto (para POS)
router.post("/scan", authenticateToken, async (req, res) => {
  try {
    const { barcode, sku, product_id } = req.body;

    if (!barcode && !sku && !product_id) {
      return res.status(400).json({
        error: "Se requiere código de barras, SKU o ID del producto",
      });
    }

    let query = supabase
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        sku,
        barcode,
        stock_quantity,
        unit,
        categories(name)
      `,
      )
      .eq("is_active", true);

    if (barcode) {
      query = query.eq("barcode", barcode);
    } else if (sku) {
      query = query.eq("sku", sku);
    } else if (product_id) {
      query = query.eq("id", product_id);
    }

    const { data: product, error } = await query.single();

    if (error || !product) {
      return res.status(404).json({
        error: "Producto no encontrado",
        scanned_code: barcode || sku || product_id,
      });
    }

    // Verificar stock disponible
    if (product.stock_quantity <= 0) {
      return res.status(400).json({
        error: "Producto sin stock disponible",
        product: product,
      });
    }

    res.json({
      message: "Producto escaneado exitosamente",
      product: product,
    });
  } catch (error) {
    console.error("Error in scan product:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Agregar item al carrito temporal
router.post("/add-item", authenticateToken, async (req, res) => {
  try {
    const { product_id, quantity = 1, unit_price } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: "ID del producto es requerido" });
    }

    // Verificar producto
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", product_id)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Verificar stock
    if (product.stock_quantity < parseInt(quantity)) {
      return res.status(400).json({
        error: "Stock insuficiente",
        available_stock: product.stock_quantity,
        requested_quantity: parseInt(quantity),
      });
    }

    // Crear o actualizar item en carrito temporal
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("product_id", product_id)
      .eq("is_active", true)
      .single();

    let cartItem;

    if (existingItem) {
      // Actualizar cantidad existente
      const newQuantity = existingItem.quantity + parseInt(quantity);

      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({
          error: "Stock insuficiente para la cantidad total",
          available_stock: product.stock_quantity,
          current_cart_quantity: existingItem.quantity,
          requested_additional: parseInt(quantity),
        });
      }

      const { data: updatedItem, error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: newQuantity,
          unit_price: unit_price || product.price,
          subtotal: newQuantity * (unit_price || product.price),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id)
        .select(
          `
          *,
          products(name, sku, barcode, unit)
        `,
        )
        .single();

      if (updateError) {
        console.error("Error updating cart item:", updateError);
        return res
          .status(500)
          .json({ error: "Error al actualizar item del carrito" });
      }

      cartItem = updatedItem;
    } else {
      // Crear nuevo item
      const finalPrice = unit_price || product.price;
      const { data: newItem, error: insertError } = await supabase
        .from("cart_items")
        .insert({
          user_id: req.user.id,
          product_id: product_id,
          quantity: parseInt(quantity),
          unit_price: finalPrice,
          subtotal: parseInt(quantity) * finalPrice,
          is_active: true,
        })
        .select(
          `
          *,
          products(name, sku, barcode, unit)
        `,
        )
        .single();

      if (insertError) {
        console.error("Error creating cart item:", insertError);
        return res
          .status(500)
          .json({ error: "Error al agregar item al carrito" });
      }

      cartItem = newItem;
    }

    res.status(201).json({
      message: "Item agregado al carrito exitosamente",
      cart_item: cartItem,
    });
  } catch (error) {
    console.error("Error in add cart item:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener carrito actual
router.get("/current", authenticateToken, async (req, res) => {
  try {
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        products(
          id,
          name,
          description,
          sku,
          barcode,
          unit,
          stock_quantity,
          categories(name)
        )
      `,
      )
      .eq("user_id", req.user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching cart:", error);
      return res.status(500).json({ error: "Error al obtener carrito" });
    }

    // Calcular totales
    const subtotal =
      cartItems?.reduce((sum, item) => sum + (item.subtotal || 0), 0) || 0;
    const total_items =
      cartItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

    res.json({
      cart: {
        items: cartItems || [],
        summary: {
          total_items,
          subtotal,
          tax: 0, // Se puede calcular después
          total: subtotal, // Se puede agregar impuestos después
        },
      },
    });
  } catch (error) {
    console.error("Error in get cart:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Actualizar cantidad de item en carrito
router.patch("/items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Cantidad debe ser mayor a 0" });
    }

    // Verificar que el item pertenece al usuario
    const { data: cartItem, error: fetchError } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        products(stock_quantity, price)
      `,
      )
      .eq("id", id)
      .eq("user_id", req.user.id)
      .eq("is_active", true)
      .single();

    if (fetchError || !cartItem) {
      return res.status(404).json({ error: "Item del carrito no encontrado" });
    }

    // Verificar stock
    if (cartItem.products.stock_quantity < parseInt(quantity)) {
      return res.status(400).json({
        error: "Stock insuficiente",
        available_stock: cartItem.products.stock_quantity,
        requested_quantity: parseInt(quantity),
      });
    }

    const newSubtotal = parseInt(quantity) * cartItem.unit_price;

    const { data: updatedItem, error: updateError } = await supabase
      .from("cart_items")
      .update({
        quantity: parseInt(quantity),
        subtotal: newSubtotal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        products(name, sku, unit)
      `,
      )
      .single();

    if (updateError) {
      console.error("Error updating cart item:", updateError);
      return res.status(500).json({ error: "Error al actualizar item" });
    }

    res.json({
      message: "Item actualizado exitosamente",
      cart_item: updatedItem,
    });
  } catch (error) {
    console.error("Error in update cart item:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Eliminar item del carrito
router.delete("/items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: deletedItem, error } = await supabase
      .from("cart_items")
      .update({ is_active: false })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select("*")
      .single();

    if (error || !deletedItem) {
      return res.status(404).json({ error: "Item del carrito no encontrado" });
    }

    res.json({
      message: "Item eliminado del carrito",
      cart_item_id: id,
    });
  } catch (error) {
    console.error("Error in remove cart item:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Limpiar carrito completo
router.delete("/clear", authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from("cart_items")
      .update({ is_active: false })
      .eq("user_id", req.user.id)
      .eq("is_active", true);

    if (error) {
      console.error("Error clearing cart:", error);
      return res.status(500).json({ error: "Error al limpiar carrito" });
    }

    res.json({
      message: "Carrito limpiado exitosamente",
    });
  } catch (error) {
    console.error("Error in clear cart:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Aplicar descuento al carrito
router.post("/apply-discount", authenticateToken, async (req, res) => {
  try {
    const { discount_type, discount_value, coupon_code } = req.body;

    // Obtener carrito actual
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("is_active", true);

    if (cartError || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Carrito vacío" });
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    let discountAmount = 0;

    // Validar cupón si se proporciona
    if (coupon_code) {
      const { data: coupon, error: couponError } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", coupon_code)
        .eq("is_active", true)
        .gte("expiry_date", new Date().toISOString())
        .single();

      if (couponError || !coupon) {
        return res.status(400).json({ error: "Cupón no válido o expirado" });
      }

      // Verificar si ya fue usado por el usuario
      const { data: usedCoupon } = await supabase
        .from("coupon_usage")
        .select("id")
        .eq("coupon_id", coupon.id)
        .eq("user_id", req.user.id)
        .single();

      if (usedCoupon && !coupon.allow_multiple_use) {
        return res.status(400).json({ error: "Cupón ya utilizado" });
      }

      discountAmount =
        coupon.discount_type === "percentage"
          ? (subtotal * coupon.discount_value) / 100
          : coupon.discount_value;

      // Aplicar límite máximo si existe
      if (
        coupon.max_discount_amount &&
        discountAmount > coupon.max_discount_amount
      ) {
        discountAmount = coupon.max_discount_amount;
      }
    } else {
      // Descuento manual
      discountAmount =
        discount_type === "percentage"
          ? (subtotal * discount_value) / 100
          : discount_value;
    }

    const finalTotal = Math.max(0, subtotal - discountAmount);

    res.json({
      message: "Descuento aplicado exitosamente",
      discount: {
        type: discount_type || "manual",
        value: discount_value,
        amount: discountAmount,
        coupon_code,
      },
      totals: {
        subtotal,
        discount_amount: discountAmount,
        final_total: finalTotal,
      },
    });
  } catch (error) {
    console.error("Error applying discount:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
