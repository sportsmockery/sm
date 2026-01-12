-- X Bot Schema for SportsMockery Twitter Communities
-- This schema supports bot monitoring, engagement tracking, and response management

-- ============================================================================
-- BOT CONFIGURATION
-- ============================================================================

-- Store bot settings per team community
CREATE TABLE IF NOT EXISTS sm_bot_config (
    id BIGSERIAL PRIMARY KEY,
    team_slug TEXT NOT NULL UNIQUE,
    community_id TEXT, -- X Community ID
    enabled BOOLEAN DEFAULT false,
    daily_reply_limit INTEGER DEFAULT 10,
    daily_post_limit INTEGER DEFAULT 2,
    min_delay_seconds INTEGER DEFAULT 60,
    max_delay_seconds INTEGER DEFAULT 300,
    system_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default config for each team
INSERT INTO sm_bot_config (team_slug, system_prompt) VALUES
('chicago-bears', 'You are the voice of @sportsmockery, a passionate yet analytical Chicago Bears expert. Speak like a true Bears fan—reference "da Bears" occasionally, mention Soldier Field vibes, and celebrate the Monsters of the Midway legacy. Stay factual with stats, be funny when organic, and always respectful. Acknowledge fan opinions before providing your analysis. Never reveal you are AI.'),
('chicago-bulls', 'You are the voice of @sportsmockery, a knowledgeable Chicago Bulls analyst. Reference the Jordan era with pride but focus on the current team. Speak like a Bulls fan who lives and breathes basketball. Stay factual with stats, be analytical yet conversational, and always respectful. Acknowledge fan opinions before providing your analysis. Never reveal you are AI.'),
('chicago-cubs', 'You are the voice of @sportsmockery, a lifelong Cubs fan and baseball analyst. Reference Wrigley Field, the curse-breaking 2016 championship, and the North Side pride. Stay factual with stats, be funny when organic, and always respectful. Acknowledge fan opinions before providing your analysis. Never reveal you are AI.'),
('chicago-white-sox', 'You are the voice of @sportsmockery, a dedicated South Side White Sox expert. Reference Guaranteed Rate Field, the 2005 championship, and the passionate Sox fan base. Stay factual with stats, be analytical yet conversational, and always respectful. Acknowledge fan opinions before providing your analysis. Never reveal you are AI.'),
('chicago-blackhawks', 'You are the voice of @sportsmockery, a passionate Blackhawks hockey analyst. Reference the recent dynasty years, the United Center atmosphere, and Chicago hockey tradition. Stay factual with stats, be funny when organic, and always respectful. Acknowledge fan opinions before providing your analysis. Never reveal you are AI.')
ON CONFLICT (team_slug) DO NOTHING;

-- ============================================================================
-- MONITORED TWEETS
-- ============================================================================

-- Track tweets we've seen and processed
CREATE TABLE IF NOT EXISTS sm_bot_monitored_tweets (
    id BIGSERIAL PRIMARY KEY,
    tweet_id TEXT NOT NULL UNIQUE,
    community_id TEXT,
    team_slug TEXT,
    author_username TEXT,
    author_id TEXT,
    content TEXT,
    likes_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    retweet_count INTEGER DEFAULT 0,
    processed BOOLEAN DEFAULT false,
    should_reply BOOLEAN DEFAULT false,
    reply_priority INTEGER DEFAULT 50, -- 0-100, higher = more urgent
    tweet_created_at TIMESTAMP WITH TIME ZONE,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_team FOREIGN KEY (team_slug) REFERENCES sm_bot_config(team_slug)
);

CREATE INDEX IF NOT EXISTS idx_monitored_tweets_team ON sm_bot_monitored_tweets(team_slug);
CREATE INDEX IF NOT EXISTS idx_monitored_tweets_processed ON sm_bot_monitored_tweets(processed);
CREATE INDEX IF NOT EXISTS idx_monitored_tweets_priority ON sm_bot_monitored_tweets(reply_priority DESC);

-- ============================================================================
-- BOT RESPONSES
-- ============================================================================

-- Track all bot responses (replies and original posts)
CREATE TABLE IF NOT EXISTS sm_bot_responses (
    id BIGSERIAL PRIMARY KEY,
    team_slug TEXT NOT NULL,
    response_type TEXT NOT NULL CHECK (response_type IN ('reply', 'original_post', 'quote_tweet')),
    in_reply_to_tweet_id TEXT,
    our_tweet_id TEXT,
    content TEXT NOT NULL,
    claude_model TEXT DEFAULT 'claude-3-5-sonnet-20241022',
    prompt_used TEXT,
    tokens_used INTEGER,
    article_id BIGINT, -- If promoting an article
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed', 'cancelled')),
    error_message TEXT,
    engagement_likes INTEGER DEFAULT 0,
    engagement_replies INTEGER DEFAULT 0,
    engagement_retweets INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    posted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_response_team FOREIGN KEY (team_slug) REFERENCES sm_bot_config(team_slug),
    CONSTRAINT fk_response_article FOREIGN KEY (article_id) REFERENCES sm_posts(id)
);

CREATE INDEX IF NOT EXISTS idx_bot_responses_team ON sm_bot_responses(team_slug);
CREATE INDEX IF NOT EXISTS idx_bot_responses_status ON sm_bot_responses(status);
CREATE INDEX IF NOT EXISTS idx_bot_responses_type ON sm_bot_responses(response_type);

-- ============================================================================
-- DAILY ACTIVITY TRACKING
-- ============================================================================

-- Track daily bot activity to enforce limits
CREATE TABLE IF NOT EXISTS sm_bot_daily_activity (
    id BIGSERIAL PRIMARY KEY,
    team_slug TEXT NOT NULL,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    replies_sent INTEGER DEFAULT 0,
    original_posts INTEGER DEFAULT 0,
    tweets_monitored INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    UNIQUE(team_slug, activity_date),
    CONSTRAINT fk_activity_team FOREIGN KEY (team_slug) REFERENCES sm_bot_config(team_slug)
);

CREATE INDEX IF NOT EXISTS idx_daily_activity_date ON sm_bot_daily_activity(activity_date);

-- ============================================================================
-- BOT BLOCKED USERS
-- ============================================================================

-- Users the bot should not engage with
CREATE TABLE IF NOT EXISTS sm_bot_blocked_users (
    id BIGSERIAL PRIMARY KEY,
    twitter_user_id TEXT NOT NULL UNIQUE,
    twitter_username TEXT,
    reason TEXT,
    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_by TEXT -- admin who blocked
);

-- ============================================================================
-- BOT ENGAGEMENT KEYWORDS
-- ============================================================================

-- Keywords that trigger bot engagement (higher score = more likely to reply)
CREATE TABLE IF NOT EXISTS sm_bot_keywords (
    id BIGSERIAL PRIMARY KEY,
    team_slug TEXT,
    keyword TEXT NOT NULL,
    priority_boost INTEGER DEFAULT 10, -- Added to reply_priority
    is_negative BOOLEAN DEFAULT false, -- If true, reduces priority
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_keyword_team FOREIGN KEY (team_slug) REFERENCES sm_bot_config(team_slug)
);

-- Insert default keywords
INSERT INTO sm_bot_keywords (team_slug, keyword, priority_boost) VALUES
(NULL, 'trade', 15),
(NULL, 'injury', 20),
(NULL, 'breaking', 25),
(NULL, 'stats', 10),
(NULL, 'opinion', 10),
(NULL, 'what do you think', 20),
(NULL, 'thoughts?', 20),
(NULL, 'predictions', 15),
('chicago-bears', 'caleb williams', 25),
('chicago-bears', 'eberflus', 20),
('chicago-bears', 'soldier field', 10),
('chicago-bulls', 'demar derozan', 20),
('chicago-bulls', 'lavine', 20),
('chicago-blackhawks', 'bedard', 25),
('chicago-cubs', 'marquee', 10),
('chicago-white-sox', 'rebuild', 20)
ON CONFLICT DO NOTHING;

-- Negative keywords (avoid engagement)
INSERT INTO sm_bot_keywords (team_slug, keyword, priority_boost, is_negative) VALUES
(NULL, 'politics', -50, true),
(NULL, 'gambling', -30, true),
(NULL, 'bet', -20, true),
(NULL, 'sponsor', -40, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BOT LOGS
-- ============================================================================

-- Detailed logging for debugging and monitoring
CREATE TABLE IF NOT EXISTS sm_bot_logs (
    id BIGSERIAL PRIMARY KEY,
    team_slug TEXT,
    log_level TEXT DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warn', 'error')),
    action TEXT NOT NULL,
    message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_logs_level ON sm_bot_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_bot_logs_team ON sm_bot_logs(team_slug);
CREATE INDEX IF NOT EXISTS idx_bot_logs_created ON sm_bot_logs(created_at DESC);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if bot can post for a team today
CREATE OR REPLACE FUNCTION can_bot_post(p_team_slug TEXT, p_is_reply BOOLEAN DEFAULT true)
RETURNS BOOLEAN AS $$
DECLARE
    v_config sm_bot_config%ROWTYPE;
    v_activity sm_bot_daily_activity%ROWTYPE;
BEGIN
    -- Get config
    SELECT * INTO v_config FROM sm_bot_config WHERE team_slug = p_team_slug;
    IF NOT FOUND OR NOT v_config.enabled THEN
        RETURN false;
    END IF;

    -- Get today's activity
    SELECT * INTO v_activity FROM sm_bot_daily_activity
    WHERE team_slug = p_team_slug AND activity_date = CURRENT_DATE;

    IF NOT FOUND THEN
        RETURN true; -- No activity yet today
    END IF;

    -- Check limits
    IF p_is_reply THEN
        RETURN v_activity.replies_sent < v_config.daily_reply_limit;
    ELSE
        RETURN v_activity.original_posts < v_config.daily_post_limit;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to increment daily activity
CREATE OR REPLACE FUNCTION increment_bot_activity(
    p_team_slug TEXT,
    p_is_reply BOOLEAN DEFAULT true,
    p_tokens INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO sm_bot_daily_activity (team_slug, activity_date, replies_sent, original_posts, total_tokens_used)
    VALUES (
        p_team_slug,
        CURRENT_DATE,
        CASE WHEN p_is_reply THEN 1 ELSE 0 END,
        CASE WHEN NOT p_is_reply THEN 1 ELSE 0 END,
        p_tokens
    )
    ON CONFLICT (team_slug, activity_date) DO UPDATE SET
        replies_sent = sm_bot_daily_activity.replies_sent + CASE WHEN p_is_reply THEN 1 ELSE 0 END,
        original_posts = sm_bot_daily_activity.original_posts + CASE WHEN NOT p_is_reply THEN 1 ELSE 0 END,
        total_tokens_used = sm_bot_daily_activity.total_tokens_used + p_tokens;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE sm_bot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_bot_monitored_tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_bot_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_bot_daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_bot_blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_bot_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_bot_logs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for server-side bot operations)
CREATE POLICY "Service role full access to bot_config" ON sm_bot_config
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to monitored_tweets" ON sm_bot_monitored_tweets
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to bot_responses" ON sm_bot_responses
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to daily_activity" ON sm_bot_daily_activity
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to blocked_users" ON sm_bot_blocked_users
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to keywords" ON sm_bot_keywords
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to logs" ON sm_bot_logs
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE sm_bot_config IS 'Bot configuration per team community';
COMMENT ON TABLE sm_bot_monitored_tweets IS 'Tweets discovered and tracked by the bot';
COMMENT ON TABLE sm_bot_responses IS 'All bot responses (replies and original posts)';
COMMENT ON TABLE sm_bot_daily_activity IS 'Daily activity tracking to enforce rate limits';
COMMENT ON TABLE sm_bot_blocked_users IS 'Users the bot should never engage with';
COMMENT ON TABLE sm_bot_keywords IS 'Keywords that influence reply priority';
COMMENT ON TABLE sm_bot_logs IS 'Detailed bot operation logs';
