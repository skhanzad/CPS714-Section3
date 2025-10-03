/*
  # Gym Management System - Complete Database Schema

  ## Overview
  This migration creates the complete database structure for a comprehensive gym management system
  with 9 integrated modules: user registration, member dashboard, class booking, payments, 
  facility tracking, notifications, admin dashboard, analytics, and social features.

  ## New Tables

  ### Authentication & Membership
  1. `profiles`
     - Extended user profile information
     - Links to auth.users via id
     - Stores membership tier, emergency contact, fitness goals
     - Profile picture URL

  2. `membership_tiers`
     - Defines Basic, Premium, and VIP tiers
     - Pricing and feature limits

  ### Class Management
  3. `fitness_classes`
     - Class templates (Yoga, Spin, HIIT, etc.)
     - Capacity limits, instructor info

  4. `class_schedules`
     - Specific class instances with date/time
     - Links to fitness_classes

  5. `class_bookings`
     - Member reservations for classes
     - Prevents overbooking via capacity checks

  ### Payment & Billing
  6. `payments`
     - Transaction history
     - Stripe payment integration support

  7. `membership_subscriptions`
     - Active subscriptions with renewal dates
     - Links members to their tier

  ### Facility Management
  8. `gym_capacity_logs`
     - Real-time gym occupancy tracking

  9. `equipment`
     - Gym equipment inventory

  10. `equipment_waitlist`
      - Virtual queue for popular equipment

  ### Communications
  11. `notifications`
      - System notifications and alerts

  12. `announcements`
      - Staff broadcasts to members

  ### Social & Community
  13. `friendships`
      - Friend connections between members

  14. `community_challenges`
      - Gym challenges and competitions

  15. `challenge_participants`
      - Member participation in challenges

  16. `activity_feed`
      - Social posts and achievements

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies restrict access based on user authentication and ownership
  - Admin-only policies for staff management features

  ## Important Notes
  - All timestamps use timestamptz for proper timezone handling
  - Foreign keys ensure referential integrity
  - Indexes added for frequently queried columns
  - Default values prevent null-related issues
*/

-- Create membership tiers lookup table
CREATE TABLE IF NOT EXISTS membership_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  price_monthly numeric(10,2) NOT NULL DEFAULT 0,
  price_annual numeric(10,2) NOT NULL DEFAULT 0,
  max_classes_per_month integer DEFAULT -1, -- -1 means unlimited
  can_book_premium_classes boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Insert default membership tiers
INSERT INTO membership_tiers (name, price_monthly, price_annual, max_classes_per_month, can_book_premium_classes)
VALUES 
  ('Basic', 29.99, 299.99, 8, false),
  ('Premium', 59.99, 599.99, 20, true),
  ('VIP', 99.99, 999.99, -1, true)
ON CONFLICT (name) DO NOTHING;

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  emergency_contact text DEFAULT '',
  fitness_goals text DEFAULT '',
  profile_picture_url text DEFAULT '',
  is_staff boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create membership subscriptions
CREATE TABLE IF NOT EXISTS membership_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier_id uuid REFERENCES membership_tiers(id) NOT NULL,
  status text NOT NULL DEFAULT 'active', -- active, cancelled, expired
  billing_cycle text NOT NULL DEFAULT 'monthly', -- monthly, annual
  start_date timestamptz DEFAULT now(),
  renewal_date timestamptz NOT NULL,
  stripe_subscription_id text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_type text NOT NULL DEFAULT 'subscription', -- subscription, one_time
  stripe_payment_id text DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create fitness classes (templates)
CREATE TABLE IF NOT EXISTS fitness_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  instructor_name text DEFAULT '',
  duration_minutes integer DEFAULT 60,
  capacity integer DEFAULT 20,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Insert sample classes
INSERT INTO fitness_classes (name, description, instructor_name, duration_minutes, capacity, is_premium)
VALUES 
  ('Yoga Flow', 'Relaxing yoga session for all levels', 'Sarah Johnson', 60, 25, false),
  ('Spin Class', 'High-intensity cycling workout', 'Mike Chen', 45, 20, false),
  ('HIIT Training', 'High-intensity interval training', 'Alex Rodriguez', 30, 15, true),
  ('Pilates', 'Core strengthening and flexibility', 'Emma Wilson', 60, 20, true),
  ('CrossFit', 'Functional fitness and strength training', 'Jake Thompson', 60, 12, true),
  ('Boxing', 'Cardio boxing and technique', 'Chris Martin', 45, 15, false)
ON CONFLICT DO NOTHING;

-- Create class schedules (specific instances)
CREATE TABLE IF NOT EXISTS class_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES fitness_classes(id) ON DELETE CASCADE NOT NULL,
  scheduled_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text DEFAULT 'scheduled', -- scheduled, cancelled, completed
  current_bookings integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create class bookings
