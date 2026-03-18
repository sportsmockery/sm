"use client"

import { useState, useEffect } from "react"
import { type HomepageRiverItem } from "@/lib/homepage-river-data"
import TopIntelligenceCard from "@/components/homepage/TopIntelligenceCard"
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
  VideoCard,
  ScoutBriefingCard,
  ScoutAnalysisCard,
  FanReactionsCard,
  ScoutPredictionCard,
  GameModeCard,
} from "@/components/homepage/RiverCards"

interface MainFeedProps {
  activeTab: "for-you" | "team-pulse"
  setActiveTab: (tab: "for-you" | "team-pulse") => void
  selectedTeam: string
  /** Article ID currently shown in the hero — suppress from first feed position */
  heroArticleId?: number
}

function RiverCard({ item }: { item: HomepageRiverItem }) {
  const { type, team, teamColor, timestamp, data } = item

  switch (type) {
    case "editorial":
      return (
        <EditorialCard
          author={data.author as { name: string; handle: string; avatar: string; verified: boolean }}
          headline={data.headline as string}
          summary={data.summary as string}
          insight={data.insight as string}
          team={team}
          teamColor={teamColor}
          timestamp={timestamp}
          stats={data.stats as { comments: number; retweets: number; likes: number; views: string }}
          author_name={data.author_name as string}
          breakingIndicator={data.breakingIndicator as "BREAKING" | "RUMOR" | "ANALYSIS" | "REPORT" | "TRENDING"}
          gmQuestion={data.gmQuestion as string}
          trendingContext={data.trendingContext as string | undefined}
          rumorCredibility={data.rumorCredibility as "HIGH" | "MEDIUM" | "LOW" | undefined}
          scoutStat={data.scoutStat as string | undefined}
          authorPhoto={data.authorPhoto as string | undefined}
          slug={data.slug as string | undefined}
          categorySlug={data.categorySlug as string | undefined}
          featuredImage={(data.featuredImage as string) || undefined}
        />
      )
    case "poll":
      return (
        <PollCard
          question={data.question as string}
          context={data.context as string}
          options={data.options as string[]}
          totalVotes={data.totalVotes as number}
          status={data.status as "LIVE" | "CLOSED"}
          team={team}
          teamColor={teamColor}
          timestamp={timestamp}
        />
      )
    case "chart":
      return (
        <ChartCard
          headline={data.headline as string}
          takeaway={data.takeaway as string}
          chartData={data.chartData as { label: string; value: number }[]}
          statSource={data.statSource as string}
          team={team}
          teamColor={teamColor}
          timestamp={timestamp}
          stats={data.stats as { comments: number; retweets: number; likes: number; views: string }}
        />
      )
    case "hub_update":
      return (
        <HubUpdateCard
          updateText={data.updateText as string}
          takeaway={data.takeaway as string}
          status={data.status as "LIVE" | "NEW" | "UPDATED"}
          team={team}
          teamColor={teamColor}
          timestamp={timestamp}
        />
      )
    case "box_score":
      return (
        <BoxScoreCard
          homeTeam={data.homeTeam as { name: string; logo: string; score: number }}
          awayTeam={data.awayTeam as { name: string; logo: string; score: number }}
          status={data.status as "LIVE" | "FINAL"}
          period={data.period as string}
          keyPerformer={data.keyPerformer as string}
          team={team}
          teamColor={teamColor}
          timestamp={timestamp}
        />
      )
    case "trade_proposal":
      return (
        <TradeProposalCard
          proposer={data.proposer as { name: string; handle: string }}
          teamGets={data.teamGets as { name: string; items: string[] }}
          otherTeamGets={data.otherTeamGets as { name: string; items: string[] }}
          fairnessScore={data.fairnessScore as number}
          isEditorApproved={data.isEditorApproved as boolean}
          team={team}
          teamColor={teamColor}
          timestamp={timestamp}
        />
      )
    case "scout_summary":
      return (
        <ScoutSummaryCard
          summary={data.summary as string}
          bullets={data.bullets as string[]}
          topic={data.topic as string}
          slug={data.slug as string | undefined}
          categorySlug={data.categorySlug as string | undefined}
          team={team}
          teamColor={teamColor}
          timestamp={timestamp}
          stats={data.stats as { views: string } | undefined}
        />
      )
    case "trending_article":
      return (
        <TrendingArticleCard
          headline={data.headline as string}
          summary={data.summary as string}
          trendMetric={data.trendMetric as string}
          team={team}
          teamColor={teamColor}
          timestamp={timestamp}
          stats={data.stats as { comments: number; retweets: number; likes: number; views: string }}
          slug={data.slug as string | undefined}
          categorySlug={data.categorySlug as string | undefined}
        />
      )
    case "debate":
      return (
        <DebateCard
          prompt={data.prompt as string}
          sideA={data.sideA as string}
          sideB={data.sideB as string}
          participantCount={data.participantCount as number}
          team={team}
          teamColor={teamColor}
          timestamp={timestamp}
        />
      )
    case "video":
      return (
        <VideoCard
          title={data.title as string}
          duration={data.duration as string}
          source={data.source as string}
          teaser={data.teaser as string}
          thumbnailUrl={data.thumbnailUrl as string}
          team={team}
          teamColor={teamColor}
          timestamp={timestamp}
          stats={data.stats as { comments: number; retweets: number; likes: number; views: string }}
          slug={data.slug as string | undefined}
          categorySlug={data.categorySlug as string | undefined}
          videoId={data.videoId as string | undefined}
          isShort={data.isShort as boolean | undefined}
        />
      )
    default:
      return null
  }
}

