import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
  const missing = [];
  if (!supabaseUrl) missing.push("SUPABASE_URL");
  if (!supabaseKey) missing.push("SUPABASE_ANON_KEY");
  if (!supabaseServiceKey) missing.push("SUPABASE_SERVICE_KEY");

  throw new Error(
    `Missing required Supabase environment variables: ${missing.join(", ")}`,
  );
}

let supabase = null;
let supabaseAdmin = null;

try {
  // Client for general operations
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  // Admin client for service operations
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log("✅ Supabase clients initialized successfully");
} catch (error) {
  console.error("❌ Supabase initialization failed:", error.message);
  throw error;
}

export { supabase, supabaseAdmin };
