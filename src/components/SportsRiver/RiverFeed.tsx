'use client';

import React, { useCallback, useRef } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from './BaseGlassCard';
import RiverGhostPill from './RiverGhostPill';
import RiverOfflineBanner from './RiverOfflineBanner';
import { ScoutArticleCard } from './cards/ScoutArticleCard';
import { HubUpdateCard } from './cards/HubUpdateCard';
import { TradeProposalCard } from './cards/TradeProposalCard';
import { VisionTheaterCard } from './cards/VisionTheaterCard';
import { TrendingArticleCard } from './cards/TrendingArticleCard';
import { BoxScoreCard } from './cards/BoxScoreCard';
import { TrendingPlayerCard } from './cards/TrendingPlayerCard';
import { FanChatCard } from './cards/FanChatCard';
import { MockDraftCard } from './cards/MockDraftCard';
import { SmPlusCard } from './cards/SmPlusCard';
import { InfographicCard } from './cards/InfographicCard';
import { ChartCard } from './cards/ChartCard';
import { PollCard } from './cards/PollCard';
import { CommentSpotlightCard } from './cards/CommentSpotlightCard';
import { ListenNowCard } from './cards/ListenNowCard';
import { JoinNewsletterCard } from './cards/JoinNewsletterCard';
import { DownloadAppCard } from './cards/DownloadAppCard';

interface RiverFeedProps {
  riverCards: RiverCard[];
  loadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
}

// Placeholder card for types not yet built (T5)
const PlaceholderCard = React.memo(function PlaceholderCard({
  card,
  isBreathing,
}: {
  card: RiverCard;
  isBreathing: boolean;
}) {
  const label = card.card_type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const c = card.content as Record<string, string | undefined>;
  const heading = c.title ?? c.headline;
  const body = c.excerpt ?? c.description ?? c.content;

  return (
    <BaseGlassCard
      trackingToken={card.tracking_token}
      accentColor={card.ui_directives.accent}
      isBreathing={isBreathing}
    >
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
          {label}
        </span>
        {heading && (
          <h3 className="text-lg font-bold text-[#FAFAFB]">{heading}</h3>
        )}
        {body && (
          <p className="text-sm text-[#E6E8EC] line-clamp-2">{body}</p>
        )}
        {!heading && !body && (
          <p className="text-sm text-[#94a3b8] italic">Coming soon</p>
        )}
      </div>
    </BaseGlassCard>
  );
});

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl border border-[#2B3442] overflow-hidden"
      style={{
        background: 'rgba(27, 36, 48, 0.72)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="h-[2px] w-full bg-[#2B3442]" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 rounded bg-[#2B3442] animate-pulse" />
        <div className="h-5 w-3/4 rounded bg-[#2B3442] animate-pulse" />
        <div className="h-4 w-full rounded bg-[#2B3442] animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-[#2B3442] animate-pulse" />
      </div>
    </div>
  );
}

function renderCard(index: number, card: RiverCard) {
  const isBreathing = index % 8 === 7;

  let cardElement: React.ReactNode;
  switch (card.card_type) {
    case 'scout_summary':
      cardElement = <ScoutArticleCard card={card} />;
      break;
    case 'hub_update':
      cardElement = <HubUpdateCard card={card} />;
      break;
    case 'trade_proposal':
      cardElement = <TradeProposalCard card={card} />;
      break;
    case 'vision_theater':
      cardElement = <VisionTheaterCard card={card} />;
      break;
    case 'trending_article':
      cardElement = <TrendingArticleCard card={card} />;
      break;
    case 'box_score':
      cardElement = <BoxScoreCard card={card} />;
      break;
    case 'trending_player':
      cardElement = <TrendingPlayerCard card={card} />;
      break;
    case 'fan_chat':
      cardElement = <FanChatCard card={card} />;
      break;
    case 'mock_draft':
      cardElement = <MockDraftCard card={card} />;
      break;
    case 'sm_plus':
      cardElement = <SmPlusCard card={card} />;
      break;
    case 'infographic':
      cardElement = <InfographicCard card={card} />;
      break;
    case 'chart':
      cardElement = <ChartCard card={card} />;
      break;
    case 'poll':
      cardElement = <PollCard card={card} />;
      break;
    case 'comment_spotlight':
      cardElement = <CommentSpotlightCard card={card} />;
      break;
    case 'listen_now':
      cardElement = <ListenNowCard card={card} />;
      break;
    case 'join_newsletter':
      cardElement = <JoinNewsletterCard card={card} />;
      break;
    case 'download_app':
      cardElement = <DownloadAppCard card={card} />;
      break;
    default: {
      const _exhaustive: never = card.card_type;
      cardElement = <PlaceholderCard card={card} isBreathing={isBreathing} />;
      break;
    }
  }

  return <div className="mb-4">{cardElement}</div>;
}

export default function RiverFeed({
  riverCards,
  loadMore,
  isLoading,
  hasMore,
}: RiverFeedProps) {
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const handleScrollToTop = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({ index: 0, behavior: 'smooth' });
  }, []);

  if (isLoading && riverCards.length === 0) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="relative">
      <RiverOfflineBanner />
      <RiverGhostPill onScrollToTop={handleScrollToTop} />

      <Virtuoso
        ref={virtuosoRef}
        data={riverCards}
        itemContent={renderCard}
        useWindowScroll
        endReached={loadMore}
        overscan={5}
        increaseViewportBy={200}
        components={{
          Footer: () =>
            isLoading && riverCards.length > 0 ? (
              <div className="flex justify-center py-6">
                <div className="h-6 w-6 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
              </div>
            ) : !hasMore && riverCards.length > 0 ? (
              <div className="text-center py-6 text-sm text-[#94a3b8]">
                You&apos;re all caught up
              </div>
            ) : null,
        }}
      />
    </div>
  );
}
