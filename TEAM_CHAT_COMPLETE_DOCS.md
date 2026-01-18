# TEAM CHAT SYSTEM - COMPLETE DOCUMENTATION

---

## 1. README

# Team Chat System - Installation Guide

A comprehensive real-time team chat system with auto-moderation for sports fan engagement.

## Overview

This system provides a Facebook Messenger-like chat experience where fans can:
- Chat in real-time with other fans reading articles about the same team
- Send emojis, GIFs, and reactions
- Direct message other users
- View chat history

All messages are automatically moderated before publishing to ensure a safe, family-friendly environment.

## Features

### Core Chat
- **Floating Chat Button** - "Hang out with [Team] fans" appears on article pages
- **Team-Based Rooms** - Separate chat rooms for Bears, Cubs, Bulls, White Sox, Blackhawks
- **Real-Time Updates** - Powered by Supabase Realtime
- **Modern UI** - Time-grouped messages, smooth scrolling, mobile responsive

### Messaging
- Text messages with 1000 character limit
- Emoji picker with sports-focused categories
- GIF picker (Tenor/GIPHY integration)
- Reply threading
- Edit/delete own messages
- Emoji reactions

### Direct Messages
- Private conversations between users
- Unread message badges
- Conversation list with previews

### User Features
- Chat history with search
- Block users
- Report messages
- Online presence indicators

### Auto-Moderation
- Pre-publish content filtering
- Profanity, hate speech, violence detection
- Spam and sales content blocking
- No nudity/sex, gambling, drugs, alcohol
- Link whitelist (sports media only)
- Bypass attempt detection
- Rate limiting

### AI Assistant
- Responds when no staff online
- Chicago sports expert
- Humorous fan personality
- Always supports Chicago teams

## Quick Start

1. Run database migrations (see DATABASE section)
2. Configure environment variables (see ENVIRONMENT section)
3. The chat widget is already integrated into article pages

## File Structure

```
src/
├── app/api/
│   ├── auth/disqus-sso/route.ts    # Disqus SSO endpoint
│   ├── chat/messages/route.ts       # Message API
│   └── gifs/search/route.ts         # GIF search API
├── components/chat/
│   ├── index.ts                     # Component exports
│   ├── FloatingChatButton.tsx       # Floating action button
│   ├── TeamChatPanel.tsx            # Main chat panel
│   ├── TeamChatWidget.tsx           # Widget wrapper
│   ├── ChatMessage.tsx              # Message component
│   ├── ChatInput.tsx                # Input with pickers
│   ├── EmojiPicker.tsx              # Emoji selection
│   ├── GifPicker.tsx                # GIF selection
│   ├── DMList.tsx                   # Direct messages
│   └── ChatHistory.tsx              # Message history
├── contexts/
│   └── ChatContext.tsx              # State management
└── lib/chat/
    ├── moderation.ts                # Content moderation
    ├── moderation-enhanced.ts       # Bypass prevention
    └── ai-responder.ts              # AI assistant

supabase/
├── chat-schema.sql                  # Database schema
└── chat-moderation-rules.sql        # Moderation rules
```

---

## 2. DATABASE

# Database Setup

## Prerequisites

- Supabase project with PostgreSQL
- Service role key for migrations

## Installation

### Step 1: Run Schema Migration

Execute the schema SQL in your Supabase SQL editor:
- File: supabase/chat-schema.sql

This creates:

| Table | Description |
|-------|-------------|
| chat_rooms | Team-based chat rooms |
| chat_users | Extended user profiles for chat |
| chat_messages | Public room messages |
| chat_dm_conversations | DM conversation metadata |
| chat_dm_messages | Direct messages |
| chat_reactions | Emoji reactions |
| chat_user_blocks | Blocked users |
| chat_reports | User reports |
| chat_moderation_rules | Configurable rules |
| chat_moderation_log | Moderation actions log |
| chat_presence | Online users |
| chat_highlights | Trending/pinned messages |

### Step 2: Run Moderation Rules

Execute: supabase/chat-moderation-rules.sql

This populates chat_moderation_rules with 300+ rules for:
- Profanity filtering
- Hate speech detection
- Violence and threats
- Spam patterns
- Sales/marketing
- Link filtering
- Harassment patterns

### Step 3: Create AI User

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

## Schema Details

### chat_rooms

```sql
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY,
  team_slug VARCHAR(50) UNIQUE NOT NULL,
  team_name VARCHAR(100) NOT NULL,
  team_color VARCHAR(7),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  slow_mode_seconds INTEGER DEFAULT 0,
  members_only BOOLEAN DEFAULT false,
  min_account_age_days INTEGER DEFAULT 0
);
```

