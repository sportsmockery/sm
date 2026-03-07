'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import ScoutGreeting from './ScoutGreeting';
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
    <aside
      className="hidden lg:flex flex-col gap-4 shrink-0 sticky top-0 overflow-y-auto border-r border-[var(--sm-border)] pl-4 pr-3 pt-6"
      style={{
        width: 240,
        minWidth: 240,
        maxHeight: '100vh',
        paddingBottom: 16,
        backgroundColor: 'var(--sm-surface)',
      }}
    >
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
            height: 56,
            textDecoration: 'none',
          }}
        >
          <Image
            src="/downloads/edge-logo.png"
            alt="SM EDGE"
            width={160}
            height={40}
            unoptimized
            style={{ objectFit: 'contain', height: 36, width: 'auto' }}
          />
        </Link>
      </div>

      {/* Team Hubs */}
      <RightRailCard title="Team Hubs" accentColor="#BC0000">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TEAM_HUBS.map((hub) => (
            <Link
              key={hub.key}
              href={hub.href}
              className="rail-hub-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 8px',
                borderRadius: 8,
                textDecoration: 'none',
                color: 'var(--sm-text)',
                fontSize: 15,
                fontWeight: 500,
                transition: 'background 0.15s',
              }}
            >
              <span style={{ color: 'var(--sm-text-muted)', flexShrink: 0 }}>{hub.icon}</span>
              <span>{hub.label}</span>
            </Link>
          ))}
        </div>
      </RightRailCard>

      {/* Fan Tools */}
      <RightRailCard title="SM 2.0 Fan Tools" accentColor="#BC0000">
        <FanToolsCard />
      </RightRailCard>

      {/* Bottom: EDGE+, Theme, Login */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--sm-card)',
          border: '1px solid var(--sm-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* EDGE+ */}
        <Link
          href="/pricing"
          className="rail-hub-link"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            textDecoration: 'none',
            color: '#FFD700',
            fontSize: 13,
            fontWeight: 600,
            transition: 'background 0.15s',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span>EDGE+</span>
        </Link>

        {/* Theme toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--sm-text-muted)', fontWeight: 500 }}>Theme</span>
          <ThemeToggle />
        </div>

        {/* Profile / Login */}
        <div style={{ position: 'relative' }} ref={profileRef}>
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

      <style>{`
        .rail-hub-link:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-dark)' }}>
      <div
        className="mx-auto flex w-full"
        style={{
          maxWidth: 1440,
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        {/* Left rail — 240px */}
        <RightRail />

        {/* Main content — minmax(0, 1fr) */}
        <main
          className="flex-1 min-w-0 py-6 px-6 lg:px-8"
          style={{
            borderLeft: '1px solid var(--sm-border)',
          }}
        >
          {/* Scout area: greeting, radar, briefing cards */}
          <div
            className="mb-6 rounded-xl overflow-hidden"
            style={{
              background: 'var(--sm-card)',
              border: '1px solid var(--sm-border)',
              boxShadow: 'var(--shadow-sm)',
              padding: 'var(--card-padding, 20px)',
            }}
          >
            <ScoutGreeting />
            <ScoutRadar />
            <ScoutBriefingGrid />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2 mb-5">
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
