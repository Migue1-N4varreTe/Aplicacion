const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken, requireRole } = require("../auth/middleware");

const router = express.Router();

// Otorgar puntos manualmente
router.post(
  "/points",
  authenticateToken,
  requireRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { client_id, points, reason, description } = req.body;

      if (!client_id || !points || !reason) {
        return res.status(400).json({
          error: "ID del cliente, puntos y razón son requeridos",
        });
      }

      // Verificar que el cliente existe
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("total_points")
        .eq("id", client_id)
        .eq("is_active", true)
        .single();

      if (clientError || !client) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

      // Crear registro de recompensa
      const { data: reward, error: rewardError } = await supabase
        .from("client_rewards")
        .insert({
          client_id,
          points_earned: parseInt(points) > 0 ? parseInt(points) : 0,
          points_redeemed:
            parseInt(points) < 0 ? Math.abs(parseInt(points)) : 0,
          reward_type: reason,
          description:
            description ||
            `Puntos ${parseInt(points) > 0 ? "otorgados" : "deducidos"} manualmente`,
          created_by: req.user.id,
        })
        .select("*")
        .single();

      if (rewardError) {
        console.error("Error creating reward:", rewardError);
        return res.status(500).json({ error: "Error al registrar puntos" });
      }

      // Actualizar total de puntos del cliente
      const newTotalPoints = Math.max(
        0,
        client.total_points + parseInt(points),
      );

      const { data: updatedClient, error: updateError } = await supabase
        .from("clients")
        .update({
          total_points: newTotalPoints,
          updated_at: new Date().toISOString(),
        })
        .eq("id", client_id)
        .select("*")
        .single();

      if (updateError) {
        console.error("Error updating client points:", updateError);
        return res
          .status(500)
          .json({ error: "Error al actualizar puntos del cliente" });
      }

      res.status(201).json({
        message: "Puntos registrados exitosamente",
        reward,
        client: updatedClient,
        previous_points: client.total_points,
        new_points: newTotalPoints,
      });
    } catch (error) {
      console.error("Error in grant points:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Canjear puntos por recompensa
router.post("/redeem", authenticateToken, async (req, res) => {
  try {
    const { client_id, points_to_redeem, reward_type, description } = req.body;

    if (!client_id || !points_to_redeem || !reward_type) {
      return res.status(400).json({
        error:
          "ID del cliente, puntos a canjear y tipo de recompensa son requeridos",
      });
    }

    // Verificar que el cliente existe y tiene suficientes puntos
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("total_points, name")
      .eq("id", client_id)
      .eq("is_active", true)
      .single();

    if (clientError || !client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    if (client.total_points < parseInt(points_to_redeem)) {
      return res.status(400).json({
        error: "Puntos insuficientes",
        available_points: client.total_points,
        required_points: parseInt(points_to_redeem),
      });
    }

    // Crear registro de canje
    const { data: redemption, error: redemptionError } = await supabase
      .from("client_rewards")
      .insert({
        client_id,
        points_redeemed: parseInt(points_to_redeem),
        points_earned: 0,
        reward_type,
        description:
          description ||
          `Canje de ${points_to_redeem} puntos por ${reward_type}`,
        created_by: req.user.id,
      })
      .select("*")
      .single();

    if (redemptionError) {
      console.error("Error creating redemption:", redemptionError);
      return res.status(500).json({ error: "Error al registrar canje" });
    }

    // Actualizar puntos del cliente
    const newTotalPoints = client.total_points - parseInt(points_to_redeem);

    const { data: updatedClient, error: updateError } = await supabase
      .from("clients")
      .update({
        total_points: newTotalPoints,
        updated_at: new Date().toISOString(),
      })
      .eq("id", client_id)
      .select("*")
      .single();

    if (updateError) {
      console.error("Error updating client points:", updateError);
      return res
        .status(500)
        .json({ error: "Error al actualizar puntos del cliente" });
    }

    res.status(201).json({
      message: "Puntos canjeados exitosamente",
      redemption,
      client: updatedClient,
      previous_points: client.total_points,
      new_points: newTotalPoints,
    });
  } catch (error) {
    console.error("Error in redeem points:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener historial de recompensas de un cliente
router.get("/client/:client_id", authenticateToken, async (req, res) => {
  try {
    const { client_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const {
      data: rewards,
      error,
      count,
    } = await supabase
      .from("client_rewards")
      .select(
        `
        *,
        users(name as created_by_name),
        sales(sale_number)
      `,
        { count: "exact" },
      )
      .eq("client_id", client_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      console.error("Error fetching client rewards:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener historial de recompensas" });
    }

    res.json({
      rewards,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / parseInt(limit)),
        total_items: count,
        items_per_page: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error in get client rewards:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener estadísticas de recompensas de un cliente
router.get("/client/:client_id/stats", authenticateToken, async (req, res) => {
  try {
    const { client_id } = req.params;

    // Obtener datos del cliente
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("total_points, name, created_at")
      .eq("id", client_id)
      .single();

    if (clientError || !client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Obtener estadísticas de recompensas
    const { data: rewards } = await supabase
      .from("client_rewards")
      .select("points_earned, points_redeemed, reward_type, created_at")
      .eq("client_id", client_id);

    const stats = {
      current_points: client.total_points,
      total_earned:
        rewards?.reduce((sum, r) => sum + (r.points_earned || 0), 0) || 0,
      total_redeemed:
        rewards?.reduce((sum, r) => sum + (r.points_redeemed || 0), 0) || 0,
      total_transactions: rewards?.length || 0,
      member_since: client.created_at,
      redemption_rate: 0,
    };

    if (stats.total_earned > 0) {
      stats.redemption_rate = (stats.total_redeemed / stats.total_earned) * 100;
    }

    // Agrupar por tipo de recompensa
    const rewardTypes = {};
    rewards?.forEach((reward) => {
      if (!rewardTypes[reward.reward_type]) {
        rewardTypes[reward.reward_type] = {
          count: 0,
          points_earned: 0,
          points_redeemed: 0,
        };
      }
      rewardTypes[reward.reward_type].count++;
      rewardTypes[reward.reward_type].points_earned +=
        reward.points_earned || 0;
      rewardTypes[reward.reward_type].points_redeemed +=
        reward.points_redeemed || 0;
    });

    res.json({
      client_name: client.name,
      stats,
      reward_types: rewardTypes,
    });
  } catch (error) {
    console.error("Error in get client reward stats:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener catálogo de recompensas disponibles
router.get("/catalog", authenticateToken, async (req, res) => {
  try {
    const catalog = [
      {
        id: "discount_5",
        name: "Descuento 5%",
        description: "Descuento del 5% en tu próxima compra",
        points_required: 100,
        reward_type: "discount",
        value: 5,
        is_active: true,
      },
      {
        id: "discount_10",
        name: "Descuento 10%",
        description: "Descuento del 10% en tu próxima compra",
        points_required: 200,
        reward_type: "discount",
        value: 10,
        is_active: true,
      },
      {
        id: "free_product",
        name: "Producto Gratis",
        description: "Producto gratis hasta $50",
        points_required: 500,
        reward_type: "free_product",
        value: 50,
        is_active: true,
      },
      {
        id: "cash_back_20",
        name: "Cashback $20",
        description: "Reembolso de $20 en efectivo",
        points_required: 400,
        reward_type: "cash_back",
        value: 20,
        is_active: true,
      },
      {
        id: "birthday_special",
        name: "Especial Cumpleaños",
        description: "Descuento del 15% en tu cumpleaños",
        points_required: 300,
        reward_type: "birthday_discount",
        value: 15,
        is_active: true,
      },
    ];

    res.json({ catalog });
  } catch (error) {
    console.error("Error in get rewards catalog:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener top clientes por puntos
router.get(
  "/top-clients",
  authenticateToken,
  requireRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const { data: topClients, error } = await supabase
        .from("clients")
        .select("id, name, total_points, total_spent, visit_count")
        .eq("is_active", true)
        .order("total_points", { ascending: false })
        .limit(parseInt(limit));

      if (error) {
        console.error("Error fetching top clients:", error);
        return res.status(500).json({ error: "Error al obtener top clientes" });
      }

      res.json({ top_clients: topClients });
    } catch (error) {
      console.error("Error in get top clients:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Aplicar puntos automáticamente por compra (función interna)
async function applyPurchasePoints(client_id, sale_id, total_amount, user_id) {
  try {
    // Regla: 1 punto por cada $10 de compra
    const pointsEarned = Math.floor(total_amount / 10);

    if (pointsEarned > 0) {
      // Crear registro de puntos
      await supabase.from("client_rewards").insert({
        client_id,
        sale_id,
        points_earned: pointsEarned,
        points_redeemed: 0,
        reward_type: "purchase",
        description: `Compra #${sale_id} - ${pointsEarned} puntos por $${total_amount}`,
        created_by: user_id,
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
            updated_at: new Date().toISOString(),
          })
          .eq("id", client_id);
      }

      return pointsEarned;
    }

    return 0;
  } catch (error) {
    console.error("Error applying purchase points:", error);
    return 0;
  }
}

module.exports = {
  router,
  applyPurchasePoints,
};
