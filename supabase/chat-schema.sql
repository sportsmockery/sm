-- =====================================================
-- TEAM CHAT SYSTEM DATABASE SCHEMA
-- Real-time chat with auto-moderation for sports fans
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text matching

-- =====================================================
-- CHAT ROOMS (Team-based public chat rooms)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_slug VARCHAR(50) UNIQUE NOT NULL, -- bears, cubs, bulls, etc.
    team_name VARCHAR(100) NOT NULL,
    team_color VARCHAR(7) DEFAULT '#FF6600', -- Hex color
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Room settings
    slow_mode_seconds INTEGER DEFAULT 0, -- 0 = disabled
    members_only BOOLEAN DEFAULT false,
    min_account_age_days INTEGER DEFAULT 0
);

-- Seed the Chicago sports teams
INSERT INTO chat_rooms (team_slug, team_name, team_color, description) VALUES
    ('bears', 'Chicago Bears', '#0B162A', 'Bear Down! Chat with fellow Bears fans'),
    ('cubs', 'Chicago Cubs', '#0E3386', 'Go Cubs Go! Connect with Cubs Nation'),
    ('bulls', 'Chicago Bulls', '#CE1141', 'See Red! Bulls fan community'),
    ('white-sox', 'Chicago White Sox', '#27251F', 'South Side pride! White Sox fan chat'),
    ('blackhawks', 'Chicago Blackhawks', '#CF0A2C', 'One Goal! Blackhawks fan zone'),
    ('fire', 'Chicago Fire', '#7D1617', 'Chicago Fire FC fan community'),
    ('sky', 'Chicago Sky', '#5091CD', 'Sky fan community')
ON CONFLICT (team_slug) DO NOTHING;

-- =====================================================
-- CHAT USERS (Extended profile for chat)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References auth.users
    display_name VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    badge VARCHAR(50), -- 'verified', 'og_fan', 'contributor', 'moderator', 'staff'
    reputation_score INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    warnings_count INTEGER DEFAULT 0,
    is_banned BOOLEAN DEFAULT false,
    ban_expires_at TIMESTAMPTZ,
    ban_reason TEXT,
    muted_until TIMESTAMPTZ,
    favorite_team_slug VARCHAR(50),
    -- Settings
    show_online_status BOOLEAN DEFAULT true,
    allow_dms VARCHAR(20) DEFAULT 'everyone', -- 'everyone', 'followers', 'none'
    notification_preferences JSONB DEFAULT '{"mentions": true, "dms": true, "reactions": false}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_chat_users_user_id ON chat_users(user_id);
CREATE INDEX idx_chat_users_display_name ON chat_users(display_name);
CREATE INDEX idx_chat_users_reputation ON chat_users(reputation_score DESC);

-- =====================================================
-- CHAT MESSAGES (Public room messages)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
    -- Message content
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text', -- 'text', 'gif', 'image', 'system'
    gif_url TEXT, -- For GIF messages
    -- Threading
    reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    thread_root_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    thread_reply_count INTEGER DEFAULT 0,
    -- Moderation
    moderation_status VARCHAR(20) DEFAULT 'approved', -- 'pending', 'approved', 'rejected', 'flagged'
    moderation_flags JSONB DEFAULT '[]'::jsonb, -- Array of triggered rules
    moderation_score DECIMAL(3,2) DEFAULT 0, -- 0.00 to 1.00 toxicity score
    is_deleted BOOLEAN DEFAULT false,
    deleted_by UUID, -- User or moderator who deleted
    deleted_reason TEXT,
    -- Engagement
    reaction_counts JSONB DEFAULT '{}'::jsonb, -- {"👍": 5, "🔥": 3}
    -- Metadata
    client_id VARCHAR(100), -- For deduplication
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Indexes for performance
    CONSTRAINT valid_content CHECK (length(content) > 0 AND length(content) <= 1000)
);

CREATE INDEX idx_chat_messages_room ON chat_messages(room_id, created_at DESC);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_thread ON chat_messages(thread_root_id) WHERE thread_root_id IS NOT NULL;
CREATE INDEX idx_chat_messages_moderation ON chat_messages(moderation_status) WHERE moderation_status != 'approved';
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);

-- =====================================================
-- DIRECT MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_dm_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_1_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_preview TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Ensure unique conversations (order doesn't matter)
    CONSTRAINT unique_conversation UNIQUE (
        LEAST(participant_1_id, participant_2_id),
        GREATEST(participant_1_id, participant_2_id)
    )
);

