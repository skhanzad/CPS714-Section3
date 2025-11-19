import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

let client: SupabaseClient | null = null;

export function assertSupabaseConfigured() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local."
    );
  }
}

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    assertSupabaseConfigured();
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}



