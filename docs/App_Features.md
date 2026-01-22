# Sports Mockery - Complete App Features

## Overview

Sports Mockery is a comprehensive Chicago sports platform providing news, analysis, real-time data, AI-powered chat, and community engagement for fans of all five major Chicago teams.

---

## 1. User Authentication & Authorization

- **Supabase Auth Integration** - Full authentication via Supabase with JWT tokens
- **User Registration** - `/signup` page with account creation
- **User Login** - `/login` page with email/password authentication
- **Remember Me** - 24-hour persistent sessions that reset on each visit
- **Password Recovery** - `/forgot-password` and `/reset-password` pages
- **OAuth Callback** - `/api/auth/callback` for third-party authentication
- **User Profiles** - `/profile` and `/profile/settings` pages with profile customization
- **Role-Based Access Control** - Admin, moderator, staff, verified user badges
- **User Preferences** - `/api/user/preferences` for team selection and notification settings

---

## 2. Content & Article Features

### Article Management
- Full CRUD operations for articles with draft/published status
- Featured images with automatic optimization
- Author information and attribution
- Publication timestamps and reading time estimates
- View counters and tracking
- SEO metadata (titles, descriptions)
- Article tags and categorization
- Article archiving

### Article Display
- Homepage with featured posts
- Category pages (`/[category]/[slug]`)
- Article detail pages with full content rendering
- Related articles functionality

### Content Editor
- TipTap rich text editor with extensions
- Character count tracking
- Bubble menu for formatting
- YouTube video embeds
- Image uploads and management
- Shortcode support for special content blocks

---

## 3. Team-Specific Features

### Chicago Bears (NFL)
- **Game Data**: Upcoming/past games, full season schedule, scores, detailed box scores
- **Team Roster**: Complete roster listing, player database, individual player pages
- **Player Statistics**: Passing, rushing, receiving, and defensive stats with game logs
- **Live Updates**: Game ticker, season record tracking
- **Pages**: `/chicago-bears`, `/chicago-bears/roster`, `/chicago-bears/schedule`, `/chicago-bears/scores`, `/chicago-bears/stats`, `/chicago-bears/players/[slug]`

### Chicago Bulls (NBA)
- Team hub at `/chicago-bulls`
- Stats and analytics
- Roster, schedule, standings

### Chicago Cubs (MLB)
- Team hub at `/chicago-cubs`
- Stats and analytics
- Roster, schedule, standings

### Chicago White Sox (MLB)
- Team hub at `/chicago-white-sox`
- Stats and analytics
- Roster, schedule, standings

### Chicago Blackhawks (NHL)
- Team hub at `/chicago-blackhawks`
- Stats and analytics
- Roster, schedule, standings

### Generic Team Features
- Data Hub (`/datahub` and `/[team]/datahub`) for comprehensive team data
- Team branding, colors, logos configuration
- Team-specific pages with roster, schedule, standings

---

## 4. AI & Intelligent Features

### AI Chat Personalities (Fan Chat)
5 unique AI personas for team-specific engagement:

| Personality | Team | Character |
|------------|------|-----------|
| **BearDownBenny** | Bears | Late 30s, southwest suburbs |
| **WrigleyWill** | Cubs | Early 30s, Wrigleyville |
| **WindyCityHoops** | Bulls | Late 20s, West Loop |
| **SouthSideSoxSarah** | White Sox | Early 40s, South Side |
| **MadhouseMike** | Blackhawks | Mid 30s, Northwest Side |

### AI Response Features
- Profile traits and neighborhood preferences
- Response patterns and tone customization
- Accuracy requirements and fact-verification rules
- Rate limiting (30 second min between messages, 20 messages/hour max)
- Trigger conditions (direct mention, alone with user)

### Ask AI Feature
- AI query interface at `/ask-ai` for Chicago sports questions
- Pre-built suggested prompts
- Chart.js integration for displaying stats
- Message history with timestamps
- Markdown rendering and source attribution
- Bonus insights generation

### AI Moderation
- Content moderation with scoring system
- Strictness rules for AI response accuracy
- Message filtering for inappropriate content

