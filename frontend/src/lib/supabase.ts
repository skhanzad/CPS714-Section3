import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zgughkuatbflarqipgyj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndWdoa3VhdGJmbGFycWlwZ3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4Nzk5NDAsImV4cCI6MjA3ODQ1NTk0MH0.fFCkPXPtYPrUPujp-7M1XuZRbfbUaV5juwNYOR1kTs0";

// Keep the client untyped here to avoid overly-strict generated type inference impacting simple UI calls.
// The `Database` type is still exported for explicit typing elsewhere when useful.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          emergency_contact: string;
          fitness_goals: string;
          profile_picture_url: string;
          is_staff: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      membership_tiers: {
        Row: {
          id: string;
          name: string;
          price_monthly: number;
          price_annual: number;
          max_classes_per_month: number;
          can_book_premium_classes: boolean;
          created_at: string;
        };
      };
      membership_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier_id: string;
          status: string;
          billing_cycle: string;
          start_date: string;
          renewal_date: string;
          stripe_subscription_id: string;
          created_at: string;
          updated_at: string;
        };
      };
      fitness_classes: {
        Row: {
          id: string;
          name: string;
          description: string;
          instructor_name: string;
          duration_minutes: number;
          capacity: number;
          is_premium: boolean;
          created_at: string;
        };
      };
      class_schedules: {
        Row: {
          id: string;
          class_id: string;
          scheduled_date: string;
          start_time: string;
          end_time: string;
          status: string;
          current_bookings: number;
          created_at: string;
        };
      };
      class_bookings: {
        Row: {
          id: string;
          user_id: string;
          schedule_id: string;
          status: string;
          booked_at: string;
          cancelled_at: string | null;
        };
      };
      community_challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          challenge_type: string;
          target_value: number;
          start_date: string;
          end_date: string;
          created_by: string | null;
          is_active: boolean;
          created_at: string;
        };
      };
      activity_feed: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          content: string;
          metadata: any;
          created_at: string;
        };
      };
    };
  };
};
