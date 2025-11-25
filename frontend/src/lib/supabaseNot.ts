import { createClient } from '@supabase/supabase-js';

const supabaseUrlN = import.meta.env.VITE_SUPABASE_URLn;
const supabaseAnonKeyN = import.meta.env.VITE_SUPABASE_ANON_KEYn;

// Keep the client untyped here to avoid overly-strict generated type inference impacting simple UI calls.
export const supabaseN = createClient(supabaseUrlN, supabaseAnonKeyN);

export type DatabaseN = {
  public: {
    Tables: {
      notifications: {
        Row: {
          id: string;
          title: string;
          body: string;
          author: string | null;
          member_cat: string | null;
          end_time: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
