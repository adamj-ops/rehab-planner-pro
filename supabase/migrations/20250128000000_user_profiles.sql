-- ============================================================================
-- USER PROFILES TABLE MIGRATION
-- ============================================================================
-- This migration creates the user_profiles table for storing extended user
-- information beyond what Supabase Auth provides.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Table: user_profiles
-- Extended user profile data
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Basic Info
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(200),

  -- Contact
  phone VARCHAR(50),

  -- Professional
  company VARCHAR(200),
  job_title VARCHAR(200),

  -- Location
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),

  -- Profile
  bio TEXT,
  avatar_url VARCHAR(500),

  -- Preferences
  timezone VARCHAR(100) DEFAULT 'America/Chicago',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profile_user ON user_profiles(user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security Policies
-- ---------------------------------------------------------------------------
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Trigger for updated_at
-- ---------------------------------------------------------------------------
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Function to auto-create profile on user signup
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- Trigger for auto-creating profile on signup
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- Storage bucket for avatars (if using Supabase Storage)
-- Note: This requires running via Supabase Dashboard or CLI
-- ---------------------------------------------------------------------------
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;
