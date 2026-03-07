# User Profile & Onboarding Specification

> **Product:** SportsMockery Fan Profile System
> **Date:** March 7, 2026
> **Status:** Draft for review
> **Audience:** Product, Design, Engineering, Growth

---

## Context

The admin `/admin/users` tab currently shows a user table with role assignment, password reset, and delete. There is no way to view or edit a user's profile, preferences, or personalization data. The existing `sm_user_preferences` table stores only `favorite_teams` and `notification_prefs`. This spec defines the full user profile system: what we collect, when we collect it, and how it powers personalization.

---

## A. Profile Field Table

| Internal Field | User-Facing Label | Description Shown to User | Required | Input Type | Personalization Value | Notes |
|---|---|---|---|---|---|---|
| `display_name` | Display Name | "How other fans will see you" | Yes (signup) | Text input | Identity across comments, leaderboards, fan chat | Max 30 chars. Validate for profanity. Pre-fill from email prefix. |
| `username` | Username | "Your unique handle on SportsMockery" | Yes (signup) | Text input with availability check | @mentions in fan chat, leaderboard URLs | Lowercase alphanumeric + underscores. 3-20 chars. Must be unique. Show real-time availability. |
| `favorite_teams` | My Teams | "Pick the Chicago teams you follow" | Yes (onboarding) | Team logo chips (tap to select) | Feed ranking, content filtering, alert routing, Scout AI context | Pre-select Bears by default. Min 1 team. Show all 5 Chicago teams as tappable cards. |
| `primary_team` | #1 Team | "Which team matters most to you?" | Optional (onboarding) | Single-select from chosen teams | Determines default feed, homepage hero, primary alert channel | Only show if user selected 2+ teams. Auto-set if only 1 team chosen. |
| `favorite_players` | Favorite Players | "Follow specific players for updates" | Optional (progressive) | Search + chips | Player-specific alerts, stat cards in feed, trade simulator context | Typeahead search against player tables. Show headshots. Cap at 10. |
| `content_interests` | Topics I Care About | "What kind of content do you want more of?" | Optional (onboarding) | Chip multi-select | Feed scoring, content recommendations | Options: Trade Rumors, Draft Coverage, Game Recaps, Stats & Analytics, Injury Reports, Hot Takes, Film Breakdown, Fantasy, Betting Lines |
| `preferred_formats` | How I Like My Content | "Pick your preferred content formats" | Optional (progressive) | Chip multi-select | Format weighting in feed | Options: Articles, Video, Podcasts, Data Cards, Quick Takes, Polls |
| `ai_persona` | Scout AI Personality | "How should Scout talk to you?" | Optional (progressive) | Radio cards with preview | Scout AI tone and response style | Options: Straight Stats (analytical), Homer (optimistic fan), Real Talk (blunt), Trash Talk (provocative). Show sample Scout response for each. |
| `fan_intensity` | Fan Level | "How deep are you into Chicago sports?" | Optional (onboarding) | Slider or 3 illustrated cards | Content depth calibration, notification frequency defaults | Options: Casual Fan / Dedicated Fan / Diehard. Affects default notification density. |
| `location_region` | Where I'm At | "Helps us with local game times and events" | Optional (progressive) | Dropdown (US regions) or auto-detect | Time zone for alerts, local event surfacing | Options: Chicagoland, Illinois (non-Chicago), Midwest, East Coast, West Coast, South, International. Do NOT ask for precise location. |
| `zip_code` | Zip Code | "For local sports bar events and watch parties" | Optional (progressive) | 5-digit text input | Hyper-local event recommendations | Only surface after user engages with events content. Never require. |
| `notification_preferences` | Alert Preferences | "Control what notifications you get" | Optional (onboarding) | Toggle switches grouped by type | Notification routing | Groups: Breaking News, Game Alerts, Score Updates, Trade Rumors, Weekly Digest. Default: Breaking + Game on, rest off. |
| `game_day_profile` | Game Day Mode | "How do you watch games?" | Optional (progressive) | Illustrated cards | Game day content + alert timing | Options: At the Stadium, Watch Party, Couch Mode, Scores Only. Affects live game notification cadence. |
| `favorite_creators` | Writers I Follow | "Get more from writers you like" | Optional (progressive) | Creator cards with follow buttons | Boost content from followed creators in feed | Pull from `sm_authors`. Show avatar + recent headline. |
| `onboarding_completed` | -- | -- | System | -- | Gate for onboarding prompts | Boolean. Set `true` after user completes or skips Step 2. |
| `behavioral_profile_json` | -- | -- | System | -- | ML-driven personalization | Auto-populated from reading patterns, click-through, dwell time, Scout queries. Never exposed. |
| `last_personalization_refresh_at` | -- | -- | System | -- | Cache invalidation for feed ranking | Timestamp. Updated when preferences change or behavioral profile refreshes. Never exposed. |

