# SportsMockery Subscription Model Plan

## Executive Summary

SportsMockery is a feature-rich Chicago sports platform with **significant monetization potential** beyond free article reading. Based on comprehensive analysis of the codebase, this plan outlines a tiered subscription model leveraging the platform's unique features:

- **AI-powered features** (Ask AI, SM Prophecy predictions)
- **Community engagement** (Fan Chat, Fan Senate governance)
- **Premium content** (exclusive analysis, insider reports)
- **Advanced technology** (AR experiences, Metaverse/VR)
- **Digital collectibles** (NFTs, achievements, badges)

---

## Current Feature Inventory

### FREE Features (Keep Free)
| Feature | Rationale |
|---------|-----------|
| All articles (reading) | Traffic driver, SEO, ad revenue |
| Team pages & rosters | Basic information attracts users |
| Game schedules & standings | Utility feature, engagement hook |
| Basic player stats | Entry point to premium data |
| Public Fan Chat | Community building, network effects |
| Email newsletter signup | Lead generation |

### MONETIZABLE Features
| Feature | Current Status | Premium Potential |
|---------|---------------|-------------------|
| Ask AI (unlimited) | Live | High - limit free queries |
| SM Prophecy Predictions | Live | High - detailed analysis |
| AR Experience | Live (marked Elite) | Very High - already gated |
| Advanced Stats/DataHub | Live | High - depth of analysis |
| Fan Senate Governance | Live | Medium - proposal creation |
| Premium Chat Rooms | Not built | High - exclusive analyst access |
| NFT Collectibles | Scaffolded | High - digital ownership |
| Metaverse Tours | Coming Soon | Very High - unique experience |
| Ad-Free Experience | Not built | Medium - quality of life |

---

## Recommended Subscription Tiers

### Tier 1: FREE (The Fan)
**Price:** $0/month

**Included:**
- Unlimited article reading (with ads)
- Basic team pages, rosters, schedules, standings
- Public Fan Chat access (all team rooms)
- Basic player profiles
- Email newsletter
- 3 Ask AI questions per day
- View prediction outcomes (no detailed reasoning)
- Basic achievements/badges
- Fan Senate: vote on proposals (no creation)

**Goal:** Build audience, drive traffic, convert to paid

---

### Tier 2: FAN+ (The Insider)
**Price:** $5.99/month or $49.99/year (30% savings)

**Everything in FREE, plus:**
- **Ad-free reading experience**
- **15 Ask AI questions per day**
- **Full prediction reasoning** (SM Prophecy detailed analysis)
- **Early access to articles** (6-hour window before public)
- **Exclusive weekly analysis** (subscriber-only deep dives)
- **Premium chat badge** (visible in Fan Chat)
- **Fan Senate: create proposals** (governance participation)
- **Save articles** (personal reading list)
- **Reading history tracking**
- **Email digest customization** (frequency, team focus)

**Target:** Casual fans who want more insight without major commitment

---

### Tier 3: ELITE (The Diehard)
**Price:** $12.99/month or $99.99/year (36% savings)

**Everything in FAN+, plus:**
- **Unlimited Ask AI** (no daily limits)
- **AR Experience access** (immersive article viewing)
- **Exclusive Elite chat room** (direct analyst access)
- **Live game threads** with real-time stats overlay
- **Advanced DataHub access** (full player analytics, trends)
- **Premium predictions** with confidence intervals
- **Priority notifications** (breaking news first)
- **Monthly exclusive content** (video, podcast, AMA)
- **Elite badge & profile flair**
- **Prediction competitions** with leaderboards
- **Ad-free experience** across all features

**Target:** Dedicated fans who want comprehensive coverage

---

### Tier 4: VIP (The Founder)
**Price:** $24.99/month or $199.99/year (33% savings)

**Everything in ELITE, plus:**
- **Metaverse stadium tours** (VR experiences when launched)
- **NFT minting rights** (exclusive digital collectibles)
- **VIP-only chat channel** (smallest, most exclusive community)
- **Personal Ask AI persona** (customized AI responses)
- **Quarterly video call** with SM analysts
- **Name in credits** (VIP supporters section)
- **Legacy badge** (founding supporter recognition)
- **Beta feature access** (test new features first)
- **Priority support** (direct line to team)
- **Annual VIP gift** (merch, signed items)

