"use client"

import { ScoutBriefingHero } from "@/components/home/hero/modes/scout-briefing-hero"
import { TrendingFeaturedHero } from "@/components/home/hero/modes/trending-featured-hero"
import { StoryUniverseHero } from "@/components/home/hero/modes/story-universe-hero"
import { ScoutLiveHero } from "@/components/home/hero/modes/scout-live-hero"
import { GameDayHero } from "@/components/home/hero/modes/game-day-hero"
import { TeamPulseHero } from "@/components/home/hero/modes/team-pulse-hero"
import { DebateHero } from "@/components/home/hero/modes/debate-hero"
import { EdgeHero } from "@/components/home/edge-hero"
import {
  EditorialCard,
  PollCard,
  ChartCard,
  HubUpdateCard,
  BoxScoreCard,
  TradeProposalCard,
  ScoutSummaryCard,
  TrendingArticleCard,
  DebateCard,
  ScoutBriefingCard,
  ScoutAnalysisCard,
  VideoCard,
  FanReactionsCard,
  ScoutPredictionCard,
  GameModeCard,
} from "@/components/homepage/RiverCards"
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
/*  Shared card sample data                                            */
/* ------------------------------------------------------------------ */

const cardBase = { team: "Chicago Bears", teamColor: "#C83803", timestamp: "2h" }
const sampleStats = { comments: 42, retweets: 18, likes: 156, views: "3.2K" }

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
/*  Card label wrapper — renders a card with its name                  */
/* ------------------------------------------------------------------ */

