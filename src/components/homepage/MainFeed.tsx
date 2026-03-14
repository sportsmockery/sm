"use client"

import { homepageRiverFeed, homepageTeamRiverFeeds, type HomepageRiverItem } from "@/lib/homepage-river-data"
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
          team={team}
          teamColor={teamColor}
          timestamp={timestamp}
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
        />
      )
    default:
      return null
  }
}

export default function MainFeed({ activeTab, setActiveTab, selectedTeam }: MainFeedProps) {
  // Get the appropriate River feed based on selection
  const feed = selectedTeam === "all" ? homepageRiverFeed : (homepageTeamRiverFeeds[selectedTeam] || [])

  // For team-specific views with limited content, supplement with all feed
  const displayFeed = feed.length < 5 ? [...feed, ...homepageRiverFeed.filter(item => !feed.includes(item)).slice(0, 10 - feed.length)] : feed

  return (
    <main className="min-h-screen w-full max-w-[600px] pt-4" style={{ borderLeft: '1px solid var(--hp-border)', borderRight: '1px solid var(--hp-border)' }}>
      {/* Top Intelligence Card - Featured Story */}
      <TopIntelligenceCard
        headline="Bears Finalize Historic Trade Package for Elite Receiver"
        summary="In a blockbuster move that reshapes the NFC North, the Chicago Bears have acquired a top-tier wide receiver, sending multiple draft picks to secure their franchise quarterback's most dangerous weapon yet."
        imageUrl="https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&auto=format&fit=crop&q=60"
        team="Bears"
        teamColor="#0B162A"
        timestamp="2 hours ago"
      />

      {/* River Feed */}
      <div className="pb-24" key={selectedTeam}>
        {/* Scout Briefing — always first in the feed */}
        <ScoutBriefingCard />

        {/* Game Mode card — shown on game days (placeholder) */}
        <GameModeCard
          homeTeam="Bears"
          awayTeam="Packers"
          kickoff="7:20 PM CT"
          scoutNote="Watch the Bears secondary tonight — Green Bay has exploited zone coverage for 300+ yards in 3 of the last 4 meetings."
        />

        {/* Scout Prediction — once per day on game days (placeholder) */}
        <ScoutPredictionCard
          homeTeam="Cubs"
          awayTeam="Brewers"
          homeScore={5}
          awayScore={3}
          winProbability={63}
        />

        {displayFeed.map((item, index) => (
          <div key={item.id}>
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