---

## 5. Chat Features

### Real-Time Chat System
8 pre-seeded team chat rooms:
- Bears Den (#0B162A)
- Bulls Nation (#CE1141)
- Cubs Talk (#0E3386)
- White Sox (#27251F)
- Blackhawks (#CF0A2C)
- Chicago Fire (#7B1113)
- Chicago Sky (#5091CD)
- Global Chicago Lounge

### Chat Functionality
- Text, GIF, and emoji content types
- Reply chains and threading
- Emoji reactions
- Message pinning and highlighting
- Edit and delete capabilities
- Moderation status tracking (approved, pending, blocked, shadow_blocked)
- Unread message notifications
- Direct messaging support

### User Features
- Display names and avatars
- Badges: staff, moderator, ai, verified, og_fan, contributor
- Reputation scores
- Ban and mute capabilities

### Chat Moderation
- Ban, mute, warning system
- Configurable mute periods
- Slow mode per room
- Admin moderation dashboard

---

## 6. Subscription & Payment Features

### Stripe Integration
- Checkout for initiating purchases
- Billing portal for subscription management
- Webhooks for handling Stripe events
- Customer and subscription ID tracking

### Subscription Tiers

| Tier | Features |
|------|----------|
| **Free** | 5 Ask AI queries/day, ad-supported, basic chat |
| **SM+ Monthly** | Unlimited AI, ad-free, full chat access, AR tours |
| **SM+ Annual** | Same as monthly (discounted) |

### Pro Features
- AR stadium tours
- Full Fan Chat access
- Ad-free reading
- Unlimited Ask AI queries

---

## 7. Admin & Moderation Features

### Admin Dashboard (`/admin`)
- Overview stats (posts, categories, authors, views)
- Recent activity feed
- Quick actions
- Analytics with views over time, top posts, category breakdown

### Content Management
- **Posts** (`/admin/posts`): List, create, edit, delete, bulk actions, status filtering
- **Categories** (`/admin/categories`): Full CRUD operations
- **Authors** (`/admin/authors`): Author management
- **Media** (`/admin/media`): Image/file uploads and management

### Advanced Admin Features
- **Charts** (`/admin/charts`): Chart builder with multiple types, DataLab integration
- **Polls** (`/admin/polls`): Poll creation, vote tracking, analytics
- **Notifications** (`/admin/notifications`): Push notification sending and history
- **Bot Management** (`/admin/bot`): Automated system control
- **AI Settings** (`/admin/ai`): AI personality configuration
- **Feed Scoring** (`/admin/feed-scoring`): Content ranking algorithms
- **Ads Management** (`/admin/ads`): Advertisement system
- **User Management** (`/admin/users`): User creation, passwords, sync

---

## 8. Notification System

### Push Notifications
- OneSignal integration for mobile push
- Notification history tracking
- User notification preferences
- Types: Breaking news, new articles, chat mentions, messages

### User Notifications
- Notifications page (`/notifications`)
- Per-user preference configuration
- Unread tracking

---

## 9. Search & Discovery

### Full-Text Search (`/search`)
- Query string search
- Category filtering
- Author filtering
- Date range filtering (day, week, month, year)
- Pagination support
- Voice search capability
- Recent and popular searches
- Search analytics

---

## 10. Analytics & Insights

### Event Tracking
- Page views
- Custom events
- Scroll depth
- Time on page

### Data Retrieval
- Top posts by views
- Trending posts
- Views by date
- Category breakdown
- Site statistics

### Article Analytics
- View tracking per article
- View counter components
- Client-side tracking

---

## 11. Personalization & User Preferences

### Favorite Teams
- Multi-team selection (Bears default)
- Personalized feed based on selections
- Team-specific content filtering

### Theme & UI
- Dark/light mode toggle
- Global theme management
- Responsive design (mobile-first)

---

## 12. Special Content Features

### Design Showcase
- Immersive design (`/designs/immersive`)
- Spotlight design (`/designs/spotlight`)
- Ultimate design (`/designs/ultimate`)

### Fan Features
- **Fan Zone** (`/fan-zone`): Fan engagement hub
- **Governance** (`/governance`): Community decision-making
- **Collectibles** (`/collectibles`): NFT/collectible showcase
- **Predictions** (`/predictions`): User predictions
- **Metaverse** (`/metaverse`): 3D/AR experiences with Three.js

---

## 13. Advanced Content Delivery

### Audio Content
- Audio playback API
- Sequential playback
- Custom audio player UI
- Podcast player
- Background audio on mobile

### Video & Highlights
- YouTube highlights integration
- Highlight generation
- GIF search and support

### Content Rendering
- Markdown support
- Custom shortcode processor
- Full HTML content display

---

## 14. Data & Statistics

### Team Data APIs
- Content feeds
- Comprehensive team stats
- Team metadata
- Live ticker updates

### Sports Data Integration
- ESPN API (Bears data sync)
- NFL, MLB, NBA, NHL official data
- Reference sites (Pro-Football-Reference, etc.)

### Player Pages
- Player directory (`/players`)
- Individual player pages with:
  - Game logs
  - Season statistics
  - Career information
  - Position-specific stats

---

## 15. Mobile App Features

### Platform
- React Native with Expo
- Expo Router file-based routing

### Navigation
Bottom tab bar with:
- Home feed
- Chat
- Ask AI
- Teams
- Profile

### Screens
- Articles (feed and detail views)
- Team pages
- Chat rooms
- Ask AI interface
- Search
- User profile
- Audio/listening
- Notifications

### Native Capabilities
- Camera access (profile photos)
- Photo library access
- Vibration
- Background audio playback
- Push notifications (OneSignal)
- Google Mobile Ads

---

## 16. Informational Pages

- **About** (`/about`): Company information
- **Contact** (`/contact`): User inquiries
- **Privacy** (`/privacy`): Privacy policy
- **Pricing** (`/pricing`): Subscription tiers
- **Authors** (`/authors`): Author directory and profiles

---

## 17. External Integrations

### Data Sources
- ESPN API
- NFL.com, MLB.com, NBA.com, NHL.com
- Pro-Football-Reference, Baseball-Reference, Basketball-Reference, Hockey-Reference

### Services
- **Supabase**: Backend, database, auth, storage
- **Stripe**: Payment processing
- **OneSignal**: Push notifications
- **Anthropic**: Claude AI integration
- **Resend**: Transactional emails
- **Vercel**: Hosting and deployment

---

## 18. Bot & Automation

### Bot System
- Configuration management
- Status monitoring
- Automated posting
- Health checks

### Cron Jobs
- Bears live updates
- Bears data sync
- General data synchronization

---

## 19. Technical Stack

### Frontend
- Next.js 16.1.1
- React 19.2.3
- TypeScript 5.9.3
- Tailwind CSS 4
- Framer Motion (animations)
- Chart.js / D3 (data visualization)
- Three.js (3D/AR experiences)

### Backend
- Supabase (PostgreSQL)
- Next.js API Routes
- Stripe API
- Anthropic AI SDK

### Mobile
- React Native
- Expo SDK 54
- Expo Router

---

## 20. Summary Statistics

| Metric | Count |
|--------|-------|
| API Endpoints | 68 |
| React Components | 334+ |
| AI Team Personalities | 5 |
| Chat Rooms | 8 |
| Chicago Teams Covered | 5 |
| Subscription Tiers | 3 |

---

## Key Features At A Glance

1. **Comprehensive Chicago Sports Coverage** - All 5 major teams with real-time data
2. **AI-Powered Fan Chat** - 5 unique AI personalities for engaging conversations
3. **Ask AI** - General sports Q&A with data visualization
4. **Real-Time Chat** - Team-specific chat rooms with full moderation
5. **Subscription System** - Free and premium tiers with Stripe
6. **Mobile App** - Native iOS/Android app with full feature parity
7. **Rich Content** - Articles, audio, video, and interactive media
8. **Personalization** - Favorite teams, themes, and notification preferences
9. **Advanced Admin** - Full content management and analytics
10. **Push Notifications** - Breaking news and engagement alerts
