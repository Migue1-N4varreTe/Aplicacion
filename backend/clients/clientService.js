import { supabase } from "../config/supabase.js";

const registerClient = async (clientData, user) => {
  try {
    const { first_name, last_name, email, phone, birth_date, address } =
      clientData;

    // Check if client already exists by email or phone
    if (email) {
      const { data: existingByEmail } = await supabase
        .from("customers")
        .select("id")
        .eq("email", email)
        .single();

      if (existingByEmail) {
        throw new Error("Ya existe un cliente con este email");
      }
    }

    if (phone) {
      const { data: existingByPhone } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", phone)
        .single();

      if (existingByPhone) {
        throw new Error("Ya existe un cliente con este teléfono");
      }
    }

    const { data: client, error } = await supabase
      .from("customers")
      .insert([
        {
          first_name,
          last_name,
          email,
          phone,
          birth_date,
          address,
          loyalty_points: 0,
          total_spent: 0,
          visit_count: 0,
          registered_by: user.id,
          store_id: user.store_id,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error("Error al registrar cliente: " + error.message);
    }

    // Log client registration
    await supabase.from("audit_logs").insert([
      {
        user_id: user.id,
        action: "client_registered",
        details: {
          client_id: client.id,
          client_name: `${first_name} ${last_name}`,
          email,
          phone,
        },
        created_at: new Date().toISOString(),
      },
    ]);

    return client;
  } catch (error) {
    throw error;
  }
};

const getAllClients = async (filters = {}) => {
  try {
    let query = supabase
      .from("customers")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (filters.search) {
      query = query.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`,
      );
    }

    if (filters.store_id) {
      query = query.eq("store_id", filters.store_id);
    }

    // Pagination
    const offset = (filters.page - 1) * filters.limit;
    query = query.range(offset, offset + filters.limit - 1);

    const { data: clients, error, count } = await query;

    if (error) {
      throw new Error("Error al obtener clientes: " + error.message);
    }

    return {
      clients: clients || [],
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

const getClientById = async (clientId) => {
  try {
    const { data: client, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", clientId)
      .eq("is_active", true)
      .single();

    if (error || !client) {
      throw new Error("Cliente no encontrado");
    }

    return client;
  } catch (error) {
    throw error;
  }
};

const updateClient = async (clientId, updateData, user) => {
  try {
    const allowedFields = [
      "first_name",
      "last_name",
      "email",
      "phone",
      "birth_date",
      "address",
    ];

    const filteredData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    filteredData.updated_at = new Date().toISOString();

    const { data: client, error } = await supabase
      .from("customers")
      .update(filteredData)
      .eq("id", clientId)
      .select()
      .single();

    if (error) {
      throw new Error("Error al actualizar cliente: " + error.message);
    }

    return client;
  } catch (error) {
    throw error;
  }
};

const getClientHistory = async (clientId, filters = {}) => {
  try {
    let query = supabase
      .from("sales")
      .select(
        `
        *,
        sale_items (
          product_name,
          quantity,
          product_price,
          subtotal
        ),
        users!cashier_id (
          first_name,
          last_name
        )
      `,
      )
      .eq("customer_id", clientId)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    // Pagination
    const offset = (filters.page - 1) * filters.limit;
    query = query.range(offset, offset + filters.limit - 1);

    const { data: purchases, error, count } = await query;

    if (error) {
      throw new Error("Error al obtener historial: " + error.message);
    }

    // Calculate summary statistics
    const totalSpent = purchases.reduce((sum, sale) => sum + sale.total, 0);
    const averageTicket =
      purchases.length > 0 ? totalSpent / purchases.length : 0;

    return {
      purchases: purchases || [],
      summary: {
        total_purchases: count,
        total_spent: totalSpent,
        average_ticket: averageTicket,
      },
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

const addLoyaltyPoints = async (clientId, points, reason, user) => {
  try {
    // Get current client
    const { data: client, error: clientError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", clientId)
      .single();

    if (clientError || !client) {
      throw new Error("Cliente no encontrado");
    }

    // Update loyalty points
    const newPoints = client.loyalty_points + points;

    const { data: updatedClient, error: updateError } = await supabase
      .from("customers")
      .update({
        loyalty_points: newPoints,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId)
      .select()
      .single();

    if (updateError) {
      throw new Error("Error al actualizar puntos: " + updateError.message);
    }

    // Log loyalty transaction
    await supabase.from("loyalty_transactions").insert([
      {
        customer_id: clientId,
        transaction_type: "earned",
        points,
        reason,
        processed_by: user.id,
        created_at: new Date().toISOString(),
      },
    ]);

    return {
      client: updatedClient,
      points_added: points,
      new_total: newPoints,
      message: `${points} puntos agregados exitosamente`,
    };
  } catch (error) {
    throw error;
  }
};

const redeemLoyaltyPoints = async (clientId, points, rewardType, user) => {
  try {
    // Get current client
    const { data: client, error: clientError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", clientId)
      .single();

    if (clientError || !client) {
      throw new Error("Cliente no encontrado");
    }

    if (client.loyalty_points < points) {
      throw new Error("Puntos insuficientes");
    }

    // Update loyalty points
    const newPoints = client.loyalty_points - points;

    const { data: updatedClient, error: updateError } = await supabase
      .from("customers")
      .update({
        loyalty_points: newPoints,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId)
      .select()
      .single();

    if (updateError) {
      throw new Error("Error al canjear puntos: " + updateError.message);
    }

    // Log redemption
    await supabase.from("loyalty_transactions").insert([
      {
        customer_id: clientId,
        transaction_type: "redeemed",
        points: -points,
        reason: `Canje por: ${rewardType}`,
        processed_by: user.id,
        created_at: new Date().toISOString(),
      },
    ]);

    return {
      client: updatedClient,
      points_redeemed: points,
      new_total: newPoints,
      reward_type: rewardType,
      message: "Puntos canjeados exitosamente",
    };
  } catch (error) {
    throw error;
  }
};

const generateCoupon = async (clientId, couponData, user) => {
  try {
    const {
      discount_type,
      discount_value,
      min_purchase_amount = 0,
      expires_at,
      description,
    } = couponData;

    // Generate unique coupon code
    const couponCode = `COUP${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const { data: coupon, error } = await supabase
      .from("coupons")
      .insert([
        {
          code: couponCode,
          customer_id: clientId,
          discount_type,
          discount_value,
          min_purchase_amount,
          description,
          expires_at,
          is_used: false,
          created_by: user.id,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error("Error al generar cupón: " + error.message);
    }

    return coupon;
  } catch (error) {
    throw error;
  }
};

const getClientCoupons = async (clientId) => {
  try {
    const { data: coupons, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("customer_id", clientId)
      .gte("expires_at", new Date().toISOString())
      .eq("is_used", false)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Error al obtener cupones: " + error.message);
    }

    return coupons || [];
  } catch (error) {
    throw error;
  }
};

const applyCoupon = async (couponCode, saleTotal, user) => {
  try {
    // Get coupon
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode)
      .eq("is_used", false)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (couponError || !coupon) {
      throw new Error("Cupón inválido o expirado");
    }

    // Check minimum purchase amount
    if (saleTotal < coupon.min_purchase_amount) {
      throw new Error(
        `Compra mínima requerida: $${coupon.min_purchase_amount}`,
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (saleTotal * coupon.discount_value) / 100;
    } else {
      discountAmount = coupon.discount_value;
    }

    // Ensure discount doesn't exceed total
    discountAmount = Math.min(discountAmount, saleTotal);

    // Mark coupon as used
    await supabase
      .from("coupons")
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        used_by: user.id,
      })
      .eq("id", coupon.id);

    return {
      coupon,
      discount_amount: discountAmount,
      new_total: saleTotal - discountAmount,
      message: "Cupón aplicado exitosamente",
    };
  } catch (error) {
    throw error;
  }
};

export {
  registerClient,
  getAllClients,
  getClientById,
  updateClient,
  getClientHistory,
  addLoyaltyPoints,
  redeemLoyaltyPoints,
  generateCoupon,
  getClientCoupons,
  applyCoupon,
};
