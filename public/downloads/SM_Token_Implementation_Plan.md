# SM Token Virtual Currency - Complete Implementation Plan

> **Document Version:** 1.0
> **Created:** January 29, 2026
> **Purpose:** End-to-end business and technical plan for SM Token on test.sportsmockery.com
> **Status:** PLANNING PHASE - No code written yet

---

## Executive Summary

**What We're Building:** A virtual currency system called "SM Tokens" that lets logged-in users wager on the outcomes of Chicago sports news, rumors, and predictions. An AI model named "TokenIQ" analyzes post content and media sentiment to set fair odds, transforming passive article reading into active engagement.

**Why It Will Succeed Where Others Failed:** Based on extensive competitive research, most prediction platforms failed due to:
1. **Prize degradation** - We use virtual tokens with no cash prizes, eliminating this trap
2. **Technical neglect** - We build on proven infrastructure (GM Trade Simulator architecture)
3. **No real community** - We're hyperlocal (Chicago-only) with existing Fan Chat community
4. **Fake influence** - Users predict real outcomes, not meaningless votes
5. **Demotivating leaderboards** - Weekly resets + team-specific boards keep everyone competitive

**The SM Token Difference:** Unlike national platforms drowning in generic content, SM Tokens are hyper-focused on Chicago sports speculation that our audience already consumes. We're not creating a gambling platform - we're gamifying the sports news experience our users already have.

---

## Part 1: Why This Works for SportsMockery

### The Content Advantage

SportsMockery already produces exactly the content that drives prediction engagement:

| Content Type | Example | Wagerable Outcome |
|--------------|---------|-------------------|
| Trade Rumors | "Bears pursuing Maxx Crosby" | Will trade happen? |
| Player Predictions | "Caleb Williams MVP odds" | End-of-season stats |
| Draft Speculation | "Bears targeting OT at #10" | Draft pick position/player |
| Coaching News | "Eberflus seat warming up" | Coaching change timing |
| Free Agency | "Bulls eyeing Jimmy Butler" | Signing probability |
| Injury Updates | "Bedard timeline for return" | Games missed total |

### Existing Infrastructure to Leverage

| Feature | How TokenIQ Uses It |
|---------|---------------------|
| **Scout AI** | TokenIQ extends the same architecture for odds analysis |
| **GM Trade Simulator** | Grade system becomes wager validation; leaderboard patterns reused |
| **PostIQ** | Content analysis prompts adapted for odds generation |
| **SentimentOrb** | Replace mock data with real TokenIQ sentiment scores |
| **User Preferences** | Favorite teams filter wager opportunities |
| **Post Editor Sidebar** | "SM Token Wager" checkbox follows Push/Social pattern |

---

## Part 2: TokenIQ AI System Design

### What TokenIQ Does

TokenIQ is a Claude-powered AI that:
1. **Reads post content** when author checks "SM Token Wager"
2. **Analyzes probability** using SportsMockery's media sentiment patterns
3. **Sets odds** for Yes/No or multiple outcomes
4. **Creates resolution criteria** (what determines win/loss)
5. **Tracks market movement** as users wager
6. **Auto-resolves** when outcome is confirmed

### TokenIQ Knowledge Base

TokenIQ will be trained on:
- Historical SportsMockery trade rumors and outcomes
- Chicago beat reporter accuracy tracking
- Team transaction patterns (Bears more active in free agency, Bulls in trades)
- Seasonal timing (trades spike at deadlines, FA opens March/July)
- Source reliability scoring (Schefter vs. random Twitter)

### Odds-Setting Algorithm

```
Base Probability = 50% (neutral start)

Adjustments:
+/- 5-15%  Source credibility (Schefter +15%, "per sources" -10%)
+/- 5-10%  Historical team behavior (team known for this type of move?)
+/- 5-10%  Financial feasibility (cap space, contract math)
+/- 5-10%  Timing logic (deadline proximity, draft position)
+/- 5-15%  Media sentiment score from Scout AI data
+/- 5-10%  Related rumors momentum (multiple confirmations)

Final Odds = Converted to betting line format
Example: 65% probability = -185 (Yes) / +155 (No)
```

### TokenIQ Prompt Structure

