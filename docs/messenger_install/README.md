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

1. Run database migrations (see [DATABASE.md](./DATABASE.md))
2. Configure environment variables (see [ENVIRONMENT.md](./ENVIRONMENT.md))
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

## Documentation

- [DATABASE.md](./DATABASE.md) - Database setup and schema
- [MODERATION.md](./MODERATION.md) - Content moderation rules
- [API.md](./API.md) - API endpoints
- [COMPONENTS.md](./COMPONENTS.md) - React components
- [ENVIRONMENT.md](./ENVIRONMENT.md) - Environment variables