Pre-seeded: bears, cubs, bulls, white-sox, blackhawks, fire, sky

### chat_users

```sql
CREATE TABLE chat_users (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  badge VARCHAR(50),
  reputation_score INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  warnings_count INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT false,
  ban_expires_at TIMESTAMPTZ,
  ban_reason TEXT,
  muted_until TIMESTAMPTZ,
  favorite_team_slug VARCHAR(50),
  show_online_status BOOLEAN DEFAULT true,
  allow_dms VARCHAR(20) DEFAULT 'everyone',
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
  content_type VARCHAR(20) DEFAULT 'text',
  gif_url TEXT,
  reply_to_id UUID REFERENCES chat_messages(id),
  thread_root_id UUID REFERENCES chat_messages(id),
  thread_reply_count INTEGER DEFAULT 0,
  moderation_status VARCHAR(20) DEFAULT 'approved',
  moderation_flags JSONB DEFAULT '[]',
  moderation_score DECIMAL(3,2) DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  reaction_counts JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security

- chat_rooms: Public read for active rooms
- chat_users: Public read, users can update own profile
- chat_messages: Public read for approved messages, authenticated insert
- chat_dm_*: Only participants can read/write
- chat_reactions: Public read, authenticated insert/delete
- chat_reports: Authenticated insert only
- chat_moderation_rules: Service role only

## Indexes

```sql
CREATE INDEX idx_chat_messages_room ON chat_messages(room_id, created_at DESC);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_thread ON chat_messages(thread_root_id);
CREATE INDEX idx_dm_conversations_recent ON chat_dm_conversations(last_message_at DESC);
CREATE INDEX idx_presence_room ON chat_presence(room_id, last_ping_at DESC);
```

---

## 3. MODERATION

# Content Moderation System

## Overview

The moderation system operates on two levels:

1. Client-side (src/lib/chat/moderation.ts) - Pre-filters before sending
2. Server-side (src/app/api/chat/messages/route.ts) - Validates before storing

All messages are checked BEFORE they are published. Users never see blocked content.

## Moderation Categories

### Critical (Immediate Ban)

| Category | Examples | Action |
|----------|----------|--------|
| Hate Speech | Racial slurs, LGBTQ+ slurs, antisemitic terms | Ban 24h |
| Violence/Threats | Death threats, "kys", stalking threats | Ban 24h |
| Sexual Harassment | Requests for nudes, explicit solicitation | Ban 24h |

### High Severity (Block Message)

| Category | Examples | Action |
|----------|----------|--------|
| Profanity | F-word, C-word, severe insults | Block |
| Nudity/Sex | Porn terms, OnlyFans, explicit content | Block |
| Gambling | Betting sites, "guaranteed wins" | Block |
| Drugs/Alcohol | Drug names, "get high", alcohol promotion | Block |
| Unauthorized Links | Non-whitelisted URLs | Block |

### Medium Severity (Shadow Block)

| Category | Examples | Action |
|----------|----------|--------|
| Spam | Crypto promotion, MLM, "make money fast" | Shadow block |
| Sales | "Buy now", discount codes, promotions | Shadow block |
| Mild Profanity | "damn", "crap", "piss" | Shadow block |

### Low Severity (Warning)

| Category | Examples | Action |
|----------|----------|--------|
| Political Topics | Political figures, party names | Warn |
| All Caps Abuse | VERY LONG ALL CAPS MESSAGES | Warn |
| Trolling | "cope and seethe", "ratio" | Warn |

## Bypass Prevention

### Unicode/Homoglyph Detection
Catches: fυck, fսck, ｆｕｃｋ, 𝐟𝐮𝐜𝐤

### Leetspeak Detection
Catches: fvck, f*ck, sh1t, $hit, @$$hole

### Split Word Detection
Catches: f.u.c.k, f u c k, f-u-c-k

### Zalgo Text Detection
Blocks text with excessive combining characters

### Invisible Character Detection
Blocks: zero-width space, zero-width non-joiner, zero-width joiner, byte order mark

### Reversed Text Detection
Catches: kcuf → fuck, tihs → shit

### Encoding Detection
Blocks Base64 or hex-encoded content

## Sports Context Awareness

Allowed Sports Phrases:
- "killed it" / "killing it"
- "murdered that defense"
- "destroyed them"
- "crushed the competition"
- "they choked"
- "total bust"
- "he's washed"
- "fraud team"
- "sucks" (when referring to teams)
- "trash" / "garbage" (performance)

Rival Trash Talk Allowed:
- "FTP" (referring to Packers)
- "Cardinals fans are delusional"
- "Packers are overrated"

## Whitelisted Links

### Major Networks
espn.com, bleacherreport.com, si.com, cbssports.com, nbcsports.com, foxsports.com, theathletic.com, yahoo.com/sports

### League Sites
nfl.com, mlb.com, nba.com, nhl.com, mls.com

### Chicago Teams
chicagobears.com, mlb.com/cubs, mlb.com/whitesox, nba.com/bulls, nhl.com/blackhawks, chicagofirefc.com

### Reference Sites
pro-football-reference.com, baseball-reference.com, basketball-reference.com, hockey-reference.com

### Social (flagged for review)
twitter.com, x.com, youtube.com

## Rate Limiting

| Limit | Threshold | Action |
|-------|-----------|--------|
| Messages per minute | 10 | Mute |
| Messages per hour | 100 | Mute |
| Duplicate message cooldown | 30 seconds | Block |
| Similar message threshold | 80% similarity | Warn |
| New user cooldown | 5 seconds between messages | Block |

## Progressive Punishment

Escalation: Warning → Warning → Warning → Mute (5 min)
Then: Mute → Mute → Mute → Ban

Mute Duration Multiplier (2x each time):
- 1st: 5 minutes
- 2nd: 10 minutes
- 3rd: 20 minutes
- Max: 24 hours

## Toxicity Scoring (0.00 to 1.00)

Category Weights:
- hate_speech: 0.15
- violence: 0.15
- nudity_sex: 0.10
- harassment: 0.10
- gambling: 0.08
- drugs_alcohol: 0.08
- profanity: 0.05
- evasion: 0.05
- spam: 0.03
- sales: 0.03
- links: 0.02

---

## 4. API

# API Endpoints

## POST /api/chat/messages

Send a new message to a chat room.

Headers:
- Authorization: Bearer <supabase_access_token>
- Content-Type: application/json

Request Body:
```json
{
  "roomId": "uuid",
  "content": "Go Bears!",
  "contentType": "text",
  "gifUrl": null,
  "replyToId": null
}
```

Success Response (200):
```json
{
  "success": true,
  "message": {
    "id": "uuid",
    "content": "Go Bears!",
    "moderation_status": "approved",
    "user": {
      "display_name": "BearsFan123",
      "badge": "verified"
    }
  }
}
```

Moderation Error (400):
```json
{
  "error": "Message blocked: profanity",
  "moderation": {
    "action": "block",
    "flags": ["profanity"],
    "score": 0.65
  }
}
```

## GET /api/chat/messages

Query Parameters:
- roomId (required): UUID
- before: ISO Date (pagination)
- limit: Number (max 100, default 50)

## GET /api/gifs/search

Query Parameters:
- q (required): Search query
- limit: Number (max 50, default 20)

## GET /api/auth/disqus-sso

Generates Disqus SSO authentication payload.

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad request / Moderation blocked |
| 401 | Unauthorized |
| 403 | Forbidden (banned/muted) |
| 404 | Not found |
| 429 | Rate limit exceeded |
| 500 | Server error |

---

## 5. COMPONENTS

# React Components

All chat components are in src/components/chat/

## Component Hierarchy

```
TeamChatWidget (wrapper for article pages)
├── ChatProvider (context)
│   ├── FloatingChatButton
│   └── TeamChatPanel
│       ├── Header (team info, online count)
│       ├── Tabs (Room / DMs / History)
│       ├── MessageList
│       │   └── ChatMessage (multiple)
│       ├── ChatInput
│       │   ├── EmojiPickerInline
│       │   └── GifPickerInline
│       ├── DMList
│       └── ChatHistory
```

## TeamChatWidget

File: TeamChatWidget.tsx

```tsx
<TeamChatWidget
  categorySlug="chicago-bears"
  categoryName="Chicago Bears"
  articleId="uuid"
  compact={false}