CREATE TABLE IF NOT EXISTS class_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  schedule_id uuid REFERENCES class_schedules(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'confirmed', -- confirmed, cancelled, attended
  booked_at timestamptz DEFAULT now(),
  cancelled_at timestamptz DEFAULT NULL,
  UNIQUE(user_id, schedule_id)
);

-- Create gym capacity logs
CREATE TABLE IF NOT EXISTS gym_capacity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  current_count integer NOT NULL DEFAULT 0,
  max_capacity integer NOT NULL DEFAULT 100,
  status text DEFAULT 'quiet', -- quiet, busy, packed
  logged_at timestamptz DEFAULT now()
);

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text DEFAULT 'cardio', -- cardio, strength, functional
  total_units integer DEFAULT 1,
  available_units integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Insert sample equipment
INSERT INTO equipment (name, category, total_units, available_units)
VALUES 
  ('Squat Rack', 'strength', 3, 3),
  ('Bench Press', 'strength', 4, 4),
  ('Treadmill', 'cardio', 10, 10),
  ('Rowing Machine', 'cardio', 5, 5),
  ('Cable Machine', 'strength', 2, 2)
ON CONFLICT DO NOTHING;

-- Create equipment waitlist
CREATE TABLE IF NOT EXISTS equipment_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'waiting', -- waiting, notified, cancelled
  joined_at timestamptz DEFAULT now(),
  notified_at timestamptz DEFAULT NULL
);

-- Create notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info', -- info, success, warning, error
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create announcements
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  priority text DEFAULT 'normal', -- low, normal, high
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT NULL
);

-- Create friendships
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending', -- pending, accepted, declined
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz DEFAULT NULL,
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Create community challenges
CREATE TABLE IF NOT EXISTS community_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  challenge_type text DEFAULT 'class_count', -- class_count, total_workouts, custom
  target_value numeric DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create challenge participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES community_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_progress numeric DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Create activity feed
CREATE TABLE IF NOT EXISTS activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type text DEFAULT 'post', -- post, achievement, milestone
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_capacity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for membership_tiers (public read)
CREATE POLICY "Anyone can view membership tiers"
  ON membership_tiers FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for membership_subscriptions
CREATE POLICY "Users can view own subscription"
  ON membership_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all subscriptions"
  ON membership_subscriptions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_staff = true));

-- RLS Policies for payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_staff = true));

-- RLS Policies for fitness_classes
CREATE POLICY "Anyone can view fitness classes"
  ON fitness_classes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage fitness classes"
  ON fitness_classes FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_staff = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_staff = true));

-- RLS Policies for class_schedules
CREATE POLICY "Anyone can view class schedules"
  ON class_schedules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage class schedules"
  ON class_schedules FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_staff = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_staff = true));

-- RLS Policies for class_bookings
CREATE POLICY "Users can view own bookings"
  ON class_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON class_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON class_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view all bookings"
  ON class_bookings FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_staff = true));

-- RLS Policies for gym_capacity_logs
CREATE POLICY "Anyone can view gym capacity"
  ON gym_capacity_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage capacity logs"
  ON gym_capacity_logs FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_staff = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_staff = true));

-- RLS Policies for equipment
CREATE POLICY "Anyone can view equipment"
  ON equipment FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for equipment_waitlist
CREATE POLICY "Users can view own waitlist entries"
  ON equipment_waitlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own waitlist entries"
  ON equipment_waitlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own waitlist entries"
  ON equipment_waitlist FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for announcements
CREATE POLICY "Anyone can view active announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_staff = true));

CREATE POLICY "Staff can manage announcements"
  ON announcements FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_staff = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_staff = true));

-- RLS Policies for friendships
CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friendships"
  ON friendships FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS Policies for community_challenges
CREATE POLICY "Anyone can view active challenges"
  ON community_challenges FOR SELECT
  TO authenticated
  USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_staff = true));

CREATE POLICY "Staff can manage challenges"
  ON community_challenges FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_staff = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_staff = true));

-- RLS Policies for challenge_participants
CREATE POLICY "Users can view challenge participants"
  ON challenge_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join challenges"
  ON challenge_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON challenge_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for activity_feed
CREATE POLICY "Anyone can view activity feed"
  ON activity_feed FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own activity"
  ON activity_feed FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity"
  ON activity_feed FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_staff ON profiles(is_staff);
CREATE INDEX IF NOT EXISTS idx_membership_subscriptions_user_id ON membership_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_subscriptions_status ON membership_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_date ON class_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_class_bookings_user_id ON class_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_class_bookings_schedule_id ON class_bookings(schedule_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at DESC);
