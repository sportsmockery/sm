-- SportsMockery Team Chat System - Database Schema
-- Run this migration to set up all chat tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CHAT ROOMS - Team-based chat rooms
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_slug VARCHAR(50) UNIQUE NOT NULL,
  team_name VARCHAR(100) NOT NULL,
  team_color VARCHAR(7) DEFAULT '#0B162A',
  is_active BOOLEAN DEFAULT true,
  slow_mode_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-seed Chicago teams
INSERT INTO chat_rooms (team_slug, team_name, team_color) VALUES
  ('bears', 'Chicago Bears', '#0B162A'),
  ('cubs', 'Chicago Cubs', '#0E3386'),
  ('bulls', 'Chicago Bulls', '#CE1141'),
  ('white-sox', 'Chicago White Sox', '#27251F'),
  ('blackhawks', 'Chicago Blackhawks', '#CF0A2C'),
  ('fire', 'Chicago Fire', '#7B1113'),
  ('sky', 'Chicago Sky', '#5091CD')
ON CONFLICT (team_slug) DO NOTHING;

-- =====================================================
-- CHAT USERS - Extended user profiles for chat
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  badge VARCHAR(50), -- staff, moderator, ai, verified, og_fan, contributor
  reputation_score INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT false,
  muted_until TIMESTAMPTZ,
  warning_count INTEGER DEFAULT 0,
  mute_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- CHAT MESSAGES - Public room messages
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(20) DEFAULT 'text', -- text, gif, emoji
  gif_url TEXT,
  reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  moderation_status VARCHAR(20) DEFAULT 'approved', -- approved, pending, blocked, shadow_blocked
  moderation_score DECIMAL(3,2) DEFAULT 0,
  moderation_flags TEXT[],
  reaction_counts JSONB DEFAULT '{}',
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_highlighted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_moderation ON chat_messages(moderation_status);

-- =====================================================
-- CHAT REACTIONS - Emoji reactions on messages
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_chat_reactions_message ON chat_reactions(message_id);

-- =====================================================
-- CHAT DM CONVERSATIONS - Direct message metadata
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_dm_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 UUID NOT NULL,
  participant_2 UUID NOT NULL,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  unread_count_1 INTEGER DEFAULT 0, -- Unread for participant_1
  unread_count_2 INTEGER DEFAULT 0, -- Unread for participant_2
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
);

CREATE INDEX IF NOT EXISTS idx_dm_conversations_p1 ON chat_dm_conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_dm_conversations_p2 ON chat_dm_conversations(participant_2);

-- =====================================================
-- CHAT DM MESSAGES - Direct messages
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_dm_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES chat_dm_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(20) DEFAULT 'text',
  gif_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dm_messages_conversation ON chat_dm_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_dm_messages_created ON chat_dm_messages(created_at DESC);

-- =====================================================
-- CHAT USER BLOCKS - Blocked users
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_user_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- =====================================================
-- CHAT REPORTS - User reports
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL,
  reported_user_id UUID,
  message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  reason VARCHAR(100) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CHAT MODERATION RULES - Configurable rules
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_moderation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL, -- profanity, hate_speech, violence, nudity, gambling, etc.
  pattern TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL, -- critical, high, medium, low
  action VARCHAR(20) NOT NULL, -- ban, block, shadow_block, warn
  ban_duration_hours INTEGER,
  is_regex BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_rules_category ON chat_moderation_rules(category);
CREATE INDEX IF NOT EXISTS idx_moderation_rules_active ON chat_moderation_rules(is_active);

-- =====================================================
-- CHAT MODERATION LOG - Moderation actions
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_moderation_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  action VARCHAR(20) NOT NULL,
  reason TEXT,
  flags TEXT[],
  score DECIMAL(3,2),
  moderator_id UUID, -- NULL if automated
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_log_user ON chat_moderation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_log_created ON chat_moderation_log(created_at DESC);

-- =====================================================
-- CHAT PRESENCE - Online users
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT true,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, room_id)
);

CREATE INDEX IF NOT EXISTS idx_presence_room ON chat_presence(room_id);
CREATE INDEX IF NOT EXISTS idx_presence_online ON chat_presence(is_online);

