'use client';

import React from 'react';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface DownloadAppCardProps {
  card: RiverCard;
}

export const DownloadAppCard = React.memo(function DownloadAppCard({ card }: DownloadAppCardProps) {
  const c = card.content as Record<string, unknown>;
  const headline = (c.headline as string | undefined) ?? 'Get the SM App';
  const description = c.description as string | undefined;
  const appleUrl = (c.apple_url as string | undefined) ?? '#';
  const googleUrl = (c.google_url as string | undefined) ?? '#';

  const features = ['Live feed', 'Scout AI', 'Game alerts'];

  return (
    <BaseGlassCard trackingToken={card.tracking_token} accentColor={card.ui_directives.accent}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#BC0000' }}>
          {CARD_TYPE_LABELS[card.card_type]}
        </span>
        <span className="text-xs text-[#E6E8EC]/60">{formatTimestamp(card.timestamp)}</span>
      </div>

      {/* App icon + content */}
      <div className="flex items-start gap-4 mb-4">
        {/* App icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#BC0000] flex-shrink-0 flex items-center justify-center">
          <span className="text-white text-xl font-bold">SM</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-[#FAFAFB] mb-1">{headline}</h3>
          {description && (
            <p className="text-sm text-[#E6E8EC] line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Feature bullets */}
      <p className="text-xs text-[#E6E8EC]/60 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        {features.join(' \u00B7 ')}
      </p>

      {/* Store buttons */}
      <div className="flex items-center gap-3">
        <a
          href={appleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-full bg-[#FAFAFB] text-[#0B0F14] text-sm font-bold hover:opacity-90 transition-opacity"
          aria-label="Download on Apple App Store"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 16.56 2.93 11.3 4.7 7.72C5.57 5.94 7.36 4.86 9.28 4.84C10.56 4.82 11.78 5.72 12.58 5.72C13.38 5.72 14.87 4.62 16.42 4.79C17.09 4.82 18.91 5.07 20.07 6.77C19.97 6.83 17.62 8.22 17.65 11.06C17.68 14.45 20.57 15.58 20.6 15.59C20.58 15.65 20.15 17.17 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
          </svg>
          App Store
        </a>
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-full bg-[#2B3442] text-[#FAFAFB] text-sm font-bold hover:opacity-90 transition-opacity"
          aria-label="Download on Google Play"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.53 12.9 20.18 13.18L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" />
          </svg>
          Google Play
        </a>
      </div>
    </BaseGlassCard>
  );
});
