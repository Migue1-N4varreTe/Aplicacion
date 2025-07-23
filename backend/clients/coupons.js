const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken, requireRole } = require("../auth/middleware");

const router = express.Router();

// Crear cupón
router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const {
        code,
        name,
        description,
        discount_type, // 'percentage' o 'fixed_amount'
        discount_value,
        min_purchase_amount,
        max_discount_amount,
        usage_limit,
        expiry_date,
        is_active = true,
        allow_multiple_use = false,
        client_id = null, // Si es específico para un cliente
      } = req.body;

      if (!code || !name || !discount_type || !discount_value || !expiry_date) {
        return res.status(400).json({
          error:
            "Código, nombre, tipo de descuento, valor y fecha de expiración son requeridos",
        });
      }

      // Verificar que el código es único
      const { data: existingCoupon } = await supabase
        .from("coupons")
        .select("id")
        .eq("code", code)
        .single();

      if (existingCoupon) {
        return res
          .status(400)
          .json({ error: "Ya existe un cupón con ese código" });
      }

      // Validar tipo de descuento
      if (!["percentage", "fixed_amount"].includes(discount_type)) {
        return res
          .status(400)
          .json({
            error: "Tipo de descuento debe ser percentage o fixed_amount",
          });
      }

      // Validar valor del descuento
      if (
        discount_type === "percentage" &&
        (discount_value <= 0 || discount_value > 100)
      ) {
        return res
          .status(400)
          .json({ error: "Porcentaje de descuento debe estar entre 1 y 100" });
      }

      if (discount_type === "fixed_amount" && discount_value <= 0) {
        return res
          .status(400)
          .json({ error: "Monto fijo de descuento debe ser mayor a 0" });
      }

      const { data: coupon, error } = await supabase
        .from("coupons")
        .insert({
          code: code.toUpperCase(),
          name,
          description,
          discount_type,
          discount_value: parseFloat(discount_value),
          min_purchase_amount: min_purchase_amount
            ? parseFloat(min_purchase_amount)
            : null,
          max_discount_amount: max_discount_amount
            ? parseFloat(max_discount_amount)
            : null,
          usage_limit: usage_limit ? parseInt(usage_limit) : null,
          usage_count: 0,
          expiry_date,
          is_active,
          allow_multiple_use,
          client_id,
          created_by: req.user.id,
        })
        .select("*")
        .single();

      if (error) {
        console.error("Error creating coupon:", error);
        return res.status(500).json({ error: "Error al crear cupón" });
      }

      res.status(201).json({
        message: "Cupón creado exitosamente",
        coupon,
      });
    } catch (error) {
      console.error("Error in create coupon:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Listar cupones
router.get(
  "/",
  authenticateToken,
  requireRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        active_only = "false",
        expired = "false",
        client_id,
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = supabase.from("coupons").select(
        `
        *,
        clients(name),
        users(name as created_by_name)
      `,
        { count: "exact" },
      );

      // Filtros
      if (active_only === "true") {
        query = query.eq("is_active", true);
      }

      if (expired === "true") {
        query = query.lt("expiry_date", new Date().toISOString());
      } else if (expired === "false") {
        query = query.gte("expiry_date", new Date().toISOString());
      }

      if (client_id) {
        query = query.eq("client_id", client_id);
      }

      // Ordenamiento y paginación
      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      const { data: coupons, error, count } = await query;

      if (error) {
        console.error("Error fetching coupons:", error);
        return res.status(500).json({ error: "Error al obtener cupones" });
      }

      res.json({
        coupons,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / parseInt(limit)),
          total_items: count,
          items_per_page: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Error in list coupons:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Validar cupón
router.get("/validate/:code", authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;
    const { client_id, purchase_amount } = req.query;

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return res.status(404).json({
        error: "Cupón no válido o no existe",
        is_valid: false,
      });
    }

    const validationResult = {
      is_valid: true,
      coupon: coupon,
      issues: [],
    };

    // Verificar fecha de expiración
    if (new Date(coupon.expiry_date) < new Date()) {
      validationResult.is_valid = false;
      validationResult.issues.push("Cupón expirado");
    }

    // Verificar cliente específico
    if (coupon.client_id && coupon.client_id !== client_id) {
      validationResult.is_valid = false;
      validationResult.issues.push("Cupón no válido para este cliente");
    }

    // Verificar monto mínimo de compra
    if (
      coupon.min_purchase_amount &&
      purchase_amount &&
      parseFloat(purchase_amount) < coupon.min_purchase_amount
    ) {
      validationResult.is_valid = false;
      validationResult.issues.push(
        `Compra mínima requerida: $${coupon.min_purchase_amount}`,
      );
    }

    // Verificar límite de uso
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      validationResult.is_valid = false;
      validationResult.issues.push("Límite de uso del cupón alcanzado");
    }

    // Verificar uso múltiple si aplica
    if (!coupon.allow_multiple_use && client_id) {
      const { data: usedCoupon } = await supabase
        .from("coupon_usage")
        .select("id")
        .eq("coupon_id", coupon.id)
        .eq("user_id", client_id)
        .single();

      if (usedCoupon) {
        validationResult.is_valid = false;
        validationResult.issues.push("Cupón ya utilizado por este cliente");
      }
    }

    // Calcular descuento si es válido
    if (validationResult.is_valid && purchase_amount) {
      const amount = parseFloat(purchase_amount);
      let discountAmount = 0;

      if (coupon.discount_type === "percentage") {
        discountAmount = amount * (coupon.discount_value / 100);
      } else {
        discountAmount = coupon.discount_value;
      }

      // Aplicar límite máximo si existe
      if (
        coupon.max_discount_amount &&
        discountAmount > coupon.max_discount_amount
      ) {
        discountAmount = coupon.max_discount_amount;
      }

      validationResult.discount_amount = discountAmount;
      validationResult.final_amount = Math.max(0, amount - discountAmount);
    }

    res.json(validationResult);
  } catch (error) {
    console.error("Error validating coupon:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Usar cupón (registrar uso)
router.post("/use", authenticateToken, async (req, res) => {
  try {
    const { coupon_code, client_id, sale_id, discount_amount } = req.body;

    if (!coupon_code || !sale_id || !discount_amount) {
      return res.status(400).json({
        error:
          "Código de cupón, ID de venta y monto de descuento son requeridos",
      });
    }

    // Obtener cupón
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", coupon_code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (couponError || !coupon) {
      return res.status(404).json({ error: "Cupón no válido" });
    }

    // Registrar uso del cupón
    const { data: usage, error: usageError } = await supabase
      .from("coupon_usage")
      .insert({
        coupon_id: coupon.id,
        user_id: client_id,
        sale_id,
        discount_amount: parseFloat(discount_amount),
        used_by: req.user.id,
      })
      .select("*")
      .single();

    if (usageError) {
      console.error("Error registering coupon usage:", usageError);
      return res
        .status(500)
        .json({ error: "Error al registrar uso del cupón" });
    }

    // Actualizar contador de uso del cupón
    const { error: updateError } = await supabase
      .from("coupons")
      .update({
        usage_count: (coupon.usage_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", coupon.id);

    if (updateError) {
      console.error("Error updating coupon usage count:", updateError);
    }

    res.status(201).json({
      message: "Cupón utilizado exitosamente",
      usage,
      coupon: {
        code: coupon.code,
        name: coupon.name,
        discount_amount: parseFloat(discount_amount),
      },
    });
  } catch (error) {
    console.error("Error in use coupon:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener cupón por ID
router.get(
  "/:id",
  authenticateToken,
  requireRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data: coupon, error } = await supabase
        .from("coupons")
        .select(
          `
        *,
        clients(name),
        users(name as created_by_name),
        coupon_usage(
          id,
          discount_amount,
          created_at,
          sales(sale_number)
        )
      `,
        )
        .eq("id", id)
        .single();

      if (error || !coupon) {
        return res.status(404).json({ error: "Cupón no encontrado" });
      }

      // Calcular estadísticas
      const stats = {
        total_uses: coupon.coupon_usage?.length || 0,
        total_discount_given:
          coupon.coupon_usage?.reduce(
            (sum, usage) => sum + usage.discount_amount,
            0,
          ) || 0,
        is_expired: new Date(coupon.expiry_date) < new Date(),
        usage_percentage: coupon.usage_limit
          ? ((coupon.usage_count || 0) / coupon.usage_limit) * 100
          : null,
      };

      res.json({
        coupon: {
          ...coupon,
          statistics: stats,
        },
      });
    } catch (error) {
      console.error("Error in get coupon:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Actualizar cupón
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
        discount_value,
        min_purchase_amount,
        max_discount_amount,
        usage_limit,
        expiry_date,
        is_active,
        allow_multiple_use,
      } = req.body;

      // Verificar que el cupón existe
      const { data: existingCoupon, error: fetchError } = await supabase
        .from("coupons")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !existingCoupon) {
        return res.status(404).json({ error: "Cupón no encontrado" });
      }

      // Preparar datos para actualizar
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (discount_value !== undefined)
        updateData.discount_value = parseFloat(discount_value);
      if (min_purchase_amount !== undefined)
        updateData.min_purchase_amount = min_purchase_amount
          ? parseFloat(min_purchase_amount)
          : null;
      if (max_discount_amount !== undefined)
        updateData.max_discount_amount = max_discount_amount
          ? parseFloat(max_discount_amount)
          : null;
      if (usage_limit !== undefined)
        updateData.usage_limit = usage_limit ? parseInt(usage_limit) : null;
      if (expiry_date !== undefined) updateData.expiry_date = expiry_date;
      if (is_active !== undefined) updateData.is_active = is_active;
      if (allow_multiple_use !== undefined)
        updateData.allow_multiple_use = allow_multiple_use;
      updateData.updated_at = new Date().toISOString();

      const { data: coupon, error } = await supabase
        .from("coupons")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        console.error("Error updating coupon:", error);
        return res.status(500).json({ error: "Error al actualizar cupón" });
      }

      res.json({
        message: "Cupón actualizado exitosamente",
        coupon,
      });
    } catch (error) {
      console.error("Error in update coupon:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Eliminar cupón (soft delete)
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data: coupon, error } = await supabase
        .from("coupons")
        .update({
          is_active: false,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error || !coupon) {
        return res.status(404).json({ error: "Cupón no encontrado" });
      }

      res.json({
        message: "Cupón eliminado exitosamente",
        coupon,
      });
    } catch (error) {
      console.error("Error in delete coupon:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Generar código de cupón automático
router.post(
  "/generate-code",
  authenticateToken,
  requireRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { prefix = "DESC", length = 8 } = req.body;

      let attempts = 0;
      const maxAttempts = 10;
      let generatedCode;

      while (attempts < maxAttempts) {
        const randomString = Math.random()
          .toString(36)
          .substring(2, 2 + length)
          .toUpperCase();
        generatedCode = `${prefix}${randomString}`;

        const { data: existing } = await supabase
          .from("coupons")
          .select("id")
          .eq("code", generatedCode)
          .single();

        if (!existing) {
          break;
        }

        attempts++;
      }

      if (attempts >= maxAttempts) {
        return res
          .status(500)
          .json({ error: "No se pudo generar un código único" });
      }

      res.json({
        generated_code: generatedCode,
      });
    } catch (error) {
      console.error("Error generating coupon code:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

module.exports = router;