// ─── Loading skeleton for feed items ───
function FeedSkeleton() {
  return (
    <div className="space-y-4 px-4 pt-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-[14px] p-5 animate-pulse" style={{ border: '1px solid var(--hp-border)', background: 'var(--hp-card)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full" style={{ background: 'var(--hp-border)' }} />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded" style={{ background: 'var(--hp-border)' }} />
              <div className="h-2 w-16 rounded" style={{ background: 'var(--hp-border)' }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded" style={{ background: 'var(--hp-border)' }} />
            <div className="h-4 w-3/4 rounded" style={{ background: 'var(--hp-border)' }} />
            <div className="h-3 w-full rounded mt-3" style={{ background: 'var(--hp-border)' }} />
            <div className="h-3 w-5/6 rounded" style={{ background: 'var(--hp-border)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MainFeed({ activeTab, setActiveTab, selectedTeam, heroArticleId }: MainFeedProps) {
  const [feed, setFeed] = useState<HomepageRiverItem[]>([])
  const [teamFeeds, setTeamFeeds] = useState<Record<string, HomepageRiverItem[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Fetch live feed data from API
  useEffect(() => {
    let cancelled = false

    async function fetchFeed() {
      setLoading(true)
      setError(false)

      try {
        const res = await fetch('/api/feed')
        if (!res.ok) throw new Error(`Feed API returned ${res.status}`)

        const data = await res.json()

        if (cancelled) return

        if (data.riverItems && data.riverItems.length > 0) {
          setFeed(data.riverItems)
          setTeamFeeds(data.teamRiverItems || {})
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('[MainFeed] Failed to fetch feed:', err)
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchFeed()
    return () => { cancelled = true }
  }, [])

  // Select display feed based on team filter
  const displayFeed = selectedTeam === "all"
    ? feed
    : (teamFeeds[selectedTeam] || [])

  // If team filter yields too few items, supplement with all feed
  const finalFeed = displayFeed.length < 3 && displayFeed.length > 0
    ? [...displayFeed, ...feed.filter(item => !displayFeed.some(d => d.id === item.id)).slice(0, 10 - displayFeed.length)]
    : displayFeed

  // If a hero article is shown above, suppress it from the first feed position
  // to avoid duplication. It can still appear later in the feed naturally.
  const heroSuppressedFeed = heroArticleId
    ? finalFeed.filter((item, idx) => {
        // Only suppress from first 3 positions
        if (idx >= 3) return true
        const postId = item.data?.postId
        return postId !== heroArticleId
      })
    : finalFeed

  // Get featured story from the first item
  const featuredItem = heroSuppressedFeed[0] || feed[0]
  const feedItems = selectedTeam === "all" ? heroSuppressedFeed.slice(1) : heroSuppressedFeed

  return (
    <main className="min-h-screen w-full max-w-[600px] pt-4" style={{ borderLeft: '1px solid var(--hp-border)', borderRight: '1px solid var(--hp-border)' }}>
      {/* Top Intelligence Card - aligned with top of side borders */}
      <div className="-mt-4">
        {featuredItem ? (
          <TopIntelligenceCard
            headline={featuredItem.data.headline as string}
            summary={featuredItem.data.summary as string}
            imageUrl={(featuredItem.data.featuredImage as string) || ""}
            team={featuredItem.team}
            teamColor={featuredItem.teamColor}
            timestamp={featuredItem.timestamp}
            slug={featuredItem.data.slug as string | undefined}
            categorySlug={featuredItem.data.categorySlug as string | undefined}
            viewsLabel={
              (featuredItem.data.stats as { views?: string } | undefined)?.views
            }
          />
        ) : !loading && (
          <TopIntelligenceCard
            headline="Welcome to SM Edge"
            summary="Your Chicago sports intelligence feed is loading. Check back soon for the latest news, analysis, and fan engagement."
            imageUrl=""
            team="Chicago Sports"
            teamColor="#0B0F14"
            timestamp=""
            viewsLabel={undefined}
          />
        )}
      </div>

      {/* River Feed */}
      <div className="pb-24" key={selectedTeam}>
        {/* Scout Briefing — always first in the feed */}
        <ScoutBriefingCard />

        {/* Loading state */}
        {loading && <FeedSkeleton />}

        {/* Error state — no data available */}
        {!loading && error && feedItems.length === 0 && (
          <div className="px-4 py-12 text-center" style={{ color: 'var(--hp-muted-foreground)' }}>
            <p style={{ fontSize: 15 }}>Unable to load feed. Please try again later.</p>
          </div>
        )}

        {/* Live feed items */}
        {!loading && feedItems.map((item, index) => (
          <div key={`${item.id}-${index}`}>
            {index === 5 && (
              <div className="hp-day-divider px-4">
                <span>Earlier Today</span>
              </div>
            )}
            {index === 8 && (
              <div className="hp-day-divider px-4">
                <span>Yesterday</span>
              </div>
            )}
            <RiverCard item={item} />
            {typeof item.data.scoutAnalysis === "string" && (
              <ScoutAnalysisCard analysis={item.data.scoutAnalysis} />
            )}
            {/* Fan Reactions card every 8 items */}
            {(index + 1) % 8 === 0 && <FanReactionsCard />}
          </div>
        ))}
      </div>
    </main>
  )
}
