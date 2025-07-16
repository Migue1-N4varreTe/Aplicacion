const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken, requireRole } = require("../auth/middleware");

const router = express.Router();

// Listar todas las categorías
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { include_products = "false" } = req.query;

    let query = supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("name");

    // Si se solicita incluir productos, agregar conteo
    if (include_products === "true") {
      query = supabase
        .from("categories")
        .select(
          `
          *,
          products(id, name, price, stock_quantity, is_active)
        `,
        )
        .eq("is_active", true)
        .order("name");
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ error: "Error al obtener categorías" });
    }

    // Si incluye productos, calcular estadísticas
    if (include_products === "true") {
      const categoriesWithStats = categories.map((category) => {
        const activeProducts =
          category.products?.filter((p) => p.is_active) || [];
        return {
          ...category,
          product_count: activeProducts.length,
          total_stock: activeProducts.reduce(
            (sum, p) => sum + (p.stock_quantity || 0),
            0,
          ),
          avg_price:
            activeProducts.length > 0
              ? activeProducts.reduce((sum, p) => sum + (p.price || 0), 0) /
                activeProducts.length
              : 0,
          products: include_products === "true" ? activeProducts : undefined,
        };
      });

      return res.json({ categories: categoriesWithStats });
    }

    res.json({ categories });
  } catch (error) {
    console.error("Error in list categories:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener categoría por ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: category, error } = await supabase
      .from("categories")
      .select(
        `
        *,
        products(
          id,
          name,
          description,
          price,
          stock_quantity,
          is_active,
          created_at
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error || !category) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    // Calcular estadísticas
    const activeProducts = category.products?.filter((p) => p.is_active) || [];
    const stats = {
      total_products: activeProducts.length,
      total_stock: activeProducts.reduce(
        (sum, p) => sum + (p.stock_quantity || 0),
        0,
      ),
      avg_price:
        activeProducts.length > 0
          ? activeProducts.reduce((sum, p) => sum + (p.price || 0), 0) /
            activeProducts.length
          : 0,
      min_price:
        activeProducts.length > 0
          ? Math.min(...activeProducts.map((p) => p.price || 0))
          : 0,
      max_price:
        activeProducts.length > 0
          ? Math.max(...activeProducts.map((p) => p.price || 0))
          : 0,
    };

    res.json({
      category: {
        ...category,
        statistics: stats,
      },
    });
  } catch (error) {
    console.error("Error in get category:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Crear nueva categoría
router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { name, description, color, icon } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ error: "Nombre de la categoría es requerido" });
      }

      // Verificar que el nombre no existe
      const { data: existingCategory } = await supabase
        .from("categories")
        .select("id")
        .eq("name", name)
        .single();

      if (existingCategory) {
        return res
          .status(400)
          .json({ error: "Ya existe una categoría con ese nombre" });
      }

      const { data: category, error } = await supabase
        .from("categories")
        .insert({
          name,
          description,
          color: color || "#22c55e",
          icon: icon || "package",
          is_active: true,
          created_by: req.user.id,
        })
        .select("*")
        .single();

      if (error) {
        console.error("Error creating category:", error);
        return res.status(500).json({ error: "Error al crear categoría" });
      }

      res.status(201).json({
        message: "Categoría creada exitosamente",
        category,
      });
    } catch (error) {
      console.error("Error in create category:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Actualizar categoría
router.put(
  "/:id",
  authenticateToken,
  requireRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, color, icon, is_active } = req.body;

      // Verificar que la categoría existe
      const { data: existingCategory, error: fetchError } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !existingCategory) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }

      // Verificar nombre único si se está actualizando
      if (name && name !== existingCategory.name) {
        const { data: duplicateName } = await supabase
          .from("categories")
          .select("id")
          .eq("name", name)
          .neq("id", id)
          .single();

        if (duplicateName) {
          return res
            .status(400)
            .json({ error: "Ya existe una categoría con ese nombre" });
        }
      }

      // Preparar datos para actualizar
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (color !== undefined) updateData.color = color;
      if (icon !== undefined) updateData.icon = icon;
      if (is_active !== undefined) updateData.is_active = is_active;
      updateData.updated_at = new Date().toISOString();

      const { data: category, error } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        console.error("Error updating category:", error);
        return res.status(500).json({ error: "Error al actualizar categoría" });
      }

      res.json({
        message: "Categoría actualizada exitosamente",
        category,
      });
    } catch (error) {
      console.error("Error in update category:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Eliminar categoría (soft delete)
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar que la categoría existe
      const { data: category, error: fetchError } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !category) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }

      // Verificar si tiene productos asociados
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", id)
        .eq("is_active", true)
        .limit(1);

      if (productsError) {
        console.error("Error checking products:", productsError);
        return res.status(500).json({ error: "Error al verificar productos" });
      }

      if (products && products.length > 0) {
        return res.status(400).json({
          error:
            "No se puede eliminar la categoría porque tiene productos asociados",
        });
      }

      // Desactivar categoría (soft delete)
      const { data: updatedCategory, error: updateError } = await supabase
        .from("categories")
        .update({
          is_active: false,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

      if (updateError) {
        console.error("Error deactivating category:", updateError);
        return res.status(500).json({ error: "Error al eliminar categoría" });
      }

      res.json({
        message: "Categoría eliminada exitosamente",
        category: updatedCategory,
      });
    } catch (error) {
      console.error("Error in delete category:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
);

// Obtener estadísticas de categorías
router.get("/stats/overview", authenticateToken, async (req, res) => {
  try {
    const { data: categoriesData, error } = await supabase
      .from("categories")
      .select(
        `
        id,
        name,
        color,
        products(id, price, stock_quantity, is_active)
      `,
      )
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching categories stats:", error);
      return res.status(500).json({ error: "Error al obtener estadísticas" });
    }

    const stats = categoriesData.map((category) => {
      const activeProducts =
        category.products?.filter((p) => p.is_active) || [];
      const totalValue = activeProducts.reduce(
        (sum, p) => sum + (p.price || 0) * (p.stock_quantity || 0),
        0,
      );

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        product_count: activeProducts.length,
        total_stock: activeProducts.reduce(
          (sum, p) => sum + (p.stock_quantity || 0),
          0,
        ),
        total_value: totalValue,
        avg_price:
          activeProducts.length > 0
            ? activeProducts.reduce((sum, p) => sum + (p.price || 0), 0) /
              activeProducts.length
            : 0,
      };
    });

    // Ordenar por valor total descendente
    stats.sort((a, b) => b.total_value - a.total_value);

    res.json({ categories_stats: stats });
  } catch (error) {
    console.error("Error in categories stats:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
