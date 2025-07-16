import { supabase } from "../config/supabase.js";

const getAllProducts = async (filters = {}) => {
  try {
    let query = supabase
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
      .eq("is_active", true);

    // Apply filters
    if (filters.category) {
      query = query.eq("category_id", filters.category);
    }

    if (filters.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    if (filters.storeId) {
      query = query.eq("store_id", filters.storeId);
    }

    // Pagination
    const offset = (filters.page - 1) * filters.limit;
    query = query.range(offset, offset + filters.limit - 1);

    const { data: products, error, count } = await query;

    if (error) {
      throw new Error("Error al obtener productos: " + error.message);
    }

    return {
      products: products || [],
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

const getProductById = async (productId) => {
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
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (error || !product) {
      throw new Error("Producto no encontrado");
    }

    return product;
  } catch (error) {
    throw error;
  }
};

const createProduct = async (productData, user) => {
  try {
    const {
      name,
      description,
      price,
      cost,
      sku,
      barcode,
      category_id,
      stock,
      min_stock = 5,
      brand,
      image_url,
    } = productData;

    const { data: product, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          description,
          price,
          cost,
          sku,
          barcode,
          category_id,
          stock,
          min_stock,
          brand,
          image_url,
          store_id: user.store_id,
          created_by: user.id,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
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
      .single();

    if (error) {
      throw new Error("Error al crear producto: " + error.message);
    }

    // Log creation
    await supabase.from("audit_logs").insert([
      {
        user_id: user.id,
        action: "product_created",
        details: {
          product_id: product.id,
          product_name: product.name,
          initial_stock: stock,
        },
        created_at: new Date().toISOString(),
      },
    ]);

    return product;
  } catch (error) {
    throw error;
  }
};

const updateProduct = async (productId, updateData, user) => {
  try {
    // Get current product
    const { data: currentProduct, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError || !currentProduct) {
      throw new Error("Producto no encontrado");
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "cost",
      "sku",
      "barcode",
      "category_id",
      "stock",
      "min_stock",
      "brand",
      "image_url",
      "is_active",
    ];

    const filteredData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    filteredData.updated_at = new Date().toISOString();

    const { data: product, error } = await supabase
      .from("products")
      .update(filteredData)
      .eq("id", productId)
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
      .single();

    if (error) {
      throw new Error("Error al actualizar producto: " + error.message);
    }

    // Log update if stock changed
    if (
      filteredData.stock !== undefined &&
      filteredData.stock !== currentProduct.stock
    ) {
      await supabase.from("audit_logs").insert([
        {
          user_id: user.id,
          action: "product_stock_updated",
          details: {
            product_id: productId,
            product_name: product.name,
            old_stock: currentProduct.stock,
            new_stock: filteredData.stock,
            change: filteredData.stock - currentProduct.stock,
          },
          created_at: new Date().toISOString(),
        },
      ]);
    }

    return product;
  } catch (error) {
    throw error;
  }
};

const deleteProduct = async (productId, user) => {
  try {
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("name")
      .eq("id", productId)
      .single();

    if (fetchError || !product) {
      throw new Error("Producto no encontrado");
    }

    // Soft delete
    const { error } = await supabase
      .from("products")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (error) {
      throw new Error("Error al eliminar producto: " + error.message);
    }

    // Log deletion
    await supabase.from("audit_logs").insert([
      {
        user_id: user.id,
        action: "product_deleted",
        details: {
          product_id: productId,
          product_name: product.name,
        },
        created_at: new Date().toISOString(),
      },
    ]);

    return true;
  } catch (error) {
    throw error;
  }
};

const getLowStockProducts = async (storeId) => {
  try {
    let query = supabase
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
      .eq("is_active", true)
      .filter("stock", "lte", "min_stock");

    if (storeId) {
      query = query.eq("store_id", storeId);
    }

    const { data: products, error } = await query.order("stock", {
      ascending: true,
    });

    if (error) {
      throw new Error(
        "Error al obtener productos con stock bajo: " + error.message,
      );
    }

    return products || [];
  } catch (error) {
    throw error;
  }
};

// Category management
const getAllCategories = async () => {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("aisle")
      .order("name");

    if (error) {
      throw new Error("Error al obtener categorías: " + error.message);
    }

    return categories || [];
  } catch (error) {
    throw error;
  }
};

const createCategory = async (categoryData, user) => {
  try {
    const { name, description, aisle, icon } = categoryData;

    const { data: category, error } = await supabase
      .from("categories")
      .insert([
        {
          name,
          description,
          aisle,
          icon,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error("Error al crear categoría: " + error.message);
    }

    return category;
  } catch (error) {
    throw error;
  }
};

const updateCategory = async (categoryId, updateData, user) => {
  try {
    const allowedFields = ["name", "description", "aisle", "icon", "is_active"];
    const filteredData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    filteredData.updated_at = new Date().toISOString();

    const { data: category, error } = await supabase
      .from("categories")
      .update(filteredData)
      .eq("id", categoryId)
      .select()
      .single();

    if (error) {
      throw new Error("Error al actualizar categoría: " + error.message);
    }

    return category;
  } catch (error) {
    throw error;
  }
};

const deleteCategory = async (categoryId, user) => {
  try {
    // Check if category has products
    const { data: products, error: checkError } = await supabase
      .from("products")
      .select("id")
      .eq("category_id", categoryId)
      .eq("is_active", true);

    if (checkError) {
      throw new Error("Error al verificar productos en la categoría");
    }

    if (products && products.length > 0) {
      throw new Error("No se puede eliminar una categoría que tiene productos");
    }

    const { error } = await supabase
      .from("categories")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId);

    if (error) {
      throw new Error("Error al eliminar categoría: " + error.message);
    }

    return true;
  } catch (error) {
    throw error;
  }
};

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