```markdown
You are TokenIQ, the odds-setting AI for SportsMockery's SM Token system.

Your job is to analyze article content and create fair, engaging betting lines
for Chicago sports fans. You specialize in:
- Trade rumors and predictions
- Player performance projections
- Draft speculation
- Coaching/management changes
- Free agency predictions

For each article, you must determine:
1. Is this wagerable? (Has a verifiable future outcome)
2. What is the main prediction/claim?
3. What are the possible outcomes? (Yes/No or multiple choice)
4. What is the base probability for each outcome?
5. What evidence supports/contradicts the prediction?
6. What are the resolution criteria? (How do we know who wins?)
7. What is the expiration date? (When does this resolve?)

CRITICAL RULES:
- Never set odds below 10% or above 90% (keep it interesting)
- Factor in source credibility heavily
- Consider team-specific transaction history
- Account for seasonal timing (trade deadline, draft, free agency)
- Create clear, unambiguous resolution criteria
```

---

## Part 3: User Experience Design

### User Flow: Reading a Wagerable Article

```
1. User opens article → sees "SM TOKEN WAGER" badge in header
2. Reads article content as normal
3. At bottom, sees TokenIQ Wager Panel:
   ┌─────────────────────────────────────────────────────┐
   │  🎯 SM TOKEN WAGER                                  │
   │                                                     │
   │  "Will the Bears trade for Maxx Crosby?"           │
   │                                                     │
   │  ┌─────────────┐    ┌─────────────┐                │
   │  │  YES  -185  │    │  NO  +155   │                │
   │  │  1,247 bets │    │  893 bets   │                │
   │  └─────────────┘    └─────────────┘                │
   │                                                     │
   │  Your Balance: 🪙 1,500 tokens                      │
   │  Wager Amount: [____100____] tokens                 │
   │                                                     │
   │  Potential Win: 54 tokens (YES) / 155 tokens (NO)  │
   │                                                     │
   │  [PLACE WAGER]                                      │
   │                                                     │
   │  ⏰ Resolves: March 15, 2026 (Trade Deadline)       │
   │  📊 TokenIQ Confidence: 68%                         │
   │  ℹ️ Why these odds? [Expand]                        │
   └─────────────────────────────────────────────────────┘
4. User selects outcome, enters wager amount, confirms
5. Wager appears in their portfolio on profile page
6. When outcome determined, tokens auto-credited/debited
```

### User Flow: Author Creating Wagerable Post

```
1. Author writes article in /studio/posts/new or /admin/posts/new
2. In right sidebar, after "Push Notification" and "Social Media" sections:
   ┌─────────────────────────────────────────────────────┐
   │  🪙 SM Token Wager                                  │
   │                                                     │
   │  ☐ Enable Token Wager                              │
   │                                                     │
   │  [Checking this will allow readers to wager        │
   │   tokens on the outcome of this article's          │
   │   prediction. TokenIQ will analyze your content    │
   │   and set fair odds automatically.]                │
   └─────────────────────────────────────────────────────┘
3. When checked, TokenIQ panel expands:
   ┌─────────────────────────────────────────────────────┐
   │  TokenIQ Analysis                                   │
   │                                                     │
   │  Detected Prediction:                               │
   │  "Chicago Bears will trade for Maxx Crosby"        │
   │                                                     │
   │  Suggested Outcomes:                                │
   │  ○ Yes/No (binary)                                 │
   │  ○ Multiple choice                                 │
   │  ○ Over/Under (numeric)                            │
   │                                                     │
   │  Suggested Odds: -185 / +155                        │
   │  TokenIQ Confidence: 68%                            │
   │                                                     │
   │  Resolution Date: [2026-03-15] (Trade Deadline)     │
   │                                                     │
   │  Resolution Criteria:                               │
   │  [Official team announcement of completed trade    │
   │   involving Maxx Crosby to Chicago Bears]          │
   │                                                     │
   │  [Override odds manually] (admin only)             │
   └─────────────────────────────────────────────────────┘
4. Author can accept TokenIQ suggestions or modify (admins only)
5. On publish, wager is live immediately
```

### Profile Page: Token Portfolio