/>
```

Category to Team Mapping:
- bears, chicago-bears, nfl → bears
- cubs → cubs
- white-sox → white-sox
- bulls → bulls
- blackhawks → blackhawks

## FloatingChatButton

File: FloatingChatButton.tsx

The "Hang out with [Team] fans" button.

Team Display Config:
```typescript
bears: {
  name: 'Bears',
  emoji: '🐻',
  color: '#0B162A',
  gradient: 'from-[#0B162A] to-[#C83803]',
}
```

## ChatMessage

Badge Types: staff, moderator, ai, verified, og_fan, contributor

Message Actions (on hover):
- Add reaction
- Reply
- More menu (delete, report, block)

## ChatInput

Features:
- Auto-resize textarea
- Character count (shows at 800+)
- Emoji/GIF toggle buttons
- Send button with team color
- Moderation error display
- Cooldown indicator (slow mode)

## EmojiPicker

Categories: Sports, Reactions, Faces, Animals, Food, Chicago

Recent Emojis stored in localStorage

## GifPicker

Quick Categories: Sports, Bears, Bulls, Cubs, Victory, Reaction

Features:
- Debounced search (300ms)
- Falls back to curated sports GIFs
- Content filtered by API

## ChatContext

File: src/contexts/ChatContext.tsx

Key State:
- isConnected, isAuthenticated
- currentRoom, messages
- dmConversations, dmMessages
- isOpen, activeTab
- staffOnline, onlineUsers

Key Actions:
- connect(), disconnect()
- joinRoom(), leaveRoom()
- sendMessage(), editMessage(), deleteMessage()
- addReaction(), removeReaction()
- openDM(), sendDM()
- reportMessage(), blockUser()

---

## 6. ENVIRONMENT

# Environment Variables

## Required

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-key
```

