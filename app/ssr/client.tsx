import { createClient } from "@supabase/supabase-js";

export function createServerSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase URL or Service Role Key is missing");
    throw new Error("Supabase URL or Service Role Key is missing");
  }
  
  // Create the Supabase client with the service role key for server operations
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-skip-types-conversion': 'true',
        },
      },
    }
  );
}
