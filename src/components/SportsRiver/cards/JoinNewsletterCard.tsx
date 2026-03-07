'use client';

import React, { useCallback, useState } from 'react';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface JoinNewsletterCardProps {
  card: RiverCard;
}

export const JoinNewsletterCard = React.memo(function JoinNewsletterCard({ card }: JoinNewsletterCardProps) {
  const c = card.content as Record<string, unknown>;
  const headline = (c.headline as string | undefined) ?? 'Get the inside scoop';
  const description = c.description as string | undefined;

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || status === 'loading') return;
      setStatus('loading');
      try {
        const res = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          throw new Error('Subscription failed');
        }
        setStatus('success');
      } catch {
        setStatus('error');
      }
    },
    [email, status]
  );

  return (
    <BaseGlassCard trackingToken={card.tracking_token} accentColor={card.ui_directives.accent}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#00D4FF' }}>
          {CARD_TYPE_LABELS[card.card_type]}
        </span>
        <span className="text-xs text-[#E6E8EC]/60">{formatTimestamp(card.timestamp)}</span>
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-[#FAFAFB] mb-1">{headline}</h3>
      {description && (
        <p className="text-sm text-[#E6E8EC] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
          {description}
        </p>
      )}

      {status === 'success' ? (
        <p className="text-sm font-bold text-[#00D4FF]" style={{ fontFamily: 'Inter, sans-serif' }}>
          &#10003; You&apos;re in! Check your inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 bg-[#121821] border border-[#2B3442] rounded-lg px-4 py-2 text-[#FAFAFB] text-sm min-h-[44px] placeholder:text-[#E6E8EC]/30 focus:outline-none focus:border-[#00D4FF] transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
            aria-label="Email address"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 min-h-[44px] rounded-lg text-sm font-bold text-[#FAFAFB] transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#00D4FF', color: '#0B0F14' }}
            aria-label="Subscribe to newsletter"
          >
            {status === 'loading' ? '...' : 'Subscribe'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="text-xs text-[#BC0000] mt-2">Something went wrong. Try again.</p>
      )}
    </BaseGlassCard>
  );
});