-- =====================================================
-- CHAT HIGHLIGHTS - Trending/pinned messages
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  highlight_type VARCHAR(20) NOT NULL, -- pinned, trending, staff_pick
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(message_id, highlight_type)
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_dm_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_dm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_moderation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_moderation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_highlights ENABLE ROW LEVEL SECURITY;

-- chat_rooms: Public read
CREATE POLICY "chat_rooms_public_read" ON chat_rooms
  FOR SELECT USING (true);

-- chat_users: Public read, users update own
CREATE POLICY "chat_users_public_read" ON chat_users
  FOR SELECT USING (true);

CREATE POLICY "chat_users_own_update" ON chat_users
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "chat_users_insert" ON chat_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- chat_messages: Public read approved, authenticated insert
CREATE POLICY "chat_messages_read_approved" ON chat_messages
  FOR SELECT USING (
    moderation_status = 'approved'
    OR moderation_status = 'pending'
    OR user_id = auth.uid()
  );

CREATE POLICY "chat_messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "chat_messages_own_update" ON chat_messages
  FOR UPDATE USING (user_id = auth.uid());

-- chat_reactions: Public read, authenticated insert/delete
CREATE POLICY "chat_reactions_public_read" ON chat_reactions
  FOR SELECT USING (true);

CREATE POLICY "chat_reactions_insert" ON chat_reactions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "chat_reactions_own_delete" ON chat_reactions
  FOR DELETE USING (user_id = auth.uid());

-- chat_dm_conversations: Only participants
CREATE POLICY "dm_conversations_participants" ON chat_dm_conversations
  FOR ALL USING (
    auth.uid() = participant_1 OR auth.uid() = participant_2
  );

-- chat_dm_messages: Only participants
CREATE POLICY "dm_messages_participants" ON chat_dm_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_dm_conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

CREATE POLICY "dm_messages_insert" ON chat_dm_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_dm_conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- chat_user_blocks: Own blocks only
CREATE POLICY "user_blocks_own" ON chat_user_blocks
  FOR ALL USING (blocker_id = auth.uid());

-- chat_reports: Own reports only
CREATE POLICY "reports_own" ON chat_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "reports_read_own" ON chat_reports
  FOR SELECT USING (reporter_id = auth.uid());

-- chat_moderation_rules: Service role only (no public access)
-- Access via API with service role key

-- chat_moderation_log: Service role only
-- Access via API with service role key

-- chat_presence: Public read, own update
CREATE POLICY "presence_public_read" ON chat_presence
  FOR SELECT USING (true);

CREATE POLICY "presence_own_manage" ON chat_presence
  FOR ALL USING (user_id = auth.uid());

-- chat_highlights: Public read
CREATE POLICY "highlights_public_read" ON chat_highlights
  FOR SELECT USING (true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update reaction counts on a message
CREATE OR REPLACE FUNCTION update_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE chat_messages
    SET reaction_counts = (
      SELECT jsonb_object_agg(emoji, count)
      FROM (
        SELECT emoji, COUNT(*) as count
        FROM chat_reactions
        WHERE message_id = NEW.message_id
        GROUP BY emoji
      ) counts
    )
    WHERE id = NEW.message_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE chat_messages
    SET reaction_counts = (
      SELECT COALESCE(jsonb_object_agg(emoji, count), '{}'::jsonb)
      FROM (
        SELECT emoji, COUNT(*) as count
        FROM chat_reactions
        WHERE message_id = OLD.message_id
        GROUP BY emoji
      ) counts
    )
    WHERE id = OLD.message_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reaction_counts
AFTER INSERT OR DELETE ON chat_reactions
FOR EACH ROW EXECUTE FUNCTION update_reaction_counts();

-- Function to update user message stats
CREATE OR REPLACE FUNCTION update_user_message_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_users
  SET
    message_count = message_count + 1,
    last_message_at = NOW()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_stats
AFTER INSERT ON chat_messages
FOR EACH ROW EXECUTE FUNCTION update_user_message_stats();

-- =====================================================
-- ENABLE REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_dm_messages;