**Target:** Superfans, potential investors, brand ambassadors

---

## Revenue Projections

### Assumptions (Conservative)
- Current monthly visitors: 50,000
- Free to FAN+ conversion: 2%
- FAN+ to ELITE conversion: 25%
- ELITE to VIP conversion: 10%

### Monthly Revenue Model
| Tier | Subscribers | Monthly Rate | Monthly Revenue |
|------|-------------|--------------|-----------------|
| FREE | 48,650 | $0 | $0 (ad revenue) |
| FAN+ | 1,000 | $5.99 | $5,990 |
| ELITE | 250 | $12.99 | $3,248 |
| VIP | 100 | $24.99 | $2,499 |
| **Total** | **50,000** | | **$11,737/mo** |

### Annual Projection: ~$140,844

### Growth Scenario (12 months)
With 20% monthly user growth and improved conversion:
- Year 1 potential: $250,000 - $400,000

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
**Goal:** Payment infrastructure and basic tiers

1. **Integrate Stripe**
   - Payment processing
   - Subscription management
   - Webhook handling for events
   - Customer portal for self-service

2. **Extend User Schema**
   ```sql
   ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'free';
   ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'none';
   ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
   ALTER TABLE users ADD COLUMN subscription_started_at TIMESTAMP;
   ALTER TABLE users ADD COLUMN subscription_ends_at TIMESTAMP;
   ```

3. **Create Subscription Pages**
   - `/subscribe` - Tier comparison page
   - `/account/subscription` - Manage subscription
   - `/account/billing` - Payment history

4. **Build Paywall Components**
   - `<SubscriptionGate tier="elite">` wrapper component
   - Upgrade prompt modals
   - Feature teaser cards

### Phase 2: Feature Gating (Weeks 5-8)
**Goal:** Gate premium features

1. **Ask AI Rate Limiting**
   - Track daily usage per user
   - Implement tier-based limits (3/15/unlimited)
   - Show remaining queries in UI
   - Upgrade prompts when limit reached

2. **Ad Removal**
   - Create ad component with subscription check
   - Hide ads for FAN+ and above
   - Track ad impressions for free tier

3. **Prediction Gating**
   - Free: outcome only (correct/incorrect)
   - FAN+: full reasoning text
   - ELITE: confidence intervals, historical accuracy

4. **AR Feature Activation**
   - Already has `isPremium` prop infrastructure
   - Connect to subscription tier check
   - ELITE+ only

### Phase 3: Exclusive Content (Weeks 9-12)
**Goal:** Create subscriber-only value

1. **Premium Article System**
   - Add `is_subscriber_only` field to posts
   - Create subscriber article creation flow
   - Implement content preview (first paragraph free)
   - `PremiumArticleCard` component already exists

2. **Early Access Window**
   - Add `early_access_until` timestamp to posts
   - Show to FAN+ 6 hours early
   - Display "Available to all in X hours" for free users

3. **Exclusive Chat Rooms**
   - Create "Elite Lounge" chat room
   - Create "VIP Suite" chat room
   - Tier-gated access in ChatContext

4. **Premium Badges**
   - Design tier badges (FAN+, ELITE, VIP)
   - Display in chat, comments, profiles
   - Special colors/animations for VIP

### Phase 4: Advanced Features (Weeks 13-16)
**Goal:** Differentiate premium tiers

1. **Advanced DataHub**
   - Enhanced player analytics (ELITE)
   - Team trend analysis
   - Head-to-head comparisons
   - Export to CSV (VIP)

2. **Prediction Competitions**
   - Weekly prediction contests
   - Leaderboards (public view, premium play)
   - Prizes for top predictors
   - Historical accuracy tracking

3. **Live Game Experience**
   - Real-time stat overlays
   - Play-by-play integration
   - Live chat threads per game
   - ELITE+ only

### Phase 5: VIP Exclusives (Weeks 17-20)
**Goal:** Maximum value for top tier

1. **Metaverse Integration**
   - VR stadium tours (Three.js/XR already integrated)
   - Historic game reliving
   - Virtual meetups
   - VIP-exclusive spaces

2. **NFT Marketplace**
   - Connect wallet functionality
   - NFT minting for VIP members
   - Limited edition drops
   - Secondary market integration

3. **Personalization**
   - Custom AI persona settings
   - Personalized prediction models
   - Custom notification rules

---

## Technical Architecture

