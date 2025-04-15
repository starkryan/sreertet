import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          'x-skip-types-conversion': 'true',
        },
      },
      async accessToken() {
        return (await auth()).getToken();
      },
    }
  );
}
