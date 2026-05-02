'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { TradeDock } from '@/components/gm/TradeDock';
import { RosterSheet } from '@/components/gm/RosterSheet';
import { OpponentSelectorSheet } from '@/components/gm/OpponentSelectorSheet';
import { OpponentRosterSheet } from '@/components/gm/OpponentRosterSheet';
import { DraftPicksSheet } from '@/components/gm/DraftPicksSheet';
import { CapValidation } from '@/components/gm/CapValidation';
import { BarChart } from '@/components/ui/BarChart';
import { useGM } from '@/lib/gm-context';
import { useAuth } from '@/hooks/useAuth';
import { gmApi } from '@/lib/gm-api';
import { TEAMS, type TeamId } from '@/lib/config';
import { CHICAGO_TEAM_SPORT } from '@/lib/gm-types';
import { haptic, notify } from '@/lib/haptics';

const ORDER: TeamId[] = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox'];

export default function GMHub() {
  const router = useRouter();
  const { user } = useAuth();
  const { state, dispatch } = useGM();

  const [showRoster, setShowRoster] = useState(false);
  const [showOpponentSelect, setShowOpponentSelect] = useState(false);
  const [showOpponentRoster, setShowOpponentRoster] = useState(false);
  const [showPicks, setShowPicks] = useState<false | 'sent' | 'received'>(false);
  const [grading, setGrading] = useState(false);

  // Validate trade whenever it changes (debounced).
  useEffect(() => {
    if (!state.chicagoTeam || !state.opponent) return;
    const t = setTimeout(async () => {
      try {
        dispatch({ type: 'SET_VALIDATING', validating: true });
        const result = await gmApi.validateTrade({
          chicago_team: state.chicagoTeam!,
          trade_partner: state.opponent!.team_name,
          partner_team_key: String(state.opponent!.team_key),
          players_sent: state.selectedPlayers,
          players_received: state.selectedOpponentPlayers,
          draft_picks_sent: state.draftPicksSent,
          draft_picks_received: state.draftPicksReceived,
        });
        dispatch({ type: 'SET_VALIDATION', validation: result });
      } catch {
        /* swallow */
      } finally {
        dispatch({ type: 'SET_VALIDATING', validating: false });
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedPlayers, state.selectedOpponentPlayers, state.draftPicksSent, state.draftPicksReceived, state.opponent]);

  const selectedIds = useMemo(
    () => new Set(state.selectedPlayers.map((p) => String(p.player_id))),
    [state.selectedPlayers],
  );
  const oppSelectedIds = useMemo(
    () => new Set(state.selectedOpponentPlayers.map((p) => String(p.player_id))),
    [state.selectedOpponentPlayers],
  );

  const canGrade =
    !!state.chicagoTeam &&
    !!state.opponent &&
    (state.selectedPlayers.length + state.draftPicksSent.length) > 0 &&
    (state.selectedOpponentPlayers.length + state.draftPicksReceived.length) > 0;

  const sentTotal = state.selectedPlayers.reduce((s, p) => s + (p.cap_hit ?? p.base_salary ?? 0), 0);
  const recvTotal = state.selectedOpponentPlayers.reduce((s, p) => s + (p.cap_hit ?? p.base_salary ?? 0), 0);
  const cap = state.chicagoTeam ? CHICAGO_TEAM_SPORT[state.chicagoTeam] === 'nfl' ? 303_450_000 : 154_647_000 : 200_000_000;

  async function grade() {
    if (!user) {
      router.push('/auth');
      return;
    }
    if (!state.chicagoTeam || !state.opponent) return;
    setGrading(true);
    haptic('medium');
    try {
      const r = await gmApi.gradeTrade({
        chicago_team: state.chicagoTeam,
        trade_partner: state.opponent.team_name,
        partner_team_key: String(state.opponent.team_key),
        players_sent: state.selectedPlayers,
        players_received: state.selectedOpponentPlayers,
        draft_picks_sent: state.draftPicksSent,
        draft_picks_received: state.draftPicksReceived,
      });
      dispatch({ type: 'SET_GRADE_RESULT', result: r });
      notify(r.status === 'accepted' ? 'success' : 'warning');
      router.push('/gm/result');
    } catch (e) {
      notify('error');
      console.error('Grade failed', e);
    } finally {
      setGrading(false);
    }
  }

  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <header className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-red font-semibold">Trade Simulator</p>
        <h1 className="text-display font-bold text-white">Build a trade</h1>
      </header>

      {/* Chicago team picker — Chicago franchises always first */}
      <div className="grid grid-cols-5 gap-2 mb-5">
        {ORDER.map((id) => {
          const t = TEAMS[id];
          const active = state.chicagoTeam === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => { haptic('light'); dispatch({ type: 'SET_TEAM', team: id }); }}
              aria-pressed={active}
              className={`flex flex-col items-center gap-1 rounded-2xl py-3 transition-colors ${
                active ? 'bg-brand-red/20 border border-brand-red/60' : 'bg-white/5 border border-transparent'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.logo} alt="" className="h-8 w-8 object-contain" />
              <span className="text-[10px] font-semibold text-white/80">{t.shortName}</span>
            </button>
          );
        })}
      </div>

      <TradeDock
        canGrade={canGrade}
        grading={grading}
        onGrade={grade}
        onTapMine={() => state.chicagoTeam ? setShowRoster(true) : null}
        onTapOpponent={() => {
          if (!state.opponent) setShowOpponentSelect(true);
          else setShowOpponentRoster(true);
        }}
        onTapPicks={() => setShowPicks('sent')}
      />

      {(state.selectedPlayers.length || state.selectedOpponentPlayers.length) > 0 && (
        <LiquidGlassCard className="mt-6">
          <div className="text-xs uppercase tracking-[0.2em] text-white/60 font-semibold mb-3">
            Salary impact
          </div>
          <BarChart
            rows={[
              { label: 'I send', value: sentTotal, team: 'chicago' },
              { label: 'I receive', value: recvTotal, team: 'opponent' },
            ]}
            capLine={cap}
            format={(n) => `$${(n / 1_000_000).toFixed(1)}M`}
          />
        </LiquidGlassCard>
      )}

      {state.validation && (
        <div className="mt-4">
          <CapValidation validation={state.validation} />
        </div>
      )}

      <RosterSheet
        open={showRoster}
        onOpenChange={setShowRoster}
        team={state.chicagoTeam}
        selectedIds={selectedIds}
        onToggle={(p) => { haptic('light'); dispatch({ type: 'TOGGLE_PLAYER', player: p }); }}
      />

      <OpponentSelectorSheet
        open={showOpponentSelect}
        onOpenChange={setShowOpponentSelect}
        sport={state.sport}
        selectedKey={state.opponent ? String(state.opponent.team_key) : null}
        onSelect={(t) => { haptic('light'); dispatch({ type: 'SET_OPPONENT', opponent: t }); setShowOpponentRoster(true); }}
      />

      <OpponentRosterSheet
        open={showOpponentRoster}
        onOpenChange={setShowOpponentRoster}
        opponent={state.opponent}
        selectedIds={oppSelectedIds}
        onToggle={(p) => { haptic('light'); dispatch({ type: 'TOGGLE_OPPONENT_PLAYER', player: p }); }}
      />

      <DraftPicksSheet
        open={showPicks !== false}
        onOpenChange={(v) => setShowPicks(v ? showPicks : false)}
        side={showPicks === 'received' ? 'received' : 'sent'}
        onAdd={(pick) => {
          haptic('light');
          if (showPicks === 'received') {
            dispatch({ type: 'ADD_DRAFT_PICK_RECEIVED', pick });
          } else {
            dispatch({ type: 'ADD_DRAFT_PICK_SENT', pick });
          }
        }}
      />
    </main>
  );
}
