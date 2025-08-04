import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

async function simpleTest() {
  console.log("🔍 Testing Supabase connection...");
  console.log(`📍 URL: ${supabaseUrl}`);
  console.log(`🔑 Anon Key: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`🛡️  Service Key: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`);

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error("❌ Missing required environment variables");
    return false;
  }

  try {
    // Create clients
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log("\n1. Testing basic client...");
    
    // Try to create a simple table to test write access
    const testTableSQL = `
      CREATE TABLE IF NOT EXISTS connection_test (
        id SERIAL PRIMARY KEY,
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    // Use supabaseAdmin for DDL operations
    let { data: createResult, error: createError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: testTableSQL 
    });
    
    // If exec_sql doesn't exist, that's fine - we'll try direct table operations
    if (createError && createError.message.includes('function exec_sql')) {
      console.log("⚠️  exec_sql function not available, trying direct operations...");
      
      // Try to access an existing table or create a simple one
      const { data: testData, error: testError } = await supabaseAdmin
        .from('connection_test')
        .select('*')
        .limit(1);
        
      if (testError && testError.message.includes('relation "connection_test" does not exist')) {
        console.log("✅ Connection successful - database is empty and ready for setup");
        return true;
      } else if (testError) {
        console.error("❌ Connection test failed:", testError.message);
        return false;
      } else {
        console.log("✅ Connection successful - found existing data");
        return true;
      }
    } else if (createError) {
      console.error("❌ Database operation failed:", createError.message);
      return false;
    } else {
      console.log("✅ Database connection and operations successful!");
      
      // Clean up test table
      await supabaseAdmin.rpc('exec_sql', { 
        sql: 'DROP TABLE IF EXISTS connection_test;' 
      });
      
      return true;
    }
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  simpleTest()
    .then(success => {
      if (success) {
        console.log("\n🎉 Supabase connection successful!");
        console.log("💡 Ready to run: npm run db:setup");
      } else {
        console.log("\n💥 Connection failed - check your credentials");
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error("💥 Unexpected error:", error);
      process.exit(1);
    });
}

export default simpleTest;