### Subscription Service Structure

```
/src/lib/subscription/
  ├── stripe.ts           # Stripe SDK wrapper
  ├── tiers.ts            # Tier definitions
  ├── permissions.ts      # Feature access checks
  ├── hooks.ts            # useSubscription hook
  └── components/
      ├── SubscriptionGate.tsx
      ├── UpgradePrompt.tsx
      ├── PricingTable.tsx
      └── BillingPortal.tsx
```

### Tier Definition (tiers.ts)

```typescript
export type SubscriptionTier = 'free' | 'fan_plus' | 'elite' | 'vip';

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
  features: {
    askAiQueriesPerDay: number;
    adFree: boolean;
    earlyAccess: boolean;
    arAccess: boolean;
    eliteChatAccess: boolean;
    vipChatAccess: boolean;
    predictionsDetailed: boolean;
    predictionsAdvanced: boolean;
    fanSenateCreate: boolean;
    metaverseAccess: boolean;
    nftMinting: boolean;
  };
}

export const TIERS: Record<SubscriptionTier, TierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    stripePriceIdMonthly: '',
    stripePriceIdYearly: '',
    features: {
      askAiQueriesPerDay: 3,
      adFree: false,
      earlyAccess: false,
      arAccess: false,
      eliteChatAccess: false,
      vipChatAccess: false,
      predictionsDetailed: false,
      predictionsAdvanced: false,
      fanSenateCreate: false,
      metaverseAccess: false,
      nftMinting: false,
    },
  },
  fan_plus: {
    id: 'fan_plus',
    name: 'Fan+',
    monthlyPrice: 5.99,
    yearlyPrice: 49.99,
    stripePriceIdMonthly: 'price_fanplus_monthly',
    stripePriceIdYearly: 'price_fanplus_yearly',
    features: {
      askAiQueriesPerDay: 15,
      adFree: true,
      earlyAccess: true,
      arAccess: false,
      eliteChatAccess: false,
      vipChatAccess: false,
      predictionsDetailed: true,
      predictionsAdvanced: false,
      fanSenateCreate: true,
      metaverseAccess: false,
      nftMinting: false,
    },
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    monthlyPrice: 12.99,
    yearlyPrice: 99.99,
    stripePriceIdMonthly: 'price_elite_monthly',
    stripePriceIdYearly: 'price_elite_yearly',
    features: {
      askAiQueriesPerDay: -1, // unlimited
      adFree: true,
      earlyAccess: true,
      arAccess: true,
      eliteChatAccess: true,
      vipChatAccess: false,
      predictionsDetailed: true,
      predictionsAdvanced: true,
      fanSenateCreate: true,
      metaverseAccess: false,
      nftMinting: false,
    },
  },
  vip: {
    id: 'vip',
    name: 'VIP',
    monthlyPrice: 24.99,
    yearlyPrice: 199.99,
    stripePriceIdMonthly: 'price_vip_monthly',
    stripePriceIdYearly: 'price_vip_yearly',
    features: {
      askAiQueriesPerDay: -1,
      adFree: true,
      earlyAccess: true,
      arAccess: true,
      eliteChatAccess: true,
      vipChatAccess: true,
      predictionsDetailed: true,
      predictionsAdvanced: true,
      fanSenateCreate: true,
      metaverseAccess: true,
      nftMinting: true,
    },
  },
};
```

### Permission Check Hook

```typescript
// useSubscription.ts
import { useAuth } from '@/contexts/AuthContext';
import { TIERS, SubscriptionTier } from './tiers';

export function useSubscription() {
  const { user, profile } = useAuth();

  const tier: SubscriptionTier = profile?.subscription_tier || 'free';
  const config = TIERS[tier];

  const hasFeature = (feature: keyof typeof config.features) => {
    return config.features[feature];
  };

  const canAccessTier = (requiredTier: SubscriptionTier) => {
    const tierOrder = ['free', 'fan_plus', 'elite', 'vip'];
    return tierOrder.indexOf(tier) >= tierOrder.indexOf(requiredTier);
  };

  return {
    tier,
    tierName: config.name,
    features: config.features,
    hasFeature,
    canAccessTier,
    isSubscribed: tier !== 'free',
    isPremium: tier === 'elite' || tier === 'vip',
    isVIP: tier === 'vip',
  };
}
```

### Gating Component