```
/profile/tokens (new tab on user profile)

┌─────────────────────────────────────────────────────────────┐
│  🪙 SM Tokens                                               │
│                                                             │
│  Balance: 2,450 tokens                                      │
│  All-Time Winnings: +1,450 tokens                           │
│  Win Rate: 62% (31/50 wagers)                               │
│  Rank: #47 of 1,234 users                                   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Active Wagers (3)                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Bears trade for Maxx Crosby                         │   │
│  │ Your pick: YES @ -185 | Wagered: 100 | Win: 54     │   │
│  │ Current odds: -220 / +180 (moved in your favor)    │   │
│  │ Expires: Mar 15, 2026                               │   │
│  └─────────────────────────────────────────────────────┘   │
│  ...                                                        │
│                                                             │
│  Recent Results (5)                                         │
│  ✅ Bulls keep Zach LaVine past deadline    +200 tokens    │
│  ❌ Blackhawks draft Celebrini at #1        -150 tokens    │
│  ✅ Cubs sign pitcher before spring training +75 tokens    │
│  ...                                                        │
│                                                             │
│  [View Full History]                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 4: Admin Dashboard Design

### /admin/tokeniq - Main Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│  TokenIQ Admin Dashboard                                            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐│
│  │ Total Tokens │  │ Active Wagers │  │ Pending     │  │ Errors   ││
│  │ in Circulation│  │              │  │ Resolution  │  │ (24h)    ││
│  │  2.4M        │  │  1,247       │  │  23         │  │  3       ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘│
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  📊 Token Economy Health                                            │
│  [Chart: Tokens distributed vs. tokens won over time]               │
│  [Chart: User engagement - wagers per day]                          │
│  [Chart: Win rate distribution]                                     │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  🔴 Pending Resolutions (Manual Review Required)                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ "Bears will draft OT in first round"                        │   │
│  │ Status: DRAFT COMPLETE - Awaiting admin confirmation        │   │
│  │ Result: Bears drafted OT at #10                              │   │
│  │ [RESOLVE: YES ✓] [RESOLVE: NO ✗] [EXTEND DEADLINE]          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ...                                                                │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  👥 Top Users by Balance                                            │
│  1. @bearsfan4life - 12,450 tokens (62% win rate)                  │
│  2. @chitown_bulls - 11,200 tokens (58% win rate)                  │
│  3. @cubbiesforever - 9,800 tokens (71% win rate)                  │
│  ...                                                                │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ⚠️ Recent Errors                                                   │
│  • [2026-01-29 14:32] TokenIQ failed to analyze post #1234         │
│  • [2026-01-29 12:15] User wager rejected - insufficient balance   │
│  • [2026-01-29 09:45] Resolution failed - ambiguous outcome        │
│  [View All Errors →]                                                │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  🎛️ TokenIQ Settings                                                │
│  • New user starting balance: [1,000] tokens                        │
│  • Daily login bonus: [50] tokens                                   │
│  • Max wager per bet: [500] tokens                                  │
│  • Min odds threshold: [10%] / [90%]                                │
│  • Auto-resolve confidence threshold: [95%]                         │
│  [Save Settings]                                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Sidebar Navigation Addition

In `/admin` left sidebar, add:

```
📊 Dashboard
📝 Posts
👥 Users
💬 Fan Chat
🏈 Team Pages
🔄 GM Trades
🪙 TokenIQ          ← NEW
   ├─ Dashboard
   ├─ Active Wagers
   ├─ Pending Resolution
   ├─ User Balances
   ├─ Error Log
   └─ Settings
```

---

## Part 5: Database Schema

### New Tables (Main SM Supabase)

```sql
-- User token balances
CREATE TABLE sm_token_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 1000 NOT NULL,
  total_wagered INTEGER DEFAULT 0,
  total_won INTEGER DEFAULT 0,
  total_lost INTEGER DEFAULT 0,
  wager_count INTEGER DEFAULT 0,
  win_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Wagerable posts
CREATE TABLE sm_token_wagers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES sm_posts(id) ON DELETE CASCADE,
  prediction_text TEXT NOT NULL,
  wager_type TEXT NOT NULL CHECK (wager_type IN ('binary', 'multiple_choice', 'over_under')),
  outcomes JSONB NOT NULL, -- [{id, label, odds, total_wagered}]
  resolution_criteria TEXT NOT NULL,
  resolution_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'resolved', 'cancelled')),
  winning_outcome_id TEXT, -- null until resolved
  tokeniq_confidence DECIMAL(5,2),
  tokeniq_reasoning TEXT,
  created_by UUID REFERENCES auth.users(id),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Individual user wagers
