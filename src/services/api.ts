import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Validate and create Supabase client
let supabase = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "❌ Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
  );
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    console.log("✅ Supabase client initialized successfully");
  } catch (error) {
    console.error("❌ Supabase initialization failed:", error);
    throw error;
  }
}

export { supabase };

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("auth_token");
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error: any) {
      console.error("API request failed:", error);

      // Provide user-friendly error messages
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "No se puede conectar al servidor. Verifique que el backend esté ejecutándose.",
        );
      }

      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
  }) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getMe() {
    return this.request("/auth/me");
  }

  async logout() {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } finally {
      this.clearToken();
    }
  }

  // Users endpoints
  async getUsers() {
    return this.request("/users");
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async updateUserRole(id: string, role: string) {
    return this.request(`/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  }

  async grantTemporaryPermission(
    userId: string,
    permission: string,
    durationMinutes: number = 120,
  ) {
    return this.request(`/users/${userId}/temporary-permissions`, {
      method: "POST",
      body: JSON.stringify({ permission, duration_minutes: durationMinutes }),
    });
  }

  // Products endpoints
  async getProducts(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/products${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.request(endpoint);
  }

  async getProductById(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData: any) {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }

  async getLowStockProducts() {
    return this.request("/products/low-stock");
  }

  async getCategories() {
    return this.request("/products/categories/all");
  }

  // Sales endpoints
  async scanProduct(barcode: string) {
    return this.request("/sales/scan", {
      method: "POST",
      body: JSON.stringify({ barcode }),
    });
  }

  async createSale(saleData: {
    items: Array<{
      product_id: string;
      quantity: number;
    }>;
    payment_method: string;
    total: number;
    discount?: number;
    customer_id?: string;
  }) {
    return this.request("/sales/checkout", {
      method: "POST",
      body: JSON.stringify(saleData),
    });
  }

  async getSales(params?: {
    page?: number;
    limit?: number;
    from_date?: string;
    to_date?: string;
    cashier_id?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/sales${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.request(endpoint);
  }

  async getSaleById(id: string) {
    return this.request(`/sales/${id}`);
  }

  async getReceipt(saleId: string) {
    return this.request(`/sales/ticket/${saleId}`);
  }

  // Clients endpoints
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/clients${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.request(endpoint);
  }

  async createClient(clientData: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    address?: string;
  }) {
    return this.request("/clients", {
      method: "POST",
      body: JSON.stringify(clientData),
    });
  }

  async getClientById(id: string) {
    return this.request(`/clients/${id}`);
  }

  async updateClient(id: string, clientData: any) {
    return this.request(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(clientData),
    });
  }

  async getClientHistory(
    id: string,
    params?: { page?: number; limit?: number },
  ) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/clients/${id}/history${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.request(endpoint);
  }

  // Reports endpoints
  async getSalesReport(params?: {
    range?: string;
    from_date?: string;
    to_date?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/reports/sales${queryParams.toString() ? `?${queryParams}` : ""}`;
    return this.request(endpoint);
  }
}

export const apiService = new ApiService();
export default apiService;
