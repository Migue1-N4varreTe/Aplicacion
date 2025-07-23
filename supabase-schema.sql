-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stores table
CREATE TABLE stores (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name varchar(255) NOT NULL,
  address text,
  phone varchar(20),
  tax_id varchar(50),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email varchar(255) UNIQUE NOT NULL,
  password_hash varchar(255) NOT NULL,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  role varchar(50) NOT NULL DEFAULT 'LEVEL_1_CASHIER',
  level integer NOT NULL DEFAULT 1,
  store_id uuid REFERENCES stores(id),
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name varchar(255) NOT NULL,
  description text,
  aisle varchar(50),
  icon varchar(100),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name varchar(255) NOT NULL,
  description text,
  sku varchar(100),
  barcode varchar(100),
  price decimal(10,2) NOT NULL,
  cost decimal(10,2),
  category_id uuid REFERENCES categories(id),
  brand varchar(100),
  stock integer DEFAULT 0,
  min_stock integer DEFAULT 5,
  image_url text,
  store_id uuid REFERENCES stores(id),
  created_by uuid REFERENCES users(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE customers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  email varchar(255),
  phone varchar(20),
  birth_date date,
  address text,
  loyalty_points integer DEFAULT 0,
  total_spent decimal(10,2) DEFAULT 0,
  visit_count integer DEFAULT 0,
  store_id uuid REFERENCES stores(id),
  registered_by uuid REFERENCES users(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE sales (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  cashier_id uuid REFERENCES users(id),
  customer_id uuid REFERENCES customers(id),
  store_id uuid REFERENCES stores(id),
  subtotal decimal(10,2) NOT NULL,
  discount decimal(10,2) DEFAULT 0,
  tax decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL,
  payment_method varchar(20) NOT NULL,
  amount_received decimal(10,2),
  change_given decimal(10,2),
  status varchar(20) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sale_items table
CREATE TABLE sale_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name varchar(255) NOT NULL,
  product_price decimal(10,2) NOT NULL,
  quantity integer NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create refunds table
CREATE TABLE refunds (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  original_sale_id uuid REFERENCES sales(id),
  processed_by uuid REFERENCES users(id),
  reason text NOT NULL,
  refund_amount decimal(10,2) NOT NULL,
  status varchar(20) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create refund_items table
CREATE TABLE refund_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  refund_id uuid REFERENCES refunds(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create temporary_permissions table
CREATE TABLE temporary_permissions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  permission varchar(100) NOT NULL,
  granted_by uuid REFERENCES users(id),
  expires_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  target_user_id uuid REFERENCES users(id),
  action varchar(100) NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create loyalty_transactions table
CREATE TABLE loyalty_transactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id uuid REFERENCES customers(id),
  transaction_type varchar(20) NOT NULL, -- earned, redeemed
  points integer NOT NULL,
  reason text,
  processed_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Create coupons table
CREATE TABLE coupons (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  code varchar(50) UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id),
  discount_type varchar(20) NOT NULL, -- percentage, fixed
  discount_value decimal(10,2) NOT NULL,
  min_purchase_amount decimal(10,2) DEFAULT 0,
  description text,
  expires_at timestamptz NOT NULL,
  is_used boolean DEFAULT false,
  used_at timestamptz,
  used_by uuid REFERENCES users(id),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_sales_cashier ON sales(cashier_id);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(created_at);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);
CREATE INDEX idx_temporary_permissions_user ON temporary_permissions(user_id);
CREATE INDEX idx_temporary_permissions_expires ON temporary_permissions(expires_at);

-- Insert default store
INSERT INTO stores (name, address, phone, tax_id) 
VALUES ('La Económica Principal', 'Av. Principal 123, Ciudad', '+1234567890', 'RFC123456789');

-- Insert default categories
INSERT INTO categories (name, description, aisle, icon) VALUES
('Frutas y Verduras', 'Productos frescos de temporada', 'Pasillo 1', '🥬'),
('Panadería Bimbo', 'Pan y productos de panadería', 'Pasillo 2', '🍞'),
('Carnicería y Charcutería', 'Carnes frescas y embutidos', 'Pasillo 3', '🥩'),
('Lácteos y Huevos', 'Productos lácteos y huevos frescos', 'Pasillo 4', '🥛'),
('Congelados', 'Productos congelados', 'Pasillo 5', '🧊'),
('Abarrotes', 'Productos básicos y despensa', 'Pasillo 6', '🥫'),
('Bebidas', 'Refrescos, jugos y bebidas', 'Pasillo 7', '🥤'),
('Dulces y Botanas', 'Dulces, chocolates y snacks', 'Pasillo 8', '🍭'),
('Cuidado Personal', 'Productos de higiene personal', 'Pasillo 9', '🧴'),
('Limpieza del Hogar', 'Productos de limpieza', 'Pasillo 10', '🧽');

-- Insert sample admin user (password: password123)
INSERT INTO users (email, password_hash, first_name, last_name, role, level, store_id)
SELECT 
  'admin@laeconomica.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewDcKBQPVrjVfJl.', -- password123
  'Admin',
  'Sistema',
  'LEVEL_5_DEVELOPER',
  5,
  s.id
FROM stores s
WHERE s.name = 'La Económica Principal'
LIMIT 1;

-- Create RLS policies (if using Row Level Security)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
-- Add your RLS policies here based on your security requirements
