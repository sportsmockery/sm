'use client';

import React, { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import type { RiverCard } from '@/lib/river-types';
import { useCardReveal } from '@/hooks/useCardReveal';
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
  insertAtIndex2?: React.ReactNode;
}

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

interface PlayableArticle {
  title: string;
  slug: string;
  url: string;
}

function renderCardContent(index: number, card: RiverCard, siblingArticles?: PlayableArticle[]) {
  const isBreathing = index % 8 === 7;

  switch (card.card_type) {
    case 'scout_summary':
      return <ScoutArticleCard card={card} />;
    case 'hub_update':
      return <HubUpdateCard card={card} />;
    case 'trade_proposal':
      return <TradeProposalCard card={card} />;
    case 'vision_theater':
      return <VisionTheaterCard card={card} />;
    case 'trending_article':
      return <TrendingArticleCard card={card} />;
    case 'box_score':
      return <BoxScoreCard card={card} />;
    case 'trending_player':
      return <TrendingPlayerCard card={card} />;
    case 'fan_chat':
      return <FanChatCard card={card} />;
    case 'mock_draft':
      return <MockDraftCard card={card} />;
    case 'sm_plus':
      return <SmPlusCard card={card} />;
    case 'infographic':
      return <InfographicCard card={card} />;
    case 'chart':
      return <ChartCard card={card} />;
    case 'poll':
      return <PollCard card={card} />;
    case 'comment_spotlight':
      return <CommentSpotlightCard card={card} />;
    case 'listen_now':
      return <ListenNowCard card={card} siblingArticles={siblingArticles} />;
    case 'join_newsletter':
      return <JoinNewsletterCard card={card} />;
    case 'download_app':
      return <DownloadAppCard card={card} />;
    default: {
      const _exhaustive: never = card.card_type;
      return <PlaceholderCard card={card} isBreathing={isBreathing} />;
    }
  }
}

export default function RiverFeed({
  riverCards,
  loadMore,
  isLoading,
  hasMore,
  insertAtIndex2,
}: RiverFeedProps) {
  // Collect playable articles from listen_now cards for queue population
  const playableArticles = useMemo(() => {
    return riverCards
      .filter(c => c.card_type === 'listen_now')
      .map(c => {
        const content = c.content as Record<string, unknown>;
        const slug = (content.slug as string | undefined) ?? c.card_id;
        return {
          title: (content.headline as string | undefined) ?? 'Listen to this article',
          slug,
          url: (content.cta_url as string | undefined) ?? '#',
        };
      });
  }, [riverCards]);

  const { ref: sentinelRef } = useInView({
    threshold: 0,
    rootMargin: '400px',
    onChange(inView) {
      if (inView && hasMore && !isLoading) {
        loadMore();
      }
    },
  });

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CSS-driven scroll reveal (IntersectionObserver adds .visible)
  useCardReveal(riverCards.length);

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

      <div className="feed-container space-y-4">
        {riverCards.map((card, index) => (
          <React.Fragment key={card.card_id}>
            {index === 2 && insertAtIndex2 && (
              <div className="feed-card">
                {insertAtIndex2}
              </div>
            )}
            <div className="feed-card">
              {renderCardContent(index, card, playableArticles)}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="h-1" />
      )}

      {isLoading && riverCards.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
        </div>
      )}

      {!hasMore && riverCards.length > 0 && (
        <div className="text-center py-6 text-sm text-[#94a3b8]">
          You&apos;re all caught up
        </div>
      )}
    </div>
  );
}
