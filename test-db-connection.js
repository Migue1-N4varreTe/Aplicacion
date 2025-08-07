// Simple database connection test
import { supabase, supabaseAdmin } from "./backend/config/supabase.js";

async function testDatabaseConnection() {
  console.log("🔍 Testing database connection...");
  
  try {
    // Test if we can perform a simple operation
    console.log("1. Testing basic query...");
    
    // Try to query an existing table or handle the error gracefully
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation "stores" does not exist')) {
        console.log("⚠️  Database is empty (tables don't exist yet)");
        console.log("✅ But connection is working!");
        
        console.log("\n📋 Next steps:");
        console.log("1. Go to your Supabase dashboard: https://app.supabase.com/project/evyslzzekjrskeyparqn");
        console.log("2. Navigate to SQL Editor");
        console.log("3. Copy and paste the contents of code/database/schema.sql");
        console.log("4. Execute the SQL to create all tables");
        console.log("5. Your database will be ready!");
        
        return { connected: true, tablesExist: false };
      } else {
        throw error;
      }
    } else {
      console.log("✅ Connection successful!");
      console.log(`📊 Found store data: ${data?.length || 0} records`);
      
      // Test admin connection
      console.log("\n2. Testing admin connection...");
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('stores')
        .select('*')
        .limit(1);
      
      if (adminError) {
        console.log("⚠️  Admin connection issue:", adminError.message);
      } else {
        console.log("✅ Admin connection successful!");
      }
      
      return { connected: true, tablesExist: true };
    }
    
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error("Error:", error.message);
    
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check environment variables are set correctly");
    console.log("2. Verify Supabase project is active");
    console.log("3. Check API keys have correct permissions");
    
    return { connected: false, tablesExist: false };
  }
}

testDatabaseConnection()
  .then(result => {
    if (result.connected) {
      console.log("\n🎉 Database connection test completed successfully!");
      if (result.tablesExist) {
        console.log("🏆 Your database is ready to use!");
      } else {
        console.log("⚡ Database is connected but needs schema setup");
      }
    } else {
      console.log("\n💥 Database connection failed");
    }
  })
  .catch(error => {
    console.error("💥 Unexpected error:", error);
  });
