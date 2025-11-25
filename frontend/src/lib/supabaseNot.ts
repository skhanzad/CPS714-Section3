import { createClient } from '@supabase/supabase-js';

const supabaseUrlN = "https://zgughkuatbflarqipgyj.supabase.co";
const supabaseAnonKeyN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndWdoa3VhdGJmbGFycWlwZ3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4Nzk5NDAsImV4cCI6MjA3ODQ1NTk0MH0.fFCkPXPtYPrUPujp-7M1XuZRbfbUaV5juwNYOR1kTs0";

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
