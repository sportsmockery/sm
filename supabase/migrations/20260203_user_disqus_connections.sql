-- Migration: Create user_disqus_connections table
-- Date: 2026-02-03
-- Description: Stores Disqus OAuth connections for users to enable commenting

-- Create table for storing Disqus connections
CREATE TABLE IF NOT EXISTS user_disqus_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    disqus_user_id TEXT NOT NULL,
    disqus_username TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    connected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_disqus_connections_user_id ON user_disqus_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_disqus_connections_disqus_user_id ON user_disqus_connections(disqus_user_id);

-- Enable Row Level Security
ALTER TABLE user_disqus_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own Disqus connection
CREATE POLICY "Users can view own disqus connection"
    ON user_disqus_connections
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own disqus connection"
    ON user_disqus_connections
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own disqus connection"
    ON user_disqus_connections
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own disqus connection"
    ON user_disqus_connections
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_disqus_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_user_disqus_connections_updated_at ON user_disqus_connections;
CREATE TRIGGER trigger_update_user_disqus_connections_updated_at
    BEFORE UPDATE ON user_disqus_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_user_disqus_connections_updated_at();

-- Comment on table
COMMENT ON TABLE user_disqus_connections IS 'Stores Disqus OAuth tokens for users to enable commenting on articles';
COMMENT ON COLUMN user_disqus_connections.user_id IS 'References auth.users - the SM user';
COMMENT ON COLUMN user_disqus_connections.disqus_user_id IS 'The user ID from Disqus';
COMMENT ON COLUMN user_disqus_connections.disqus_username IS 'The username from Disqus';
COMMENT ON COLUMN user_disqus_connections.access_token IS 'OAuth access token for Disqus API';
COMMENT ON COLUMN user_disqus_connections.refresh_token IS 'OAuth refresh token for Disqus API';
COMMENT ON COLUMN user_disqus_connections.expires_at IS 'When the access token expires';
