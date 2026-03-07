'use client';

import React from 'react';
import Link from 'next/link';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CardActionButtons } from '../CardActionButtons';
import { useGhostUpdate } from '@/hooks/useGhostUpdate';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface BoxScoreCardProps {
  card: RiverCard;
}

export const BoxScoreCard = React.memo(function BoxScoreCard({ card }: BoxScoreCardProps) {
  const { liveData, isUpdating } = useGhostUpdate(
    card.card_id,
    card.content as Record<string, unknown>,
    'sm_box_scores'
  );

  const homeTeam = liveData.home_team_abbr as string | undefined;
  const awayTeam = liveData.away_team_abbr as string | undefined;
  const homeScore = (liveData.home_score as number | undefined) ?? 0;
  const awayScore = (liveData.away_score as number | undefined) ?? 0;
  const gameStatus = (liveData.game_status as string | undefined) ?? 'scheduled';
  const quarterScores = (liveData.quarter_scores as Array<{ q: number; home: number; away: number }>) ?? [];
  const topPerformers = (liveData.top_performers as Array<{ name: string; stat_line: string; team: string }>) ?? [];
  const gameNarrative = liveData.game_narrative as string | undefined;
  const targetUrl = liveData.target_url as string | undefined;

  const isLive = gameStatus === 'live';

  return (
    <BaseGlassCard trackingToken={card.tracking_token} accentColor={card.ui_directives.accent}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#BC0000' }}>
          {CARD_TYPE_LABELS[card.card_type]}
        </span>
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BC0000] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#BC0000]" />
              </span>
              <span className="text-[10px] font-bold text-[#BC0000] uppercase">LIVE</span>
            </span>
          ) : (
            <span className="text-xs font-bold text-[#E6E8EC]/60 uppercase">{gameStatus}</span>
          )}
          <span className="text-xs text-[#E6E8EC]/60">{formatTimestamp(card.timestamp)}</span>
        </div>
      </div>

      {/* Scores */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <div className="text-center">
          <p className="text-sm font-bold text-[#FAFAFB] mb-1">{awayTeam ?? 'AWAY'}</p>
          <p
            className={`text-4xl font-bold text-[#FAFAFB] transition-all duration-300 ${
              isUpdating ? 'text-[#BC0000] scale-110' : ''
            }`}
            style={isUpdating ? { filter: 'drop-shadow(0 0 15px rgba(188,0,0,0.8))' } : undefined}
          >
            {awayScore}
          </p>
        </div>
        <span className="text-lg text-[#E6E8EC]/40 font-bold">vs</span>
        <div className="text-center">
          <p className="text-sm font-bold text-[#FAFAFB] mb-1">{homeTeam ?? 'HOME'}</p>
          <p
            className={`text-4xl font-bold text-[#FAFAFB] transition-all duration-300 ${
              isUpdating ? 'text-[#BC0000] scale-110' : ''
            }`}
            style={isUpdating ? { filter: 'drop-shadow(0 0 15px rgba(188,0,0,0.8))' } : undefined}
          >
            {homeScore}
          </p>
        </div>
      </div>

      {/* Quarter scores grid */}
      {quarterScores.length > 0 && (
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-xs text-center text-[#E6E8EC]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
            <thead>
              <tr>
                <th className="pb-1" />
                {quarterScores.map((qs) => (
                  <th key={qs.q} className="pb-1 font-bold">Q{qs.q}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pr-2 text-left font-bold text-[#FAFAFB]">{awayTeam}</td>
                {quarterScores.map((qs) => (
                  <td key={qs.q}>{qs.away}</td>
                ))}
              </tr>
              <tr>
                <td className="pr-2 text-left font-bold text-[#FAFAFB]">{homeTeam}</td>
                {quarterScores.map((qs) => (
                  <td key={qs.q}>{qs.home}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Top performers */}
      {topPerformers.length > 0 && (
        <div className="space-y-1 mb-3">
          {topPerformers.slice(0, 3).map((p, i) => (
            <p key={i} className="text-xs text-[#E6E8EC]" style={{ fontFamily: 'Inter, sans-serif' }}>
              <span className="font-bold text-[#FAFAFB]">{p.name}</span>{' '}
              <span className="text-[#E6E8EC]/60">{p.stat_line}</span>
            </p>
          ))}
        </div>
      )}

      {/* Game narrative */}
      {gameNarrative && (
        <p className="text-sm text-[#E6E8EC]/80 italic mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          {gameNarrative}
        </p>
      )}

      {/* CTA */}
      {targetUrl && (
        <Link
          href={targetUrl}
          className="text-xs font-bold text-[#BC0000] hover:underline min-h-[44px] inline-flex items-center"
          aria-label="Full box score"
        >
          Full Box Score &rarr;
        </Link>
      )}

      {/* Footer */}
      <CardActionButtons />
    </BaseGlassCard>
  );
});
