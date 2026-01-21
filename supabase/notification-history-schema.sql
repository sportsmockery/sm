-- SportsMockery Push Notification History - Database Schema
-- Run this migration to set up the notification history table

-- =====================================================
-- NOTIFICATION HISTORY - Track sent push notifications
-- =====================================================
CREATE TABLE IF NOT EXISTS sm_notification_history (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  body TEXT NOT NULL,
  article_id INTEGER REFERENCES sm_posts(id) ON DELETE SET NULL,
  article_title VARCHAR(500),
  onesignal_id VARCHAR(100),
  recipient_count INTEGER,
  sent_by VARCHAR(100) DEFAULT 'admin',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for recent notifications lookup
CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at
  ON sm_notification_history(sent_at DESC);

-- Index for article lookup
CREATE INDEX IF NOT EXISTS idx_notification_history_article
  ON sm_notification_history(article_id);
