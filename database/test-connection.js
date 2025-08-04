import { supabase, supabaseAdmin } from "../backend/config/supabase.js";

async function testConnection() {
  console.log("🔍 Testing Supabase connection...");
  
  try {
    // Test basic connection with a simple query
    console.log("\n1. Testing basic connection...");
    const { data, error } = await supabase.rpc('get_current_user');

    if (error && !error.message.includes('function get_current_user() does not exist')) {
      throw new Error(`Basic connection failed: ${error.message}`);
    }
    console.log("✅ Basic connection successful");

    // Test admin connection
    console.log("\n2. Testing admin connection...");
    const { data: adminData, error: adminError } = await supabaseAdmin.rpc('get_current_user');

    if (adminError && !adminError.message.includes('function get_current_user() does not exist')) {
      throw new Error(`Admin connection failed: ${adminError.message}`);
    }
    console.log("✅ Admin connection successful");

    // List existing tables using SQL query
    console.log("\n3. Checking existing tables...");
    const { data: tables, error: tablesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    });

    let tableList = [];
    if (tablesError) {
      console.warn("⚠️  Could not list tables:", tablesError.message);
      console.log("   Using direct table checks instead...");
    } else {
      console.log("📋 Existing tables:");
      if (!tables || tables.length === 0) {
        console.log("   (No tables found - database needs to be set up)");
      } else {
        if (Array.isArray(tables)) {
          tables.forEach(table => {
            console.log(`   - ${table.table_name}`);
            tableList.push(table.table_name);
          });
        } else if (tables.table_name) {
          console.log(`   - ${tables.table_name}`);
          tableList.push(tables.table_name);
        }
      }
    }

    // Test essential tables if they exist
    const essentialTables = ["users", "products", "sales", "stores"];
    console.log("\n4. Testing essential tables...");
    
    for (const tableName of essentialTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .limit(1);

        if (error) {
          console.log(`   ❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`   ✅ ${tableName}: OK (${data.length} records)`);
        }
      } catch (err) {
        console.log(`   ❌ ${tableName}: ${err.message}`);
      }
    }

    console.log("\n🎉 Connection test completed!");
    
    // Check if setup is needed
    const setupNeeded = tableList.length === 0 || !tableList.includes("users");
    if (setupNeeded) {
      console.log("\n💡 Next steps:");
      console.log("1. Run: npm run db:setup");
      console.log("2. Or manually execute SQL from database/schema.sql");
    } else {
      console.log("\n✅ Database appears to be set up and ready!");
    }

    return true;
  } catch (error) {
    console.error("\n❌ Connection test failed:");
    console.error("Error:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check your .env file has correct Supabase credentials");
    console.log("2. Verify SUPABASE_URL and SUPABASE_ANON_KEY are set");
    console.log("3. Ensure SUPABASE_SERVICE_KEY is set for admin operations");
    console.log("4. Check Supabase project is active and accessible");
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnection()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error("💥 Unexpected error:", error);
      process.exit(1);
    });
}

export default testConnection;
