"use client"

import { ScoutBriefingHero } from "@/components/home/hero/modes/scout-briefing-hero"
import { TrendingFeaturedHero } from "@/components/home/hero/modes/trending-featured-hero"
import { StoryUniverseHero } from "@/components/home/hero/modes/story-universe-hero"
import { ScoutLiveHero } from "@/components/home/hero/modes/scout-live-hero"
import { GameDayHero } from "@/components/home/hero/modes/game-day-hero"
import { TeamPulseHero } from "@/components/home/hero/modes/team-pulse-hero"
import { DebateHero } from "@/components/home/hero/modes/debate-hero"
import { EdgeHero } from "@/components/home/edge-hero"
import type {
  FeaturedStory,
  GameContext,
  TeamContext,
  DebateContext,
  QuickAction,
  StoryUniverseContext,
  ScoutLiveContext,
} from "@/components/home/hero/types"

/* ------------------------------------------------------------------ */
/*  Sample data for each hero mode                                     */
/* ------------------------------------------------------------------ */

const sampleStory: FeaturedStory = {
  id: "sample-trending-1",
  title: "Caleb Williams Throws for 400 Yards in Historic Bears Comeback",
  dek: "The second-year quarterback silenced critics with a masterclass performance, leading Chicago back from a 21-point deficit in the fourth quarter.",
  imageUrl: "/placeholder.jpg",
  href: "/chicago-bears/caleb-williams-400-yards",
  views: 14200,
  team: "Chicago Bears",
  publishedLabel: "2 hours ago",
  forceHeroFeatured: true,
}

const sampleGames: GameContext[] = [
  {
    matchup: "Memphis Grizzlies at Chicago Bulls",
    kickoffLabel: "LIVE — 3:12 - 1st Quarter",
    href: "/chicago-bulls",
    storyline: "Watch on CHSN",
    teamLogoUrl: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png",
    sport: "nba",
    homeScore: 25,
    awayScore: 22,
    homeAbbr: "CHI",
    awayAbbr: "MEM",
  },
  {
    matchup: "Chicago White Sox at Texas Rangers",
    kickoffLabel: "LIVE — Bottom 2nd",
    href: "/chicago-white-sox",
    storyline: "Watch on NBCSCH",
    teamLogoUrl: "https://a.espncdn.com/i/teamlogos/mlb/500/chw.png",
    sport: "mlb",
    homeScore: 0,
    awayScore: 0,
    homeAbbr: "TEX",
    awayAbbr: "CHW",
  },
]

const sampleTeam: TeamContext = {
  teamName: "Chicago Bears",
  topics: ["Caleb Williams MVP Race", "Draft Capital", "Defense Rankings", "Playoff Odds"],
  href: "/chicago-bears",
}

const sampleDebate: DebateContext = {
  question: "Should the Cubs trade Cody Bellinger before the deadline?",
  sentimentLabel: "Fan split: 62% say trade, 38% say keep",
  href: "/debate/bellinger-trade",
}

const sampleStoryUniverse: StoryUniverseContext = {
  mainStory: {
    id: "sample-universe-main",
    title: "The Bears Pass Rush Situation",
    dek: "Chicago's defense remains a major concern as the Bears look to address their obvious pass rush issues this offseason.",
    imageUrl: "/placeholder.jpg",
    href: "/chicago-bears/bears-pass-rush-situation",
    views: 8500,
    team: "Chicago Bears",
    publishedLabel: "1h ago",
  },
  relatedStories: [
    {
      id: "sample-universe-related-1",
      title: "Chicago is monitoring the pass rusher market closely. A move could be in the works as draft smoke clears.",
      dek: "1h ago · Red Insight",
      href: "/chicago-bears/scout-insight-pass-rush",
      label: "Scout Insight",
    },
    {
      id: "sample-universe-related-2",
      title: "Veteran Pass Rusher Linked to Bears",
      dek: "Confidence 68% — League buzz is picking up.",
      href: "/chicago-bears/veteran-pass-rusher-rumor",
      label: "Rumor Watch",
    },
  ],
}

const sampleScoutLive: ScoutLiveContext = {
  headline: "Bears trade signals are heating up",
  summary: "5 signals in the last 6 hours across Chicago sports. Scout is monitoring.",
  signals: [
    {
      id: "sig-1",
      type: "rumor",
      message: "Bears linked to veteran edge rusher — multiple sources confirm interest",
      timestamp: "2m ago",
      href: "/chicago-bears/veteran-edge-rumor",
    },
    {
      id: "sig-2",
      type: "scout",
      label: "Scout",
      message: "Confidence rising on Bears pass rush move before draft",
      timestamp: "14m ago",
      value: "68%",
    },
    {
      id: "sig-3",
      type: "update",
      message: "Insider hint dropped — Bears front office taking calls on Day 2 picks",
      timestamp: "28m ago",
      href: "/chicago-bears/draft-pick-calls",
    },
    {
      id: "sig-4",
      type: "sentiment",
      message: "Fan sentiment shifting aggressive — 74% want a trade-up",
      timestamp: "41m ago",
      value: "74%",
    },
    {
      id: "sig-5",
      type: "stat",
      message: "Bears pressure rate ranks bottom 5 in NFL — 27th in adjusted sack rate",
      timestamp: "1h ago",
      value: "Bottom 5",
    },
  ],
}

const sampleQuickActions: QuickAction[] = [
  { id: "1", label: "Bears Draft", value: "What picks do the Bears have in the 2026 draft?" },
  { id: "2", label: "Bulls Trades", value: "What trades should the Bulls make?" },
  { id: "3", label: "Cubs Rotation", value: "How does the Cubs pitching rotation look?" },
]

