import express from "express";
import { supabaseAdmin } from "./config/supabase.js";

const router = express.Router();

// Create database schema endpoint
router.post("/create-schema", async (req, res) => {
  try {
    console.log("🏗️  Creating La Económica Database Schema via API...");
    
    const results = {
      success: false,
      tablesCreated: [],
      errors: [],
      defaultData: {
        store: false,
        categories: false,
        adminUser: false
      }
    };

    // Step 1: Create tables
    const tables = [
      {
        name: 'stores',
        sql: `
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
        `
      },
      {
        name: 'categories',
        sql: `
          CREATE TABLE IF NOT EXISTS categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            image_url VARCHAR(500),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'users',
        sql: `
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
        `
      },
      {
        name: 'clients',
        sql: `
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
        `
      },
      {
        name: 'products',
        sql: `
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
        `
      },
      {
        name: 'sales',
        sql: `
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
        `
      },
      {
        name: 'sale_items',
        sql: `
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
        `
      },
      {
        name: 'attendance_records',
        sql: `
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
        `
      }
    ];

    // Try to create tables using RPC if available
    for (const table of tables) {
      try {
        const { error } = await supabaseAdmin.rpc('exec_sql', { sql: table.sql });
        
        if (error) {
          if (error.message.includes('exec_sql') || error.message.includes('function') || error.message.includes('not exist')) {
            // RPC not available, skip and we'll use direct operations later
            results.errors.push(`RPC exec_sql not available for ${table.name}`);
          } else {
            results.errors.push(`Error creating ${table.name}: ${error.message}`);
          }
        } else {
          results.tablesCreated.push(table.name);
          console.log(`   ✅ ${table.name} table created`);
        }
      } catch (err) {
        results.errors.push(`Exception creating ${table.name}: ${err.message}`);
      }
    }

    // If RPC didn't work, try direct operations to verify tables exist
    if (results.tablesCreated.length === 0) {
      console.log("🔄 RPC not available, checking tables with direct operations...");
      
      for (const table of tables) {
        try {
          const { data, error } = await supabaseAdmin
            .from(table.name)
            .select('*')
            .limit(1);
            
          if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
            results.errors.push(`Table ${table.name} needs to be created manually`);
          } else if (error) {
            results.errors.push(`Error checking ${table.name}: ${error.message}`);
          } else {
            results.tablesCreated.push(table.name);
            console.log(`   ✅ ${table.name} table verified`);
          }
        } catch (err) {
          results.errors.push(`Exception checking ${table.name}: ${err.message}`);
        }
      }
    }

    // Step 2: Insert default data if tables are available
    if (results.tablesCreated.length > 0) {
      console.log("📋 Inserting default data...");
      
      // Insert default store
      try {
        const { data: existingStore, error: storeCheckError } = await supabaseAdmin
          .from('stores')
          .select('id')
          .eq('name', 'La Económica Central')
          .single();

        if (storeCheckError && storeCheckError.code === 'PGRST116') {
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

          if (!insertStoreError) {
            results.defaultData.store = true;
            console.log("   ✅ Default store created");
          }
        } else if (!storeCheckError) {
          results.defaultData.store = true;
          console.log("   ✅ Default store already exists");
        }
      } catch (err) {
        results.errors.push(`Store creation error: ${err.message}`);
      }

      // Insert default categories
      try {
        const defaultCategories = [
          { name: 'Abarrotes', description: 'Productos básicos de despensa' },
          { name: 'Bebidas', description: 'Refrescos, agua, jugos' },
          { name: 'Snacks', description: 'Botanas y dulces' },
          { name: 'Lácteos', description: 'Leche, queso, yogurt' },
          { name: 'Panadería', description: 'Pan y productos horneados' }
        ];

        let categoriesCreated = 0;
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

            if (!insertCatError) {
              categoriesCreated++;
            }
          } else if (!catCheckError) {
            categoriesCreated++;
          }
        }

        if (categoriesCreated > 0) {
          results.defaultData.categories = true;
          console.log(`   ✅ ${categoriesCreated} categories configured`);
        }
      } catch (err) {
        results.errors.push(`Categories creation error: ${err.message}`);
      }

      // Insert admin user
      try {
        const { data: existingUser, error: userCheckError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', 'admin@laeconomica.com')
          .single();

        if (userCheckError && userCheckError.code === 'PGRST116') {
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

          if (!insertUserError) {
            results.defaultData.adminUser = true;
            console.log("   ✅ Admin user created");
          }
        } else if (!userCheckError) {
          results.defaultData.adminUser = true;
          console.log("   ✅ Admin user already exists");
        }
      } catch (err) {
        results.errors.push(`Admin user creation error: ${err.message}`);
      }
    }

    // Final assessment
    results.success = results.tablesCreated.length >= 6; // At least core tables

    if (results.success) {
      console.log("🎉 Database schema created successfully!");
      
      res.json({
        success: true,
        message: "Database schema created successfully!",
        tablesCreated: results.tablesCreated,
        defaultData: results.defaultData,
        errors: results.errors,
        adminCredentials: {
          email: "admin@laeconomica.com",
          password: "admin123"
        }
      });
    } else {
      console.log("⚠️  Schema creation incomplete");
      
      res.status(206).json({
        success: false,
        message: "Schema creation incomplete - manual setup required",
        tablesCreated: results.tablesCreated,
        errors: results.errors,
        manualInstructions: [
          "Go to Supabase Dashboard SQL Editor: https://app.supabase.com/project/evyslzzekjrskeyparqn/sql",
          "Copy SQL from code/database/schema.sql",
          "Paste and execute in the SQL editor",
          "All tables will be created automatically"
        ]
      });
    }

  } catch (error) {
    console.error("❌ Schema creation failed:", error.message);
    
    res.status(500).json({
      success: false,
      message: "Schema creation failed",
      error: error.message,
      manualInstructions: [
        "Go to Supabase Dashboard SQL Editor: https://app.supabase.com/project/evyslzzekjrskeyparqn/sql",
        "Copy SQL from code/database/schema.sql",
        "Paste and execute in the SQL editor"
      ]
    });
  }
});

export default router;
