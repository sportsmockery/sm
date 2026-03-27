'use client';

import React from 'react';
import { ThumbsUp, Share2, MessageCircle } from 'lucide-react';

interface CardActionButtonsProps {
  commentsCount?: number;
  articleUrl?: string;
}

export function CardActionButtons({ commentsCount, articleUrl }: CardActionButtonsProps) {
  const count = commentsCount ?? 0;

  return (
    <div className="flex items-center gap-5 mt-4 pt-3 border-t" style={{ borderColor: 'var(--sm-border)' }}>
      <button
        type="button"
        className="flex items-center gap-2 transition-colors min-h-[44px] like-btn"
        style={{
          color: 'var(--sm-text-meta)',
          fontSize: 15,
          fontWeight: 500,
        }}
        aria-label="Like this card"
      >
        <ThumbsUp
          size={20}
          strokeWidth={2}
          className="shrink-0"
          style={{ color: 'inherit' }}
          aria-hidden
        />
        <span>Like</span>
      </button>
      {articleUrl ? (
        <a
          href={articleUrl}
          className="flex items-center gap-2 transition-colors min-h-[44px]"
          style={{
            color: 'var(--sm-text-meta)',
            fontSize: 15,
            fontWeight: 500,
            textDecoration: 'none',
          }}
          aria-label={`${count} comments`}
        >
          <MessageCircle
            size={20}
            strokeWidth={2}
            className="shrink-0"
            style={{ color: 'inherit' }}
            aria-hidden
          />
          <span>{count}</span>
        </a>
      ) : (
        <span
          className="flex items-center gap-2 min-h-[44px]"
          style={{
            color: 'var(--sm-text-meta)',
            fontSize: 15,
            fontWeight: 500,
          }}
          aria-label={`${count} comments`}
        >
          <MessageCircle
            size={20}
            strokeWidth={2}
            className="shrink-0"
            style={{ color: 'inherit' }}
            aria-hidden
          />
          <span>{count}</span>
        </span>
      )}
      <button
        type="button"
        className="flex items-center gap-2 transition-colors min-h-[44px] share-btn"
        style={{
          color: 'var(--sm-text-meta)',
          fontSize: 15,
          fontWeight: 500,
        }}
        aria-label="Share this card"
      >
        <Share2
          size={20}
          strokeWidth={2}
          className="shrink-0"
          style={{ color: 'inherit' }}
          aria-hidden
        />
        <span>Share</span>
      </button>
    </div>
  );
}