## Optional

```bash
TENOR_API_KEY=your-tenor-key
GIPHY_API_KEY=your-giphy-key
DISQUS_SECRET_KEY=your-disqus-secret
DISQUS_PUBLIC_KEY=your-disqus-public
```

## Supabase Configuration

Enable Realtime for tables:
- chat_messages
- chat_reactions
- chat_presence
- chat_dm_messages

## Production Checklist

Security:
- [ ] Service role key not exposed client-side
- [ ] RLS policies active on all tables
- [ ] API routes validate authentication
- [ ] Rate limiting configured

Performance:
- [ ] Realtime enabled for required tables
- [ ] Database indexes created
- [ ] Message limit reasonable (50-100)

Monitoring:
- [ ] Moderation log table active
- [ ] Error tracking configured
- [ ] Rate limit alerts set up

---

## 7. AI RESPONDER

# AI Auto-Responder

The AI responder (src/lib/chat/ai-responder.ts) is a Claude-powered assistant that engages with fans when no staff is online.

## When AI Responds

Will respond when:
1. No staff member has messaged in last 2 minutes
2. User's message is a question OR mentions sports OR is a greeting
3. Message contains team names, player names, or sports terms

Will NOT respond when:
1. Staff is actively chatting
2. Message doesn't need a response
3. Too many AI responses in short period

## Personality

- Die-hard Chicago sports fan
- Passionate, enthusiastic, fun to talk to
- Conversational, casual tone like talking to friends at a bar
- Chicago slang and references
- Self-deprecating humor about Chicago sports suffering
- Always supportive of Chicago teams
- Playful trash talk about rivals

## Team Knowledge

### Bears
- Stadium: Soldier Field
- Championships: 1921, 1932, 1933, 1940, 1941, 1943, 1946, 1963, 1985
- Legends: Walter Payton, Mike Ditka, Dick Butkus, Brian Urlacher
- Fan Phrases: Bear Down!, Da Bears!, FTP, Monsters of the Midway

### Cubs
- Stadium: Wrigley Field
- Championships: 1907, 1908, 2016
- Legends: Ernie Banks, Ryne Sandberg, Ron Santo
- Fan Phrases: Go Cubs Go!, Fly the W!

### Bulls
- Stadium: United Center
- Championships: 1991, 1992, 1993, 1996, 1997, 1998
- Legends: Michael Jordan, Scottie Pippen, Dennis Rodman, Derrick Rose
- Fan Phrases: See Red!, 6 rings!

### White Sox
- Championships: 1906, 1917, 2005
- Legends: Frank Thomas, Paul Konerko, Mark Buehrle
- Fan Phrases: Go Go White Sox!, South Side Pride

### Blackhawks
- Championships: 1934, 1938, 1961, 2010, 2013, 2015
- Legends: Bobby Hull, Stan Mikita, Jonathan Toews, Patrick Kane
- Fan Phrases: One Goal!, Chelsea Dagger!

## Rival Trash Talk

Packers: "FTP! Always and forever!", "Green Bay? More like Green Boring."
Cardinals: "Cardinals fans are like their pizza - pretending to be good!"

## AI Response Rules

1. ALWAYS support Chicago teams - be constructive
2. Trash talk rivals playfully, never hatefully
3. If you don't know something, say so
4. Keep responses concise - 1-3 sentences
5. Use emojis sparingly (🐻🏈⚾🏀🏒)
6. Never discuss politics, religion, or controversial topics
7. Be inclusive and welcoming
8. Redirect negativity to something positive
9. Reference real stats, players, games when possible
10. Have FUN!

## API Configuration

```typescript
model: 'claude-sonnet-4-20250514'
max_tokens: 300
```

## Rate Limiting

- Only responds when shouldAIRespond() returns true
- Checks if staff responded in last 2 minutes
- Built-in delay before responding (1.5-3.5 seconds)

---

END OF DOCUMENTATION
