const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken, requireRole } = require("../auth/middleware");

const router = express.Router();

// Registrar nuevo cliente
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, address, birth_date, id_document, notes } =
      req.body;

    if (!name) {
      return res.status(400).json({ error: "Nombre del cliente es requerido" });
    }

    // Verificar email único si se proporciona
    if (email) {
      const { data: existingEmail } = await supabase
        .from("clients")
        .select("id")
        .eq("email", email)
        .single();

      if (existingEmail) {
        return res
          .status(400)
          .json({ error: "Ya existe un cliente con ese email" });
      }
    }

    // Verificar teléfono único si se proporciona
    if (phone) {
      const { data: existingPhone } = await supabase
        .from("clients")
        .select("id")
        .eq("phone", phone)
        .single();

      if (existingPhone) {
        return res
          .status(400)
          .json({ error: "Ya existe un cliente con ese teléfono" });
      }
    }

    // Generar código de cliente único
    const clientCode = await generateClientCode();

    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        client_code: clientCode,
        name,
        email,
        phone,
        address,
        birth_date,
        id_document,
        notes,
        total_points: 0,
        total_spent: 0,
        visit_count: 0,
        is_active: true,
        registered_by: req.user.id,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating client:", error);
      return res.status(500).json({ error: "Error al registrar cliente" });
    }

    res.status(201).json({
      message: "Cliente registrado exitosamente",
      client,
    });
  } catch (error) {
    console.error("Error in register client:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Actualizar cliente
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      address,
      birth_date,
      id_document,
      notes,
      is_active,
    } = req.body;

    // Verificar que el cliente existe
    const { data: existingClient, error: fetchError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingClient) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Verificar email único si se está actualizando
    if (email && email !== existingClient.email) {
      const { data: existingEmail } = await supabase
        .from("clients")
        .select("id")
        .eq("email", email)
        .neq("id", id)
        .single();

      if (existingEmail) {
        return res
          .status(400)
          .json({ error: "Ya existe un cliente con ese email" });
      }
    }

    // Verificar teléfono único si se está actualizando
    if (phone && phone !== existingClient.phone) {
      const { data: existingPhone } = await supabase
        .from("clients")
        .select("id")
        .eq("phone", phone)
        .neq("id", id)
        .single();

      if (existingPhone) {
        return res
          .status(400)
          .json({ error: "Ya existe un cliente con ese teléfono" });
      }
    }

    // Preparar datos para actualizar
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (birth_date !== undefined) updateData.birth_date = birth_date;
    if (id_document !== undefined) updateData.id_document = id_document;
    if (notes !== undefined) updateData.notes = notes;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = new Date().toISOString();

    const { data: client, error } = await supabase
      .from("clients")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating client:", error);
      return res.status(500).json({ error: "Error al actualizar cliente" });
    }

    res.json({
      message: "Cliente actualizado exitosamente",
      client,
    });
  } catch (error) {
    console.error("Error in update client:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener cliente por ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: client, error } = await supabase
      .from("clients")
      .select(
        `
        *,
        client_rewards(
          id,
          points_earned,
          points_redeemed,
          reward_type,
          description,
          created_at
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error || !client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Obtener estadísticas de compras
    const { data: purchaseStats } = await supabase
      .from("sales")
      .select("total_amount, created_at")
      .eq("client_id", id)
      .eq("status", "completed");

    const stats = {
      total_purchases: purchaseStats?.length || 0,
      total_spent:
        purchaseStats?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0,
      avg_purchase:
        purchaseStats?.length > 0
          ? purchaseStats.reduce((sum, sale) => sum + sale.total_amount, 0) /
            purchaseStats.length
          : 0,
      last_purchase:
        purchaseStats?.length > 0
          ? purchaseStats.sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at),
            )[0].created_at
          : null,
    };

    res.json({
      client: {
        ...client,
        purchase_stats: stats,
      },
    });
  } catch (error) {
    console.error("Error in get client:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Buscar clientes
router.get("/", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      active_only = "true",
      sort_by = "name",
      sort_order = "asc",
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase.from("clients").select("*", { count: "exact" });

    // Filtros
    if (active_only === "true") {
      query = query.eq("is_active", true);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,client_code.eq.${search}`,
      );
    }

    // Ordenamiento
    const validSortColumns = [
      "name",
      "email",
      "total_points",
      "total_spent",
      "created_at",
    ];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : "name";
    const sortDirection = sort_order === "desc" ? false : true;

    query = query.order(sortColumn, { ascending: sortDirection });

    // Paginación
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: clients, error, count } = await query;

    if (error) {
      console.error("Error fetching clients:", error);
      return res.status(500).json({ error: "Error al obtener clientes" });
    }

    res.json({
      clients,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / parseInt(limit)),
        total_items: count,
        items_per_page: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error in list clients:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Buscar cliente por código, teléfono o email (para POS)
router.get("/search/:query", authenticateToken, async (req, res) => {
  try {
    const { query } = req.params;

    const { data: clients, error } = await supabase
      .from("clients")
      .select("id, client_code, name, phone, email, total_points")
      .eq("is_active", true)
      .or(`client_code.eq.${query},phone.eq.${query},email.eq.${query}`)
      .limit(5);

    if (error) {
      console.error("Error searching clients:", error);
      return res.status(500).json({ error: "Error al buscar clientes" });
    }

    res.json({ clients });
  } catch (error) {
    console.error("Error in search clients:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Eliminar cliente (soft delete)
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar que el cliente existe
      const { data: client, error: fetchError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !client) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

      // Verificar si tiene compras
      const { data: sales } = await supabase
        .from("sales")
        .select("id")
        .eq("client_id", id)
        .limit(1);

      if (sales && sales.length > 0) {
        // Soft delete si tiene compras
        const { data: updatedClient, error: updateError } = await supabase
          .from("clients")
          .update({
            is_active: false,
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select("*")
          .single();

        if (updateError) {
          console.error("Error deactivating client:", updateError);
          return res.status(500).json({ error: "Error al desactivar cliente" });
        }

        return res.json({
          message: "Cliente desactivado exitosamente (tiene compras asociadas)",
          client: updatedClient,
          soft_delete: true,
        });
      }

      // Eliminar completamente si no tiene compras
      const { error: deleteError } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Error deleting client:", deleteError);
        return res.status(500).json({ error: "Error al eliminar cliente" });
      }

      res.json({
        message: "Cliente eliminado exitosamente",
        client_id: id,
        soft_delete: false,
      });
    } catch (error) {
      console.error("Error in delete client:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Función auxiliar para generar código de cliente único
async function generateClientCode() {
  const prefix = "CL";
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const randomNumber = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const code = `${prefix}${randomNumber}`;

    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("client_code", code)
      .single();

    if (!existing) {
      return code;
    }

    attempts++;
  }

  // Si no se pudo generar un código único, usar timestamp
  return `${prefix}${Date.now()}`;
}

module.exports = router;
