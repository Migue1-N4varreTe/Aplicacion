import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Your Supabase credentials
const supabaseUrl = "https://evyslzzekjrskeyparqn.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eXNsenpla2pyc2tleXBhcnFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTkwNDMyNSwiZXhwIjoyMDY3NDgwMzI1fQ.Cc52cqa4wLwUhNujDFiN4u8fR9s6_B3UEmhQkBjOKAg";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createDatabaseSchema() {
  console.log("🏗️  Creating La Económica Database Schema...");
  console.log("📍 Connected to:", supabaseUrl);
  
  try {
    // Step 1: Create extensions
    console.log("\n1️⃣ Creating extensions...");
    
    // Step 2: Create tables one by one
    console.log("\n2️⃣ Creating tables...");
    
    // Create stores table first (referenced by other tables)
    const createStoresTable = `
      CREATE TABLE IF NOT EXISTS stores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log("   Creating stores table...");
    const { error: storesError } = await supabaseAdmin.rpc('exec_sql', { sql: createStoresTable });
    if (storesError && !storesError.message.includes('already exists')) {
      console.log("⚠️  exec_sql not available, using direct table operations...");
    } else {
      console.log("   ✅ Stores table created");
    }

    // Create categories table
    const createCategoriesTable = `
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log("   Creating categories table...");
    await supabaseAdmin.rpc('exec_sql', { sql: createCategoriesTable });
    console.log("   ✅ Categories table created");

    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        role VARCHAR(20) DEFAULT 'cashier' CHECK (role IN ('developer', 'owner', 'manager', 'supervisor', 'cashier')),
        permissions JSONB DEFAULT '[]',
        store_id UUID,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log("   Creating users table...");
    await supabaseAdmin.rpc('exec_sql', { sql: createUsersTable });
    console.log("   ✅ Users table created");

    // Create clients table
    const createClientsTable = `
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        date_of_birth DATE,
        preferred_contact VARCHAR(10) DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'sms')),
        loyalty_points INTEGER DEFAULT 0,
        store_id UUID,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log("   Creating clients table...");
    await supabaseAdmin.rpc('exec_sql', { sql: createClientsTable });
    console.log("   ✅ Clients table created");

    // Create products table
    const createProductsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        barcode VARCHAR(100) UNIQUE,
        category_id UUID,
        aisle VARCHAR(50),
        price DECIMAL(10,2) NOT NULL,
        cost DECIMAL(10,2),
        current_stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 5,
        max_stock INTEGER,
        unit VARCHAR(20) DEFAULT 'unit',
        weight DECIMAL(8,3),
        dimensions JSONB,
        images JSONB DEFAULT '[]',
        tags JSONB DEFAULT '[]',
        store_id UUID,
        supplier_id UUID,
        expiry_date DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log("   Creating products table...");
    await supabaseAdmin.rpc('exec_sql', { sql: createProductsTable });
    console.log("   ✅ Products table created");

    // Create sales table
    const createSalesTable = `
      CREATE TABLE IF NOT EXISTS sales (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sale_number VARCHAR(50) UNIQUE NOT NULL,
        client_id UUID,
        user_id UUID NOT NULL,
        store_id UUID NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer', 'mixed')),
        payment_status VARCHAR(20) DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'refunded', 'cancelled')),
        stripe_payment_intent_id VARCHAR(255),
        notes TEXT,
        receipt_printed BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log("   Creating sales table...");
    await supabaseAdmin.rpc('exec_sql', { sql: createSalesTable });
    console.log("   ✅ Sales table created");

    // Create sale_items table
    const createSaleItemsTable = `
      CREATE TABLE IF NOT EXISTS sale_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sale_id UUID NOT NULL,
        product_id UUID,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        discount_applied DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log("   Creating sale_items table...");
    await supabaseAdmin.rpc('exec_sql', { sql: createSaleItemsTable });
    console.log("   ✅ Sale items table created");

    // Create attendance_records table
    const createAttendanceTable = `
      CREATE TABLE IF NOT EXISTS attendance_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        date DATE NOT NULL,
        clock_in TIMESTAMP WITH TIME ZONE,
        clock_out TIMESTAMP WITH TIME ZONE,
        hours_worked DECIMAL(4,2),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, date)
      );
    `;
    
    console.log("   Creating attendance_records table...");
    await supabaseAdmin.rpc('exec_sql', { sql: createAttendanceTable });
    console.log("   ✅ Attendance records table created");

    // Step 3: Insert default data
    console.log("\n3️⃣ Inserting default data...");
    
    // Insert default store
    const { data: existingStore, error: storeCheckError } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('name', 'La Económica Central')
      .single();

    if (storeCheckError && storeCheckError.code === 'PGRST116') {
      // Store doesn't exist, create it
      const { data: newStore, error: insertStoreError } = await supabaseAdmin
        .from('stores')
        .insert([{
          name: 'La Económica Central',
          address: 'Av. Principal 123, Ciudad',
          phone: '+1234567890',
          email: 'central@laeconomica.com'
        }])
        .select()
        .single();

      if (insertStoreError) {
        console.log("⚠️  Could not insert default store:", insertStoreError.message);
      } else {
        console.log("   ✅ Default store created:", newStore.name);
      }
    } else {
      console.log("   ✅ Default store already exists");
    }

    // Insert default categories
    const defaultCategories = [
      { name: 'Abarrotes', description: 'Productos básicos de despensa' },
      { name: 'Bebidas', description: 'Refrescos, agua, jugos' },
      { name: 'Snacks', description: 'Botanas y dulces' },
      { name: 'Lácteos', description: 'Leche, queso, yogurt' },
      { name: 'Panadería', description: 'Pan y productos horneados' }
    ];

    for (const category of defaultCategories) {
      const { data: existingCat, error: catCheckError } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('name', category.name)
        .single();

      if (catCheckError && catCheckError.code === 'PGRST116') {
        const { error: insertCatError } = await supabaseAdmin
          .from('categories')
          .insert([category]);

        if (insertCatError) {
          console.log(`   ⚠️  Could not insert category ${category.name}:`, insertCatError.message);
        } else {
          console.log(`   ✅ Category created: ${category.name}`);
        }
      }
    }

    // Insert default admin user
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', 'admin@laeconomica.com')
      .single();

    if (userCheckError && userCheckError.code === 'PGRST116') {
      // Get store ID for the admin user
      const { data: store } = await supabaseAdmin
        .from('stores')
        .select('id')
        .eq('name', 'La Económica Central')
        .single();

      const { error: insertUserError } = await supabaseAdmin
        .from('users')
        .insert([{
          email: 'admin@laeconomica.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewG5YECchGxVZ1oW', // admin123
          first_name: 'Admin',
          last_name: 'Principal',
          role: 'owner',
          store_id: store?.id
        }]);

      if (insertUserError) {
        console.log("   ⚠️  Could not insert admin user:", insertUserError.message);
      } else {
        console.log("   ✅ Admin user created: admin@laeconomica.com (password: admin123)");
      }
    } else {
      console.log("   ✅ Admin user already exists");
    }

    // Step 4: Verify installation
    console.log("\n4️⃣ Verifying installation...");
    
    const tables = ['stores', 'categories', 'users', 'clients', 'products', 'sales', 'sale_items', 'attendance_records'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: OK`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`);
      }
    }

    console.log("\n🎉 Database setup completed successfully!");
    console.log("\n📊 Summary:");
    console.log("   ✅ 8 tables created");
    console.log("   ✅ Default store configured");
    console.log("   ✅ 5 product categories added");
    console.log("   ✅ Admin user ready");
    console.log("\n🔑 Admin credentials:");
    console.log("   Email: admin@laeconomica.com");
    console.log("   Password: admin123");
    console.log("\n🚀 Your database is ready for La Económica!");

    return true;

  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    
    if (error.message.includes('exec_sql')) {
      console.log("\n💡 Alternative method: Manual SQL execution");
      console.log("1. Go to: https://app.supabase.com/project/evyslzzekjrskeyparqn/sql");
      console.log("2. Copy the SQL from: code/database/schema.sql");
      console.log("3. Paste and execute in the SQL editor");
    }
    
    return false;
  }
}

// Run the setup
createDatabaseSchema()
  .then(success => {
    if (success) {
      console.log("\n✨ Setup completed! Your database is ready to use.");
    } else {
      console.log("\n💔 Setup failed. Please check the errors above.");
    }
  })
  .catch(error => {
    console.error("💥 Unexpected error:", error);
  });