```typescript
// SubscriptionGate.tsx
interface SubscriptionGateProps {
  tier: SubscriptionTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export function SubscriptionGate({
  tier,
  children,
  fallback,
  showUpgrade = true
}: SubscriptionGateProps) {
  const { canAccessTier } = useSubscription();

  if (canAccessTier(tier)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgrade) {
    return <UpgradePrompt requiredTier={tier} />;
  }

  return null;
}
```

---

## Database Schema Additions

```sql
-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, paused
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking for rate-limited features
CREATE TABLE feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- 'ask_ai', 'predictions', etc.
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Index for daily usage queries
CREATE INDEX idx_feature_usage_daily ON feature_usage (user_id, feature, used_at);

-- Premium content tracking
ALTER TABLE sm_posts ADD COLUMN is_subscriber_only BOOLEAN DEFAULT FALSE;
ALTER TABLE sm_posts ADD COLUMN min_tier TEXT DEFAULT 'free';
ALTER TABLE sm_posts ADD COLUMN early_access_until TIMESTAMP WITH TIME ZONE;
```

---

## API Endpoints

### Subscription Management
```
POST   /api/subscription/create-checkout    # Start Stripe checkout
POST   /api/subscription/webhook            # Stripe webhook handler
GET    /api/subscription/status             # Get current subscription
POST   /api/subscription/cancel             # Cancel subscription
POST   /api/subscription/resume             # Resume canceled subscription
GET    /api/subscription/portal             # Get Stripe billing portal URL
```

### Usage Tracking
```
GET    /api/usage/ask-ai                    # Get remaining Ask AI queries
POST   /api/usage/ask-ai/track              # Track usage
GET    /api/usage/summary                   # Get all usage stats
```

---

## Marketing & Launch Strategy

### Pre-Launch (2 weeks before)
1. Tease premium features in articles
2. "Coming Soon" banners on premium features
3. Email existing users about upcoming subscriptions
4. Early bird pricing (20% off first 3 months)

### Launch Week
1. Founder's discount for first 100 VIP subscribers (40% off year one)
2. Social media campaign highlighting exclusive features
3. Demo videos of AR, premium predictions, exclusive content
4. Press release to Chicago sports media

### Ongoing
1. Monthly exclusive content calendar
2. Quarterly VIP events
3. Referral program (1 month free for referrer/referee)
4. Annual subscriber appreciation events

---

## Metrics to Track

### Subscription Metrics
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Churn rate by tier
- Conversion rate (free to paid)
- Upgrade/downgrade rates
- LTV (Lifetime Value) by tier

### Engagement Metrics
- Ask AI usage by tier
- Chat activity by tier
- Feature adoption rates
- Premium content consumption
- AR feature engagement

### Business Health
- CAC (Customer Acquisition Cost)
- Payback period
- Net Revenue Retention
- Free to trial conversion
- Trial to paid conversion

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Low conversion rate | A/B test pricing, add free trial |
| High churn | Exit surveys, improve value proposition |
| Feature underutilization | In-app tutorials, feature spotlights |
| Payment failures | Dunning emails, retry logic |
| Competitor pricing | Monitor market, adjust tiers |

---

## Summary: What to Charge For

### High-Value Premium Features
1. **Ask AI** - Limit free queries, unlimited for paid
2. **AR Experience** - Already marked as Elite-only
3. **Prediction Details** - Reasoning, confidence, trends
4. **Ad-Free Reading** - Quality of life improvement
5. **Exclusive Content** - Subscriber-only analysis
6. **Elite Chat Access** - Direct analyst connection
7. **Fan Senate Creation** - Governance participation
8. **Metaverse/VR** - Immersive experiences
9. **NFT Minting** - Digital collectibles
10. **Advanced DataHub** - Deep analytics

### Keep Free (Traffic/Engagement Drivers)
1. Article reading (with ads)
2. Public Fan Chat
3. Basic stats and rosters
4. Schedules and standings
5. Basic predictions (outcomes only)
6. Email newsletter
7. Basic achievements

---

## Next Steps

1. **Approve tier structure and pricing**
2. **Set up Stripe account and products**
3. **Begin Phase 1 implementation**
4. **Create premium content pipeline**
5. **Design subscription UI/UX**
6. **Plan launch marketing campaign**

---

*Document created: January 21, 2026*
*Version: 1.0*
