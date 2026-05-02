'use client';

import { ChevronDown, Sparkles } from 'lucide-react';
import { useGM } from '@/lib/gm-context';
import { TradeAssetPill } from './TradeAssetPill';
import { cn } from '@/lib/utils';

export interface TradeDockProps {
  onGrade: () => void;
  onTapMine: () => void;
  onTapOpponent: () => void;
  onTapPicks: () => void;
  canGrade: boolean;
  grading: boolean;
}

export function TradeDock({ onGrade, onTapMine, onTapOpponent, onTapPicks, canGrade, grading }: TradeDockProps) {
  const { state, dispatch } = useGM();

  const sent = [
    ...state.selectedPlayers.map((p) => ({
      primary: p.full_name,
      secondary: p.position,
      value: p.cap_hit ?? p.base_salary ?? undefined,
      imageUrl: p.headshot_url ?? undefined,
      onRemove: () => dispatch({ type: 'TOGGLE_PLAYER', player: p }),
    })),
    ...state.draftPicksSent.map((pk, i) => ({
      primary: `${pk.year} R${pk.round}`,
      secondary: pk.condition ?? '',
      onRemove: () => dispatch({ type: 'REMOVE_DRAFT_PICK_SENT', index: i }),
    })),
  ];

  const received = [
    ...state.selectedOpponentPlayers.map((p) => ({
      primary: p.full_name,
      secondary: p.position,
      value: p.cap_hit ?? p.base_salary ?? undefined,
      imageUrl: p.headshot_url ?? undefined,
      onRemove: () => dispatch({ type: 'TOGGLE_OPPONENT_PLAYER', player: p }),
    })),
    ...state.draftPicksReceived.map((pk, i) => ({
      primary: `${pk.year} R${pk.round}`,
      secondary: pk.condition ?? '',
      onRemove: () => dispatch({ type: 'REMOVE_DRAFT_PICK_RECEIVED', index: i }),
    })),
  ];

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onTapMine}
        className="w-full text-left rounded-2xl liquid-glass-dark p-4 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-brand-red font-semibold">
              I send
            </div>
            <div className="mt-0.5 text-xs text-white/60">
              {state.chicagoTeam ? `From ${state.chicagoTeam}` : 'Pick your team'}
            </div>
          </div>
          <ChevronDown size={16} className="text-white/40" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 min-h-[36px]">
          {sent.length === 0 ? (
            <span className="text-xs text-white/40 italic">tap to add players or picks</span>
          ) : (
            sent.map((a, i) => <TradeAssetPill key={i} side="sent" {...a} />)
          )}
        </div>
      </button>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onTapPicks}
          className="liquid-glass-pill px-3 py-1.5 text-[11px] uppercase tracking-wider text-white/80"
        >
          + Draft picks
        </button>
      </div>

      <button
        type="button"
        onClick={onTapOpponent}
        className="w-full text-left rounded-2xl liquid-glass-dark p-4 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-brand-opponent font-semibold">
              I receive
            </div>
            <div className="mt-0.5 text-xs text-white/60">
              {state.opponent?.team_name ?? 'Pick opponent'}
            </div>
          </div>
          <ChevronDown size={16} className="text-white/40" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 min-h-[36px]">
          {received.length === 0 ? (
            <span className="text-xs text-white/40 italic">tap to add players or picks</span>
          ) : (
            received.map((a, i) => <TradeAssetPill key={i} side="received" {...a} />)
          )}
        </div>
      </button>

      <button
        type="button"
        disabled={!canGrade || grading}
        onClick={onGrade}
        className={cn(
          'w-full rounded-2xl py-4 text-sm font-bold tracking-wide flex items-center justify-center gap-2',
          'transition-colors duration-200',
          canGrade && !grading ? 'bg-brand-red text-white' : 'bg-white/5 text-white/40',
        )}
      >
        <Sparkles size={16} />
        {grading ? 'Grading…' : 'Grade trade'}
      </button>
    </div>
  );
}
