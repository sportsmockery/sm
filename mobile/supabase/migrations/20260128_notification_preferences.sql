-- User notification preferences for real-time mobile alerts
-- Stores per-user settings for push notification targeting via OneSignal

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Global settings
  notifications_enabled BOOLEAN DEFAULT true,
  frequency_mode VARCHAR(20) DEFAULT 'important', -- 'all' | 'important' | 'minimal' | 'off'

  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',

  -- Team settings
  only_favorite_teams BOOLEAN DEFAULT true,
  favorite_teams TEXT[] DEFAULT ARRAY['bears', 'bulls', 'cubs'],

  -- Player tracking
  tracked_players TEXT[] DEFAULT ARRAY[]::TEXT[],
  player_alerts_enabled BOOLEAN DEFAULT false,

  -- Game alerts
  alert_game_start BOOLEAN DEFAULT true,
  alert_game_end BOOLEAN DEFAULT true,
  alert_score_change BOOLEAN DEFAULT true,
  alert_close_game BOOLEAN DEFAULT true,
  alert_overtime BOOLEAN DEFAULT true,

  -- News alerts
  alert_injuries BOOLEAN DEFAULT true,
  alert_trades BOOLEAN DEFAULT true,
  alert_roster_moves BOOLEAN DEFAULT true,
  alert_breaking_news BOOLEAN DEFAULT true,

  -- Special alerts
  alert_playoffs BOOLEAN DEFAULT true,
  alert_draft BOOLEAN DEFAULT false,
  alert_preseason BOOLEAN DEFAULT false,

  -- Anti-spam
  max_alerts_per_game INTEGER DEFAULT 8,
  min_alert_gap_seconds INTEGER DEFAULT 60,
  batch_alerts BOOLEAN DEFAULT true,
  spoiler_delay_seconds INTEGER DEFAULT 0,

  -- Sound/vibration
  sound_enabled BOOLEAN DEFAULT true,
  vibration_enabled BOOLEAN DEFAULT true,

  UNIQUE(user_id)
);

CREATE INDEX idx_notification_prefs_user_id ON user_notification_preferences(user_id);
CREATE INDEX idx_notification_prefs_teams ON user_notification_preferences USING GIN(favorite_teams);

ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON user_notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);
