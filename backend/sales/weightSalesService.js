import { supabase, supabaseAdmin } from "../config/supabase.js";

export class WeightSalesService {
  // Crear venta con productos por peso
  static async createWeightSale(saleData) {
    try {
      const {
        customer_id,
        cashier_id,
        items, // Array de items con peso
        payment_method,
        location_id,
        notes
      } = saleData;

      // Generar número de venta
      const saleNumber = `WS-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Calcular totales considerando pesos
      let subtotal = 0;
      const processedItems = [];

      for (const item of items) {
        const { product_id, quantity, weight, unit_price, sell_by_weight } = item;

        let itemTotal;
        let actualWeight = weight || 0;
        let actualQuantity = quantity || 1;

        if (sell_by_weight) {
          // Para productos por peso: peso × precio_por_unidad
          itemTotal = actualWeight * unit_price;
          actualQuantity = 1; // Siempre 1 para productos por peso
        } else {
          // Para productos normales: cantidad × precio_unitario
          itemTotal = actualQuantity * unit_price;
          actualWeight = null; // No aplica peso
        }

        processedItems.push({
          product_id,
          quantity: actualQuantity,
          weight: actualWeight,
          unit_price,
          total_price: Number(itemTotal.toFixed(2)),
          sell_by_weight: sell_by_weight || false
        });

        subtotal += itemTotal;
      }

      const tax_amount = subtotal * 0.16; // 16% IVA
      const total_amount = subtotal + tax_amount;

      // Crear la venta
      const { data: sale, error: saleError } = await supabaseAdmin
        .from("orders")
        .insert([{
          order_number: saleNumber,
          customer_id,
          cashier_id,
          status: 'completed',
          payment_method,
          subtotal: Number(subtotal.toFixed(2)),
          tax_amount: Number(tax_amount.toFixed(2)),
          total_amount: Number(total_amount.toFixed(2)),
          notes,
          location_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // Crear los items de la venta
      const saleItems = processedItems.map(item => ({
        order_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        weight: item.weight, // Peso real pesado
        unit_price: item.unit_price,
        line_total: item.total_price,
        sell_by_weight: item.sell_by_weight,
        created_at: new Date().toISOString()
      }));

      const { data: items_created, error: itemsError } = await supabaseAdmin
        .from("order_items")
        .insert(saleItems)
        .select();

      if (itemsError) throw itemsError;

      // Actualizar inventario
      for (const item of processedItems) {
        await this.updateInventoryForWeightSale(
          item.product_id, 
          item.quantity, 
          item.weight, 
          item.sell_by_weight,
          sale.id
        );
      }

      // Actualizar estadísticas del cliente si existe
      if (customer_id) {
        await this.updateCustomerStats(customer_id, total_amount);
      }

      return {
        sale,
        items: items_created,
        summary: {
          total_items: processedItems.length,
          total_weight: processedItems
            .filter(item => item.sell_by_weight)
            .reduce((sum, item) => sum + (item.weight || 0), 0),
          subtotal: Number(subtotal.toFixed(2)),
          tax_amount: Number(tax_amount.toFixed(2)),
          total_amount: Number(total_amount.toFixed(2))
        }
      };

    } catch (error) {
      console.error("Error creating weight sale:", error);
      throw new Error("Failed to create weight sale");
    }
  }

  // Actualizar inventario considerando peso
  static async updateInventoryForWeightSale(productId, quantity, weight, sellByWeight, saleId) {
    try {
      // Obtener producto actual
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock_quantity, unit, name")
        .eq("id", productId)
        .single();

      if (productError) throw productError;

      let stockReduction = 0;

      if (sellByWeight) {
        // Para productos por peso, reducir según el peso
        if (product.unit === 'kg') {
          stockReduction = weight; // Peso directo en kg
        } else if (product.unit === 'g') {
          stockReduction = weight; // Peso en kg, pero stock en kg también
        } else {
          stockReduction = weight; // Usar peso tal como está
        }
      } else {
        // Para productos normales, reducir por cantidad
        stockReduction = quantity;
      }

      const newStock = Math.max(0, product.stock_quantity - stockReduction);

      // Actualizar stock
      const { error: updateError } = await supabaseAdmin
        .from("products")
        .update({ 
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq("id", productId);

      if (updateError) throw updateError;

      // Registrar movimiento de inventario
      await supabaseAdmin
        .from("inventory_movements")
        .insert([{
          product_id: productId,
          movement_type: 'sale',
          quantity: -stockReduction, // Negativo para salida
          previous_stock: product.stock_quantity,
          new_stock: newStock,
          reference_id: saleId,
          notes: sellByWeight 
            ? `Venta por peso: ${weight}kg` 
            : `Venta normal: ${quantity} unidades`,
          created_at: new Date().toISOString()
        }]);

      // Alerta si stock bajo
      if (newStock <= 5) {
        console.warn(`⚠️ Stock bajo para ${product.name}: ${newStock} unidades restantes`);
      }

    } catch (error) {
      console.error("Error updating inventory for weight sale:", error);
      throw error;
    }
  }

  // Actualizar estadísticas del cliente
  static async updateCustomerStats(customerId, saleAmount) {
    try {
      const { data: customer, error: fetchError } = await supabase
        .from("customers")
        .select("total_spent, loyalty_points")
        .eq("id", customerId)
        .single();

      if (fetchError) throw fetchError;

      const newTotalSpent = (customer.total_spent || 0) + saleAmount;
      const loyaltyPointsEarned = Math.floor(saleAmount / 10); // 1 punto por cada $10
      const newLoyaltyPoints = (customer.loyalty_points || 0) + loyaltyPointsEarned;

      await supabaseAdmin
        .from("customers")
        .update({
          total_spent: newTotalSpent,
          loyalty_points: newLoyaltyPoints,
          last_visit: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", customerId);

    } catch (error) {
      console.error("Error updating customer stats:", error);
      // No lanzar error para no afectar la venta principal
    }
  }

  // Obtener ventas con información de peso
  static async getWeightSales(page = 1, limit = 10, includeWeight = true) {
    try {
      const offset = (page - 1) * limit;

      let query = supabase
        .from("orders")
        .select(`
          *,
          customer:customers(*),
          items:order_items(
            *,
            product:products(
              id,
              name,
              unit,
              price
            )
          )
        `, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: sales, error, count } = await query;

      if (error) throw error;

      // Procesar datos para incluir información de peso
      const processedSales = sales.map(sale => {
        const weightItems = sale.items?.filter(item => item.weight !== null) || [];
        const totalWeight = weightItems.reduce((sum, item) => sum + (item.weight || 0), 0);
        
        return {
          ...sale,
          weight_info: {
            has_weight_items: weightItems.length > 0,
            total_weight: Number(totalWeight.toFixed(3)),
            weight_items_count: weightItems.length,
            weight_items: includeWeight ? weightItems : undefined
          }
        };
      });

      return {
        sales: processedSales,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };

    } catch (error) {
      console.error("Error fetching weight sales:", error);
      throw new Error("Failed to fetch weight sales");
    }
  }

  // Reportes de ventas por peso
  static async getWeightSalesReport(startDate, endDate) {
    try {
      const { data: sales, error } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items!inner(
            weight,
            quantity,
            line_total,
            product:products(
              name,
              unit,
              category_id
            )
          )
        `)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .not("items.weight", "is", null); // Solo ventas con peso

      if (error) throw error;

      // Procesar estadísticas
      let totalWeightSold = 0;
      let totalWeightRevenue = 0;
      let weightProductsCount = 0;
      const productStats = {};

      sales.forEach(sale => {
        sale.items.forEach(item => {
          if (item.weight) {
            totalWeightSold += item.weight;
            totalWeightRevenue += item.line_total;
            weightProductsCount++;

            const productName = item.product.name;
            if (!productStats[productName]) {
              productStats[productName] = {
                total_weight: 0,
                total_revenue: 0,
                sales_count: 0,
                unit: item.product.unit
              };
            }

            productStats[productName].total_weight += item.weight;
            productStats[productName].total_revenue += item.line_total;
            productStats[productName].sales_count++;
          }
        });
      });

      const topProductsByWeight = Object.entries(productStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.total_weight - a.total_weight)
        .slice(0, 10);

      return {
        summary: {
          total_weight_sold: Number(totalWeightSold.toFixed(3)),
          total_weight_revenue: Number(totalWeightRevenue.toFixed(2)),
          weight_products_count: weightProductsCount,
          average_weight_per_sale: weightProductsCount > 0 
            ? Number((totalWeightSold / weightProductsCount).toFixed(3)) 
            : 0
        },
        top_products_by_weight: topProductsByWeight,
        sales_count: sales.length
      };

    } catch (error) {
      console.error("Error generating weight sales report:", error);
      throw new Error("Failed to generate weight sales report");
    }
  }
}

export default WeightSalesService;