/* ------------------------------------------------------------------ */
/*  Section divider between heroes                                     */
/* ------------------------------------------------------------------ */

function Divider({ title, description }: { title: string; description: string }) {
  return (
    <div
      style={{
        padding: "48px 24px 24px",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            height: 1,
            flex: 1,
            background: "linear-gradient(to right, transparent, rgba(188,0,0,0.3), transparent)",
          }}
        />
        <h2
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#BC0000",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </h2>
        <div
          style={{
            height: 1,
            flex: 1,
            background: "linear-gradient(to right, transparent, rgba(188,0,0,0.3), transparent)",
          }}
        />
      </div>
      <p
        style={{
          textAlign: "center",
          fontSize: 14,
          color: "var(--hp-muted-foreground, #888)",
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Home2Page() {
  return (
    <main>
      {/* Page header */}
      <div
        style={{
          padding: "32px 24px 16px",
          textAlign: "center",
          background: "var(--hp-background, #FAFAFB)",
          color: "var(--hp-foreground, #0B0F14)",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(24px, 3vw, 36px)",
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Homepage Hero Showcase
        </h1>
        <p style={{ fontSize: 15, color: "var(--hp-muted-foreground, #888)", maxWidth: 700, margin: "0 auto" }}>
          All 7 hero takeover modes in priority order. Only one renders at a time — the system checks
          from Priority 1 down and renders the first mode whose conditions are met.
          Each section shows the trigger rules.
        </p>
      </div>

      {/* ── 1. Trending Featured (Priority 1) ── */}
      <Divider
        title="Priority 1 — Trending Featured Hero"
        description="Full-bleed image takeover. TRIGGERS WHEN: a published article has views >= 2,500 within 48 hours, OR an editor checks 'Force Hero Featured' (importance_score >= 90). Must have a featured image. Cinematic height (70vh). Highest priority — overrides all other modes."
      />
      <TrendingFeaturedHero story={sampleStory} />

      {/* ── 2. Story Universe (Priority 2) ── */}
      <Divider
        title="Priority 2 — Story Universe Hero"
        description="Editor-curated story cluster. TRIGGERS WHEN: a published post has is_story_universe = true AND exactly 2 valid related story IDs, AND has a featured image. Set via CMS right sidebar 'Homepage Features' panel. Main story fills the left; two related cards sit in a stacked sidebar on the right."
      />
      <StoryUniverseHero context={sampleStoryUniverse} />

      {/* ── 3. Scout Live Feed (Priority 3) ── */}
      <Divider
        title="Priority 3 — Scout Live Feed"
        description="Real-time intelligence layer. TRIGGERS WHEN: 3+ articles published within the last 6 hours. Signals are auto-classified from post titles (rumor, scout, update, stat, sentiment, news). Headline is dynamically generated from the dominant team and signal types. Calm urgency — live but controlled. Falls back if fewer than 3 recent signals."
      />
      <ScoutLiveHero
        context={sampleScoutLive}
        quickActions={sampleQuickActions}
      />

      {/* ── 4. Game Day (Priority 4) ── */}
      <Divider
        title="Priority 4 — Game Day Hero"
        description="Matchup-focused hero. TRIGGERS WHEN: a Chicago team has an active or upcoming (within 1 hour) game in the live_games_registry. Rotates between multiple games with dot indicators (10s auto-rotation). Polls /api/hero-games every 10s for live score updates. Shows team logo, matchup, kickoff label, broadcast info."
      />
      <GameDayHero games={sampleGames} />

      {/* ── 5. Team Pulse (Priority 5) ── */}
      <Divider
        title="Priority 5 — Team Pulse Hero"
        description="Personalized team hero. TRIGGERS WHEN: user is logged in AND has a primary team set in sm_user_preferences.favorite_teams[0] AND recent articles exist for that team. Shows personalized greeting, team name, and 2-3 trending topic chips. Links to team hub page."
      />
      <TeamPulseHero
        team={sampleTeam}
        user={{ name: "Chris", primaryTeam: "bears" }}
      />

      {/* ── 6. Fan Debate (Priority 6) ── */}
      <Divider
        title="Priority 6 — Fan Debate Hero"
        description="Bold debate question. TRIGGERS WHEN: a recent published article (template_version = 1) contains a 'debate' block with a question field in its block JSON content. Shows debate question with optional sentiment label. Cyan accent."
      />
      <DebateHero debate={sampleDebate} />

      {/* ── 7. Scout Briefing (Priority 7 — Default) ── */}
      <Divider
        title="Priority 7 — Scout Briefing Hero (Default)"
        description="ALWAYS AVAILABLE as fallback. Scout AI identity + search input with rotating placeholders. Fetches daily Scout-generated prompts from /api/scout-prompts. Shows when no higher-priority mode triggers. Full viewport height."
      />
      <ScoutBriefingHero
        user={{ name: "Chris" }}
        quickActions={sampleQuickActions}
      />

      {/* ── 8. Original EdgeHero (Legacy) ── */}
      <Divider
        title="Legacy — Original Edge Hero"
        description="The original standalone EdgeHero component (edge-hero.tsx). Same Scout concept but as a single self-contained component rather than the modular hero system. Not used in the priority chain — kept for reference."
      />
      <EdgeHero
        userName="Chris"
        quickActions={sampleQuickActions}
      />

      {/* Footer spacer */}
      <div style={{ height: 80 }} />
    </main>
  )
}
