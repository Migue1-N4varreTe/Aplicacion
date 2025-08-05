import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Types for existing database schema
export interface Location {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  sku?: string;
  barcode?: string;
  name: string;
  description?: string;
  category_id?: string;
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  image_url?: string;
  is_active: boolean;
  tax_rate: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  store_id?: string;
  // Relations
  category?: Category;
}

export interface Customer {
  id: string;
  customer_code?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  loyalty_points: number;
  total_spent: number;
  last_visit?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  cashier_id: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  payment_method: 'cash' | 'card' | 'transfer' | 'mixed';
  payment_reference?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  location_id?: string;
  created_at: string;
  updated_at: string;
  // Relations
  customer?: Customer;
  cashier?: any; // auth.users
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  line_total: number;
  created_at: string;
  // Relations
  product?: Product;
}

export interface EmployeeAttendance {
  id: string;
  employee_id: string;
  check_in: string;
  check_out?: string;
  break_start?: string;
  break_end?: string;
  location_lat?: number;
  location_lng?: number;
  notes?: string;
  status: string;
  created_at: string;
  user_id?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  payment_terms?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  min_purchase: number;
  max_uses?: number;
  used_count: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
}

// Helper functions for database operations using existing schema
export const db = {
  // Locations
  locations: {
    async getAll() {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Location[];
    },
    
    async getById(id: string) {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Location;
    }
  },

  // Categories
  categories: {
    async getAll() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    },
    
    async getById(id: string) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Category;
    }
  },

  // Products
  products: {
    async getAll(limit = 50, offset = 0) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('is_active', true)
        .order('name')
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data as Product[];
    },
    
    async getById(id: string) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    
    async getByBarcode(barcode: string) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('barcode', barcode)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    
    async search(query: string, limit = 20) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,barcode.ilike.%${query}%`)
        .eq('is_active', true)
        .order('name')
        .limit(limit);
      
      if (error) throw error;
      return data as Product[];
    }
  },

  // Customers
  customers: {
    async getAll(limit = 50, offset = 0) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('first_name')
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data as Customer[];
    },
    
    async getById(id: string) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Customer;
    },

    async getByEmail(email: string) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as Customer;
    },

    async create(customerData: Partial<Customer>) {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();
      
      if (error) throw error;
      return data as Customer;
    }
  },

  // Orders
  orders: {
    async create(orderData: Partial<Order>) {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
      
      if (error) throw error;
      return data as Order;
    },
    
    async getById(id: string) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Order;
    },

    async getRecent(limit = 10) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as Order[];
    }
  },

  // Order Items
  orderItems: {
    async create(items: Partial<OrderItem>[]) {
      const { data, error } = await supabase
        .from('order_items')
        .insert(items)
        .select();
      
      if (error) throw error;
      return data as OrderItem[];
    }
  },

  // Employee Attendance
  attendance: {
    async clockIn(employeeId: string, locationData?: { lat: number; lng: number }) {
      const { data, error } = await supabase
        .from('employee_attendance')
        .insert([{
          employee_id: employeeId,
          check_in: new Date().toISOString(),
          location_lat: locationData?.lat,
          location_lng: locationData?.lng,
          status: 'active'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as EmployeeAttendance;
    },

    async clockOut(attendanceId: string) {
      const { data, error } = await supabase
        .from('employee_attendance')
        .update({
          check_out: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', attendanceId)
        .select()
        .single();
      
      if (error) throw error;
      return data as EmployeeAttendance;
    }
  },

  // Suppliers
  suppliers: {
    async getAll() {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Supplier[];
    }
  },

  // Coupons
  coupons: {
    async getActive() {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Coupon[];
    },

    async getByCode(code: string) {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as Coupon;
    }
  }
};

export default supabase;
