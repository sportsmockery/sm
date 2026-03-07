'use client';

import React from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CardActionButtons } from '../CardActionButtons';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface ChartCardProps {
  card: RiverCard;
}

const PLACEHOLDER_DATA = [
  { name: 'Jan', value: 65 },
  { name: 'Feb', value: 72 },
  { name: 'Mar', value: 58 },
  { name: 'Apr', value: 80 },
  { name: 'May', value: 74 },
  { name: 'Jun', value: 89 },
];

export const ChartCard = React.memo(function ChartCard({ card }: ChartCardProps) {
  const c = card.content as Record<string, unknown>;
  const title = (c.title as string | undefined) ?? 'Analytics';
  const description = c.description as string | undefined;
  const ctaUrl = c.cta_url as string | undefined;
  const chartData = (c.chart_data as Array<{ name: string; value: number }>) ?? PLACEHOLDER_DATA;

  return (
    <BaseGlassCard trackingToken={card.tracking_token} accentColor={card.ui_directives.accent}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#00D4FF' }}>
          {CARD_TYPE_LABELS[card.card_type]}
        </span>
        <span className="text-xs text-[#E6E8EC]/60">{formatTimestamp(card.timestamp)}</span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-[#FAFAFB] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#E6E8EC]/60 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
          {description}
        </p>
      )}

      {/* Chart */}
      <div className="w-full h-40 mb-3" style={{ background: '#0B0F14', borderRadius: 8, padding: '8px 0' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="name" tick={{ fill: '#E6E8EC', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#1B2430', border: '1px solid #2B3442', borderRadius: 8, fontSize: 12, color: '#FAFAFB' }}
            />
            <Line type="monotone" dataKey="value" stroke="#00D4FF" strokeWidth={2} dot={{ fill: '#00D4FF', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CTA */}
      {ctaUrl && (
        <Link
          href={ctaUrl}
          className="text-xs font-bold text-[#00D4FF] hover:underline min-h-[44px] inline-flex items-center"
          aria-label="Full analysis"
        >
          Full Analysis &rarr;
        </Link>
      )}

      {/* Footer */}
      <CardActionButtons />
    </BaseGlassCard>
  );
});
