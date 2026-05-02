'use client';

import Link from 'next/link';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';

export default function NotificationsPage() {
  return (
    <main className="px-5 pt-10 pb-32 safe-top">
      <h1 className="text-display font-bold text-white">Notifications</h1>
      <p className="mt-1 text-sm text-white/60">Recent alerts will appear here.</p>

      <Link href="/notification-settings" className="mt-6 inline-block">
        <LiquidGlassCard className="px-4 py-3">
          <div className="text-sm font-semibold text-white">Notification settings →</div>
          <div className="text-xs text-white/60">Frequency, teams, anti-spam sliders.</div>
        </LiquidGlassCard>
      </Link>
    </main>
  );
}
