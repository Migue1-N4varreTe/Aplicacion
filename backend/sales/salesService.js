import { supabase } from "../config/supabase.js";

const scanProduct = async (barcode) => {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories (
          id,
          name,
          aisle
        )
      `,
      )
      .eq("barcode", barcode)
      .eq("is_active", true)
      .single();

    if (error || !product) {
      throw new Error("Producto no encontrado");
    }

    if (product.stock <= 0) {
      throw new Error("Producto sin stock disponible");
    }

    return product;
  } catch (error) {
    throw error;
  }
};

const createSale = async (saleData, user) => {
  try {
    const {
      items,
      payment_method,
      total,
      discount = 0,
      tax = 0,
      customer_id = null,
    } = saleData;

    // Validate items and check stock
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.product_id)
        .eq("is_active", true)
        .single();

      if (error || !product) {
        throw new Error(`Producto ${item.product_id} no encontrado`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
        );
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: item.quantity,
        subtotal: itemTotal,
      });
    }

    // Apply discount
    const finalTotal = calculatedTotal - discount + tax;

    // Verify total matches
    if (Math.abs(finalTotal - total) > 0.01) {
      throw new Error("El total calculado no coincide con el total enviado");
    }

    // Create sale record
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert([
        {
          cashier_id: user.id,
          customer_id,
          store_id: user.store_id,
          subtotal: calculatedTotal,
          discount,
          tax,
          total: finalTotal,
          payment_method,
          status: "completed",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (saleError) {
      throw new Error("Error al crear venta: " + saleError.message);
    }

    // Create sale items
    const saleItems = validatedItems.map((item) => ({
      ...item,
      sale_id: sale.id,
    }));

    const { error: itemsError } = await supabase
      .from("sale_items")
      .insert(saleItems);

    if (itemsError) {
      throw new Error("Error al crear items de venta: " + itemsError.message);
    }

    // Update product stock
    for (const item of validatedItems) {
      const { error: stockError } = await supabase
        .from("products")
        .update({
          stock: supabase.raw(`stock - ${item.quantity}`),
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.product_id);

      if (stockError) {
        console.error(
          `Error updating stock for product ${item.product_id}:`,
          stockError,
        );
      }
    }

    // Log sale
    await supabase.from("audit_logs").insert([
      {
        user_id: user.id,
        action: "sale_completed",
        details: {
          sale_id: sale.id,
          total: finalTotal,
          items_count: items.length,
          payment_method,
        },
        created_at: new Date().toISOString(),
      },
    ]);

    return {
      ...sale,
      items: saleItems,
    };
  } catch (error) {
    throw error;
  }
};

const processPayment = async (paymentData, user) => {
  try {
    const { sale_id, payment_method, amount_received } = paymentData;

    // Get sale
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select("*")
      .eq("id", sale_id)
      .single();

    if (saleError || !sale) {
      throw new Error("Venta no encontrada");
    }

    if (sale.status !== "pending") {
      throw new Error("Esta venta ya fue procesada");
    }

    if (amount_received < sale.total) {
      throw new Error("Monto recibido insuficiente");
    }

    const change = amount_received - sale.total;

    // Update sale
    const { data: updatedSale, error: updateError } = await supabase
      .from("sales")
      .update({
        payment_method,
        amount_received,
        change_given: change,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", sale_id)
      .select()
      .single();

    if (updateError) {
      throw new Error("Error al procesar pago: " + updateError.message);
    }

    return {
      sale: updatedSale,
      change,
      message: "Pago procesado exitosamente",
    };
  } catch (error) {
    throw error;
  }
};

const generateReceipt = async (saleId) => {
  try {
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select(
        `
        *,
        sale_items (
          product_id,
          product_name,
          product_price,
          quantity,
          subtotal
        ),
        users!cashier_id (
          first_name,
          last_name
        ),
        customers (
          first_name,
          last_name,
          email
        ),
        stores (
          name,
          address,
          phone,
          tax_id
        )
      `,
      )
      .eq("id", saleId)
      .single();

    if (saleError || !sale) {
      throw new Error("Venta no encontrada");
    }

    // Format receipt data
    const receipt = {
      sale_id: sale.id,
      date: sale.created_at,
      store: sale.stores,
      cashier: sale.users
        ? `${sale.users.first_name} ${sale.users.last_name}`
        : "Sistema",
      customer: sale.customers
        ? `${sale.customers.first_name} ${sale.customers.last_name}`
        : "Cliente General",
      items: sale.sale_items,
      subtotal: sale.subtotal,
      discount: sale.discount,
      tax: sale.tax,
      total: sale.total,
      payment_method: sale.payment_method,
      amount_received: sale.amount_received,
      change_given: sale.change_given,
    };

    return receipt;
  } catch (error) {
    throw error;
  }
};

const processSaleRefund = async (refundData, user) => {
  try {
    const { sale_id, items, reason, refund_amount } = refundData;

    // Get original sale
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select("*")
      .eq("id", sale_id)
      .single();

    if (saleError || !sale) {
      throw new Error("Venta no encontrada");
    }

    // Create refund record
    const { data: refund, error: refundError } = await supabase
      .from("refunds")
      .insert([
        {
          original_sale_id: sale_id,
          processed_by: user.id,
          reason,
          refund_amount,
          status: "completed",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (refundError) {
      throw new Error("Error al crear devolución: " + refundError.message);
    }

    // Create refund items and restore stock
    for (const item of items) {
      await supabase.from("refund_items").insert([
        {
          refund_id: refund.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.quantity * item.unit_price,
        },
      ]);

      // Restore stock
      await supabase
        .from("products")
        .update({
          stock: supabase.raw(`stock + ${item.quantity}`),
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.product_id);
    }

    // Log refund
    await supabase.from("audit_logs").insert([
      {
        user_id: user.id,
        action: "refund_processed",
        details: {
          refund_id: refund.id,
          original_sale_id: sale_id,
          refund_amount,
          items_count: items.length,
          reason,
        },
        created_at: new Date().toISOString(),
      },
    ]);

    return refund;
  } catch (error) {
    throw error;
  }
};

const getSaleById = async (saleId) => {
  try {
    const { data: sale, error } = await supabase
      .from("sales")
      .select(
        `
        *,
        sale_items (
          product_id,
          product_name,
          product_price,
          quantity,
          subtotal
        ),
        users!cashier_id (
          first_name,
          last_name
        ),
        customers (
          first_name,
          last_name
        )
      `,
      )
      .eq("id", saleId)
      .single();

    if (error || !sale) {
      throw new Error("Venta no encontrada");
    }

    return sale;
  } catch (error) {
    throw error;
  }
};

const getSales = async (filters = {}) => {
  try {
    let query = supabase
      .from("sales")
      .select(
        `
        *,
        users!cashier_id (
          first_name,
          last_name
        ),
        customers (
          first_name,
          last_name
        )
      `,
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters.store_id) {
      query = query.eq("store_id", filters.store_id);
    }

    if (filters.cashier_id) {
      query = query.eq("cashier_id", filters.cashier_id);
    }

    if (filters.from_date) {
      query = query.gte("created_at", filters.from_date);
    }

    if (filters.to_date) {
      query = query.lte("created_at", filters.to_date);
    }

    // Pagination
    const offset = (filters.page - 1) * filters.limit;
    query = query.range(offset, offset + filters.limit - 1);

    const { data: sales, error, count } = await query;

    if (error) {
      throw new Error("Error al obtener ventas: " + error.message);
    }

    return {
      sales: sales || [],
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: count,
        pages: Math.ceil(count / filters.limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

const getSalesReport = async (filters = {}) => {
  try {
    let query = supabase.from("sales").select("*").eq("status", "completed");

    if (filters.store_id) {
      query = query.eq("store_id", filters.store_id);
    }

    if (filters.cashier_id) {
      query = query.eq("cashier_id", filters.cashier_id);
    }

    if (filters.from_date) {
      query = query.gte("created_at", filters.from_date);
    }

    if (filters.to_date) {
      query = query.lte("created_at", filters.to_date);
    }

    const { data: sales, error } = await query;

    if (error) {
      throw new Error("Error al generar reporte: " + error.message);
    }

    // Calculate metrics
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Group by payment method
    const paymentMethods = sales.reduce((acc, sale) => {
      acc[sale.payment_method] = (acc[sale.payment_method] || 0) + 1;
      return acc;
    }, {});

    // Group by hour
    const hourlyBreakdown = sales.reduce((acc, sale) => {
      const hour = new Date(sale.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + sale.total;
      return acc;
    }, {});

    return {
      period: {
        from: filters.from_date,
        to: filters.to_date,
      },
      metrics: {
        total_sales: totalSales,
        total_revenue: totalRevenue,
        average_ticket: averageTicket,
      },
      breakdown: {
        payment_methods: paymentMethods,
        hourly: hourlyBreakdown,
      },
    };
  } catch (error) {
    throw error;
  }
};

export {
  scanProduct,
  createSale,
  processPayment,
  generateReceipt,
  processSaleRefund,
  getSaleById,
  getSales,
  getSalesReport,
};