---

## B. Required vs Optional Recommendation

### Required at Signup (2 fields)
- **display_name** -- needed for any social feature
- **username** -- needed for identity, @mentions, shareable profiles

These are the only fields that gate account creation. Keep the signup form to email + password + display name + username. Nothing else.

### Optional at Onboarding (shown immediately after signup, fully skippable)
- **favorite_teams** -- highest-impact personalization signal; pre-select Bears
- **primary_team** -- only if 2+ teams selected
- **content_interests** -- cheap to collect, high feed-ranking value
- **fan_intensity** -- sets smart defaults for notification density
- **notification_preferences** -- let users set boundaries early

### Collected Later via Progressive Profiling
- **favorite_players** -- surface after user views 3+ player pages
- **preferred_formats** -- surface after user consumes 10+ pieces of content
- **ai_persona** -- surface after user's 3rd Scout AI query
- **game_day_profile** -- surface on first game day after signup
- **location_region** -- surface when user engages with schedule or events
- **zip_code** -- surface only if user taps a local events feature
- **favorite_creators** -- surface after user reads 3+ articles from same author

### Internal Only (never shown to users)
- **onboarding_completed** -- system flag
- **behavioral_profile_json** -- ML/analytics data
- **last_personalization_refresh_at** -- cache timestamp

---

## C. Recommended Onboarding Flow

### Step 1: Create Account
Email + password + display name + username. One screen. One CTA: "Join SportsMockery." Social login (Google/Apple) auto-fills display name.

### Step 2: Pick Your Teams
Full-bleed screen with 5 Chicago team logos as large tappable cards. Bears pre-selected. Copy: "Which teams do you follow?" Skip link visible but de-emphasized. If 2+ teams selected, inline prompt: "Which is your #1?" This is the single most important personalization moment.

### Step 3: Dial In Your Feed (optional, skippable)
Two quick sections on one screen:
- **Topics:** Chip grid of content interests (tap to toggle)
- **Fan level:** 3 illustrated cards (Casual / Dedicated / Diehard)

Copy: "Help us show you the good stuff." Skip link: "I'll let my reading do the talking."

### Step 4: Set Your Alerts (optional, skippable)
Simple toggle list. Smart defaults based on fan intensity from Step 3 (Diehard = more on, Casual = fewer). Copy: "We'll only ping you when it matters." Skip link: "Use defaults."

### Step 5: You're In
Confirmation screen. Show their personalized feed immediately. No dead end. Copy: "Your feed is ready. We'll keep learning what you like." Subtle prompt to download the app if on mobile web.

### Ongoing: Progressive Profiling
After onboarding, surface contextual prompts as inline cards in the feed or as lightweight modals at natural moments. Never interrupt content consumption. One ask at a time. Always dismissable and never repeated if dismissed.

---

## D. Best Field Grouping for UI

### Admin Profile View (what admins see when clicking a user name)

**Identity**
- Display Name, Username, Email, Avatar, Role, Join Date, Last Login

**Fan DNA**
- Favorite Teams, Primary Team, Fan Intensity, Favorite Players

**Content Preferences**
- Content Interests, Preferred Formats, Favorite Creators

**AI & Personalization**
- Scout AI Persona, Behavioral Profile Summary (read-only badge: e.g., "Stats-heavy reader, Bears-focused"), Onboarding Status

