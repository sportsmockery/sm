'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import ScoutGreeting from './ScoutGreeting';
import ScoutBriefingGrid from './ScoutBriefingGrid';
import FanToolsCard from './FanToolsCard';
import type { Role } from '@/lib/roles';

const FEED_MODES = [
  { key: 'for_you', label: 'For You' },
  { key: 'live', label: 'Live' },
  { key: 'trending', label: 'Trending' },
  { key: 'scout', label: 'Scout' },
  { key: 'community', label: 'Community' },
  { key: 'watch', label: 'Watch' },
  { key: 'listen', label: 'Listen' },
  { key: 'data', label: 'Data' },
];

const TEAM_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'bears', label: 'Bears' },
  { key: 'cubs', label: 'Cubs' },
  { key: 'bulls', label: 'Bulls' },
  { key: 'blackhawks', label: 'Blackhawks' },
  { key: 'white-sox', label: 'White Sox' },
];

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
/*  Floating Left Sidebar                                              */
/* ------------------------------------------------------------------ */
function FloatingLeftSidebar() {
  const pathname = usePathname();
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  if (pathname?.startsWith('/home') || pathname === '/chicago-bears1' || pathname?.startsWith('/admin')) return null;

  return (
    <aside
      className="floating-left-sidebar hidden md:flex flex-col"
      style={{
        position: 'fixed',
        top: 80,
        left: 16,
        bottom: 16,
        width: 220,
        borderRadius: 16,
        background: 'rgba(12, 12, 18, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        zIndex: 900,
        overflow: 'hidden',
        fontFamily: 'Barlow, sans-serif',
      }}
    >
      {/* EDGE Logo */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 52,
          textDecoration: 'none',
          flexShrink: 0,
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <Image
          src="/downloads/edge-logo.png"
          alt="EDGE"
          width={100}
          height={28}
          unoptimized
          style={{ objectFit: 'contain', height: 24, width: 'auto' }}
        />
      </Link>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 0' }}>
        {/* Team Hubs */}
        <div style={{ padding: '0 14px' }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#BC0000',
            marginBottom: 8,
          }}>
            Team Hubs
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {TEAM_HUBS.map((hub) => (
              <Link
                key={hub.key}
                href={hub.href}
                className="sidebar-hub-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 8px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: '#CCDDEE',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <span style={{ color: '#8899AA', flexShrink: 0 }}>{hub.icon}</span>
                <span>{hub.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.06)', margin: '12px 14px' }} />

        {/* Fan Tools */}
        <div style={{ padding: '0 14px' }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#BC0000',
            marginBottom: 8,
          }}>
            Fan Tools
          </div>
          <FanToolsCard />
        </div>
      </div>

      {/* Bottom section: EDGE+, Theme Toggle, Profile */}
      <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        {/* EDGE+ / SM+ Premium */}
        <Link
          href="/pricing"
          className="sidebar-hub-link"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            textDecoration: 'none',
            color: '#FFD700',
            fontSize: 13,
            fontWeight: 600,
            transition: 'background 0.15s',
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span>EDGE+</span>
        </Link>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.06)', margin: '0 14px' }} />

        {/* Theme Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
        }}>
          <span style={{ fontSize: 12, color: '#8899AA', fontWeight: 500 }}>Theme</span>
          <ThemeToggle />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.06)', margin: '0 14px' }} />

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
                padding: '10px 14px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
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
                <div style={{ fontSize: 10, color: '#556677', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>
            </button>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
            }}>
              <Link href="/login" style={{ fontSize: 12, color: '#8899AA', textDecoration: 'none', fontWeight: 500 }}>Log in</Link>
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
              left: 8,
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
        .sidebar-hub-link:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          color: #FAFAFB !important;
        }
        .floating-left-sidebar::-webkit-scrollbar { width: 0; }
        @media (max-width: 768px) {
          .floating-left-sidebar { display: none !important; }
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
/*  Main Layout                                                        */
/* ------------------------------------------------------------------ */
export default function RiverLayout({
  children,
  feedMode,
  teamFilter,
  onFeedModeChange,
  onTeamFilterChange,
}: RiverLayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-dark)' }}>
      {/* Floating Left Sidebar — desktop only */}
      <FloatingLeftSidebar />

      {/* Mobile: horizontal scrollable filter strip */}
      <div className="md:hidden">
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
          {FEED_MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => onFeedModeChange(m.key)}
              className="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
              style={
                feedMode === m.key
                  ? { backgroundColor: '#BC0000', color: '#fff' }
                  : { backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)', border: '1px solid var(--sm-border)' }
              }
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {TEAM_FILTERS.map((t) => (
            <button
              key={t.key}
              onClick={() => onTeamFilterChange(t.key)}
              className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={
                teamFilter === t.key
                  ? { backgroundColor: 'rgba(0,212,255,0.12)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.3)' }
                  : { backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text)', border: '1px solid var(--sm-border)' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Center content — offset for floating sidebar on desktop */}
      <div className="flex justify-center md:pl-[252px]">
        <main className="w-full max-w-[720px] px-4 py-4">
          {/* Hero zone: greeting + Scout briefing */}
          <div className="mb-6">
            <ScoutGreeting />
            <ScoutBriefingGrid />
          </div>

          {/* Divider between briefing and feed */}
          <div className="flex items-center gap-2 mb-5">
            <h3
              className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
              style={{ color: 'var(--sm-text-dim)' }}
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
      </div>

      {/* Mobile: fan tools below feed */}
      <div
        className="md:hidden px-4 pb-8 space-y-4"
        style={{ backgroundColor: 'var(--sm-dark)' }}
      >
        <div className="flex items-center gap-2 mt-4 mb-2">
          <h3
            className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
            style={{ color: 'var(--sm-text-dim)' }}
          >
            Fan Tools
          </h3>
          <div
            className="flex-1 h-px"
            style={{ backgroundColor: 'var(--sm-border)' }}
          />
        </div>
        <FanToolsCard />
      </div>
    </div>
  );
}
