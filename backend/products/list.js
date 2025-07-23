const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken } = require("../auth/middleware");

const router = express.Router();

// Listar productos con filtros y paginación
router.get("/", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category_id,
      search,
      min_price,
      max_price,
      in_stock,
      low_stock,
      active_only = "true",
      sort_by = "name",
      sort_order = "asc",
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Construir query base
    let query = supabase.from("products").select(
      `
        *,
        categories(id, name, description),
        stock_alerts(id, alert_type, message, is_resolved)
      `,
      { count: "exact" },
    );

    // Filtros
    if (active_only === "true") {
      query = query.eq("is_active", true);
    }

    if (category_id) {
      query = query.eq("category_id", category_id);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,sku.eq.${search},barcode.eq.${search}`,
      );
    }

    if (min_price) {
      query = query.gte("price", parseFloat(min_price));
    }

    if (max_price) {
      query = query.lte("price", parseFloat(max_price));
    }

    if (in_stock === "true") {
      query = query.gt("stock_quantity", 0);
    } else if (in_stock === "false") {
      query = query.eq("stock_quantity", 0);
    }

    if (low_stock === "true") {
      query = query.filter("stock_quantity", "lt", "min_stock");
    }

    // Ordenamiento
    const validSortColumns = [
      "name",
      "price",
      "stock_quantity",
      "created_at",
      "updated_at",
    ];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : "name";
    const sortDirection = sort_order === "desc" ? false : true;

    query = query.order(sortColumn, { ascending: sortDirection });

    // Paginación
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: products, error, count } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Error al obtener productos" });
    }

    // Calcular información de paginación
    const totalPages = Math.ceil(count / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPreviousPage = parseInt(page) > 1;

    res.json({
      products,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: count,
        items_per_page: parseInt(limit),
        has_next_page: hasNextPage,
        has_previous_page: hasPreviousPage,
      },
    });
  } catch (error) {
    console.error("Error in list products:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener producto por ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories(id, name, description),
        stock_alerts(id, alert_type, message, is_resolved, created_at),
        stock_movements(
          id,
          movement_type,
          quantity,
          previous_stock,
          new_stock,
          reason,
          created_at,
          users(name, email)
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error || !product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Obtener estadísticas de ventas del producto
    const { data: salesStats } = await supabase
      .from("sale_items")
      .select("quantity, unit_price, sales(created_at)")
      .eq("product_id", id);

    let salesInfo = {
      total_sold: 0,
      total_revenue: 0,
      last_sale: null,
    };

    if (salesStats && salesStats.length > 0) {
      salesInfo.total_sold = salesStats.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      salesInfo.total_revenue = salesStats.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0,
      );
      salesInfo.last_sale = salesStats
        .map((item) => item.sales.created_at)
        .sort((a, b) => new Date(b) - new Date(a))[0];
    }

    res.json({
      product: {
        ...product,
        sales_info: salesInfo,
      },
    });
  } catch (error) {
    console.error("Error in get product:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Buscar productos por código de barras
router.get("/barcode/:code", authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;

    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories(id, name, description)
      `,
      )
      .eq("barcode", code)
      .eq("is_active", true)
      .single();

    if (error || !product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ product });
  } catch (error) {
    console.error("Error in barcode search:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Productos más vendidos
router.get("/stats/top-selling", authenticateToken, async (req, res) => {
  try {
    const { limit = 10, period = "30" } = req.query; // period en días

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(period));

    const { data: topProducts, error } = await supabase
      .from("sale_items")
      .select(
        `
        product_id,
        quantity,
        products(name, price, stock_quantity),
        sales(created_at)
      `,
      )
      .gte("sales.created_at", dateLimit.toISOString())
      .limit(parseInt(limit) * 3); // Obtenemos más datos para procesar

    if (error) {
      console.error("Error fetching top products:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener productos más vendidos" });
    }

    // Agrupar y calcular totales
    const productStats = {};
    topProducts?.forEach((item) => {
      const productId = item.product_id;
      if (!productStats[productId]) {
        productStats[productId] = {
          product_id: productId,
          product_name: item.products.name,
          product_price: item.products.price,
          current_stock: item.products.stock_quantity,
          total_quantity: 0,
          total_revenue: 0,
          sale_count: 0,
        };
      }
      productStats[productId].total_quantity += item.quantity;
      productStats[productId].total_revenue +=
        item.quantity * item.products.price;
      productStats[productId].sale_count += 1;
    });

    // Convertir a array y ordenar por cantidad vendida
    const sortedProducts = Object.values(productStats)
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, parseInt(limit));

    res.json({
      top_products: sortedProducts,
      period_days: parseInt(period),
    });
  } catch (error) {
    console.error("Error in top selling products:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
