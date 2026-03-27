'use client';

import React from 'react';
import Link from 'next/link';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CardActionButtons } from '../CardActionButtons';
import { useGhostUpdate } from '@/hooks/useGhostUpdate';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface FanChatCardProps {
  card: RiverCard;
}

export const FanChatCard = React.memo(function FanChatCard({ card }: FanChatCardProps) {
  const content = card.content as Record<string, unknown>;
  const roomId = content.room_id as string | undefined;

  // Subscribe to chat_presence keyed by room_id for live user count updates
  const { liveData, isUpdating } = useGhostUpdate(
    roomId ?? card.card_id,
    content,
    'chat_presence'
  );

  const message = liveData.message as string | undefined;
  const userCount = (liveData.user_count as number | undefined) ?? 0;
  const roomTitle = (liveData.room_title as string | undefined) ?? 'Fan Chat';

  return (
    <BaseGlassCard trackingToken={card.tracking_token} accentColor={card.ui_directives.accent}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Green pulsing dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isUpdating ? 'animate-ping' : 'animate-pulse'
              }`}
              style={{ backgroundColor: '#00FF00' }}
            />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: '#00FF00' }} />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#00FF00' }}>
            {CARD_TYPE_LABELS[card.card_type]}
          </span>
        </div>
        <span className="text-xs text-[#E6E8EC]/60">{formatTimestamp(card.timestamp)}</span>
      </div>

      {/* Room title + user count */}
      <h3 className="text-lg font-bold text-[#FAFAFB] mb-1">{roomTitle}</h3>
      <p className="text-sm text-[#E6E8EC]/60 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
        {userCount} {userCount === 1 ? 'fan' : 'fans'} chatting
      </p>

      {/* Avatar stack */}
      <div className="flex items-center mb-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-[#2B3442] border-2 border-[rgba(27,36,48,0.72)] flex items-center justify-center text-[10px] text-[#E6E8EC]/60"
            style={{ marginLeft: i > 0 ? '-8px' : 0 }}
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
        {userCount > 4 && (
          <span className="text-xs text-[#E6E8EC]/40 ml-2">+{userCount - 4}</span>
        )}
      </div>

      {/* Topic summary */}
      {message && (
        <p className="text-sm text-[#E6E8EC] line-clamp-2 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
          {message}
        </p>
      )}

      {/* CTA */}
      <Link
        href={roomId ? `/fan-chat/${roomId}` : '/fan-chat'}
        className="inline-flex items-center justify-center px-4 min-h-[44px] text-sm font-bold text-[#FAFAFB] rounded-lg transition-colors hover:opacity-90"
        style={{ backgroundColor: '#00FF00', color: '#0B0F14' }}
        aria-label="Join this chat room"
      >
        Join Chat &rarr;
      </Link>

      {/* Footer */}
      <CardActionButtons commentsCount={(content.comments_count as number) ?? 0} articleUrl={roomId ? `/fan-chat/${roomId}` : undefined} />
    </BaseGlassCard>
  );
});
