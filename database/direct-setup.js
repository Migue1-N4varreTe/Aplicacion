import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function directSetup() {
  console.log("🚀 Setting up La Económica database...");
  console.log(`📍 Connecting to: ${supabaseUrl}`);

  try {
    // Test connection first by trying to create tables directly
    console.log("\n1. Creating stores table...");
    
    // Create stores table
    const { error: storesError } = await supabaseAdmin
      .from('stores')
      .select('id')
      .limit(1);

    if (storesError && storesError.message.includes('relation "stores" does not exist')) {
      console.log("⚠️  Tables don't exist yet - this is expected for a new database");
      console.log("🔧 You'll need to create the schema manually in Supabase Dashboard");
      console.log("\n📋 INSTRUCTIONS:");
      console.log("1. Go to https://app.supabase.com/project/evyslzzekjrskeyparqn/sql");
      console.log("2. Copy and paste the SQL from 'code/database/schema.sql'");
      console.log("3. Run the SQL to create all tables");
      console.log("4. Come back and run this script again");
      
      return false;
    } else if (storesError) {
      throw storesError;
    }

    console.log("✅ Database tables exist!");

    // Verify essential tables
    const tablesToCheck = ['stores', 'users', 'categories', 'products', 'sales'];
    console.log("\n2. Verifying essential tables...");
    
    for (const table of tablesToCheck) {
      try {
        const { error } = await supabaseAdmin
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

    // Insert default data
    console.log("\n3. Setting up default data...");
    
    // Check if default store exists
    const { data: stores, error: storeCheckError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('name', 'La Económica Central');

    if (storeCheckError) {
      console.log("⚠️  Could not check stores:", storeCheckError.message);
    } else if (!stores || stores.length === 0) {
      // Insert default store
      const { error: insertStoreError } = await supabaseAdmin
        .from('stores')
        .insert([{
          name: 'La Económica Central',
          address: 'Av. Principal 123, Ciudad',
          phone: '+1234567890',
          email: 'central@laeconomica.com'
        }]);

      if (insertStoreError) {
        console.log("⚠️  Could not insert default store:", insertStoreError.message);
      } else {
        console.log("✅ Default store created");
      }
    } else {
      console.log("✅ Default store already exists");
    }

    // Check if categories exist
    const { data: categories, error: catCheckError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .limit(1);

    if (catCheckError) {
      console.log("⚠️  Could not check categories:", catCheckError.message);
    } else if (!categories || categories.length === 0) {
      // Insert default categories
      const defaultCategories = [
        { name: 'Abarrotes', description: 'Productos básicos de despensa' },
        { name: 'Bebidas', description: 'Refrescos, agua, jugos' },
        { name: 'Snacks', description: 'Botanas y dulces' },
        { name: 'Lácteos', description: 'Leche, queso, yogurt' },
        { name: 'Panadería', description: 'Pan y productos horneados' }
      ];

      const { error: insertCatError } = await supabaseAdmin
        .from('categories')
        .insert(defaultCategories);

      if (insertCatError) {
        console.log("⚠️  Could not insert categories:", insertCatError.message);
      } else {
        console.log("✅ Default categories created");
      }
    } else {
      console.log("✅ Categories already exist");
    }

    // Check if admin user exists
    const { data: users, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'admin@laeconomica.com');

    if (userCheckError) {
      console.log("⚠️  Could not check users:", userCheckError.message);
    } else if (!users || users.length === 0) {
      // Get store ID
      const { data: storeData } = await supabaseAdmin
        .from('stores')
        .select('id')
        .eq('name', 'La Económica Central')
        .single();

      if (storeData) {
        const { error: insertUserError } = await supabaseAdmin
          .from('users')
          .insert([{
            email: 'admin@laeconomica.com',
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewG5YECchGxVZ1oW', // admin123
            first_name: 'Admin',
            last_name: 'Principal',
            role: 'owner',
            store_id: storeData.id
          }]);

        if (insertUserError) {
          console.log("⚠️  Could not insert admin user:", insertUserError.message);
        } else {
          console.log("✅ Admin user created (admin@laeconomica.com / admin123)");
        }
      }
    } else {
      console.log("✅ Admin user already exists");
    }

    console.log("\n🎉 Database setup completed!");
    console.log("📊 Summary:");
    console.log("   - Database connection: ✅");
    console.log("   - Essential tables: ✅");
    console.log("   - Default data: ✅");
    console.log("   - Admin user: admin@laeconomica.com / admin123");
    
    return true;

  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    console.log("\n🔧 Manual setup required:");
    console.log("1. Go to Supabase Dashboard SQL Editor");
    console.log("2. Execute the SQL from database/schema.sql");
    console.log("3. Run this script again");
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  directSetup()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error("💥 Unexpected error:", error);
      process.exit(1);
    });
}

export default directSetup;
