# Database Setup

## Prerequisites

- Supabase project with PostgreSQL
- Service role key for migrations

## Installation

### Step 1: Run Schema Migration

Execute the schema SQL in your Supabase SQL editor:

```bash
# File: supabase/chat-schema.sql
```

This creates:

| Table | Description |
|-------|-------------|
| `chat_rooms` | Team-based chat rooms |
| `chat_users` | Extended user profiles for chat |
| `chat_messages` | Public room messages |
| `chat_dm_conversations` | DM conversation metadata |
| `chat_dm_messages` | Direct messages |
| `chat_reactions` | Emoji reactions |
| `chat_user_blocks` | Blocked users |
| `chat_reports` | User reports |
| `chat_moderation_rules` | Configurable rules |
| `chat_moderation_log` | Moderation actions log |
| `chat_presence` | Online users |
| `chat_highlights` | Trending/pinned messages |

### Step 2: Run Moderation Rules

Execute the moderation rules SQL:

```bash
# File: supabase/chat-moderation-rules.sql
```

This populates `chat_moderation_rules` with 300+ rules for:
- Profanity filtering
- Hate speech detection
- Violence and threats
- Spam patterns
- Sales/marketing
- Link filtering
- Harassment patterns

### Step 3: Create AI User

Insert the AI assistant user:

```sql
INSERT INTO chat_users (
  user_id,
  display_name,
  badge,
  avatar_url
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'SM Bot',
  'ai',
  '/images/sm-bot-avatar.png'
);
```

### Step 4: Enable Realtime

The schema already includes:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_dm_messages;
```

Verify in Supabase Dashboard > Database > Replication.

## Schema Details

### chat_rooms

```sql
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY,
  team_slug VARCHAR(50) UNIQUE NOT NULL,  -- bears, cubs, bulls, etc.
  team_name VARCHAR(100) NOT NULL,
  team_color VARCHAR(7),                   -- Hex color
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  slow_mode_seconds INTEGER DEFAULT 0,     -- Rate limiting
  members_only BOOLEAN DEFAULT false,
  min_account_age_days INTEGER DEFAULT 0
);
```

Pre-seeded with Chicago teams:
- bears, cubs, bulls, white-sox, blackhawks, fire, sky

### chat_users

```sql
CREATE TABLE chat_users (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,                   -- References auth.users
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  badge VARCHAR(50),                       -- verified, og_fan, contributor, moderator, staff, ai
  reputation_score INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  warnings_count INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT false,
  ban_expires_at TIMESTAMPTZ,
  ban_reason TEXT,
  muted_until TIMESTAMPTZ,
  favorite_team_slug VARCHAR(50),
  show_online_status BOOLEAN DEFAULT true,
  allow_dms VARCHAR(20) DEFAULT 'everyone', -- everyone, followers, none
  notification_preferences JSONB
);
```

### chat_messages

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES chat_rooms(id),
  user_id UUID NOT NULL REFERENCES chat_users(id),
  content TEXT NOT NULL,
  content_type VARCHAR(20) DEFAULT 'text', -- text, gif, image, system
  gif_url TEXT,
  reply_to_id UUID REFERENCES chat_messages(id),
  thread_root_id UUID REFERENCES chat_messages(id),
  thread_reply_count INTEGER DEFAULT 0,
  moderation_status VARCHAR(20) DEFAULT 'approved',
  moderation_flags JSONB DEFAULT '[]',
  moderation_score DECIMAL(3,2) DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  reaction_counts JSONB DEFAULT '{}',      -- {"👍": 5, "🔥": 3}
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security

All tables have RLS enabled with policies:

- **chat_rooms**: Public read for active rooms
- **chat_users**: Public read, users can update own profile
- **chat_messages**: Public read for approved messages, authenticated insert
- **chat_dm_***: Only participants can read/write
- **chat_reactions**: Public read, authenticated insert/delete
- **chat_reports**: Authenticated insert only
- **chat_moderation_rules**: Service role only

## Indexes

Key indexes for performance:

```sql
CREATE INDEX idx_chat_messages_room ON chat_messages(room_id, created_at DESC);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_thread ON chat_messages(thread_root_id);
CREATE INDEX idx_dm_conversations_recent ON chat_dm_conversations(last_message_at DESC);
CREATE INDEX idx_presence_room ON chat_presence(room_id, last_ping_at DESC);
```

## Triggers

Automatic triggers handle:

1. **Reaction counts** - Updates `reaction_counts` JSONB when reactions added/removed
2. **Thread reply count** - Increments `thread_reply_count` on parent message
3. **DM conversation metadata** - Updates `last_message_at` and preview
4. **User message count** - Increments `messages_sent` on approved messages

## Backup Considerations

Important tables to backup regularly:
- `chat_messages` - All message history
- `chat_users` - User profiles and reputation
- `chat_moderation_log` - Audit trail

Less critical (can be regenerated):
- `chat_presence` - Ephemeral data
- `chat_reactions` - Can be rebuilt from messages
