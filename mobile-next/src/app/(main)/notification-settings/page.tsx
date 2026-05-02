'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Toggle } from '@/components/ui/Toggle';
import { Slider } from '@/components/ui/Slider';
import { Storage } from '@/lib/storage';
import { setPushTags } from '@/lib/push';
import { TEAMS, type TeamId } from '@/lib/config';
import { haptic, selection } from '@/lib/haptics';
import { cn } from '@/lib/utils';

type Frequency = 'off' | 'low' | 'normal' | 'high';

interface AlertSettings {
  frequency: Frequency;
  teams: Record<TeamId, boolean>;
  events: {
    breaking_news: boolean;
    game_start: boolean;
    score_update: boolean;
    lead_change: boolean;
    final_score: boolean;
  };
  anti_spam: {
    max_alerts_per_day: number;
    min_gap_minutes: number;
    spoiler_delay_minutes: number;
  };
}

const DEFAULTS: AlertSettings = {
  frequency: 'normal',
  teams: { bears: true, bulls: false, blackhawks: false, cubs: false, whitesox: false },
  events: {
    breaking_news: true,
    game_start: true,
    score_update: false,
    lead_change: false,
    final_score: true,
  },
  anti_spam: {
    max_alerts_per_day: 12,
    min_gap_minutes: 10,
    spoiler_delay_minutes: 0,
  },
};

const STORAGE_KEY = 'sm.notification-settings';
const TEAM_ORDER: TeamId[] = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox'];

export default function NotificationSettings() {
  const [s, setS] = useState<AlertSettings | null>(null);

  useEffect(() => {
    Storage.getJSON<AlertSettings>(STORAGE_KEY).then((stored) => setS(stored ?? DEFAULTS));
  }, []);

  function update(next: AlertSettings) {
    setS(next);
    Storage.setJSON(STORAGE_KEY, next);

    // Mirror toggles into OneSignal tags so the server-side alert engine can
    // filter by tag.
    setPushTags({
      notifications_enabled: next.frequency === 'off' ? 'false' : 'true',
      frequency: next.frequency,
      ...Object.fromEntries(
        TEAM_ORDER.map((t) => [`follows_${t}`, next.teams[t] ? 'true' : 'false']),
      ),
      breaking_news: next.events.breaking_news ? 'true' : 'false',
      game_alerts:
        next.events.game_start || next.events.score_update || next.events.lead_change || next.events.final_score
          ? 'true'
          : 'false',
    });
  }

  if (!s) {
    return <div className="p-8 text-white/60 text-sm">Loading…</div>;
  }

  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <header className="mb-5">
        <Link href="/profile" className="text-xs text-white/60">← Back</Link>
        <h1 className="mt-1 text-display font-bold text-white">Notifications</h1>
        <p className="mt-1 text-sm text-white/60">
          Tune alerts, mute teams, throttle the noise.
        </p>
      </header>

      <section className="space-y-4">
        <LiquidGlassCard>
          <div className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-2">
            Frequency
          </div>
          <SegmentedControl
            value={s.frequency}
            options={[
              { value: 'off', label: 'Off' },
              { value: 'low', label: 'Low' },
              { value: 'normal', label: 'Normal' },
              { value: 'high', label: 'High' },
            ]}
            onChange={(v) => { selection(); update({ ...s, frequency: v }); }}
          />
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-3">
            Teams
          </div>
          <div className="grid grid-cols-5 gap-2">
            {TEAM_ORDER.map((id) => {
              const t = TEAMS[id];
              const on = !!s.teams[id];
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    haptic('light');
                    update({ ...s, teams: { ...s.teams, [id]: !on } });
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-2xl py-3 transition-colors',
                    on ? 'bg-brand-red/20 border border-brand-red/60' : 'bg-white/5 border border-transparent opacity-60',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.logo} alt="" className="h-7 w-7 object-contain" />
                  <span className="text-[10px] font-semibold text-white/85">{t.shortName}</span>
                </button>
              );
            })}
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard padded={false} className="space-y-2 p-2">
          <Toggle
            checked={s.events.breaking_news}
            onChange={(v) => update({ ...s, events: { ...s.events, breaking_news: v } })}
            label="Breaking news"
            description="Trades, signings, lineup news."
          />
          <Toggle
            checked={s.events.game_start}
            onChange={(v) => update({ ...s, events: { ...s.events, game_start: v } })}
            label="Game start"
            description="When my team tips off."
          />
          <Toggle
            checked={s.events.score_update}
            onChange={(v) => update({ ...s, events: { ...s.events, score_update: v } })}
            label="Score updates"
            description="Periodic game-state pings."
          />
          <Toggle
            checked={s.events.lead_change}
            onChange={(v) => update({ ...s, events: { ...s.events, lead_change: v } })}
            label="Lead changes"
            description="Whenever the score flips."
          />
          <Toggle
            checked={s.events.final_score}
            onChange={(v) => update({ ...s, events: { ...s.events, final_score: v } })}
            label="Final score"
            description="At the end of every game."
          />
        </LiquidGlassCard>

        <LiquidGlassCard className="space-y-5">
          <div className="text-xs uppercase tracking-wider text-white/60 font-semibold">
            Anti-spam
          </div>
          <Slider
            label="Max alerts / day"
            min={1}
            max={50}
            value={s.anti_spam.max_alerts_per_day}
            onChange={(v) => update({ ...s, anti_spam: { ...s.anti_spam, max_alerts_per_day: v } })}
            format={(n) => `${n}`}
          />
          <Slider
            label="Min gap between alerts"
            min={0}
            max={60}
            step={5}
            value={s.anti_spam.min_gap_minutes}
            onChange={(v) => update({ ...s, anti_spam: { ...s.anti_spam, min_gap_minutes: v } })}
            format={(n) => `${n} min`}
          />
          <Slider
            label="Spoiler delay (after final)"
            min={0}
            max={120}
            step={5}
            value={s.anti_spam.spoiler_delay_minutes}
            onChange={(v) => update({ ...s, anti_spam: { ...s.anti_spam, spoiler_delay_minutes: v } })}
            format={(n) => (n === 0 ? 'Off' : `${n} min`)}
          />
        </LiquidGlassCard>
      </section>
    </main>
  );
}