CREATE TABLE sm_token_user_wagers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wager_id UUID REFERENCES sm_token_wagers(id) ON DELETE CASCADE,
  outcome_id TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  odds_at_wager DECIMAL(8,2) NOT NULL,
  potential_payout INTEGER NOT NULL,
  result TEXT CHECK (result IN ('pending', 'won', 'lost', 'cancelled')),
  payout_amount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, wager_id) -- one wager per user per post
);

-- Token transaction ledger
CREATE TABLE sm_token_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'signup_bonus', 'daily_bonus', 'wager_placed',
    'wager_won', 'wager_lost', 'wager_cancelled',
    'admin_adjustment', 'referral_bonus', 'achievement_bonus'
  )),
  amount INTEGER NOT NULL, -- positive for credit, negative for debit
  balance_after INTEGER NOT NULL,
  reference_id UUID, -- wager_id for wager transactions
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TokenIQ error log
CREATE TABLE sm_tokeniq_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT NOT NULL,
  error_message TEXT,
  post_id UUID,
  wager_id UUID,
  user_id UUID,
  request_payload JSONB,
  response_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TokenIQ audit log (AI requests/responses)
CREATE TABLE sm_tokeniq_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL, -- 'analyze', 'set_odds', 'resolve'
  post_id UUID,
  wager_id UUID,
  request_prompt TEXT,
  response JSONB,
  model TEXT,
  tokens_used INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Leaderboard (materialized view for performance)
CREATE MATERIALIZED VIEW sm_token_leaderboard AS
SELECT
  tb.user_id,
  u.email,
  u.raw_user_meta_data->>'full_name' as display_name,
  tb.balance,
  tb.total_won,
  tb.wager_count,
  tb.win_count,
  CASE WHEN tb.wager_count > 0
    THEN ROUND(tb.win_count::DECIMAL / tb.wager_count * 100, 1)
    ELSE 0
  END as win_rate,
  RANK() OVER (ORDER BY tb.balance DESC) as rank
FROM sm_token_balances tb
JOIN auth.users u ON tb.user_id = u.id
WHERE tb.wager_count >= 5 -- minimum wagers to appear
ORDER BY tb.balance DESC;

-- Indexes
CREATE INDEX idx_token_wagers_status ON sm_token_wagers(status);
CREATE INDEX idx_token_wagers_resolution_date ON sm_token_wagers(resolution_date);
CREATE INDEX idx_token_user_wagers_user ON sm_token_user_wagers(user_id);
CREATE INDEX idx_token_user_wagers_result ON sm_token_user_wagers(result);
CREATE INDEX idx_token_transactions_user ON sm_token_transactions(user_id);
CREATE INDEX idx_token_transactions_type ON sm_token_transactions(type);
```

### sm_posts Table Addition

```sql
ALTER TABLE sm_posts ADD COLUMN has_token_wager BOOLEAN DEFAULT false;
ALTER TABLE sm_posts ADD COLUMN token_wager_id UUID REFERENCES sm_token_wagers(id);
```

---

## Part 6: API Routes

### New API Endpoints

```
/api/tokens/
├── balance/                 GET    - Get user's token balance
├── wager/                   POST   - Place a wager
├── wager/[id]/              GET    - Get wager details
├── wager/[id]/cancel/       POST   - Cancel wager (admin only, pre-resolution)
├── history/                 GET    - User's wager history
├── leaderboard/             GET    - Top users leaderboard
├── transactions/            GET    - User's transaction history
└── daily-bonus/             POST   - Claim daily login bonus

/api/tokeniq/
├── analyze/                 POST   - Analyze post content for wagerability
├── odds/                    POST   - Generate odds for a wager
├── resolve/                 POST   - Resolve a wager (admin only)
├── pending/                 GET    - Get pending resolutions (admin)
└── settings/                GET/PUT - TokenIQ configuration (admin)

