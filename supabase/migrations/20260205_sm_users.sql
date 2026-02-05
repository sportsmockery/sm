-- Create sm_users table for user management
-- This table stores user profiles synced from Supabase Auth

CREATE TABLE IF NOT EXISTS public.sm_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'fan',
  avatar_url TEXT,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_fan_council_member BOOLEAN DEFAULT FALSE,
  reputation_score INTEGER DEFAULT 0
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_sm_users_email ON public.sm_users(email);

-- Create index for role queries
CREATE INDEX IF NOT EXISTS idx_sm_users_role ON public.sm_users(role);

-- Enable RLS
ALTER TABLE public.sm_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.sm_users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Admins can read all profiles
CREATE POLICY "Admins can view all profiles" ON public.sm_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sm_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can insert users
CREATE POLICY "Admins can create users" ON public.sm_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sm_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update users
CREATE POLICY "Admins can update users" ON public.sm_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.sm_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can delete users
CREATE POLICY "Admins can delete users" ON public.sm_users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.sm_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role bypass (for API operations)
-- The service role key bypasses RLS automatically

-- Comment describing the table
COMMENT ON TABLE public.sm_users IS 'User profiles for Sports Mockery, synced from Supabase Auth';
