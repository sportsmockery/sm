import React from 'react'
import EditorialCard from './EditorialCard'
import PollCard from './PollCard'
import ChartCard from './ChartCard'
import HubUpdateCard from './HubUpdateCard'
import BoxScoreCard from './BoxScoreCard'
import TradeProposalCard from './TradeProposalCard'
import ScoutSummaryCard from './ScoutSummaryCard'
import TrendingArticleCard from './TrendingArticleCard'
import DebateCard from './DebateCard'
import VideoCard from './VideoCard'
import ScoutBriefingCard from './ScoutBriefingCard'
import ScoutAnalysisCard from './ScoutAnalysisCard'
import FanReactionsCard from './FanReactionsCard'
import ScoutPredictionCard from './ScoutPredictionCard'

export interface RiverCard {
  id: string
  card_type: string
  team: string
  team_color: string
  timestamp: string
  data: any
}

interface CardRendererProps {
  card: RiverCard
  onPress?: (card: RiverCard) => void
}

export default function CardRenderer({ card, onPress }: CardRendererProps) {
  const handlePress = () => onPress?.(card)
  const { data, team } = card

  switch (card.card_type) {
    case 'editorial':
      return (
        <EditorialCard
          team={team}
          category={data.category}
          headline={data.headline}
          summary={data.summary}
          imageUrl={data.imageUrl}
          insight={data.insight}
          author={data.author}
          timestamp={data.timestamp ?? card.timestamp}
          reactions={data.reactions}
          comments={data.comments}
          onPress={handlePress}
          onShare={data.onShare}
        />
      )

    case 'poll':
      return (
        <PollCard
          team={team}
          question={data.question}
          options={data.options}
          totalVotes={data.totalVotes}
          status={data.status}
          onVote={data.onVote}
          onPress={handlePress}
        />
      )

    case 'chart':
      return (
        <ChartCard
          team={team}
          headline={data.headline}
          bars={data.bars}
          takeaway={data.takeaway}
          source={data.source}
          onPress={handlePress}
        />
      )

    case 'hub_update':
      return (
        <HubUpdateCard
          team={team}
          status={data.status}
          text={data.text}
          takeaway={data.takeaway}
          onPress={handlePress}
        />
      )

    case 'box_score':
      return (
        <BoxScoreCard
          team={team}
          homeTeam={data.homeTeam}
          awayTeam={data.awayTeam}
          period={data.period}
          clock={data.clock}
          status={data.status}
          keyPerformer={data.keyPerformer}
          onPress={handlePress}
        />
      )

    case 'trade_proposal':
      return (
        <TradeProposalCard
          team={team}
          teamA={data.teamA}
          teamB={data.teamB}
          fairnessScore={data.fairnessScore}
          onApprove={data.onApprove}
          onReject={data.onReject}
          onPress={handlePress}
        />
      )

    case 'scout_summary':
      return (
        <ScoutSummaryCard
          team={team}
          topic={data.topic}
          summary={data.summary}
          insights={data.insights}
          onAskScout={data.onAskScout}
          onPress={handlePress}
        />
      )

    case 'trending':
      return (
        <TrendingArticleCard
          team={team}
          headline={data.headline}
          summary={data.summary}
          viewVelocity={data.viewVelocity}
          reactions={data.reactions}
          comments={data.comments}
          onPress={handlePress}
          onShare={data.onShare}
        />
      )

    case 'debate':
      return (
        <DebateCard
          team={team}
          question={data.question}
          sideA={data.sideA}
          sideB={data.sideB}
          totalParticipants={data.totalParticipants}
          onVote={data.onVote}
          onPress={handlePress}
        />
      )

    case 'video':
      return (
        <VideoCard
          team={team}
          title={data.title}
          thumbnailUrl={data.thumbnailUrl}
          duration={data.duration}
          source={data.source}
          onPress={handlePress}
        />
      )

    case 'scout_briefing':
      return (
        <ScoutBriefingCard
          team={team}
          items={data.items}
          onPlayAudio={data.onPlayAudio}
          onAskScout={data.onAskScout}
          onPress={handlePress}
        />
      )

    case 'scout_analysis':
      return (
        <ScoutAnalysisCard
          text={data.text}
          onPress={handlePress}
        />
      )

    case 'fan_reactions':
      return (
        <FanReactionsCard
          team={team}
          quotes={data.quotes}
          isLive={data.isLive}
          onJoinChat={data.onJoinChat}
          onPress={handlePress}
        />
      )

    case 'scout_prediction':
      return (
        <ScoutPredictionCard
          team={team}
          homeTeam={data.homeTeam}
          awayTeam={data.awayTeam}
          winProbability={data.winProbability}
          onVote={data.onVote}
          onPress={handlePress}
        />
      )

    default:
      return null
  }
}