/api/admin/tokeniq/
├── dashboard/               GET    - Dashboard stats
├── users/                   GET    - All user balances
├── users/[id]/adjust/       POST   - Manually adjust user balance
├── wagers/                  GET    - All wagers (filterable)
├── errors/                  GET    - Error log
└── audit/                   GET    - AI audit log
```

---

## Part 7: Gamification Features (Beat the Competition)

### Why Others Failed + Our Solution

| Failure Mode | Our Solution |
|--------------|--------------|
| **Prize cuts killed motivation** | No real money = no cutting. Tokens are permanent, consistent value |
| **Global leaderboards demotivate** | Team-specific boards + weekly resets + "your league" social groups |
| **No community connection** | Fan Chat integration - discuss wagers with other fans |
| **Static experience** | Seasonal themes, special events, streak bonuses |
| **Isolated from content** | Wagers embedded in articles you're already reading |

### Engagement Mechanics

#### 1. Daily Bonuses (Retention)
- **Login bonus:** 50 tokens/day (streaks increase: Day 7 = 100, Day 30 = 500)
- **First wager of day:** 10% odds boost
- **Correct prediction streak:** 3+ correct = 25% bonus on next win

#### 2. Achievements (Progression)
- **"First Blood":** Place first wager (100 tokens)
- **"Sharp Shooter":** 5 correct in a row (250 tokens)
- **"Homer":** Win 10 wagers on your favorite team (500 tokens)
- **"Contrarian":** Win betting against 80%+ of users (100 tokens)
- **"Beat TokenIQ":** Win when TokenIQ confidence was 75%+ against you (200 tokens)

#### 3. Team-Specific Leaderboards
```
🏈 Bears Token Leaders
🏀 Bulls Token Leaders
🏒 Blackhawks Token Leaders
⚾ Cubs Token Leaders
⚾ White Sox Token Leaders
🏆 All-Chicago Leaders
```

#### 4. Weekly Competitions
- **Weekly Challenge:** Bonus tokens for most correct predictions that week
- **Upset Special:** Extra rewards for correctly predicting underdogs
- **Deadline Dash:** Bonus multiplier for wagers placed near resolution deadline

#### 5. Social Features
- **Share wagers to Fan Chat** with one click
- **Follow other users** to see their wager activity
- **Wager against friends** in private leagues
- **@mention when wager resolves** in Fan Chat

#### 6. Integration with Existing Features

**GM Trade Simulator:**
- Special "GM Prediction" wagers for submitted trades
- "Will this trade actually happen?" tied to real-world outcomes
- Bonus tokens for GM trades that predict real transactions

**Mock Draft:**
- Token wagers on draft picks
- "Will Bears take OT in round 1?"
- Pre-draft speculation articles with built-in wagers

**Scout AI:**
- "TokenIQ says..." insights in Scout responses
- Historical accuracy stats: "TokenIQ was 67% accurate on Bears trades last year"

---

## Part 8: Legal & Compliance Considerations

### Why SM Tokens Are NOT Gambling

1. **No cash value:** Tokens cannot be exchanged for money
2. **No purchase required:** Users get tokens for free (signup + daily)
3. **Entertainment only:** Explicitly positioned as engagement feature
4. **No prizes:** Leaderboard recognition, not cash prizes

### Terms of Service Additions

```
SM TOKENS TERMS

SM Tokens are a virtual currency for entertainment purposes only.
Tokens have no monetary value and cannot be:
- Purchased with real money
- Exchanged for cash or prizes
- Transferred to other users
- Used outside of SportsMockery.com

SM Tokens are intended to enhance your engagement with Chicago
sports content. Any abuse of the token system, including creating
multiple accounts to accumulate tokens, may result in account
suspension.

