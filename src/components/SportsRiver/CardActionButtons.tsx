'use client';

import React from 'react';
import { ThumbsUp, Share2 } from 'lucide-react';

export function CardActionButtons() {
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
