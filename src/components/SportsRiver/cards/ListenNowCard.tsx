'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { useAudioPlayer } from '@/context/AudioPlayerContext';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface PlayableArticle {
  title: string;
  slug: string;
  url: string;
}

interface ListenNowCardProps {
  card: RiverCard;
  siblingArticles?: PlayableArticle[];
}

const VOICES = ['Voice A', 'Voice B', 'Team Voice'] as const;

export const ListenNowCard = React.memo(function ListenNowCard({ card, siblingArticles }: ListenNowCardProps) {
  const c = card.content as Record<string, unknown>;
  const headline = (c.headline as string | undefined) ?? 'Listen to this article';
  const description = c.description as string | undefined;
  const ctaUrl = (c.cta_url as string | undefined) ?? '#';
  const estimatedTime = c.estimated_time as string | undefined;

  const audioPlayer = useAudioPlayer();
  const [selectedVoice, setSelectedVoice] = useState<string>('Voice A');
  const cardRef = useRef<HTMLDivElement>(null);

  // Use slug (or card_id) as stable identity for matching active article
  const cardSlug = (c.slug as string | undefined) ?? card.card_id;

  const handlePlay = useCallback(() => {
    audioPlayer.play({ title: headline, slug: cardSlug, url: ctaUrl }, selectedVoice);
    // Enqueue sibling playable articles that come after this one
    if (siblingArticles) {
      const myIndex = siblingArticles.findIndex(a => a.slug === cardSlug);
      const upcoming = myIndex >= 0 ? siblingArticles.slice(myIndex + 1) : siblingArticles.filter(a => a.slug !== cardSlug);
      audioPlayer.setQueue(upcoming);
    }
  }, [audioPlayer, headline, cardSlug, ctaUrl, selectedVoice, siblingArticles]);

  const handlePause = useCallback(() => {
    audioPlayer.pause();
  }, [audioPlayer]);

  const isActiveArticle = audioPlayer.currentArticle?.slug === cardSlug;
  const isCurrentlyPlaying = audioPlayer.isPlaying && isActiveArticle;

  // Track visibility — only the card matching the currently playing article controls cardOutOfView
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !isActiveArticle) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        audioPlayer.setCardOutOfView(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [audioPlayer, isActiveArticle]);

  // Reset cardOutOfView when playback switches away from this card
  useEffect(() => {
    if (!isActiveArticle) return;
    return () => {
      audioPlayer.setCardOutOfView(false);
    };
  }, [isActiveArticle, audioPlayer]);

  return (
    <div ref={cardRef}>
    <BaseGlassCard trackingToken={card.tracking_token} accentColor={card.ui_directives.accent}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#BC0000' }}>
          {CARD_TYPE_LABELS[card.card_type]}
        </span>
        <span className="text-xs text-[#E6E8EC]/60">{formatTimestamp(card.timestamp)}</span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-[#FAFAFB] mb-1">{headline}</h3>
      {description && (
        <p className="text-sm text-[#E6E8EC] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
          {description}
        </p>
      )}

      {/* Voice selector */}
      <div className="flex items-center gap-1 mb-4">
        {VOICES.map((voice) => (
          <button
            key={voice}
            onClick={() => setSelectedVoice(voice)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors min-h-[44px] ${
              selectedVoice === voice
                ? 'bg-[#BC0000] text-[#FAFAFB] font-bold'
                : 'bg-[#2B3442] text-[#E6E8EC]/60 hover:text-[#FAFAFB]'
            }`}
            aria-label={`Select ${voice}`}
          >
            {voice}
          </button>
        ))}
      </div>

      {/* Play button + estimated time */}
      <div className="flex items-center gap-4">
        <button
          onClick={isCurrentlyPlaying ? handlePause : handlePlay}
          className="w-14 h-14 rounded-full flex items-center justify-center min-w-[44px] min-h-[44px] transition-transform hover:scale-105"
          style={{ backgroundColor: '#BC0000' }}
          aria-label={isCurrentlyPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isCurrentlyPlaying ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <rect x="4" y="3" width="4" height="14" rx="1" />
              <rect x="12" y="3" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
              <path d="M0 0L20 12L0 24V0Z" fill="white" />
            </svg>
          )}
        </button>
        {estimatedTime && (
          <span className="text-xs text-[#E6E8EC]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
            {estimatedTime}
          </span>
        )}
      </div>

      {/* Progress bar when playing */}
      {isCurrentlyPlaying && (
        <div className="mt-3 h-1 bg-[#2B3442] rounded-full overflow-hidden">
          <div
            className="h-1 bg-[#BC0000] rounded-full"
            style={{
              width: audioPlayer.duration > 0
                ? `${(audioPlayer.currentTime / audioPlayer.duration) * 100}%`
                : '0%',
              transition: 'width 0.3s linear',
            }}
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#2B3442]">
        <button className="flex items-center gap-1 text-xs text-[#E6E8EC]/60 hover:text-[#BC0000] transition-colors min-h-[44px]" aria-label="Like this card">
          &#9829; Like
        </button>
        <button className="flex items-center gap-1 text-xs text-[#E6E8EC]/60 hover:text-[#00D4FF] transition-colors min-h-[44px]" aria-label="Share this card">
          &#8599; Share
        </button>
      </div>
    </BaseGlassCard>
    </div>
  );
});