SportsMockery reserves the right to adjust token balances, modify
odds, or void wagers at its discretion for quality assurance purposes.
```

### Age Gate
- Must be 13+ (matches existing account requirement)
- Clear "for entertainment only" messaging on every wager panel

---

## Part 9: Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Backend:**
- [ ] Create database tables (sm_token_*, indexes)
- [ ] Add `has_token_wager` to sm_posts
- [ ] Build TokenIQ API route (`/api/tokeniq/analyze`)
- [ ] Build token balance API routes
- [ ] Create TokenIQ system prompt and knowledge base

**Frontend:**
- [ ] Add "SM Token Wager" checkbox to post editor sidebar
- [ ] Create TokenIQ analysis panel (shows when checkbox enabled)
- [ ] Build basic wager panel component for article footer

**Admin:**
- [ ] Add TokenIQ to admin sidebar navigation
- [ ] Create basic dashboard with stats

### Phase 2: Core Wagering (Week 2-3)

**Backend:**
- [ ] Implement wager placement API
- [ ] Build transaction ledger system
- [ ] Create odds calculation engine
- [ ] Implement balance updates on wager/resolution

**Frontend:**
- [ ] Complete wager panel UI with odds display
- [ ] Build user portfolio page (`/profile/tokens`)
- [ ] Add token balance to header (logged-in users)
- [ ] Create wager confirmation modal

**Admin:**
- [ ] Build pending resolutions queue
- [ ] Create manual resolution interface
- [ ] Add user balance management

### Phase 3: Resolution System (Week 3-4)

**Backend:**
- [ ] Build resolution API with payout calculation
- [ ] Implement auto-resolution triggers (date-based)
- [ ] Create resolution notification system
- [ ] Build audit logging for all token operations

**Frontend:**
- [ ] Show resolved wagers with results
- [ ] Add resolution notifications to users
- [ ] Create wager history page with filtering

**Admin:**
- [ ] Resolution confirmation workflow
- [ ] Bulk resolution tools
- [ ] Error log viewer

### Phase 4: Gamification (Week 4-5)

**Backend:**
- [ ] Implement daily bonus system
- [ ] Create achievement triggers
- [ ] Build streak tracking
- [ ] Implement leaderboard refresh cron job

**Frontend:**
- [ ] Daily bonus claim UI
- [ ] Achievement badges and notifications
- [ ] Team-specific leaderboards
- [ ] Weekly competition UI

### Phase 5: Social & Polish (Week 5-6)

**Backend:**
- [ ] Fan Chat integration for wager sharing
- [ ] Following/social features
- [ ] Performance optimization

**Frontend:**
- [ ] Share to Fan Chat button
- [ ] Following feed for wagers
- [ ] Mobile optimization
- [ ] Animation polish (Framer Motion)

**Admin:**
- [ ] Analytics dashboard
- [ ] A/B testing tools
- [ ] Complete settings management

---

## Part 10: Success Metrics

### Key Performance Indicators

| Metric | Target (3 months) | Measurement |
|--------|-------------------|-------------|
| **WAU with wagers** | 25% of logged-in users | Weekly active users who placed ≥1 wager |
| **Wagers per article** | 50 average | Total wagers / wagerable articles |
| **Return rate** | 40% day-over-day | Users who wagered yesterday and today |
| **Session duration** | +15% | Time on site for users who wager vs. don't |
| **Article completion** | +20% | Full article reads on wagerable vs. regular |
| **Fan Chat mentions** | 100/week | Wager discussions in Fan Chat |

### Health Indicators

| Metric | Healthy Range | Alert Threshold |
|--------|---------------|-----------------|
| **TokenIQ accuracy** | 55-65% | <50% or >70% |
| **User win rate** | 45-55% | <40% or >60% |
| **Tokens in circulation** | Growing 5%/week | Declining |
| **Wager cancellation rate** | <5% | >15% |
| **Error rate** | <1% | >5% |

---

## Part 11: Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|------------|
| TokenIQ sets unfair odds | Human review queue for high-stakes wagers; odds bounded 10-90% |
| Resolution disputes | Clear criteria written at creation; admin override available |
| System gaming | Rate limits; one wager per user per post; suspicious pattern detection |
| Performance issues | Leaderboard as materialized view; cron job for heavy calculations |

### User Experience Risks

| Risk | Mitigation |
|------|------------|
| Users feel frustrated losing | Daily bonus ensures tokens available; achievements for participation |
| Confusion about odds | "Why these odds?" explainer; tooltips on UI |
| Overwhelming for new users | Onboarding tutorial; simple binary wagers to start |
| Inactive period with no wagers | Authors encouraged to enable wagers; editorial calendar |

### Legal Risks

| Risk | Mitigation |
|------|------------|
| Gambling classification | No cash value; no purchases; entertainment disclaimer |
| Age concerns | 13+ age gate; parental controls mention in ToS |
| Addiction concerns | Daily limits on wagers; "take a break" messaging |

---

## Part 12: Competitive Differentiation

### What We Have That Others Don't

1. **Hyperlocal Focus:** Only Chicago sports = deeper expertise, better odds, stronger community
2. **Content Integration:** Wagers emerge from articles, not separate "betting section"
3. **Existing AI Stack:** Scout AI, PostIQ, GM Trade Simulator infrastructure
4. **Community Ready:** Fan Chat provides immediate social layer
5. **No Prize Degradation Trap:** Virtual-only from day one = sustainable engagement
6. **Editorial Control:** Our writers create wagerable content (not user-generated)

### Why "Lots of Sites Tried This and It Sucks" Doesn't Apply

Those sites failed because they:
1. **Tried to be everything** - We're Chicago-only, laser-focused
2. **Used prizes as motivation** - We use engagement and community
3. **Separated betting from content** - We embed it in the reading experience
4. **Had no editorial control** - Our writers craft wagerable content
5. **Lacked community features** - We have Fan Chat, leaderboards, social sharing
6. **Didn't personalize** - We filter by favorite teams, show relevant wagers

---

## Part 13: Future Expansion Ideas

### Phase 2 Features (Post-Launch)

1. **Live Game Wagers:** During games, quick prop bets ("Next possession TD?")
2. **Season-Long Predictions:** Bears playoff odds, Bulls finals odds
3. **Writer Challenges:** Compete against SM writers' predictions
4. **Token Gifting:** Send tokens to friends for birthdays/milestones
5. **Charity Integration:** Convert tokens to real donations (SM matches)
6. **Merchandise Unlocks:** Reach token milestones, unlock SM swag discounts

### Data Monetization (Ethical)

1. **Aggregate Insights:** "72% of SM users think Bears make playoffs" for articles
2. **TokenIQ Report:** Monthly analysis of prediction accuracy
3. **Heat Maps:** Which rumors generated most engagement
4. **Writer Scorecards:** Track which writers' predictions were most accurate

---

## Appendix A: TokenIQ System Prompt (Draft)

```markdown
# TokenIQ - SM Token Odds Engine

