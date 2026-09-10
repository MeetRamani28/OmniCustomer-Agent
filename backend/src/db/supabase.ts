import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl =
  process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "placeholder_key";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function verifySupabaseConnection() {
  console.log("[Supabase] Verifying cloud PostgreSQL connection...");
  try {
    const { data, error } = await supabase
      .from("interactions")
      .select("id")
      .limit(1);
    if (error) {
      console.warn(
        "[Supabase] Connection warning (expected if credentials are placeholders):",
        error.message,
      );
    } else {
      console.log(
        "[Supabase] Connection verified successfully. Cloud PG ready.",
      );
    }
  } catch (err) {
    console.error("[Supabase] Connection failure:", err);
  }
}
