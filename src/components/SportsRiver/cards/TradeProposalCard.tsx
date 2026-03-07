'use client';

import React from 'react';
import Link from 'next/link';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface TradeProposalCardProps {
  card: RiverCard;
}

function scoreColor(score: number): string {
  if (score > 70) return '#22c55e';
  if (score >= 50) return '#eab308';
  return '#ef4444';
}

export const TradeProposalCard = React.memo(function TradeProposalCard({ card }: TradeProposalCardProps) {
  const c = card.content as Record<string, unknown>;
  const submittedBy = c.submitted_by_username as string | undefined;
  const teamAReceives = (c.team_a_receives as Array<{ player_name: string; position: string }>) ?? [];
  const teamBReceives = (c.team_b_receives as Array<{ player_name: string; position: string }>) ?? [];
  const tradeScore = (c.trade_score as number | undefined) ?? 0;
  const aiReasoning = c.ai_reasoning as string | undefined;

  return (
    <BaseGlassCard trackingToken={card.tracking_token} accentColor={card.ui_directives.accent}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D6B05E' }}>
          {CARD_TYPE_LABELS[card.card_type]}
        </span>
        <span className="text-xs text-[#E6E8EC]/60">{formatTimestamp(card.timestamp)}</span>
      </div>

      {/* Split-screen trade */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Team A */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#E6E8EC]/60 mb-2">Team A Receives</h4>
          <ul className="space-y-1">
            {teamAReceives.map((p, i) => (
              <li key={i} className="text-sm text-[#FAFAFB]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {p.player_name} <span className="text-[#E6E8EC]/40 text-xs">{p.position}</span>
              </li>
            ))}
            {teamAReceives.length === 0 && <li className="text-xs text-[#E6E8EC]/40 italic">No players</li>}
          </ul>
        </div>
        {/* Team B */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#E6E8EC]/60 mb-2">Team B Receives</h4>
          <ul className="space-y-1">
            {teamBReceives.map((p, i) => (
              <li key={i} className="text-sm text-[#FAFAFB]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {p.player_name} <span className="text-[#E6E8EC]/40 text-xs">{p.position}</span>
              </li>
            ))}
            {teamBReceives.length === 0 && <li className="text-xs text-[#E6E8EC]/40 italic">No players</li>}
          </ul>
        </div>
      </div>

      {/* Trade score badge */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#0B0F14]"
          style={{ backgroundColor: scoreColor(tradeScore) }}
        >
          {tradeScore}
        </div>
        <span className="text-xs text-[#E6E8EC]/60">Trade Score</span>
      </div>

      {/* AI reasoning */}
      {aiReasoning && (
        <p className="text-sm text-[#E6E8EC]/80 italic mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          {aiReasoning}
        </p>
      )}

      {/* Submitted by */}
      {submittedBy && (
        <p className="text-xs text-[#E6E8EC]/40 mb-2">@{submittedBy}</p>
      )}

      {/* CTA */}
      <Link
        href="/gm"
        className="text-xs font-bold text-[#D6B05E] hover:underline min-h-[44px] inline-flex items-center"
        aria-label="View in Trade Simulator"
      >
        View in Simulator &rarr;
      </Link>

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
