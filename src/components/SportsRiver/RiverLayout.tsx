'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/context/WebSocketProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import ScoutGreeting from './ScoutGreeting';
import ScoutBriefingText from './ScoutBriefingText';
import ScoutRadar from './ScoutRadar';
import ScoutBriefingGrid from './ScoutBriefingGrid';
import FanToolsCard from './FanToolsCard';
import RightRailCard from './RightRailCard';
import type { Role } from '@/lib/roles';

const TEAM_HUBS = [
  {
    key: 'trade-rumors',
    label: 'Trade Rumors',
    href: '/chicago-bears/trade-rumors',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    key: 'draft-tracker',
    label: 'Draft Tracker',
    href: '/mock-draft',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: 'cap-tracker',
    label: 'Cap Tracker',
    href: '/chicago-bears/cap-tracker',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'game-center',
    label: 'Game Center',
    href: '/chicago-bears/game-center',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

interface RiverLayoutProps {
  children: React.ReactNode;
  feedMode: string;
  teamFilter: string;
  onFeedModeChange: (mode: string) => void;
  onTeamFilterChange: (team: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Scout box: icon aligned to middle of greeting + briefing; briefing inline (no box) */
/* ------------------------------------------------------------------ */
function ScoutBox() {
  const [refreshBriefing, setRefreshBriefing] = useState<(() => void) | null>(null);

  return (
    <div
      className="mb-6 rounded-xl overflow-hidden relative"
      style={{
        background: 'var(--sm-card)',
        border: '1px solid var(--sm-border)',
        boxShadow: 'var(--shadow-sm)',
        padding: 'var(--card-padding, 20px)',
      }}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0 scout-head-container">
          <Image
            src="/downloads/scout-v2.png"
            alt="Scout AI"
            width={96}
            height={96}
            unoptimized
            className="scout-head-img"
            style={{ borderRadius: '50%', objectFit: 'cover', width: 96, height: 96 }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <ScoutGreeting showIcon={false} />
          <ScoutBriefingText setRefreshFn={setRefreshBriefing} inline />
        </div>
      </div>

      <div className="flex justify-end mt-4 mb-0 pb-1">
        <button
          type="button"
          onClick={() => refreshBriefing?.()}
          className="text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-90"
          style={{
            color: 'var(--sm-text-meta)',
            padding: '10px 16px',
            background: 'rgba(27, 36, 48, 0.6)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          What&apos;d I Miss?
        </button>
      </div>

      <style>{`
        .scout-head-container { animation: scoutBobble 1.2s ease-out; }
        .scout-head-img { filter: none; }
        @keyframes scoutBobble {
          0% { transform: scale(0.6) rotate(-8deg); opacity: 0; }
          40% { transform: scale(1.08) rotate(3deg); opacity: 1; }
          60% { transform: scale(0.97) rotate(-1deg); }
          80% { transform: scale(1.02) rotate(0.5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>

      <ScoutRadar />
      <ScoutBriefingGrid />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feed section header + offline indicator                            */
/* ------------------------------------------------------------------ */
function FeedSectionHeader() {
  const { connectionState } = useWebSocket();
  const isOffline = connectionState !== 'connected';

  return (
    <div className="flex items-center gap-2 mb-5">
      {isOffline && (
        <span
          title="Showing offline cached data"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#BC0000',
            flexShrink: 0,
          }}
          aria-hidden
        />
      )}
      <h3
        className="text-sm font-semibold uppercase tracking-wider whitespace-nowrap"
        style={{ color: 'var(--sm-text-meta)', fontSize: 'var(--font-size-sm)' }}
      >
        Your Feed
      </h3>
      <div
        className="flex-1 h-px"
        style={{ backgroundColor: 'var(--sm-border)' }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Right Rail                                                         */
/* ------------------------------------------------------------------ */
function RightRail() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetch(`/api/user/role?email=${encodeURIComponent(user.email)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data?.role) setUserRole(data.role) })
        .catch(() => {});
    } else {
      setUserRole(null);
    }
  }, [isAuthenticated, user?.email]);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  return (
    <aside className="left-rail hidden lg:flex shrink-0">
      {/* EDGE Logo */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--sm-card)',
          border: '1px solid var(--sm-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 120,
            textDecoration: 'none',
          }}
        >
          <Image
            src="/downloads/edge-logo.png"
            alt="SM EDGE"
            width={480}
            height={120}
            unoptimized
            style={{ objectFit: 'contain', height: 108, width: 'auto' }}
          />
        </Link>
      </div>

      {/* Team Hubs — glass card */}
      <RightRailCard title="Team Hubs" glass>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {TEAM_HUBS.map((hub) => (
            <Link key={hub.key} href={hub.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ flexShrink: 0 }}>{hub.icon}</span>
              <span>{hub.label}</span>
            </Link>
          ))}
        </div>
      </RightRailCard>

      {/* Fan Tools — glass card */}
      <RightRailCard title="SM 2.0 Fan Tools" glass>
        <FanToolsCard />
      </RightRailCard>

      {/* Bottom: EDGE+, Theme, Login — glass card */}
      <div className="glass-card">
        <Link href="/pricing" className="edge-plus" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', textDecoration: 'none' }}>
          <Image
            src="/downloads/edge-plus.png"
            alt="EDGE+"
            width={140}
            height={36}
            unoptimized
            style={{ objectFit: 'contain', height: 36, width: 'auto' }}
          />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <span className="meta" style={{ margin: 0 }}>Theme</span>
          <div className="theme-toggle-wrapper">
            <ThemeToggle />
          </div>
        </div>

        {/* Profile / Login */}
        <div style={{ position: 'relative', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }} ref={profileRef}>
          {isAuthenticated && user ? (
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '2px solid #FFD700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                {user.avatar ? (
                  <Image src={user.avatar} alt="" width={24} height={24} unoptimized style={{ borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#FAFAFB' }}>
                    {(user.name || user.email)?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#FAFAFB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name || user.email?.split('@')[0]}
                </div>
              </div>
            </button>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
            }}>
              <Link href="/login" style={{ fontSize: 12, color: 'var(--sm-text-muted)', textDecoration: 'none', fontWeight: 500 }}>Log in</Link>
              <span style={{ color: '#556677', fontSize: 10 }}>|</span>
              <Link href="/signup" style={{
                fontSize: 11, fontWeight: 700, color: '#121821',
                backgroundColor: '#00D4FF', borderRadius: 6, padding: '3px 12px',
                textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>Sign Up</Link>
            </div>
          )}

          {/* Profile popup */}
          {profileOpen && isAuthenticated && user && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              marginBottom: 8,
              width: 200,
              borderRadius: 10,
              backgroundColor: 'rgba(12, 12, 18, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              overflow: 'hidden',
              zIndex: 1001,
            }}>
              <div style={{ padding: '8px 0' }}>
                {userRole === 'admin' && (
                  <Link href="/admin" onClick={() => setProfileOpen(false)} style={popupLinkStyle}>
                    Admin Dashboard
                  </Link>
                )}
                {(userRole === 'editor' || userRole === 'author') && (
                  <Link href="/studio" onClick={() => setProfileOpen(false)} style={popupLinkStyle}>
                    Creator Studio
                  </Link>
                )}
                <Link href="/profile" onClick={() => setProfileOpen(false)} style={popupLinkStyle}>
                  My Profile
                </Link>
                <Link href="/my-gm-score" onClick={() => setProfileOpen(false)} style={popupLinkStyle}>
                  My GM Score
                </Link>
                <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.06)', margin: '4px 0' }} />
                <button
                  onClick={() => { setProfileOpen(false); signOut(); }}
                  style={{
                    ...popupLinkStyle,
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

const popupLinkStyle: React.CSSProperties = {
  display: 'block',
  padding: '8px 16px',
  color: '#CCDDEE',
  fontSize: 13,
  textDecoration: 'none',
  fontFamily: 'Barlow, sans-serif',
};

/* ------------------------------------------------------------------ */
/*  Right Utility Rail (320px)                                         */
/* ------------------------------------------------------------------ */
function RightUtilityRail() {
  return (
    <aside
      className="hidden xl:flex flex-col gap-4 shrink-0 sticky top-0 overflow-y-auto border-l border-[var(--sm-border)] pl-4 pr-4 pt-4"
      style={{
        width: 320,
        minWidth: 320,
        maxHeight: '100vh',
        paddingBottom: 16,
        backgroundColor: 'var(--sm-surface)',
      }}
    >
      <RightRailCard title="Live Now" accentColor="#BC0000">
        <p className="text-[14px] leading-relaxed" style={{ color: 'var(--sm-text-secondary)' }}>
          Game times and scores when available. Check team pages for full schedules.
        </p>
      </RightRailCard>
      <RightRailCard title="Quick Links" accentColor="#BC0000">
        <div className="flex flex-col gap-2">
          <Link href="/chicago-bears" className="text-[14px] font-medium hover:underline" style={{ color: 'var(--sm-text)' }}>Bears</Link>
          <Link href="/chicago-bulls" className="text-[14px] font-medium hover:underline" style={{ color: 'var(--sm-text)' }}>Bulls</Link>
          <Link href="/chicago-blackhawks" className="text-[14px] font-medium hover:underline" style={{ color: 'var(--sm-text)' }}>Blackhawks</Link>
          <Link href="/chicago-cubs" className="text-[14px] font-medium hover:underline" style={{ color: 'var(--sm-text)' }}>Cubs</Link>
          <Link href="/chicago-white-sox" className="text-[14px] font-medium hover:underline" style={{ color: 'var(--sm-text)' }}>White Sox</Link>
        </div>
      </RightRailCard>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Layout                                                        */
/* ------------------------------------------------------------------ */
export default function RiverLayout({
  children,
}: RiverLayoutProps) {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--sm-dark)' }}>
      {/* Chicago skyline / stadiums background — dark mode only, light animation */}
      <div className="river-page-bg" aria-hidden="true" />
      <div
        className="mx-auto flex w-full gap-8"
        style={{
          maxWidth: 1680,
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        {/* Left rail — 280px glass cards */}
        <RightRail />

        {/* Main content — wider middle, min width so cards don't get cut off */}
        <main
          className="flex-1 min-w-0 py-6 px-6 lg:px-8"
          style={{
            minWidth: 720,
            borderLeft: '1px solid var(--sm-border)',
          }}
        >
          {/* Scout area: greeting, 24h briefing text, radar, then cards */}
          <ScoutBox />

          {/* Divider + offline indicator */}
          <FeedSectionHeader />

          {children}
        </main>

        {/* Right utility rail — 320px */}
        <RightUtilityRail />
      </div>

      {/* Mobile: fan tools below feed */}
      <div
        className="lg:hidden px-4 pb-8 space-y-4"
        style={{ backgroundColor: 'var(--sm-dark)' }}
      >
        <div className="flex items-center gap-2 mt-4 mb-2">
          <h3
            className="text-sm font-semibold uppercase tracking-wider whitespace-nowrap"
            style={{ color: 'var(--sm-text-meta)', fontSize: 'var(--font-size-sm)' }}
          >
            Fan Tools
          </h3>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--sm-border)' }} />
        </div>
        <FanToolsCard />
      </div>
    </div>
  );
}
