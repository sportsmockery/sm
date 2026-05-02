'use client';

import Link from 'next/link';
import { Bell, LogOut, Settings, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-white/60 text-sm">Loading…</div>;
  }

  if (!user) {
    return (
      <main className="px-5 pt-10 pb-32 safe-top">
        <h1 className="text-display font-bold text-white">Profile</h1>
        <p className="mt-2 text-sm text-white/60">
          Sign in to save favorites, post in chat, and play GM.
        </p>
        <Link
          href="/auth"
          className="mt-6 inline-block rounded-xl bg-brand-red text-white font-semibold px-6 py-3 text-sm"
        >
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="px-5 pt-10 pb-32 safe-top space-y-4">
      <header>
        <h1 className="text-display font-bold text-white">{user.email}</h1>
        <p className="mt-1 text-sm text-white/60">Welcome back.</p>
      </header>

      <Link href="/notification-settings">
        <LiquidGlassCard className="flex items-center gap-3">
          <Bell size={18} className="text-brand-red" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">Notifications</div>
            <div className="text-xs text-white/60">Frequency, teams, anti-spam.</div>
          </div>
        </LiquidGlassCard>
      </Link>

      <Link href="/teams">
        <LiquidGlassCard className="flex items-center gap-3">
          <Star size={18} className="text-brand-red" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">Favorite teams</div>
            <div className="text-xs text-white/60">Tune your feed and alerts.</div>
          </div>
        </LiquidGlassCard>
      </Link>

      <Link href="/leaderboards">
        <LiquidGlassCard className="flex items-center gap-3">
          <Settings size={18} className="text-brand-red" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">Leaderboards</div>
            <div className="text-xs text-white/60">GM scores, draft history.</div>
          </div>
        </LiquidGlassCard>
      </Link>

      <button
        type="button"
        onClick={signOut}
        className="w-full rounded-xl bg-white/5 text-white py-3 text-sm font-semibold flex items-center justify-center gap-2"
      >
        <LogOut size={14} /> Sign out
      </button>
    </main>
  );
}