CREATE INDEX idx_dm_conversations_p1 ON chat_dm_conversations(participant_1_id);
CREATE INDEX idx_dm_conversations_p2 ON chat_dm_conversations(participant_2_id);
CREATE INDEX idx_dm_conversations_recent ON chat_dm_conversations(last_message_at DESC);

CREATE TABLE IF NOT EXISTS chat_dm_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES chat_dm_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text',
    gif_url TEXT,
    -- Read status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    -- Moderation (still applies to DMs)
    moderation_status VARCHAR(20) DEFAULT 'approved',
    moderation_flags JSONB DEFAULT '[]'::jsonb,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dm_content CHECK (length(content) > 0 AND length(content) <= 2000)
);

CREATE INDEX idx_dm_messages_conversation ON chat_dm_messages(conversation_id, created_at DESC);
CREATE INDEX idx_dm_messages_unread ON chat_dm_messages(conversation_id, is_read) WHERE is_read = false;

-- =====================================================
-- REACTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL, -- The emoji character
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX idx_reactions_message ON chat_reactions(message_id);

-- =====================================================
-- USER BLOCKS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_user_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocker ON chat_user_blocks(blocker_id);

-- =====================================================
-- USER REPORTS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES chat_users(id) ON DELETE CASCADE,
    message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    reason VARCHAR(50) NOT NULL, -- 'spam', 'harassment', 'hate_speech', 'inappropriate', 'other'
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'actioned', 'dismissed'
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON chat_reports(status) WHERE status = 'pending';
CREATE INDEX idx_reports_user ON chat_reports(reported_user_id);

-- =====================================================
-- MODERATION RULES (Configurable)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_moderation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_type VARCHAR(50) NOT NULL, -- 'word_filter', 'regex', 'spam_pattern', 'rate_limit'
    category VARCHAR(50) NOT NULL, -- 'profanity', 'hate_speech', 'violence', 'spam', 'sales', 'links'
    pattern TEXT NOT NULL, -- The word, phrase, or regex pattern
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    action VARCHAR(20) DEFAULT 'block', -- 'warn', 'block', 'shadow_block', 'mute', 'ban'
    is_active BOOLEAN DEFAULT true,
    is_regex BOOLEAN DEFAULT false,
    case_sensitive BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moderation_rules_active ON chat_moderation_rules(is_active, category);

-- =====================================================
-- MODERATION LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_moderation_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    user_id UUID REFERENCES chat_users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    reason TEXT,
    triggered_rules JSONB DEFAULT '[]'::jsonb,
    original_content TEXT,
    moderator_id UUID, -- NULL for auto-moderation
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moderation_log_user ON chat_moderation_log(user_id);
CREATE INDEX idx_moderation_log_created ON chat_moderation_log(created_at DESC);

-- =====================================================
-- PRESENCE (Online users)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'online', -- 'online', 'away', 'dnd'
    last_ping_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, room_id)
);

CREATE INDEX idx_presence_room ON chat_presence(room_id, last_ping_at DESC);

-- =====================================================
-- POPULAR MESSAGES (Trending/highlighted)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_highlights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    highlight_type VARCHAR(20) DEFAULT 'trending', -- 'trending', 'pinned', 'staff_pick'
    score INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_highlights_room ON chat_highlights(room_id, score DESC);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_dm_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_dm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_moderation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_presence ENABLE ROW LEVEL SECURITY;

-- Public read access to rooms
CREATE POLICY "Rooms are viewable by everyone" ON chat_rooms
    FOR SELECT USING (is_active = true);

-- Chat users policies
CREATE POLICY "Users can view other chat profiles" ON chat_users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON chat_users
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to chat_users" ON chat_users
    FOR ALL USING (auth.role() = 'service_role');

-- Messages policies
CREATE POLICY "Anyone can view approved messages" ON chat_messages
    FOR SELECT USING (
        moderation_status = 'approved'
        AND is_deleted = false
    );

CREATE POLICY "Authenticated users can insert messages" ON chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM chat_users WHERE user_id = auth.uid() AND id = chat_messages.user_id)
    );

CREATE POLICY "Users can delete own messages" ON chat_messages
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM chat_users WHERE user_id = auth.uid() AND id = chat_messages.user_id)
    );

CREATE POLICY "Service role full access to messages" ON chat_messages
    FOR ALL USING (auth.role() = 'service_role');

