'use client';

import React from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface InfographicCardProps {
  card: RiverCard;
}

const PLACEHOLDER_DATA = [
  { name: 'W1', value: 24 },
  { name: 'W2', value: 31 },
  { name: 'W3', value: 18 },
  { name: 'W4', value: 27 },
  { name: 'W5', value: 35 },
  { name: 'W6', value: 22 },
];

export const InfographicCard = React.memo(function InfographicCard({ card }: InfographicCardProps) {
  const c = card.content as Record<string, unknown>;
  const headline = (c.headline as string | undefined) ?? 'Data Snapshot';
  const description = c.description as string | undefined;
  const ctaUrl = c.cta_url as string | undefined;
  const chartData = (c.chart_data as Array<{ name: string; value: number }>) ?? PLACEHOLDER_DATA;

  return (
    <BaseGlassCard trackingToken={card.tracking_token} accentColor={card.ui_directives.accent}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0891B2' }}>
          {CARD_TYPE_LABELS[card.card_type]}
        </span>
        <span className="text-xs text-[#E6E8EC]/60">{formatTimestamp(card.timestamp)}</span>
      </div>

      {/* Chart title */}
      <h3 className="text-lg font-bold text-[#FAFAFB] mb-1">{headline}</h3>
      {description && (
        <p className="text-sm text-[#E6E8EC]/60 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
          {description}
        </p>
      )}

      {/* Chart */}
      <div className="w-full h-40 mb-3" style={{ background: '#0B0F14', borderRadius: 8, padding: '8px 0' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fill: '#E6E8EC', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#1B2430', border: '1px solid #2B3442', borderRadius: 8, fontSize: 12, color: '#FAFAFB' }}
            />
            <Bar dataKey="value" fill="#0891B2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CTA */}
      {ctaUrl && (
        <Link
          href={ctaUrl}
          className="text-xs font-bold hover:underline min-h-[44px] inline-flex items-center"
          style={{ color: '#0891B2' }}
          aria-label="Explore data"
        >
          Explore Data &rarr;
        </Link>
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
  );
});
