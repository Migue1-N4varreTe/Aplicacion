import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.log("Required variables:");
  console.log("- SUPABASE_URL");
  console.log("- SUPABASE_SERVICE_KEY");
  process.exit(1);
}

// Create admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log("🚀 Starting database setup...");

    // Test connection
    console.log("🔍 Testing database connection...");
    const { data, error: connectionError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .limit(1);

    if (connectionError) {
      throw new Error(`Connection failed: ${connectionError.message}`);
    }

    console.log("✅ Database connection successful");

    // Read schema SQL file
    const schemaPath = path.join(process.cwd(), "database", "schema.sql");
    console.log("📄 Reading schema file...");
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error("Schema file not found at: " + schemaPath);
    }

    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    console.log("✅ Schema file loaded");

    // Execute schema
    console.log("🏗️  Creating database schema...");
    
    // Split SQL commands and execute them one by one
    const sqlCommands = schemaSql
      .split(";")
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith("--"));

    let successCount = 0;
    let skipCount = 0;

    for (const command of sqlCommands) {
      try {
        const { error } = await supabaseAdmin.rpc("exec_sql", {
          sql: command + ";"
        });

        if (error) {
          // Skip if table already exists or similar non-critical errors
          if (error.message.includes("already exists") || 
              error.message.includes("does not exist") ||
              error.message.includes("permission denied")) {
            skipCount++;
            console.log(`⏭️  Skipped: ${error.message.substring(0, 100)}...`);
          } else {
            throw error;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        console.warn(`⚠️  Command skipped: ${err.message.substring(0, 100)}...`);
        skipCount++;
      }
    }

    console.log(`✅ Schema setup completed:`);
    console.log(`   - Successful commands: ${successCount}`);
    console.log(`   - Skipped commands: ${skipCount}`);

    // Verify tables were created
    console.log("🔍 Verifying database tables...");
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .order("table_name");

    if (tablesError) {
      throw tablesError;
    }

    console.log("📋 Database tables found:");
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // Test a simple query
    console.log("🧪 Testing basic operations...");
    const { data: storeData, error: storeError } = await supabaseAdmin
      .from("stores")
      .select("*")
      .limit(1);

    if (storeError) {
      throw storeError;
    }

    console.log("✅ Database is ready for use!");
    console.log("🏪 Default store configured:", storeData[0]?.name || "No stores found");

    return true;
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    console.error("Stack trace:", error.stack);
    return false;
  }
}

// Alternative method if RPC doesn't work
async function setupDatabaseAlternative() {
  try {
    console.log("🔄 Trying alternative setup method...");
    
    // Create essential tables manually using Supabase client
    const tables = [
      {
        name: "stores",
        query: `
          CREATE TABLE IF NOT EXISTS stores (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            address TEXT NOT NULL,
            phone VARCHAR(20),
            email VARCHAR(255),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `
      },
      {
        name: "users",
        query: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            phone VARCHAR(20),
            address TEXT,
            role VARCHAR(20) DEFAULT 'cashier',
            permissions JSONB DEFAULT '[]',
            store_id UUID,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `
      }
    ];

    for (const table of tables) {
      console.log(`Creating table: ${table.name}`);
      // This would require manual execution in Supabase dashboard
      console.log("SQL:", table.query);
    }

    console.log("⚠️  Manual setup required - please execute SQL commands in Supabase dashboard");
    return false;
  } catch (error) {
    console.error("❌ Alternative setup failed:", error.message);
    return false;
  }
}

// Export for use in other scripts
export { setupDatabase, setupDatabaseAlternative };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(success => {
      if (!success) {
        console.log("\n💡 If automatic setup failed, you can:");
        console.log("1. Copy the SQL from database/schema.sql");
        console.log("2. Execute it manually in your Supabase SQL editor");
        console.log("3. Run this script again to verify the setup");
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error("💥 Unexpected error:", error);
      process.exit(1);
    });
}