You are TokenIQ, the AI odds-setting system for SportsMockery's SM Token
virtual currency platform. Your role is to analyze article content and
create fair, engaging betting lines for Chicago sports fans.

## Your Expertise
- Chicago Bears, Bulls, Blackhawks, Cubs, White Sox
- Trade rumors, draft speculation, free agency predictions
- Player performance projections, coaching changes
- Media source credibility assessment

## Analysis Framework

For each article, determine:

### 1. Wagerability Assessment
- Does this article make a specific, verifiable prediction?
- Is there a clear future event that resolves the prediction?
- Can the outcome be objectively determined?

If NO to any: Return { wagerable: false, reason: "..." }

### 2. Prediction Extraction
- What is the main claim/prediction?
- Who/what is the subject?
- What outcome is being predicted?
- When should this resolve?

### 3. Outcome Structuring
Binary: "Will X happen?" → Yes/No
Multiple Choice: "Which of these?" → Options with odds
Over/Under: "How many/much?" → Line + Over/Under

### 4. Odds Calculation

Base: 50/50 (even odds)

Adjustments (each ±5-15%):
- Source credibility (Schefter/Woj = +15%, "per sources" = -10%)
- Historical precedent (team's transaction history)
- Financial feasibility (cap space, contracts)
- Timing logic (deadline proximity, offseason phase)
- Momentum (multiple confirming reports)
- Public sentiment (if available)

Convert to American odds:
- 50% = +100/-100 (pick 'em)
- 65% = -185/+155
- 35% = +185/-185

BOUNDS: Never set probability below 10% (-900) or above 90% (+900)

### 5. Resolution Criteria
Write clear, unambiguous criteria:
- What official source confirms the outcome?
- What date/event triggers resolution?
- What happens if prediction partially correct?

## Output Format

```json
{
  "wagerable": true,
  "prediction": "Chicago Bears will trade for Maxx Crosby",
  "wager_type": "binary",
  "outcomes": [
    { "id": "yes", "label": "Yes", "probability": 0.35, "odds": "+185" },
    { "id": "no", "label": "No", "probability": 0.65, "odds": "-185" }
  ],
  "confidence": 0.72,
  "reasoning": "Multiple credible reports, but Raiders asking price historically high...",
  "resolution_criteria": "Official announcement from Bears or Raiders of completed trade",
  "resolution_date": "2026-03-15",
  "resolution_trigger": "NFL Trade Deadline"
}
```

## Special Rules

1. **Untouchable Players:** Any wager involving trading Caleb Williams or Connor
   Bedard should be set at 95%+ NO odds (near-impossible)

2. **Deadline Awareness:** Adjust odds based on calendar proximity to events
   - Trade deadline: March 15 (NFL), February deadline (NBA/NHL)
   - Draft: April (NFL), June (NBA/NHL)
   - Free agency: March (NFL/NBA), July (MLB)

3. **Source Hierarchy:**
   - Tier 1: Schefter, Woj, Passan, LeBrun (+15% credibility)
   - Tier 2: Beat reporters, team insiders (+5%)
   - Tier 3: National media, aggregators (neutral)
   - Tier 4: "Sources say", anonymous (-10%)
   - Tier 5: Fan speculation, rumors (-20%)

4. **Team-Specific Patterns:**
   - Bears: More active in free agency than trades
   - Bulls: History of surprise trades
   - Blackhawks: Rebuilding, likely sellers
   - Cubs: Big market, can afford anyone
   - White Sox: Cost-conscious, development focus
```

---

## Appendix B: File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── tokens/
│   │   │   ├── balance/route.ts
│   │   │   ├── wager/route.ts
│   │   │   ├── wager/[id]/route.ts
│   │   │   ├── history/route.ts
│   │   │   ├── leaderboard/route.ts
│   │   │   ├── transactions/route.ts
│   │   │   └── daily-bonus/route.ts
│   │   ├── tokeniq/
│   │   │   ├── analyze/route.ts
│   │   │   ├── odds/route.ts
│   │   │   ├── resolve/route.ts
│   │   │   ├── pending/route.ts
│   │   │   └── settings/route.ts
│   │   └── admin/
│   │       └── tokeniq/
│   │           ├── dashboard/route.ts
│   │           ├── users/route.ts
│   │           ├── wagers/route.ts
│   │           ├── errors/route.ts
│   │           └── audit/route.ts
│   ├── admin/
│   │   └── tokeniq/
│   │       ├── page.tsx          (Dashboard)
│   │       ├── wagers/page.tsx   (All wagers)
│   │       ├── pending/page.tsx  (Pending resolutions)
│   │       ├── users/page.tsx    (User balances)
│   │       ├── errors/page.tsx   (Error log)
│   │       └── settings/page.tsx (Configuration)
│   └── profile/
│       └── tokens/
│           └── page.tsx          (User portfolio)
├── components/
│   ├── tokens/
│   │   ├── WagerPanel.tsx        (Article footer wager UI)
│   │   ├── WagerConfirmModal.tsx
│   │   ├── TokenBalance.tsx      (Header balance display)
│   │   ├── DailyBonusModal.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── WagerHistory.tsx
│   │   ├── AchievementBadge.tsx
│   │   └── OddsExplainer.tsx
│   └── admin/
│       └── PostEditor/
│           └── TokenWagerPanel.tsx (Sidebar checkbox + TokenIQ analysis)
└── lib/
    ├── tokeniq/
    │   ├── tokeniq-prompt.ts     (System prompt)
    │   ├── tokeniq-knowledge.ts  (Knowledge base)
    │   ├── odds-calculator.ts    (Odds math utilities)
    │   └── resolution-engine.ts  (Resolution logic)
    ├── tokens/
    │   ├── balance.ts            (Balance operations)
    │   ├── wager.ts              (Wager operations)
    │   ├── transactions.ts       (Ledger operations)
    │   └── leaderboard.ts        (Leaderboard queries)
    └── types/
        └── tokens.ts             (TypeScript interfaces)
```

---

## Conclusion

The SM Token system transforms passive article consumption into active engagement by letting fans put their predictions where their opinions are. By learning from the failures of ESPN Streak, Fox Super 6, Reddit Community Points, and others, we're building something that:

1. **Stays consistent** (no prize degradation because no prizes)
2. **Feels local** (Chicago-only community)
3. **Integrates naturally** (wagers in articles you're already reading)
4. **Rewards participation** (achievements, daily bonuses, social recognition)
5. **Uses AI fairly** (TokenIQ sets odds based on media analysis, not house advantage)

The person who said "lots of sites tried this and it sucks" is right about the past. But they're wrong about the future - because those sites weren't SportsMockery, and they didn't have TokenIQ.

Let's build this.
