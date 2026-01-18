# Content Moderation System

## Overview

The moderation system operates on two levels:

1. **Client-side** (`src/lib/chat/moderation.ts`) - Pre-filters before sending
2. **Server-side** (`src/app/api/chat/messages/route.ts`) - Validates before storing

All messages are checked **before** they are published. Users never see blocked content.

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

Catches attempts to use similar-looking characters:

```
fυck (Greek upsilon)
fսck (Cyrillic small letter u)
ｆｕｃｋ (fullwidth)
𝐟𝐮𝐜𝐤 (mathematical bold)
```

### Leetspeak Detection

Catches number/symbol substitutions:

```
fvck, f*ck, f**k
sh1t, $hit, sh!t
@$$hole, a55hole
```

### Split Word Detection

Catches words with inserted characters:

```
f.u.c.k
f u c k
f-u-c-k
```

### Zalgo Text Detection

Blocks text with excessive combining characters:

```
t̷̡͝ḧ̶́͜i̵̛͝s̷̈́̕ ̴̛̈́t̵͝͠e̶̎̚x̵̒͝t̴̛̕
```

### Invisible Character Detection

Blocks hidden Unicode characters:

```
\u200B (zero-width space)
\u200C (zero-width non-joiner)
\u200D (zero-width joiner)
\uFEFF (byte order mark)
```

### Reversed Text Detection

Checks if reversed text contains blocked words:

```
kcuf → fuck
tihs → shit
```

### Encoding Detection

Blocks Base64 or hex-encoded content.

## Sports Context Awareness

The system understands sports context and allows expressions that would otherwise be flagged:

### Allowed Sports Phrases

```
"killed it" / "killing it"
"murdered that defense"
"destroyed them"
"crushed the competition"
"they choked"
"total bust"
"he's washed"
"fraud team"
"sucks" (when referring to teams)
"trash" / "garbage" (performance)
```

### Rival Trash Talk

Playful rivalry is allowed:
```
"FTP" (referring to Packers)
"Cardinals fans are delusional"
"Packers are overrated"
```

## Whitelisted Links

Only sports-related domains are allowed:

### Major Networks
- espn.com, bleacherreport.com, si.com
- cbssports.com, nbcsports.com, foxsports.com
- theathletic.com, yahoo.com/sports

### League Sites
- nfl.com, mlb.com, nba.com, nhl.com, mls.com

### Chicago Teams
- chicagobears.com, mlb.com/cubs, mlb.com/whitesox
- nba.com/bulls, nhl.com/blackhawks, chicagofirefc.com

### Reference Sites
- pro-football-reference.com
- baseball-reference.com
- basketball-reference.com
- hockey-reference.com

### Social (with review)
- twitter.com, x.com, youtube.com (flagged for review)

## Rate Limiting

| Limit | Threshold | Action |
|-------|-----------|--------|
| Messages per minute | 10 | Mute |
| Messages per hour | 100 | Mute |
| Duplicate message cooldown | 30 seconds | Block |
| Similar message threshold | 80% similarity | Warn |
| New user cooldown | 5 seconds between messages | Block |

## Progressive Punishment

### Escalation Path

```
Warning → Warning → Warning → Mute (5 min)
Mute → Mute → Mute → Ban
```

### Mute Duration Multiplier

Each mute is 2x longer than the previous:
- 1st mute: 5 minutes
- 2nd mute: 10 minutes
- 3rd mute: 20 minutes
- Max mute: 24 hours

### Reputation System

| Action | Reputation Change |
|--------|-------------------|
| Warning | -5 |
| Mute | -20 |
| Ban | -100 |
| Positive engagement | +1 per day |

## Toxicity Scoring

Each message receives a score from 0.00 to 1.00:

```typescript
score = baseSeverity + (flagCount * 0.05) + categoryWeights

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
```

## Moderation Log

All moderation actions are logged:

```sql
INSERT INTO chat_moderation_log (
  message_id,
  user_id,
  action,
  reason,
  triggered_rules,
  original_content,
  moderator_id  -- NULL for auto-moderation
);
```

## Configuration

Rules can be added/modified in `chat_moderation_rules` table:

```sql
INSERT INTO chat_moderation_rules (
  rule_type,      -- 'word_filter', 'regex', 'spam_pattern', 'rate_limit'
  category,       -- 'profanity', 'hate_speech', etc.
  pattern,        -- The word, phrase, or regex
  severity,       -- 'low', 'medium', 'high', 'critical'
  action,         -- 'warn', 'block', 'shadow_block', 'mute', 'ban'
  is_active,
  is_regex,
  case_sensitive,
  description
);
```
