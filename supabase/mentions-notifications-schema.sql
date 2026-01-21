-- Mentions and Notifications Schema
-- Run this migration to add @mention support to fan chat

-- Add mentions column to chat_messages if it doesn't exist
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS mentions uuid[] DEFAULT '{}';

-- Create index for efficient mention lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_mentions
ON chat_messages USING GIN (mentions);

-- Create notifications table
CREATE TABLE IF NOT EXISTS chat_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type varchar(50) NOT NULL DEFAULT 'mention', -- 'mention', 'reply', 'dm', etc.
  message_id uuid REFERENCES chat_messages(id) ON DELETE CASCADE,
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE,
  from_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content_preview text, -- Preview of the message content
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_chat_notifications_user_id
ON chat_notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_notifications_user_unread
ON chat_notifications(user_id, is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_chat_notifications_created
ON chat_notifications(created_at DESC);

-- Track room participants (users who have sent messages in a room)
CREATE TABLE IF NOT EXISTS chat_room_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name varchar(100),
  last_message_at timestamptz DEFAULT now(),
  message_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Index for fast participant lookups
CREATE INDEX IF NOT EXISTS idx_chat_room_participants_room
ON chat_room_participants(room_id, last_message_at DESC);

-- Function to update room participants when a message is sent
CREATE OR REPLACE FUNCTION update_room_participant()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO chat_room_participants (room_id, user_id, display_name, last_message_at, message_count)
  SELECT
    NEW.room_id,
    NEW.user_id,
    cu.display_name,
    now(),
    1
  FROM chat_users cu
  WHERE cu.user_id = NEW.user_id
  ON CONFLICT (room_id, user_id)
  DO UPDATE SET
    last_message_at = now(),
    message_count = chat_room_participants.message_count + 1,
    display_name = EXCLUDED.display_name;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to track participants
DROP TRIGGER IF EXISTS trigger_update_room_participant ON chat_messages;
CREATE TRIGGER trigger_update_room_participant
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_room_participant();

-- Function to create notifications for mentions
CREATE OR REPLACE FUNCTION create_mention_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notifications for approved messages with mentions
  IF NEW.moderation_status = 'approved' AND array_length(NEW.mentions, 1) > 0 THEN
    INSERT INTO chat_notifications (user_id, type, message_id, room_id, from_user_id, content_preview)
    SELECT
      unnest(NEW.mentions),
      'mention',
      NEW.id,
      NEW.room_id,
      NEW.user_id,
      LEFT(NEW.content, 200)
    WHERE NEW.user_id != ALL(NEW.mentions); -- Don't notify yourself
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notifications
DROP TRIGGER IF EXISTS trigger_create_mention_notifications ON chat_messages;
CREATE TRIGGER trigger_create_mention_notifications
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION create_mention_notifications();

-- RLS Policies for notifications
ALTER TABLE chat_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON chat_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON chat_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications (via trigger)
CREATE POLICY "System can insert notifications"
  ON chat_notifications FOR INSERT
  WITH CHECK (true);

-- RLS for room participants (public read within room context)
ALTER TABLE chat_room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view room participants"
  ON chat_room_participants FOR SELECT
  USING (true);

CREATE POLICY "System can manage participants"
  ON chat_room_participants FOR ALL
  USING (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE chat_notifications;

-- Add comments
COMMENT ON TABLE chat_notifications IS 'Stores user notifications for mentions, replies, etc.';
COMMENT ON TABLE chat_room_participants IS 'Tracks users who have participated in each chat room';
COMMENT ON COLUMN chat_messages.mentions IS 'Array of user IDs mentioned in this message';
