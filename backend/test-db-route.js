import express from "express";
import { supabase, supabaseAdmin } from "./config/supabase.js";

const router = express.Router();

// Database test endpoint
router.get("/db-test", async (req, res) => {
  try {
    console.log("🔍 Testing database connection via API...");
    
    // Test basic connection
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation "stores" does not exist')) {
        return res.json({
          status: "connected_no_tables",
          message: "Database connected but tables don't exist",
          connected: true,
          tablesExist: false,
          nextSteps: [
            "Go to Supabase Dashboard SQL Editor",
            "Execute SQL from database/schema.sql",
            "Tables will be created automatically"
          ]
        });
      } else {
        throw error;
      }
    }
    
    // Test admin connection
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .limit(1);
    
    const result = {
      status: "success",
      message: "Database fully operational",
      connected: true,
      tablesExist: true,
      storeCount: data?.length || 0,
      adminAccess: !adminError,
      timestamp: new Date().toISOString()
    };
    
    console.log("✅ Database test successful:", result);
    res.json(result);
    
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error.message,
      connected: false,
      tablesExist: false
    });
  }
});

export default router;