-- DM Conversations policies
CREATE POLICY "Users can view own conversations" ON chat_dm_conversations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM chat_users WHERE user_id = auth.uid() AND (id = participant_1_id OR id = participant_2_id))
    );

CREATE POLICY "Service role full access to dm_conversations" ON chat_dm_conversations
    FOR ALL USING (auth.role() = 'service_role');

-- DM Messages policies
CREATE POLICY "Users can view DMs in their conversations" ON chat_dm_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_dm_conversations c
            JOIN chat_users u ON u.user_id = auth.uid()
            WHERE c.id = chat_dm_messages.conversation_id
            AND (c.participant_1_id = u.id OR c.participant_2_id = u.id)
        )
    );

CREATE POLICY "Service role full access to dm_messages" ON chat_dm_messages
    FOR ALL USING (auth.role() = 'service_role');

-- Reactions policies
CREATE POLICY "Anyone can view reactions" ON chat_reactions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add reactions" ON chat_reactions
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM chat_users WHERE user_id = auth.uid() AND id = chat_reactions.user_id)
    );

CREATE POLICY "Users can remove own reactions" ON chat_reactions
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM chat_users WHERE user_id = auth.uid() AND id = chat_reactions.user_id)
    );

-- Blocks policies
CREATE POLICY "Users can manage own blocks" ON chat_user_blocks
    FOR ALL USING (
        EXISTS (SELECT 1 FROM chat_users WHERE user_id = auth.uid() AND id = blocker_id)
    );

-- Reports policies
CREATE POLICY "Users can create reports" ON chat_reports
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM chat_users WHERE user_id = auth.uid() AND id = reporter_id)
    );

CREATE POLICY "Service role full access to reports" ON chat_reports
    FOR ALL USING (auth.role() = 'service_role');

-- Moderation rules are admin-only
CREATE POLICY "Service role only for moderation rules" ON chat_moderation_rules
    FOR ALL USING (auth.role() = 'service_role');

-- Presence policies
CREATE POLICY "Anyone can view presence" ON chat_presence
    FOR SELECT USING (true);

CREATE POLICY "Users can update own presence" ON chat_presence
    FOR ALL USING (
        EXISTS (SELECT 1 FROM chat_users WHERE user_id = auth.uid() AND id = chat_presence.user_id)
    );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update reaction counts on message
CREATE OR REPLACE FUNCTION update_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE chat_messages
        SET reaction_counts = (
            SELECT jsonb_object_agg(emoji, cnt)
            FROM (
                SELECT emoji, COUNT(*) as cnt
                FROM chat_reactions
                WHERE message_id = NEW.message_id
                GROUP BY emoji
            ) counts
        )
        WHERE id = NEW.message_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE chat_messages
        SET reaction_counts = COALESCE((
            SELECT jsonb_object_agg(emoji, cnt)
            FROM (
                SELECT emoji, COUNT(*) as cnt
                FROM chat_reactions
                WHERE message_id = OLD.message_id
                GROUP BY emoji
            ) counts
        ), '{}'::jsonb)
        WHERE id = OLD.message_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reaction_counts
AFTER INSERT OR DELETE ON chat_reactions
FOR EACH ROW EXECUTE FUNCTION update_reaction_counts();

-- Function to update thread reply count
CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.thread_root_id IS NOT NULL THEN
        UPDATE chat_messages
        SET thread_reply_count = (
            SELECT COUNT(*) FROM chat_messages
            WHERE thread_root_id = NEW.thread_root_id
        )
        WHERE id = NEW.thread_root_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_count
AFTER INSERT ON chat_messages
FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();

-- Function to update DM conversation metadata
CREATE OR REPLACE FUNCTION update_dm_conversation()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_dm_conversations
    SET
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100)
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dm_conversation
AFTER INSERT ON chat_dm_messages
FOR EACH ROW EXECUTE FUNCTION update_dm_conversation();

-- Function to increment user message count
CREATE OR REPLACE FUNCTION increment_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_users
    SET messages_sent = messages_sent + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_message_count
AFTER INSERT ON chat_messages
FOR EACH ROW
WHEN (NEW.moderation_status = 'approved')
EXECUTE FUNCTION increment_message_count();

-- =====================================================
-- ENABLE REALTIME
-- =====================================================

-- Enable realtime for messages (filtered by room)
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_dm_messages;

-- =====================================================
-- SAMPLE MODERATION RULES (Comprehensive)
-- =====================================================

-- Note: Run the moderation-rules.sql file separately for the full ruleset
