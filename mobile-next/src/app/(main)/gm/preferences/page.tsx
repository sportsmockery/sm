'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { gmApi } from '@/lib/gm-api';
import type { UserPreferences } from '@/lib/gm-types';

export default function GMPreferences() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    gmApi.getPreferences()
      .then((r) => { if (!cancelled) setPrefs(r.preferences); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  async function update<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    if (!prefs) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setSaving(true);
    try {
      await gmApi.updatePreferences({ [key]: value } as Partial<UserPreferences>);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <header className="mb-5">
        <Link href="/gm" className="text-xs text-white/60">← Back to GM</Link>
        <h1 className="mt-1 text-display font-bold text-white">GM preferences</h1>
        {saving && <p className="text-[11px] text-white/40 mt-1">Saving…</p>}
      </header>

      {!prefs ? (
        <p className="text-sm text-white/60">Loading…</p>
      ) : (
        <div className="space-y-4">
          <LiquidGlassCard>
            <div className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-2">
              Risk tolerance
            </div>
            <SegmentedControl
              value={prefs.risk_tolerance}
              options={[
                { value: 'conservative', label: 'Safe' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'aggressive', label: 'Bold' },
              ]}
              onChange={(v) => update('risk_tolerance', v)}
            />
          </LiquidGlassCard>

          <LiquidGlassCard>
            <div className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-2">
              Team phase
            </div>
            <SegmentedControl
              value={prefs.team_phase}
              options={[
                { value: 'rebuilding', label: 'Rebuild' },
                { value: 'contending', label: 'Contend' },
                { value: 'win_now', label: 'Win now' },
                { value: 'auto', label: 'Auto' },
              ]}
              onChange={(v) => update('team_phase', v)}
            />
          </LiquidGlassCard>

          <LiquidGlassCard>
            <div className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-2">
              Trade style
            </div>
            <SegmentedControl
              value={prefs.preferred_trade_style}
              options={[
                { value: 'balanced', label: 'Balanced' },
                { value: 'star_hunting', label: 'Stars' },
                { value: 'depth_building', label: 'Depth' },
                { value: 'draft_focused', label: 'Picks' },
              ]}
              onChange={(v) => update('preferred_trade_style', v)}
            />
          </LiquidGlassCard>

          <LiquidGlassCard>
            <div className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-2">
              Cap flexibility
            </div>
            <SegmentedControl
              value={prefs.cap_flexibility_priority}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Med' },
                { value: 'high', label: 'High' },
              ]}
              onChange={(v) => update('cap_flexibility_priority', v)}
            />
          </LiquidGlassCard>

          <LiquidGlassCard>
            <div className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-2">
              Age preference
            </div>
            <SegmentedControl
              value={prefs.age_preference}
              options={[
                { value: 'young', label: 'Young' },
                { value: 'prime', label: 'Prime' },
                { value: 'veteran', label: 'Vet' },
                { value: 'any', label: 'Any' },
              ]}
              onChange={(v) => update('age_preference', v)}
            />
          </LiquidGlassCard>
        </div>
      )}
    </main>
  );
}
