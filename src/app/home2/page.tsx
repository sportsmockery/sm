"use client"

import { ScoutBriefingHero } from "@/components/home/hero/modes/scout-briefing-hero"
import { TrendingFeaturedHero } from "@/components/home/hero/modes/trending-featured-hero"
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
        <p style={{ fontSize: 15, color: "var(--hp-muted-foreground, #888)", maxWidth: 600, margin: "0 auto" }}>
          All hero modes that can appear on the homepage, rendered with sample data.
          Scroll to see each version.
        </p>
      </div>

      {/* ── 1. Scout Briefing (Default) ── */}
      <Divider
        title="1 — Scout Briefing Hero"
        description="Default fallback. Scout AI identity + search input with rotating placeholders. Shows when no other context triggers a higher-priority mode."
      />
      <ScoutBriefingHero
        user={{ name: "Chris" }}
        quickActions={sampleQuickActions}
      />

      {/* ── 2. Trending Featured ── */}
      <Divider
        title="2 — Trending Featured Hero"
        description="Full-bleed image takeover for a trending article. Triggers when a story exceeds 2,500 views or has an editor override. Cinematic height (70vh)."
      />
      <TrendingFeaturedHero story={sampleStory} />

      {/* ── 3. Game Day ── */}
      <Divider
        title="3 — Game Day Hero"
        description="Matchup-focused hero with kickoff time, storyline, and pulsing Game Day badge. Rotates between multiple games with dot indicators (10s cycle). Triggers when a Chicago team has a game today."
      />
      <GameDayHero games={sampleGames} />

      {/* ── 4. Team Pulse ── */}
      <Divider
        title="4 — Team Pulse Hero"
        description="Personalized team hero for logged-in users with a primary team set. Shows trending topics for their team."
      />
      <TeamPulseHero
        team={sampleTeam}
        user={{ name: "Chris", primaryTeam: "bears" }}
      />

      {/* ── 5. Fan Debate ── */}
      <Divider
        title="5 — Fan Debate Hero"
        description="Bold debate question with sentiment indicator. Triggers when an active debate has high engagement."
      />
      <DebateHero debate={sampleDebate} />

      {/* ── 6. Original EdgeHero ── */}
      <Divider
        title="6 — Original Edge Hero"
        description="The original standalone EdgeHero component (edge-hero.tsx). Same Scout concept but as a single self-contained component rather than the modular hero system."
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