function CardShowcase({ name, id, children }: { name: string; id: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ scrollMarginTop: 80 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "32px 0 12px",
        }}
      >
        <div style={{ height: 1, width: 24, background: "#00D4FF" }} />
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#00D4FF",
          }}
        >
          {name}
        </span>
      </div>
      {children}
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

      {/* ================================================================ */}
      {/*  HOMEPAGE CARD TYPES — Feed Cards Reference                       */}
      {/* ================================================================ */}

      <div
        style={{
          padding: "64px 24px 24px",
          textAlign: "center",
          background: "var(--hp-background, #FAFAFB)",
          color: "var(--hp-foreground, #0B0F14)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 16,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                height: 2,
                width: 60,
                background: "linear-gradient(to right, transparent, #D6B05E)",
              }}
            />
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#D6B05E",
              }}
            >
              Homepage Card Types
            </h2>
            <div
              style={{
                height: 2,
                width: 60,
                background: "linear-gradient(to left, transparent, #D6B05E)",
              }}
            />
          </div>
          <p style={{ fontSize: 14, color: "var(--hp-muted-foreground, #888)", maxWidth: 600, margin: "0 auto 24px" }}>
            All feed card types rendered with sample data. Reference these by name when requesting changes.
          </p>

          {/* Quick-jump index */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            {[
              { label: "EditorialCard", id: "card-editorial" },
              { label: "PollCard", id: "card-poll" },
              { label: "ChartCard", id: "card-chart" },
              { label: "HubUpdateCard", id: "card-hub-update" },
              { label: "BoxScoreCard", id: "card-box-score" },
              { label: "TradeProposalCard", id: "card-trade-proposal" },
              { label: "ScoutSummaryCard", id: "card-scout-summary" },
              { label: "TrendingArticleCard", id: "card-trending-article" },
              { label: "DebateCard", id: "card-debate" },
              { label: "ScoutBriefingCard", id: "card-scout-briefing" },
              { label: "ScoutAnalysisCard", id: "card-scout-analysis" },
              { label: "VideoCard", id: "card-video" },
              { label: "FanReactionsCard", id: "card-fan-reactions" },
              { label: "ScoutPredictionCard", id: "card-scout-prediction" },
              { label: "GameModeCard", id: "card-game-mode" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(0,212,255,0.3)",
                  color: "#00D4FF",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Card renders */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 80px" }}>

        <CardShowcase name="EditorialCard" id="card-editorial">
          <EditorialCard
            author={{ name: "Mike Davis", handle: "@mdavis", avatar: "", verified: true }}
            headline="Bears Land Top Pass Rusher in Blockbuster Trade"
            summary="Chicago's front office pulls off a stunning deal to address the team's biggest need heading into the 2026 season."
            insight="Scout sees this as a franchise-altering move. The Bears defense jumps from bottom-5 to top-12 projected."
            author_name="Mike Davis"
            breakingIndicator="BREAKING"
            stats={sampleStats}
            {...cardBase}
          />
        </CardShowcase>

        <CardShowcase name="PollCard" id="card-poll">
          <PollCard
            question="Who should the Bears target in the first round?"
            context="2026 NFL Draft"
            options={["Edge Rusher", "Offensive Line", "Wide Receiver"]}
            totalVotes={2520}
            status="LIVE"
            {...cardBase}
          />
        </CardShowcase>

        <CardShowcase name="ChartCard" id="card-chart">
          <ChartCard
            headline="Bears Pass Rush Pressure Rate (2025 Season)"
            takeaway="Pressure rate spiked in weeks 14-17, coinciding with the playoff push."
            chartData={[
              { label: "W1", value: 22 },
              { label: "W5", value: 28 },
              { label: "W9", value: 25 },
              { label: "W13", value: 31 },
              { label: "W17", value: 38 },
            ]}
            statSource="ESPN Next Gen Stats"
            stats={sampleStats}
            {...cardBase}
          />
        </CardShowcase>

        <CardShowcase name="HubUpdateCard" id="card-hub-update">
          <HubUpdateCard
            updateText="Bears officially sign veteran edge rusher to 3-year, $54M deal. Physical scheduled for tomorrow."
            takeaway="This fills the Bears' biggest roster hole heading into 2026."
            status="NEW"
            {...cardBase}
          />
        </CardShowcase>

        <CardShowcase name="BoxScoreCard" id="card-box-score">
          <BoxScoreCard
            homeTeam={{ name: "Bears", score: 27, logo: "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png" }}
            awayTeam={{ name: "Packers", score: 24, logo: "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png" }}
            status="FINAL"
            period="4th"
            keyPerformer="Caleb Williams — 28/34, 342 yds, 3 TD"
            {...cardBase}
          />
        </CardShowcase>

        <CardShowcase name="TradeProposalCard" id="card-trade-proposal">
          <TradeProposalCard
            proposer={{ name: "BearsGM_Fan", handle: "@BearsGM_Fan" }}
            teamGets={{ name: "Bears", items: ["Veteran Edge Rusher", "2027 5th Round Pick"] }}
            otherTeamGets={{ name: "Vikings", items: ["2026 2nd Round Pick", "Backup LB"] }}
            fairnessScore={74}
            isEditorApproved={false}
            {...cardBase}
          />
        </CardShowcase>

        <CardShowcase name="ScoutSummaryCard" id="card-scout-summary">
          <ScoutSummaryCard
            summary="Scout's daily analysis of the Bears defense shows improvement in coverage metrics but continued struggles generating pressure."
            bullets={[
              "Coverage grade improved to 72.4 (up from 64.1 last month)",
              "Pass rush win rate still bottom-5 in NFL at 28.3%",
              "Secondary playing more zone — 67% of snaps vs 52% earlier",
            ]}
            topic="Bears Defense"
            stats={sampleStats}
            {...cardBase}
          />
        </CardShowcase>

        <CardShowcase name="TrendingArticleCard" id="card-trending-article">
          <TrendingArticleCard
            headline="Why the Bears' Draft Strategy Just Changed Everything"
            summary="A deep dive into how Chicago's latest moves reshape their approach to the 2026 NFL Draft."
            trendMetric="4.8K views in 3 hours"
            stats={sampleStats}
            {...cardBase}
          />
        </CardShowcase>

        <CardShowcase name="DebateCard" id="card-debate">
          <DebateCard
            prompt="Is Caleb Williams a top-5 QB right now?"
            sideA="Yes — He's elite"
            sideB="No — Not yet"
            participantCount={1840}
            {...cardBase}
          />
        </CardShowcase>

        <CardShowcase name="ScoutBriefingCard" id="card-scout-briefing">
          <ScoutBriefingCard />
        </CardShowcase>

        <CardShowcase name="ScoutAnalysisCard" id="card-scout-analysis">
          <ScoutAnalysisCard
            analysis="The Bears' defensive line investment is paying off in ways the raw stats don't show. While sack numbers are modest, the interior pressure rate has jumped 12% since the trade, forcing quarterbacks into quicker throws and lower air yards."
          />
        </CardShowcase>

        <CardShowcase name="VideoCard" id="card-video">
          <VideoCard
            title="Film Breakdown: How the Bears Defense Stopped the Run"
            duration="12:34"
            source="Sports Mockery"
            teaser="Breaking down the key plays that shut down the league's top rushing attack."
            thumbnailUrl="/placeholder.jpg"
            stats={sampleStats}
            {...cardBase}
          />
        </CardShowcase>

        <CardShowcase name="FanReactionsCard" id="card-fan-reactions">
          <FanReactionsCard />
        </CardShowcase>

        <CardShowcase name="ScoutPredictionCard" id="card-scout-prediction">
          <ScoutPredictionCard
            homeTeam="Bears"
            awayTeam="Lions"
            homeScore={24}
            awayScore={21}
            winProbability={56}
          />
        </CardShowcase>

        <CardShowcase name="GameModeCard" id="card-game-mode">
          <GameModeCard
            homeTeam="Chicago Bears"
            awayTeam="Green Bay Packers"
            kickoff="6:30 PM CT"
            scoutNote="Bears are 3-1 in their last 4 home games against the Packers."
          />
        </CardShowcase>

      </div>
    </main>
  )
}
