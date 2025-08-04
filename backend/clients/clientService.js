import { supabase, supabaseAdmin } from "../config/supabase.js";

export class ClientService {
  // Create new customer
  static async createClient(clientData) {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        address,
        birthDate,
        customerCode,
        createdBy,
      } = clientData;

      const { data: client, error } = await supabaseAdmin
        .from("customers")
        .insert([
          {
            customer_code: customerCode,
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            address,
            birth_date: birthDate,
            loyalty_points: 0,
            total_spent: 0,
            is_active: true,
            created_by: createdBy,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return client;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw new Error("Failed to create customer");
    }
  }

  // Get customer by ID
  static async getClientById(clientId) {
    try {
      const { data: client, error } = await supabase
        .from("customers")
        .select(`
          *,
          orders:orders(
            id,
            order_number,
            total_amount,
            status,
            created_at
          )
        `)
        .eq("id", clientId)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return client;
    } catch (error) {
      console.error("Error fetching customer:", error);
      throw new Error("Customer not found");
    }
  }

  // Get customer by email
  static async getClientByEmail(email) {
    try {
      const { data: client, error } = await supabase
        .from("customers")
        .select("*")
        .eq("email", email)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return client;
    } catch (error) {
      console.error("Error fetching customer by email:", error);
      return null;
    }
  }

  // Get customer by phone
  static async getClientByPhone(phone) {
    try {
      const { data: client, error } = await supabase
        .from("customers")
        .select("*")
        .eq("phone", phone)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return client;
    } catch (error) {
      console.error("Error fetching customer by phone:", error);
      return null;
    }
  }

  // Get customer by customer code
  static async getClientByCode(customerCode) {
    try {
      const { data: client, error } = await supabase
        .from("customers")
        .select("*")
        .eq("customer_code", customerCode)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return client;
    } catch (error) {
      console.error("Error fetching customer by code:", error);
      return null;
    }
  }

  // Get all customers with pagination and search
  static async getAllClients(page = 1, limit = 10, searchTerm = "") {
    try {
      const offset = (page - 1) * limit;
      
      let query = supabase
        .from("customers")
        .select("*", { count: "exact" })
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,customer_code.ilike.%${searchTerm}%`
        );
      }

      const { data: clients, error, count } = await query;

      if (error) throw error;

      return {
        clients,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw new Error("Failed to fetch customers");
    }
  }

  // Update customer
  static async updateClient(clientId, updateData) {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        address,
        birthDate,
        customerCode,
        isActive,
      } = updateData;

      const updateFields = {
        updated_at: new Date().toISOString(),
      };

      if (firstName !== undefined) updateFields.first_name = firstName;
      if (lastName !== undefined) updateFields.last_name = lastName;
      if (email !== undefined) updateFields.email = email;
      if (phone !== undefined) updateFields.phone = phone;
      if (address !== undefined) updateFields.address = address;
      if (birthDate !== undefined) updateFields.birth_date = birthDate;
      if (customerCode !== undefined) updateFields.customer_code = customerCode;
      if (isActive !== undefined) updateFields.is_active = isActive;

      const { data: client, error } = await supabaseAdmin
        .from("customers")
        .update(updateFields)
        .eq("id", clientId)
        .select()
        .single();

      if (error) throw error;
      return client;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw new Error("Failed to update customer");
    }
  }

  // Update loyalty points
  static async updateLoyaltyPoints(clientId, points) {
    try {
      const { data: client, error } = await supabaseAdmin
        .from("customers")
        .update({
          loyalty_points: points,
          updated_at: new Date().toISOString(),
        })
        .eq("id", clientId)
        .select()
        .single();

      if (error) throw error;
      return client;
    } catch (error) {
      console.error("Error updating loyalty points:", error);
      throw new Error("Failed to update loyalty points");
    }
  }

  // Add loyalty points (for purchases)
  static async addLoyaltyPoints(clientId, pointsToAdd) {
    try {
      // Get current points
      const { data: client, error: fetchError } = await supabase
        .from("customers")
        .select("loyalty_points")
        .eq("id", clientId)
        .single();

      if (fetchError) throw fetchError;

      const newPoints = (client.loyalty_points || 0) + pointsToAdd;

      const { data: updatedClient, error } = await supabaseAdmin
        .from("customers")
        .update({
          loyalty_points: newPoints,
          updated_at: new Date().toISOString(),
        })
        .eq("id", clientId)
        .select()
        .single();

      if (error) throw error;
      return updatedClient;
    } catch (error) {
      console.error("Error adding loyalty points:", error);
      throw new Error("Failed to add loyalty points");
    }
  }

  // Redeem loyalty points
  static async redeemLoyaltyPoints(clientId, pointsToRedeem) {
    try {
      // Get current points
      const { data: client, error: fetchError } = await supabase
        .from("customers")
        .select("loyalty_points")
        .eq("id", clientId)
        .single();

      if (fetchError) throw fetchError;

      const currentPoints = client.loyalty_points || 0;
      if (currentPoints < pointsToRedeem) {
        throw new Error("Insufficient loyalty points");
      }

      const newPoints = currentPoints - pointsToRedeem;

      const { data: updatedClient, error } = await supabaseAdmin
        .from("customers")
        .update({
          loyalty_points: newPoints,
          updated_at: new Date().toISOString(),
        })
        .eq("id", clientId)
        .select()
        .single();

      if (error) throw error;
      return updatedClient;
    } catch (error) {
      console.error("Error redeeming loyalty points:", error);
      throw new Error("Failed to redeem loyalty points");
    }
  }

  // Update total spent
  static async updateTotalSpent(clientId, amountToAdd) {
    try {
      // Get current total
      const { data: client, error: fetchError } = await supabase
        .from("customers")
        .select("total_spent")
        .eq("id", clientId)
        .single();

      if (fetchError) throw fetchError;

      const newTotal = (client.total_spent || 0) + amountToAdd;

      const { data: updatedClient, error } = await supabaseAdmin
        .from("customers")
        .update({
          total_spent: newTotal,
          last_visit: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", clientId)
        .select()
        .single();

      if (error) throw error;
      return updatedClient;
    } catch (error) {
      console.error("Error updating total spent:", error);
      throw new Error("Failed to update total spent");
    }
  }

  // Soft delete customer
  static async deleteClient(clientId) {
    try {
      const { error } = await supabaseAdmin
        .from("customers")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", clientId);

      if (error) throw error;
      return { message: "Customer deleted successfully" };
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw new Error("Failed to delete customer");
    }
  }

  // Get customer purchase history
  static async getClientPurchaseHistory(clientId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { data: orders, error, count } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          total_amount,
          payment_method,
          status,
          created_at,
          items:order_items(
            id,
            quantity,
            unit_price,
            product:products(
              id,
              name,
              barcode
            )
          )
        `, { count: "exact" })
        .eq("customer_id", clientId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        orders,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching customer purchase history:", error);
      throw new Error("Failed to fetch purchase history");
    }
  }

  // Get top customers by loyalty points
  static async getTopClientsByLoyalty(limit = 10) {
    try {
      const { data: clients, error } = await supabase
        .from("customers")
        .select("id, first_name, last_name, email, loyalty_points, total_spent")
        .eq("is_active", true)
        .order("loyalty_points", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return clients;
    } catch (error) {
      console.error("Error fetching top customers:", error);
      throw new Error("Failed to fetch top customers");
    }
  }

  // Get top customers by total spent
  static async getTopClientsBySpending(limit = 10) {
    try {
      const { data: clients, error } = await supabase
        .from("customers")
        .select("id, first_name, last_name, email, loyalty_points, total_spent")
        .eq("is_active", true)
        .order("total_spent", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return clients;
    } catch (error) {
      console.error("Error fetching top spending customers:", error);
      throw new Error("Failed to fetch top spending customers");
    }
  }

  // Get customer analytics
  static async getClientAnalytics(clientId) {
    try {
      // Get customer info
      const client = await this.getClientById(clientId);

      // Get purchase statistics
      const { data: orderStats, error: statsError } = await supabase
        .from("orders")
        .select("total_amount, created_at, status")
        .eq("customer_id", clientId)
        .eq("status", "completed");

      if (statsError) throw statsError;

      const totalSpent = orderStats.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const totalOrders = orderStats.length;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      // Get last purchase date
      const lastPurchase = orderStats.length > 0 
        ? new Date(Math.max(...orderStats.map(order => new Date(order.created_at))))
        : null;

      return {
        client,
        analytics: {
          totalSpent,
          totalOrders,
          averageOrderValue,
          lastPurchase,
          loyaltyPoints: client.loyalty_points || 0,
        },
      };
    } catch (error) {
      console.error("Error fetching customer analytics:", error);
      throw new Error("Failed to fetch customer analytics");
    }
  }
}

export default ClientService;