**Alerts & Location**
- Notification Preferences, Game Day Profile, Location Region, Zip Code

**Account & Activity**
- GM Trade Count, Scout Query Count, Comment Count, Reputation Score, Fan Council Status

### User-Facing Profile/Settings Page

**My Profile** -- Display Name, Username, Avatar upload

**My Teams** -- Team chips, Primary team, Favorite players

**My Feed** -- Content interests, Preferred formats, Fan level

**Scout AI** -- AI persona selector with previews

**Notifications** -- Alert toggles, Game day mode

**Location** -- Region, Zip (with clear explanation of why)

---

## E. UX Recommendations

### Use Chips (tap to toggle)
- `favorite_teams` -- team logos as chip cards
- `content_interests` -- topic chips in a wrapping grid
- `preferred_formats` -- format chips
- `favorite_players` -- search + chip display for selected players

### Use Multi-Select (checkboxes or toggles)
- `notification_preferences` -- toggle switches grouped by category

### Use Single-Select Cards
- `primary_team` -- highlight from selected teams
- `fan_intensity` -- 3 illustrated cards with short descriptions
- `ai_persona` -- radio cards with sample Scout response preview
- `game_day_profile` -- illustrated cards

### Use Text Input
- `display_name` -- short text with character count
- `username` -- text with real-time uniqueness validation
- `zip_code` -- masked 5-digit input

### Use Dropdown
- `location_region` -- simple dropdown, ~7 options

### Default Based on Behavior Later
- `preferred_formats` -- observe what they consume, pre-fill after 2 weeks
- `content_interests` -- seed from reading patterns after 1 week
- `favorite_players` -- suggest based on most-viewed player pages
- `ai_persona` -- default to "Straight Stats," adjust if Scout usage patterns suggest otherwise
- `game_day_profile` -- suggest based on engagement patterns during live games

### What to Avoid Asking Too Early
- **Zip code** -- feels invasive before trust is established
- **Favorite players** -- requires domain knowledge the user may not have on day 1
- **Preferred formats** -- meaningless until they've seen the content
- **Game day profile** -- irrelevant outside game context
- **AI persona** -- meaningless if they haven't used Scout yet
- **Favorite creators** -- requires familiarity with the writing staff

---

## F. Final Product Recommendation

### Launch Version (V1)

**Signup form:** Email, password, display name, username. That's it. Four fields. Social login fills display name automatically.

**Post-signup onboarding:** Two screens, both skippable.
1. Pick your teams (5 logo cards, Bears pre-selected)
2. Pick your topics + fan level (chips + 3 cards, one screen)

**Skip everything else.** No alerts setup at signup. No location. No player follows. No AI persona. Default notifications to Breaking News + Game Alerts on. Default fan level to Dedicated.

**Progressive profiling V1:** Ship 3 contextual prompts:
- "Follow this player?" card on player pages (after 3rd player page view)
- "How should Scout talk to you?" after 3rd Scout query
- "Set up game day alerts?" on first live game day

**Admin profile view:** Ship immediately. When an admin clicks a username in `/admin/users`, show a slide-out panel or detail page with all available profile data organized by the groupings above. Read-only for system fields, editable for user-facing fields. This gives admins visibility into personalization data without requiring users to fill anything out.

**Database:** Extend `sm_user_preferences` with the new columns, or create a new `sm_user_profiles` table for identity fields (display_name, username, avatar) and keep preferences separate. The cleaner path is a dedicated `sm_user_profiles` table joined to `sm_users` by user_id, since `sm_users` mirrors Supabase Auth and shouldn't carry product-level profile data.

### What This Gets You

- Registration conversion stays high (4-field signup, no friction)
- 80% of personalization value comes from team selection alone (feed ranking, alerts, Scout context)
- Content interests add the next 15% (topic weighting)
- Everything else is gravy that accumulates over time through behavior and progressive asks
- Admin visibility into user profiles unlocks support, moderation, and growth insights immediately

Ship this. Iterate from usage data.
